"use client";

import React from "react";
import { FolderSearch } from "lucide-react";
import { PrimaryButton } from "./PrimaryButton";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto space-y-4 rounded-3xl bg-slate-900/40 border border-slate-800">
      <div className="w-16 h-16 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center">
        {icon || <FolderSearch className="w-8 h-8" />}
      </div>
      <div>
        <h4 className="text-xl font-bold text-white tracking-tight">{title}</h4>
        <p className="text-sm text-slate-400 mt-1">{description}</p>
      </div>
      {actionLabel && onAction && (
        <PrimaryButton size="md" onClick={onAction}>
          {actionLabel}
        </PrimaryButton>
      )}
    </div>
  );
}
