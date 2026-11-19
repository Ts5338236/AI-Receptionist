"""In-memory multi-turn conversational session registry with strict tenant isolation."""

import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from app.ai.schemas.intent import ExtractedEntities, IntentType

logger = logging.getLogger(__name__)


class ConversationSession:
    """Represents the in-memory state of an active visitor conversation."""

    def __init__(self, conversation_id: str, tenant_id: str, kiosk_id: Optional[str] = None):
        self.conversation_id = conversation_id
        self.tenant_id = tenant_id
        self.kiosk_id = kiosk_id or "kiosk-default"
        self.messages: List[Dict[str, Any]] = []
        self.accumulated_entities = ExtractedEntities()
        self.current_intent = IntentType.UNKNOWN
        self.confidence_score = 0.0
        self.is_escalated = False
        self.created_at = datetime.now(timezone.utc)
        self.last_activity_at = datetime.now(timezone.utc)

    def add_message(self, sender: str, content: str, intent: Optional[str] = None) -> None:
        self.last_activity_at = datetime.now(timezone.utc)
        self.messages.append(
            {
                "id": str(uuid.uuid4()),
                "sender": sender,
                "content": content,
                "intent": intent,
                "timestamp": self.last_activity_at.isoformat(),
            }
        )
        # Cap message history to prevent unbounded context growth (last 20 messages)
        if len(self.messages) > 20:
            self.messages = self.messages[-20:]

    def merge_entities(self, new_entities: ExtractedEntities) -> None:
        """Merges new entities into accumulated session memory across conversation turns."""
        if new_entities.person_name:
            self.accumulated_entities.person_name = new_entities.person_name
        if new_entities.department:
            self.accumulated_entities.department = new_entities.department
        if new_entities.appointment_date:
            self.accumulated_entities.appointment_date = new_entities.appointment_date
        if new_entities.appointment_time:
            self.accumulated_entities.appointment_time = new_entities.appointment_time
        if new_entities.visitor_purpose:
            self.accumulated_entities.visitor_purpose = new_entities.visitor_purpose
        if new_entities.company_name:
            self.accumulated_entities.company_name = new_entities.company_name
        if new_entities.branch:
            self.accumulated_entities.branch = new_entities.branch

    def get_history_for_llm(self) -> List[Dict[str, str]]:
        """Formats message history into role-content format for LLM."""
        formatted = []
        for msg in self.messages:
            role = "user" if msg["sender"] == "visitor" else "assistant"
            formatted.append({"role": role, "content": msg["content"]})
        return formatted


class SessionMemoryManager:
    """Thread-safe conversational session manager enforcing tenant boundaries."""

    def __init__(self):
        self._sessions: Dict[str, ConversationSession] = {}

    def get_or_create_session(
        self,
        conversation_id: str,
        tenant_id: str,
        kiosk_id: Optional[str] = None,
    ) -> ConversationSession:
        session = self._sessions.get(conversation_id)
        if session:
            # Enforce tenant isolation
            if session.tenant_id != tenant_id:
                raise PermissionError(f"Cross-tenant access violation: session {conversation_id}")
            return session

        new_session = ConversationSession(
            conversation_id=conversation_id,
            tenant_id=tenant_id,
            kiosk_id=kiosk_id,
        )
        self._sessions[conversation_id] = new_session
        return new_session

    def get_session(self, conversation_id: str, tenant_id: str) -> Optional[ConversationSession]:
        session = self._sessions.get(conversation_id)
        if session and session.tenant_id == tenant_id:
            return session
        return None

    def reset_session(self, conversation_id: str, tenant_id: str) -> bool:
        session = self.get_session(conversation_id, tenant_id)
        if session:
            session.messages.clear()
            session.accumulated_entities = ExtractedEntities()
            session.current_intent = IntentType.UNKNOWN
            session.is_escalated = False
            return True
        return False

    def remove_session(self, conversation_id: str) -> None:
        self._sessions.pop(conversation_id, None)


session_memory = SessionMemoryManager()
