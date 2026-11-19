"""OpenAI API provider adapter for GPT-4o conversational completions."""

import json
import logging
from typing import AsyncGenerator, Dict, List, Optional

import httpx

from app.ai.prompts.intent import INTENT_CLASSIFICATION_PROMPT
from app.ai.prompts.system import SYSTEM_SECURITY_PROMPT
from app.ai.providers.base import BaseLLMProvider
from app.ai.providers.mock_provider import MockLLMProvider
from app.ai.schemas.intent import IntentClassificationResult
from app.core.config import settings

logger = logging.getLogger(__name__)


class OpenAILLMProvider(BaseLLMProvider):
    """OpenAI API provider supporting GPT-4o chat completions and structured intent extraction."""

    name: str = "openai"

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or settings.OPENAI_API_KEY
        self.model = model or settings.OPENAI_MODEL
        self.temperature = settings.OPENAI_TEMPERATURE
        self.max_tokens = settings.OPENAI_MAX_TOKENS
        self._mock_fallback = MockLLMProvider()

    async def generate_response(
        self,
        messages: List[Dict[str, str]],
        system_prompt: Optional[str] = None,
        temperature: float = 0.3,
        max_tokens: int = 500,
    ) -> str:
        if not self.api_key:
            logger.warning("OPENAI_API_KEY is not configured. Falling back to MockLLMProvider.")
            return await self._mock_fallback.generate_response(messages, system_prompt, temperature, max_tokens)

        sys_msg = system_prompt or SYSTEM_SECURITY_PROMPT
        payload_messages = [{"role": "system", "content": sys_msg}] + messages

        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        data = {
            "model": self.model,
            "messages": payload_messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }

        try:
            async with httpx.AsyncClient(timeout=settings.LLM_REQUEST_TIMEOUT_SECONDS) as client:
                res = await client.post(url, headers=headers, json=data)
                if res.status_code != 200:
                    logger.error("OpenAI API HTTP %d: %s. Using mock fallback.", res.status_code, res.text)
                    return await self._mock_fallback.generate_response(messages, system_prompt, temperature, max_tokens)

                result = res.json()
                content = result["choices"][0]["message"]["content"]
                return content.strip()
        except Exception as exc:
            logger.error("OpenAI completion failed: %s. Falling back to mock.", exc)
            return await self._mock_fallback.generate_response(messages, system_prompt, temperature, max_tokens)

    async def generate_stream(
        self,
        messages: List[Dict[str, str]],
        system_prompt: Optional[str] = None,
        temperature: float = 0.3,
        max_tokens: int = 500,
    ) -> AsyncGenerator[str, None]:
        if not self.api_key:
            async for chunk in self._mock_fallback.generate_stream(messages, system_prompt, temperature, max_tokens):
                yield chunk
            return

        sys_msg = system_prompt or SYSTEM_SECURITY_PROMPT
        payload_messages = [{"role": "system", "content": sys_msg}] + messages

        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        data = {
            "model": self.model,
            "messages": payload_messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": True,
        }

        try:
            async with httpx.AsyncClient(timeout=settings.LLM_REQUEST_TIMEOUT_SECONDS) as client:
                async with client.stream("POST", url, headers=headers, json=data) as stream:
                    if stream.status_code != 200:
                        logger.error("OpenAI stream HTTP %d. Falling back to mock.", stream.status_code)
                        async for chunk in self._mock_fallback.generate_stream(
                            messages, system_prompt, temperature, max_tokens
                        ):
                            yield chunk
                        return

                    async for line in stream.aiter_lines():
                        if not line or not line.startswith("data: "):
                            continue
                        line_data = line[6:].strip()
                        if line_data == "[DONE]":
                            break
                        try:
                            parsed = json.loads(line_data)
                            delta = parsed["choices"][0]["delta"].get("content", "")
                            if delta:
                                yield delta
                        except Exception:
                            continue
        except Exception as exc:
            logger.error("OpenAI stream failed: %s. Falling back to mock.", exc)
            async for chunk in self._mock_fallback.generate_stream(messages, system_prompt, temperature, max_tokens):
                yield chunk

    async def classify_intent(self, text: str, context: Optional[str] = None) -> IntentClassificationResult:
        if not self.api_key:
            return await self._mock_fallback.classify_intent(text, context)

        messages = [
            {"role": "system", "content": INTENT_CLASSIFICATION_PROMPT},
            {"role": "user", "content": f"Visitor Message: {text}\nContext: {context or 'None'}"},
        ]
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        data = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.0,
            "response_format": {"type": "json_object"},
        }

        try:
            async with httpx.AsyncClient(timeout=settings.LLM_REQUEST_TIMEOUT_SECONDS) as client:
                res = await client.post(url, headers=headers, json=data)
                if res.status_code != 200:
                    logger.error("OpenAI intent classification HTTP %d. Falling back to mock.", res.status_code)
                    return await self._mock_fallback.classify_intent(text, context)

                content = res.json()["choices"][0]["message"]["content"]
                parsed = json.loads(content)
                return IntentClassificationResult.model_validate(parsed)
        except Exception as exc:
            logger.error("OpenAI intent classification failed: %s. Falling back to mock.", exc)
            return await self._mock_fallback.classify_intent(text, context)
