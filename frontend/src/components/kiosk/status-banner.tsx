"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Wifi, Mic, Volume2, Camera, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/context/language-context";
import { formatDate, formatTime } from "@/lib/utils";

interface StatusBannerProps {
  showBackToHome?: boolean;
}

export function StatusBanner({ showBackToHome = false }: StatusBannerProps) {
  const { t } = useLanguage();
  const [time, setTime] = useState<string>("");
  const [date, setDate] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(formatTime(now));
      setDate(formatDate(now));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="w-full flex flex-row items-center justify-between px-8 py-4 bg-slate-950/80 border-b border-slate-800/80 backdrop-blur-md select-none shrink-0 z-20">
      {/* Company Logo & Identity Placeholder */}
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-md shadow-sky-500/20 shrink-0">
          <Building2 className="w-6 h-6 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            {t.brandName}
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 uppercase">
              AI Kiosk
            </span>
          </span>
          <span className="text-xs text-slate-400 font-medium">{t.brandTagline}</span>
        </div>
      </div>

      {/* Real-time Clock & Date */}
      <div className="hidden sm:flex flex-col items-center">
        <span className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-mono">
          {time || "--:--:-- --"}
        </span>
        <span className="text-xs text-slate-400 font-medium">{date}</span>
      </div>

      {/* Hardware Sensors, Network Status & Home Trigger */}
      <div className="flex items-center gap-3">
        {showBackToHome && (
          <Link
            href="/kiosk"
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            &larr; {t.backToHomeBtn}
          </Link>
        )}

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <Wifi className="w-3.5 h-3.5" />
          <span className="hidden md:inline">{t.onlineStatus}</span>
        </div>

        <div className="hidden lg:flex items-center gap-3 text-slate-400 text-xs border-l border-slate-800 pl-3">
          <span title="Voice Sensor" className="flex items-center gap-1 text-slate-300">
            <Mic className="w-3.5 h-3.5 text-sky-400" />
            Mic
          </span>
          <span title="Vision Sensor" className="flex items-center gap-1 text-slate-300">
            <Camera className="w-3.5 h-3.5 text-sky-400" />
            Camera
          </span>
          <span title="Audio Output" className="flex items-center gap-1 text-slate-300">
            <Volume2 className="w-3.5 h-3.5 text-sky-400" />
            Audio
          </span>
        </div>
      </div>
    </header>
  );
}
