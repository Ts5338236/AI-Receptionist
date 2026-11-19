"""Test suite for Multi-Tenant Scoping, Isolation, and User Management."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_tenant_user_management_and_isolation(client: AsyncClient):
    """Verify tenant isolation and user provisioning strictly scoped to tenant."""
    # 1. Register Tenant A
    reg_a = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "admin@org-a.com",
            "password": "Password1234!",
            "full_name": "Admin Org A",
            "tenant_name": "Organization A",
            "tenant_slug": "org-a",
        },
    )
    assert reg_a.status_code == 201
    token_a = reg_a.json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # 2. Register Tenant B
    reg_b = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "admin@org-b.com",
            "password": "Password1234!",
            "full_name": "Admin Org B",
            "tenant_name": "Organization B",
            "tenant_slug": "org-b",
        },
    )
    assert reg_b.status_code == 201
    token_b = reg_b.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # 3. Create a receptionist user in Tenant A
    create_user_res = await client.post(
        "/api/v1/users/",
        headers=headers_a,
        json={
            "email": "receptionist1@org-a.com",
            "full_name": "Rita Receptionist",
            "password": "ReceptionPassword1!",
            "role_names": ["RECEPTIONIST"],
        },
    )
    assert create_user_res.status_code == 201
    created_user = create_user_res.json()
    assert created_user["email"] == "receptionist1@org-a.com"

    # 4. List users for Tenant A: should have 2 users (Admin Org A, Rita Receptionist)
    list_a = await client.get("/api/v1/users/", headers=headers_a)
    assert list_a.status_code == 200
    users_a = list_a.json()
    assert len(users_a) == 2
    emails_a = [u["email"] for u in users_a]
    assert "receptionist1@org-a.com" in emails_a
    assert "admin@org-a.com" in emails_a

    # 5. List users for Tenant B: should only have Tenant B's admin (NO cross-tenant leak!)
    list_b = await client.get("/api/v1/users/", headers=headers_b)
    assert list_b.status_code == 200
    users_b = list_b.json()
    assert len(users_b) == 1
    assert users_b[0]["email"] == "admin@org-b.com"

    # 6. Cross-Tenant Direct Query Attempt:
    # Caller B attempts to query Tenant A by ID -> Must receive 403 Forbidden!
    tenant_a_info = await client.get("/api/v1/tenants/me", headers=headers_a)
    tenant_a_id = tenant_a_info.json()["id"]

    cross_tenant_res = await client.get(f"/api/v1/tenants/{tenant_a_id}", headers=headers_b)
    assert cross_tenant_res.status_code == 403
    assert cross_tenant_res.headers["Content-Type"] == "application/problem+json"


@pytest.mark.asyncio
async def test_get_current_tenant_me(client: AsyncClient):
    """Verify /tenants/me returns details of the caller's authorized tenant."""
    reg = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "admin@quantum.com",
            "password": "QuantumPassword123!",
            "full_name": "Dr. Quantum",
            "tenant_name": "Quantum Dynamics",
            "tenant_slug": "quantum-dyn",
        },
    )
    token = reg.json()["access_token"]
    res = await client.get("/api/v1/tenants/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert data["slug"] == "quantum-dyn"
    assert data["name"] == "Quantum Dynamics"
