"use client";

import { useEffect, useRef, useCallback } from "react";

export function ClickRipple() {
  const containerRef = useRef<HTMLDivElement>(null);
  const enabledRef = useRef(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const check = () => {
      enabledRef.current = !motionQuery.matches;
      if (containerRef.current) {
        containerRef.current.style.display = enabledRef.current
          ? "block"
          : "none";
      }
    };

    check();
    motionQuery.addEventListener("change", check);
    return () => motionQuery.removeEventListener("change", check);
  }, []);

  const spawnRipple = useCallback((x: number, y: number) => {
    const container = containerRef.current;
    if (!container) return;

    // Limit active ripples
    if (container.childElementCount >= 10) return;

    const maxSize = 300 + Math.random() * 200;
    const duration = 800 + Math.random() * 400;
    const useCoral = Math.random() > 0.35;

    const color = useCoral
      ? "rgba(255, 107, 74, 0.4)"
      : "rgba(100, 220, 255, 0.35)";

    // Create 2-3 concentric rings for a realistic water ripple
    const ringCount = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < ringCount; i++) {
      const delay = i * 120;
      const ringSize = maxSize * (0.7 + i * 0.2);

      const el = document.createElement("div");
      el.style.cssText = `
        position: absolute;
        width: ${ringSize}px;
        height: ${ringSize}px;
        border-radius: 50%;
        left: ${x - ringSize / 2}px;
        top: ${y - ringSize / 2}px;
        border: 2px solid ${color};
        pointer-events: none;
      `;

      const animation = el.animate(
        [
          { transform: "scale(0)", opacity: 0.7 },
          { transform: "scale(1)", opacity: 0 },
        ],
        {
          duration: duration + i * 150,
          delay,
          easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          fill: "forwards",
        }
      );

      animation.onfinish = () => el.remove();
      container.appendChild(el);
    }
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!enabledRef.current) return;
      spawnRipple(e.clientX, e.clientY);
    };

    window.addEventListener("click", handleClick, { passive: true });
    return () => window.removeEventListener("click", handleClick);
  }, [spawnRipple]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden z-[1]"
      style={{ display: "none" }}
    />
  );
}
