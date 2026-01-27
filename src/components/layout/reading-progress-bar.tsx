"use client";

import { useEffect, useRef, useCallback } from "react";

export function ReadingProgressBar() {
  const barRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const needsUpdateRef = useRef(false);

  const updateProgress = useCallback(() => {
    needsUpdateRef.current = false;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;

    if (docHeight > 0 && barRef.current) {
      const progress = Math.min((scrollTop / docHeight) * 100, 100);
      barRef.current.style.transform = `scaleX(${progress / 100})`;
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (!needsUpdateRef.current) {
      needsUpdateRef.current = true;
      rafRef.current = requestAnimationFrame(updateProgress);
    }
  }, [updateProgress]);

  useEffect(() => {
    updateProgress();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [handleScroll, updateProgress]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-transparent">
      <div
        ref={barRef}
        className="h-full bg-[#FF6B4A]"
        style={{
          transformOrigin: "left",
          transform: "scaleX(0)",
          willChange: "transform",
        }}
      />
    </div>
  );
}
