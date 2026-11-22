"""Abstract Embedding Provider interface for Phase 6 RAG."""

from abc import ABC, abstractmethod
from typing import List


class EmbeddingProvider(ABC):
    """Abstract interface for text embedding generation."""

    @abstractmethod
    async def embed_text(self, text: str) -> List[float]:
        """Embeds a single query or text passage."""
        pass

    @abstractmethod
    async def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Batch embeds multiple document chunk passages."""
        pass

    @abstractmethod
    def get_dimension(self) -> int:
        """Returns the output vector dimensionality."""
        pass

    @abstractmethod
    def get_model_identifier(self) -> str:
        """Returns the identifier of the underlying embedding model."""
        pass
