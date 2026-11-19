"use client";

import React from "react";
import { StatusBanner } from "@/components/kiosk/status-banner";
import { AvatarStage } from "@/components/kiosk/avatar-stage";
import { QuickActions } from "@/components/kiosk/quick-actions";
import { KioskFooter } from "@/components/kiosk/kiosk-footer";
import { useLanguage } from "@/context/language-context";

export default function KioskWelcomePage() {
  const { t } = useLanguage();

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-slate-950">
      {/* Top Telemetry & Status Bar with Company Branding */}
      <StatusBanner showBackToHome={false} />

      {/* Main Digital Human Avatar Stage */}
      <main className="flex-1 flex flex-col items-center justify-center py-2 overflow-y-auto">
        <div className="w-full text-center max-w-4xl mx-auto px-4 mb-2">
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
            {t.welcomeHeading}
          </h1>
          <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto mt-2 leading-relaxed">
            {t.welcomeSubheading}
          </p>
        </div>

        {/* Digital Human Viewport (Idle State) */}
        <AvatarStage state="IDLE" customMessage={t.avatarIdle} />

        {/* 6 Quick Action Cards */}
        <div className="w-full mt-2">
          <QuickActions />
        </div>
      </main>

      {/* Footer Navigation, Start Conversation CTA & Controls */}
      <KioskFooter showStartConversationCTA={true} />
    </div>
  );
}
