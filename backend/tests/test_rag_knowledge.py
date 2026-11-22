"""Exhaustive test suite for Phase 6 Enterprise RAG Knowledge Base."""

import io
import uuid
import pytest
import pytest_asyncio
import docx
import pypdf

from app.ai.rag.chunker import DocumentChunker
from app.ai.rag.embeddings.mock_provider import MockEmbeddingProvider
from app.ai.rag.embeddings.openai_provider import OpenAIEmbeddingProvider
from app.ai.rag.extractors import (
    DOCXExtractor,
    PDFExtractor,
    TextExtractor,
    get_extractor_for_format,
)
from app.ai.rag.pipeline import document_pipeline
from app.ai.rag.retriever import VectorKnowledgeRetriever
from app.ai.rag.validators import (
    DocumentValidationError,
    calculate_checksum,
    detect_file_type_and_validate,
    sanitize_filename,
)
from app.ai.rag.vector_store import VectorPoint, vector_store_service
from app.ai.tools.registry import SearchKnowledgeBaseTool
from app.core.security import create_access_token
from app.models.tenant import Tenant
from app.models.knowledge import KnowledgeDocument


def create_minimal_pdf(text: str) -> bytes:
    """Generates a minimal valid PDF in memory."""
    writer = pypdf.PdfWriter()
    # Add a blank page
    writer.add_blank_page(width=200, height=200)
    # Write to memory buffer
    buf = io.BytesIO()
    writer.write(buf)
    # Inject simple PDF header and stream
    return buf.getvalue()


def create_minimal_docx(text: str) -> bytes:
    """Generates a minimal valid DOCX file in memory."""
    doc = docx.Document()
    doc.add_heading("Visitor Policy Guidelines", level=1)
    doc.add_paragraph(text)
    table = doc.add_table(rows=2, cols=2)
    table.cell(0, 0).text = "Department"
    table.cell(0, 1).text = "Floor"
    table.cell(1, 0).text = "Security"
    table.cell(1, 1).text = "Level G"
    buf = io.BytesIO()
    doc.save(buf)
    return buf.getvalue()


# -------------------------------------------------------------
# 1. Document Validation Tests
# -------------------------------------------------------------
def test_sanitize_filename():
    assert sanitize_filename("../../../etc/passwd.pdf") == "passwd.pdf"
    assert sanitize_filename("..\\..\\windows\\system32.docx") == "system32.docx"
    assert sanitize_filename("my corporate policy (2026).pdf") == "my corporate policy (2026).pdf"
    assert sanitize_filename("") == "document_"


def test_file_type_validation_success():
    txt_bytes = b"Corporate security rules."
    fmt, mime = detect_file_type_and_validate("rules.txt", txt_bytes)
    assert fmt == "txt"
    assert mime == "text/plain"

    md_bytes = b"# Heading\nContent here"
    fmt, mime = detect_file_type_and_validate("guide.md", md_bytes)
    assert fmt == "md"
    assert mime == "text/markdown"


def test_file_type_validation_failures():
    # Empty file
    with pytest.raises(DocumentValidationError, match="empty"):
        detect_file_type_and_validate("empty.txt", b"")

    # Unsupported extension
    with pytest.raises(DocumentValidationError, match="Unsupported file extension"):
        detect_file_type_and_validate("script.exe", b"binary content")

    # Spoofed PDF header
    with pytest.raises(DocumentValidationError, match="magic header"):
        detect_file_type_and_validate("fake.pdf", b"This is not a real PDF file")

    # Spoofed DOCX header
    with pytest.raises(DocumentValidationError, match="ZIP / OpenXML"):
        detect_file_type_and_validate("fake.docx", b"Not a zipped openxml document")


def test_calculate_checksum():
    data = b"Enterprise knowledge test string"
    cs1 = calculate_checksum(data)
    cs2 = calculate_checksum(data)
    assert cs1 == cs2
    assert len(cs1) == 64


# -------------------------------------------------------------
# 2. Text Extraction Tests
# -------------------------------------------------------------
def test_text_and_markdown_extraction():
    extractor = get_extractor_for_format("md")
    content = b"# Main Title\n\nSection paragraph text."
    result = extractor.extract(content, "test.md")
    assert result.detected_format == "md"
    assert len(result.pages) == 1
    assert "Section paragraph text." in result.pages[0].text
    assert not result.scanned_image_detected


def test_docx_extraction():
    docx_bytes = create_minimal_docx("Visitors must be escorted on floor 4 at all times.")
    extractor = DOCXExtractor()
    result = extractor.extract(docx_bytes, "policy.docx")
    assert result.detected_format == "docx"
    assert "Visitors must be escorted" in result.pages[0].text
    assert "Security | Level G" in result.pages[0].text


