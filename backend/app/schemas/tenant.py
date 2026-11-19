"""Pydantic schemas for Multi-tenant and Kiosk Device representations."""

import uuid
from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, Field


class TenantBase(BaseModel):
    name: str = Field(..., max_length=255)
    slug: str = Field(..., max_length=100)
    plan_tier: str = Field(default="enterprise")
    settings: Dict[str, Any] = Field(default_factory=dict)
    is_active: bool = True


class TenantCreate(TenantBase):
    pass


class TenantRead(TenantBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class KioskDeviceBase(BaseModel):
    device_code: str
    name: str
    hardware_serial: Optional[str] = None
    status: str = "offline"
    capabilities: Dict[str, Any] = Field(default_factory=dict)
    is_active: bool = True


class KioskDeviceRead(KioskDeviceBase):
    id: uuid.UUID
    tenant_id: uuid.UUID
    building_id: Optional[uuid.UUID] = None
    ip_address: Optional[str] = None
    last_heartbeat_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
