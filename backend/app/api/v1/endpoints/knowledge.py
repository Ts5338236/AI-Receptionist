"""Enterprise Knowledge Base REST Endpoints for Document Ingestion and Retrieval."""

import time
import uuid
from typing import Any, Dict, List, Optional

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    File,
    Form,
    HTTPException,
    Query,
    UploadFile,
    status,
)
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.rag.pipeline import document_pipeline
from app.ai.rag.retriever import VectorKnowledgeRetriever
from app.ai.rag.validators import DocumentValidationError
from app.core.logging import get_logger
from app.core.security import get_current_user_claims
from app.db.session import get_db
from app.models.knowledge import (
    DocumentChunk,
    DocumentProcessingJob,
    KnowledgeDocument,
)
from app.schemas.knowledge import (
    DocumentListResponse,
    DocumentResponse,
    DocumentStatusUpdate,
    KnowledgeSearchRequest,
    KnowledgeSearchResponse,
    KnowledgeStatsResponse,
    ProcessingJobResponse,
    SearchMatchResponse,
)

logger = get_logger("knowledge_endpoints")

router = APIRouter()


@router.post(
    "/documents",
    response_model=List[DocumentResponse],
    status_code=status.HTTP_202_ACCEPTED,
    summary="Upload single or multiple knowledge documents for background ingestion",
)
async def upload_documents(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
    branch_id: Optional[uuid.UUID] = Form(None),
    title: Optional[str] = Form(None),
    claims: Dict[str, Any] = Depends(get_current_user_claims),
    db: AsyncSession = Depends(get_db),
):
    """Securely uploads documents, validates formats, and schedules background processing jobs."""
    tenant_id = uuid.UUID(claims["tenant_id"])
    uploaded_docs: List[KnowledgeDocument] = []

    for file in files:
        file_bytes = await file.read()
        try:
            doc = await document_pipeline.ingest_document_file(
                db=db,
                tenant_id=tenant_id,
                filename=file.filename or "uploaded_document",
                content=file_bytes,
                branch_id=branch_id,
                title=title if len(files) == 1 else None,
            )
            uploaded_docs.append(doc)

            # Schedule background indexing pipeline
            background_tasks.add_task(
                document_pipeline.process_document_job,
                document_id=doc.id,
                tenant_id=tenant_id,
            )
        except DocumentValidationError as val_err:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(val_err))
        except Exception as exc:
            logger.exception("Upload processing failure for file %s: %s", file.filename, exc)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to process file '{file.filename}': {str(exc)}",
            )

    return uploaded_docs


