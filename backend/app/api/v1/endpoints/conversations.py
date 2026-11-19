"""Conversational AI REST API endpoints powered by LangGraph."""

import time
import uuid
from typing import Optional

from fastapi import APIRouter, HTTPException, Query, status

from app.ai.graph.state import ConversationState
from app.ai.graph.workflow import conversation_graph
from app.ai.memory.session_memory import session_memory
from app.ai.schemas.conversation import (
    ConversationDetailResponse,
    ConversationMessageRequest,
    ConversationMessageResponse,
    CreateConversationRequest,
    MessageItem,
)
from app.ai.schemas.intent import ExtractedEntities, IntentType

router = APIRouter()


@router.post(
    "",
    response_model=ConversationDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new conversation session",
)
async def create_conversation(
    payload: CreateConversationRequest,
    tenant_id: Optional[str] = Query("00000000-0000-0000-0000-000000000001"),
):
    """Initializes a new conversational session for a kiosk visitor."""
    conv_id = f"conv_{uuid.uuid4().hex[:12]}"
    session = session_memory.get_or_create_session(
        conversation_id=conv_id,
        tenant_id=tenant_id or "default-tenant",
        kiosk_id=payload.kiosk_id,
    )

    return ConversationDetailResponse(
        conversation_id=session.conversation_id,
        tenant_id=session.tenant_id,
        kiosk_id=session.kiosk_id,
        status="active",
        current_intent=None,
        messages=[],
        created_at=session.created_at,
        updated_at=session.last_activity_at,
    )


@router.post(
    "/{conversation_id}/messages",
    response_model=ConversationMessageResponse,
    summary="Send a message to the AI receptionist and run the LangGraph workflow",
)
async def send_message(
    conversation_id: str,
    payload: ConversationMessageRequest,
    tenant_id: Optional[str] = Query("00000000-0000-0000-0000-000000000001"),
):
    """Processes a visitor message through the LangGraph workflow and returns the response."""
    start_time = time.perf_counter()
    resolved_tenant = tenant_id or "default-tenant"

    initial_state: ConversationState = {
        "conversation_id": conversation_id,
        "tenant_id": resolved_tenant,
        "branch_id": None,
        "kiosk_id": "kiosk-default-01",
        "raw_input": payload.message,
        "normalized_input": payload.message,
        "messages": [],
        "intent_result": None,
        "extracted_entities": ExtractedEntities(),
        "selected_tool": None,
        "tool_arguments": {},
        "tool_result": None,
        "response_text": "",
        "validation_error": None,
        "is_escalated": False,
        "needs_clarification": False,
        "execution_route": "standard",
    }

    try:
        final_state = await conversation_graph.ainvoke(initial_state)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"LangGraph execution failed: {str(exc)}",
        )

    latency_ms = (time.perf_counter() - start_time) * 1000.0
    intent_result = final_state.get("intent_result")

    return ConversationMessageResponse(
        conversation_id=conversation_id,
        reply=final_state.get("response_text", "How may I assist you today?"),
        intent=intent_result.intent if intent_result else IntentType.UNKNOWN,
        confidence=intent_result.confidence if intent_result else 0.5,
        entities=final_state.get("extracted_entities", ExtractedEntities()),
        needs_clarification=final_state.get("needs_clarification", False),
        is_escalated=final_state.get("is_escalated", False),
        tool_executed=final_state.get("selected_tool"),
        latency_ms=round(latency_ms, 2),
    )


@router.get(
    "/{conversation_id}",
    response_model=ConversationDetailResponse,
    summary="Get conversation details and message history",
)
async def get_conversation(
    conversation_id: str,
    tenant_id: Optional[str] = Query("00000000-0000-0000-0000-000000000001"),
):
    """Retrieves session details and chronological message history."""
    resolved_tenant = tenant_id or "default-tenant"
    session = session_memory.get_session(conversation_id, resolved_tenant)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation session '{conversation_id}' not found.",
        )

    messages_list = [
        MessageItem(
            id=m["id"],
            sender=m["sender"],
            content=m["content"],
            intent=m.get("intent"),
            created_at=session.created_at,
        )
        for m in session.messages
    ]

    return ConversationDetailResponse(
        conversation_id=session.conversation_id,
        tenant_id=session.tenant_id,
        kiosk_id=session.kiosk_id,
        status="escalated" if session.is_escalated else "active",
        current_intent=session.current_intent.value if session.current_intent else None,
        messages=messages_list,
        created_at=session.created_at,
        updated_at=session.last_activity_at,
    )


@router.post(
    "/{conversation_id}/reset",
    summary="Reset conversation history and memory",
)
async def reset_conversation(
    conversation_id: str,
    tenant_id: Optional[str] = Query("00000000-0000-0000-0000-000000000001"),
):
    """Clears message history and accumulated entities for a session."""
    resolved_tenant = tenant_id or "default-tenant"
    success = session_memory.reset_session(conversation_id, resolved_tenant)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation '{conversation_id}' not found.",
        )
    return {"status": "reset_successful", "conversation_id": conversation_id}


@router.post(
    "/{conversation_id}/end",
    summary="Terminate conversation",
)
async def end_conversation(
    conversation_id: str,
    tenant_id: Optional[str] = Query("00000000-0000-0000-0000-000000000001"),
):
    """Terminates session and purges in-memory records."""
    resolved_tenant = tenant_id or "default-tenant"
    session = session_memory.get_session(conversation_id, resolved_tenant)
    if session:
        session_memory.remove_session(conversation_id)
    return {"status": "terminated", "conversation_id": conversation_id}
