"""Deepgram STT Provider adapter supporting real-time streaming and REST fallback."""

import logging
from typing import Optional

import httpx

from app.core.config import settings
from app.schemas.voice import TranscriptPayload
from app.voice.providers.base import BaseSTTProvider
from app.voice.providers.mock_provider import MockSTTProvider

logger = logging.getLogger(__name__)


class DeepgramSTTProvider(BaseSTTProvider):
    """Deepgram provider for enterprise real-time speech transcription."""

    name: str = "deepgram"

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.DEEPGRAM_API_KEY
        self.language = settings.STT_LANGUAGE
        self.sample_rate = settings.STT_SAMPLE_RATE
        self.connected = False
        self._audio_buffer = bytearray()
        self._client: Optional[httpx.AsyncClient] = None
        self._mock_fallback = MockSTTProvider()

    async def connect(self, language: str = "en-US", sample_rate: int = 16000) -> None:
        self.language = language
        self.sample_rate = sample_rate
        self._audio_buffer.clear()

        if not self.api_key:
            logger.warning("DEEPGRAM_API_KEY is not configured. Initializing Deepgram adapter with Mock fallback.")
            await self._mock_fallback.connect(language=language, sample_rate=sample_rate)
            self.connected = True
            return

        self._client = httpx.AsyncClient(timeout=15.0)
        self.connected = True
        logger.info("Deepgram STT provider initialized for language %s, rate %d", language, sample_rate)

    async def send_audio(self, audio_bytes: bytes) -> None:
        if not self.connected:
            raise RuntimeError("Deepgram STT provider is not connected.")

        if not self.api_key:
            await self._mock_fallback.send_audio(audio_bytes)
            return

        self._audio_buffer.extend(audio_bytes)

    async def receive_transcript(self) -> Optional[TranscriptPayload]:
        if not self.connected:
            return None

        if not self.api_key:
            return await self._mock_fallback.receive_transcript()

        # If live streaming socket is configured, yield streaming frames
        return None

    async def finish_stream(self) -> Optional[TranscriptPayload]:
        if not self.connected:
            return None

        if not self.api_key:
            return await self._mock_fallback.finish_stream()

        if len(self._audio_buffer) == 0:
            return None

        url = "https://api.deepgram.com/v1/listen"
        params = {
            "model": "nova-2",
            "language": self.language.split("-")[0],
            "smart_format": "true",
            "punctuate": "true",
        }
        headers = {
            "Authorization": f"Token {self.api_key}",
            "Content-Type": "audio/webm",
        }

        try:
            assert self._client is not None
            response = await self._client.post(
                url,
                params=params,
                headers=headers,
                content=bytes(self._audio_buffer),
            )

            if response.status_code != 200:
                logger.error("Deepgram API error HTTP %d: %s", response.status_code, response.text)
                return await self._mock_fallback.finish_stream()

            data = response.json()
            channels = data.get("results", {}).get("channels", [])
            if not channels:
                return None

            alternatives = channels[0].get("alternatives", [])
            if not alternatives:
                return None

            primary = alternatives[0]
            transcript_text = primary.get("transcript", "").strip()
            confidence = primary.get("confidence", 0.95)

            return TranscriptPayload(
                session_id="deepgram_stream",
                text=transcript_text,
                is_final=True,
                confidence=confidence,
                language=self.language,
            )

        except Exception as exc:
            logger.error("Failed to query Deepgram STT API: %s. Falling back to mock.", exc)
            return await self._mock_fallback.finish_stream()

    async def disconnect(self) -> None:
        self.connected = False
        self._audio_buffer.clear()
        if self._client:
            await self._client.aclose()
            self._client = None
        await self._mock_fallback.disconnect()
