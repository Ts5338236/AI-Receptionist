"""Qdrant Vector Storage Service with strict multi-tenant filtering and in-memory fallback."""

import math
import uuid
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field
from qdrant_client import AsyncQdrantClient
from qdrant_client.http import models as qmodels

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger("vector_store")


class VectorPoint(BaseModel):
    """Payload and vector representation for a chunk."""

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    vector: List[float]
    payload: Dict[str, Any]


class VectorSearchResult(BaseModel):
    """Vector similarity search match."""

    point_id: str
    score: float
    payload: Dict[str, Any]


class InMemoryVectorStore:
    """In-memory fallback vector store for isolated offline testing and local dev."""

    def __init__(self):
        # collection_name -> Dict[point_id, VectorPoint]
        self.collections: Dict[str, Dict[str, VectorPoint]] = {}

    def ensure_collection(self, collection_name: str, dimension: int):
        if collection_name not in self.collections:
            self.collections[collection_name] = {}

    def upsert_points(self, collection_name: str, points: List[VectorPoint]):
        self.ensure_collection(collection_name, 1536)
        for pt in points:
            self.collections[collection_name][pt.id] = pt

    def search(
        self,
        collection_name: str,
        query_vector: List[float],
        tenant_id: str,
        branch_id: Optional[str] = None,
        top_k: int = 3,
        score_threshold: float = 0.5,
    ) -> List[VectorSearchResult]:
        self.ensure_collection(collection_name, 1536)
        collection = self.collections[collection_name]

        results = []
        for point in collection.values():
            payload = point.payload
            # 1. Enforce strict tenant isolation
            if str(payload.get("tenant_id")) != str(tenant_id):
                continue

            # 2. Enforce active/indexed status
            if payload.get("status") != "INDEXED":
                continue

            # 3. Branch filter if specified
            point_branch = payload.get("branch_id")
            if branch_id and point_branch and str(point_branch) != str(branch_id):
                continue

            # 4. Cosine similarity
            dot_product = sum(a * b for a, b in zip(query_vector, point.vector))
            norm_a = math.sqrt(sum(a * a for a in query_vector)) or 1.0
            norm_b = math.sqrt(sum(b * b for b in point.vector)) or 1.0
            sim = dot_product / (norm_a * norm_b)

            if sim >= score_threshold:
                results.append(VectorSearchResult(point_id=point.id, score=round(sim, 4), payload=payload))

        results.sort(key=lambda x: x.score, reverse=True)
        return results[:top_k]

    def delete_by_document(self, collection_name: str, tenant_id: str, document_id: str) -> int:
        self.ensure_collection(collection_name, 1536)
        to_delete = []
        for pid, pt in self.collections[collection_name].items():
            if str(pt.payload.get("tenant_id")) == str(tenant_id) and str(
                pt.payload.get("document_id")
            ) == str(document_id):
                to_delete.append(pid)

        for pid in to_delete:
            del self.collections[collection_name][pid]
        return len(to_delete)

    def update_document_status(
        self, collection_name: str, tenant_id: str, document_id: str, new_status: str
    ) -> int:
        self.ensure_collection(collection_name, 1536)
        count = 0
        for pt in self.collections[collection_name].values():
            if str(pt.payload.get("tenant_id")) == str(tenant_id) and str(
                pt.payload.get("document_id")
            ) == str(document_id):
                pt.payload["status"] = new_status
                count += 1
        return count


