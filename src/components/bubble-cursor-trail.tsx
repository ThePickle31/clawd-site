"use client";

import { useEffect, useRef, useCallback } from "react";

export function BubbleCursorTrail() {
  const containerRef = useRef<HTMLDivElement>(null);
  const enabledRef = useRef(false);
  const lastSpawnRef = useRef(0);

  // Check capabilities once
  useEffect(() => {
    const pointerQuery = window.matchMedia("(pointer: fine)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const check = () => {
      enabledRef.current = pointerQuery.matches && !motionQuery.matches;
      if (containerRef.current) {
        containerRef.current.style.display = enabledRef.current ? "block" : "none";
      }
    };

    check();
    pointerQuery.addEventListener("change", check);
    motionQuery.addEventListener("change", check);

    return () => {
      pointerQuery.removeEventListener("change", check);
      motionQuery.removeEventListener("change", check);
    };
  }, []);

  const spawnBubble = useCallback((x: number, y: number) => {
    const now = Date.now();
    if (now - lastSpawnRef.current < 80) return;
    lastSpawnRef.current = now;

    const container = containerRef.current;
    if (!container) return;

    // Limit active bubbles
    if (container.childElementCount >= 15) return;

    const size = 6 + Math.random() * 16;
    const drift = (Math.random() - 0.5) * 80;
    const duration = 1000 + Math.random() * 800;
    const floatDistance = 100 + Math.random() * 80;
    const isCoral = Math.random() > 0.4;

    const el = document.createElement("div");
    el.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      left: ${x - size / 2}px;
      top: ${y - size / 2}px;
      background: radial-gradient(circle at 30% 30%, ${
        isCoral ? "rgba(255, 107, 74, 0.5), rgba(255, 107, 74, 0.1)" : "rgba(255, 248, 240, 0.5), rgba(255, 248, 240, 0.1)"
      });
      border: 1px solid ${isCoral ? "rgba(255, 107, 74, 0.2)" : "rgba(255, 248, 240, 0.2)"};
      pointer-events: none;
    `;

    const animation = el.animate(
      [
        { transform: "translate(0, 0) scale(0.3)", opacity: 0.7 },
        { transform: `translate(${drift}px, ${-floatDistance}px) scale(1)`, opacity: 0 },
      ],
      { duration, easing: "ease-out", fill: "forwards" }
    );

    animation.onfinish = () => el.remove();

    container.appendChild(el);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!enabledRef.current) return;
      spawnBubble(e.clientX, e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [spawnBubble]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] pointer-events-none overflow-hidden"
      style={{ display: "none" }}
    />
  );
}
