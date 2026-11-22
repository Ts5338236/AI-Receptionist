"""Embedding provider factory and exports."""

from app.ai.rag.embeddings.base import EmbeddingProvider
from app.ai.rag.embeddings.mock_provider import MockEmbeddingProvider
from app.ai.rag.embeddings.openai_provider import OpenAIEmbeddingProvider
from app.core.config import settings


def get_embedding_provider() -> EmbeddingProvider:
    """Returns the configured embedding provider based on application settings."""
    provider_name = settings.EMBEDDING_PROVIDER.lower().strip()
    if provider_name == "openai" and settings.OPENAI_API_KEY:
        return OpenAIEmbeddingProvider()
    return MockEmbeddingProvider(dimension=settings.EMBEDDING_DIMENSION)


__all__ = [
    "EmbeddingProvider",
    "MockEmbeddingProvider",
    "OpenAIEmbeddingProvider",
    "get_embedding_provider",
]
