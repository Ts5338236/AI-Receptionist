"""Structured LangGraph workflow orchestrating conversational intent, tool execution, and response validation."""

import logging
from typing import Literal

from langgraph.graph import END, StateGraph

from app.ai.graph.state import ConversationState
from app.ai.memory.session_memory import session_memory
from app.ai.prompts.receptionist import RECEPTIONIST_RESPONSE_PROMPT
from app.ai.providers import get_llm_provider
from app.ai.schemas.intent import IntentType
from app.ai.tools.registry import tool_registry

logger = logging.getLogger(__name__)


# 1. Node: receive_message
async def receive_message(state: ConversationState) -> ConversationState:
    logger.info("LangGraph node [receive_message] - Session: %s", state["conversation_id"])
    return state


# 2. Node: normalize_input
async def normalize_input(state: ConversationState) -> ConversationState:
    cleaned = state["raw_input"].strip()
    state["normalized_input"] = cleaned
    return state


# 3. Node: load_session_context
async def load_session_context(state: ConversationState) -> ConversationState:
    session = session_memory.get_or_create_session(
        conversation_id=state["conversation_id"],
        tenant_id=state["tenant_id"],
        kiosk_id=state.get("kiosk_id"),
    )
    state["messages"] = session.get_history_for_llm()
    state["extracted_entities"] = session.accumulated_entities
    return state


# 4. Node: classify_intent
async def classify_intent(state: ConversationState) -> ConversationState:
    provider = get_llm_provider()
    context_str = f"Previous entities: {state['extracted_entities'].model_dump_json()}"
    classification = await provider.classify_intent(state["normalized_input"], context=context_str)

    state["intent_result"] = classification
    # Merge newly extracted entities
    session = session_memory.get_or_create_session(
        conversation_id=state["conversation_id"],
        tenant_id=state["tenant_id"],
    )
    session.merge_entities(classification.entities)
    state["extracted_entities"] = session.accumulated_entities

    if classification.is_safety_flagged:
        state["execution_route"] = "safety_violation"
    elif classification.needs_clarification:
        state["execution_route"] = "needs_clarification"
    else:
        state["execution_route"] = "standard"

    return state


# 5. Node: check_required_information
async def check_required_information(state: ConversationState) -> ConversationState:
    intent_res = state["intent_result"]
    if not intent_res:
        return state

    # If employee lookup but no name was ever mentioned, ask for clarification
    if intent_res.intent == IntentType.EMPLOYEE_LOOKUP:
        if not state["extracted_entities"].person_name:
            state["needs_clarification"] = True
            state["execution_route"] = "needs_clarification"
            intent_res.clarification_question = "Whom would you like to meet today? Please tell me their name."

    elif intent_res.intent == IntentType.DEPARTMENT_LOOKUP:
        if not state["extracted_entities"].department:
            state["needs_clarification"] = True
            state["execution_route"] = "needs_clarification"
            intent_res.clarification_question = "Which department are you looking for?"

    return state


# 6. Node: select_action
async def select_action(state: ConversationState) -> ConversationState:
    intent_res = state["intent_result"]
    if not intent_res:
        return state

    intent = intent_res.intent
    entities = state["extracted_entities"]

    if intent == IntentType.EMPLOYEE_LOOKUP:
        state["selected_tool"] = "search_employee"
        state["tool_arguments"] = {
            "name": entities.person_name or "",
            "department": entities.department or "",
        }
    elif intent == IntentType.DEPARTMENT_LOOKUP:
        state["selected_tool"] = "search_department"
        state["tool_arguments"] = {"department": entities.department or ""}
    elif intent == IntentType.COMPANY_INFORMATION:
        state["selected_tool"] = "get_company_information"
        state["tool_arguments"] = {}
    elif intent == IntentType.OFFICE_DIRECTIONS:
        state["selected_tool"] = "get_office_directions"
        state["tool_arguments"] = {"facility": state["normalized_input"]}
    elif intent == IntentType.HUMAN_ASSISTANCE:
        state["selected_tool"] = "request_human_assistance"
        state["tool_arguments"] = {"reason": state["normalized_input"]}
        state["is_escalated"] = True
    elif intent == IntentType.VISITOR_CHECK_IN:
        state["selected_tool"] = "register_visitor"
        state["tool_arguments"] = {"name": entities.person_name or ""}
    elif intent == IntentType.APPOINTMENT_BOOKING:
        state["selected_tool"] = "create_appointment"
        state["tool_arguments"] = {}
    else:
        state["selected_tool"] = None

    return state


# 7. Node: execute_tool
async def execute_tool(state: ConversationState) -> ConversationState:
    tool_name = state["selected_tool"]
    if not tool_name:
        return state

    tool_res = await tool_registry.execute_tool(
        tool_name=tool_name,
        arguments=state["tool_arguments"],
        tenant_id=state["tenant_id"],
        branch_id=state.get("branch_id"),
    )
    state["tool_result"] = tool_res
    return state


