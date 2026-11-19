export type AvatarState =
  | "IDLE"
  | "LISTENING"
  | "THINKING"
  | "SPEAKING"
  | "ERROR";

export type AvatarEmotion = "neutral" | "welcoming" | "listening" | "focused" | "concerned";

export interface AvatarConfig {
  name: string;
  voiceGender: "female" | "male" | "neutral";
  defaultLanguage: "en" | "hi";
  interactiveLookAround: boolean;
  ambientParticles: boolean;
  modelQuality: "ultra" | "high" | "balanced" | "battery_saver";
}

export interface AvatarStateProps {
  state: AvatarState;
  emotion?: AvatarEmotion;
  volumeLevel?: number; // 0 to 1
  isMuted?: boolean;
  onStateChange?: (newState: AvatarState) => void;
  className?: string;
}
