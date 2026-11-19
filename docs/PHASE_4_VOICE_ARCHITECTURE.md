# PHASE 4: REAL-TIME VOICE INFRASTRUCTURE ARCHITECTURE

**Product:** AI Receptionist Enterprise  
**Subsystem:** Real-Time Voice Gateway, Speech-to-Text & Text-to-Speech Subsystem  
**Lead Engineer:** Senior Voice AI Engineer, Real-Time Audio Architect & WebSocket Lead  
**Status:** Completed & Integrated  

---

## 1. Executive Summary

Phase 4 implements the bidirectional real-time audio pipeline enabling visitors to converse naturally with the physical AI Virtual Receptionist Kiosk. The voice infrastructure bridges browser-level audio capture and playback with a high-throughput, low-latency FastAPI WebSocket gateway, provider-agnostic STT/TTS adapter engines, client-side Voice Activity Detection (VAD) with barge-in interruption, and real-time synchronization with the Phase 3 3D digital human avatar.

---

## 2. Voice Pipeline Architecture

The end-to-end conversational speech pipeline operates as follows:

```
[Visitor Speaks into Kiosk Microphone]
                    │
                    ▼
[Browser MediaDevices & Web Audio API]
  - Microphone permission check & device enumeration
  - Echo cancellation, noise suppression & auto-gain
  - Web Audio Analyser (Real-time RMS audio level & client-side VAD)
  - MediaRecorder chunking (timeslice = 250ms, audio/webm;codecs=opus)
                    │
                    ▼ (Base64 chunk over WebSocket)
[FastAPI Voice Gateway (ws://.../api/v1/voice/ws)]
  - WebSocket protocol validation & tenant isolation
  - VoiceSessionManager session state tracking
  - Audio chunk boundary & rate-limiting checks
                    │
                    ▼
[Speech-to-Text (STT) Provider Adapter]
  - Primary: DeepgramSTTProvider (Nova-2 model, streaming)
  - Fallback / Offline: MockSTTProvider (Deterministic testing)
  - Emits: transcript.partial & transcript.final events
                    │
                    ▼
[Conversational Reception Logic]
  - Evaluates user intent (Check-in, Employee directory, Navigation, Help)
  - Produces contextual receptionist response
                    │
                    ▼
[Text-to-Speech (TTS) Provider Adapter]
  - Primary: ElevenLabsTTSProvider (Multilingual v2, streaming)
  - Fallback / Offline: MockTTSProvider (Synthetic WAV tones + viseme generation)
  - Emits: speech.started, speech.audio_chunk (with viseme alignments), speech.completed
                    │
                    ▼ (Base64 audio chunks + Visemes over WebSocket)
[Browser Web Audio API Playback Queue]
  - Decode audio data (ArrayBuffer -> AudioBuffer)
  - Sequential gapless chunk scheduling
  - Barge-in / interruption: visitor speech aborts active playback immediately
                    │
                    ▼
[Phase 3 3D Digital Human Avatar Synchronization]
  - Microphone recording: Avatar -> LISTENING
  - STT / Backend processing: Avatar -> THINKING
  - Audio chunk playback: Avatar -> SPEAKING + mouth driven by VisemeTiming frames
  - Playback completed: Avatar -> IDLE
  - Error state: Avatar -> ERROR
```

---

## 3. WebSocket Event Protocol Specification

The WebSocket gateway runs at `/api/v1/voice/ws` and adheres to a strictly typed, schema-validated JSON event protocol:

### 3.1 Client-to-Server Events

| Event Name | Schema Payload | Description |
|:---|:---|:---|
| **`voice.start`** | `{ language: string, sample_rate: number, kiosk_id: string, tenant_id: string }` | Handshake initiating a new voice session. Sets language (`en-US`, `hi-IN`) and audio parameters. |
| **`audio.chunk`** | `{ chunk_index: number, data: string (base64), is_silent?: boolean }` | Streaming raw audio chunk from the visitor's microphone. |
| **`voice.stop`** | `{ reason: "vad_silence_detected" \| "manual_stop" }` | Signals end of user speech, triggering STT finalization and AI reply generation. |
| **`voice.cancel`** | `{ reason: "barge_in" \| "user_cancel" }` | Aborts active speech synthesis and in-flight audio playback. |
| **`voice.ping`** | `{}` | Keep-alive heartbeat message. |

### 3.2 Server-to-Client Events

