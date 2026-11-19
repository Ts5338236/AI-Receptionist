"""High-fidelity Mock STT and TTS providers for testing and offline development."""

import asyncio
import io
import math
import struct
import wave
from typing import AsyncGenerator, List, Optional

from app.schemas.voice import TranscriptPayload, VisemeTiming
from app.voice.providers.base import BaseSTTProvider, BaseTTSProvider


class MockSTTProvider(BaseSTTProvider):
    """Deterministic Speech-to-Text provider simulating streaming transcription."""

    name: str = "mock_stt"

    def __init__(self, simulated_transcript: Optional[str] = None):
        self.simulated_transcript = simulated_transcript or "Hello, I am here to check in for my appointment."
        self.connected = False
        self.audio_bytes_received = 0
        self.language = "en-US"
        self.sample_rate = 16000

    async def connect(self, language: str = "en-US", sample_rate: int = 16000) -> None:
        self.language = language
        self.sample_rate = sample_rate
        self.connected = True
        self.audio_bytes_received = 0

    async def send_audio(self, audio_bytes: bytes) -> None:
        if not self.connected:
            raise RuntimeError("STT provider not connected.")
        self.audio_bytes_received += len(audio_bytes)

    async def receive_transcript(self) -> Optional[TranscriptPayload]:
        """Simulates partial transcript progression based on received audio."""
        if not self.connected or self.audio_bytes_received == 0:
            return None

        # Return partial words
        words = self.simulated_transcript.split()
        if not words:
            return None

        step = min(len(words), max(1, self.audio_bytes_received // 4096))
        partial_text = " ".join(words[:step])

        return TranscriptPayload(
            session_id="mock_session",
            text=partial_text,
            is_final=False,
            confidence=0.92,
            language=self.language,
        )

    async def finish_stream(self) -> Optional[TranscriptPayload]:
        if not self.connected:
            return None
        return TranscriptPayload(
            session_id="mock_session",
            text=self.simulated_transcript,
            is_final=True,
            confidence=0.98,
            language=self.language,
        )

    async def disconnect(self) -> None:
        self.connected = False
        self.audio_bytes_received = 0


class MockTTSProvider(BaseTTSProvider):
    """Generates synthetic valid WAV audio tone buffers and calculated phonetic visemes."""

    name: str = "mock_tts"

    def __init__(self):
        self._cancelled = False

    def _generate_synthetic_wav(self, duration_s: float = 1.0, freq: float = 440.0) -> bytes:
        """Generates a valid 16kHz mono PCM 16-bit WAV file in memory."""
        sample_rate = 16000
        num_samples = int(duration_s * sample_rate)
        buf = io.BytesIO()

        with wave.open(buf, "wb") as wav_file:
            wav_file.setnchannels(1)  # Mono
            wav_file.setsampwidth(2)  # 16-bit
            wav_file.setframerate(sample_rate)

            # Generate subtle gentle sine wave tone so it's a valid playable audio stream
            frames = bytearray()
            for i in range(num_samples):
                # Envelope decay to make it soft
                envelope = max(0.0, 1.0 - (i / num_samples)) * 0.25
                value = int(32767.0 * envelope * math.sin(2.0 * math.pi * freq * (i / sample_rate)))
                frames.extend(struct.pack("<h", value))

            wav_file.writeframes(frames)

        return buf.getvalue()

    async def synthesize(
        self,
        text: str,
        voice_id: Optional[str] = None,
        language: Optional[str] = None,
    ) -> bytes:
        self._cancelled = False
        duration = max(0.8, min(4.0, len(text.split()) * 0.35))
        return self._generate_synthetic_wav(duration_s=duration)

    async def stream_audio(
        self,
        text: str,
        voice_id: Optional[str] = None,
        language: Optional[str] = None,
    ) -> AsyncGenerator[bytes, None]:
        self._cancelled = False
        full_audio = await self.synthesize(text, voice_id, language)
        chunk_size = 4096

        for i in range(0, len(full_audio), chunk_size):
            if self._cancelled:
                break
            yield full_audio[i : i + chunk_size]
            await asyncio.sleep(0.02)  # Simulate network chunking latency

    async def get_visemes(self, text: str) -> List[VisemeTiming]:
        """Calculates approximate viseme timings from words for 3D avatar lip-sync."""
        viseme_palette = [
            "viseme_aa",
            "viseme_E",
            "viseme_I",
            "viseme_O",
            "viseme_PP",
            "viseme_DD",
            "viseme_SS",
            "viseme_sil",
        ]
        words = text.split()
        visemes: List[VisemeTiming] = []
        current_ms = 100

        for idx, word in enumerate(words):
            word_duration = max(180, len(word) * 45)
            # 2 visemes per word
            v1 = viseme_palette[(idx * 2) % len(viseme_palette)]
            v2 = viseme_palette[(idx * 2 + 1) % len(viseme_palette)]

            visemes.append(VisemeTiming(viseme=v1, start_ms=current_ms, duration_ms=word_duration // 2))
            visemes.append(
                VisemeTiming(viseme=v2, start_ms=current_ms + word_duration // 2, duration_ms=word_duration // 2)
            )
            current_ms += word_duration + 40  # Word spacing

        visemes.append(VisemeTiming(viseme="viseme_sil", start_ms=current_ms, duration_ms=100))
        return visemes

    async def cancel(self) -> None:
        self._cancelled = True
