"use client";

import { useState, useCallback, useRef } from "react";
import { AvatarExpression } from "../types/avatar";
import { createExpressionController } from "../components/avatar/AvatarExpressions";

export function useAvatarExpressions(initialExpression: AvatarExpression = "neutral") {
  const [expression, setExpressionState] = useState<AvatarExpression>(initialExpression);
  const controllerRef = useRef(createExpressionController(initialExpression));

  const setExpression = useCallback((newExpr: AvatarExpression, durationSec?: number) => {
    setExpressionState(newExpr);
    controllerRef.current.setExpression(newExpr, durationSec);
  }, []);

  const update = useCallback((deltaSeconds: number) => {
    return controllerRef.current.update(deltaSeconds);
  }, []);

  return {
    expression,
    setExpression,
    update,
  };
}
