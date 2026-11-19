"use client";

import React from "react";
import { Bot, Mic, Sparkles, Volume2, AlertTriangle, Radio } from "lucide-react";
import { useLanguage } from "@/context/language-context";

export type AvatarState = "IDLE" | "LISTENING" | "THINKING" | "SPEAKING" | "ERROR";

interface AvatarStageProps {
  state?: AvatarState;
  customMessage?: string;
  size?: "default" | "compact" | "fullscreen";
}

export function AvatarStage({
  state = "IDLE",
  customMessage,
  size = "default",
}: AvatarStageProps) {
  const { t } = useLanguage();

  const getStatusBadge = () => {
    switch (state) {
      case "LISTENING":
        return {
          label: t.avatarListening,
          color: "border-emerald-500/50 bg-emerald-500/20 text-emerald-300",
          icon: <Mic className="w-4 h-4 text-emerald-400 animate-pulse" />,
        };
      case "THINKING":
        return {
          label: t.avatarThinking,
          color: "border-indigo-500/50 bg-indigo-500/20 text-indigo-300",
          icon: <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />,
        };
      case "SPEAKING":
        return {
          label: t.avatarSpeaking,
          color: "border-sky-500/50 bg-sky-500/20 text-sky-300",
          icon: <Volume2 className="w-4 h-4 text-sky-400 animate-bounce" />,
        };
      case "ERROR":
        return {
          label: t.avatarError,
          color: "border-red-500/50 bg-red-500/20 text-red-300",
          icon: <AlertTriangle className="w-4 h-4 text-red-400" />,
        };
      case "IDLE":
      default:
        return {
          label: t.avatarIdle,
          color: "border-slate-700 bg-slate-900/80 text-slate-300",
          icon: <Radio className="w-4 h-4 text-sky-400" />,
        };
    }
  };

  const status = getStatusBadge();
  const message = customMessage || status.label;

  return (
    <div className="relative w-full flex-1 flex flex-col items-center justify-center overflow-hidden select-none px-6">
      {/* Dynamic Background Auras based on state */}
      <div
        className={`absolute w-96 h-96 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
          state === "LISTENING"
            ? "bg-emerald-500/20 scale-110"
            : state === "THINKING"
            ? "bg-indigo-500/25 scale-105"
            : state === "SPEAKING"
            ? "bg-sky-500/25 scale-110"
            : state === "ERROR"
            ? "bg-red-500/20 scale-95"
            : "bg-sky-500/10 scale-100"
        }`}
      />

      {/* Main Avatar Stage Viewport (Future Phase 3 3D WebRTC Canvas Integration Point) */}
      <div
        id="digital-human-viewport"
        className={`relative flex items-center justify-center transition-all ${
          size === "compact" ? "w-64 h-64" : "w-80 h-80 md:w-96 md:h-96"
        }`}
      >
        {/* Holographic Glowing Outer Rings */}
        <div
          className={`absolute inset-0 rounded-full border transition-all duration-500 ${
            state === "LISTENING"
              ? "border-emerald-400/50 animate-ping opacity-30"
              : state === "SPEAKING"
              ? "border-sky-400/50 animate-pulse"
              : "border-sky-500/20"
          }`}
        />
        <div className="absolute -inset-4 rounded-full border border-indigo-400/10 animate-pulse" />

        {/* Digital Avatar Silhouette Graphic */}
        <div className="relative w-full h-full rounded-full border border-sky-500/30 bg-gradient-to-b from-sky-950/40 via-slate-900/60 to-black/90 flex flex-col items-center justify-center shadow-2xl backdrop-blur-md">
          {/* Avatar Core Icon Representation */}
          <div
            className={`w-40 h-40 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${
              state === "LISTENING"
                ? "bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-emerald-500/40 scale-105"
                : state === "THINKING"
                ? "bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-indigo-500/40"
                : state === "SPEAKING"
                ? "bg-gradient-to-tr from-sky-500 to-blue-600 shadow-sky-500/40 scale-105"
                : state === "ERROR"
                ? "bg-gradient-to-tr from-red-600 to-amber-600 shadow-red-500/40"
                : "bg-gradient-to-tr from-sky-600 to-indigo-700 shadow-sky-500/30"
            }`}
          >
            <Bot className="w-20 h-20 text-white" />
          </div>

          {/* Active Audio Waveform bars (active during listening/speaking) */}
          <div className="flex items-center gap-1.5 h-6 mt-4">
            {[35, 70, 95, 60, 85, 100, 75, 45, 90, 65, 30].map((h, i) => (
              <span
                key={i}
                className={`w-1 rounded-full transition-all duration-300 ${
                  state === "LISTENING"
                    ? "bg-emerald-400 animate-wave"
                    : state === "SPEAKING"
                    ? "bg-sky-400 animate-wave"
                    : state === "THINKING"
                    ? "bg-indigo-400 animate-pulse"
                    : "bg-slate-700"
                }`}
                style={{
                  height: state === "IDLE" ? "20%" : `${h}%`,
                  animationDelay: `${i * 0.08}s`,
                }}
              />
            ))}
          </div>

          {/* Transparent Phase 2 Disclaimer Badge */}
          <span className="absolute bottom-3 text-[10px] uppercase font-mono tracking-wider text-slate-500">
            Phase 2 Digital Human Stage
          </span>
        </div>
      </div>

      {/* Receptionist Dialogue Bubble */}
      <div className="relative z-10 max-w-2xl w-full mx-auto mt-6 px-6 py-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-wider mb-2 transition-colors">
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border ${status.color}`}>
            {status.icon}
            <span>{state}</span>
          </div>
        </div>
        <p className="text-xl md:text-2xl font-medium text-slate-100 leading-snug">
          &ldquo;{message}&rdquo;
        </p>
      </div>
    </div>
  );
}
