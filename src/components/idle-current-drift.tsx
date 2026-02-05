'use client';

import { useEffect, useRef } from 'react';

const IDLE_TIMEOUT = 5000;
const ACTIVITY_EVENTS = ['mousemove', 'scroll', 'keypress', 'touchstart'] as const;

export function IdleCurrentDrift() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;

    const main = document.querySelector('main');
    if (!main) return;

    const startDrift = () => {
      main.classList.add('ocean-current-drifting');
    };

    const stopDrift = () => {
      main.classList.remove('ocean-current-drifting');
    };

    const resetTimer = () => {
      stopDrift();
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(startDrift, IDLE_TIMEOUT);
    };

    // Start initial idle timer
    timerRef.current = setTimeout(startDrift, IDLE_TIMEOUT);

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, resetTimer, { passive: true });
    }

    const handleMotionChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        stopDrift();
        if (timerRef.current) clearTimeout(timerRef.current);
      } else {
        resetTimer();
      }
    };
    mediaQuery.addEventListener('change', handleMotionChange);

    return () => {
      stopDrift();
      if (timerRef.current) clearTimeout(timerRef.current);
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, resetTimer);
      }
      mediaQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  return null;
}
