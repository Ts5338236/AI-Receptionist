"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AvatarState } from "./AvatarTypes";
import { pulseVariants } from "./AvatarAnimations";

interface AvatarDisplayProps {
  state: AvatarState;
  size?: "sm" | "md" | "lg" | "fullscreen";
}

export function AvatarDisplay({
  state,
  size = "lg",
}: AvatarDisplayProps) {
  const [blink, setBlink] = useState(false);

  // Natural eye blink interval
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 180);
    }, 4200);

    return () => clearInterval(blinkInterval);
  }, []);

  const sizeClasses = {
    sm: "w-40 h-40",
    md: "w-56 h-56",
    lg: "w-72 h-72 md:w-84 md:h-84",
    fullscreen: "w-full h-full max-h-[520px]",
  }[size];

  const getGlowStyles = () => {
    switch (state) {
      case "LISTENING":
        return "border-emerald-500/60 shadow-[0_0_80px_rgba(16,185,129,0.35)]";
      case "THINKING":
        return "border-amber-500/60 shadow-[0_0_80px_rgba(245,158,11,0.35)]";
      case "SPEAKING":
        return "border-sky-500/70 shadow-[0_0_90px_rgba(14,165,233,0.45)]";
      case "ERROR":
        return "border-rose-500/60 shadow-[0_0_80px_rgba(244,63,94,0.35)]";
      case "IDLE":
      default:
        return "border-cyan-500/40 shadow-[0_0_60px_rgba(6,182,212,0.25)]";
    }
  };

  return (
    <div className={`relative flex items-center justify-center ${sizeClasses}`}>
      {/* Outer Ambient Aura */}
      <motion.div
        variants={pulseVariants}
        animate={state.toLowerCase()}
        className={`absolute inset-0 rounded-full border-2 bg-gradient-to-b from-slate-900/90 to-slate-950/90 backdrop-blur-2xl transition-all duration-700 ${getGlowStyles()}`}
      />

      {/* Decorative Rotating Orbital Ring */}
      <div className="absolute inset-2 rounded-full border border-dashed border-cyan-500/20 animate-[spin_24s_linear_infinite]" />

      {/* Digital Human Vector Face Stage */}
      <div className="relative z-10 w-4/5 h-4/5 flex flex-col items-center justify-center">
        <svg
          viewBox="0 0 200 240"
          className="w-full h-full filter drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
        >
          <defs>
            <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="auraGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Shoulders & Bust Outline */}
          <path
            d="M 20 230 Q 100 170 180 230 L 190 240 L 10 240 Z"
            fill="url(#auraGrad)"
            stroke="#38bdf8"
            strokeWidth="1.5"
            strokeOpacity="0.4"
          />

          {/* Head & Neck Silhouette */}
          <rect
            x="85"
            y="130"
            width="30"
            height="40"
            rx="8"
            fill="#0369a1"
            fillOpacity="0.5"
          />
          <ellipse
            cx="100"
            cy="100"
            rx="52"
            ry="64"
            fill="url(#skinGrad)"
            stroke="#e0f2fe"
            strokeWidth="1.5"
            strokeOpacity="0.7"
          />

          {/* Digital Geometric Hair Accent */}
          <path
            d="M 54 85 Q 100 45 146 85 Q 155 110 148 130 Q 140 70 100 65 Q 60 70 52 130 Z"
            fill="#0284c7"
            fillOpacity="0.75"
          />

          {/* Eyes (With Natural Blink) */}
          <g id="avatar-eyes">
            {blink ? (
              <>
                <line
                  x1="74"
                  y1="96"
                  x2="88"
                  y2="96"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <line
                  x1="112"
                  y1="96"
                  x2="126"
                  y2="96"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </>
            ) : (
              <>
                <ellipse cx="81" cy="96" rx="7" ry="5" fill="#0c4a6e" />
                <circle cx="81" cy="96" r="3" fill="#ffffff" />
                <ellipse cx="119" cy="96" rx="7" ry="5" fill="#0c4a6e" />
                <circle cx="119" cy="96" r="3" fill="#ffffff" />
              </>
            )}
          </g>

          {/* Nose Accent */}
          <path
            d="M 98 102 L 102 114 L 96 116"
            stroke="#e0f2fe"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity="0.8"
          />

          {/* Dynamic Mouth / Lip-Sync */}
          <g id="avatar-mouth">
            {state === "SPEAKING" ? (
              <motion.ellipse
                cx="100"
                cy="134"
                rx="12"
                ry="7"
                fill="#082f49"
                stroke="#ffffff"
                strokeWidth="1.5"
                animate={{
                  ry: [3, 9, 4, 8, 3],
                  rx: [10, 14, 11, 13, 10],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 0.35,
                  ease: "easeInOut",
                }}
              />
            ) : state === "LISTENING" ? (
              <path
                d="M 92 132 Q 100 137 108 132"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
            ) : (
              <path
                d="M 90 132 Q 100 138 110 132"
                stroke="#e0f2fe"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
            )}
          </g>
        </svg>

        {/* Phase 3 WebRTC 3D Video Mount Hook */}
        <div
          id="phase3-digital-human-mount"
          className="hidden"
          aria-hidden="true"
          data-status="phase-3-webrtc-integration-hook"
        />
      </div>
    </div>
  );
}
