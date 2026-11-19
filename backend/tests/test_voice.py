"""Unit and integration test suite for the Real-Time Voice Infrastructure."""

import base64
import struct

import pytest
from starlette.testclient import TestClient

from app.main import app
from app.schemas.voice import (
    ClientEventType,
    VoiceClientEvent,
    VoiceStartPayload,
)
from app.voice.providers.deepgram_provider import DeepgramSTTProvider
from app.voice.providers.elevenlabs_provider import ElevenLabsTTSProvider
from app.voice.providers.mock_provider import MockSTTProvider, MockTTSProvider
from app.voice.services.audio_processor import AudioProcessor
from app.voice.services.voice_session import VoiceSession


def test_voice_schema_serialization():
    """Verify serialization and deserialization of client and server voice events."""
    start_event = VoiceClientEvent(
        event=ClientEventType.VOICE_START,
        session_id="test_sess_01",
        payload=VoiceStartPayload(
            language="en-US",
            sample_rate=16000,
            kiosk_id="kiosk-lobby-01",
            tenant_id="tenant-123",
        ).model_dump(),
    )
    json_str = start_event.model_dump_json()
    assert "voice.start" in json_str
    assert "kiosk-lobby-01" in json_str

    deserialized = VoiceClientEvent.model_validate_json(json_str)
    assert deserialized.event == ClientEventType.VOICE_START
    assert deserialized.payload["sample_rate"] == 16000


@pytest.mark.asyncio
async def test_mock_stt_provider_streaming():
    """Verify MockSTTProvider partial transcripts and final transcript completion."""
    stt = MockSTTProvider(simulated_transcript="Good morning I would like to check in")
    await stt.connect(language="en-US", sample_rate=16000)

    # Send audio bytes
    audio_sample = b"\x00" * 4096
    await stt.send_audio(audio_sample)

    partial = await stt.receive_transcript()
    assert partial is not None
    assert partial.is_final is False
    assert len(partial.text) > 0

    final = await stt.finish_stream()
    assert final is not None
    assert final.is_final is True
    assert final.text == "Good morning I would like to check in"
    assert final.confidence > 0.9

    await stt.disconnect()
    assert stt.connected is False


@pytest.mark.asyncio
async def test_mock_tts_provider_synthesis_and_visemes():
    """Verify MockTTSProvider generates valid WAV bytes, stream chunks, and visemes."""
    tts = MockTTSProvider()

    # 1. Complete synthesis
    wav_bytes = await tts.synthesize("Welcome to our office.")
    assert len(wav_bytes) > 44  # WAV header is 44 bytes
    assert wav_bytes[:4] == b"RIFF"
    assert wav_bytes[8:12] == b"WAVE"

    # 2. Visemes
    visemes = await tts.get_visemes("Welcome to our office.")
    assert len(visemes) > 0
    assert any(v.viseme.startswith("viseme_") for v in visemes)
    assert visemes[-1].viseme == "viseme_sil"

    # 3. Stream audio chunks
    chunks = []
    async for chunk in tts.stream_audio("Hello"):
        chunks.append(chunk)

    assert len(chunks) > 0
    combined = b"".join(chunks)
    assert len(combined) == len(await tts.synthesize("Hello"))


@pytest.mark.asyncio
async def test_provider_fallbacks_when_keys_missing():
    """Verify Deepgram and ElevenLabs providers gracefully fallback when API keys are absent."""
    deepgram = DeepgramSTTProvider(api_key="")
    await deepgram.connect("en-US", 16000)
    await deepgram.send_audio(b"\x00" * 4096)
    final_stt = await deepgram.finish_stream()
    assert final_stt is not None
    assert final_stt.is_final is True
    await deepgram.disconnect()

    elevenlabs = ElevenLabsTTSProvider(api_key="")
    audio = await elevenlabs.synthesize("Test fallback speech")
    assert len(audio) > 44
    assert audio[:4] == b"RIFF"


