"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  UserCheck,
  CheckCircle2,
  Printer,
  ArrowRight,
  ArrowLeft,
  Building,
  User,
  Mail,
  Phone,
  Briefcase,
  AlertCircle,
} from "lucide-react";
import { StatusBanner } from "@/components/kiosk/status-banner";
import { KioskFooter } from "@/components/kiosk/kiosk-footer";
import { useLanguage } from "@/context/language-context";
import { useKioskSession } from "@/hooks/use-kiosk-session";

export default function VisitorCheckInPage() {
  const { t } = useLanguage();
  const { secondsRemaining, isWarning, resetActivity } = useKioskSession({
    timeoutSeconds: 90,
    homePath: "/kiosk",
  });

  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    hostName: "",
    purpose: "Business Meeting",
  });

  const handleChange = (field: string, val: string) => {
    resetActivity();
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    resetActivity();
    if (formData.fullName && formData.hostName) {
      setStep(2);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-slate-950">
      <StatusBanner showBackToHome={true} />

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 flex flex-col justify-center overflow-y-auto">
        {step === 1 ? (
          <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-800">
              <div className="w-14 h-14 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                <UserCheck className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                  {t.actionCheckIn}
                </h1>
                <p className="text-sm text-slate-400">
                  Step 1 of 2: Please enter your visitor information
                </p>
              </div>
            </div>

            <form onSubmit={handleNext} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-5 h-5 text-slate-500 absolute left-4 top-3.5" />
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => handleChange("fullName", e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 text-base"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
                    Company / Organization
                  </label>
                  <div className="relative">
                    <Building className="w-5 h-5 text-slate-500 absolute left-4 top-3.5" />
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => handleChange("company", e.target.value)}
                      placeholder="Acme Corp"
                      className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 text-base"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-slate-500 absolute left-4 top-3.5" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="jane@example.com"
                      className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 text-base"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
                    Mobile Phone
                  </label>
                  <div className="relative">
                    <Phone className="w-5 h-5 text-slate-500 absolute left-4 top-3.5" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 text-base"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
                    Host Employee Name *
                  </label>
                  <div className="relative">
                    <User className="w-5 h-5 text-slate-500 absolute left-4 top-3.5" />
                    <input
                      type="text"
                      required
                      value={formData.hostName}
                      onChange={(e) => handleChange("hostName", e.target.value)}
                      placeholder="e.g. Sarah Jenkins"
                      className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 text-base"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
                    Purpose of Visit
                  </label>
                  <div className="relative">
                    <Briefcase className="w-5 h-5 text-slate-500 absolute left-4 top-3.5" />
                    <select
                      value={formData.purpose}
                      onChange={(e) => handleChange("purpose", e.target.value)}
                      className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-sky-500 text-base"
                    >
                      <option value="Business Meeting">Business Meeting</option>
                      <option value="Job Interview">Job Interview</option>
                      <option value="Vendor / Contractor">Vendor / Contractor</option>
                      <option value="Client Visit">Client Visit</option>
                      <option value="Personal Visit">Personal Visit</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Link
                  href="/kiosk"
                  className="flex-1 h-14 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-base flex items-center justify-center transition-colors cursor-pointer"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={!formData.fullName || !formData.hostName}
                  className="flex-1 h-14 rounded-2xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 transition-all cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h2 className="text-3xl font-extrabold text-white">Check-In Confirmed!</h2>
              <p className="text-slate-300 mt-1">
                Your host <strong>{formData.hostName}</strong> has been notified of your arrival.
              </p>
            </div>

            {/* Badge Preview Mock */}
            <div className="max-w-xs mx-auto p-5 rounded-2xl bg-white text-slate-950 text-left shadow-2xl border-4 border-slate-200">
              <div className="border-b-2 border-slate-900 pb-2 mb-3 flex items-center justify-between">
                <span className="font-extrabold text-xs uppercase tracking-widest text-sky-700">
                  VISITOR PASS
                </span>
                <span className="text-[10px] font-mono font-bold">#VP-1092</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 leading-tight">
                {formData.fullName}
              </h3>
              <p className="text-xs text-slate-600 font-semibold mt-0.5">
                {formData.company || "Independent Guest"}
              </p>
              <div className="mt-4 pt-3 border-t border-slate-200 text-xs">
                <span className="block text-slate-500 text-[10px] uppercase font-bold">Host</span>
                <span className="font-bold text-slate-900">{formData.hostName}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Badge printing command signaled to hardware thermal printer.</span>
            </div>

            {/* Prototype Disclaimer */}
            <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Phase 2 Prototype: Visitor record staging active. Full database recording implemented in Phase 1 backend.</span>
            </div>

            <Link
              href="/kiosk"
              className="inline-block px-8 py-4 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-lg shadow-xl shadow-sky-500/25 transition-all cursor-pointer"
            >
              Done & Return to Main Screen
            </Link>
          </div>
        )}
      </main>

      <KioskFooter
        showStartConversationCTA={false}
        secondsRemaining={secondsRemaining}
        isWarning={isWarning}
      />
    </div>
  );
}
