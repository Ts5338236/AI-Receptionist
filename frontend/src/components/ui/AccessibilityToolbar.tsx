"use client";

import React from "react";
import { Eye, Type, ZoomIn, ZoomOut, Check } from "lucide-react";
import {
  useAccessibility,
  TextScale,
} from "@/context/accessibility-context";

export interface AccessibilityToolbarProps {
  className?: string;
  onClose?: () => void;
}

export function AccessibilityToolbar({
  className = "",
}: AccessibilityToolbarProps) {
  const { highContrast, textScale, toggleHighContrast, setTextScale } =
    useAccessibility();

  const scales: { level: TextScale; label: string }[] = [
    { level: "normal", label: "Default 100%" },
    { level: "large", label: "Large 115%" },
    { level: "xlarge", label: "Extra Large 130%" },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* High Contrast Mode */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <span className="block font-bold text-white text-sm">
              High Contrast Palette
            </span>
            <span className="block text-xs text-slate-400">
              Increase contrast for outdoor & glare readability
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleHighContrast}
          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
            highContrast ? "bg-cyan-500" : "bg-slate-700"
          }`}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
              highContrast ? "translate-x-7" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Dynamic Text Sizing */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 font-mono uppercase tracking-wider">
          <Type className="w-4 h-4 text-cyan-400" />
          <span>Text Scale & Legibility</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {scales.map((s) => {
            const isSelected = textScale === s.level;
            return (
              <button
                key={s.level}
                type="button"
                onClick={() => setTextScale(s.level)}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                  isSelected
                    ? "bg-cyan-500/15 border-cyan-500 text-white font-bold"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <span className="text-xs">{s.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
