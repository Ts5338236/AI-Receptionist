"""Conversational Session and Message History ORM models."""

import uuid
from typing import Any, Dict, List, Optional

from sqlalchemy import Float, ForeignKey, Index, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.base import TenantScopedMixin, TimestampMixin, UUIDPrimaryKeyMixin


class Conversation(Base, UUIDPrimaryKeyMixin, TenantScopedMixin, TimestampMixin):
    """A multi-turn conversational session between a kiosk visitor and AI Receptionist."""

    __tablename__ = "conversations"

    kiosk_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    status: Mapped[str] = mapped_column(
        String(50), default="active", nullable=False, index=True
    )  # active, completed, escalated, terminated
    current_intent: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    confidence_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    context_data: Mapped[Dict[str, Any]] = mapped_column(JSONB, default=dict, nullable=False)

    # Relationships
    messages: Mapped[List["ConversationMessage"]] = relationship(
        "ConversationMessage",
        back_populates="conversation",
        cascade="all, delete-orphan",
        order_by="ConversationMessage.created_at",
    )

    __table_args__ = (
        Index("ix_conversations_tenant_status", "tenant_id", "status"),
        Index("ix_conversations_tenant_kiosk", "tenant_id", "kiosk_id"),
    )


class ConversationMessage(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """An individual utterance or system interaction turn within a conversation."""

    __tablename__ = "conversation_messages"

    conversation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("conversations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    sender: Mapped[str] = mapped_column(String(50), nullable=False)  # visitor, receptionist, system
    content: Mapped[str] = mapped_column(Text, nullable=False)
    intent: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    entities: Mapped[Dict[str, Any]] = mapped_column(JSONB, default=dict, nullable=False)
    tool_calls: Mapped[Dict[str, Any]] = mapped_column(JSONB, default=dict, nullable=False)
    latency_ms: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # Relationships
    conversation: Mapped["Conversation"] = relationship("Conversation", back_populates="messages")
