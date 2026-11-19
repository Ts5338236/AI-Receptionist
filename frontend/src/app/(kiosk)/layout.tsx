"use client";

import React from "react";
import { LanguageProvider } from "@/context/language-context";
import { AccessibilityProvider } from "@/context/accessibility-context";

export default function KioskRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      <AccessibilityProvider>
        <div className="touchscreen-kiosk fixed inset-0 w-screen h-screen overflow-hidden flex flex-col justify-between select-none">
          {children}
        </div>
      </AccessibilityProvider>
    </LanguageProvider>
  );
}