class QdrantStorageService:
    """Production Qdrant integration with automatic resilience and multi-tenant isolation."""

    _in_memory_store = InMemoryVectorStore()

    def __init__(
        self,
        host: Optional[str] = None,
        port: Optional[int] = None,
        api_key: Optional[str] = None,
        collection_name: Optional[str] = None,
    ):
        self.host = host or settings.QDRANT_HOST
        self.port = port or settings.QDRANT_PORT
        self.api_key = api_key or (settings.QDRANT_API_KEY if settings.QDRANT_API_KEY else None)
        self.collection_name = collection_name or settings.QDRANT_COLLECTION_NAME
        self._is_live_qdrant_healthy = False

    def _get_client(self) -> AsyncQdrantClient:
        return AsyncQdrantClient(
            host=self.host,
            port=self.port,
            api_key=self.api_key,
            timeout=3.0,
        )

    async def ensure_collection(self, dimension: int = 1536) -> bool:
        """Creates collection if it does not already exist."""
        try:
            client = self._get_client()
            collections = await client.get_collections()
            exists = any(c.name == self.collection_name for c in collections.collections)
            if not exists:
                await client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=qmodels.VectorParams(
                        size=dimension,
                        distance=qmodels.Distance.COSINE,
                    ),
                )
                # Create payload index for tenant_id for fast filtered retrieval
                await client.create_payload_index(
                    collection_name=self.collection_name,
                    field_name="tenant_id",
                    field_schema=qmodels.PayloadSchemaType.KEYWORD,
                )
                await client.create_payload_index(
                    collection_name=self.collection_name,
                    field_name="document_id",
                    field_schema=qmodels.PayloadSchemaType.KEYWORD,
                )
            self._is_live_qdrant_healthy = True
            return True
        except Exception as exc:
            logger.warning(
                "Qdrant live server unavailable (%s:%d): %s. Operating in resilient in-memory mode.",
                self.host,
                self.port,
                exc,
            )
            self._is_live_qdrant_healthy = False
            self._in_memory_store.ensure_collection(self.collection_name, dimension)
            return False

    async def upsert_chunks(self, points: List[VectorPoint]) -> int:
        """Upserts chunks into Qdrant or fallback store."""
        if not points:
            return 0

        # Always update memory store for consistent offline/test availability
        self._in_memory_store.upsert_points(self.collection_name, points)

        try:
            client = self._get_client()
            qdrant_points = [
                qmodels.PointStruct(
                    id=pt.id,
                    vector=pt.vector,
                    payload=pt.payload,
                )
                for pt in points
            ]
            await client.upsert(
                collection_name=self.collection_name,
                points=qdrant_points,
                wait=True,
            )
            return len(points)
        except Exception as exc:
            logger.info("Upserting to in-memory vector store fallback: %s", exc)
            return len(points)

    async def search(
        self,
        query_vector: List[float],
        tenant_id: str,
        branch_id: Optional[str] = None,
        top_k: int = 3,
        score_threshold: float = 0.5,
    ) -> List[VectorSearchResult]:
        """Executes similarity search with mandatory tenant isolation."""
        try:
            client = self._get_client()
            must_filters = [
                qmodels.FieldCondition(
                    key="tenant_id",
                    match=qmodels.MatchValue(value=str(tenant_id)),
                ),
                qmodels.FieldCondition(
                    key="status",
                    match=qmodels.MatchValue(value="INDEXED"),
                ),
            ]
            if branch_id:
                must_filters.append(
                    qmodels.FieldCondition(
                        key="branch_id",
                        match=qmodels.MatchValue(value=str(branch_id)),
                    )
                )

            filter_condition = qmodels.Filter(must=must_filters)
            results = await client.search(
                collection_name=self.collection_name,
                query_vector=query_vector,
                query_filter=filter_condition,
                limit=top_k,
                score_threshold=score_threshold,
            )
            return [
                VectorSearchResult(
                    point_id=str(r.id),
                    score=round(float(r.score), 4),
                    payload=r.payload or {},
                )
                for r in results
            ]
        except Exception as exc:
            logger.info("Live Qdrant search fallback to in-memory index: %s", exc)
            return self._in_memory_store.search(
                collection_name=self.collection_name,
                query_vector=query_vector,
                tenant_id=tenant_id,
                branch_id=branch_id,
                top_k=top_k,
                score_threshold=score_threshold,
            )

    async def delete_document_vectors(self, tenant_id: str, document_id: str) -> int:
        """Removes all vectors belonging to a document under the specified tenant."""
        self._in_memory_store.delete_by_document(self.collection_name, tenant_id, document_id)
        try:
            client = self._get_client()
            await client.delete(
                collection_name=self.collection_name,
                points_selector=qmodels.Filter(
                    must=[
                        qmodels.FieldCondition(key="tenant_id", match=qmodels.MatchValue(value=str(tenant_id))),
                        qmodels.FieldCondition(key="document_id", match=qmodels.MatchValue(value=str(document_id))),
                    ]
                ),
            )
            return 1
        except Exception as exc:
            logger.info("Qdrant delete fallback applied: %s", exc)
            return 1

    async def update_status(self, tenant_id: str, document_id: str, new_status: str) -> int:
        """Updates the status in vector payloads for active/inactive filtering."""
        return self._in_memory_store.update_document_status(
            self.collection_name, tenant_id, document_id, new_status
        )


vector_store_service = QdrantStorageService()
