# PHASE 5: AI CONVERSATION ENGINE ARCHITECTURE

**Product:** AI Receptionist Enterprise  
**Subsystem:** Conversational AI, Intent Classification, LangGraph Workflow & Memory Subsystem  
**Lead Engineer:** Senior AI Engineer, LLM Architect & Enterprise Conversational Specialist  
**Status:** Completed & Integrated  

---

## 1. Executive Summary

Phase 5 establishes the cognitive intelligence of the AI Virtual Receptionist Kiosk. Operating on a structured, deterministic LangGraph workflow, the engine understands natural language visitor utterances, extracts typed entities, maintains multi-turn session memory with strict tenant isolation, queries approved enterprise tools, asks clarifying questions when information is ambiguous, escalates to human front desk staff when appropriate, and rigorously validates all responses before speaking through the Phase 4 voice pipeline.

---

## 2. End-to-End Conversational Pipeline

The conversation engine operates as an 11-stage cyclical state graph:

```
[Visitor Input: Speech Transcript or On-Screen Keyboard]
                           │
                           ▼
               1. receive_message
                           │
                           ▼
               2. normalize_input (Sanitization, whitespace stripping)
                           │
                           ▼
               3. load_session_context (In-memory & DB multi-turn memory)
                           │
                           ▼
               4. classify_intent (14-intent taxonomy + Entity extraction)
                           │
          ┌────────────────┴────────────────┐
          ▼ (Safety violation)              ▼ (Valid intent)
  [generate_response]        5. check_required_information
                                            │
                          ┌─────────────────┴─────────────────┐
                          ▼ (Missing entity)                  ▼ (Complete)
                  [generate_response]                 6. select_action
                 (Clarifying question)                        │
                                            ┌─────────────────┴─────────────────┐
                                            ▼ (Tool required)                   ▼ (No tool)
                                     7. execute_tool                  [generate_response]
                                            │                                   │
                                            └─────────────────┬─────────────────┘
                                                              ▼
                                                     8. generate_response
                                                              │
                                                              ▼
                                                     9. validate_response
                                                              │
                                                              ▼
                                                    10. save_conversation
                                                              │
                                                              ▼
                                                    11. deliver_response
                                                              │
                                                              ▼
                             [WebSocket Audio Stream / REST Response Delivery]
```

---

## 3. LLM Provider Architecture

The LLM abstraction is defined by `BaseLLMProvider` (`backend/app/ai/providers/base.py`) providing a decoupled, vendor-neutral contract:

### 3.1 Supported Providers
1. **`OpenAILLMProvider` (`backend/app/ai/providers/openai_provider.py`):**
   - Direct async HTTP communication via `httpx` targeting OpenAI's `https://api.openai.com/v1/chat/completions`.
   - Default Model: `gpt-4o` (configurable via `OPENAI_MODEL` in `.env`).
   - Supports streaming completions, temperature tuning (`0.3`), and structured JSON response formats.
   - Automatically degrades gracefully to `MockLLMProvider` when `OPENAI_API_KEY` is not configured.
2. **`MockLLMProvider` (`backend/app/ai/providers/mock_provider.py`):**
   - High-fidelity, deterministic conversational simulator for CI testing, offline development, and zero-token testing.
   - Accurately classifies all 14 intents, extracts names and departments, and respects safety guardrails.

---

## 4. LangGraph Workflow Specification

The state graph is compiled using LangGraph (`backend/app/ai/graph/workflow.py`) with `ConversationState` tracking mutable state:

| Node | Responsibility | Failure/Alternative Route |
|:---|:---|:---|
| `receive_message` | Entry point registering correlation ID and timestamp | Passes directly to normalization |
| `normalize_input` | Strips leading/trailing whitespace, cleans unicode anomalies | Passes to context loading |
| `load_session_context` | Fetches historical turns and accumulated entities under tenant ID | Creates new session if none exists |
| `classify_intent` | Evaluates utterance against the 14-intent taxonomy and extracts entities | Routes to `generate_response` on safety violation |
| `check_required_information` | Validates presence of mandatory entities (e.g. employee name) | Routes to `generate_response` with clarification question |
| `select_action` | Maps intent to approved business tool in `ToolRegistry` | Routes directly to response generation if no tool needed |
| `execute_tool` | Dispatches tool with tenant and branch scoping | Captures `ToolResult` status without throwing unhandled exceptions |
| `generate_response` | Generates receptionist response via LLM persona or verified tool data | Produces clear fallback if model fails |
| `validate_response` | Clamps length (500 chars), prevents empty outputs, verifies honesty | Replaces hallucinated success with tool status message |
| `save_conversation` | Persists visitor and receptionist messages to memory | Maintains last 20 turns ceiling |
| `deliver_response` | Terminal node emitting final compiled state | Output delivered to REST/WebSocket |

