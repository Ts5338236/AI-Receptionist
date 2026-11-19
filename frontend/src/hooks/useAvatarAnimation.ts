"use client";

import { useEffect, useRef } from "react";

export interface UseAvatarAnimationOptions {
  enabled?: boolean;
  onUpdate: (elapsedSeconds: number, deltaSeconds: number) => void;
}

export function useAvatarAnimation({
  enabled = true,
  onUpdate,
}: UseAvatarAnimationOptions) {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    if (!enabled) return;

    let animationFrameId: number;
    let lastTime = performance.now();
    let startTime = lastTime;

    const loop = (currentTime: number) => {
      const deltaSeconds = Math.min((currentTime - lastTime) / 1000, 0.1);
      const elapsedSeconds = (currentTime - startTime) / 1000;
      lastTime = currentTime;

      onUpdateRef.current(elapsedSeconds, deltaSeconds);

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [enabled]);
}
