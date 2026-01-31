"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const KONAMI_CODE = [
  "KeyW",
  "KeyW",
  "KeyS",
  "KeyS",
  "KeyA",
  "KeyD",
  "KeyA",
  "KeyD",
  "KeyB",
  "KeyA",
];

export function KonamiCode() {
  const keysPressedRef = useRef<string[]>([]);
  const [activated, setActivated] = useState(false);
  const [lobsters, setLobsters] = useState<{ id: number; x: number; duration: number; delay: number }[]>([]);

  const spawnLobsters = useCallback(() => {
    const newLobsters = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      duration: 4 + Math.random() * 4,
      delay: Math.random() * 8,
    }));
    setLobsters(newLobsters);
    setTimeout(() => {
      setLobsters([]);
      setActivated(false);
    }, 15000);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const newKeys = [...keysPressedRef.current, e.code].slice(-10);
      keysPressedRef.current = newKeys;

      if (newKeys.join(",") === KONAMI_CODE.join(",")) {
        setActivated(true);
        spawnLobsters();
        keysPressedRef.current = [];
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [spawnLobsters]);

  return (
    <AnimatePresence>
      {activated && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden"
          >
            {lobsters.map((lobster) => (
              <motion.div
                key={lobster.id}
                initial={{ x: `${lobster.x}vw`, y: "-10vh", rotate: 0 }}
                animate={{
                  y: "110vh",
                  rotate: 360,
                }}
                transition={{
                  duration: lobster.duration,
                  ease: "linear",
                  delay: lobster.delay,
                }}
                className="absolute text-4xl"
              >
                🦞
              </motion.div>
            ))}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[10000] pointer-events-none"
          >
            <div className="bg-primary text-primary-foreground px-8 py-4 rounded-xl shadow-2xl">
              <p className="text-2xl font-bold text-center">
                🦞 LOBSTER MODE ACTIVATED! 🦞
              </p>
              <p className="text-center mt-2 text-sm opacity-90">
                You found the secret!
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