# 8. Node: generate_response
async def generate_response(state: ConversationState) -> ConversationState:
    intent_res = state["intent_result"]

    # 1. Safety violation
    if intent_res and intent_res.is_safety_flagged:
        state["response_text"] = (
            "I am an enterprise receptionist assistant. I can only assist with visitor registration, facility navigation, or connecting with employees."
        )
        return state

    # 2. Needs clarification
    if state.get("needs_clarification") and intent_res and intent_res.clarification_question:
        state["response_text"] = intent_res.clarification_question
        return state

    # 3. Tool Result incorporating
    if state.get("tool_result"):
        t_res = state["tool_result"]
        state["response_text"] = t_res.message
        return state

    # 4. Standard conversational reply via LLM Provider
    provider = get_llm_provider()
    history = state["messages"] + [{"role": "user", "content": state["normalized_input"]}]
    reply = await provider.generate_response(
        messages=history,
        system_prompt=RECEPTIONIST_RESPONSE_PROMPT,
    )
    state["response_text"] = reply
    return state


# 9. Node: validate_response
async def validate_response(state: ConversationState) -> ConversationState:
    text = state.get("response_text", "").strip()

    # Guardrail 1: Non-empty response
    if not text:
        state["response_text"] = "Welcome to our offices. How may I assist you today?"

    # Guardrail 2: Excessive length restriction for kiosk voice TTS (clamp to 500 chars)
    if len(text) > 500:
        state["response_text"] = text[:480] + "..."

    # Guardrail 3: Hallucination of unconfirmed tools check
    if state.get("selected_tool") in ["register_visitor", "create_appointment"]:
        t_res = state.get("tool_result")
        if t_res and not t_res.success:
            # Ensure the response explicitly conveys the honest status
            state["response_text"] = t_res.message

    return state


# 10. Node: save_conversation
async def save_conversation(state: ConversationState) -> ConversationState:
    session = session_memory.get_or_create_session(
        conversation_id=state["conversation_id"],
        tenant_id=state["tenant_id"],
    )
    intent_name = state["intent_result"].intent.value if state.get("intent_result") else None
    session.add_message("visitor", state["raw_input"], intent=intent_name)
    session.add_message("receptionist", state["response_text"], intent=intent_name)
    session.is_escalated = state["is_escalated"]
    return state


# 11. Node: deliver_response
async def deliver_response(state: ConversationState) -> ConversationState:
    logger.info(
        "LangGraph flow complete. Session: %s, Intent: %s, Tool: %s",
        state["conversation_id"],
        state["intent_result"].intent if state.get("intent_result") else "NONE",
        state.get("selected_tool"),
    )
    return state


# Router conditional edge
def route_after_classification(state: ConversationState) -> Literal["generate_response", "check_required_information"]:
    if state.get("execution_route") == "safety_violation":
        return "generate_response"
    return "check_required_information"


def route_after_information_check(state: ConversationState) -> Literal["generate_response", "select_action"]:
    if state.get("execution_route") == "needs_clarification":
        return "generate_response"
    return "select_action"


def route_after_tool_selection(state: ConversationState) -> Literal["execute_tool", "generate_response"]:
    if state.get("selected_tool"):
        return "execute_tool"
    return "generate_response"


def build_conversation_graph() -> StateGraph:
    """Builds and compiles the 11-node LangGraph conversational workflow."""
    workflow = StateGraph(ConversationState)

    # Register 11 Nodes
    workflow.add_node("receive_message", receive_message)
    workflow.add_node("normalize_input", normalize_input)
    workflow.add_node("load_session_context", load_session_context)
    workflow.add_node("classify_intent", classify_intent)
    workflow.add_node("check_required_information", check_required_information)
    workflow.add_node("select_action", select_action)
    workflow.add_node("execute_tool", execute_tool)
    workflow.add_node("generate_response", generate_response)
    workflow.add_node("validate_response", validate_response)
    workflow.add_node("save_conversation", save_conversation)
    workflow.add_node("deliver_response", deliver_response)

    # Edges
    workflow.set_entry_point("receive_message")
    workflow.add_edge("receive_message", "normalize_input")
    workflow.add_edge("normalize_input", "load_session_context")
    workflow.add_edge("load_session_context", "classify_intent")

    # Conditional branching
    workflow.add_conditional_edges(
        "classify_intent",
        route_after_classification,
        {
            "generate_response": "generate_response",
            "check_required_information": "check_required_information",
        },
    )

    workflow.add_conditional_edges(
        "check_required_information",
        route_after_information_check,
        {
            "generate_response": "generate_response",
            "select_action": "select_action",
        },
    )

    workflow.add_conditional_edges(
        "select_action",
        route_after_tool_selection,
        {
            "execute_tool": "execute_tool",
            "generate_response": "generate_response",
        },
    )

    workflow.add_edge("execute_tool", "generate_response")
    workflow.add_edge("generate_response", "validate_response")
    workflow.add_edge("validate_response", "save_conversation")
    workflow.add_edge("save_conversation", "deliver_response")
    workflow.add_edge("deliver_response", END)

    return workflow.compile()


conversation_graph = build_conversation_graph()
