"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Camera,
  Mic,
  Database,
  Lock,
  Clock,
  UserCheck,
  FileText,
  ChevronLeft,
} from "lucide-react";
import { StatusBanner } from "@/components/kiosk/status-banner";
import { KioskFooter } from "@/components/kiosk/kiosk-footer";
import { useLanguage } from "@/context/language-context";
import { useKioskSession } from "@/hooks/use-kiosk-session";

export default function PrivacyPage() {
  const { t } = useLanguage();
  const { secondsRemaining, isWarning } = useKioskSession({
    timeoutSeconds: 90,
    homePath: "/kiosk",
  });

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-slate-950">
      <StatusBanner showBackToHome={true} />

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 flex flex-col justify-center overflow-y-auto">
        <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                  {t.privacyTitle} & Security Policy
                </h1>
                <p className="text-sm text-slate-400">
                  Transparency and data protection standards for physical virtual reception
                </p>
              </div>
            </div>

            <Link
              href="/kiosk"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold hover:bg-slate-700 transition"
            >
              <ChevronLeft className="w-4 h-4" />
              {t.backToHomeBtn}
            </Link>
          </div>

          {/* Privacy Notice Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
              <div className="flex items-center gap-3 text-cyan-400 font-semibold text-sm">
                <Mic className="w-4 h-4" />
                <span>Voice & Audio Processing</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Microphone audio is processed locally or via encrypted enterprise streams solely to transcribe visitor queries in real time. Continuous ambient room recording is disabled.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
              <div className="flex items-center gap-3 text-cyan-400 font-semibold text-sm">
                <Camera className="w-4 h-4" />
                <span>Camera & Optical Sensors</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Optical sensors detect visitor presence to wake the kiosk and scan appointment QR codes. Video streams are never broadcast publicly or retained after session termination.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
              <div className="flex items-center gap-3 text-cyan-400 font-semibold text-sm">
                <Clock className="w-4 h-4" />
                <span>Zero-Trace Session Purge</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                After 60–90 seconds of inactivity, all temporary in-memory tokens, form inputs, and speech transcripts are instantly purged from the kiosk terminal buffer.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
              <div className="flex items-center gap-3 text-cyan-400 font-semibold text-sm">
                <Database className="w-4 h-4" />
                <span>Visitor Registration Data</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Official visitor badge logs (name, company, host employee) are stored inside the customer&apos;s isolated tenant database under strict role-based access controls and retention policies.
              </p>
            </div>
          </div>

          {/* Legal Compliance & Certification */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/30 to-blue-950/30 border border-cyan-800/40 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-cyan-400 shrink-0" />
              <div className="text-xs text-slate-300">
                <span className="font-semibold text-white">Enterprise Standards Compliance: </span>
                Designed for SOC2 Type II, ISO/IEC 27001, GDPR and DPDP compliance.
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400/90 shrink-0">
              <UserCheck className="w-4 h-4" />
              <span>TLS 1.3 / AES-256-GCM</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-600" />
              <span>AI Receptionist Enterprise Kiosk OS v2.0 - Security Classification: Public Kiosk Policy</span>
            </div>
            <Link
              href="/kiosk"
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition"
            >
              {t.dismissBtn}
            </Link>
          </div>
        </div>
      </main>

      <KioskFooter secondsRemaining={secondsRemaining} isWarning={isWarning} />
    </div>
  );
}
