"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Pixel art crab rendered via CSS box-shadow on a 1px element.
 * Each "pixel" is 2×2 real px, giving a ~32×32 visual size from a 16×16 grid.
 *
 * The crab autonomously wanders left/right near the bottom of the viewport,
 * pausing randomly. It has a red glow pulse and a walking bob animation.
 */

// Colors
const R = "#e74c3c"; // red body
const D = "#c0392b"; // dark red
const B = "#2c3e50"; // dark (eyes)
const L = "#ff6b6b"; // light red (highlights)
const C = "#e55039"; // coral accent
const W = "#ffffff"; // white (eye shine)
const T = "transparent";

// 16x16 pixel grid — each entry is a color or T for transparent
// Designed as a top-down-ish crab with claws and legs
const CRAB_GRID: string[][] = [
  //0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15
  [T, T, T, D, T, T, T, T, T, T, T, T, D, T, T, T], // 0  claw tips
  [T, T, D, R, D, T, T, T, T, T, T, D, R, D, T, T], // 1  claws
  [T, D, R, R, R, D, T, T, T, T, D, R, R, R, D, T], // 2  claws
  [T, D, R, L, R, D, T, T, T, T, D, R, L, R, D, T], // 3  claws
  [T, T, D, R, D, T, T, T, T, T, T, D, R, D, T, T], // 4  claw arms
  [T, T, T, D, T, T, T, T, T, T, T, T, D, T, T, T], // 5  claw arms
  [T, T, T, T, D, D, D, D, D, D, D, D, T, T, T, T], // 6  top shell
  [T, T, T, D, R, R, R, C, C, R, R, R, D, T, T, T], // 7  shell
  [T, T, D, R, R, B, R, R, R, R, B, R, R, D, T, T], // 8  shell + eyes
  [T, T, D, R, W, B, R, L, L, R, B, W, R, D, T, T], // 9  eyes with shine
  [T, T, D, R, R, R, R, R, R, R, R, R, R, D, T, T], // 10 shell
  [T, T, T, D, R, R, C, R, R, C, R, R, D, T, T, T], // 11 lower shell
  [T, T, T, T, D, D, D, D, D, D, D, D, T, T, T, T], // 12 shell bottom
  [T, T, D, T, T, D, T, T, T, T, D, T, T, D, T, T], // 13 legs
  [T, D, T, T, T, T, D, T, T, D, T, T, T, T, D, T], // 14 legs
  [D, T, T, T, T, T, T, T, T, T, T, T, T, T, T, D], // 15 leg tips
];

// Build box-shadow string from the grid. Each pixel = 2x2 real pixels.
function buildBoxShadow(): string {
  const shadows: string[] = [];
  const scale = 2; // each pixel is 2x2

  for (let y = 0; y < CRAB_GRID.length; y++) {
    for (let x = 0; x < CRAB_GRID[y].length; x++) {
      const color = CRAB_GRID[y][x];
      if (color !== T) {
        shadows.push(`${x * scale}px ${y * scale}px 0 0 ${color}`);
      }
    }
  }

  return shadows.join(",");
}

const crabShadow = buildBoxShadow();

type CrabState = "walking" | "idle";

export function WanderingCrab() {
  const [mounted, setMounted] = useState(false);
  const posRef = useRef(50); // x position in vw-ish percentage
  const dirRef = useRef<1 | -1>(1); // 1 = right, -1 = left
  const stateRef = useRef<CrabState>("walking");
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const crabElRef = useRef<HTMLDivElement | null>(null);
  const bobRef = useRef(0);
  const prefersReducedMotion = useRef(false);

  // Check reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotion.current = mq.matches;
    const handler = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches;
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const scheduleIdle = useCallback(() => {
    // Walk for 3-8 seconds, then pause
    const walkDuration = 3000 + Math.random() * 5000;
    idleTimerRef.current = setTimeout(() => {
      stateRef.current = "idle";
      // Idle for 1-4 seconds, then pick new direction
      const idleDuration = 1000 + Math.random() * 3000;
      idleTimerRef.current = setTimeout(() => {
        // Maybe change direction
        if (Math.random() > 0.5) {
          dirRef.current = dirRef.current === 1 ? -1 : 1;
        }
        stateRef.current = "walking";
        scheduleIdle();
      }, idleDuration);
    }, walkDuration);
  }, []);

  useEffect(() => {
    setMounted(true);
    // Random start position
    posRef.current = 20 + Math.random() * 60;
    // Random start direction
    dirRef.current = Math.random() > 0.5 ? 1 : -1;

    scheduleIdle();

    const speed = 0.02; // vw per frame (~0.02vw/frame at 60fps ≈ ~1.2vw/s)
    let lastTime = performance.now();

    const animate = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      if (prefersReducedMotion.current) {
        animFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      const el = crabElRef.current;
      if (!el) {
        animFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      if (stateRef.current === "walking") {
        const moveAmount = speed * (delta / 16.67); // normalize to ~60fps
        posRef.current += dirRef.current * moveAmount;

        // Bounce off edges
        if (posRef.current > 92) {
          posRef.current = 92;
          dirRef.current = -1;
        } else if (posRef.current < 2) {
          posRef.current = 2;
          dirRef.current = 1;
        }

        // Walking bob
        bobRef.current = Math.sin(time / 120) * 2;
      } else {
        // Ease bob to 0 when idle
        bobRef.current *= 0.95;
      }

      el.style.left = `${posRef.current}vw`;
      el.style.transform = `scaleX(${dirRef.current}) translateY(${bobRef.current}px)`;

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [scheduleIdle]);

  if (!mounted) return null;

  return (
    <div
      className="fixed bottom-6 pointer-events-none z-50 hidden lg:block"
      ref={crabElRef}
      style={{
        left: `${posRef.current}vw`,
      }}
      aria-hidden="true"
    >
      {/* Glow layer */}
      <div
        className="absolute inset-0 crab-glow"
        style={{
          width: 32,
          height: 32,
          filter: "blur(8px)",
          background: "radial-gradient(circle, rgba(231,76,60,0.4) 0%, transparent 70%)",
        }}
      />
      {/* Pixel art crab via box-shadow */}
      <div
        style={{
          width: 1,
          height: 1,
          overflow: "visible",
          boxShadow: crabShadow,
          // offset so the crab is centered on the position
          position: "relative",
          imageRendering: "pixelated",
        }}
      />
      <style jsx>{`
        @keyframes crab-glow-pulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.3);
          }
        }
        .crab-glow {
          animation: crab-glow-pulse 2s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .crab-glow {
            animation: none;
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  );
}
