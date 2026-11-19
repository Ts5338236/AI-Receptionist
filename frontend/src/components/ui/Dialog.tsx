"use client";

import React from "react";
import { AlertCircle, CheckCircle2, HelpCircle } from "lucide-react";
import { PrimaryButton } from "./PrimaryButton";
import { SecondaryButton } from "./SecondaryButton";

export interface DialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: "info" | "warning" | "danger" | "success";
}

export function Dialog({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  type = "info",
}: DialogProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case "danger":
      case "warning":
        return <AlertCircle className="w-8 h-8 text-rose-400" />;
      case "success":
        return <CheckCircle2 className="w-8 h-8 text-emerald-400" />;
      case "info":
      default:
        return <HelpCircle className="w-8 h-8 text-sky-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center shrink-0">
            {getIcon()}
          </div>
          <div>
            <h4 className="text-xl font-bold text-white">{title}</h4>
            <p className="text-sm text-slate-400 mt-1">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
          <SecondaryButton size="md" onClick={onCancel}>
            {cancelLabel}
          </SecondaryButton>
          <PrimaryButton size="md" onClick={onConfirm}>
            {confirmLabel}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
