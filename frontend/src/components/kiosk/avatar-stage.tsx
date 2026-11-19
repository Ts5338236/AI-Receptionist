"use client";

import React, { useState } from "react";
import { Sparkles, Bot, Volume2 } from "lucide-react";

interface AvatarStageProps {
  statusText?: string;
  isListening?: boolean;
  isSpeaking?: boolean;
}

export function AvatarStage({
  statusText = "Welcome to Horizon Tech. Please tap below or speak to begin.",
  isListening = false,
  isSpeaking = false,
}: AvatarStageProps) {
  const [pulse, setPulse] = useState(false);

  return (
    <div className="relative flex-1 w-full flex flex-col items-center justify-center overflow-hidden bg-radial from-slate-900 via-slate-950 to-black select-none">
      {/* Background ambient circular glow */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-sky-500/10 blur-3xl pointer-events-none animate-pulse-slow" />
      <div className="absolute w-[300px] h-[300px] rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

      {/* Realistic Digital Human Viewport Container */}
      <div className="relative w-full max-w-2xl h-[52vh] min-h-[380px] flex items-center justify-center">
        {/* Holographic Avatar Graphic Placeholder */}
        <div className="relative w-80 h-80 rounded-full border border-sky-500/30 bg-gradient-to-b from-sky-950/40 via-slate-900/60 to-black/80 flex items-center justify-center shadow-2xl shadow-sky-500/20">
          {/* Animated Wave Rings */}
          <div className="absolute inset-0 rounded-full border border-sky-400/20 animate-ping opacity-25" />
          <div className="absolute -inset-4 rounded-full border border-indigo-400/20 animate-pulse" />

          {/* AI Avatar Core Illustration */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative w-40 h-40 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/40">
              <Bot className="w-20 h-20 text-white" />
              <div className="absolute top-2 right-2 w-4 h-4 bg-emerald-400 border-2 border-slate-950 rounded-full animate-ping" />
              <div className="absolute top-2 right-2 w-4 h-4 bg-emerald-400 border-2 border-slate-950 rounded-full" />
            </div>
            
            {/* Audio Waveform visualization */}
            <div className="flex items-center gap-1.5 h-6">
              {[40, 70, 95, 60, 85, 100, 75, 45, 90, 65, 30].map((h, i) => (
                <span
                  key={i}
                  className="w-1 bg-gradient-to-t from-sky-500 to-indigo-400 rounded-full animate-wave"
                  style={{
                    height: `${h}%`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Receptionist Dialogue Bubble */}
      <div className="relative z-10 max-w-xl mx-auto px-8 py-4 mb-4 text-center rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center justify-center gap-2 mb-1.5">
          <Sparkles className="w-4 h-4 text-sky-400 animate-spin" />
          <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
            AI Receptionist • Virtual Host
          </span>
        </div>
        <p className="text-xl md:text-2xl font-medium text-slate-100 leading-snug">
          &ldquo;{statusText}&rdquo;
        </p>
      </div>
    </div>
  );
}
