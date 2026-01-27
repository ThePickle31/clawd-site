"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  drift: number;
  duration: number;
  floatDistance: number;
  color: "coral" | "cream";
}

export function BubbleCursorTrail() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [enabled, setEnabled] = useState(false);
  const idRef = useRef(0);
  const lastSpawnRef = useRef(0);

  // Only enable on desktop with fine pointer and no reduced-motion preference
  useEffect(() => {
    const pointerQuery = window.matchMedia("(pointer: fine)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const check = () => {
      setEnabled(pointerQuery.matches && !motionQuery.matches);
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
    // Throttle to ~60ms between spawns
    if (now - lastSpawnRef.current < 60) return;
    lastSpawnRef.current = now;

    const newBubble: Bubble = {
      id: idRef.current++,
      x,
      y,
      size: 6 + Math.random() * 18, // 6-24px
      drift: (Math.random() - 0.5) * 80, // Horizontal drift -40 to 40px
      duration: 1 + Math.random() * 1, // 1-2 seconds
      floatDistance: 100 + Math.random() * 100, // 100-200px upward
      color: Math.random() > 0.4 ? "coral" : "cream",
    };

    setBubbles((prev) => [...prev.slice(-19), newBubble]); // Max 20 bubbles
  }, []);

  const removeBubble = useCallback((id: number) => {
    setBubbles((prev) => prev.filter((b) => b.id !== id));
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      spawnBubble(e.clientX, e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [enabled, spawnBubble]);

  if (!enabled) return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
      <AnimatePresence>
        {bubbles.map((bubble) => {
          const isCoral = bubble.color === "coral";
          return (
            <motion.div
              key={bubble.id}
              initial={{
                x: bubble.x - bubble.size / 2,
                y: bubble.y - bubble.size / 2,
                opacity: 0.7,
                scale: 0.3,
              }}
              animate={{
                x: bubble.x - bubble.size / 2 + bubble.drift,
                y: bubble.y - bubble.floatDistance - bubble.size / 2,
                opacity: 0,
                scale: 1,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: bubble.duration,
                ease: "easeOut",
              }}
              onAnimationComplete={() => removeBubble(bubble.id)}
              className="absolute rounded-full"
              style={{
                width: bubble.size,
                height: bubble.size,
                background: isCoral
                  ? `radial-gradient(circle at 30% 30%, rgba(255, 107, 74, 0.5), rgba(255, 107, 74, 0.1))`
                  : `radial-gradient(circle at 30% 30%, rgba(255, 248, 240, 0.5), rgba(255, 248, 240, 0.1))`,
                boxShadow: isCoral
                  ? `inset -1px -1px 3px rgba(255, 255, 255, 0.25), 0 0 ${bubble.size / 2}px rgba(255, 107, 74, 0.15)`
                  : `inset -1px -1px 3px rgba(255, 255, 255, 0.3), 0 0 ${bubble.size / 2}px rgba(255, 248, 240, 0.15)`,
                backdropFilter: "blur(2px)",
                WebkitBackdropFilter: "blur(2px)",
                border: isCoral
                  ? "1px solid rgba(255, 107, 74, 0.2)"
                  : "1px solid rgba(255, 248, 240, 0.2)",
              }}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}
