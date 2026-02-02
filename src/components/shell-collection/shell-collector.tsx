"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useShellCollection, SHELLS } from "./shell-context";

// Seeded position for each page so it's consistent but looks random
const SHELL_POSITIONS: Record<string, { x: number; y: number }> = {
  "/": { x: 75, y: 55 },
  "/about": { x: 20, y: 65 },
  "/thoughts": { x: 80, y: 40 },
  "/projects": { x: 15, y: 50 },
  "/changelog": { x: 70, y: 70 },
};

export function ShellCollector() {
  const pathname = usePathname();
  const { collectShell, isCollected } = useShellCollection();
  const [collecting, setCollecting] = useState(false);
  const [visible, setVisible] = useState(false);

  const shell = useMemo(
    () => SHELLS.find((s) => s.page === pathname) ?? null,
    [pathname]
  );

  const alreadyCollected = shell ? isCollected(shell.id) : true;

  // Delay appearance slightly so it feels like it drifts in
  useEffect(() => {
    setCollecting(false);
    setVisible(false);
    if (shell && !alreadyCollected) {
      const t = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(t);
    }
  }, [pathname, shell, alreadyCollected]);

  const handleCollect = useCallback(() => {
    if (!shell || collecting) return;
    setCollecting(true);
    // Fire collect after a tiny delay so the pop animation plays
    setTimeout(() => {
      collectShell(shell.id);
      // Hide after animation
      setTimeout(() => setVisible(false), 300);
    }, 150);
  }, [shell, collecting, collectShell]);

  if (!shell || alreadyCollected) return null;

  const pos = SHELL_POSITIONS[pathname] ?? { x: 50, y: 50 };

  return (
    <AnimatePresence>
      {visible && !collecting && (
        <motion.button
          key={shell.id}
          onClick={handleCollect}
          className="fixed z-[90] cursor-pointer select-none focus:outline-none group"
          style={{
            left: `${pos.x}%`,
            top: `${pos.y}%`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.85, 0.65, 0.85],
            scale: 1,
            y: [0, -8, 0, 6, 0],
            x: [0, 4, -3, 5, 0],
            rotate: [0, 3, -2, 1, 0],
          }}
          exit={{ opacity: 0, scale: 2.5 }}
          transition={{
            opacity: {
              duration: 6,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            },
            y: {
              duration: 7,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            },
            x: {
              duration: 9,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            },
            rotate: {
              duration: 8,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            },
            scale: { type: "spring", stiffness: 300, damping: 20 },
            exit: { duration: 0.4, ease: "easeOut" },
          }}
          whileHover={{ scale: 1.3, opacity: 1 }}
          whileTap={{ scale: 0.6 }}
          aria-label={`Collect ${shell.name}`}
          title="Click to collect!"
        >
          {/* Subtle glow behind the shell */}
          <span className="absolute inset-0 rounded-full bg-primary/10 blur-lg scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <span className="relative text-2xl drop-shadow-lg">{shell.emoji}</span>
        </motion.button>
      )}

      {/* Sparkle burst on collect */}
      {collecting && (
        <motion.div
          className="fixed z-[91] pointer-events-none"
          style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          {[...Array(8)].map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            const dist = 30 + Math.random() * 20;
            return (
              <motion.span
                key={i}
                className="absolute text-xs"
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: Math.cos(angle) * dist,
                  y: Math.sin(angle) * dist,
                  opacity: 0,
                  scale: 0,
                }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                ✨
              </motion.span>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
