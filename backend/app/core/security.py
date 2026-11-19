"""Security helpers, API key verification, and tenant context isolation."""

from typing import Optional
from fastapi import Header, HTTPException, Security, status
from fastapi.security import APIKeyHeader

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


async def get_tenant_id_header(x_tenant_id: Optional[str] = Header(None)) -> Optional[str]:
    """Extract tenant ID from request header for multi-tenant tenancy resolution."""
    return x_tenant_id


async def verify_kiosk_api_key(api_key: Optional[str] = Security(api_key_header)) -> Optional[str]:
    """Verify hardware kiosk API key for edge terminal communication."""
    if not api_key:
        return None
    # Future Phase: validate against database kiosk_devices table
    return api_key
