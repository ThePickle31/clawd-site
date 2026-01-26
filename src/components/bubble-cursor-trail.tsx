"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  drift: number;
}

export function BubbleCursorTrail() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const idRef = useRef(0);
  const lastSpawnRef = useRef(0);

  const spawnBubble = useCallback((x: number, y: number) => {
    const now = Date.now();
    // Throttle bubble spawning to every 80ms for subtle effect
    if (now - lastSpawnRef.current < 80) return;
    lastSpawnRef.current = now;

    const newBubble: Bubble = {
      id: idRef.current++,
      x,
      y,
      size: 4 + Math.random() * 12, // 4-16px for varying sizes
      drift: (Math.random() - 0.5) * 60, // Random horizontal drift -30 to 30px
    };

    setBubbles((prev) => [...prev.slice(-15), newBubble]); // Keep max 16 bubbles
  }, []);

  const removeBubble = useCallback((id: number) => {
    setBubbles((prev) => prev.filter((b) => b.id !== id));
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      spawnBubble(e.clientX, e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [spawnBubble]);

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
      <AnimatePresence>
        {bubbles.map((bubble) => (
          <motion.div
            key={bubble.id}
            initial={{
              x: bubble.x - bubble.size / 2,
              y: bubble.y - bubble.size / 2,
              opacity: 0.6,
              scale: 0.5,
            }}
            animate={{
              x: bubble.x - bubble.size / 2 + bubble.drift,
              y: bubble.y - 120 - bubble.size, // Float upward 120px
              opacity: 0,
              scale: 1,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 1.2,
              ease: "easeOut",
            }}
            onAnimationComplete={() => removeBubble(bubble.id)}
            className="absolute rounded-full"
            style={{
              width: bubble.size,
              height: bubble.size,
              background: `radial-gradient(circle at 30% 30%, rgba(255, 107, 74, 0.4), rgba(255, 107, 74, 0.15))`,
              boxShadow: `inset -1px -1px 2px rgba(255, 255, 255, 0.2), 0 0 ${bubble.size / 2}px rgba(255, 107, 74, 0.2)`,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
