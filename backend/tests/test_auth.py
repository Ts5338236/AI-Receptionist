"""Test suite for authentication, JWT issuance, token rotation, and RBAC."""

from datetime import datetime, timedelta, timezone

import jwt
import pytest
from httpx import AsyncClient

from app.core.config import settings
from app.core.security import JWT_ALGORITHM


@pytest.mark.asyncio
async def test_user_registration_success(client: AsyncClient):
    """Verify tenant and business admin user registration."""
    payload = {
        "email": "ceo@acme-corp.com",
        "password": "SecurePassword123!",
        "full_name": "Alice CEO",
        "tenant_name": "Acme Corporation",
        "tenant_slug": "acme-corp",
    }
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    assert data["expires_in_minutes"] == 30


@pytest.mark.asyncio
async def test_user_registration_duplicate_slug(client: AsyncClient):
    """Verify registration fails with 409 Conflict when tenant slug exists."""
    payload = {
        "email": "admin1@globex.com",
        "password": "SecurePassword123!",
        "full_name": "Bob Admin",
        "tenant_name": "Globex Corp",
        "tenant_slug": "globex",
    }
    r1 = await client.post("/api/v1/auth/register", json=payload)
    assert r1.status_code == 201

    payload2 = {
        "email": "admin2@globex.com",
        "password": "SecurePassword123!",
        "full_name": "Charlie Admin",
        "tenant_name": "Globex Duplicate",
        "tenant_slug": "globex",
    }
    r2 = await client.post("/api/v1/auth/register", json=payload2)
    assert r2.status_code == 409
    assert r2.headers["Content-Type"] == "application/problem+json"


@pytest.mark.asyncio
async def test_user_login_success_and_failure(client: AsyncClient):
    """Verify login authentication with valid and invalid credentials."""
    reg_payload = {
        "email": "lead@initech.com",
        "password": "InitechPassword2026!",
        "full_name": "Peter Gibbons",
        "tenant_name": "Initech Systems",
        "tenant_slug": "initech",
    }
    await client.post("/api/v1/auth/register", json=reg_payload)

    # Valid Login
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "lead@initech.com", "password": "InitechPassword2026!"},
    )
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert "access_token" in token_data

    # Invalid Password Login
    bad_login = await client.post(
        "/api/v1/auth/login",
        json={"email": "lead@initech.com", "password": "WrongPassword!"},
    )
    assert bad_login.status_code == 401
    assert bad_login.headers["Content-Type"] == "application/problem+json"


@pytest.mark.asyncio
async def test_token_refresh_rotation(client: AsyncClient):
    """Verify refresh token rotation mechanism."""
    reg_payload = {
        "email": "dev@stark.com",
        "password": "IronManPassword99!",
        "full_name": "Tony Stark",
        "tenant_name": "Stark Industries",
        "tenant_slug": "stark-industries",
    }
    reg_res = await client.post("/api/v1/auth/register", json=reg_payload)
    refresh_token = reg_res.json()["refresh_token"]

    # Exchange refresh token
    refresh_res = await client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert refresh_res.status_code == 200
    new_tokens = refresh_res.json()
    assert "access_token" in new_tokens
    assert "refresh_token" in new_tokens


@pytest.mark.asyncio
async def test_current_user_profile_and_logout(client: AsyncClient):
    """Verify /auth/me returns identity and /auth/logout accepts session termination."""
    reg_payload = {
        "email": "clark@dailyplanet.com",
        "password": "KryptonSecret123!",
        "full_name": "Clark Kent",
        "tenant_name": "Daily Planet",
        "tenant_slug": "daily-planet",
    }
    reg_res = await client.post("/api/v1/auth/register", json=reg_payload)
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # GET /auth/me
    me_res = await client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    user_info = me_res.json()
    assert user_info["email"] == "clark@dailyplanet.com"
    assert "BUSINESS_ADMIN" in user_info["roles"]

    # POST /auth/logout
    logout_res = await client.post("/api/v1/auth/logout", headers=headers)
    assert logout_res.status_code == 200
    assert logout_res.json()["status"] == "logged_out"


@pytest.mark.asyncio
async def test_expired_token_rejected(client: AsyncClient):
    """Verify expired JWT access tokens are rejected with 401 Unauthorized."""
    expired_time = datetime.now(timezone.utc) - timedelta(hours=2)
    expired_payload = {
        "sub": "00000000-0000-0000-0000-000000000001",
        "tenant_id": "00000000-0000-0000-0000-000000000002",
        "roles": ["EMPLOYEE"],
        "type": "access",
        "exp": expired_time,
    }
    expired_token = jwt.encode(expired_payload, settings.SECRET_KEY, algorithm=JWT_ALGORITHM)

    response = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {expired_token}"},
    )
    assert response.status_code == 401
    assert "expired" in response.json()["detail"].lower()
