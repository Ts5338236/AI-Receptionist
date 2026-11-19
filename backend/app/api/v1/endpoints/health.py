"""Health Check Endpoints for Platform and Infrastructure Probes."""

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.session import get_db
from app.schemas.health import DatabaseHealthResponse, HealthResponse, RedisHealthResponse
from app.services.health import check_database_health, check_redis_health

router = APIRouter()


@router.get(
    "/",
    response_model=HealthResponse,
    summary="Application Liveness Probe",
    status_code=status.HTTP_200_OK,
)
async def get_health() -> HealthResponse:
    """Returns general application liveness state."""
    return HealthResponse(
        status="healthy",
        version=settings.APP_VERSION,
        environment=settings.ENVIRONMENT,
    )


@router.get(
    "/database",
    response_model=DatabaseHealthResponse,
    summary="PostgreSQL Database Health Probe",
)
async def get_database_health(
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> DatabaseHealthResponse:
    """Performs an active database ping (SELECT 1) and measures latency."""
    res = await check_database_health(db)
    if res.status != "healthy":
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    return res


@router.get(
    "/redis",
    response_model=RedisHealthResponse,
    summary="Redis Key-Value Cache Health Probe",
)
async def get_redis_health(
    response: Response,
) -> RedisHealthResponse:
    """Performs an active Redis PING and measures latency."""
    res = await check_redis_health()
    if res.status != "healthy":
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    return res
