"use client";

import React from "react";
import { Check, Globe } from "lucide-react";
import { useLanguage, SupportedLanguage } from "@/context/language-context";

export interface LanguageSelectorProps {
  onSelect?: (lang: SupportedLanguage) => void;
  className?: string;
}

export function LanguageSelector({
  onSelect,
  className = "",
}: LanguageSelectorProps) {
  const { language, setLanguage } = useLanguage();

  const languages: { code: SupportedLanguage; label: string; native: string }[] = [
    { code: "en", label: "English", native: "English (US)" },
    { code: "hi", label: "Hindi", native: "हिन्दी (भारत)" },
  ];

  const handleSelect = (code: SupportedLanguage) => {
    setLanguage(code);
    if (onSelect) onSelect(code);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 font-mono uppercase tracking-wider">
        <Globe className="w-4 h-4 text-sky-400" />
        <span>Select Preferred Language</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {languages.map((l) => {
          const isSelected = language === l.code;
          return (
            <button
              key={l.code}
              type="button"
              onClick={() => handleSelect(l.code)}
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 active:scale-[0.98] min-h-[56px] ${
                isSelected
                  ? "bg-sky-500/15 border-sky-500 text-white shadow-lg shadow-sky-500/10"
                  : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white"
              }`}
            >
              <div className="text-left">
                <span className="block font-bold text-base">{l.label}</span>
                <span className="block text-xs text-slate-400 font-mono mt-0.5">
                  {l.native}
                </span>
              </div>
              {isSelected && (
                <div className="w-7 h-7 rounded-full bg-sky-500 flex items-center justify-center text-white shrink-0">
                  <Check className="w-4 h-4" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
