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

// Light ray configuration — each ray has its own characteristics
const rays = [
  { left: "8%", width: "6%", angle: -12, opacity: 0.08, delay: 0, duration: 8 },
  { left: "25%", width: "8%", angle: -8, opacity: 0.06, delay: 1.5, duration: 10 },
  { left: "48%", width: "10%", angle: -5, opacity: 0.07, delay: 0.5, duration: 9 },
  { left: "72%", width: "7%", angle: -10, opacity: 0.05, delay: 2, duration: 11 },
  { left: "88%", width: "5%", angle: -15, opacity: 0.06, delay: 1, duration: 8.5 },
];

export function UnderwaterLightRays() {
  const scrollPercent = useSyncExternalStore(
    subscribeToScroll,
    getScrollPercent,
    getServerSnapshot
  );

  // Fade out as user scrolls deeper — light doesn't reach the depths
  // Full visibility at top, completely faded by 60% scroll
  const fadeMultiplier = Math.max(0, 1 - scrollPercent / 0.6);

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none z-0"
      style={{
        opacity: fadeMultiplier,
        transition: "opacity 0.5s ease-out",
      }}
      aria-hidden="true"
    >
      {rays.map((ray, i) => (
        <div
          key={i}
          className="absolute top-0 light-ray"
          style={{
            left: ray.left,
            width: ray.width,
            height: "120%",
            background: `linear-gradient(
              180deg,
              rgba(255, 255, 255, ${ray.opacity}) 0%,
              rgba(173, 216, 230, ${ray.opacity * 0.6}) 30%,
              rgba(100, 180, 200, ${ray.opacity * 0.3}) 60%,
              transparent 100%
            )`,
            "--ray-angle": `${ray.angle}deg`,
            transformOrigin: "top center",
            filter: "blur(8px)",
            animationDelay: `${ray.delay}s`,
            animationDuration: `${ray.duration}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
