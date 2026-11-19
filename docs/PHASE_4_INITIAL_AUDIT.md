# PHASE 4 INITIAL AUDIT: REAL-TIME VOICE INFRASTRUCTURE

**Product:** AI Receptionist Enterprise  
**Subsystem:** Real-Time Voice Gateway, Audio Capture & Speech Synthesis Subsystem  
**Lead Engineer:** Senior Voice AI Engineer, Python Backend Architect & Real-Time Audio Specialist  
**Timestamp:** November 19, 2026  
**Status:** Audit Completed — Implementation Plan Formulated  

---

## 1. Executive Summary

Phase 4 bridges the digital human avatar created in Phase 3 with the visitor through bidirectional real-time audio communication. This audit evaluates the current monorepo state across Phase 1 (Foundation, Multi-tenancy, Auth, Database), Phase 2 (Kiosk UX, Routes, Accessibility, Localization), and Phase 3 (3D Digital Human Avatar, Three.js WebGL Pipeline, Blend-Shape Expressions, Phonetic Lip-Sync).

The system currently has working API infrastructure and static kiosk routes, but relies on a simulated conversational delay in `frontend/src/app/(kiosk)/kiosk/assistant/page.tsx`. Phase 4 introduces a production-ready, provider-agnostic voice gateway on FastAPI with a bi-directional WebSocket protocol, streaming audio capture in the browser, real-time STT (Deepgram adapter with mock fallback), neural TTS (ElevenLabs adapter with mock fallback), Web Audio playback queue with barge-in interruption, and tight coupling to the Phase 3 `AvatarControllerAPI` for state and viseme synchronization.

---

## 2. Review of Phase 1, Phase 2, and Phase 3 Deliverables

### Phase 1: Enterprise Foundation
- **Backend:** FastAPI with modular routers in `backend/app/api/v1/router.py`, structured JSON logging with correlation IDs, and RFC 7807 error formatting.
- **Database & Auth:** Multi-tenant PostgreSQL models (`tenants`, `users`, `branches`, `kiosk_devices`), JWT token authentication, and RBAC.
- **Environment:** Configured in `backend/app/core/config.py` using Pydantic Settings v2.
- **Status:** 100% verified and operational.

### Phase 2: Kiosk Frontend
- **Design System:** Touchscreen kiosk UI running on Next.js 15, Tailwind CSS, Lucide icons, responsive quick actions.
- **Routing:** `/kiosk`, `/kiosk/assistant`, `/kiosk/visitor-check-in`, `/kiosk/employee-directory`, etc.
- **Localization:** Bilingual English/Hindi context (`useLanguage`).
- **Session Management:** Inactivity timeout, automatic privacy wipe, and return-to-home session management (`useKioskSession`).
- **Status:** 100% verified and operational (72/72 tests passing).

### Phase 3: Digital Human Avatar
- **Three.js Pipeline:** `AvatarScene.tsx`, `AvatarRenderer.tsx`, `AvatarLighting.tsx`, `AvatarCamera.tsx`.
- **Procedural 3D Bust:** Fully articulated humanoid mesh with morphing jaw/mouth, blinking eyelids, moving pupils, and neck articulation.
- **Animation Subsystems:** `AvatarGestures.tsx` (14 bpm breathing, stochastic blinking, state postures), `AvatarExpressions.tsx` (8 emotional blend-shape presets), and `AvatarLipSync.tsx` (15 phonetic visemes with smooth damping).
- **API Handle:** `AvatarControllerAPI` exposing `setState`, `setExpression`, and `playVisemes`.
- **Status:** 100% verified and operational. Ready for Phase 4 voice events.

---

## 3. Existing Voice & Audio Assets Audit

| Asset / Component | Location | Existing State | Gap / Action Needed for Phase 4 |
|:---|:---|:---|:---|
| **Audio Hardware Assumptions** | Browser runtime | No hardware validation | Implement `navigator.mediaDevices.getUserMedia` checks, permission state handling, device enumeration, fallback on permission denial. |
| **STT Provider** | Backend | None | Implement `SpeechToTextProvider` base interface with `DeepgramSTTProvider` and `MockSTTProvider` fallback. |
| **TTS Provider** | Backend | None | Implement `TextToSpeechProvider` base interface with `ElevenLabsTTSProvider` and `MockTTSProvider` fallback. |
| **Voice WebSocket Gateway** | Backend | None | Implement `/api/v1/voice/ws` WebSocket router with session authentication, audio ingestion, and event routing. |
| **Voice Session Manager** | Backend | None | Implement `VoiceSessionManager` tracking session lifecycles, tenant context, and timeouts. |
| **Browser Audio Capture** | Frontend | None | Implement `useAudioCapture` hook using MediaRecorder / Web Audio API with chunked PCM/WebM streaming. |
| **Audio Playback Queue** | Frontend | None | Implement `useAudioPlayback` hook using Web Audio API (`AudioContext`) with sequential buffering, interruption, and barge-in. |
| **Avatar Synchronization** | Frontend | Simulated `setTimeout` | Connect audio capture events (`LISTENING`), transcription (`THINKING`), and TTS playback (`SPEAKING` + visemes) directly to `AvatarControllerAPI`. |

