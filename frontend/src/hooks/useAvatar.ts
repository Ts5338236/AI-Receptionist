"use client";

import { useState, useCallback } from "react";
import {
  AvatarOperationalState,
  AvatarExpression,
  AvatarQualityLevel,
} from "../types/avatar";

export interface UseAvatarOptions {
  initialState?: AvatarOperationalState;
  initialExpression?: AvatarExpression;
  quality?: AvatarQualityLevel;
}

export function useAvatar(options: UseAvatarOptions = {}) {
  const {
    initialState = "IDLE",
    initialExpression = "neutral",
    quality = "HIGH",
  } = options;

  const [state, setStateInternal] = useState<AvatarOperationalState>(initialState);
  const [expression, setExpression] = useState<AvatarExpression>(initialExpression);
  const [currentQuality, setQuality] = useState<AvatarQualityLevel>(quality);

  const setState = useCallback((nextState: AvatarOperationalState) => {
    setStateInternal(nextState);

    // Synchronize default expression to state
    switch (nextState) {
      case "LISTENING":
        setExpression("listening");
        break;
      case "THINKING":
        setExpression("thinking");
        break;
      case "SPEAKING":
        setExpression("speaking");
        break;
      case "GREETING":
        setExpression("welcoming");
        break;
      case "ERROR":
        setExpression("error");
        break;
      case "IDLE":
      default:
        setExpression("neutral");
        break;
    }
  }, []);

  const resetAvatar = useCallback(() => {
    setStateInternal("IDLE");
    setExpression("neutral");
  }, []);

  return {
    state,
    expression,
    quality: currentQuality,
    setState,
    setExpression,
    setQuality,
    resetAvatar,
  };
}
