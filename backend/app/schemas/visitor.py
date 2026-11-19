"""Pydantic schemas for Visitor and Session representations."""

import uuid
from datetime import datetime
from typing import Any, Dict, Optional
from pydantic import BaseModel, EmailStr, Field


class VisitorBase(BaseModel):
    full_name: str = Field(..., max_length=255)
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    is_vip: bool = False
    custom_fields: Dict[str, Any] = Field(default_factory=dict)


class VisitorCreate(VisitorBase):
    pass


class VisitorRead(VisitorBase):
    id: uuid.UUID
    tenant_id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True


class VisitorSessionRead(BaseModel):
    id: uuid.UUID
    tenant_id: uuid.UUID
    visitor_id: uuid.UUID
    kiosk_device_id: Optional[uuid.UUID] = None
    host_name: str
    host_email: Optional[str] = None
    host_notified: bool
    purpose_of_visit: str
    badge_printed: bool
    checkin_status: str
    checkin_time: datetime
    checkout_time: Optional[datetime] = None

    class Config:
        from_attributes = True
