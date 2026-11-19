/**
 * Phase 3: Digital Human Avatar TypeScript Specifications
 */

export type AvatarOperationalState =
  | "IDLE"
  | "LISTENING"
  | "THINKING"
  | "SPEAKING"
  | "GREETING"
  | "ERROR"
  | "DISABLED";

export type AvatarExpression =
  | "neutral"
  | "happy"
  | "smiling"
  | "listening"
  | "thinking"
  | "speaking"
  | "confused"
  | "error"
  | "welcoming";

export type Viseme =
  | "sil" // Silence
  | "PP"  // p, b, m
  | "FF"  // f, v
  | "TH"  // th
  | "DD"  // t, d
  | "kk"  // k, g
  | "CH"  // ch, j, sh
  | "SS"  // s, z
  | "nn"  // n, l
  | "RR"  // r
  | "aa"  // a, ah
  | "E"   // e
  | "I"   // i, ee
  | "O"   // o, oh
  | "U";  // u, oo

export interface LipSyncFrame {
  timestamp: number;
  viseme: Viseme;
  intensity: number; // 0.0 to 1.0
}

export type AvatarQualityLevel = "HIGH" | "MEDIUM" | "LOW";

export interface Avatar3DConfig {
  modelUrl?: string;
  enableShadows: boolean;
  quality: AvatarQualityLevel;
  cameraFov: number;
  lookAtCamera: boolean;
  ambientIntensity: number;
  directionalIntensity: number;
  breathingRate: number; // Cycles per minute
  blinkIntervalMs: number;
}

export interface AvatarControllerAPI {
  setState: (state: AvatarOperationalState) => void;
  setExpression: (expression: AvatarExpression, durationSec?: number) => void;
  playAnimation: (animationName: string) => void;
  stopAnimation: (animationName?: string) => void;
  startLipSync: (frames: LipSyncFrame[]) => void;
  updateLipSync: (currentTimestampMs: number) => void;
  stopLipSync: () => void;
  resetAvatar: () => void;
  dispose: () => void;
}

export interface AvatarModelMetadata {
  isLoaded: boolean;
  modelName: string;
  meshCount: number;
  hasMorphTargets: boolean;
  morphTargetNames: string[];
  animationNames: string[];
  isProceduralFallback: boolean;
}
