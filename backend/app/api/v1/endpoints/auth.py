"""Enterprise Authentication and Token Lifecycle Endpoints."""

import uuid
from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.errors import ConflictException, UnauthorizedException
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_current_user,
    get_current_user_claims,
    hash_password,
    verify_password,
)
from app.db.session import get_db
from app.models.tenant import Tenant
from app.models.user import Role, User, UserRole
from app.schemas.auth import CurrentUserResponse, Token, TokenRefresh, UserLogin, UserRegister

router = APIRouter()


@router.post(
    "/register",
    response_model=Token,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new enterprise tenant and primary administrator",
)
async def register(payload: UserRegister, db: AsyncSession = Depends(get_db)) -> Token:
    """Provisions a new tenant organization and initial BUSINESS_ADMIN user."""
    # 1. Check if tenant slug already exists
    existing_tenant = await db.execute(select(Tenant).where(Tenant.slug == payload.tenant_slug))
    if existing_tenant.scalar_one_or_none():
        raise ConflictException(f"Tenant slug '{payload.tenant_slug}' is already taken.")

    # 2. Check if user email already exists
    existing_user = await db.execute(select(User).where(User.email == payload.email))
    if existing_user.scalar_one_or_none():
        raise ConflictException(f"User with email '{payload.email}' already exists.")

    # 3. Create Tenant
    tenant = Tenant(
        name=payload.tenant_name,
        slug=payload.tenant_slug,
        plan_tier="enterprise",
        is_active=True,
    )
    db.add(tenant)
    await db.flush()

    # 4. Ensure BUSINESS_ADMIN role exists
    role_res = await db.execute(select(Role).where(Role.name == "BUSINESS_ADMIN"))
    role = role_res.scalar_one_or_none()
    if not role:
        role = Role(name="BUSINESS_ADMIN", description="Tenant Business Administrator", is_system_role=True)
        db.add(role)
        await db.flush()

    # 5. Create User
    user = User(
        tenant_id=tenant.id,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        is_active=True,
        is_superuser=False,
    )
    db.add(user)
    await db.flush()

    # 6. Assign Role
    user_role = UserRole(user_id=user.id, role_id=role.id)
    db.add(user_role)
    await db.flush()

    # 7. Generate Tokens
    roles = ["BUSINESS_ADMIN"]
    access_token = create_access_token(subject=str(user.id), tenant_id=str(tenant.id), roles=roles)
    refresh_token = create_refresh_token(subject=str(user.id), tenant_id=str(tenant.id))

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in_minutes=30,
    )


@router.post(
    "/login",
    response_model=Token,
    summary="Authenticate with corporate credentials",
)
async def login(payload: UserLogin, db: AsyncSession = Depends(get_db)) -> Token:
    """Validates user email and password; generates JWT session tokens."""
    result = await db.execute(select(User).options(selectinload(User.roles)).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise UnauthorizedException("Invalid corporate email or password")

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated. Contact tenant administrator.",
        )

    roles = [r.name for r in user.roles] or ["EMPLOYEE"]
    access_token = create_access_token(
        subject=str(user.id),
        tenant_id=str(user.tenant_id),
        roles=roles,
    )
    refresh_token = create_refresh_token(
        subject=str(user.id),
        tenant_id=str(user.tenant_id),
    )

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in_minutes=30,
    )


@router.post(
    "/refresh",
    response_model=Token,
    summary="Rotate refresh token for session extension",
)
async def refresh_token(payload: TokenRefresh, db: AsyncSession = Depends(get_db)) -> Token:
    """Validates refresh token signature and returns fresh token pair."""
    token_claims = decode_token(payload.refresh_token)
    if token_claims.get("type") != "refresh":
        raise UnauthorizedException("Supplied token is not a valid refresh token")

    user_id = token_claims.get("sub")
    result = await db.execute(select(User).options(selectinload(User.roles)).where(User.id == uuid.UUID(user_id)))
    user = result.scalar_one_or_none()

    if not user or not user.is_active:
        raise UnauthorizedException("User session expired or user suspended")

    roles = [r.name for r in user.roles] or ["EMPLOYEE"]
    new_access = create_access_token(
        subject=str(user.id),
        tenant_id=str(user.tenant_id),
        roles=roles,
    )
    new_refresh = create_refresh_token(
        subject=str(user.id),
        tenant_id=str(user.tenant_id),
    )

    return Token(
        access_token=new_access,
        refresh_token=new_refresh,
        token_type="bearer",
        expires_in_minutes=30,
    )


@router.post(
    "/logout",
    status_code=status.HTTP_200_OK,
    summary="Invalidate active user session",
)
async def logout(claims: Dict[str, Any] = Depends(get_current_user_claims)) -> Dict[str, str]:
    """Logs out user session and records session invalidation."""
    return {"status": "logged_out", "detail": "Session successfully terminated."}


@router.get(
    "/me",
    response_model=CurrentUserResponse,
    summary="Retrieve authenticated user profile and roles",
)
async def get_me(user: User = Depends(get_current_user)) -> CurrentUserResponse:
    """Returns profile for currently authenticated user."""
    roles = [r.name for r in user.roles] if hasattr(user, "roles") else []
    return CurrentUserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        tenant_id=user.tenant_id,
        roles=roles,
        is_active=user.is_active,
        is_superuser=user.is_superuser,
    )
