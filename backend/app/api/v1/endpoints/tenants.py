"""Multi-tenant Organization endpoints."""

from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import ConflictException, NotFoundException
from app.db.session import get_db
from app.models.tenant import Tenant
from app.schemas.tenant import TenantCreate, TenantRead

router = APIRouter()


@router.get("/", response_model=List[TenantRead], summary="List all active enterprise tenants")
async def list_tenants(
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
) -> List[Tenant]:
    result = await db.execute(select(Tenant).offset(skip).limit(limit))
    return list(result.scalars().all())


@router.post(
    "/",
    response_model=TenantRead,
    status_code=status.HTTP_201_CREATED,
    summary="Register new enterprise tenant",
)
async def create_tenant(
    payload: TenantCreate,
    db: AsyncSession = Depends(get_db),
) -> Tenant:
    # Check if slug exists
    existing = await db.execute(select(Tenant).where(Tenant.slug == payload.slug))
    if existing.scalar_one_or_none():
        raise ConflictException(f"Tenant slug '{payload.slug}' is already registered.")

    tenant = Tenant(
        name=payload.name,
        slug=payload.slug,
        plan_tier=payload.plan_tier,
        settings=payload.settings,
        is_active=payload.is_active,
    )
    db.add(tenant)
    await db.flush()
    await db.refresh(tenant)
    return tenant
