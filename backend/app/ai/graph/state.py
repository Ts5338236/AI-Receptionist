"""LangGraph state representation for conversational flow."""

from typing import Any, Dict, List, Optional, TypedDict

from app.ai.schemas.intent import ExtractedEntities, IntentClassificationResult
from app.ai.tools.base import ToolResult


class ConversationState(TypedDict):
    """The central state dictionary transitioned across LangGraph nodes."""

    conversation_id: str
    tenant_id: str
    branch_id: Optional[str]
    kiosk_id: Optional[str]

    raw_input: str
    normalized_input: str
    messages: List[Dict[str, str]]

    intent_result: Optional[IntentClassificationResult]
    extracted_entities: ExtractedEntities

    selected_tool: Optional[str]
    tool_arguments: Dict[str, Any]
    tool_result: Optional[ToolResult]

    response_text: str
    validation_error: Optional[str]
    is_escalated: bool
    needs_clarification: bool
    execution_route: str
