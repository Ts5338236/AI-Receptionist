"use client";

import React from "react";
import { Loader2 } from "lucide-react";

export interface SecondaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  icon?: React.ReactNode;
  size?: "md" | "lg" | "xl";
}

export function SecondaryButton({
  children,
  isLoading = false,
  icon,
  size = "lg",
  className = "",
  disabled,
  ...props
}: SecondaryButtonProps) {
  const sizeClasses = {
    md: "px-5 py-3 text-sm min-h-[48px]",
    lg: "px-7 py-3.5 text-base min-h-[52px]",
    xl: "px-9 py-4.5 text-lg min-h-[60px]",
  }[size];

  return (
    <button
      type="button"
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-3 rounded-2xl font-semibold tracking-tight text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 active:scale-[0.98] shadow-sm disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-slate-600/40 select-none ${sizeClasses} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
}
