"""Pydantic schemas for User entity and RBAC management."""

import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field


class RoleRead(BaseModel):
    id: uuid.UUID
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True


class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=255)
    phone: Optional[str] = None
    is_active: bool = True


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    role_names: List[str] = Field(default_factory=lambda: ["EMPLOYEE"])
    branch_id: Optional[uuid.UUID] = None


class UserRead(UserBase):
    id: uuid.UUID
    tenant_id: uuid.UUID
    branch_id: Optional[uuid.UUID] = None
    is_superuser: bool
    roles: List[RoleRead] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
