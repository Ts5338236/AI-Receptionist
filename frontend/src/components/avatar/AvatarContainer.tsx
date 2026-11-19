"use client";

import React, { useState } from "react";
import { AvatarDisplay } from "./AvatarDisplay";
import { AvatarStatus } from "./AvatarStatus";
import { AvatarControls } from "./AvatarControls";
import { AvatarState } from "./AvatarTypes";

interface AvatarContainerProps {
  initialState?: AvatarState;
  state?: AvatarState;
  size?: "sm" | "md" | "lg" | "fullscreen";
  customMessage?: string;
  showControls?: boolean;
  onStateChange?: (state: AvatarState) => void;
  className?: string;
}

export function AvatarContainer({
  initialState = "IDLE",
  state: controlledState,
  size = "lg",
  customMessage,
  showControls = false,
  onStateChange,
  className = "",
}: AvatarContainerProps) {
  const [internalState, setInternalState] = useState<AvatarState>(initialState);
  const [isMuted, setIsMuted] = useState(false);

  const activeState = controlledState !== undefined ? controlledState : internalState;

  const handleStateChange = (nextState: AvatarState) => {
    setInternalState(nextState);
    if (onStateChange) {
      onStateChange(nextState);
    }
  };

  return (
    <div
      className={`flex flex-col items-center justify-center gap-6 ${className}`}
    >
      <AvatarDisplay state={activeState} size={size} />

      <AvatarStatus state={activeState} customMessage={customMessage} />

      {showControls && (
        <AvatarControls
          currentState={activeState}
          isMuted={isMuted}
          onToggleMute={() => setIsMuted((prev) => !prev)}
          onStateChange={handleStateChange}
          showDevControls={true}
        />
      )}
    </div>
  );
}

export { AvatarDisplay, AvatarStatus, AvatarControls };
