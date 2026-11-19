"use client";

import React from "react";
import { Loader2 } from "lucide-react";

export interface PrimaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  icon?: React.ReactNode;
  size?: "md" | "lg" | "xl";
}

export function PrimaryButton({
  children,
  isLoading = false,
  icon,
  size = "lg",
  className = "",
  disabled,
  ...props
}: PrimaryButtonProps) {
  const sizeClasses = {
    md: "px-5 py-3 text-sm min-h-[48px]",
    lg: "px-8 py-4 text-base min-h-[56px]",
    xl: "px-10 py-5 text-lg min-h-[64px]",
  }[size];

  return (
    <button
      type="button"
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-3 rounded-2xl font-bold tracking-tight text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 active:scale-[0.98] shadow-lg shadow-sky-500/25 disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-sky-500/40 select-none ${sizeClasses} ${className}`}
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
