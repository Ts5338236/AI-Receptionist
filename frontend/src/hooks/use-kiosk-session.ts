"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

interface KioskSessionOptions {
  timeoutSeconds?: number;
  warnSeconds?: number;
  homePath?: string;
}

export function useKioskSession({
  timeoutSeconds = 60,
  warnSeconds = 15,
  homePath = "/kiosk",
}: KioskSessionOptions = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const [secondsRemaining, setSecondsRemaining] = useState<number>(timeoutSeconds);
  const [isWarning, setIsWarning] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetActivity = useCallback(() => {
    setSecondsRemaining(timeoutSeconds);
    setIsWarning(false);
  }, [timeoutSeconds]);

  // Handle automatic session termination and reset
  const handleSessionTimeout = useCallback(() => {
    if (typeof window !== "undefined") {
      // Clear sensitive visitor session data
      sessionStorage.removeItem("visitor_registration");
      sessionStorage.removeItem("active_chat_transcript");
    }
    setIsWarning(false);
    setSecondsRemaining(timeoutSeconds);
    if (pathname !== homePath) {
      router.push(homePath);
    }
  }, [homePath, pathname, router, timeoutSeconds]);

  useEffect(() => {
    // Only engage inactivity timers on non-welcome screens
    if (pathname === homePath || pathname === "/kiosk/welcome") {
      return;
    }

    const events = ["pointerdown", "touchstart", "mousemove", "keydown", "scroll"];
    const handleEvent = () => resetActivity();

    events.forEach((evt) => {
      window.addEventListener(evt, handleEvent, { passive: true });
    });

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          handleSessionTimeout();
          return timeoutSeconds;
        }
        if (prev - 1 <= warnSeconds) {
          setIsWarning(true);
        }
        return prev - 1;
      });
    }, 1000);

    timerRef.current = interval;

    return () => {
      events.forEach((evt) => {
        window.removeEventListener(evt, handleEvent);
      });
      clearInterval(interval);
    };
  }, [pathname, homePath, resetActivity, handleSessionTimeout, timeoutSeconds, warnSeconds]);

  return {
    secondsRemaining,
    isWarning,
    resetActivity,
    handleSessionTimeout,
  };
}
