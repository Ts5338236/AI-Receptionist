import { AvatarExpression } from "../../types/avatar";
import { EXPRESSION_WEIGHTS } from "../../config/avatar.config";

export interface ExpressionController {
  currentExpression: AvatarExpression;
  targetExpression: AvatarExpression;
  transitionDuration: number;
  progress: number;
  setExpression: (expr: AvatarExpression, durationSec?: number) => void;
  update: (deltaSeconds: number) => Record<string, number>;
}

export function createExpressionController(
  initialExpression: AvatarExpression = "neutral"
): ExpressionController {
  let currentExpression: AvatarExpression = initialExpression;
  let targetExpression: AvatarExpression = initialExpression;
  let transitionDuration = 0.35; // 350ms smooth transition
  let progress = 1.0;

  // Current interpolated morph weights
  const currentWeights: Record<string, number> = {
    ...EXPRESSION_WEIGHTS[initialExpression],
  };

  return {
    get currentExpression() {
      return currentExpression;
    },
    get targetExpression() {
      return targetExpression;
    },
    get transitionDuration() {
      return transitionDuration;
    },
    get progress() {
      return progress;
    },
    setExpression: (expr: AvatarExpression, durationSec: number = 0.35) => {
      if (expr === targetExpression) return;
      currentExpression = targetExpression;
      targetExpression = expr;
      transitionDuration = Math.max(0.1, durationSec);
      progress = 0.0;
    },
    update: (deltaSeconds: number): Record<string, number> => {
      if (progress < 1.0) {
        progress = Math.min(1.0, progress + deltaSeconds / transitionDuration);
      }

      // Smooth cubic ease-in-out interpolation
      const t = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;

      const targetWeights = EXPRESSION_WEIGHTS[targetExpression] || EXPRESSION_WEIGHTS.neutral;
      const prevWeights = EXPRESSION_WEIGHTS[currentExpression] || EXPRESSION_WEIGHTS.neutral;

      const allKeys = Array.from(
        new Set([...Object.keys(targetWeights), ...Object.keys(prevWeights)])
      );

      for (const key of allKeys) {
        const from = prevWeights[key] || 0.0;
        const to = targetWeights[key] || 0.0;
        currentWeights[key] = from + (to - from) * t;
      }

      return { ...currentWeights };
    },
  };
}
