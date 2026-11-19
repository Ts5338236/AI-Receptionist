"""User Management endpoints scoped by enterprise multi-tenancy."""

import uuid
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.errors import ConflictException
from app.core.security import (
    get_current_user,
    hash_password,
    require_roles,
)
from app.db.session import get_db
from app.models.user import Role, User, UserRole
from app.schemas.user import UserCreate, UserRead

router = APIRouter()


@router.get(
    "/me",
    response_model=UserRead,
    summary="Get current user details",
)
async def get_user_me(current_user: User = Depends(get_current_user)) -> User:
    """Returns detailed profile for the authenticated user."""
    return current_user


@router.get(
    "/",
    response_model=List[UserRead],
    summary="List users in current enterprise tenant",
)
async def list_users(
    skip: int = 0,
    limit: int = 50,
    claims: Dict[str, Any] = Depends(require_roles(["SUPER_ADMIN", "BUSINESS_ADMIN", "BRANCH_ADMIN"])),
    db: AsyncSession = Depends(get_db),
) -> List[User]:
    """Retrieves all users belonging strictly to the requester's tenant."""
    tenant_id = uuid.UUID(claims["tenant_id"])
    query = select(User).options(selectinload(User.roles)).where(User.tenant_id == tenant_id).offset(skip).limit(limit)
    result = await db.execute(query)
    return list(result.scalars().all())


@router.post(
    "/",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create new user in the enterprise tenant",
)
async def create_user(
    payload: UserCreate,
    claims: Dict[str, Any] = Depends(require_roles(["SUPER_ADMIN", "BUSINESS_ADMIN"])),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Creates a user securely within the authenticated tenant context."""
    tenant_id = uuid.UUID(claims["tenant_id"])

    # 1. Check if email exists in this tenant
    existing = await db.execute(select(User).where(User.tenant_id == tenant_id, User.email == payload.email))
    if existing.scalar_one_or_none():
        raise ConflictException(f"User with email '{payload.email}' already exists in this tenant.")

    # 2. Create User
    new_user = User(
        tenant_id=tenant_id,
        branch_id=payload.branch_id,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        phone=payload.phone,
        is_active=payload.is_active,
        is_superuser=False,
    )
    db.add(new_user)
    await db.flush()

    # 3. Associate Roles
    for role_name in payload.role_names:
        role_res = await db.execute(select(Role).where(Role.name == role_name))
        role = role_res.scalar_one_or_none()
        if not role:
            role = Role(name=role_name, description=f"Role {role_name}")
            db.add(role)
            await db.flush()
        user_role = UserRole(user_id=new_user.id, role_id=role.id)
        db.add(user_role)

    await db.flush()
    # Reload with roles
    refreshed = await db.execute(select(User).options(selectinload(User.roles)).where(User.id == new_user.id))
    return refreshed.scalar_one()
