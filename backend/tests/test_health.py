"""Test suite for root discovery, health checks, and correlation IDs."""

from unittest.mock import AsyncMock, patch
import pytest
from httpx import AsyncClient

from app.schemas.health import DatabaseHealthResponse, RedisHealthResponse


@pytest.mark.asyncio
async def test_api_root(client: AsyncClient):
    """Verify GET /api/v1/ returns API metadata and versioning information."""
    response = await client.get("/api/v1/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "operational"
    assert "version" in data
    assert "name" in data
    assert "endpoints" in data
    assert response.headers.get("X-Correlation-ID") is not None
    assert response.headers.get("X-Process-Time") is not None


@pytest.mark.asyncio
async def test_health_liveness(client: AsyncClient):
    """Verify GET /api/v1/health/ returns healthy status."""
    response = await client.get("/api/v1/health/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "ai-receptionist-backend"
    assert "timestamp" in data


@pytest.mark.asyncio
async def test_database_health_success(client: AsyncClient):
    """Verify GET /api/v1/health/database succeeds against active database session."""
    response = await client.get("/api/v1/health/database")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "postgresql"
    assert data["status"] == "healthy"
    assert data["latency_ms"] >= 0


@pytest.mark.asyncio
async def test_database_health_failure(client: AsyncClient):
    """Verify GET /api/v1/health/database returns 503 on database query failure."""
    with patch(
        "app.api.v1.endpoints.health.check_database_health",
        new=AsyncMock(
            return_value=DatabaseHealthResponse(
                name="postgresql",
                status="unhealthy",
                latency_ms=12.4,
                error="Connection timed out",
            )
        ),
    ):
        response = await client.get("/api/v1/health/database")
        assert response.status_code == 503
        data = response.json()
        assert data["status"] == "unhealthy"
        assert data["error"] == "Connection timed out"


@pytest.mark.asyncio
async def test_redis_health_success(client: AsyncClient):
    """Verify GET /api/v1/health/redis returns 200 when Redis responds to PING."""
    with patch(
        "app.api.v1.endpoints.health.check_redis_health",
        new=AsyncMock(
            return_value=RedisHealthResponse(
                name="redis",
                status="healthy",
                latency_ms=1.5,
                details={"host": "localhost", "port": 6379},
            )
        ),
    ):
        response = await client.get("/api/v1/health/redis")
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "redis"
        assert data["status"] == "healthy"


@pytest.mark.asyncio
async def test_redis_health_failure(client: AsyncClient):
    """Verify GET /api/v1/health/redis returns 503 when Redis is unreachable."""
    with patch(
        "app.api.v1.endpoints.health.check_redis_health",
        new=AsyncMock(
            return_value=RedisHealthResponse(
                name="redis",
                status="unhealthy",
                latency_ms=15.2,
                error="Connection refused: redis://localhost:6379",
            )
        ),
    ):
        response = await client.get("/api/v1/health/redis")
        assert response.status_code == 503
        data = response.json()
        assert data["status"] == "unhealthy"
        assert "Connection refused" in data["error"]


@pytest.mark.asyncio
async def test_custom_correlation_id_passthrough(client: AsyncClient):
    """Verify custom X-Correlation-ID is preserved across request/response lifecycle."""
    custom_id = "test-custom-correlation-uuid-999"
    response = await client.get("/api/v1/", headers={"X-Correlation-ID": custom_id})
    assert response.status_code == 200
    assert response.headers.get("X-Correlation-ID") == custom_id
