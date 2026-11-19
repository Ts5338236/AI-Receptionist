"use client";

import React from "react";
import { AvatarDisplay } from "./AvatarDisplay";
import { AvatarStatus } from "./AvatarStatus";
import { AvatarOperationalState } from "../../types/avatar";
import { AlertCircle } from "lucide-react";

export interface AvatarFallbackProps {
  state?: AvatarOperationalState;
  reason?: string;
}

export function AvatarFallback({
  state = "IDLE",
  reason = "WebGL hardware acceleration unavailable. Operating in high-performance 2D vector mode.",
}: AvatarFallbackProps) {
  // Map AvatarOperationalState to 5-state display
  const displayState =
    state === "GREETING" ? "SPEAKING" : state === "DISABLED" ? "ERROR" : state;

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4 text-center">
      {/* 2D Animated Vector Avatar */}
      <AvatarDisplay state={displayState} size="lg" />

      {/* Operational Status */}
      <AvatarStatus state={displayState} />

      {/* Graceful Fallback Notice */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 font-mono">
        <AlertCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <span>{reason}</span>
      </div>
    </div>
  );
}
