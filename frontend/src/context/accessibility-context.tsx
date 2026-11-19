"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type TextScale = "normal" | "large" | "xlarge";

interface AccessibilityContextType {
  highContrast: boolean;
  toggleHighContrast: () => void;
  textScale: TextScale;
  setTextScale: (scale: TextScale) => void;
  increaseTextSize: () => void;
  decreaseTextSize: () => void;
  resetAccessibility: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType>({
  highContrast: false,
  toggleHighContrast: () => {},
  textScale: "normal",
  setTextScale: () => {},
  increaseTextSize: () => {},
  decreaseTextSize: () => {},
  resetAccessibility: () => {},
});

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [highContrast, setHighContrast] = useState(false);
  const [textScale, setTextScale] = useState<TextScale>("normal");

  const toggleHighContrast = () => {
    setHighContrast((prev) => !prev);
  };

  const increaseTextSize = () => {
    setTextScale((prev) => (prev === "normal" ? "large" : "xlarge"));
  };

  const decreaseTextSize = () => {
    setTextScale((prev) => (prev === "xlarge" ? "large" : "normal"));
  };

  const resetAccessibility = () => {
    setHighContrast(false);
    setTextScale("normal");
  };

  return (
    <AccessibilityContext.Provider
      value={{
        highContrast,
        toggleHighContrast,
        textScale,
        setTextScale,
        increaseTextSize,
        decreaseTextSize,
        resetAccessibility,
      }}
    >
      <div
        className={`w-full h-full min-h-screen transition-colors duration-200 ${
          highContrast ? "kiosk-high-contrast bg-black text-amber-300" : "bg-slate-950 text-slate-100"
        } ${
          textScale === "large" ? "text-lg" : textScale === "xlarge" ? "text-xl" : "text-base"
        }`}
      >
        {children}
      </div>
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  return useContext(AccessibilityContext);
}
