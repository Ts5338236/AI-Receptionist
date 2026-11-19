"""Multi-tenant Organization, Building, and Physical Kiosk Hardware models."""

import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from sqlalchemy import Boolean, DateTime, ForeignKey, Index, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.base import TimestampMixin, UUIDPrimaryKeyMixin


class Tenant(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Enterprise customer tenant organization."""

    __tablename__ = "tenants"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    plan_tier: Mapped[str] = mapped_column(String(50), default="enterprise", nullable=False)
    settings: Mapped[Dict[str, Any]] = mapped_column(JSONB, default=dict, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    buildings: Mapped[List["Building"]] = relationship(
        "Building", back_populates="tenant", cascade="all, delete-orphan"
    )
    kiosks: Mapped[List["KioskDevice"]] = relationship(
        "KioskDevice", back_populates="tenant", cascade="all, delete-orphan"
    )


class Building(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Physical office campus or building location."""

    __tablename__ = "buildings"

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tenants.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    address: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    timezone: Mapped[str] = mapped_column(String(100), default="UTC", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    tenant: Mapped["Tenant"] = relationship("Tenant", back_populates="buildings")
    kiosks: Mapped[List["KioskDevice"]] = relationship(
        "KioskDevice", back_populates="building", cascade="all, delete-orphan"
    )


class KioskDevice(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Registered physical kiosk hardware terminal running the AI receptionist client."""

    __tablename__ = "kiosk_devices"

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tenants.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    building_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("buildings.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    device_code: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    hardware_serial: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="offline", nullable=False)  # online, offline, maintenance
    capabilities: Mapped[Dict[str, Any]] = mapped_column(JSONB, default=dict, nullable=False)
    last_heartbeat_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    tenant: Mapped["Tenant"] = relationship("Tenant", back_populates="kiosks")
    building: Mapped[Optional["Building"]] = relationship("Building", back_populates="kiosks")
