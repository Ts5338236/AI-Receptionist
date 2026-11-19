"use client";

import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export interface ToastProps {
  id?: string;
  type?: "success" | "error" | "info";
  message: string;
  description?: string;
  onDismiss: () => void;
  autoDismissMs?: number;
}

export function Toast({
  type = "info",
  message,
  description,
  onDismiss,
  autoDismissMs = 4000,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(), autoDismissMs);
    return () => clearTimeout(timer);
  }, [onDismiss, autoDismissMs]);

  const config = {
    success: {
      border: "border-emerald-500/40 bg-emerald-950/90 text-emerald-200",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    },
    error: {
      border: "border-rose-500/40 bg-rose-950/90 text-rose-200",
      icon: <AlertCircle className="w-5 h-5 text-rose-400" />,
    },
    info: {
      border: "border-sky-500/40 bg-sky-950/90 text-sky-200",
      icon: <Info className="w-5 h-5 text-sky-400" />,
    },
  }[type];

  return (
    <div
      role="status"
      className={`fixed bottom-6 right-6 z-50 flex items-start gap-3.5 p-4 rounded-2xl border shadow-2xl backdrop-blur-md max-w-sm animate-in slide-in-from-bottom duration-300 ${config.border}`}
    >
      <span className="shrink-0 mt-0.5">{config.icon}</span>
      <div className="flex-1 pr-2">
        <h5 className="text-sm font-bold text-white">{message}</h5>
        {description && (
          <p className="text-xs text-slate-300 mt-0.5">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="text-slate-400 hover:text-white transition"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
