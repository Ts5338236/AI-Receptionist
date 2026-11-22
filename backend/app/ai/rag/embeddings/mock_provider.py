"""Deterministic Mock Embedding Provider for isolated unit tests and offline testing."""

import hashlib
import math
from typing import List

from app.ai.rag.embeddings.base import EmbeddingProvider


class MockEmbeddingProvider(EmbeddingProvider):
    """
    Deterministic pseudo-semantic embedding generator producing unit-norm 1536-d vectors.
    Uses token hashing and ngram distribution so semantically related queries share vector weight.
    """

    def __init__(self, dimension: int = 1536, model_id: str = "mock-embedding-1536"):
        self.dimension = dimension
        self.model_id = model_id

    def _generate_vector(self, text: str) -> List[float]:
        """Creates a deterministic 1536-dim normalized vector from text."""
        vec = [0.0] * self.dimension
        clean = text.lower().strip()
        words = [w for w in clean.replace(".", " ").replace(",", " ").split() if w]

        if not words:
            # Zero-magnitude fallback normalized
            val = 1.0 / math.sqrt(self.dimension)
            return [val] * self.dimension

        # Map each word to multiple deterministic bucket indices
        for word in words:
            h = int(hashlib.sha256(word.encode("utf-8")).hexdigest(), 16)
            for i in range(4):
                idx = (h + (i * 389)) % self.dimension
                vec[idx] += 1.0

        # Also add bigram features for order sensitivity
        for i in range(len(words) - 1):
            bigram = f"{words[i]}_{words[i+1]}"
            bh = int(hashlib.md5(bigram.encode("utf-8")).hexdigest(), 16)
            for j in range(2):
                b_idx = (bh + (j * 521)) % self.dimension
                vec[b_idx] += 1.5

        # L2 Normalize
        norm = math.sqrt(sum(x * x for x in vec))
        if norm > 0:
            vec = [x / norm for x in vec]
        else:
            val = 1.0 / math.sqrt(self.dimension)
            vec = [val] * self.dimension

        return vec

    async def embed_text(self, text: str) -> List[float]:
        return self._generate_vector(text)

    async def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return [self._generate_vector(t) for t in texts]

    def get_dimension(self) -> int:
        return self.dimension

    def get_model_identifier(self) -> str:
        return self.model_id
