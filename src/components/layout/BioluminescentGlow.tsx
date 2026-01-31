"use client";

import { useEffect, useRef } from "react";

export function BioluminescentGlow() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Skip on touch devices or if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;

    if (prefersReducedMotion || isCoarsePointer) return;

    const container = containerRef.current;
    if (!container) return;

    container.style.opacity = "1";

    let rafId: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        container.style.setProperty("--mouse-x", `${e.clientX}px`);
        container.style.setProperty("--mouse-y", `${e.clientY}px`);
        rafId = null;
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="bioluminescent-glow"
      style={{ opacity: 0 }}
    />
  );
}
