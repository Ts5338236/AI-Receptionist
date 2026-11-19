"use client";

import React from "react";
import { UserCheck, Mic, QrCode, Package, Globe, HelpCircle } from "lucide-react";

interface ActionBarProps {
  onCheckIn?: () => void;
  onVoiceStart?: () => void;
  onScanQR?: () => void;
  onDelivery?: () => void;
}

export function ActionBar({
  onCheckIn,
  onVoiceStart,
  onScanQR,
  onDelivery,
}: ActionBarProps) {
  return (
    <footer className="w-full bg-slate-950/90 border-t border-slate-800/80 px-8 py-6 backdrop-blur-xl select-none">
      {/* Primary Touch Triggers Grid */}
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Main Check-In Button */}
        <button
          onClick={onCheckIn}
          className="group relative flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-b from-sky-500/20 to-sky-600/10 border-2 border-sky-500/50 hover:border-sky-400 hover:from-sky-500/30 hover:to-sky-600/20 active:scale-95 transition-all shadow-lg shadow-sky-500/10"
        >
          <div className="w-14 h-14 rounded-full bg-sky-500 flex items-center justify-center mb-3 shadow-md group-hover:scale-105 transition-transform">
            <UserCheck className="w-7 h-7 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-wide">
            Tap to Check In
          </span>
          <span className="text-xs text-sky-300/80 mt-1">
            New or Returning Visitor
          </span>
        </button>

        {/* Voice Conversation Trigger */}
        <button
          onClick={onVoiceStart}
          className="group relative flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-900/60 border border-slate-700/80 hover:border-indigo-500/60 hover:bg-slate-800/60 active:scale-95 transition-all shadow-lg"
        >
          <div className="w-14 h-14 rounded-full bg-indigo-600 flex items-center justify-center mb-3 shadow-md group-hover:scale-105 transition-transform">
            <Mic className="w-7 h-7 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-wide">
            Speak to AI
          </span>
          <span className="text-xs text-slate-400 mt-1">
            Ask any office question
          </span>
        </button>

        {/* QR Code / Express Pass */}
        <button
          onClick={onScanQR}
          className="group relative flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-900/60 border border-slate-700/80 hover:border-emerald-500/60 hover:bg-slate-800/60 active:scale-95 transition-all shadow-lg"
        >
          <div className="w-14 h-14 rounded-full bg-emerald-600 flex items-center justify-center mb-3 shadow-md group-hover:scale-105 transition-transform">
            <QrCode className="w-7 h-7 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-wide">
            Scan Pass
          </span>
          <span className="text-xs text-slate-400 mt-1">
            Pre-registered QR code
          </span>
        </button>

        {/* Deliveries & Packages */}
        <button
          onClick={onDelivery}
          className="group relative flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-900/60 border border-slate-700/80 hover:border-amber-500/60 hover:bg-slate-800/60 active:scale-95 transition-all shadow-lg"
        >
          <div className="w-14 h-14 rounded-full bg-amber-600 flex items-center justify-center mb-3 shadow-md group-hover:scale-105 transition-transform">
            <Package className="w-7 h-7 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-wide">
            Deliveries
          </span>
          <span className="text-xs text-slate-400 mt-1">
            Drop-off / Courier
          </span>
        </button>
      </div>

      {/* Auxiliary Footer Tools */}
      <div className="max-w-5xl mx-auto flex items-center justify-between mt-5 pt-4 border-t border-slate-900 text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors">
            <Globe className="w-4 h-4 text-sky-400" />
            <span>Language: English (US)</span>
          </button>
          <button className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors">
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>Assistance</span>
          </button>
        </div>
        <div>
          <span>Enterprise Physical Kiosk v1.0.0 • AI Receptionist OS</span>
        </div>
      </div>
    </footer>
  );
}
