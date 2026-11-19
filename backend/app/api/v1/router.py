"""API v1 Central Router aggregating all resource endpoints."""

from fastapi import APIRouter

from app.api.v1.endpoints import auth, health, root, tenants, users

api_router = APIRouter()

# Root discovery endpoint
api_router.include_router(root.router, tags=["Root"])

# Health checks (DB, Redis, Qdrant)
api_router.include_router(health.router, prefix="/health", tags=["Health"])

# Authentication & Session Lifecycle
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])

# Multi-Tenancy Management
api_router.include_router(tenants.router, prefix="/tenants", tags=["Tenants"])

# User & Access Management
api_router.include_router(users.router, prefix="/users", tags=["Users"])
