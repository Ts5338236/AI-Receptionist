"""Pydantic schemas for the Conversation REST API."""

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field

from app.ai.schemas.intent import ExtractedEntities, IntentType


class CreateConversationRequest(BaseModel):
    kiosk_id: Optional[str] = "kiosk-default-01"
    language: str = "en-US"
    metadata: Dict[str, Any] = Field(default_factory=dict)


class ConversationMessageRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000, description="Visitor query or speech transcript")
    language: Optional[str] = "en-US"
    metadata: Dict[str, Any] = Field(default_factory=dict)


class MessageItem(BaseModel):
    id: str
    sender: str  # visitor, receptionist, system
    content: str
    intent: Optional[str] = None
    created_at: datetime


class ConversationMessageResponse(BaseModel):
    conversation_id: str
    reply: str
    intent: IntentType
    confidence: float
    entities: ExtractedEntities
    needs_clarification: bool
    is_escalated: bool
    tool_executed: Optional[str] = None
    latency_ms: float


class ConversationDetailResponse(BaseModel):
    conversation_id: str
    tenant_id: str
    kiosk_id: Optional[str]
    status: str
    current_intent: Optional[str]
    messages: List[MessageItem]
    created_at: datetime
    updated_at: datetime
