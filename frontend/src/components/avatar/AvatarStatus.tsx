"use client";

import React from "react";
import { motion } from "framer-motion";
import { Mic, Volume2, Sparkles, AlertCircle, Radio } from "lucide-react";
import { AvatarState } from "./AvatarTypes";
import { waveformVariants } from "./AvatarAnimations";

interface AvatarStatusProps {
  state: AvatarState;
  customMessage?: string;
  volumeLevel?: number;
}

export function AvatarStatus({
  state,
  customMessage,
}: AvatarStatusProps) {
  const getBadgeConfig = () => {
    switch (state) {
      case "LISTENING":
        return {
          icon: <Mic className="w-4 h-4 text-emerald-400 animate-pulse" />,
          label: "Listening to visitor...",
          bgColor: "bg-emerald-950/80 border-emerald-500/40 text-emerald-300",
          glowColor: "from-emerald-500/20 to-teal-500/20",
        };
      case "THINKING":
        return {
          icon: <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />,
          label: "Analyzing request...",
          bgColor: "bg-amber-950/80 border-amber-500/40 text-amber-300",
          glowColor: "from-amber-500/20 to-orange-500/20",
        };
      case "SPEAKING":
        return {
          icon: <Volume2 className="w-4 h-4 text-sky-400 animate-bounce" />,
          label: "Speaking...",
          bgColor: "bg-sky-950/80 border-sky-500/40 text-sky-300",
          glowColor: "from-sky-500/20 to-cyan-500/20",
        };
      case "ERROR":
        return {
          icon: <AlertCircle className="w-4 h-4 text-rose-400" />,
          label: "Sensor Attention Required",
          bgColor: "bg-rose-950/80 border-rose-500/40 text-rose-300",
          glowColor: "from-rose-500/20 to-red-500/20",
        };
      case "IDLE":
      default:
        return {
          icon: <Radio className="w-4 h-4 text-cyan-400" />,
          label: "Ready • Voice & Touch Active",
          bgColor: "bg-slate-900/80 border-slate-700/60 text-slate-300",
          glowColor: "from-cyan-500/10 to-blue-500/10",
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <div className="flex flex-col items-center gap-3">
      {/* State Badge */}
      <div
        className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-full border shadow-lg backdrop-blur-md transition-all duration-300 ${config.bgColor}`}
      >
        {config.icon}
        <span className="text-xs font-semibold tracking-wide uppercase font-mono">
          {config.label}
        </span>
      </div>

      {/* Dynamic Sub-caption / Waveform */}
      {state === "SPEAKING" ? (
        <div className="flex items-center gap-1.5 h-6 px-3 py-1 bg-sky-950/50 rounded-full border border-sky-800/40">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <motion.span
              key={i}
              custom={i}
              variants={waveformVariants}
              initial="initial"
              animate="animate"
              className="w-1 bg-sky-400 rounded-full"
            />
          ))}
        </div>
      ) : customMessage ? (
        <p className="text-xs text-slate-400 text-center max-w-sm px-4">
          {customMessage}
        </p>
      ) : null}
    </div>
  );
}
