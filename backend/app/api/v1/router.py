"""API v1 Central Router aggregating all resource endpoints."""

from fastapi import APIRouter

from app.api.v1.endpoints import auth, conversations, health, knowledge, root, tenants, users, voice

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

# Real-Time Voice Gateway (WebSocket)
api_router.include_router(voice.router, prefix="/voice", tags=["Voice"])

# AI Conversational Intelligence (LangGraph Engine)
api_router.include_router(conversations.router, prefix="/conversations", tags=["Conversations"])

# Enterprise RAG & Knowledge Base
api_router.include_router(knowledge.router, prefix="/knowledge", tags=["Knowledge"])
