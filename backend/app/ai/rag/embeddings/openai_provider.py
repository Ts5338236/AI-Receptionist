"""Production OpenAI Embedding Provider adapter."""

from typing import List

import httpx

from app.ai.rag.embeddings.base import EmbeddingProvider
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger("openai_embeddings")


class OpenAIEmbeddingProvider(EmbeddingProvider):
    """Connects to OpenAI's REST API for batch and single embeddings."""

    def __init__(
        self,
        api_key: str = "",
        model: str = "text-embedding-3-small",
        dimension: int = 1536,
        timeout: float = 15.0,
    ):
        self.api_key = api_key or settings.OPENAI_API_KEY
        self.model = model or settings.OPENAI_EMBEDDING_MODEL
        self.dimension = dimension or settings.EMBEDDING_DIMENSION
        self.timeout = timeout

    async def embed_text(self, text: str) -> List[float]:
        results = await self.embed_documents([text])
        return results[0]

    async def embed_documents(self, texts: List[str]) -> List[List[float]]:
        if not self.api_key:
            raise RuntimeError(
                "OpenAI API key is missing. Set OPENAI_API_KEY or configure EMBEDDING_PROVIDER=mock for offline execution."
            )

        if not texts:
            return []

        # Sanitize texts (replace empty strings with single spaces)
        clean_inputs = [t if t.strip() else " " for t in texts]

        url = "https://api.openai.com/v1/embeddings"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model,
            "input": clean_inputs,
            "dimensions": self.dimension,
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(url, headers=headers, json=payload)
            if response.status_code != 200:
                logger.error(
                    "OpenAI embeddings error: status=%d detail=%s",
                    response.status_code,
                    response.text,
                )
                raise RuntimeError(f"OpenAI embedding API failed with status {response.status_code}: {response.text}")

            data = response.json()
            data_items = sorted(data.get("data", []), key=lambda x: x["index"])
            return [item["embedding"] for item in data_items]

    def get_dimension(self) -> int:
        return self.dimension

    def get_model_identifier(self) -> str:
        return self.model
