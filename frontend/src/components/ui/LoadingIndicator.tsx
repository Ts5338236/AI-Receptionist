"use client";

import React from "react";
import { Loader2 } from "lucide-react";

export interface LoadingIndicatorProps {
  label?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingIndicator({
  label = "Loading...",
  size = "md",
}: LoadingIndicatorProps) {
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  }[size];

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
      <div className="relative flex items-center justify-center">
        <Loader2 className={`${sizeClasses} text-sky-400 animate-spin`} />
        <div className="absolute inset-0 rounded-full border border-sky-500/20 animate-ping" />
      </div>
      {label && (
        <span className="text-xs md:text-sm font-medium text-slate-400 tracking-wide font-mono">
          {label}
        </span>
      )}
    </div>
  );
}
