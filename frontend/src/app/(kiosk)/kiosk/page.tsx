"use client";

import React, { useState } from "react";
import { StatusBanner } from "@/components/kiosk/status-banner";
import { AvatarStage } from "@/components/kiosk/avatar-stage";
import { ActionBar } from "@/components/kiosk/action-bar";
import {
  CheckCircle2,
  Mic,
  X,
  QrCode,
  Package,
  User,
  Globe,
  Eye,
  ShieldCheck,
  Building2,
  Volume2,
} from "lucide-react";

export default function KioskPage() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState("English (US)");
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [dialogueText, setDialogueText] = useState(
    "Welcome to Horizon Tech. Please tap an option below or speak to check in."
  );

  const handleCheckIn = () => {
    setActiveModal("checkin");
    setDialogueText("Welcome! Please enter your name and host employee to check in.");
  };

  const handleVoiceStart = () => {
    setActiveModal("voice");
    setDialogueText("I'm listening. Who are you here to visit today?");
  };

  const handleScanQR = () => {
    setActiveModal("scan");
    setDialogueText("Please present your visitor invitation QR code to the scanner camera.");
  };

  const handleDelivery = () => {
    setActiveModal("delivery");
    setDialogueText("Please select your carrier service to log the delivery.");
  };

  const closeModal = () => {
    setActiveModal(null);
    setDialogueText("Welcome to Horizon Tech. Please tap an option below or speak to check in.");
  };

  return (
    <div
      className={`relative w-full h-full flex flex-col justify-between select-none ${
        highContrast ? "bg-black text-yellow-300 contrast-125" : "bg-black text-white"
      } ${largeText ? "text-lg" : "text-base"}`}
    >
      {/* Top Telemetry & Status Bar */}
      <StatusBanner
        kioskId="KIOSK-LOBBY-01"
        buildingName="Horizon Tech Headquarters • Building A"
      />

      {/* Main Avatar Stage & Dialogue Area */}
      <AvatarStage
        statusText={dialogueText}
        isListening={activeModal === "voice"}
        isSpeaking={false}
      />

      {/* Touch Action Bar with Language & Assistance Triggers */}
      <footer className="w-full bg-slate-950/90 border-t border-slate-800/80 px-8 py-5 backdrop-blur-xl">
        <ActionBar
          onCheckIn={handleCheckIn}
          onVoiceStart={handleVoiceStart}
          onScanQR={handleScanQR}
          onDelivery={handleDelivery}
        />

        {/* Lower Utility Control Strip: Accessibility, Language, Privacy */}
        <div className="max-w-5xl mx-auto flex items-center justify-between mt-4 pt-3 border-t border-slate-900 text-xs text-slate-400">
          <div className="flex items-center gap-5">
            {/* Language Selector */}
            <button
              onClick={() => setActiveModal("language")}
              className="flex items-center gap-1.5 hover:text-sky-400 transition-colors cursor-pointer"
            >
              <Globe className="w-4 h-4 text-sky-400" />
              <span>Language: {currentLanguage}</span>
            </button>

            {/* Accessibility Controls */}
            <button
              onClick={() => setActiveModal("accessibility")}
              className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4 text-indigo-400" />
              <span>Accessibility Options</span>
            </button>

            {/* Privacy Notice */}
            <button
              onClick={() => setActiveModal("privacy")}
              className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Visitor Privacy Notice</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            <span>Terminal ID: 4a5b2c69 • Firmware: v1.0.0-phase1</span>
          </div>
        </div>
      </footer>

      {/* Interactive Modal Sheet for Touch Interactions */}
      {activeModal && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl p-8 shadow-2xl">
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Check-In Modal */}
            {activeModal === "checkin" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Visitor Check-In</h3>
                    <p className="text-sm text-slate-400">Step 1 of 2: Registration</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2 font-semibold">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      className="w-full h-14 px-5 rounded-xl bg-slate-800 border border-slate-700 text-lg text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2 font-semibold">
                      Host Employee or Department
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sarah Jenkins (Engineering)"
                      className="w-full h-14 px-5 rounded-xl bg-slate-800 border border-slate-700 text-lg text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={closeModal}
                    className="flex-1 h-14 rounded-xl bg-slate-800 text-slate-300 font-semibold text-lg hover:bg-slate-700 active:scale-95 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setDialogueText("Thank you, Jane Doe! Your host Sarah Jenkins has been notified via Slack.");
                      closeModal();
                    }}
                    className="flex-1 h-14 rounded-xl bg-sky-500 text-white font-semibold text-lg hover:bg-sky-400 active:scale-95 transition-all shadow-lg shadow-sky-500/30"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Voice Assistant Modal */}
            {activeModal === "voice" && (
              <div className="text-center py-6 space-y-6">
                <div className="w-20 h-20 rounded-full bg-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center animate-pulse">
                  <Mic className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Listening...</h3>
                  <p className="text-slate-400 mt-1">Speak normally. The AI Receptionist can hear you.</p>
                </div>
                <div className="flex items-center justify-center gap-1.5 h-10">
                  {[20, 60, 90, 40, 80, 100, 50, 70, 30].map((h, i) => (
                    <span
                      key={i}
                      className="w-1.5 bg-indigo-500 rounded-full animate-wave"
                      style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
                <button
                  onClick={closeModal}
                  className="w-full h-14 rounded-xl bg-slate-800 text-slate-300 font-semibold text-lg hover:bg-slate-700"
                >
                  Close Voice Session
                </button>
              </div>
            )}

            {/* QR Scan Modal */}
            {activeModal === "scan" && (
              <div className="text-center py-6 space-y-6">
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <QrCode className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Align QR Invitation Code</h3>
                  <p className="text-slate-400 mt-1">Hold the QR pass on your phone 6 inches from the terminal camera.</p>
                </div>
                <div className="w-48 h-48 mx-auto border-2 border-dashed border-emerald-500/60 rounded-2xl flex items-center justify-center bg-slate-950/50">
                  <span className="text-xs text-emerald-400 font-mono animate-pulse">Scanning Optical Sensor...</span>
                </div>
                <button
                  onClick={closeModal}
                  className="w-full h-14 rounded-xl bg-slate-800 text-slate-300 font-semibold text-lg hover:bg-slate-700"
                >
                  Done
                </button>
              </div>
            )}

            {/* Courier / Delivery Modal */}
            {activeModal === "delivery" && (
              <div className="text-center py-6 space-y-6">
                <div className="w-20 h-20 rounded-full bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
                  <Package className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Package Drop-Off</h3>
                  <p className="text-slate-400 mt-1">Select your courier service to notify facilities.</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-left">
                  {["FedEx", "UPS", "USPS", "DHL", "Courier / Food", "Other"].map((carrier) => (
                    <button
                      key={carrier}
                      onClick={() => {
                        setDialogueText(`Delivery from ${carrier} logged. Mailroom team notified.`);
                        closeModal();
                      }}
                      className="p-4 rounded-xl bg-slate-800 border border-slate-700 hover:border-amber-400 text-white font-medium text-center active:scale-95 transition-all"
                    >
                      {carrier}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Language Selector Modal */}
            {activeModal === "language" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Select Language</h3>
                    <p className="text-sm text-slate-400">Choose your preferred voice & interface language</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    "English (US)",
                    "Español (Spanish)",
                    "Français (French)",
                    "Deutsch (German)",
                    "日本語 (Japanese)",
                    "中文 (Mandarin)",
                  ].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setCurrentLanguage(lang);
                        closeModal();
                      }}
                      className={`p-4 rounded-xl border text-left font-medium transition-all ${
                        currentLanguage === lang
                          ? "bg-sky-500/20 border-sky-400 text-white"
                          : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Accessibility Options Modal */}
            {activeModal === "accessibility" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <Eye className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Accessibility Options</h3>
                    <p className="text-sm text-slate-400">Configure visual and audio assistance settings</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/60 border border-slate-700">
                    <div>
                      <span className="block font-semibold text-white">High Contrast Mode</span>
                      <span className="block text-xs text-slate-400">
                        Inverts colors for maximum visibility and legibility
                      </span>
                    </div>
                    <button
                      onClick={() => setHighContrast(!highContrast)}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                        highContrast ? "bg-yellow-400 text-black" : "bg-slate-700 text-white"
                      }`}
                    >
                      {highContrast ? "Enabled" : "Disabled"}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/60 border border-slate-700">
                    <div>
                      <span className="block font-semibold text-white">Large Text Scale</span>
                      <span className="block text-xs text-slate-400">
                        Increases touch targets and dialog font size
                      </span>
                    </div>
                    <button
                      onClick={() => setLargeText(!largeText)}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                        largeText ? "bg-indigo-500 text-white" : "bg-slate-700 text-white"
                      }`}
                    >
                      {largeText ? "Enabled" : "Disabled"}
                    </button>
                  </div>
                </div>

                <button
                  onClick={closeModal}
                  className="w-full h-12 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
                >
                  Close Accessibility
                </button>
              </div>
            )}

            {/* Privacy Notice Modal */}
            {activeModal === "privacy" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Visitor Privacy Statement</h3>
                    <p className="text-sm text-slate-400">Compliance & Data Protection Standards</p>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-slate-300 max-h-60 overflow-y-auto pr-2 leading-relaxed">
                  <p>
                    <strong>Data Collected:</strong> When checking in at this kiosk, your name, contact phone/email,
                    and visit purpose are collected solely for office physical security, host arrival notification,
                    and building emergency evacuation management.
                  </p>
                  <p>
                    <strong>Camera & Voice Sensors:</strong> Real-time microphone and camera telemetry are utilized
                    locally to provide interactive speech reception. Audio streams are not retained or sold to third
                    parties.
                  </p>
                  <p>
                    <strong>Retention Policy:</strong> Visitor records are retained in accordance with enterprise
                    retention policy (standard 30 days) and purged automatically.
                  </p>
                </div>

                <button
                  onClick={closeModal}
                  className="w-full h-12 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
                >
                  I Understand
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
