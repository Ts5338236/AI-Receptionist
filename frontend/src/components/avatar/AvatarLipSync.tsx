import { LipSyncFrame, Viseme } from "../../types/avatar";
import { VISEME_MAP } from "../../config/avatar.config";

export interface LipSyncMouthWeights {
  mouthOpen: number; // 0.0 to 1.0 (vertical mouth opening)
  mouthWide: number; // -1.0 (pucker/O) to 1.0 (wide smile/E)
  activeViseme: Viseme;
  intensity: number;
}

export interface LipSyncEngine {
  isPlaying: boolean;
  start: (frames: LipSyncFrame[], startTimeOffsetMs?: number) => void;
  update: (currentTimestampMs: number, deltaSeconds: number) => LipSyncMouthWeights;
  stop: () => void;
  generateTestSequence: (phrase: string, durationMs?: number) => LipSyncFrame[];
}

export function createLipSyncEngine(): LipSyncEngine {
  let isPlaying = false;
  let queue: LipSyncFrame[] = [];
  let playbackStartTime = 0;

  // Smoothed internal weights
  let currentOpen = 0.0;
  let currentWide = 0.0;
  let activeViseme: Viseme = "sil";
  let activeIntensity = 0.0;

  return {
    get isPlaying() {
      return isPlaying;
    },
    start: (frames: LipSyncFrame[], startTimeOffsetMs: number = 0) => {
      queue = [...frames].sort((a, b) => a.timestamp - b.timestamp);
      playbackStartTime = startTimeOffsetMs;
      isPlaying = queue.length > 0;
    },
    stop: () => {
      isPlaying = false;
      queue = [];
      activeViseme = "sil";
      activeIntensity = 0.0;
    },
    update: (currentTimestampMs: number, deltaSeconds: number): LipSyncMouthWeights => {
      if (!isPlaying || queue.length === 0) {
        // Return smoothly to closed mouth (silence)
        currentOpen += (0.0 - currentOpen) * Math.min(1.0, deltaSeconds * 12.0);
        currentWide += (0.0 - currentWide) * Math.min(1.0, deltaSeconds * 12.0);
        return {
          mouthOpen: Math.max(0.0, currentOpen),
          mouthWide: currentWide,
          activeViseme: "sil",
          intensity: 0.0,
        };
      }

      const relativeTime = currentTimestampMs - playbackStartTime;

      // Find frame index closest to relativeTime
      let frameIndex = -1;
      for (let i = 0; i < queue.length; i++) {
        if (queue[i].timestamp <= relativeTime) {
          frameIndex = i;
        } else {
          break;
        }
      }

      let targetOpen = 0.0;
      let targetWide = 0.0;

      if (frameIndex >= 0 && frameIndex < queue.length) {
        const currentFrame = queue[frameIndex];
        const nextFrame = queue[frameIndex + 1];

        activeViseme = currentFrame.viseme;
        activeIntensity = currentFrame.intensity;

        const currentMap = VISEME_MAP[currentFrame.viseme] || VISEME_MAP.sil;

        if (nextFrame) {
          // Interpolate between current and next frame
          const segmentDuration = nextFrame.timestamp - currentFrame.timestamp;
          const frameProgress = segmentDuration > 0
            ? Math.min(1.0, (relativeTime - currentFrame.timestamp) / segmentDuration)
            : 1.0;

          const nextMap = VISEME_MAP[nextFrame.viseme] || VISEME_MAP.sil;

          targetOpen =
            (currentMap.openRatio * currentFrame.intensity) * (1 - frameProgress) +
            (nextMap.openRatio * nextFrame.intensity) * frameProgress;

          targetWide =
            currentMap.wideRatio * (1 - frameProgress) + nextMap.wideRatio * frameProgress;
        } else {
          targetOpen = currentMap.openRatio * currentFrame.intensity;
          targetWide = currentMap.wideRatio;
        }
      } else if (frameIndex >= queue.length - 1) {
        // Finished queue
        isPlaying = false;
      }

      // Smooth interpolation to avoid robotic stutter
      const damping = Math.min(1.0, deltaSeconds * 20.0);
      currentOpen += (targetOpen - currentOpen) * damping;
      currentWide += (targetWide - currentWide) * damping;

      return {
        mouthOpen: Math.max(0.0, currentOpen),
        mouthWide: currentWide,
        activeViseme,
        intensity: activeIntensity,
      };
    },
    generateTestSequence: (phrase: string, durationMs: number = 3000): LipSyncFrame[] => {
      // Deterministic viseme sequence for testing
      const visemes: Viseme[] = ["sil", "PP", "aa", "TH", "E", "DD", "O", "CH", "I", "RR", "sil"];
      const step = durationMs / visemes.length;
      return visemes.map((viseme, index) => ({
        timestamp: index * step,
        viseme,
        intensity: viseme === "sil" ? 0.0 : 0.7 + (index % 3) * 0.15,
      }));
    },
  };
}
