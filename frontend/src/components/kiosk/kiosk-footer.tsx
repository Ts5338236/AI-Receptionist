"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Globe,
  Eye,
  ShieldCheck,
  Mic,
  X,
  Clock,
  Sparkles,
} from "lucide-react";
import { useLanguage, SupportedLanguage } from "@/context/language-context";
import { useAccessibility } from "@/context/accessibility-context";

interface KioskFooterProps {
  showStartConversationCTA?: boolean;
  secondsRemaining?: number;
  isWarning?: boolean;
}

export function KioskFooter({
  showStartConversationCTA = true,
  secondsRemaining,
  isWarning = false,
}: KioskFooterProps) {
  const { language, setLanguage, t } = useLanguage();
  const {
    highContrast,
    toggleHighContrast,
    textScale,
    increaseTextSize,
    decreaseTextSize,
  } = useAccessibility();

  const [modalType, setModalType] = useState<"language" | "accessibility" | "privacy" | null>(null);

  return (
    <footer className="w-full bg-slate-950/90 border-t border-slate-800/80 px-8 py-4 backdrop-blur-xl shrink-0 z-20 select-none">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Primary Primary CTA Button */}
        {showStartConversationCTA ? (
          <Link
            href="/kiosk/assistant"
            className="w-full md:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 text-white font-bold text-lg md:text-xl shadow-xl shadow-sky-500/25 flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all duration-200 border border-white/20"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <span>{t.startConversationBtn}</span>
            <Sparkles className="w-4 h-4 text-sky-200" />
          </Link>
        ) : (
          <div className="text-xs text-slate-400 font-medium">
            AI Receptionist Session Active
          </div>
        )}

        {/* Lower Utility Control Pills */}
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
          {/* Language Selector */}
          <button
            onClick={() => setModalType("language")}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-sky-500/50 hover:text-white transition-colors cursor-pointer"
          >
            <Globe className="w-4 h-4 text-sky-400" />
            <span>{language === "en" ? "English" : "हिन्दी (Hindi)"}</span>
          </button>

          {/* Accessibility Controls */}
          <button
            onClick={() => setModalType("accessibility")}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:text-white transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4 text-indigo-400" />
            <span>{t.accessibilityBtn}</span>
          </button>

          {/* Privacy Policy */}
          <button
            onClick={() => setModalType("privacy")}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:text-white transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{t.privacyBtn}</span>
          </button>

          {/* Inactivity Countdown Warning */}
          {secondsRemaining !== undefined && (
            <div
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-mono transition-colors ${
                isWarning
                  ? "bg-amber-500/20 border-amber-500/50 text-amber-300 animate-pulse"
                  : "bg-slate-900 border-slate-800 text-slate-400"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{secondsRemaining}s</span>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Modals */}
      {modalType && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-8 shadow-2xl">
            <button
              onClick={() => setModalType(null)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Language Modal */}
            {modalType === "language" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{t.languageBtn}</h3>
                    <p className="text-sm text-slate-400">Select language for speech & interface</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      setLanguage("en");
                      setModalType(null);
                    }}
                    className={`p-5 rounded-2xl border text-left font-bold transition-all cursor-pointer ${
                      language === "en"
                        ? "bg-sky-500/20 border-sky-400 text-white shadow-lg"
                        : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500"
                    }`}
                  >
                    <span className="block text-xl">English</span>
                    <span className="text-xs text-slate-400 font-normal">United States / Global</span>
                  </button>

                  <button
                    onClick={() => {
                      setLanguage("hi");
                      setModalType(null);
                    }}
                    className={`p-5 rounded-2xl border text-left font-bold transition-all cursor-pointer ${
                      language === "hi"
                        ? "bg-sky-500/20 border-sky-400 text-white shadow-lg"
                        : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500"
                    }`}
                  >
                    <span className="block text-xl">हिन्दी (Hindi)</span>
                    <span className="text-xs text-slate-400 font-normal">भारत / India</span>
                  </button>
                </div>
              </div>
            )}

            {/* Accessibility Modal */}
            {modalType === "accessibility" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <Eye className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{t.accessibilityBtn}</h3>
                    <p className="text-sm text-slate-400">Customize display and touch controls</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/60 border border-slate-700">
                    <div>
                      <span className="block font-semibold text-white">{t.highContrast}</span>
                      <span className="block text-xs text-slate-400">
                        Invert background to pure black with high-visibility yellow
                      </span>
                    </div>
                    <button
                      onClick={toggleHighContrast}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors cursor-pointer ${
                        highContrast ? "bg-yellow-400 text-black font-bold" : "bg-slate-700 text-white"
                      }`}
                    >
                      {highContrast ? "ON" : "OFF"}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/60 border border-slate-700">
                    <div>
                      <span className="block font-semibold text-white">{t.textScale}</span>
                      <span className="block text-xs text-slate-400">Current: {textScale}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={decreaseTextSize}
                        className="px-3.5 py-1.5 rounded-lg bg-slate-700 text-white font-bold hover:bg-slate-600 cursor-pointer"
                      >
                        A-
                      </button>
                      <button
                        onClick={increaseTextSize}
                        className="px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-500 cursor-pointer"
                      >
                        A+
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setModalType(null)}
                  className="w-full h-12 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  Done
                </button>
              </div>
            )}

            {/* Privacy Modal */}
            {modalType === "privacy" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{t.privacyBtn}</h3>
                    <p className="text-sm text-slate-400">Visitor data retention & compliance</p>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-slate-300 max-h-60 overflow-y-auto pr-2 leading-relaxed">
                  <p>
                    <strong>Visitor Information:</strong> Contact details and visit purpose gathered at this kiosk
                    are utilized strictly for office physical security, building fire evacuation compliance, and host arrival alerts.
                  </p>
                  <p>
                    <strong>Automatic Session Purge:</strong> When the kiosk is idle, all local form entries are immediately purged from device memory.
                  </p>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <Link
                    href="/kiosk/privacy"
                    onClick={() => setModalType(null)}
                    className="text-xs text-sky-400 hover:underline"
                  >
                    View Full Privacy Policy Page &rarr;
                  </Link>
                  <button
                    onClick={() => setModalType(null)}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 cursor-pointer text-xs"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </footer>
  );
}
