"""Abstract interface for provider-independent Large Language Model engines."""

from abc import ABC, abstractmethod
from typing import AsyncGenerator, Dict, List, Optional

from app.ai.schemas.intent import IntentClassificationResult


class BaseLLMProvider(ABC):
    """Abstract interface for enterprise LLM model access."""

    name: str = "base_llm"

    @abstractmethod
    async def generate_response(
        self,
        messages: List[Dict[str, str]],
        system_prompt: Optional[str] = None,
        temperature: float = 0.3,
        max_tokens: int = 500,
    ) -> str:
        """Generates a complete textual response."""
        pass

    @abstractmethod
    def generate_stream(
        self,
        messages: List[Dict[str, str]],
        system_prompt: Optional[str] = None,
        temperature: float = 0.3,
        max_tokens: int = 500,
    ) -> AsyncGenerator[str, None]:
        """Streams token responses asynchronously."""
        pass

    @abstractmethod
    async def classify_intent(self, text: str, context: Optional[str] = None) -> IntentClassificationResult:
        """Classifies intent and extracts structured entities from visitor utterance."""
        pass
