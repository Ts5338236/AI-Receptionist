"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { MicrophonePermissionState } from "@/types/voice";

export interface UseAudioCaptureOptions {
  sampleRate?: number;
  chunkIntervalMs?: number;
  silenceTimeoutMs?: number;
  maxRecordingMs?: number;
  onAudioChunk?: (base64Chunk: string, chunkIndex: number) => void;
  onSilenceDetected?: () => void;
  onError?: (error: Error) => void;
}

export function useAudioCapture({
  sampleRate = 16000,
  chunkIntervalMs = 250,
  silenceTimeoutMs = 1500,
  maxRecordingMs = 15000,
  onAudioChunk,
  onSilenceDetected,
  onError,
}: UseAudioCaptureOptions = {}) {
  const [permissionState, setPermissionState] =
    useState<MicrophonePermissionState>("PROMPT");
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0); // 0.0 to 1.0

  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const chunkIndexRef = useRef(0);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const maxTimerRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const hadSpeechRef = useRef(false);

  // Check support on mount
  useEffect(() => {
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setPermissionState("UNSUPPORTED");
    }
  }, []);

  // Cleanup helper
  const cleanup = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (maxTimerRef.current) {
      clearTimeout(maxTimerRef.current);
      maxTimerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }
    mediaRecorderRef.current = null;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      try {
        audioContextRef.current.close();
      } catch {
        // ignore
      }
      audioContextRef.current = null;
    }

    setIsRecording(false);
    setAudioLevel(0);
    hadSpeechRef.current = false;
  }, []);

  const monitorAudioLevel = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    const average = sum / dataArray.length;
    const normalized = Math.min(1.0, average / 128.0);
    setAudioLevel(normalized);

    // VAD Speech & Silence tracking
    const speechThreshold = 0.12;
    if (normalized > speechThreshold) {
      hadSpeechRef.current = true;
      // Reset silence countdown timer
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    } else if (hadSpeechRef.current && !silenceTimerRef.current) {
      // User was speaking and is now silent
      silenceTimerRef.current = setTimeout(() => {
        onSilenceDetected?.();
      }, silenceTimeoutMs);
    }

    animationFrameRef.current = requestAnimationFrame(monitorAudioLevel);
  }, [silenceTimeoutMs, onSilenceDetected]);

  const start = useCallback(async () => {
    cleanup();
    chunkIndexRef.current = 0;
    hadSpeechRef.current = false;

    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setPermissionState("UNSUPPORTED");
      onError?.(new Error("Microphone API is not supported in this browser environment."));
      return false;
    }

    try {
      setPermissionState("PROMPT");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: sampleRate,
        },
      });

      streamRef.current = stream;
      setPermissionState("GRANTED");

      // Setup Web Audio Analyser for VAD & Level monitoring
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Setup MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = async (e) => {
        if (e.data && e.data.size > 0 && onAudioChunk) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(",")[1];
            if (base64) {
              onAudioChunk(base64, chunkIndexRef.current);
              chunkIndexRef.current += 1;
            }
          };
          reader.readAsDataURL(e.data);
        }
      };

      recorder.start(chunkIntervalMs);
      setIsRecording(true);
      setIsMuted(false);

      // Start level monitoring
      animationFrameRef.current = requestAnimationFrame(monitorAudioLevel);

      // Max recording ceiling timer
      maxTimerRef.current = setTimeout(() => {
        onSilenceDetected?.();
      }, maxRecordingMs);

      return true;
    } catch (err: unknown) {
      const error = err as Error;
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        setPermissionState("DENIED");
      } else {
        setPermissionState("UNSUPPORTED");
      }
      onError?.(error);
      cleanup();
      return false;
    }
  }, [
    cleanup,
    sampleRate,
    chunkIntervalMs,
    maxRecordingMs,
    monitorAudioLevel,
    onAudioChunk,
    onSilenceDetected,
    onError,
  ]);

  const stop = useCallback(() => {
    cleanup();
  }, [cleanup]);

  const toggleMute = useCallback(() => {
    if (!streamRef.current) return;
    const tracks = streamRef.current.getAudioTracks();
    tracks.forEach((track) => {
      track.enabled = !track.enabled;
    });
    setIsMuted((prev) => !prev);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    permissionState,
    isRecording,
    isMuted,
    audioLevel,
    start,
    stop,
    toggleMute,
    cleanup,
  };
}
