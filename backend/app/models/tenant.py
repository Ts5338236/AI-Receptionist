"""Multi-tenant Organization, Branch, and Physical Kiosk Hardware models."""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Any, Dict, List, Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.base import TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.user import User


class Tenant(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Enterprise customer tenant organization."""

    __tablename__ = "tenants"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    plan_tier: Mapped[str] = mapped_column(String(50), default="enterprise", nullable=False)
    settings: Mapped[Dict[str, Any]] = mapped_column(JSONB, default=dict, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    branches: Mapped[List["Branch"]] = relationship(
        "Branch", back_populates="tenant", cascade="all, delete-orphan", lazy="selectin"
    )
    tenant_settings: Mapped[List["TenantSetting"]] = relationship(
        "TenantSetting", back_populates="tenant", cascade="all, delete-orphan", lazy="selectin"
    )
    users: Mapped[List["User"]] = relationship("User", back_populates="tenant", cascade="all, delete-orphan")
    kiosks: Mapped[List["KioskDevice"]] = relationship(
        "KioskDevice", back_populates="tenant", cascade="all, delete-orphan"
    )


class Branch(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Physical office branch location under a tenant."""

    __tablename__ = "branches"

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tenants.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    code: Mapped[str] = mapped_column(String(50), nullable=False)
    address: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    country: Mapped[Optional[str]] = mapped_column(String(100), default="US", nullable=True)
    timezone: Mapped[str] = mapped_column(String(100), default="UTC", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    tenant: Mapped["Tenant"] = relationship("Tenant", back_populates="branches")
    kiosks: Mapped[List["KioskDevice"]] = relationship(
        "KioskDevice", back_populates="branch", cascade="all, delete-orphan"
    )

    __table_args__ = (UniqueConstraint("tenant_id", "code", name="uq_branches_tenant_id_code"),)


class TenantSetting(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Granular per-tenant configuration and feature toggles."""

    __tablename__ = "tenant_settings"

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tenants.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    key: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    value: Mapped[Dict[str, Any]] = mapped_column(JSONB, default=dict, nullable=False)
    is_encrypted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    tenant: Mapped["Tenant"] = relationship("Tenant", back_populates="tenant_settings")

    __table_args__ = (UniqueConstraint("tenant_id", "key", name="uq_tenant_settings_tenant_id_key"),)


class KioskDevice(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Registered physical kiosk hardware terminal running the AI receptionist client."""

    __tablename__ = "kiosk_devices"

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tenants.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    branch_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("branches.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    device_code: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    hardware_serial: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="offline", nullable=False)
    capabilities: Mapped[Dict[str, Any]] = mapped_column(JSONB, default=dict, nullable=False)
    last_heartbeat_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    tenant: Mapped["Tenant"] = relationship("Tenant", back_populates="kiosks")
    branch: Mapped[Optional["Branch"]] = relationship("Branch", back_populates="kiosks")
