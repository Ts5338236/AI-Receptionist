"""Multi-tenant Organization endpoints with strict tenant scoping."""

import uuid
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import ConflictException, ForbiddenException, NotFoundException
from app.core.security import get_current_user_claims, require_roles
from app.db.session import get_db
from app.models.tenant import Tenant
from app.schemas.tenant import TenantCreate, TenantRead

router = APIRouter()


@router.post(
    "/",
    response_model=TenantRead,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new enterprise tenant (Super Admin only)",
)
async def create_tenant(
    payload: TenantCreate,
    claims: Dict[str, Any] = Depends(require_roles(["SUPER_ADMIN"])),
    db: AsyncSession = Depends(get_db),
) -> Tenant:
    """Provisions a new tenant on the platform."""
    existing = await db.execute(select(Tenant).where(Tenant.slug == payload.slug))
    if existing.scalar_one_or_none():
        raise ConflictException(f"Tenant slug '{payload.slug}' is already registered.")

    tenant = Tenant(
        name=payload.name,
        slug=payload.slug,
        plan_tier=payload.plan_tier,
        is_active=payload.is_active,
    )
    db.add(tenant)
    await db.flush()
    await db.refresh(tenant)
    return tenant


@router.get(
    "/me",
    response_model=TenantRead,
    summary="Get current tenant details for authenticated context",
)
async def get_current_tenant(
    claims: Dict[str, Any] = Depends(get_current_user_claims),
    db: AsyncSession = Depends(get_db),
) -> Tenant:
    """Retrieves the caller's tenant organization details."""
    tenant_id = uuid.UUID(claims["tenant_id"])
    result = await db.execute(select(Tenant).where(Tenant.id == tenant_id))
    tenant = result.scalar_one_or_none()
    if not tenant:
        raise NotFoundException("Current tenant not found.")
    return tenant


@router.get(
    "/{tenant_id}",
    response_model=TenantRead,
    summary="Retrieve tenant by ID (Authorization Enforced)",
)
async def get_tenant_by_id(
    tenant_id: uuid.UUID,
    claims: Dict[str, Any] = Depends(get_current_user_claims),
    db: AsyncSession = Depends(get_db),
) -> Tenant:
    """Enforces tenant isolation: callers can only access their own tenant unless SUPER_ADMIN."""
    caller_tenant = uuid.UUID(claims["tenant_id"])
    caller_roles = claims.get("roles", [])

    if caller_tenant != tenant_id and "SUPER_ADMIN" not in caller_roles:
        raise ForbiddenException("Cross-tenant access forbidden.")

    result = await db.execute(select(Tenant).where(Tenant.id == tenant_id))
    tenant = result.scalar_one_or_none()
    if not tenant:
        raise NotFoundException("Tenant not found.")
    return tenant


@router.get(
    "/",
    response_model=List[TenantRead],
    summary="List enterprise tenants (Super Admin only)",
)
async def list_tenants(
    skip: int = 0,
    limit: int = 50,
    claims: Dict[str, Any] = Depends(require_roles(["SUPER_ADMIN"])),
    db: AsyncSession = Depends(get_db),
) -> List[Tenant]:
    result = await db.execute(select(Tenant).offset(skip).limit(limit))
    return list(result.scalars().all())
