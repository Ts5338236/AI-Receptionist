"""Test suite for settings validation and centralized RFC 7807 error formatting."""

import pytest
from httpx import AsyncClient

from app.core.config import settings


def test_settings_initialization():
    """Verify application configuration defaults and properties."""
    assert settings.APP_NAME == "AI Receptionist Enterprise"
    assert settings.API_V1_STR == "/api/v1"
    assert isinstance(settings.BACKEND_CORS_ORIGINS, list)
    assert settings.DB_POOL_SIZE > 0


@pytest.mark.asyncio
async def test_not_found_rfc7807_error(client: AsyncClient):
    """Verify 404 responses conform to RFC 7807 Problem Details structure."""
    response = await client.get("/api/v1/non-existent-route")
    assert response.status_code == 404
    assert response.headers["Content-Type"] == "application/problem+json"
    data = response.json()
    assert data["status"] == 404
    assert data["title"] == "HTTP Error"
    assert "correlation_id" in data
    assert data["instance"] == "/api/v1/non-existent-route"


@pytest.mark.asyncio
async def test_validation_rfc7807_error(client: AsyncClient):
    """Verify 422 unprocessable entity responses conform to RFC 7807 Problem Details."""
    # POST invalid JSON schema to /api/v1/tenants/
    response = await client.post(
        "/api/v1/tenants/",
        json={"invalid_field": "data"},  # Missing required name and slug
    )
    assert response.status_code == 422
    assert response.headers["Content-Type"] == "application/problem+json"
    data = response.json()
    assert data["status"] == 422
    assert data["code"] == "VALIDATION_ERROR"
    assert "details" in data
    assert "validation_errors" in data["details"]
