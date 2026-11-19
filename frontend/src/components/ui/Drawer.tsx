"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  position?: "left" | "right" | "bottom";
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  position = "right",
}: DrawerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const positionClasses = {
    right: "top-0 right-0 h-full w-full max-w-md border-l animate-in slide-in-from-right duration-300",
    left: "top-0 left-0 h-full w-full max-w-md border-r animate-in slide-in-from-left duration-300",
    bottom: "bottom-0 left-0 w-full max-h-[80vh] border-t rounded-t-3xl animate-in slide-in-from-bottom duration-300",
  }[position];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm">
      <div
        className={`fixed bg-slate-900 border-slate-800 shadow-2xl p-6 flex flex-col justify-between ${positionClasses}`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="w-11 h-11 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-4">{children}</div>
      </div>
    </div>
  );
}
