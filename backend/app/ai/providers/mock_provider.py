"""Deterministic Mock LLM Provider for unit tests, offline development, and CI."""

import asyncio
import re
from typing import AsyncGenerator, Dict, List, Optional

from app.ai.providers.base import BaseLLMProvider
from app.ai.schemas.intent import ExtractedEntities, IntentClassificationResult, IntentType


class MockLLMProvider(BaseLLMProvider):
    """High-fidelity mock LLM provider simulating GPT-4o conversational outputs."""

    name: str = "mock_llm"

    def __init__(self):
        # Predefined rule heuristics for deterministic intent classification
        self._intent_patterns = [
            (r"\b(hello|hi|hey|good morning|good afternoon|good evening)\b", IntentType.GREETING),
            (r"\b(check in|arrived|here for (?:my|an|the) (?:meeting|appointment)|register visit)\b", IntentType.VISITOR_CHECK_IN),
            (r"\b(check out|leaving|return badge)\b", IntentType.VISITOR_CHECK_OUT),
            (r"\b(book|schedule|reserve).*(appointment|meeting)\b", IntentType.APPOINTMENT_BOOKING),
            (r"\b(status|is.*ready|is my.*here).*(appointment|meeting|host)\b", IntentType.APPOINTMENT_STATUS),
            (
                r"\b(meet|find|looking for|where is)\b.*(rahul|alice|bob|john|sarah|jane|dr\.|mr\.|ms\.)",
                IntentType.EMPLOYEE_LOOKUP,
            ),
            (
                r"\b(engineering|finance|marketing|human resources|hr|sales|legal)\b.*(department|team|floor|office)?",
                IntentType.DEPARTMENT_LOOKUP,
            ),
            (
                r"\b(restroom|bathroom|washroom|elevator|lift|cafeteria|water|exit|stairs)\b",
                IntentType.OFFICE_DIRECTIONS,
            ),
            (r"\b(what is this|who are you|what can you do|help me with)\b", IntentType.GENERAL_QUESTION),
            (r"\b(company|business|office hours|working hours|about us)\b", IntentType.COMPANY_INFORMATION),
            (r"\b(human|real person|staff|agent|receptionist|someone else)\b", IntentType.HUMAN_ASSISTANCE),
            (r"\b(bye|goodbye|thank you|thanks|have a nice day|see you)\b", IntentType.GOODBYE),
        ]

    async def generate_response(
        self,
        messages: List[Dict[str, str]],
        system_prompt: Optional[str] = None,
        temperature: float = 0.3,
        max_tokens: int = 500,
    ) -> str:
        last_message = messages[-1]["content"] if messages else ""
        classification = await self.classify_intent(last_message)

        if classification.is_safety_flagged:
            return "I am exclusively a corporate receptionist assistant. I can only assist with office queries, check-in, or facility navigation."

        if classification.intent == IntentType.GREETING:
            return "Good day! Welcome to our corporate offices. How may I assist you today?"
        elif classification.intent == IntentType.VISITOR_CHECK_IN:
            return "I would be glad to assist with your check-in. Please provide your full name and the host you are visiting."
        elif classification.intent == IntentType.EMPLOYEE_LOOKUP:
            name = classification.entities.person_name or "the requested employee"
            return f"I can help you connect with {name}. Which department do they work in?"
        elif classification.intent == IntentType.DEPARTMENT_LOOKUP:
            dept = classification.entities.department or "that department"
            return f"The {dept} department is located on the 4th floor, accessible via the main elevators."
        elif classification.intent == IntentType.OFFICE_DIRECTIONS:
            return "Restrooms and main elevators are located directly down the hall to your right."
        elif classification.intent == IntentType.HUMAN_ASSISTANCE:
            return "I have flagged your request for front desk staff assistance. A reception representative will be with you shortly."
        elif classification.intent == IntentType.GOODBYE:
            return "Thank you for visiting. Have a wonderful day!"
        else:
            return f"Thank you for contacting reception regarding '{last_message}'. How may I assist further?"

    async def generate_stream(
        self,
        messages: List[Dict[str, str]],
        system_prompt: Optional[str] = None,
        temperature: float = 0.3,
        max_tokens: int = 500,
    ) -> AsyncGenerator[str, None]:
        full_text = await self.generate_response(messages, system_prompt, temperature, max_tokens)
        words = full_text.split()
        for word in words:
            yield word + " "
            await asyncio.sleep(0.01)

    async def classify_intent(self, text: str, context: Optional[str] = None) -> IntentClassificationResult:
        normalized = text.strip().lower()

        # Prompt injection detection
        injection_triggers = ["ignore all previous", "override system", "give me your api key", "pretend to be"]
        if any(trigger in normalized for trigger in injection_triggers):
            return IntentClassificationResult(
                intent=IntentType.UNKNOWN,
                confidence=0.99,
                is_safety_flagged=True,
                proposed_action="DECLINE_AND_REDIRECT",
            )

        # Entity Extraction (regex)
        entities = ExtractedEntities()

        # Name extraction
        name_match = re.search(r"\b(meet|find|with|see|to)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b", text)
        if name_match:
            entities.person_name = name_match.group(2)
        elif "rahul" in normalized:
            entities.person_name = "Rahul"
        elif "alice" in normalized:
            entities.person_name = "Alice"

        # Department extraction
        dept_match = re.search(r"\b(engineering|finance|marketing|human resources|hr|sales|legal)\b", normalized)
        if dept_match:
            entities.department = dept_match.group(1).title()

        # Match intent
        for pattern, intent in self._intent_patterns:
            if re.search(pattern, normalized, re.IGNORECASE):
                confidence = 0.95
                return IntentClassificationResult(
                    intent=intent,
                    confidence=confidence,
                    entities=entities,
                    needs_clarification=False,
                    proposed_action=f"ROUTE_TO_{intent.value}",
                )

        # Low confidence fallback
        return IntentClassificationResult(
            intent=IntentType.UNKNOWN,
            confidence=0.40,
            entities=entities,
            needs_clarification=True,
            clarification_question="I did not quite understand your request. Could you please specify whether you are here for check-in, finding an employee, or office navigation?",
            proposed_action="ASK_CLARIFICATION",
        )
