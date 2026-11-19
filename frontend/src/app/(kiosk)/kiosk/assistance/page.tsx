"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  HelpCircle,
  PhoneCall,
  Wifi,
  Coffee,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { StatusBanner } from "@/components/kiosk/status-banner";
import { KioskFooter } from "@/components/kiosk/kiosk-footer";
import { useLanguage } from "@/context/language-context";
import { useKioskSession } from "@/hooks/use-kiosk-session";

export default function AssistancePage() {
  const { t } = useLanguage();
  const { secondsRemaining, isWarning, resetActivity } = useKioskSession({
    timeoutSeconds: 90,
    homePath: "/kiosk",
  });

  const [conciergeRequested, setConciergeRequested] = useState(false);

  const handleCallStaff = () => {
    resetActivity();
    setConciergeRequested(true);
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-slate-950">
      <StatusBanner showBackToHome={true} />

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 flex flex-col justify-center overflow-y-auto">
        <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <HelpCircle className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                  {t.actionAssistance} & Building Info
                </h1>
                <p className="text-sm text-slate-400">
                  Connect with a physical receptionist or view building amenities
                </p>
              </div>
            </div>

            <Link
              href="/kiosk"
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
            >
              &larr; {t.backToHomeBtn}
            </Link>
          </div>

          {/* Prototype Notice */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              Phase 2 Demonstration: Direct facilities alert protocol. Integration with live VoIP / SIP telephony dispatch is scheduled for Phase 3.
            </span>
          </div>

          {/* Two-Column Grid: Live Dispatch on Left, Amenities on Right */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Live Concierge Call Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-rose-950/40 to-slate-900 border border-rose-500/30 flex flex-col justify-between text-center space-y-4 shadow-xl">
              <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center animate-pulse">
                <PhoneCall className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Request Live Human Concierge</h3>
                <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto leading-relaxed">
                  Need special assistance, physical escort, or accessibility support? A human reception operator can be summoned immediately to this kiosk.
                </p>
              </div>

              {conciergeRequested ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>A facilities team member has been dispatched to Kiosk-01.</span>
                </div>
              ) : (
                <button
                  onClick={handleCallStaff}
                  className="w-full h-14 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-base shadow-lg shadow-rose-600/30 active:scale-95 transition-all cursor-pointer"
                >
                  Summon Receptionist to Lobby
                </button>
              )}
            </div>

            {/* General Information & Amenities Cards */}
            <div className="space-y-4">
              {/* Guest WiFi */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                  <Wifi className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Guest High-Speed WiFi</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    SSID: <strong>Horizon-Guest-5G</strong> | Password: <strong>Welcome2026!</strong>
                  </p>
                </div>
              </div>

              {/* Cafeteria & Restrooms */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Coffee className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Amenities & Restrooms</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Restrooms located immediately to the left of elevators. Cafeteria on 2nd Floor (7 AM - 4 PM).
                  </p>
                </div>
              </div>

              {/* Security & Emergency */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Building Security Emergency</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Security Command Desk: Dial <strong>x911</strong> on any lobby phone or notify front gate.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <KioskFooter
        showStartConversationCTA={false}
        secondsRemaining={secondsRemaining}
        isWarning={isWarning}
      />
    </div>
  );
}
