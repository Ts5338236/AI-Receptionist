"use client";

import React, { useEffect, useState } from "react";
import { Wifi, Mic, Volume2, ShieldCheck, Camera } from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";

interface StatusBannerProps {
  kioskId?: string;
  buildingName?: string;
}

export function StatusBanner({
  kioskId = "KIOSK-LOBBY-01",
  buildingName = "Global HQ • Tower A",
}: StatusBannerProps) {
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
    <header className="w-full flex flex-row items-center justify-between px-8 py-5 bg-slate-950/70 border-b border-slate-800/80 backdrop-blur-md select-none">
      {/* Location & Organization */}
      <div className="flex flex-col">
        <span className="text-xs uppercase tracking-widest text-sky-400 font-semibold flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-sky-400" />
          {buildingName}
        </span>
        <span className="text-slate-400 text-xs font-mono">{kioskId}</span>
      </div>

      {/* Clock & Date */}
      <div className="flex flex-col items-center">
        <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
          {time || "--:--:-- --"}
        </span>
        <span className="text-xs text-slate-400 font-medium">{date}</span>
      </div>

      {/* Hardware / Network Health Badges */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <Wifi className="w-3.5 h-3.5" />
          <span>Online</span>
        </div>

        <div className="flex items-center gap-2 text-slate-400 text-xs border-l border-slate-800 pl-4">
          <span title="Microphone Listening" className="flex items-center gap-1 text-slate-300">
            <Mic className="w-3.5 h-3.5 text-sky-400" />
            Active
          </span>
          <span title="Camera Sensor" className="flex items-center gap-1 text-slate-300">
            <Camera className="w-3.5 h-3.5 text-sky-400" />
            Ready
          </span>
          <span title="Audio Output" className="flex items-center gap-1 text-slate-300">
            <Volume2 className="w-3.5 h-3.5 text-sky-400" />
            Active
          </span>
        </div>
      </div>
    </header>
  );
}
