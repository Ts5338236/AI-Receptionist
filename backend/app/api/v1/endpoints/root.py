"""API root discovery and platform version information."""

from typing import Any, Dict
from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()


@router.get("/", response_model=Dict[str, Any], summary="API Root Discovery")
async def get_api_root() -> Dict[str, Any]:
    """Returns basic API metadata, service name, version, and documentation links."""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "status": "operational",
        "docs_url": "/docs",
        "health_check": f"{settings.API_V1_STR}/health/",
        "endpoints": {
            "health": f"{settings.API_V1_STR}/health/",
            "health_database": f"{settings.API_V1_STR}/health/database",
            "health_redis": f"{settings.API_V1_STR}/health/redis",
            "tenants": f"{settings.API_V1_STR}/tenants/",
        },
    }