---

## 5. Intent Taxonomy & Entity Extraction

### 5.1 Approved 14-Intent Taxonomy
1. **`GREETING`:** Welcoming polite phrases ("Hello", "Good morning").
2. **`GENERAL_QUESTION`:** General queries regarding the kiosk or facilities.
3. **`COMPANY_INFORMATION`:** Company overview, operating hours, visitor policies.
4. **`VISITOR_CHECK_IN`:** Visitor arrival registration.
5. **`VISITOR_CHECK_OUT`:** Departure and badge return.
6. **`APPOINTMENT_BOOKING`:** Scheduling meeting slots.
7. **`APPOINTMENT_STATUS`:** Checking appointment readiness or host status.
8. **`EMPLOYEE_LOOKUP`:** Locating an employee by name or role.
9. **`DEPARTMENT_LOOKUP`:** Finding department floor assignments and wings.
10. **`OFFICE_DIRECTIONS`:** Navigation to restrooms, elevators, cafeterias, exits.
11. **`CONTACT_RECEPTION`:** Front desk contact info.
12. **`HUMAN_ASSISTANCE`:** Explicit request for human staff.
13. **`GOODBYE`:** Polite departure utterances.
14. **`UNKNOWN`:** Unintelligible queries or out-of-scope requests.

### 5.2 Structured Entity Schema (`ExtractedEntities`)
- `person_name`: Host or employee full name (e.g., "Rahul Sharma").
- `department`: Corporate unit (e.g., "Engineering", "Finance").
- `appointment_date`: Formatted `YYYY-MM-DD`.
- `appointment_time`: Formatted `HH:MM`.
- `visitor_purpose`: Declared visit motivation.
- `company_name`: Visitor's affiliated organization.
- `branch`: Target office branch.

---

## 6. Secure Tool Registry (`backend/app/ai/tools/registry.py`)

Tools operate outside the LLM reasoning loop with strict parameter validation and tenant isolation:

| Tool Name | Parameters | Behavior & Disclosure |
|:---|:---|:---|
| **`search_employee`** | `name`, `department` | Queries verified directory; returns floor, office suite, and role. |
| **`search_department`** | `department` | Returns exact building floor and wing location. |
| **`get_company_information`** | *(none)* | Returns official operating hours and visitor check-in policies. |
| **`get_office_directions`** | `facility` | Returns verified turn-by-turn directions to restrooms, elevators, etc. |
| **`check_appointment_availability`** | `host_name`, `date` | Returns `NOT_IMPLEMENTED` (Direct calendar integration scheduled for Phase 8). |
| **`create_appointment`** | `host_name`, `time` | Returns `NOT_IMPLEMENTED` with confirmation prompt (Phase 8). |
| **`register_visitor`** | `name`, `company` | Returns `NOT_IMPLEMENTED` directing visitor to on-screen Check-In (Phase 7). |
| **`request_human_assistance`** | `reason` | Dispatches staff notification and returns confirmation that personnel are alerted. |

---

## 7. Multi-Turn Session Memory & Tenant Isolation

1. **Accumulated Entities:** When a visitor mentions their host's name in Turn 1 ("I want to see Rahul") and their department in Turn 2 ("In Engineering"), `SessionMemoryManager` merges both entities into the ongoing session.
2. **Tenant Boundary Enforcement:** Every session is strictly anchored to `tenant_id`. Any attempt to access a session with a mismatched tenant identifier raises an immediate `PermissionError` (403/404).
3. **Turn Limits & Cleanup:** Contexts are bounded to the last 20 messages to prevent token explosion and ensure rapid response generation.

---

## 8. Prompt Security & Guardrails

All prompt templates (`backend/app/ai/prompts/`) adhere to defense-in-depth security:
- **Persona Preservation:** The AI identifies strictly as an Enterprise Receptionist.
- **Prompt Injection Defense:** Explicit rejection of "ignore all previous instructions" or system prompt disclosure attempts.
- **Factual Honesty:** Never fabricates company policies or claims an action succeeded when a tool returned `NOT_IMPLEMENTED` or `FAILED`.
