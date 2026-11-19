"use client";

import React from "react";
import { Volume2, VolumeX, RefreshCw } from "lucide-react";
import { AvatarState } from "./AvatarTypes";

interface AvatarControlsProps {
  currentState: AvatarState;
  isMuted?: boolean;
  onToggleMute?: () => void;
  onStateChange?: (state: AvatarState) => void;
  showDevControls?: boolean;
}

export function AvatarControls({
  currentState,
  isMuted = false,
  onToggleMute,
  onStateChange,
  showDevControls = false,
}: AvatarControlsProps) {
  const states: AvatarState[] = [
    "IDLE",
    "LISTENING",
    "THINKING",
    "SPEAKING",
    "ERROR",
  ];

  return (
    <div className="flex items-center gap-3">
      {/* Audio Mute / Unmute Button */}
      {onToggleMute && (
        <button
          type="button"
          onClick={onToggleMute}
          aria-label={isMuted ? "Unmute avatar speech" : "Mute avatar speech"}
          className={`p-3 rounded-2xl border transition-all ${
            isMuted
              ? "bg-rose-950/60 border-rose-800 text-rose-400 hover:bg-rose-900/60"
              : "bg-slate-900/80 border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800"
          }`}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </button>
      )}

      {/* Developer State Switcher (Useful for Kiosk Testing & Verification) */}
      {showDevControls && onStateChange && (
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950/80 border border-slate-800">
          {states.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => onStateChange(st)}
              className={`px-2.5 py-1.5 rounded-xl text-[10px] font-mono font-bold transition ${
                currentState === st
                  ? "bg-sky-500 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {st[0]}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onStateChange("IDLE")}
            title="Reset Avatar to Idle"
            className="p-1 text-slate-500 hover:text-slate-300"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
