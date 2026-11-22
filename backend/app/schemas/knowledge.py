"""Pydantic schemas for Knowledge Base documents, jobs, and search."""

import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class DocumentResponse(BaseModel):
    """Document metadata response."""

    id: uuid.UUID
    tenant_id: uuid.UUID
    branch_id: Optional[uuid.UUID] = None
    title: str
    filename: str
    file_type: str
    mime_type: str
    file_size_bytes: int
    file_checksum: str
    status: str
    is_active: bool
    error_message: Optional[str] = None
    total_pages: int = 0
    total_chunks: int = 0
    embedding_model: str
    doc_metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DocumentListResponse(BaseModel):
    """Paginated list of documents."""

    items: List[DocumentResponse]
    total: int
    page: int
    page_size: int


class DocumentStatusUpdate(BaseModel):
    """Payload to toggle document activation status."""

    is_active: bool


class ProcessingJobResponse(BaseModel):
    """Background ingestion job status response."""

    id: uuid.UUID
    document_id: uuid.UUID
    tenant_id: uuid.UUID
    job_type: str
    status: str
    progress_percent: int
    attempts: int
    max_attempts: int
    error_message: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class KnowledgeSearchRequest(BaseModel):
    """Direct semantic retrieval search request."""

    query: str = Field(min_length=1, max_length=1000)
    branch_id: Optional[uuid.UUID] = None
    top_k: int = Field(default=3, ge=1, le=10)


class SearchMatchResponse(BaseModel):
    """Individual chunk search match."""

    content: str
    document_name: str
    document_id: Optional[str] = None
    page_number: Optional[int] = None
    section: Optional[str] = None
    chunk_id: Optional[str] = None
    relevance_score: float


class KnowledgeSearchResponse(BaseModel):
    """Consolidated semantic search results."""

    query: str
    matches: List[SearchMatchResponse]
    total_matches: int
    execution_time_ms: float


class KnowledgeStatsResponse(BaseModel):
    """Aggregated knowledge base metrics."""

    total_documents: int
    indexed_documents: int
    failed_documents: int
    inactive_documents: int
    total_chunks: int
    active_jobs: int
