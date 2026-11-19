import { Avatar3DConfig, Viseme, AvatarExpression } from "../types/avatar";

export const DEFAULT_AVATAR_CONFIG: Avatar3DConfig = {
  modelUrl: "/models/receptionist_avatar.glb",
  enableShadows: true,
  quality: "HIGH",
  cameraFov: 32,
  lookAtCamera: true,
  ambientIntensity: 0.85,
  directionalIntensity: 1.2,
  breathingRate: 14, // 14 breaths per minute
  blinkIntervalMs: 3800,
};

export const VISEME_MAP: Record<Viseme, { morphName: string; openRatio: number; wideRatio: number }> = {
  sil: { morphName: "viseme_sil", openRatio: 0.0, wideRatio: 0.0 },
  PP:  { morphName: "viseme_PP",  openRatio: 0.0, wideRatio: 0.1 },
  FF:  { morphName: "viseme_FF",  openRatio: 0.2, wideRatio: 0.2 },
  TH:  { morphName: "viseme_TH",  openRatio: 0.25, wideRatio: 0.3 },
  DD:  { morphName: "viseme_DD",  openRatio: 0.3, wideRatio: 0.4 },
  kk:  { morphName: "viseme_kk",  openRatio: 0.35, wideRatio: 0.3 },
  CH:  { morphName: "viseme_CH",  openRatio: 0.4, wideRatio: 0.5 },
  SS:  { morphName: "viseme_SS",  openRatio: 0.2, wideRatio: 0.6 },
  nn:  { morphName: "viseme_nn",  openRatio: 0.25, wideRatio: 0.35 },
  RR:  { morphName: "viseme_RR",  openRatio: 0.35, wideRatio: 0.1 },
  aa:  { morphName: "viseme_aa",  openRatio: 0.85, wideRatio: 0.5 },
  E:   { morphName: "viseme_E",   openRatio: 0.5, wideRatio: 0.7 },
  I:   { morphName: "viseme_I",   openRatio: 0.4, wideRatio: 0.8 },
  O:   { morphName: "viseme_O",   openRatio: 0.7, wideRatio: -0.2 },
  U:   { morphName: "viseme_U",   openRatio: 0.4, wideRatio: -0.4 },
};

export const EXPRESSION_WEIGHTS: Record<AvatarExpression, Record<string, number>> = {
  neutral: {
    browInnerUp: 0.0,
    mouthSmile: 0.05,
    eyeSquint: 0.0,
  },
  happy: {
    browInnerUp: 0.15,
    mouthSmile: 0.7,
    eyeSquint: 0.3,
  },
  smiling: {
    browInnerUp: 0.1,
    mouthSmile: 0.55,
    eyeSquint: 0.2,
  },
  listening: {
    browInnerUp: 0.3,
    mouthSmile: 0.2,
    headTilt: 0.05,
  },
  thinking: {
    browInnerUp: 0.4,
    browDownLeft: 0.3,
    mouthSmile: -0.1,
  },
  speaking: {
    browInnerUp: 0.2,
    mouthSmile: 0.25,
  },
  confused: {
    browDownLeft: 0.5,
    browInnerUp: 0.3,
    mouthFrown: 0.3,
  },
  error: {
    browInnerUp: 0.5,
    eyeWide: 0.4,
    mouthFrown: 0.4,
  },
  welcoming: {
    browInnerUp: 0.25,
    mouthSmile: 0.8,
    eyeSquint: 0.25,
  },
};

/**
 * Enterprise 3D Character Model Specifications for Phase 3/4
 */
export const REQUIRED_MODEL_SPECIFICATIONS = {
  format: "GLTF 2.0 (.glb binary container)",
  maxPolygonCount: "35,000 to 50,000 triangles (optimized for kiosk WebGL)",
  rigging: "Humanoid humanoid skeleton (Standard Mixamo / ReadyPlayerMe hierarchy)",
  blendShapes: [
    "ARKit 52 blend shapes or Oculus 15 visemes",
    "eyeBlinkLeft, eyeBlinkRight",
    "jawOpen, mouthSmile, mouthFrown, mouthPucker",
    "browInnerUp, browDownLeft, browDownRight",
  ],
  textures: {
    albedo: "2048x2048 PNG/JPEG",
    normal: "2048x2048 tangent-space normal map",
    roughnessMetallic: "2048x2048 packed ORM map (Occlusion, Roughness, Metallic)",
  },
  animations: [
    "Idle_Breathing",
    "Welcoming_Gesture",
    "Talking_01",
    "Listening_Attentive",
    "Thinking_Subtle",
  ],
};
