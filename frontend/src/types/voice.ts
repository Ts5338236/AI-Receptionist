/**
 * Voice Gateway and Real-Time Audio Protocol Type Definitions.
 */

export type VoiceConnectionState =
  | "DISCONNECTED"
  | "CONNECTING"
  | "CONNECTED"
  | "LISTENING"
  | "PROCESSING"
  | "SPEAKING"
  | "ERROR";

export type MicrophonePermissionState =
  | "PROMPT"
  | "GRANTED"
  | "DENIED"
  | "UNSUPPORTED";

export interface VisemeTimingFrame {
  viseme: string;
  start_ms: number;
  duration_ms: number;
}

export type ClientEventType =
  | "voice.start"
  | "audio.chunk"
  | "voice.stop"
  | "voice.cancel"
  | "voice.ping";

export type ServerEventType =
  | "voice.ready"
  | "transcript.partial"
  | "transcript.final"
  | "speech.started"
  | "speech.audio_chunk"
  | "speech.completed"
  | "voice.error"
  | "voice.closed"
  | "voice.pong";

export interface VoiceStartPayload {
  session_id?: string;
  language?: string;
  audio_format?: string;
  sample_rate?: number;
  kiosk_id?: string;
  tenant_id?: string;
}

export interface AudioChunkPayload {
  chunk_index: number;
  data: string; // Base64 audio
  timestamp_ms?: number;
  is_silent?: boolean;
}

export interface TranscriptPayload {
  session_id: string;
  text: string;
  is_final: boolean;
  confidence: number;
  language: string;
}

export interface SpeechStartedPayload {
  session_id: string;
  audio_format: string;
  sample_rate: number;
  voice_id: string;
}

export interface SpeechAudioChunkPayload {
  session_id: string;
  chunk_index: number;
  data: string; // Base64 audio chunk
  is_last_chunk: boolean;
  visemes?: VisemeTimingFrame[] | null;
}

export interface SpeechCompletedPayload {
  session_id: string;
  total_chunks: number;
  duration_ms?: number;
}

export interface VoiceErrorPayload {
  code: string;
  message: string;
  recoverable: boolean;
  details?: Record<string, unknown>;
}

export interface VoiceServerMessage {
  event: ServerEventType;
  session_id: string;
  timestamp: string;
  payload: Record<string, unknown>;
}

export interface VoiceClientMessage {
  event: ClientEventType;
  session_id?: string;
  timestamp: string;
  payload: Record<string, unknown>;
}
