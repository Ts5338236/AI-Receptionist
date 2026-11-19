"use client";

import React from "react";
import { KioskFooter as BaseKioskFooter } from "@/components/kiosk/kiosk-footer";

export interface KioskFooterProps {
  secondsRemaining?: number;
  isWarning?: boolean;
}

export function KioskFooter({
  secondsRemaining,
  isWarning,
}: KioskFooterProps) {
  return (
    <BaseKioskFooter
      secondsRemaining={secondsRemaining}
      isWarning={isWarning}
    />
  );
}
