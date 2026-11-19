import { AvatarOperationalState } from "../../types/avatar";

export interface GestureOffsets {
  headPitch: number; // Nod up/down (radians)
  headYaw: number;   // Turn left/right (radians)
  headRoll: number;  // Tilt side-to-side (radians)
  chestScaleY: number; // Breathing vertical expansion
  chestScaleZ: number; // Breathing depth expansion
  shoulderOffsetY: number;
  blinkWeight: number; // 0.0 (open) to 1.0 (closed)
}

export interface GestureController {
  update: (
    elapsedSeconds: number,
    deltaSeconds: number,
    state: AvatarOperationalState
  ) => GestureOffsets;
  triggerBlink: () => void;
  reset: () => void;
}

export function createGestureController(
  breathingRate: number = 14,
  blinkIntervalMs: number = 3800
): GestureController {
  let nextBlinkTime = 2.0;
  let isBlinking = false;
  let blinkProgress = 0.0;
  const blinkDuration = 0.16; // 160ms total blink

  const breathingFreq = (breathingRate / 60) * Math.PI * 2;

  return {
    triggerBlink: () => {
      isBlinking = true;
      blinkProgress = 0.0;
    },
    reset: () => {
      isBlinking = false;
      blinkProgress = 0.0;
      nextBlinkTime = 2.0;
    },
    update: (
      elapsedSeconds: number,
      deltaSeconds: number,
      state: AvatarOperationalState
    ): GestureOffsets => {
      // 1. Natural Breathing Motion (Gentle sinusoidal rhythm)
      const breathPhase = Math.sin(elapsedSeconds * breathingFreq);
      const chestScaleY = 1.0 + breathPhase * 0.015;
      const chestScaleZ = 1.0 + breathPhase * 0.02;
      const shoulderOffsetY = breathPhase * 0.008;

      // 2. Natural Blinking Logic
      if (!isBlinking && elapsedSeconds >= nextBlinkTime) {
        isBlinking = true;
        blinkProgress = 0.0;
      }

      let blinkWeight = 0.0;
      if (isBlinking) {
        blinkProgress += deltaSeconds / blinkDuration;
        if (blinkProgress >= 1.0) {
          isBlinking = false;
          blinkProgress = 0.0;
          // Randomize next blink: 2.8s to 5.2s
          nextBlinkTime = elapsedSeconds + (2.8 + Math.random() * 2.4);
        } else {
          // Half sine wave for eye open -> shut -> open
          blinkWeight = Math.sin(blinkProgress * Math.PI);
        }
      }

      // 3. Subtle Head Movement & Posture Adjustments
      let basePitch = 0.0;
      let baseYaw = 0.0;
      let baseRoll = 0.0;

      // Subtle organic sway (Perlin-like superposition of sines)
      const swayPitch = Math.sin(elapsedSeconds * 0.7) * 0.015 + Math.sin(elapsedSeconds * 1.3) * 0.008;
      const swayYaw = Math.sin(elapsedSeconds * 0.5) * 0.02 + Math.cos(elapsedSeconds * 0.9) * 0.01;
      const swayRoll = Math.sin(elapsedSeconds * 0.4) * 0.012;

      switch (state) {
        case "LISTENING":
          // Attentive listening: head tilted slightly to the side and leaned forward
          basePitch = 0.04;
          baseRoll = 0.05;
          baseYaw = Math.sin(elapsedSeconds * 0.3) * 0.01;
          break;
        case "THINKING":
          // Thoughtful posture: head tilted slightly upward and to the side
          basePitch = -0.06;
          baseYaw = 0.05;
          baseRoll = -0.04;
          break;
        case "SPEAKING":
          // Speaking cadence: gentle rhythmic nod matching syllable cadences
          basePitch = Math.sin(elapsedSeconds * 3.8) * 0.025;
          baseYaw = Math.sin(elapsedSeconds * 1.8) * 0.015;
          break;
        case "GREETING":
          // Welcoming slight bow/nod
          basePitch = 0.08 * Math.sin(elapsedSeconds * 2.0);
          baseRoll = 0.0;
          break;
        case "ERROR":
          // Hesitant slight tilt
          baseRoll = -0.06;
          break;
        case "IDLE":
        default:
          break;
      }

      return {
        headPitch: basePitch + swayPitch,
        headYaw: baseYaw + swayYaw,
        headRoll: baseRoll + swayRoll,
        chestScaleY,
        chestScaleZ,
        shoulderOffsetY,
        blinkWeight,
      };
    },
  };
}
