"""Health probe services for PostgreSQL and Redis subsystems."""

import time
from typing import Optional
from redis.asyncio import Redis, from_url
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.schemas.health import DatabaseHealthResponse, RedisHealthResponse


async def check_database_health(db: AsyncSession) -> DatabaseHealthResponse:
    """Probes the PostgreSQL database connectivity with SELECT 1."""
    start_time = time.perf_counter()
    try:
        result = await db.execute(text("SELECT 1"))
        _ = result.scalar()
        latency = (time.perf_counter() - start_time) * 1000.0
        return DatabaseHealthResponse(
            name="postgresql",
            status="healthy",
            latency_ms=round(latency, 2),
            details={"database": settings.POSTGRES_DB, "server": settings.POSTGRES_SERVER},
        )
    except Exception as exc:
        latency = (time.perf_counter() - start_time) * 1000.0
        return DatabaseHealthResponse(
            name="postgresql",
            status="unhealthy",
            latency_ms=round(latency, 2),
            error=str(exc),
        )


async def check_redis_health() -> RedisHealthResponse:
    """Probes the Redis cluster / single node using PING."""
    start_time = time.perf_counter()
    client: Optional[Redis] = None
    try:
        client = from_url(
            settings.REDIS_URL,
            socket_connect_timeout=2.0,
            socket_timeout=2.0,
        )
        pong = await client.ping()
        latency = (time.perf_counter() - start_time) * 1000.0
        return RedisHealthResponse(
            name="redis",
            status="healthy" if pong else "unhealthy",
            latency_ms=round(latency, 2),
            details={"host": settings.REDIS_HOST, "port": settings.REDIS_PORT},
        )
    except Exception as exc:
        latency = (time.perf_counter() - start_time) * 1000.0
        return RedisHealthResponse(
            name="redis",
            status="unhealthy",
            latency_ms=round(latency, 2),
            error=str(exc),
        )
    finally:
        if client:
            await client.aclose()
