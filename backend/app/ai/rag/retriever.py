"""RAG Knowledge Retrieval Interface (Prepared for Phase 6)."""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class RetrievedDocument(BaseModel):
    """Document fragment retrieved from knowledge base."""

    content: str
    source: str
    relevance_score: float = Field(ge=0.0, le=1.0)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class KnowledgeRetriever(ABC):
    """Abstract interface preparing the conversation engine for Phase 6 RAG integration."""

    @abstractmethod
    async def search(self, query: str, tenant_id: str, top_k: int = 3) -> List[RetrievedDocument]:
        """Searches vector index for matching policy or organizational documents."""
        pass

    @abstractmethod
    async def retrieve_context(self, query: str, tenant_id: str) -> Optional[str]:
        """Returns consolidated contextual snippets formatted for prompt injection."""
        pass


class MockKnowledgeRetriever(KnowledgeRetriever):
    """Deterministic mock retriever for testing and verification."""

    async def search(self, query: str, tenant_id: str, top_k: int = 3) -> List[RetrievedDocument]:
        return [
            RetrievedDocument(
                content="Visitor parking is validated at the main reception desk on level P1.",
                source="visitor_policy_manual.pdf",
                relevance_score=0.91,
                metadata={"page": 3},
            )
        ]

    async def retrieve_context(self, query: str, tenant_id: str) -> Optional[str]:
        docs = await self.search(query, tenant_id)
        if not docs:
            return None
        return "\n".join([f"[{d.source}] {d.content}" for d in docs])
