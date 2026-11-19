"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Mic, Sparkles, Volume2, AlertTriangle, Radio } from "lucide-react";
import { useLanguage } from "@/context/language-context";
import { AvatarOperationalState } from "@/types/avatar";

export type AvatarState = "IDLE" | "LISTENING" | "THINKING" | "SPEAKING" | "ERROR";

// Dynamically import the Three.js 3D Avatar Scene to prevent SSR Canvas evaluation
const AvatarScene3D = dynamic(
  () => import("../avatar/AvatarScene").then((mod) => mod.AvatarScene),
  { ssr: false }
);

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
    <div className="relative flex flex-col items-center justify-center p-2 w-full">
      {/* Three.js 3D Avatar Scene (Dynamically Rendered with WebGL Fallback) */}
      <AvatarScene3D
        state={state as AvatarOperationalState}
        customMessage={message}
        showControls={size === "default"}
      />
    </div>
  );
}