---

## 4. Dependencies & Version Audit

### Backend (`backend/pyproject.toml`)
- `fastapi>=0.115.0`: Installed (`0.165.0`). Full native WebSocket support available.
- `uvicorn[standard]>=0.30.0`: Installed (`0.54.0`). Supports WebSocket transport.
- `websockets`: Installed (`17.4`). High-performance async WebSocket server.
- `httpx>=0.27.0`: Installed (`0.28.1`). Async HTTP client for streaming provider calls.
- `pydantic>=2.8.0`: Installed (`2.14.3`). High-performance schema validation.
- **Provider SDKs:** Deepgram and ElevenLabs can be accessed via their official HTTP/WebSocket REST streaming endpoints via `httpx` and `websockets` or SDKs. Modular adapters will support direct HTTP/WS API integration, eliminating heavy binary bloat.

### Frontend (`frontend/package.json`)
- `next`: `15.5.29`. Supports WebSocket client in React components.
- `react`: `19.0.0-rc`.
- Standard Web APIs available in target modern browsers:
  - `MediaDevices.getUserMedia()`
  - `MediaRecorder` (audio/webm;codecs=opus)
  - `AudioContext` & `AudioBufferSourceNode`
  - `WebSocket`

---

## 5. Security & Privacy Audit

1. **API Keys:** Neither Deepgram nor ElevenLabs API keys may be placed in the frontend bundle. Keys must remain strictly in `backend/app/core/config.py` and `.env`.
2. **WebSocket Authentication:** The `/api/v1/voice/ws` route must accept an authenticated session token (`kiosk_token` or JWT) or validate tenant kiosk credentials during the initial `voice.start` handshake.
3. **Tenant Isolation:** Voice sessions must resolve tenant ID from authentication claims, preventing cross-tenant spoofing.
4. **Audio Privacy:** Audio chunks must be processed ephemerally in-memory for real-time transcription and immediately discarded. No unencrypted audio files may be written to disk without explicit administrative retention policies.

---

## 6. Implementation Strategy & Deliverables

1. **Backend Voice Configuration (`backend/app/core/config.py`):**
   - Add STT & TTS provider toggles, API keys, voice IDs, and audio sample rates.
2. **Backend Schemas & Protocols (`backend/app/schemas/voice.py`):**
   - Define strictly validated Pydantic models for client-to-server and server-to-client events (`voice.start`, `audio.chunk`, `transcript.partial`, `transcript.final`, `speech.audio_chunk`, etc.).
3. **Backend Provider Adapters (`backend/app/voice/providers/`):**
   - Abstract `BaseSTTProvider` and `BaseTTSProvider`.
   - `DeepgramSTTProvider` (streaming WebSocket/REST transcription with live fallback).
   - `ElevenLabsTTSProvider` (streaming neural speech generation with live fallback).
   - `MockSTTProvider` and `MockTTSProvider` (contract-tested fallback enabling CI testing without billable API keys).
4. **Backend Voice Gateway & Router (`backend/app/voice/` & `backend/app/api/v1/endpoints/voice.py`):**
   - WebSocket handler managing connection lifecycle, audio chunk decoding, transcript streaming, and TTS synthesis dispatch.
5. **Frontend Audio Capture Hook (`frontend/src/hooks/useAudioCapture.ts`):**
   - MediaStream capture, permission management, mute/unmute, audio buffering, chunk streaming.
6. **Frontend Audio Playback Engine (`frontend/src/hooks/useAudioPlayback.ts`):**
   - Web Audio API sequential playback queue, volume gain, interruption/barge-in stop, completion triggers.
7. **Frontend Voice Client Hook (`frontend/src/hooks/useVoiceClient.ts`):**
   - Orchestrates WebSocket transport, capture, playback, and avatar state transitions.
8. **Kiosk Assistant Page Integration (`frontend/src/app/(kiosk)/kiosk/assistant/page.tsx`):**
   - Connect live voice engine to conversational UI and `AvatarStage`.
9. **Automated Test Matrix:**
   - Backend unit tests for voice event schemas, session lifecycle, and provider adapters.
   - Frontend unit tests for audio capture, WebSocket event handling, and avatar synchronization.
