"use client";

import React from "react";
import { Loader2, Sparkles } from "lucide-react";

export interface AvatarLoadingProps {
  progress?: number;
  statusText?: string;
}

export function AvatarLoading({
  progress = 0,
  statusText = "Initializing 3D Digital Human...",
}: AvatarLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center">
      <div className="relative flex items-center justify-center">
        {/* Holographic Glowing Rings */}
        <div className="w-24 h-24 rounded-full border-2 border-dashed border-sky-400/40 animate-[spin_8s_linear_infinite]" />
        <div className="absolute w-20 h-20 rounded-full border border-cyan-400/50 animate-ping opacity-30" />
        <div className="absolute inset-0 flex items-center justify-center text-sky-400">
          <Sparkles className="w-8 h-8 animate-pulse" />
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-sm font-bold text-white tracking-wide font-mono">
          {statusText}
        </p>
        {progress > 0 && (
          <div className="w-48 mx-auto bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-400 to-sky-500 h-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
