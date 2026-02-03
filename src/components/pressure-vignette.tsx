"use client";

import { useSyncExternalStore } from "react";

function subscribeToScroll(callback: () => void) {
  window.addEventListener("scroll", callback, { passive: true });
  window.addEventListener("resize", callback, { passive: true });
  return () => {
    window.removeEventListener("scroll", callback);
    window.removeEventListener("resize", callback);
  };
}

function getScrollPercent() {
  const docHeight =
    document.documentElement.scrollHeight - window.innerHeight;
  if (docHeight <= 0) return 0;
  return Math.min(Math.max(window.scrollY / docHeight, 0), 1);
}

function getServerSnapshot() {
  return 0;
}

export function PressureVignette() {
  const scrollPercent = useSyncExternalStore(
    subscribeToScroll,
    getScrollPercent,
    getServerSnapshot
  );

  // Scale from 0 to a subtle max intensity
  // At scroll 0 = no vignette, at scroll 1 = noticeable but not overwhelming
  const intensity = scrollPercent * 0.55;

  return (
    <div
      className="fixed inset-0 z-50 pointer-events-none"
      style={{
        boxShadow: `inset 0 0 ${60 + intensity * 140}px ${20 + intensity * 80}px rgba(0, 0, 0, ${intensity})`,
        transition: "box-shadow 0.3s ease-out",
      }}
      aria-hidden="true"
    />
  );
}
