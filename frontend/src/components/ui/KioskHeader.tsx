"use client";

import React from "react";
import { StatusBanner } from "@/components/kiosk/status-banner";

export interface KioskHeaderProps {
  showBackToHome?: boolean;
}

export function KioskHeader({ showBackToHome = false }: KioskHeaderProps) {
  return <StatusBanner showBackToHome={showBackToHome} />;
}
