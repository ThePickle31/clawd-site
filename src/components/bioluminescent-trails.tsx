"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * Bioluminescent link hover trails — glowing plankton particles
 * that follow the cursor while hovering over links throughout the site.
 */
export function BioluminescentTrails() {
  const containerRef = useRef<HTMLDivElement>(null);
  const enabledRef = useRef(false);
  const activeRef = useRef(false);
  const lastSpawnRef = useRef(0);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });

  // Check capabilities once
  useEffect(() => {
    const pointerQuery = window.matchMedia("(pointer: fine)");
    const motionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const check = () => {
      enabledRef.current = pointerQuery.matches && !motionQuery.matches;
      if (containerRef.current) {
        containerRef.current.style.display = enabledRef.current
          ? "block"
          : "none";
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

  const spawnParticle = useCallback((x: number, y: number) => {
    const container = containerRef.current;
    if (!container) return;

    // Limit active particles
    if (container.childElementCount >= 20) return;

    const size = 3 + Math.random() * 5;
    // Small random offset from cursor for organic feel
    const offsetX = (Math.random() - 0.5) * 24;
    const offsetY = (Math.random() - 0.5) * 24;
    const duration = 600 + Math.random() * 600;
    const driftX = (Math.random() - 0.5) * 40;
    const driftY = -(20 + Math.random() * 30);

    // Bioluminescent colors: cyan, teal, green, soft blue
    const colors = [
      { r: 0, g: 255, b: 200 },   // cyan-green
      { r: 0, g: 200, b: 255 },   // cyan-blue
      { r: 100, g: 255, b: 180 }, // soft green
      { r: 60, g: 220, b: 255 },  // light blue
      { r: 0, g: 255, b: 255 },   // pure cyan
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const alpha = 0.4 + Math.random() * 0.3;

    const el = document.createElement("div");
    el.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      left: ${x + offsetX - size / 2}px;
      top: ${y + offsetY - size / 2}px;
      background: radial-gradient(circle at 40% 40%, rgba(${color.r}, ${color.g}, ${color.b}, ${alpha}), rgba(${color.r}, ${color.g}, ${color.b}, 0.05));
      box-shadow: 0 0 ${size * 2}px rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.5}), 0 0 ${size * 0.5}px rgba(${color.r}, ${color.g}, ${color.b}, ${alpha});
      pointer-events: none;
    `;

    const animation = el.animate(
      [
        { transform: "translate(0, 0) scale(0.5)", opacity: alpha },
        {
          transform: `translate(${driftX}px, ${driftY}px) scale(0.2)`,
          opacity: 0,
        },
      ],
      { duration, easing: "ease-out", fill: "forwards" }
    );

    animation.onfinish = () => el.remove();
    container.appendChild(el);
  }, []);

  // Continuous spawn loop while hovering a link
  const spawnLoop = useCallback(() => {
    if (!activeRef.current || !enabledRef.current) return;

    const now = Date.now();
    if (now - lastSpawnRef.current >= 50) {
      lastSpawnRef.current = now;
      spawnParticle(mouseRef.current.x, mouseRef.current.y);
    }

    rafRef.current = requestAnimationFrame(spawnLoop);
  }, [spawnParticle]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    const handleMouseOver = (e: MouseEvent) => {
      if (!enabledRef.current) return;
      const target = (e.target as HTMLElement).closest("a");
      if (target) {
        activeRef.current = true;
        rafRef.current = requestAnimationFrame(spawnLoop);
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (target) {
        // Check if we're moving to another element inside the same link
        const related = (e.relatedTarget as HTMLElement)?.closest("a");
        if (related === target) return;
        activeRef.current = false;
        cancelAnimationFrame(rafRef.current);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseover", handleMouseOver, { passive: true });
    document.addEventListener("mouseout", handleMouseOut, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
      cancelAnimationFrame(rafRef.current);
    };
  }, [spawnLoop]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[99] pointer-events-none overflow-hidden"
      style={{ display: "none" }}
    />
  );
}
