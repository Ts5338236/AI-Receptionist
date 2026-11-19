"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export interface UseAudioPlaybackOptions {
  onPlaybackStarted?: () => void;
  onPlaybackEnded?: () => void;
  onError?: (error: Error) => void;
}

export function useAudioPlayback({
  onPlaybackStarted,
  onPlaybackEnded,
  onError,
}: UseAudioPlaybackOptions = {}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const chunkQueueRef = useRef<ArrayBuffer[]>([]);
  const isProcessingQueueRef = useRef(false);
  const nextStartTimeRef = useRef(0);
  const totalQueuedRef = useRef(0);

  // Initialize or get unlocked AudioContext
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioContextRef.current = new AudioCtx();
    }
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  const stop = useCallback(() => {
    // Abort active source nodes
    activeSourcesRef.current.forEach((src) => {
      try {
        src.stop();
        src.disconnect();
      } catch {
        // ignore
      }
    });
    activeSourcesRef.current = [];
    chunkQueueRef.current = [];
    isProcessingQueueRef.current = false;
    nextStartTimeRef.current = 0;
    totalQueuedRef.current = 0;
    setIsPlaying(false);
  }, []);

  const processQueue = useCallback(async () => {
    if (isProcessingQueueRef.current) return;
    isProcessingQueueRef.current = true;

    const ctx = getAudioContext();

    while (chunkQueueRef.current.length > 0) {
      const rawChunk = chunkQueueRef.current.shift();
      if (!rawChunk) continue;

      try {
        // decodeAudioData detaches the arrayBuffer, so we slice a copy
        const bufferCopy = rawChunk.slice(0);
        const decodedBuffer = await ctx.decodeAudioData(bufferCopy);

        const source = ctx.createBufferSource();
        source.buffer = decodedBuffer;
        source.connect(ctx.destination);

        const currentTime = ctx.currentTime;
        const startTime = Math.max(currentTime, nextStartTimeRef.current);
        source.start(startTime);
        nextStartTimeRef.current = startTime + decodedBuffer.duration;

        activeSourcesRef.current.push(source);

        source.onended = () => {
          activeSourcesRef.current = activeSourcesRef.current.filter((s) => s !== source);
          if (activeSourcesRef.current.length === 0 && chunkQueueRef.current.length === 0) {
            setIsPlaying(false);
            onPlaybackEnded?.();
          }
        };
      } catch (decodeErr) {
        onError?.(decodeErr as Error);
      }
    }

    isProcessingQueueRef.current = false;
  }, [getAudioContext, onPlaybackEnded, onError]);

  const queueAudioChunk = useCallback(
    (base64Audio: string) => {
      if (!base64Audio) return;

      try {
        const binaryString = atob(base64Audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        chunkQueueRef.current.push(bytes.buffer);
        totalQueuedRef.current += 1;

        if (!isPlaying) {
          setIsPlaying(true);
          onPlaybackStarted?.();
        }

        processQueue();
      } catch (err) {
        onError?.(err as Error);
      }
    },
    [isPlaying, onPlaybackStarted, processQueue, onError]
  );

  useEffect(() => {
    return () => {
      stop();
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        try {
          audioContextRef.current.close();
        } catch {
          // ignore
        }
      }
    };
  }, [stop]);

  return {
    isPlaying,
    queueAudioChunk,
    stop,
    getAudioContext,
  };
}