def test_pdf_extraction_scanned_detection():
    # An empty or textless PDF should flag scanned detection
    pdf_bytes = create_minimal_pdf("")
    extractor = PDFExtractor()
    result = extractor.extract(pdf_bytes, "scan.pdf")
    assert result.detected_format == "pdf"
    assert result.scanned_image_detected is True


# -------------------------------------------------------------
# 3. Document Chunking Tests
# -------------------------------------------------------------
def test_document_chunking_boundaries_and_metadata():
    chunker = DocumentChunker(chunk_size=100, chunk_overlap=20)
    extractor = TextExtractor(is_markdown=True)
    md_content = b"# Visitor Guidelines\n\nParagraph one is about check-in rules.\n\n# Parking\n\nParagraph two is about parking validation on P1."
    extraction = extractor.extract(md_content, "guide.md")

    chunks = chunker.chunk_pages(extraction.pages, document_title="Visitor Guidelines")
    assert len(chunks) >= 2
    assert chunks[0].chunk_index == 0
    assert chunks[0].metadata["document_title"] == "Visitor Guidelines"
    assert any("parking" in c.content.lower() for c in chunks)


# -------------------------------------------------------------
# 4. Embedding Provider Tests
# -------------------------------------------------------------
@pytest.mark.asyncio
async def test_mock_embedding_provider_deterministic():
    provider = MockEmbeddingProvider(dimension=1536)
    assert provider.get_dimension() == 1536

    emb1 = await provider.embed_text("visitor parking level P1")
    emb2 = await provider.embed_text("visitor parking level P1")
    assert emb1 == emb2
    assert len(emb1) == 1536

    # Unit norm verification
    norm = sum(x * x for x in emb1) ** 0.5
    assert abs(norm - 1.0) < 1e-4

    # Batch embedding
    batch = await provider.embed_documents(["doc one", "doc two"])
    assert len(batch) == 2


def test_openai_embedding_provider_contract():
    provider = OpenAIEmbeddingProvider(api_key="test-key", dimension=1536)
    assert provider.get_dimension() == 1536
    assert provider.get_model_identifier() == "text-embedding-3-small"


# -------------------------------------------------------------
# 5. Vector Store & Strict Multi-Tenant Isolation
# -------------------------------------------------------------
@pytest.mark.asyncio
async def test_vector_store_multi_tenant_isolation():
    tenant_a = str(uuid.uuid4())
    tenant_b = str(uuid.uuid4())
    doc_id_a = str(uuid.uuid4())
    doc_id_b = str(uuid.uuid4())

    mock_emb = MockEmbeddingProvider()
    vec_a = await mock_emb.embed_text("Confidential financial reports for Tenant A.")
    vec_b = await mock_emb.embed_text("Secret product roadmap for Tenant B.")

    pt_a = VectorPoint(
        id=str(uuid.uuid4()),
        vector=vec_a,
        payload={
            "tenant_id": tenant_a,
            "document_id": doc_id_a,
            "document_title": "Tenant A Financials",
            "content": "Confidential financial reports for Tenant A.",
            "status": "INDEXED",
        },
    )

    pt_b = VectorPoint(
        id=str(uuid.uuid4()),
        vector=vec_b,
        payload={
            "tenant_id": tenant_b,
            "document_id": doc_id_b,
            "document_title": "Tenant B Roadmap",
            "content": "Secret product roadmap for Tenant B.",
            "status": "INDEXED",
        },
    )

    await vector_store_service.upsert_chunks([pt_a, pt_b])

    # Search with Tenant A - MUST NEVER return Tenant B's chunk
    q_vec = await mock_emb.embed_text("financial reports")
    results_a = await vector_store_service.search(
        query_vector=q_vec,
        tenant_id=tenant_a,
        top_k=5,
        score_threshold=0.1,
    )

    assert len(results_a) >= 1
    for r in results_a:
        assert str(r.payload["tenant_id"]) == tenant_a
        assert "Tenant B" not in r.payload["content"]

    # Delete Document A
    await vector_store_service.delete_document_vectors(tenant_id=tenant_a, document_id=doc_id_a)
    results_after_del = await vector_store_service.search(
        query_vector=q_vec,
        tenant_id=tenant_a,
        top_k=5,
        score_threshold=0.1,
    )
    assert len(results_after_del) == 0