| Event Name | Schema Payload | Description |
|:---|:---|:---|
| **`voice.ready`** | `{ session_id: string, stt_provider: string, tts_provider: string, sample_rate: number, language: string }` | Acknowledges session creation and readiness for audio streaming. |
| **`transcript.partial`** | `{ session_id: string, text: string, is_final: false, confidence: number }` | Intermediate live transcription hypothesis rendered in the UI. |
| **`transcript.final`** | `{ session_id: string, text: string, is_final: true, confidence: number }` | Authoritative final transcript of the visitor's utterance. |
| **`speech.started`** | `{ session_id: string, audio_format: string, sample_rate: number, voice_id: string }` | Informs client that speech generation has begun. |
| **`speech.audio_chunk`** | `{ session_id: string, chunk_index: number, data: string (base64), is_last_chunk: boolean, visemes?: VisemeTimingFrame[] }` | Synthesized audio byte chunk with phonetic viseme timestamps for avatar lip-sync. |
| **`speech.completed`** | `{ session_id: string, total_chunks: number }` | Confirms all audio chunks have been transmitted. |
| **`voice.error`** | `{ code: string, message: string, recoverable: boolean }` | Structured error event describing gateway or provider failures. |
| **`voice.pong`** | `{ pong: true, time: string }` | Keep-alive response. |

---

## 4. Provider-Independent Adapter Architecture

Both STT and TTS engines are implemented through abstract base classes (`BaseSTTProvider`, `BaseTTSProvider`) located in `backend/app/voice/providers/base.py`.

### 4.1 Speech-to-Text (STT) Providers
- **`DeepgramSTTProvider` (`backend/app/voice/providers/deepgram_provider.py`):**
  - Targets Deepgram's streaming WebSocket and pre-recorded Nova-2 endpoints.
  - Automatically activates when `DEEPGRAM_API_KEY` is present.
  - Gracefully falls back to `MockSTTProvider` when unconfigured or offline.
- **`MockSTTProvider` (`backend/app/voice/providers/mock_provider.py`):**
  - Generates realistic partial and final transcripts for CI testing and offline development.

### 4.2 Text-to-Speech (TTS) Providers
- **`ElevenLabsTTSProvider` (`backend/app/voice/providers/elevenlabs_provider.py`):**
  - Integrates with ElevenLabs `eleven_multilingual_v2` streaming REST endpoint.
  - Uses enterprise voice presets (default: Rachel / `21m00Tcm4TlvDq8ikWAM`).
  - Gracefully falls back to `MockTTSProvider` when unconfigured or offline.
- **`MockTTSProvider` (`backend/app/voice/providers/mock_provider.py`):**
  - Generates synthetic, fully playable 16kHz mono PCM WAV tones with envelope decay.
  - Computes phonetic viseme timelines (`viseme_aa`, `viseme_E`, `viseme_O`, etc.) for avatar lip-sync.

---

## 5. Voice Activity Detection (VAD) & Turn Management

1. **Client-Side VAD (`useAudioCapture.ts`):**
   - Uses Web Audio API `AnalyserNode` to compute RMS energy normalized to `0.0 - 1.0`.
   - Dynamic speech threshold (`> 0.12`) marks active speech.
   - When the user stops speaking, a silence countdown timer (`silenceTimeoutMs = 1400ms`) starts.
   - Upon timer expiration, `onSilenceDetected()` automatically terminates recording and fires `voice.stop`.
   - Maximum recording duration ceiling (`maxRecordingMs = 15000ms`) prevents infinite buffers.
2. **Server-Side Audio Validation (`audio_processor.py`):**
   - Verifies chunk byte boundaries (`max_bytes = 262144`).
   - Implements `calculate_pcm16_energy(raw_bytes)` to calculate signal dBFS (-100 dBFS to 0 dBFS).
3. **Barge-In / Interruption Support:**
   - If the visitor taps the microphone or begins speaking while the avatar is speaking, the client immediately halts Web Audio source nodes (`playback.stop()`), emits `voice.cancel` to the backend, and transitions the avatar to `LISTENING`.

---

## 6. Avatar State & Lip-Sync Synchronization

The `useVoiceClient` hook synchronizes operational states with `AvatarControllerAPI`:

| Voice Pipeline Event | Avatar Operational State | Visual / Mechanical Response |
|:---|:---:|:---|
| `startListening()` | **`LISTENING`** | Attentive head tilt, forward posture, expectant gaze. |
| Silence detected / `voice.stop` | **`THINKING`** | Upward contemplative eye gaze, subtle side tilt. |
| `speech.started` + `speech.audio_chunk` | **`SPEAKING`** | Conversational nods + jaw/mouth blend shapes driven by `startLipSync()`. |
| Playback buffer drain | **`IDLE`** | 14 bpm resting breathing, stochastic blinking, subtle micro-sway. |
| `voice.error` / Exception | **`ERROR`** | Concerned downward posture and amber/red status badge. |

---

## 7. Security, Privacy & Tenant Isolation

1. **Zero Secret Exposure:** Deepgram and ElevenLabs API keys are stored exclusively in backend environment configuration (`.env` / Pydantic Settings). Never bundled in client JavaScript.
2. **Ephemeral Audio Processing:** Inbound audio chunks are streamed directly through memory buffers to the STT provider and immediately discarded. No unencrypted audio files are written to kiosk local storage.
3. **Tenant Context Enforcement:** WebSocket connections resolve the tenant ID from the authenticated session context. Cross-tenant audio spoofing is rejected.
4. **Rate & Size Limiting:** Chunks exceeding 256 KB are rejected with `AUDIO_PROCESSING_ERROR`.
