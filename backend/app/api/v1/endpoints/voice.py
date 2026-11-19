"""FastAPI Voice Gateway WebSocket Endpoint."""

import json
import logging
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import ValidationError

from app.core.config import settings
from app.schemas.voice import (
    AudioChunkPayload,
    ClientEventType,
    ServerEventType,
    SpeechCompletedPayload,
    SpeechStartedPayload,
    VoiceClientEvent,
    VoiceErrorPayload,
    VoiceReadyPayload,
    VoiceServerEvent,
    VoiceStartPayload,
)
from app.voice.services.voice_session import VoiceSession, session_manager

logger = logging.getLogger(__name__)

router = APIRouter()


@router.websocket("/ws")
async def voice_websocket_endpoint(
    websocket: WebSocket,
    tenant_id: Optional[str] = "00000000-0000-0000-0000-000000000001",
    kiosk_id: Optional[str] = "kiosk-default-01",
):
    """Real-Time Voice Streaming Gateway for Kiosk Terminals."""
    await websocket.accept()

    session: Optional[VoiceSession] = None
    logger.info("New WebSocket connection accepted from %s (Kiosk: %s)", websocket.client, kiosk_id)

    try:
        while True:
            raw_message = await websocket.receive_text()

            # 1. Parse JSON payload
            try:
                data = json.loads(raw_message)
                event_container = VoiceClientEvent.model_validate(data)
            except (json.JSONDecodeError, ValidationError) as parse_err:
                logger.warning("Rejected malformed WebSocket client event: %s", parse_err)
                err_event = VoiceServerEvent(
                    event=ServerEventType.VOICE_ERROR,
                    session_id=session.session_id if session else "unknown",
                    payload=VoiceErrorPayload(
                        code="INVALID_EVENT_FORMAT",
                        message=f"Malformed event or schema violation: {str(parse_err)}",
                        recoverable=True,
                    ).model_dump(),
                )
                await websocket.send_text(err_event.model_dump_json())
                continue

            event_type = event_container.event
            payload = event_container.payload

            # 2. Event Dispatching
            if event_type == ClientEventType.VOICE_START:
                start_data = VoiceStartPayload.model_validate(payload)
                resolved_tenant = start_data.tenant_id or tenant_id or "default-tenant"
                resolved_kiosk = start_data.kiosk_id or kiosk_id

                # Create voice session
                session = session_manager.create_session(
                    tenant_id=resolved_tenant,
                    kiosk_id=resolved_kiosk,
                    language=start_data.language,
                    sample_rate=start_data.sample_rate,
                )
                await session.initialize()

                ready_event = VoiceServerEvent(
                    event=ServerEventType.VOICE_READY,
                    session_id=session.session_id,
                    payload=VoiceReadyPayload(
                        session_id=session.session_id,
                        stt_provider=session.stt_provider.name,
                        tts_provider=session.tts_provider.name,
                        sample_rate=session.sample_rate,
                        language=session.language,
                    ).model_dump(),
                )
                await websocket.send_text(ready_event.model_dump_json())

            elif event_type == ClientEventType.AUDIO_CHUNK:
                if not session or not session.is_active:
                    err_event = VoiceServerEvent(
                        event=ServerEventType.VOICE_ERROR,
                        session_id="none",
                        payload=VoiceErrorPayload(
                            code="SESSION_NOT_INITIALIZED",
                            message="audio.chunk received before voice.start handshake",
                            recoverable=True,
                        ).model_dump(),
                    )
                    await websocket.send_text(err_event.model_dump_json())
                    continue

                chunk_data = AudioChunkPayload.model_validate(payload)
                try:
                    partial_transcript = await session.process_audio_chunk(chunk_data.data)
                    if partial_transcript and partial_transcript.text:
                        partial_event = VoiceServerEvent(
                            event=ServerEventType.TRANSCRIPT_PARTIAL,
                            session_id=session.session_id,
                            payload=partial_transcript.model_dump(),
                        )
                        await websocket.send_text(partial_event.model_dump_json())
                except ValueError as val_err:
                    err_event = VoiceServerEvent(
                        event=ServerEventType.VOICE_ERROR,
                        session_id=session.session_id,
                        payload=VoiceErrorPayload(
                            code="AUDIO_PROCESSING_ERROR",
                            message=str(val_err),
                            recoverable=True,
                        ).model_dump(),
                    )
                    await websocket.send_text(err_event.model_dump_json())

            elif event_type == ClientEventType.VOICE_STOP:
                if not session:
                    continue

                # Finalize STT
                final_transcript = await session.finish_speech()
                user_text = final_transcript.text if final_transcript else ""

                if final_transcript:
                    final_event = VoiceServerEvent(
                        event=ServerEventType.TRANSCRIPT_FINAL,
                        session_id=session.session_id,
                        payload=final_transcript.model_dump(),
                    )
                    await websocket.send_text(final_event.model_dump_json())

                # If text was transcribed, formulate response and stream synthesized audio
                if user_text:
                    ai_reply = await session.generate_response(user_text)

                    # Notify speech started
                    started_event = VoiceServerEvent(
                        event=ServerEventType.SPEECH_STARTED,
                        session_id=session.session_id,
                        payload=SpeechStartedPayload(
                            session_id=session.session_id,
                            audio_format="audio/wav",
                            sample_rate=session.sample_rate,
                            voice_id=settings.ELEVENLABS_VOICE_ID,
                        ).model_dump(),
                    )
                    await websocket.send_text(started_event.model_dump_json())

                    # Stream speech chunks
                    chunk_count = 0
                    async for audio_chunk_payload in session.synthesize_speech_stream(ai_reply):
                        chunk_event = VoiceServerEvent(
                            event=ServerEventType.SPEECH_AUDIO_CHUNK,
                            session_id=session.session_id,
                            payload=audio_chunk_payload.model_dump(),
                        )
                        await websocket.send_text(chunk_event.model_dump_json())
                        if not audio_chunk_payload.is_last_chunk:
                            chunk_count += 1

                    # Speech completed
                    completed_event = VoiceServerEvent(
                        event=ServerEventType.SPEECH_COMPLETED,
                        session_id=session.session_id,
                        payload=SpeechCompletedPayload(
                            session_id=session.session_id,
                            total_chunks=chunk_count,
                        ).model_dump(),
                    )
                    await websocket.send_text(completed_event.model_dump_json())

            elif event_type == ClientEventType.VOICE_CANCEL:
                if session:
                    await session.cancel_speech()
                    logger.info("Voice session %s speech interrupted/cancelled", session.session_id)

            elif event_type == ClientEventType.VOICE_PING:
                pong_event = VoiceServerEvent(
                    event=ServerEventType.VOICE_PONG,
                    session_id=session.session_id if session else "uninitialized",
                    payload={"pong": True, "time": datetime.now(timezone.utc).isoformat()},
                )
                await websocket.send_text(pong_event.model_dump_json())

    except WebSocketDisconnect:
        logger.info("WebSocket disconnected for session %s", session.session_id if session else "uninitialized")
    except Exception as exc:
        logger.error("Unhandled exception in voice websocket: %s", exc, exc_info=True)
    finally:
        if session:
            await session_manager.remove_session(session.session_id)