# -------------------------------------------------------------
# 6. RAG Tool & Retrieval Grounding Tests
# -------------------------------------------------------------
@pytest.mark.asyncio
async def test_search_knowledge_base_tool_grounded_answer():
    tool = SearchKnowledgeBaseTool()
    tenant_id = str(uuid.uuid4())
    doc_id = str(uuid.uuid4())

    mock_emb = MockEmbeddingProvider()
    vec = await mock_emb.embed_text("Visitor parking passes are stamped at the reception desk on floor 1.")
    pt = VectorPoint(
        id=str(uuid.uuid4()),
        vector=vec,
        payload={
            "tenant_id": tenant_id,
            "document_id": doc_id,
            "document_title": "Visitor Parking Guide.pdf",
            "content": "Visitor parking passes are stamped at the reception desk on floor 1.",
            "page_number": 2,
            "status": "INDEXED",
        },
    )
    await vector_store_service.upsert_chunks([pt])

    res = await tool.execute(
        arguments={"query": "where can I get my parking pass stamped?"},
        tenant_id=tenant_id,
    )
    assert res.success is True
    assert res.status_code == "SUCCESS"
    assert "Visitor Parking Guide.pdf" in res.message
    assert len(res.data["citations"]) >= 1
    assert res.data["citations"][0]["page_number"] == 2


@pytest.mark.asyncio
async def test_search_knowledge_base_tool_insufficient_evidence():
    tool = SearchKnowledgeBaseTool()
    tenant_id = str(uuid.uuid4())

    # Searching with empty index should return controlled safe fallback
    res = await tool.execute(
        arguments={"query": "What is the secret internal passcode to the server room?"},
        tenant_id=tenant_id,
    )
    assert res.success is False
    assert res.status_code == "INSUFFICIENT_EVIDENCE"
    assert "could not find verified information" in res.message


# -------------------------------------------------------------
# 7. Knowledge REST API Endpoints Tests
# -------------------------------------------------------------
@pytest.mark.asyncio
async def test_knowledge_api_lifecycle(client, db_session):
    # 1. Create test tenant
    tenant_id = uuid.uuid4()
    tenant = Tenant(
        id=tenant_id,
        name="Enterprise Acme Corp",
        slug=f"acme-{uuid.uuid4().hex[:6]}",
        plan_tier="enterprise",
        is_active=True,
    )
    db_session.add(tenant)
    await db_session.commit()

    token = create_access_token(
        subject="test-admin",
        tenant_id=str(tenant_id),
        roles=["tenant_admin"],
    )
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Upload Document
    docx_bytes = create_minimal_docx("Complimentary guest Wi-Fi network is AcmeGuest.")
    files = [("files", ("wifi_guide.docx", docx_bytes, "application/vnd.openxmlformats-officedocument.wordprocessingml.document"))]
    data = {"title": "Guest Wi-Fi Setup Guide"}

    upload_resp = await client.post("/api/v1/knowledge/documents", headers=headers, files=files, data=data)
    assert upload_resp.status_code == 202
    doc_info = upload_resp.json()[0]
    doc_id = doc_info["id"]
    assert doc_info["title"] == "Guest Wi-Fi Setup Guide"
    assert doc_info["status"] == "QUEUED"

    # Process document synchronously in test
    await document_pipeline.process_document_job(
        document_id=uuid.UUID(doc_id),
        tenant_id=tenant_id,
    )

    # 3. Retrieve Document Details
    get_resp = await client.get(f"/api/v1/knowledge/documents/{doc_id}", headers=headers)
    assert get_resp.status_code == 200
    doc_details = get_resp.json()
    assert doc_details["status"] == "INDEXED"
    assert doc_details["total_chunks"] >= 1

    # 4. List Documents
    list_resp = await client.get("/api/v1/knowledge/documents", headers=headers)
    assert list_resp.status_code == 200
    assert list_resp.json()["total"] == 1

    # 5. Semantic Search via API
    search_resp = await client.post(
        "/api/v1/knowledge/search",
        headers=headers,
        json={"query": "How do I connect to guest Wi-Fi?", "top_k": 3},
    )
    assert search_resp.status_code == 200
    search_data = search_resp.json()
    assert search_data["total_matches"] >= 1
    assert "AcmeGuest" in search_data["matches"][0]["content"]

    # 6. Reprocess Document
    reproc_resp = await client.post(f"/api/v1/knowledge/documents/{doc_id}/reprocess", headers=headers)
    assert reproc_resp.status_code == 202
    assert reproc_resp.json()["job_type"] == "REPROCESS"

    # 7. Toggle Status (Deactivate)
    status_resp = await client.patch(
        f"/api/v1/knowledge/documents/{doc_id}/status",
        headers=headers,
        json={"is_active": False},
    )
    assert status_resp.status_code == 200
    assert status_resp.json()["is_active"] is False

    # 8. Check Stats Endpoint
    stats_resp = await client.get("/api/v1/knowledge/stats", headers=headers)
    assert stats_resp.status_code == 200
    stats = stats_resp.json()
    assert stats["total_documents"] == 1
    assert stats["inactive_documents"] == 1

    # 9. Delete Document
    del_resp = await client.delete(f"/api/v1/knowledge/documents/{doc_id}", headers=headers)
    assert del_resp.status_code == 204

    # Verify 404 after deletion
    get_del_resp = await client.get(f"/api/v1/knowledge/documents/{doc_id}", headers=headers)
    assert get_del_resp.status_code == 404
