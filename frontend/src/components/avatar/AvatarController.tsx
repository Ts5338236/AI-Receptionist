"use client";

import React, { forwardRef, useImperativeHandle, useState } from "react";
import { AvatarScene } from "./AvatarScene";
import {
  AvatarOperationalState,
  AvatarExpression,
  AvatarQualityLevel,
  AvatarControllerAPI,
  LipSyncFrame,
} from "../../types/avatar";

export interface AvatarControllerProps {
  initialState?: AvatarOperationalState;
  initialExpression?: AvatarExpression;
  quality?: AvatarQualityLevel;
  customMessage?: string;
  showControls?: boolean;
  className?: string;
}

export const AvatarController = forwardRef<AvatarControllerAPI, AvatarControllerProps>(
  function AvatarController(
    {
      initialState = "IDLE",
      initialExpression = "neutral",
      quality = "HIGH",
      customMessage,
      showControls = false,
      className = "",
    },
    ref
  ) {
    const [state, setState] = useState<AvatarOperationalState>(initialState);
    const [expression, setExpression] = useState<AvatarExpression>(initialExpression);
    const [lipSyncFrames, setLipSyncFrames] = useState<LipSyncFrame[]>([]);

    useImperativeHandle(ref, () => ({
      setState: (newState: AvatarOperationalState) => {
        setState(newState);
      },
      setExpression: (newExpr: AvatarExpression) => {
        setExpression(newExpr);
      },
      playAnimation: (animName: string) => {
        if (animName.toLowerCase().includes("speak")) {
          setState("SPEAKING");
        } else if (animName.toLowerCase().includes("listen")) {
          setState("LISTENING");
        } else if (animName.toLowerCase().includes("think")) {
          setState("THINKING");
        }
      },
      stopAnimation: () => {
        setState("IDLE");
      },
      startLipSync: (frames: LipSyncFrame[]) => {
        setLipSyncFrames(frames);
        setState("SPEAKING");
      },
      updateLipSync: () => {},
      stopLipSync: () => {
        setLipSyncFrames([]);
        setState("IDLE");
      },
      resetAvatar: () => {
        setState("IDLE");
        setExpression("neutral");
        setLipSyncFrames([]);
      },
      dispose: () => {
        setState("DISABLED");
      },
    }));

    return (
      <AvatarScene
        state={state}
        expression={expression}
        quality={quality}
        customMessage={customMessage}
        showControls={showControls}
        lipSyncFrames={lipSyncFrames}
        onStateChange={setState}
        className={className}
      />
    );
  }
);
