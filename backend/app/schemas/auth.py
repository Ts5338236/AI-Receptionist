"""Pydantic schemas for Authentication and Token exchange."""

import uuid
from typing import List

from pydantic import BaseModel, EmailStr, Field


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, description="Minimum 8 characters password")
    full_name: str = Field(..., min_length=2, max_length=255)
    tenant_name: str = Field(..., min_length=2, max_length=255, description="Initial organization name")
    tenant_slug: str = Field(..., min_length=2, max_length=100, description="URL-friendly identifier")


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in_minutes: int = 30


class TokenRefresh(BaseModel):
    refresh_token: str


class CurrentUserResponse(BaseModel):
    id: uuid.UUID
    email: EmailStr
    full_name: str
    tenant_id: uuid.UUID
    roles: List[str]
    is_active: bool
    is_superuser: bool

    class Config:
        from_attributes = True
