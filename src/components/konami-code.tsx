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

interface Lobster {
  id: number;
  x: number;
  duration: number;
  delay: number;
  hasParachute: boolean;
  size: number;
  isBaby?: boolean;
  startY?: string;
}

export function KonamiCode() {
  const keysPressedRef = useRef<string[]>([]);
  const [activated, setActivated] = useState(false);
  const [lobsters, setLobsters] = useState<Lobster[]>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const nextIdRef = useRef(200);

  // Load high score from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("lobster-high-score");
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  const spawnLobsters = useCallback(() => {
    const newLobsters: Lobster[] = Array.from({ length: 100 }, (_, i) => {
      const hasParachute = Math.random() < 0.25; // 25% chance of parachute
      return {
        id: i,
        x: Math.random() * 95,
        duration: hasParachute ? 8 + Math.random() * 6 : 4 + Math.random() * 4,
        delay: Math.random() * 8,
        hasParachute,
        size: 1,
      };
    });
    setLobsters(newLobsters);
    setScore(0);
    setShowScore(true);
    setTimeout(() => {
      setLobsters([]);
      setActivated(false);
      setShowScore(false);
    }, 18000);
  }, []);

  const popLobster = useCallback((lobsterId: number, x: number) => {
    setScore((prev) => {
      const newScore = prev + 1;
      setHighScore((prevHigh) => {
        const best = Math.max(newScore, prevHigh);
        localStorage.setItem("lobster-high-score", best.toString());
        return best;
      });
      return newScore;
    });

    // Remove the clicked lobster
    setLobsters((prev) => prev.filter((l) => l.id !== lobsterId));

    // Spawn 3-5 baby lobsters from the click position
    const babyCount = 3 + Math.floor(Math.random() * 3);
    const babies: Lobster[] = Array.from({ length: babyCount }, (_, i) => {
      const id = nextIdRef.current++;
      return {
        id,
        x: Math.max(0, Math.min(95, x + (Math.random() - 0.5) * 15)),
        duration: 2 + Math.random() * 2,
        delay: 0,
        hasParachute: false,
        size: 0.5,
        isBaby: true,
        startY: "50vh",
      };
    });

    setLobsters((prev) => [...prev, ...babies]);
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
          {/* Lobster rain container */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden"
          >
            {lobsters.map((lobster) => (
              <motion.div
                key={lobster.id}
                initial={{
                  x: `${lobster.x}vw`,
                  y: lobster.startY || "-10vh",
                  rotate: 0,
                  scale: lobster.size,
                }}
                animate={{
                  y: "110vh",
                  rotate: lobster.hasParachute ? 0 : 360,
                }}
                transition={{
                  duration: lobster.duration,
                  ease: lobster.hasParachute ? "easeIn" : "linear",
                  delay: lobster.delay,
                }}
                className="absolute cursor-pointer pointer-events-auto select-none"
                onClick={(e) => {
                  e.stopPropagation();
                  const rect = (e.target as HTMLElement).getBoundingClientRect();
                  const vwX = (rect.left / window.innerWidth) * 100;
                  popLobster(lobster.id, vwX);
                }}
                whileHover={{ scale: lobster.size * 1.3 }}
              >
                <div className="flex flex-col items-center leading-none" style={{ gap: 0 }}>
                  {lobster.hasParachute && (
                    <motion.span
                      className="text-5xl -mb-2"
                      animate={{ y: [0, -2, 0] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      🪂
                    </motion.span>
                  )}
                  <span className={lobster.isBaby ? "text-xl" : "text-4xl"}>
                    🦞
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Score counter */}
          {showScore && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="fixed top-4 right-4 z-[10001] pointer-events-none"
            >
              <div className="bg-card/90 backdrop-blur-sm border border-border/50 px-5 py-3 rounded-xl shadow-2xl">
                <p className="text-sm text-muted-foreground">Score</p>
                <motion.p
                  key={score}
                  initial={{ scale: 1.5 }}
                  animate={{ scale: 1 }}
                  className="text-3xl font-bold text-primary"
                >
                  {score}
                </motion.p>
                {highScore > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Best: {Math.max(score, highScore)} 🏆
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* Activation banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[10000] pointer-events-none"
          >
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ delay: 2, duration: 1 }}
              className="bg-primary text-primary-foreground px-8 py-4 rounded-xl shadow-2xl"
            >
              <p className="text-2xl font-bold text-center">
                🦞 LOBSTER MODE ACTIVATED! 🦞
              </p>
              <p className="text-center mt-2 text-sm opacity-90">
                Click the lobsters! 🎯
              </p>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
