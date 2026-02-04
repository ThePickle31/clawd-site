"use client";

import { useEffect, useRef } from "react";

export function AbyssalSpotlight() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Hide on touch devices
    const mq = window.matchMedia("(pointer: fine) and (min-width: 768px)");

    function updateVisibility() {
      if (el) {
        el.style.opacity = mq.matches ? "1" : "0";
      }
    }

    function onMouseMove(e: MouseEvent) {
      if (el) {
        el.style.setProperty("--mouse-x", `${e.clientX}px`);
        el.style.setProperty("--mouse-y", `${e.clientY}px`);
      }
    }

    updateVisibility();
    mq.addEventListener("change", updateVisibility);
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    return () => {
      mq.removeEventListener("change", updateVisibility);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 1,
        opacity: 0,
        willChange: "background",
        background:
          "radial-gradient(circle 350px at var(--mouse-x, -1000px) var(--mouse-y, -1000px), rgba(255, 107, 74, 0.06) 0%, rgba(255, 107, 74, 0.02) 40%, transparent 100%)",
      }}
      aria-hidden="true"
    />
  );
}
