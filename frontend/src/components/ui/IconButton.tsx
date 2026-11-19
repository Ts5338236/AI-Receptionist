"use client";

import React from "react";

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label: string;
  variant?: "default" | "outline" | "ghost" | "danger";
  size?: "md" | "lg";
}

export function IconButton({
  icon,
  label,
  variant = "default",
  size = "md",
  className = "",
  ...props
}: IconButtonProps) {
  const variantClasses = {
    default: "bg-slate-900 border border-slate-700/80 text-slate-200 hover:text-white hover:bg-slate-800",
    outline: "bg-transparent border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500",
    ghost: "bg-transparent text-slate-400 hover:text-white hover:bg-slate-800/50",
    danger: "bg-rose-950/60 border border-rose-800 text-rose-300 hover:bg-rose-900",
  }[variant];

  const sizeClasses = {
    md: "w-12 h-12 min-w-[48px] min-h-[48px]",
    lg: "w-14 h-14 min-w-[56px] min-h-[56px]",
  }[size];

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center rounded-2xl transition-all duration-200 active:scale-95 focus:outline-none focus:ring-4 focus:ring-sky-500/30 ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {icon}
    </button>
  );
}
