"""Voice session lifecycle and stream orchestration service."""

import base64
import logging
import uuid
from datetime import datetime, timezone
from typing import AsyncGenerator, Dict, Optional

from app.core.config import settings
from app.schemas.voice import (
    SpeechAudioChunkPayload,
    TranscriptPayload,
)
from app.voice.providers import get_stt_provider, get_tts_provider
from app.voice.providers.base import BaseSTTProvider, BaseTTSProvider

logger = logging.getLogger(__name__)


class VoiceSession:
    """Manages an active real-time voice interaction session for a kiosk."""

    def __init__(
        self,
        session_id: str,
        tenant_id: str,
        kiosk_id: Optional[str] = None,
        language: str = "en-US",
        sample_rate: int = 16000,
        stt_provider: Optional[BaseSTTProvider] = None,
        tts_provider: Optional[BaseTTSProvider] = None,
    ):
        self.session_id = session_id
        self.tenant_id = tenant_id
        self.kiosk_id = kiosk_id or "kiosk-default"
        self.language = language
        self.sample_rate = sample_rate
        self.stt_provider = stt_provider or get_stt_provider()
        self.tts_provider = tts_provider or get_tts_provider()

        self.is_active = True
        self.created_at = datetime.now(timezone.utc)
        self.last_activity_at = datetime.now(timezone.utc)
        self.total_audio_bytes_received = 0
        self.is_speaking = False

    async def initialize(self) -> None:
        """Connects STT provider for streaming."""
        await self.stt_provider.connect(language=self.language, sample_rate=self.sample_rate)
        logger.info(
            "Voice session %s initialized (Tenant: %s, STT: %s, TTS: %s)",
            self.session_id,
            self.tenant_id,
            self.stt_provider.name,
            self.tts_provider.name,
        )

    async def process_audio_chunk(self, base64_data: str) -> Optional[TranscriptPayload]:
        """Validates, decodes, and routes an incoming audio chunk to STT."""
        self.last_activity_at = datetime.now(timezone.utc)

        try:
            audio_bytes = base64.b64decode(base64_data)
        except Exception as e:
            logger.error("Failed to decode base64 audio chunk: %s", e)
            raise ValueError("Malformed base64 audio data")

        if len(audio_bytes) > settings.VOICE_MAX_AUDIO_CHUNK_BYTES:
            raise ValueError(
                f"Audio chunk exceeds maximum allowed size ({len(audio_bytes)} > {settings.VOICE_MAX_AUDIO_CHUNK_BYTES})"
            )

        self.total_audio_bytes_received += len(audio_bytes)
        await self.stt_provider.send_audio(audio_bytes)

        # Check for intermediate partial transcript
        return await self.stt_provider.receive_transcript()

    async def finish_speech(self) -> Optional[TranscriptPayload]:
        """Finalizes user speech and returns the authoritative final transcript."""
        self.last_activity_at = datetime.now(timezone.utc)
        final_transcript = await self.stt_provider.finish_stream()
        return final_transcript

    async def generate_response(self, user_transcript: str) -> str:
        """Generates conversational reception response for visitor transcript."""
        # Clean query
        query = user_transcript.strip().lower()

        if "check in" in query or "appointment" in query:
            return "Welcome! I can certainly assist you with check-in. Please tap the Check-In button on screen or provide your name."
        elif "employee" in query or "meet" in query or "find" in query:
            return "I can help you locate anyone in the directory. Which team member are you visiting today?"
        elif "navigation" in query or "restroom" in query or "floor" in query or "where" in query:
            return (
                "Our office facilities, conference rooms, and elevators are directly down the corridor to your right."
            )
        elif "help" in query or "assistance" in query:
            return (
                "I am your virtual receptionist. You can ask me for check-in, employee lookups, or office navigation."
            )
        else:
            return f"Thank you. I heard: '{user_transcript}'. How may I best assist you today?"

    async def synthesize_speech_stream(self, text: str) -> AsyncGenerator[SpeechAudioChunkPayload, None]:
        """Streams synthesized speech audio chunks with viseme alignments."""
        self.is_speaking = True
        self.last_activity_at = datetime.now(timezone.utc)

        # 1. Fetch viseme timeline for the phrase
        visemes = await self.tts_provider.get_visemes(text)

        # 2. Stream audio chunks
        chunk_idx = 0
        async for audio_chunk in self.tts_provider.stream_audio(text, language=self.language):
            if not self.is_speaking:
                break

            b64_chunk = base64.b64encode(audio_chunk).decode("ascii")
            yield SpeechAudioChunkPayload(
                session_id=self.session_id,
                chunk_index=chunk_idx,
                data=b64_chunk,
                is_last_chunk=False,
                visemes=visemes if chunk_idx == 0 else None,
            )
            chunk_idx += 1

        # Yield last chunk indicator
        yield SpeechAudioChunkPayload(
            session_id=self.session_id,
            chunk_index=chunk_idx,
            data="",
            is_last_chunk=True,
            visemes=None,
        )
        self.is_speaking = False

    async def cancel_speech(self) -> None:
        """Interrupts and stops ongoing speech playback."""
        self.is_speaking = False
        await self.tts_provider.cancel()

    async def close(self) -> None:
        """Cleans up provider connections and session state."""
        self.is_active = False
        self.is_speaking = False
        await self.stt_provider.disconnect()
        logger.info("Voice session %s closed", self.session_id)


class VoiceSessionManager:
    """Singleton session registry tracking active kiosk voice connections."""

    def __init__(self):
        self._sessions: Dict[str, VoiceSession] = {}

    def create_session(
        self,
        tenant_id: str,
        kiosk_id: Optional[str] = None,
        language: str = "en-US",
        sample_rate: int = 16000,
        stt_provider: Optional[BaseSTTProvider] = None,
        tts_provider: Optional[BaseTTSProvider] = None,
    ) -> VoiceSession:
        session_id = f"vsession_{uuid.uuid4().hex[:12]}"
        session = VoiceSession(
            session_id=session_id,
            tenant_id=tenant_id,
            kiosk_id=kiosk_id,
            language=language,
            sample_rate=sample_rate,
            stt_provider=stt_provider,
            tts_provider=tts_provider,
        )
        self._sessions[session_id] = session
        return session

    def get_session(self, session_id: str) -> Optional[VoiceSession]:
        return self._sessions.get(session_id)

    async def remove_session(self, session_id: str) -> None:
        session = self._sessions.pop(session_id, None)
        if session:
            await session.close()


session_manager = VoiceSessionManager()
