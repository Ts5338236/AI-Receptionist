"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  QrCode,
  Search,
  CheckCircle2,
  Clock,
  User,
  AlertCircle,
  Building,
} from "lucide-react";
import { StatusBanner } from "@/components/kiosk/status-banner";
import { KioskFooter } from "@/components/kiosk/kiosk-footer";
import { useLanguage } from "@/context/language-context";
import { useKioskSession } from "@/hooks/use-kiosk-session";

export default function AppointmentsPage() {
  const { t } = useLanguage();
  const { secondsRemaining, isWarning, resetActivity } = useKioskSession({
    timeoutSeconds: 90,
    homePath: "/kiosk",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAppt, setSelectedAppt] = useState<string | null>(null);

  const MOCK_APPOINTMENTS = [
    {
      id: "APT-101",
      visitor: "Marcus Vance",
      company: "Apex Capital",
      host: "David Ross (Finance)",
      time: "10:30 AM Today",
      room: "Conference Room 4B",
    },
    {
      id: "APT-102",
      visitor: "Elena Rostova",
      company: "CyberShield Security",
      host: "Michael Chang (SecOps)",
      time: "11:00 AM Today",
      room: "Executive Briefing Center",
    },
    {
      id: "APT-103",
      visitor: "Jordan Miller",
      company: "CloudScale Analytics",
      host: "Sarah Jenkins (Engineering)",
      time: "02:00 PM Today",
      room: "Innovation Lab 2",
    },
  ];

  const filtered = MOCK_APPOINTMENTS.filter(
    (a) =>
      a.visitor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-slate-950">
      <StatusBanner showBackToHome={true} />

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 flex flex-col justify-center overflow-y-auto">
        <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Calendar className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                  {t.actionAppointment}
                </h1>
                <p className="text-sm text-slate-400">
                  Scan your QR invite pass or look up your scheduled visit
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
          <div className="flex items-center gap-2 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-indigo-400" />
            <span>
              Phase 2 Demonstration: Displays pre-registered appointments. Calendar service synchronization scheduled for Phase 3.
            </span>
          </div>

          {/* Search Bar & Optical QR Trigger */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-8 relative">
              <Search className="w-5 h-5 text-slate-500 absolute left-4 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  resetActivity();
                }}
                placeholder="Search by your name, company, or confirmation code..."
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>
            <button
              onClick={() => {
                resetActivity();
                alert("Align QR invitation code with optical terminal sensor.");
              }}
              className="md:col-span-4 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer"
            >
              <QrCode className="w-5 h-5" />
              <span>Scan QR Invitation</span>
            </button>
          </div>

          {/* Appointment Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {filtered.map((apt) => (
              <div
                key={apt.id}
                onClick={() => {
                  setSelectedAppt(apt.id);
                  resetActivity();
                }}
                className={`p-5 rounded-2xl border text-left cursor-pointer transition-all ${
                  selectedAppt === apt.id
                    ? "bg-indigo-500/20 border-indigo-400 shadow-xl"
                    : "bg-slate-800/60 border-slate-700/80 hover:border-slate-500"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-indigo-400">
                    {apt.id}
                  </span>
                  <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {apt.time}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-white">{apt.visitor}</h4>
                <p className="text-xs text-slate-400">{apt.company}</p>

                <div className="mt-3 pt-3 border-t border-slate-700/60 text-xs text-slate-300 space-y-1">
                  <div>
                    <span className="text-slate-500">Host:</span> {apt.host}
                  </div>
                  <div>
                    <span className="text-slate-500">Room:</span> {apt.room}
                  </div>
                </div>

                {selectedAppt === apt.id && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Appointment Selected</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {selectedAppt && (
            <div className="pt-4 flex justify-end">
              <Link
                href="/kiosk/visitor-check-in"
                className="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base shadow-xl shadow-indigo-600/30 transition-all cursor-pointer"
              >
                Confirm Arrival & Print Pass &rarr;
              </Link>
            </div>
          )}
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