@pytest.mark.asyncio
async def test_voice_session_lifecycle():
    """Verify end-to-end VoiceSession audio processing, response generation, and TTS streaming."""
    stt = MockSTTProvider(simulated_transcript="I am here for an appointment")
    tts = MockTTSProvider()

    session = VoiceSession(
        session_id="test_sess_99",
        tenant_id="tenant-acme",
        kiosk_id="kiosk-01",
        stt_provider=stt,
        tts_provider=tts,
    )
    await session.initialize()

    # Encode dummy audio chunk
    dummy_audio = b"\x00\x05" * 2048
    b64_data = base64.b64encode(dummy_audio).decode("ascii")

    # Ingest audio chunk
    await session.process_audio_chunk(b64_data)
    final_t = await session.finish_speech()
    assert final_t is not None
    assert "appointment" in final_t.text

    # Generate response
    reply = await session.generate_response(final_t.text)
    assert "check-in" in reply.lower()

    # Stream TTS
    speech_chunks = []
    async for chunk_payload in session.synthesize_speech_stream(reply):
        speech_chunks.append(chunk_payload)

    assert len(speech_chunks) >= 2
    # Verify first chunk has viseme metadata
    assert speech_chunks[0].visemes is not None
    assert len(speech_chunks[0].visemes) > 0
    # Verify last chunk has is_last_chunk flag
    assert speech_chunks[-1].is_last_chunk is True

    await session.close()
    assert session.is_active is False


def test_audio_processor_validation_and_energy():
    """Verify audio processor chunk bounds and PCM16 dBFS calculation."""
    # Chunk size check
    valid, err = AudioProcessor.validate_audio_chunk(b"\x01\x02", max_bytes=100)
    assert valid is True
    assert err is None

    invalid, err = AudioProcessor.validate_audio_chunk(b"", max_bytes=100)
    assert invalid is False
    assert "empty" in err.lower()

    too_large, err = AudioProcessor.validate_audio_chunk(b"\x00" * 200, max_bytes=100)
    assert too_large is False
    assert "exceeds" in err.lower()

    # Silent signal
    silent_bytes = b"\x00\x00" * 500
    dbfs, is_speech = AudioProcessor.calculate_pcm16_energy(silent_bytes)
    assert dbfs <= -90.0
    assert is_speech is False

    # Loud signal (full-scale sine or square)
    loud_bytes = struct.pack("<h", 30000) * 500
    loud_dbfs, is_loud_speech = AudioProcessor.calculate_pcm16_energy(loud_bytes)
    assert loud_dbfs > -10.0
    assert is_loud_speech is True


def test_voice_websocket_gateway_flow():
    """Verify full WebSocket lifecycle: voice.start -> audio.chunk -> voice.stop -> speech streaming."""
    client = TestClient(app)

    with client.websocket_connect("/api/v1/voice/ws?tenant_id=tenant-test-01&kiosk_id=kiosk-101") as ws:
        # 1. Send voice.start
        ws.send_json(
            {
                "event": "voice.start",
                "session_id": "test_ws_001",
                "payload": {
                    "language": "en-US",
                    "sample_rate": 16000,
                    "kiosk_id": "kiosk-101",
                    "tenant_id": "tenant-test-01",
                },
            }
        )

        # Expect voice.ready
        ready_msg = ws.receive_json()
        assert ready_msg["event"] == "voice.ready"
        session_id = ready_msg["session_id"]
        assert ready_msg["payload"]["sample_rate"] == 16000

        # 2. Send audio.chunk
        audio_bytes = b"\x00\x10" * 4096
        b64_chunk = base64.b64encode(audio_bytes).decode("ascii")
        ws.send_json(
            {
                "event": "audio.chunk",
                "session_id": session_id,
                "payload": {
                    "chunk_index": 0,
                    "data": b64_chunk,
                },
            }
        )

        # Receive streaming partial transcript
        partial_msg = ws.receive_json()
        assert partial_msg["event"] == "transcript.partial"
        assert "text" in partial_msg["payload"]

        # 3. Send voice.ping
        ws.send_json(
            {
                "event": "voice.ping",
                "session_id": session_id,
                "payload": {},
            }
        )
        pong_msg = ws.receive_json()
        assert pong_msg["event"] == "voice.pong"

        # 4. Send voice.stop
        ws.send_json(
            {
                "event": "voice.stop",
                "session_id": session_id,
                "payload": {},
            }
        )

        # Expect transcript.final
        final_msg = ws.receive_json()
        assert final_msg["event"] == "transcript.final"
        assert "text" in final_msg["payload"]

        # Expect speech.started
        speech_started = ws.receive_json()
        assert speech_started["event"] == "speech.started"

        # Receive speech.audio_chunk frames until speech.completed
        received_chunks = 0
        while True:
            speech_msg = ws.receive_json()
            if speech_msg["event"] == "speech.completed":
                break
            assert speech_msg["event"] == "speech.audio_chunk"
            received_chunks += 1

        assert received_chunks >= 1
