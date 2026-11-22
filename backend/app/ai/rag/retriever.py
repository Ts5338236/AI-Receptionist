"""Enterprise Vector Knowledge Retriever for Phase 6 RAG."""

import re
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field

from app.ai.rag.embeddings import get_embedding_provider
from app.ai.rag.vector_store import vector_store_service
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger("knowledge_retriever")


class SourceCitation(BaseModel):
    """Traceable evidence citation for visitor-facing answers."""

    document_name: str
    document_id: Optional[str] = None
    page_number: Optional[int] = None
    section: Optional[str] = None
    chunk_id: Optional[str] = None
    relevance_score: float = 0.0


class RetrievedDocument(BaseModel):
    """Document fragment retrieved from knowledge base."""

    content: str
    source: str
    relevance_score: float = Field(ge=0.0, le=1.0)
    document_id: Optional[str] = None
    page_number: Optional[int] = None
    section_title: Optional[str] = None
    chunk_id: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

    def to_citation(self) -> SourceCitation:
        return SourceCitation(
            document_name=self.source,
            document_id=self.document_id,
            page_number=self.page_number,
            section=self.section_title,
            chunk_id=self.chunk_id,
            relevance_score=self.relevance_score,
        )


class KnowledgeRetriever(ABC):
    """Abstract interface for knowledge base search and context synthesis."""

    @abstractmethod
    async def search(
        self,
        query: str,
        tenant_id: str,
        branch_id: Optional[str] = None,
        top_k: int = 3,
    ) -> List[RetrievedDocument]:
        """Searches vector index for matching policy or organizational documents."""
        pass

    @abstractmethod
    async def retrieve_context(
        self,
        query: str,
        tenant_id: str,
        branch_id: Optional[str] = None,
    ) -> Optional[str]:
        """Returns consolidated contextual snippets formatted for prompt injection."""
        pass


class VectorKnowledgeRetriever(KnowledgeRetriever):
    """Production vector knowledge retriever connecting Embeddings & Qdrant."""

    def __init__(self):
        self.embedding_provider = get_embedding_provider()
        self.vector_store = vector_store_service
        self.similarity_threshold = settings.RAG_SIMILARITY_THRESHOLD

    async def search(
        self,
        query: str,
        tenant_id: str,
        branch_id: Optional[str] = None,
        top_k: int = 3,
    ) -> List[RetrievedDocument]:
        # Clean and sanitize search query
        clean_query = re.sub(r"[^\w\s\?-]", " ", query).strip()
        if not clean_query:
            return []

        query_vector = await self.embedding_provider.embed_text(clean_query)
        matches = await self.vector_store.search(
            query_vector=query_vector,
            tenant_id=tenant_id,
            branch_id=branch_id,
            top_k=top_k,
            score_threshold=self.similarity_threshold,
        )

        documents: List[RetrievedDocument] = []
        for m in matches:
            payload = m.payload
            doc = RetrievedDocument(
                content=payload.get("content", ""),
                source=payload.get("document_title") or payload.get("filename") or "Document",
                relevance_score=m.score,
                document_id=payload.get("document_id"),
                page_number=payload.get("page_number"),
                section_title=payload.get("section_title"),
                chunk_id=payload.get("chunk_id"),
                metadata=payload,
            )
            documents.append(doc)

        return documents

    async def retrieve_context(
        self,
        query: str,
        tenant_id: str,
        branch_id: Optional[str] = None,
    ) -> Optional[str]:
        docs = await self.search(query=query, tenant_id=tenant_id, branch_id=branch_id, top_k=settings.RAG_TOP_K)
        if not docs:
            return None

        # Format retrieved evidence strictly inside containment tags to neutralize injection attacks
        snippets = []
        for d in docs:
            page_str = f" Page {d.page_number}" if d.page_number else ""
            snippets.append(
                f'<retrieved_evidence source="{d.source}"{page_str}>\n{d.content}\n</retrieved_evidence>'
            )

        return "\n\n".join(snippets)


class MockKnowledgeRetriever(KnowledgeRetriever):
    """Deterministic mock retriever for testing and verification."""

    async def search(
        self,
        query: str,
        tenant_id: str,
        branch_id: Optional[str] = None,
        top_k: int = 3,
    ) -> List[RetrievedDocument]:
        return [
            RetrievedDocument(
                content="Visitor parking is validated at the main reception desk on level P1.",
                source="visitor_policy_manual.pdf",
                relevance_score=0.91,
                page_number=3,
                section_title="Parking & Transportation",
                metadata={"page": 3},
            )
        ]

    async def retrieve_context(
        self,
        query: str,
        tenant_id: str,
        branch_id: Optional[str] = None,
    ) -> Optional[str]:
        docs = await self.search(query, tenant_id, branch_id)
        if not docs:
            return None
        return "\n".join([f"[{d.source}] {d.content}" for d in docs])


def get_knowledge_retriever() -> KnowledgeRetriever:
    """Factory returning the production vector retriever."""
    return VectorKnowledgeRetriever()
