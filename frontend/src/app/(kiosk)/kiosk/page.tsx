"use client";

import React, { useState } from "react";
import { StatusBanner } from "@/components/kiosk/status-banner";
import { AvatarStage } from "@/components/kiosk/avatar-stage";
import { ActionBar } from "@/components/kiosk/action-bar";
import { CheckCircle2, Mic, X, QrCode, Package, User } from "lucide-react";

export default function KioskPage() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [dialogueText, setDialogueText] = useState(
    "Welcome to Horizon Tech. Please tap an option below or speak to check in."
  );

  const handleCheckIn = () => {
    setActiveModal("checkin");
    setDialogueText("Welcome! Please confirm your name or enter your phone number to check in.");
  };

  const handleVoiceStart = () => {
    setActiveModal("voice");
    setDialogueText("I'm listening. Who are you here to visit today?");
  };

  const handleScanQR = () => {
    setActiveModal("scan");
    setDialogueText("Please hold your visitor invitation QR code up to the camera below.");
  };

  const handleDelivery = () => {
    setActiveModal("delivery");
    setDialogueText("Please place the package on the counter and select the recipient carrier.");
  };

  const closeModal = () => {
    setActiveModal(null);
    setDialogueText("Welcome to Horizon Tech. Please tap an option below or speak to check in.");
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between select-none">
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

      {/* Touch Action Bar */}
      <ActionBar
        onCheckIn={handleCheckIn}
        onVoiceStart={handleVoiceStart}
        onScanQR={handleScanQR}
        onDelivery={handleDelivery}
      />

      {/* Interactive Modal Sheet for Touch Interactions */}
      {activeModal && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl p-8 shadow-2xl">
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>

            {activeModal === "checkin" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Visitor Check-In</h3>
                    <p className="text-sm text-slate-400">Step 1 of 2: Visitor Identification</p>
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

            {activeModal === "scan" && (
              <div className="text-center py-6 space-y-6">
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <QrCode className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Align QR Invitation Code</h3>
                  <p className="text-slate-400 mt-1">Hold the QR code on your phone 6 inches from the camera.</p>
                </div>
                <div className="w-48 h-48 mx-auto border-2 border-dashed border-emerald-500/60 rounded-2xl flex items-center justify-center bg-slate-950/50">
                  <span className="text-xs text-emerald-400 font-mono animate-pulse">Scanning Camera Feed...</span>
                </div>
                <button
                  onClick={closeModal}
                  className="w-full h-14 rounded-xl bg-slate-800 text-slate-300 font-semibold text-lg hover:bg-slate-700"
                >
                  Done
                </button>
              </div>
            )}

            {activeModal === "delivery" && (
              <div className="text-center py-6 space-y-6">
                <div className="w-20 h-20 rounded-full bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
                  <Package className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Package Drop-Off</h3>
                  <p className="text-slate-400 mt-1">Select your carrier to log the delivery.</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-left">
                  {["FedEx", "UPS", "USPS", "DHL", "Courier / Food", "Other"].map((carrier) => (
                    <button
                      key={carrier}
                      onClick={() => {
                        setDialogueText(`Delivery from ${carrier} logged. Mailroom team notified.`);
                        closeModal();
                      }}
                      className="p-4 rounded-xl bg-slate-800 border border-slate-700 hover:border-amber-400 text-white font-medium text-center"
                    >
                      {carrier}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
