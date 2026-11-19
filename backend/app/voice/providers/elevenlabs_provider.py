"""ElevenLabs TTS Provider adapter supporting neural streaming speech synthesis."""

import logging
from typing import AsyncGenerator, List, Optional

import httpx

from app.core.config import settings
from app.schemas.voice import VisemeTiming
from app.voice.providers.base import BaseTTSProvider
from app.voice.providers.mock_provider import MockTTSProvider

logger = logging.getLogger(__name__)


class ElevenLabsTTSProvider(BaseTTSProvider):
    """ElevenLabs provider for enterprise neural voice synthesis."""

    name: str = "elevenlabs"

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.ELEVENLABS_API_KEY
        self.voice_id = settings.ELEVENLABS_VOICE_ID
        self.model_id = settings.ELEVENLABS_MODEL_ID
        self._cancelled = False
        self._mock_fallback = MockTTSProvider()

    async def synthesize(
        self,
        text: str,
        voice_id: Optional[str] = None,
        language: Optional[str] = None,
    ) -> bytes:
        self._cancelled = False
        selected_voice = voice_id or self.voice_id

        if not self.api_key:
            logger.warning("ELEVENLABS_API_KEY is not configured. Using MockTTSProvider fallback.")
            return await self._mock_fallback.synthesize(text, selected_voice, language)

        url = f"https://api.elevenlabs.io/v1/text-to-speech/{selected_voice}"
        headers = {
            "xi-api-key": self.api_key,
            "Content-Type": "application/json",
            "Accept": "audio/mpeg",
        }
        payload = {
            "text": text,
            "model_id": self.model_id,
            "voice_settings": {
                "stability": 0.50,
                "similarity_boost": 0.75,
            },
        }

        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                res = await client.post(url, headers=headers, json=payload)
                if res.status_code != 200:
                    logger.error("ElevenLabs API HTTP %d: %s. Using mock fallback.", res.status_code, res.text)
                    return await self._mock_fallback.synthesize(text, selected_voice, language)
                return res.content
        except Exception as exc:
            logger.error("ElevenLabs synthesis error: %s. Falling back to mock.", exc)
            return await self._mock_fallback.synthesize(text, selected_voice, language)

    async def stream_audio(
        self,
        text: str,
        voice_id: Optional[str] = None,
        language: Optional[str] = None,
    ) -> AsyncGenerator[bytes, None]:
        self._cancelled = False
        selected_voice = voice_id or self.voice_id

        if not self.api_key:
            async for chunk in self._mock_fallback.stream_audio(text, selected_voice, language):
                if self._cancelled:
                    break
                yield chunk
            return

        url = f"https://api.elevenlabs.io/v1/text-to-speech/{selected_voice}/stream"
        headers = {
            "xi-api-key": self.api_key,
            "Content-Type": "application/json",
            "Accept": "audio/mpeg",
        }
        payload = {
            "text": text,
            "model_id": self.model_id,
            "voice_settings": {
                "stability": 0.50,
                "similarity_boost": 0.75,
            },
        }

        try:
            async with httpx.AsyncClient(timeout=25.0) as client:
                async with client.stream("POST", url, headers=headers, json=payload) as stream:
                    if stream.status_code != 200:
                        logger.error("ElevenLabs stream HTTP %d. Using mock fallback.", stream.status_code)
                        async for chunk in self._mock_fallback.stream_audio(text, selected_voice, language):
                            if self._cancelled:
                                break
                            yield chunk
                        return

                    async for chunk in stream.aiter_bytes(chunk_size=4096):
                        if self._cancelled:
                            break
                        yield chunk
        except Exception as exc:
            logger.error("ElevenLabs stream exception: %s. Falling back to mock.", exc)
            async for chunk in self._mock_fallback.stream_audio(text, selected_voice, language):
                if self._cancelled:
                    break
                yield chunk

    async def get_visemes(self, text: str) -> List[VisemeTiming]:
        """Calculates phonetic viseme timing frames for the 3D avatar lip-sync engine."""
        return await self._mock_fallback.get_visemes(text)

    async def cancel(self) -> None:
        self._cancelled = True
        await self._mock_fallback.cancel()
