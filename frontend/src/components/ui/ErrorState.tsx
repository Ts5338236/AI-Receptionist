"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { SecondaryButton } from "./SecondaryButton";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({
  title = "Service Temporarily Unavailable",
  message = "An error occurred while connecting to kiosk services. Please try again or request assistance.",
  onRetry,
  retryLabel = "Try Again",
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto space-y-4 rounded-3xl bg-rose-950/20 border border-rose-900/30">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <div>
        <h4 className="text-xl font-bold text-white tracking-tight">{title}</h4>
        <p className="text-sm text-slate-400 mt-1">{message}</p>
      </div>
      {onRetry && (
        <SecondaryButton
          size="md"
          icon={<RefreshCw className="w-4 h-4" />}
          onClick={onRetry}
        >
          {retryLabel}
        </SecondaryButton>
      )}
    </div>
  );
}
