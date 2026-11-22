"""End-to-end Document Ingestion & Background Processing Pipeline."""

import os
import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.rag.chunker import DocumentChunker
from app.ai.rag.embeddings import get_embedding_provider
from app.ai.rag.extractors import get_extractor_for_format
from app.ai.rag.validators import (
    calculate_checksum,
    detect_file_type_and_validate,
    sanitize_filename,
)
from app.ai.rag.vector_store import VectorPoint, vector_store_service
from app.core.config import settings
from app.core.logging import get_logger
from app.db.session import async_session_factory
from app.models.knowledge import (
    DocumentChunk,
    DocumentProcessingJob,
    DocumentVersion,
    KnowledgeDocument,
)

logger = get_logger("document_pipeline")


class DocumentIngestionPipeline:
    """Orchestrates document validation, storage, background extraction, chunking, and indexing."""

    def __init__(self):
        self.chunker = DocumentChunker(
            chunk_size=settings.RAG_CHUNK_SIZE,
            chunk_overlap=settings.RAG_CHUNK_OVERLAP,
        )
        self.embedding_provider = get_embedding_provider()
        self.vector_store = vector_store_service

    async def ingest_document_file(
        self,
        db: AsyncSession,
        tenant_id: uuid.UUID,
        filename: str,
        content: bytes,
        branch_id: Optional[uuid.UUID] = None,
        title: Optional[str] = None,
    ) -> KnowledgeDocument:
        """
        Validates uploaded file, stores raw content on disk, registers DB records,
        and creates a QUEUED processing job.
        """
        # 1. Sanitize & Validate
        safe_filename = sanitize_filename(filename)
        file_format, mime_type = detect_file_type_and_validate(safe_filename, content)
        checksum = calculate_checksum(content)

        # 2. Check for duplicate within the tenant
        existing = await db.execute(
            select(KnowledgeDocument).where(
                KnowledgeDocument.tenant_id == tenant_id,
                KnowledgeDocument.file_checksum == checksum,
                KnowledgeDocument.status != "DELETED",
            )
        )
        existing_doc = existing.scalar_one_or_none()
        if existing_doc:
            logger.info("Found existing document with identical checksum: %s", existing_doc.id)
            return existing_doc

        # 3. Save physical file to storage directory
        doc_id = uuid.uuid4()
        storage_dir = os.path.join(settings.UPLOAD_STORAGE_DIR, str(tenant_id))
        os.makedirs(storage_dir, exist_ok=True)
        storage_path = os.path.join(storage_dir, f"{doc_id}_{safe_filename}")

        with open(storage_path, "wb") as f:
            f.write(content)

        # 4. Create Document and Version records
        doc = KnowledgeDocument(
            id=doc_id,
            tenant_id=tenant_id,
            branch_id=branch_id,
            title=title or safe_filename,
            filename=safe_filename,
            file_type=file_format,
            mime_type=mime_type,
            file_size_bytes=len(content),
            file_checksum=checksum,
            storage_path=storage_path,
            status="QUEUED",
            is_active=True,
            embedding_model=self.embedding_provider.get_model_identifier(),
            doc_metadata={},
        )
        db.add(doc)

        version = DocumentVersion(
            document_id=doc_id,
            tenant_id=tenant_id,
            version_number=1,
            file_checksum=checksum,
            storage_path=storage_path,
            change_summary="Initial upload",
        )
        db.add(version)

        # 5. Create Ingestion Job
        job = DocumentProcessingJob(
            document_id=doc_id,
            tenant_id=tenant_id,
            job_type="INGEST",
            status="QUEUED",
            progress_percent=0,
            attempts=0,
            max_attempts=3,
        )
        db.add(job)

        await db.commit()
        await db.refresh(doc)
        return doc

    async def process_document_job(self, document_id: uuid.UUID, tenant_id: uuid.UUID) -> bool:
        """
        Background worker task executing:
        EXTRACT -> CHUNK -> GENERATE EMBEDDINGS -> INDEX IN QDRANT -> UPDATE STATUS
        """
        async with async_session_factory() as db:
            # 1. Fetch document and pending job
            doc_query = await db.execute(
                select(KnowledgeDocument).where(
                    KnowledgeDocument.id == document_id,
                    KnowledgeDocument.tenant_id == tenant_id,
                )
            )
            doc = doc_query.scalar_one_or_none()
            if not doc:
                logger.error("Pipeline worker: Document %s not found", document_id)
                return False

            job_query = await db.execute(
                select(DocumentProcessingJob)
                .where(
                    DocumentProcessingJob.document_id == document_id,
                    DocumentProcessingJob.tenant_id == tenant_id,
                )
                .order_by(DocumentProcessingJob.created_at.desc())
            )
            job = job_query.scalars().first()

            now = datetime.now(timezone.utc)
            if job:
                job.status = "PROCESSING"
                job.started_at = now
                job.attempts += 1
                job.progress_percent = 10

            doc.status = "PROCESSING"
            doc.error_message = None
            await db.commit()

            try:
                # 2. Read physical file content
                if not os.path.exists(doc.storage_path):
                    raise FileNotFoundError(f"Storage file missing at {doc.storage_path}")

                with open(doc.storage_path, "rb") as f:
                    file_bytes = f.read()

                # 3. Extract text
                extractor = get_extractor_for_format(doc.file_type)
                extraction = extractor.extract(file_bytes, doc.filename)

                if job:
                    job.progress_percent = 35
                await db.commit()

                # Update metadata if scanned images were detected
                if extraction.scanned_image_detected:
                    meta = dict(doc.doc_metadata)
                    meta["scanned_image_detected"] = True
                    doc.doc_metadata = meta

                # 4. Chunk text
                chunks = self.chunker.chunk_pages(extraction.pages, document_title=doc.title)
                if not chunks:
                    logger.warning("No extractable chunks found for document %s", doc.id)

                if job:
                    job.progress_percent = 55
                await db.commit()

                # 5. Generate Embeddings & Index into Qdrant
                await self.vector_store.ensure_collection(dimension=self.embedding_provider.get_dimension())

                vector_points: List[VectorPoint] = []
                chunk_records: List[DocumentChunk] = []

                if chunks:
                    chunk_texts = [c.content for c in chunks]
                    embeddings = await self.embedding_provider.embed_documents(chunk_texts)

                    if job:
                        job.progress_percent = 75
                    await db.commit()

                    # Clean any existing chunks for reprocessing idempotency
                    await db.execute(delete(DocumentChunk).where(DocumentChunk.document_id == doc.id))
                    await self.vector_store.delete_document_vectors(
                        tenant_id=str(tenant_id), document_id=str(doc.id)
                    )

                    for chunk_item, emb in zip(chunks, embeddings):
                        chunk_id = uuid.uuid4()
                        point_id = str(uuid.uuid4())

                        payload = {
                            "tenant_id": str(tenant_id),
                            "branch_id": str(doc.branch_id) if doc.branch_id else None,
                            "document_id": str(doc.id),
                            "document_title": doc.title,
                            "filename": doc.filename,
                            "chunk_id": str(chunk_id),
                            "chunk_index": chunk_item.chunk_index,
                            "content": chunk_item.content,
                            "page_number": chunk_item.page_number,
                            "section_title": chunk_item.section_title,
                            "status": "INDEXED",
                        }

                        vector_points.append(
                            VectorPoint(
                                id=point_id,
                                vector=emb,
                                payload=payload,
                            )
                        )

                        chunk_records.append(
                            DocumentChunk(
                                id=chunk_id,
                                tenant_id=tenant_id,
                                branch_id=doc.branch_id,
                                document_id=doc.id,
                                chunk_index=chunk_item.chunk_index,
                                content=chunk_item.content,
                                token_count=chunk_item.token_count,
                                page_number=chunk_item.page_number,
                                section_title=chunk_item.section_title,
                                vector_point_id=point_id,
                                chunk_metadata=chunk_item.metadata,
                            )
                        )

                    # Bulk insert chunk records in DB
                    db.add_all(chunk_records)

                    # Bulk upsert points in vector store
                    await self.vector_store.upsert_chunks(vector_points)

                # 6. Finalize success state
                doc.status = "INDEXED"
                doc.is_active = True
                doc.total_pages = len(extraction.pages)
                doc.total_chunks = len(chunks)
                doc.error_message = None

                if job:
                    job.status = "COMPLETED"
                    job.progress_percent = 100
                    job.completed_at = datetime.now(timezone.utc)

                await db.commit()
                logger.info("Successfully indexed document %s (%d chunks)", doc.id, len(chunks))
                return True

            except Exception as exc:
                logger.exception("Failed processing document %s: %s", doc.id, exc)
                doc.status = "FAILED"
                doc.error_message = str(exc)

                if job:
                    job.status = "FAILED"
                    job.error_message = str(exc)
                    job.completed_at = datetime.now(timezone.utc)

                await db.commit()
                return False

    async def reprocess_document(self, db: AsyncSession, document_id: uuid.UUID, tenant_id: uuid.UUID) -> DocumentProcessingJob:
        """Schedules a reprocess job for an existing document."""
        job = DocumentProcessingJob(
            document_id=document_id,
            tenant_id=tenant_id,
            job_type="REPROCESS",
            status="QUEUED",
            progress_percent=0,
            attempts=0,
            max_attempts=3,
        )
        db.add(job)
        await db.commit()
        await db.refresh(job)
        return job

    async def set_document_active_status(
        self, db: AsyncSession, document_id: uuid.UUID, tenant_id: uuid.UUID, is_active: bool
    ) -> Optional[KnowledgeDocument]:
        """Toggles document active state in DB and updates vector status in Qdrant."""
        result = await db.execute(
            select(KnowledgeDocument).where(
                KnowledgeDocument.id == document_id,
                KnowledgeDocument.tenant_id == tenant_id,
            )
        )
        doc = result.scalar_one_or_none()
        if not doc:
            return None

        doc.is_active = is_active
        new_status = "INDEXED" if is_active else "INACTIVE"
        if doc.status in ("INDEXED", "INACTIVE"):
            doc.status = new_status

        # Synchronize vector store status
        await self.vector_store.update_status(
            tenant_id=str(tenant_id),
            document_id=str(document_id),
            new_status=new_status,
        )

        await db.commit()
        await db.refresh(doc)
        return doc

    async def delete_document(
        self, db: AsyncSession, document_id: uuid.UUID, tenant_id: uuid.UUID
    ) -> bool:
        """Soft/hard deletes document, removes chunks from PostgreSQL and vectors from Qdrant."""
        result = await db.execute(
            select(KnowledgeDocument).where(
                KnowledgeDocument.id == document_id,
                KnowledgeDocument.tenant_id == tenant_id,
            )
        )
        doc = result.scalar_one_or_none()
        if not doc:
            return False

        # 1. Remove vectors from Qdrant
        await self.vector_store.delete_document_vectors(
            tenant_id=str(tenant_id), document_id=str(document_id)
        )

        # 2. Remove physical file from disk if present
        if doc.storage_path and os.path.exists(doc.storage_path):
            try:
                os.remove(doc.storage_path)
            except OSError as err:
                logger.warning("Could not delete physical file: %s", err)

        # 3. Delete from DB (cascades to chunks, versions, jobs)
        await db.delete(doc)
        await db.commit()
        return True


document_pipeline = DocumentIngestionPipeline()
