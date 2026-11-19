"""Pydantic schemas and event protocols for the Voice Gateway WebSocket."""

from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class ClientEventType(str, Enum):
    VOICE_START = "voice.start"
    AUDIO_CHUNK = "audio.chunk"
    VOICE_STOP = "voice.stop"
    VOICE_CANCEL = "voice.cancel"
    VOICE_PING = "voice.ping"


class ServerEventType(str, Enum):
    VOICE_READY = "voice.ready"
    TRANSCRIPT_PARTIAL = "transcript.partial"
    TRANSCRIPT_FINAL = "transcript.final"
    SPEECH_STARTED = "speech.started"
    SPEECH_AUDIO_CHUNK = "speech.audio_chunk"
    SPEECH_COMPLETED = "speech.completed"
    VOICE_ERROR = "voice.error"
    VOICE_CLOSED = "voice.closed"
    VOICE_PONG = "voice.pong"


# Viseme alignment frame for lip-sync synchronization
class VisemeTiming(BaseModel):
    viseme: str
    start_ms: int
    duration_ms: int


# Client event payloads
class VoiceStartPayload(BaseModel):
    session_id: Optional[str] = None
    language: str = Field(default="en-US", description="Language code e.g. en-US, hi-IN")
    audio_format: str = Field(default="audio/webm;codecs=opus", description="MIME format of audio chunks")
    sample_rate: int = Field(default=16000, description="Audio sampling rate in Hz")
    kiosk_id: Optional[str] = None
    tenant_id: Optional[str] = None


class AudioChunkPayload(BaseModel):
    chunk_index: int = Field(ge=0)
    data: str = Field(description="Base64 encoded audio byte chunk")
    timestamp_ms: Optional[int] = None
    is_silent: Optional[bool] = False


class VoiceStopPayload(BaseModel):
    reason: Optional[str] = "end_of_speech"


class VoiceCancelPayload(BaseModel):
    reason: Optional[str] = "user_interruption"


# General Client Event Container
class VoiceClientEvent(BaseModel):
    event: ClientEventType
    session_id: Optional[str] = None
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    payload: Dict[str, Any] = Field(default_factory=dict)


# Server event payloads
class VoiceReadyPayload(BaseModel):
    session_id: str
    stt_provider: str
    tts_provider: str
    sample_rate: int
    language: str


class TranscriptPayload(BaseModel):
    session_id: str
    text: str
    is_final: bool
    confidence: float = 1.0
    language: str = "en-US"


class SpeechStartedPayload(BaseModel):
    session_id: str
    audio_format: str
    sample_rate: int
    voice_id: str


class SpeechAudioChunkPayload(BaseModel):
    session_id: str
    chunk_index: int
    data: str  # Base64 encoded audio bytes
    is_last_chunk: bool = False
    visemes: Optional[List[VisemeTiming]] = None


class SpeechCompletedPayload(BaseModel):
    session_id: str
    total_chunks: int
    duration_ms: Optional[int] = None


class VoiceErrorPayload(BaseModel):
    code: str
    message: str
    recoverable: bool = True
    details: Optional[Dict[str, Any]] = None


# General Server Event Container
class VoiceServerEvent(BaseModel):
    event: ServerEventType
    session_id: str
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    payload: Dict[str, Any]
