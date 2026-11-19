"use client";

import React, { useState } from "react";
import { AvatarRenderer } from "./AvatarRenderer";
import { AvatarStatus } from "./AvatarStatus";
import { AvatarControls } from "./AvatarControls";
import { AvatarErrorBoundary } from "./AvatarErrorBoundary";
import {
  AvatarOperationalState,
  AvatarExpression,
  AvatarQualityLevel,
  AvatarModelMetadata,
  LipSyncFrame,
} from "../../types/avatar";

export interface AvatarSceneProps {
  state?: AvatarOperationalState;
  expression?: AvatarExpression;
  quality?: AvatarQualityLevel;
  modelUrl?: string;
  customMessage?: string;
  showControls?: boolean;
  lipSyncFrames?: LipSyncFrame[];
  onStateChange?: (state: AvatarOperationalState) => void;
  className?: string;
}

export function AvatarScene({
  state = "IDLE",
  expression = "neutral",
  quality = "HIGH",
  modelUrl,
  customMessage,
  showControls = false,
  lipSyncFrames,
  onStateChange,
  className = "",
}: AvatarSceneProps) {
  const [activeState, setActiveState] = useState<AvatarOperationalState>(state);
  const [activeExpression, setActiveExpression] = useState<AvatarExpression>(expression);
  const [isMuted, setIsMuted] = useState(false);
  const [metadata, setMetadata] = useState<AvatarModelMetadata | null>(null);

  const currentState = state !== undefined ? state : activeState;

  const handleStateChange = (nextState: AvatarOperationalState) => {
    setActiveState(nextState);
    if (onStateChange) onStateChange(nextState);

    // Auto-map state to expression
    if (nextState === "LISTENING") {
      setActiveExpression("listening");
    } else if (nextState === "THINKING") {
      setActiveExpression("thinking");
    } else if (nextState === "SPEAKING") {
      setActiveExpression("speaking");
    } else if (nextState === "GREETING") {
      setActiveExpression("welcoming");
    } else if (nextState === "ERROR") {
      setActiveExpression("error");
    } else {
      setActiveExpression("neutral");
    }
  };

  return (
    <AvatarErrorBoundary state={currentState}>
      <div
        className={`relative flex flex-col items-center justify-center w-full h-full ${className}`}
      >
        {/* Three.js WebGL 3D Avatar Canvas */}
        <div className="relative w-full max-w-lg h-[360px] md:h-[460px] flex items-center justify-center">
          <AvatarRenderer
            state={currentState}
            expression={activeExpression}
            quality={quality}
            modelUrl={modelUrl}
            lipSyncFrames={lipSyncFrames}
            onModelLoaded={setMetadata}
          />
        </div>

        {/* Operational State Badge & Audio Waveform */}
        <div className="mt-2">
          <AvatarStatus
            state={
              currentState === "GREETING"
                ? "SPEAKING"
                : currentState === "DISABLED"
                ? "ERROR"
                : currentState
            }
            customMessage={customMessage}
          />
        </div>

        {/* Controls & Testing Panel */}
        {showControls && (
          <div className="mt-4">
            <AvatarControls
              currentState={
                currentState === "GREETING"
                  ? "SPEAKING"
                  : currentState === "DISABLED"
                  ? "ERROR"
                  : currentState
              }
              isMuted={isMuted}
              onToggleMute={() => setIsMuted((prev) => !prev)}
              onStateChange={(st) => handleStateChange(st as AvatarOperationalState)}
              showDevControls={true}
            />
          </div>
        )}
      </div>
    </AvatarErrorBoundary>
  );
}
