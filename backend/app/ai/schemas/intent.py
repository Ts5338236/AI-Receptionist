"""Intent taxonomy, entity extraction models, and classification schemas."""

from enum import Enum
from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class IntentType(str, Enum):
    GREETING = "GREETING"
    GENERAL_QUESTION = "GENERAL_QUESTION"
    COMPANY_INFORMATION = "COMPANY_INFORMATION"
    VISITOR_CHECK_IN = "VISITOR_CHECK_IN"
    VISITOR_CHECK_OUT = "VISITOR_CHECK_OUT"
    APPOINTMENT_BOOKING = "APPOINTMENT_BOOKING"
    APPOINTMENT_STATUS = "APPOINTMENT_STATUS"
    EMPLOYEE_LOOKUP = "EMPLOYEE_LOOKUP"
    DEPARTMENT_LOOKUP = "DEPARTMENT_LOOKUP"
    OFFICE_DIRECTIONS = "OFFICE_DIRECTIONS"
    CONTACT_RECEPTION = "CONTACT_RECEPTION"
    HUMAN_ASSISTANCE = "HUMAN_ASSISTANCE"
    GOODBYE = "GOODBYE"
    UNKNOWN = "UNKNOWN"


class ExtractedEntities(BaseModel):
    """Structured entities extracted from visitor utterance."""

    person_name: Optional[str] = Field(default=None, description="Name of employee or visitor")
    department: Optional[str] = Field(default=None, description="Company department name")
    appointment_date: Optional[str] = Field(default=None, description="Target appointment date (YYYY-MM-DD)")
    appointment_time: Optional[str] = Field(default=None, description="Target appointment time (HH:MM)")
    visitor_purpose: Optional[str] = Field(default=None, description="Declared purpose of visit")
    company_name: Optional[str] = Field(default=None, description="Visitor's affiliated company")
    branch: Optional[str] = Field(default=None, description="Office branch location")
    contact_preference: Optional[str] = Field(default=None, description="Email, phone or in-person")
    extra_attributes: Dict[str, str] = Field(default_factory=dict)


class IntentClassificationResult(BaseModel):
    """Result emitted by the Intent Classification Engine."""

    intent: IntentType = Field(default=IntentType.UNKNOWN)
    confidence: float = Field(ge=0.0, le=1.0, default=0.5)
    entities: ExtractedEntities = Field(default_factory=ExtractedEntities)
    missing_required_information: List[str] = Field(default_factory=list)
    needs_clarification: bool = False
    clarification_question: Optional[str] = None
    proposed_action: Optional[str] = None
    is_safety_flagged: bool = False
