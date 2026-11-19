"use client";

import { useState, useCallback, useRef } from "react";
import { LipSyncFrame } from "../types/avatar";
import { createLipSyncEngine } from "../components/avatar/AvatarLipSync";

export function useAvatarLipSync() {
  const engineRef = useRef(createLipSyncEngine());
  const [isPlaying, setIsPlaying] = useState(false);

  const start = useCallback((frames: LipSyncFrame[], startTimeOffsetMs?: number) => {
    engineRef.current.start(frames, startTimeOffsetMs || performance.now());
    setIsPlaying(true);
  }, []);

  const stop = useCallback(() => {
    engineRef.current.stop();
    setIsPlaying(false);
  }, []);

  const playTestPhrase = useCallback((phrase: string, durationMs: number = 3000) => {
    const frames = engineRef.current.generateTestSequence(phrase, durationMs);
    start(frames);
    return frames;
  }, [start]);

  const update = useCallback((currentTimestampMs: number, deltaSeconds: number) => {
    const weights = engineRef.current.update(currentTimestampMs, deltaSeconds);
    if (!engineRef.current.isPlaying && isPlaying) {
      setIsPlaying(false);
    }
    return weights;
  }, [isPlaying]);

  return {
    isPlaying,
    start,
    stop,
    playTestPhrase,
    update,
  };
}
