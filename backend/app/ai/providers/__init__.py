"""LLM Provider factory and exports."""

from app.ai.providers.base import BaseLLMProvider
from app.ai.providers.mock_provider import MockLLMProvider
from app.ai.providers.openai_provider import OpenAILLMProvider
from app.core.config import settings


def get_llm_provider() -> BaseLLMProvider:
    """Returns the configured LLM provider instance."""
    provider_type = settings.LLM_PROVIDER.lower()
    if provider_type == "openai":
        return OpenAILLMProvider()
    elif provider_type == "mock":
        return MockLLMProvider()
    return OpenAILLMProvider()


__all__ = ["BaseLLMProvider", "OpenAILLMProvider", "MockLLMProvider", "get_llm_provider"]
