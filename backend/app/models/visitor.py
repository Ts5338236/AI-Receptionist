"""Visitor profiles and check-in interaction session models."""

import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from sqlalchemy import Boolean, DateTime, ForeignKey, Index, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.base import TenantScopedMixin, TimestampMixin, UUIDPrimaryKeyMixin


class Visitor(Base, UUIDPrimaryKeyMixin, TenantScopedMixin, TimestampMixin):
    """Visitor profile record (returning visitor recognition support)."""

    __tablename__ = "visitors"

    full_name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, index=True)
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, index=True)
    company: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_vip: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    custom_fields: Mapped[Dict[str, Any]] = mapped_column(JSONB, default=dict, nullable=False)

    # Relationships
    sessions: Mapped[List["VisitorSession"]] = relationship(
        "VisitorSession", back_populates="visitor", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_visitors_tenant_email", "tenant_id", "email"),
        Index("ix_visitors_tenant_phone", "tenant_id", "phone"),
    )


class VisitorSession(Base, UUIDPrimaryKeyMixin, TenantScopedMixin, TimestampMixin):
    """A single visit check-in occurrence at a kiosk."""

    __tablename__ = "visitor_sessions"

    visitor_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("visitors.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    kiosk_device_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("kiosk_devices.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    host_name: Mapped[str] = mapped_column(String(255), nullable=False)
    host_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    host_notified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    purpose_of_visit: Mapped[str] = mapped_column(String(255), nullable=False)
    badge_printed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    checkin_status: Mapped[str] = mapped_column(
        String(50), default="checked_in", nullable=False
    )  # checked_in, checked_out, scheduled, cancelled
    checkin_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    checkout_time: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    session_metadata: Mapped[Dict[str, Any]] = mapped_column(JSONB, default=dict, nullable=False)

    # Relationships
    visitor: Mapped["Visitor"] = relationship("Visitor", back_populates="sessions")
