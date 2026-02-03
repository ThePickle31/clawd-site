"use client";

import { useEffect, useRef, useCallback } from "react";

export function ScrollBubbles() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastScrollY = useRef(0);
  const enabledRef = useRef(true);
  const rafRef = useRef<number | null>(null);
  const lastSpawnTime = useRef(0);

  const spawnBubble = useCallback(() => {
    const container = containerRef.current;
    if (!container || !enabledRef.current) return;
    if (container.childElementCount >= 25) return;

    const now = Date.now();
    if (now - lastSpawnTime.current < 60) return;
    lastSpawnTime.current = now;

    const size = 4 + Math.random() * 14;
    const startX = Math.random() * 100;
    const drift = (Math.random() - 0.5) * 120;
    const duration = 2000 + Math.random() * 2500;
    const wobbleAmp = 15 + Math.random() * 25;
    const wobbleFreq = 2 + Math.random() * 3;

    const useCoral = Math.random() > 0.6;
    const alpha = 0.15 + Math.random() * 0.25;
    const color = useCoral
      ? `rgba(255, 107, 74, ${alpha})`
      : `rgba(140, 220, 255, ${alpha})`;
    const borderColor = useCoral
      ? `rgba(255, 107, 74, ${alpha + 0.1})`
      : `rgba(140, 220, 255, ${alpha + 0.1})`;

    const el = document.createElement("div");
    el.style.cssText = `
      position: fixed;
      bottom: -${size + 10}px;
      left: ${startX}%;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: radial-gradient(circle at 35% 35%, ${color}, transparent 70%);
      border: 1px solid ${borderColor};
      pointer-events: none;
      z-index: 5;
    `;

    // Build wobble keyframes for organic sideways motion
    const frames: Keyframe[] = [];
    const steps = 20;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const rise = -(window.innerHeight + size + 40) * t;
      const wobble = Math.sin(t * Math.PI * 2 * wobbleFreq) * wobbleAmp;
      frames.push({
        transform: `translate(${drift * t + wobble}px, ${rise}px) scale(${0.5 + t * 0.5})`,
        opacity: t < 0.1 ? t * 10 * 0.8 : t > 0.85 ? (1 - t) * (1 / 0.15) * 0.6 : 0.7,
      });
    }

    const animation = el.animate(frames, {
      duration,
      easing: "linear",
      fill: "forwards",
    });

    animation.onfinish = () => el.remove();
    container.appendChild(el);
  }, []);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mql.matches) {
      enabledRef.current = false;
      return;
    }

    const onChange = (e: MediaQueryListEvent) => {
      enabledRef.current = !e.matches;
    };
    mql.addEventListener("change", onChange);

    const container = document.createElement("div");
    container.style.cssText =
      "position: fixed; inset: 0; pointer-events: none; overflow: hidden; z-index: 5;";
    document.body.appendChild(container);
    containerRef.current = container;

    lastScrollY.current = window.scrollY;

    const handleScroll = () => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        if (!enabledRef.current) return;

        const currentY = window.scrollY;
        const delta = Math.abs(currentY - lastScrollY.current);
        lastScrollY.current = currentY;

        if (delta < 8) return;

        // More scroll speed = more bubbles (1-4 per frame based on scroll delta)
        const count = Math.min(4, Math.floor(delta / 30) + 1);
        for (let i = 0; i < count; i++) {
          // Stagger spawns slightly
          if (i === 0) {
            spawnBubble();
          } else {
            setTimeout(spawnBubble, i * 40);
          }
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      mql.removeEventListener("change", onChange);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      container.remove();
    };
  }, [spawnBubble]);

  return null;
}
