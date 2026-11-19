"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  VoiceConnectionState,
  VoiceServerMessage,
  VoiceClientMessage,
  TranscriptPayload,
  SpeechAudioChunkPayload,
  VisemeTimingFrame,
} from "@/types/voice";
import { useAudioCapture } from "@/hooks/useAudioCapture";
import { useAudioPlayback } from "@/hooks/useAudioPlayback";
import { AvatarControllerAPI, LipSyncFrame, Viseme } from "@/types/avatar";

export interface VoiceMessage {
  id: string;
  sender: "receptionist" | "visitor";
  text: string;
  time: string;
  isPartial?: boolean;
}

export interface UseVoiceClientOptions {
  wsUrl?: string;
  language?: string;
  kioskId?: string;
  tenantId?: string;
  avatarRef?: React.RefObject<AvatarControllerAPI | null>;
  onTranscriptReceived?: (transcript: string, isFinal: boolean) => void;
  onSpeechStarted?: () => void;
  onSpeechCompleted?: () => void;
}

export function useVoiceClient({
  wsUrl = process.env.NEXT_PUBLIC_WS_BASE_URL || "ws://localhost:8000/api/v1/voice/ws",
  language = "en-US",
  kioskId = "kiosk-default-01",
  tenantId = "00000000-0000-0000-0000-000000000001",
  avatarRef,
  onTranscriptReceived,
  onSpeechStarted,
  onSpeechCompleted,
}: UseVoiceClientOptions = {}) {
  const [connectionState, setConnectionState] =
    useState<VoiceConnectionState>("DISCONNECTED");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [partialTranscript, setPartialTranscript] = useState<string>("");
  const [finalTranscript, setFinalTranscript] = useState<string>("");
  const [messages, setMessages] = useState<VoiceMessage[]>([
    {
      id: "init",
      sender: "receptionist",
      text: "Hello! I am your AI Receptionist. You can speak to me naturally or select an action on screen.",
      time: "Just now",
    },
  ]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const isConnectingRef = useRef(false);

  // Audio Playback Hook
  const playback = useAudioPlayback({
    onPlaybackStarted: () => {
      avatarRef?.current?.setState("SPEAKING");
      onSpeechStarted?.();
    },
    onPlaybackEnded: () => {
      avatarRef?.current?.setState("IDLE");
      avatarRef?.current?.stopLipSync();
      onSpeechCompleted?.();
    },
    onError: (err) => {
      setErrorMessage(`Playback error: ${err.message}`);
    },
  });

  const sendClientEvent = useCallback((event: VoiceClientMessage) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(event));
    }
  }, []);

  // Audio Capture Hook
  const capture = useAudioCapture({
    sampleRate: 16000,
    chunkIntervalMs: 250,
    silenceTimeoutMs: 1400,
    onAudioChunk: (base64Chunk, chunkIndex) => {
      sendClientEvent({
        event: "audio.chunk",
        session_id: sessionId || undefined,
        timestamp: new Date().toISOString(),
        payload: {
          chunk_index: chunkIndex,
          data: base64Chunk,
        },
      });
    },
    onSilenceDetected: () => {
      // VAD End-of-utterance: stop capture and send voice.stop
      capture.stop();
      avatarRef?.current?.setState("THINKING");
      setConnectionState("PROCESSING");
      sendClientEvent({
        event: "voice.stop",
        session_id: sessionId || undefined,
        timestamp: new Date().toISOString(),
        payload: { reason: "vad_silence_detected" },
      });
    },
    onError: (err) => {
      setErrorMessage(`Microphone error: ${err.message}`);
      avatarRef?.current?.setState("ERROR");
    },
  });

  // Connect WebSocket
  const connect = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      return;
    }
    if (isConnectingRef.current) return;
    isConnectingRef.current = true;
    setConnectionState("CONNECTING");

    const fullUrl = `${wsUrl}?tenant_id=${encodeURIComponent(
      tenantId
    )}&kiosk_id=${encodeURIComponent(kioskId)}`;

    try {
      const ws = new WebSocket(fullUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        isConnectingRef.current = false;
        setConnectionState("CONNECTED");
        setErrorMessage(null);

        // Perform voice.start handshake
        const startMsg: VoiceClientMessage = {
          event: "voice.start",
          timestamp: new Date().toISOString(),
          payload: {
            language,
            sample_rate: 16000,
            kiosk_id: kioskId,
            tenant_id: tenantId,
          },
        };
        ws.send(JSON.stringify(startMsg));
      };

      ws.onmessage = (event) => {
        try {
          const serverMsg: VoiceServerMessage = JSON.parse(event.data);
          handleServerMessage(serverMsg);
        } catch {
          // ignore parse errors
        }
      };

      ws.onerror = () => {
        isConnectingRef.current = false;
        setConnectionState("ERROR");
        avatarRef?.current?.setState("ERROR");
      };

      ws.onclose = () => {
        isConnectingRef.current = false;
        setConnectionState("DISCONNECTED");
        socketRef.current = null;
      };
    } catch (wsErr) {
      isConnectingRef.current = false;
      setConnectionState("ERROR");
      setErrorMessage(`WebSocket connection failed: ${(wsErr as Error).message}`);
    }
  }, [wsUrl, tenantId, kioskId, language, avatarRef]);

  // Handle incoming server events
  const handleServerMessage = useCallback(
    (msg: VoiceServerMessage) => {
      switch (msg.event) {
        case "voice.ready": {
          const readySessionId = msg.session_id;
          setSessionId(readySessionId);
          setConnectionState("CONNECTED");
          break;
        }

        case "transcript.partial": {
          const pData = msg.payload as unknown as TranscriptPayload;
          if (pData.text) {
            setPartialTranscript(pData.text);
            onTranscriptReceived?.(pData.text, false);
          }
          break;
        }

        case "transcript.final": {
          const fData = msg.payload as unknown as TranscriptPayload;
          setPartialTranscript("");
          setFinalTranscript(fData.text);
          onTranscriptReceived?.(fData.text, true);

          if (fData.text) {
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now().toString(),
                sender: "visitor",
                text: fData.text,
                time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              },
            ]);
          }
          break;
        }

        case "speech.started": {
          setConnectionState("SPEAKING");
          avatarRef?.current?.setState("SPEAKING");
          break;
        }

        case "speech.audio_chunk": {
          const chunkData = msg.payload as unknown as SpeechAudioChunkPayload;
          if (chunkData.data) {
            playback.queueAudioChunk(chunkData.data);
          }

          // Visemes lip-sync sync
          if (chunkData.visemes && chunkData.visemes.length > 0) {
            const lipSyncFrames: LipSyncFrame[] = chunkData.visemes.map((v: VisemeTimingFrame) => ({
              viseme: (v.viseme.replace("viseme_", "") || "sil") as Viseme,
              timestamp: v.start_ms,
              intensity: 1.0,
            }));
            avatarRef?.current?.startLipSync(lipSyncFrames);
          }
          break;
        }

        case "speech.completed": {
          // Playback handles returning avatar to IDLE when buffers drain
          break;
        }

        case "voice.error": {
          setConnectionState("ERROR");
          setErrorMessage(String(msg.payload.message || "Voice gateway error"));
          avatarRef?.current?.setState("ERROR");
          break;
        }

        default:
          break;
      }
    },
    [avatarRef, onTranscriptReceived, playback]
  );

  // Start Speaking / Listening
  const startListening = useCallback(async () => {
    // Barge-in: if avatar is currently speaking, stop playback immediately
    if (playback.isPlaying) {
      playback.stop();
      sendClientEvent({
        event: "voice.cancel",
        session_id: sessionId || undefined,
        timestamp: new Date().toISOString(),
        payload: { reason: "barge_in" },
      });
    }

    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      connect();
    }

    // Unlock browser audio context for playback
    playback.getAudioContext();

    const ok = await capture.start();
    if (ok) {
      setConnectionState("LISTENING");
      avatarRef?.current?.setState("LISTENING");
    }
  }, [connect, capture, playback, sendClientEvent, sessionId, avatarRef]);

  // Stop Listening
  const stopListening = useCallback(() => {
    capture.stop();
    setConnectionState("PROCESSING");
    avatarRef?.current?.setState("THINKING");

    sendClientEvent({
      event: "voice.stop",
      session_id: sessionId || undefined,
      timestamp: new Date().toISOString(),
      payload: { reason: "manual_stop" },
    });
  }, [capture, sendClientEvent, sessionId, avatarRef]);

  // Cancel in-flight response
  const cancelSpeech = useCallback(() => {
    playback.stop();
    avatarRef?.current?.setState("IDLE");
    setConnectionState("CONNECTED");

    sendClientEvent({
      event: "voice.cancel",
      session_id: sessionId || undefined,
      timestamp: new Date().toISOString(),
      payload: { reason: "user_cancel" },
    });
  }, [playback, sendClientEvent, sessionId, avatarRef]);

  // Disconnect & cleanup
  const disconnect = useCallback(() => {
    capture.cleanup();
    playback.stop();
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    setConnectionState("DISCONNECTED");
  }, [capture, playback]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connectionState,
    sessionId,
    isRecording: capture.isRecording,
    isPlaying: playback.isPlaying,
    isMuted: capture.isMuted,
    audioLevel: capture.audioLevel,
    permissionState: capture.permissionState,
    partialTranscript,
    finalTranscript,
    messages,
    errorMessage,
    startListening,
    stopListening,
    cancelSpeech,
    toggleMute: capture.toggleMute,
    connect,
    disconnect,
  };
}
