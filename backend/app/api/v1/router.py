"""API v1 Central Router aggregating all resource endpoints."""

from fastapi import APIRouter

from app.api.v1.endpoints import health, root, tenants

api_router = APIRouter()

# Root discovery endpoint
api_router.include_router(root.router, tags=["Root"])

# Health checks
api_router.include_router(health.router, prefix="/health", tags=["Health"])

# Tenant & Multi-tenancy Management
api_router.include_router(tenants.router, prefix="/tenants", tags=["Tenants"])