@router.get(
    "/documents",
    response_model=DocumentListResponse,
    summary="List knowledge documents for the authenticated tenant with filtering",
)
async def list_documents(
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
    branch_id: Optional[uuid.UUID] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    claims: Dict[str, Any] = Depends(get_current_user_claims),
    db: AsyncSession = Depends(get_db),
):
    tenant_id = uuid.UUID(claims["tenant_id"])
    query = select(KnowledgeDocument).where(KnowledgeDocument.tenant_id == tenant_id)

    if status_filter:
        query = query.where(KnowledgeDocument.status == status_filter.upper())
    if branch_id:
        query = query.where(KnowledgeDocument.branch_id == branch_id)
    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.where(
            (KnowledgeDocument.title.ilike(search_pattern))
            | (KnowledgeDocument.filename.ilike(search_pattern))
        )

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_count = (await db.execute(count_query)).scalar() or 0

    # Paginate
    query = (
        query.order_by(KnowledgeDocument.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    result = await db.execute(query)
    items = result.scalars().all()

    return DocumentListResponse(
        items=[DocumentResponse.model_validate(item) for item in items],
        total=total_count,
        page=page,
        page_size=page_size,
    )


@router.get(
    "/documents/{document_id}",
    response_model=DocumentResponse,
    summary="Retrieve details of a specific knowledge document",
)
async def get_document(
    document_id: uuid.UUID,
    claims: Dict[str, Any] = Depends(get_current_user_claims),
    db: AsyncSession = Depends(get_db),
):
    tenant_id = uuid.UUID(claims["tenant_id"])
    result = await db.execute(
        select(KnowledgeDocument).where(
            KnowledgeDocument.id == document_id,
            KnowledgeDocument.tenant_id == tenant_id,
        )
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or does not belong to authorized tenant",
        )
    return doc


@router.delete(
    "/documents/{document_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a knowledge document and its indexed vector points",
)
async def delete_document(
    document_id: uuid.UUID,
    claims: Dict[str, Any] = Depends(get_current_user_claims),
    db: AsyncSession = Depends(get_db),
):
    tenant_id = uuid.UUID(claims["tenant_id"])
    success = await document_pipeline.delete_document(db, document_id=document_id, tenant_id=tenant_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or does not belong to authorized tenant",
        )
    return None


@router.post(
    "/documents/{document_id}/reprocess",
    response_model=ProcessingJobResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Trigger reprocessing and re-indexing of an existing document",
)
async def reprocess_document(
    document_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    claims: Dict[str, Any] = Depends(get_current_user_claims),
    db: AsyncSession = Depends(get_db),
):
    tenant_id = uuid.UUID(claims["tenant_id"])
    result = await db.execute(
        select(KnowledgeDocument).where(
            KnowledgeDocument.id == document_id,
            KnowledgeDocument.tenant_id == tenant_id,
        )
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or does not belong to authorized tenant",
        )

    job = await document_pipeline.reprocess_document(db, document_id, tenant_id)
    background_tasks.add_task(
        document_pipeline.process_document_job,
        document_id=doc.id,
        tenant_id=tenant_id,
    )
    return job


@router.patch(
    "/documents/{document_id}/status",
    response_model=DocumentResponse,
    summary="Activate or deactivate a document for receptionist retrieval",
)
async def update_document_status(
    document_id: uuid.UUID,
    payload: DocumentStatusUpdate,
    claims: Dict[str, Any] = Depends(get_current_user_claims),
    db: AsyncSession = Depends(get_db),
):
    tenant_id = uuid.UUID(claims["tenant_id"])
    doc = await document_pipeline.set_document_active_status(
        db=db,
        document_id=document_id,
        tenant_id=tenant_id,
        is_active=payload.is_active,
    )
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or does not belong to authorized tenant",
        )
    return doc


@router.get(
    "/jobs/{job_id}",
    response_model=ProcessingJobResponse,
    summary="Get background ingestion job status and progress",
)
async def get_job_status(
    job_id: uuid.UUID,
    claims: Dict[str, Any] = Depends(get_current_user_claims),
    db: AsyncSession = Depends(get_db),
):
    tenant_id = uuid.UUID(claims["tenant_id"])
    result = await db.execute(
        select(DocumentProcessingJob).where(
            DocumentProcessingJob.id == job_id,
            DocumentProcessingJob.tenant_id == tenant_id,
        )
    )
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    return job


@router.post(
    "/search",
    response_model=KnowledgeSearchResponse,
    summary="Execute semantic retrieval search against indexed tenant documents",
)
async def search_knowledge(
    payload: KnowledgeSearchRequest,
    claims: Dict[str, Any] = Depends(get_current_user_claims),
):
    tenant_id = claims["tenant_id"]
    retriever = VectorKnowledgeRetriever()

    start_time = time.perf_counter()
    docs = await retriever.search(
        query=payload.query,
        tenant_id=tenant_id,
        branch_id=str(payload.branch_id) if payload.branch_id else None,
        top_k=payload.top_k,
    )
    latency_ms = (time.perf_counter() - start_time) * 1000.0

    matches = [
        SearchMatchResponse(
            content=d.content,
            document_name=d.source,
            document_id=d.document_id,
            page_number=d.page_number,
            section=d.section_title,
            chunk_id=d.chunk_id,
            relevance_score=d.relevance_score,
        )
        for d in docs
    ]

    return KnowledgeSearchResponse(
        query=payload.query,
        matches=matches,
        total_matches=len(matches),
        execution_time_ms=round(latency_ms, 2),
    )


@router.get(
    "/stats",
    response_model=KnowledgeStatsResponse,
    summary="Get tenant knowledge base index and document statistics",
)
async def get_knowledge_stats(
    claims: Dict[str, Any] = Depends(get_current_user_claims),
    db: AsyncSession = Depends(get_db),
):
    tenant_id = uuid.UUID(claims["tenant_id"])

    # Document counts by status
    total_docs = (
        await db.execute(
            select(func.count(KnowledgeDocument.id)).where(KnowledgeDocument.tenant_id == tenant_id)
        )
    ).scalar() or 0

    indexed_docs = (
        await db.execute(
            select(func.count(KnowledgeDocument.id)).where(
                KnowledgeDocument.tenant_id == tenant_id,
                KnowledgeDocument.status == "INDEXED",
            )
        )
    ).scalar() or 0

    failed_docs = (
        await db.execute(
            select(func.count(KnowledgeDocument.id)).where(
                KnowledgeDocument.tenant_id == tenant_id,
                KnowledgeDocument.status == "FAILED",
            )
        )
    ).scalar() or 0

    inactive_docs = (
        await db.execute(
            select(func.count(KnowledgeDocument.id)).where(
                KnowledgeDocument.tenant_id == tenant_id,
                KnowledgeDocument.is_active == False,  # noqa: E712
            )
        )
    ).scalar() or 0

    total_chunks = (
        await db.execute(
            select(func.count(DocumentChunk.id)).where(DocumentChunk.tenant_id == tenant_id)
        )
    ).scalar() or 0

    active_jobs = (
        await db.execute(
            select(func.count(DocumentProcessingJob.id)).where(
                DocumentProcessingJob.tenant_id == tenant_id,
                DocumentProcessingJob.status.in_(["QUEUED", "PROCESSING"]),
            )
        )
    ).scalar() or 0

    return KnowledgeStatsResponse(
        total_documents=total_docs,
        indexed_documents=indexed_docs,
        failed_documents=failed_docs,
        inactive_documents=inactive_docs,
        total_chunks=total_chunks,
        active_jobs=active_jobs,
    )
