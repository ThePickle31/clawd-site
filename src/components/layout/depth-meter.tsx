"use client";

import { useSyncExternalStore, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

function subscribeToScroll(callback: () => void) {
  window.addEventListener("scroll", callback, { passive: true });
  window.addEventListener("resize", callback, { passive: true });
  return () => {
    window.removeEventListener("scroll", callback);
    window.removeEventListener("resize", callback);
  };
}

function getScrollPercent() {
  const docHeight =
    document.documentElement.scrollHeight - window.innerHeight;
  if (docHeight <= 0) return 0;
  return Math.min(Math.max(window.scrollY / docHeight, 0), 1);
}

function getServerSnapshot() {
  return 0;
}

// Deterministic bubble properties to avoid hydration mismatch
const BUBBLES = [
  { size: 4, x: 30, duration: 3.2, delay: 0 },
  { size: 3, x: 55, duration: 2.8, delay: 0.8 },
  { size: 5, x: 70, duration: 3.6, delay: 1.5 },
  { size: 3, x: 40, duration: 2.5, delay: 2.2 },
  { size: 4, x: 65, duration: 3.0, delay: 0.4 },
];

function depthLabel(percent: number): string {
  if (percent < 0.05) return "Surface";
  if (percent < 0.15) return "Sunlight Zone";
  if (percent < 0.4) return "Twilight Zone";
  if (percent < 0.7) return "Midnight Zone";
  if (percent < 0.9) return "Abyssal Zone";
  return "The Deep";
}

export function DepthMeter() {
  const scrollPercent = useSyncExternalStore(
    subscribeToScroll,
    getScrollPercent,
    getServerSnapshot
  );

  const depthMeters = Math.round(scrollPercent * 200);
  const label = depthLabel(scrollPercent);

  // Overlay opacity: subtle darkening as you scroll deeper
  const overlayOpacity = scrollPercent * 0.12;

  // Show meter once user starts scrolling
  const isVisible = scrollPercent > 0.01;

  return (
    <>
      {/* Background darkening overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-[1] transition-opacity duration-500"
        style={{
          backgroundColor: `rgba(2, 6, 15, ${overlayOpacity})`,
        }}
      />

      {/* Depth meter — hidden on mobile */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-2"
          >
            {/* Gauge container */}
            <div className="relative flex flex-col items-center">
              {/* Zone label */}
              <motion.div
                key={label}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2 whitespace-nowrap"
              >
                {label}
              </motion.div>

              {/* The gauge tube */}
              <div
                className="relative w-10 h-48 rounded-full border-2 overflow-hidden"
                style={{
                  borderColor: "rgba(255, 107, 74, 0.3)",
                  background:
                    "linear-gradient(to bottom, rgba(10, 22, 40, 0.6), rgba(10, 22, 40, 0.95))",
                  boxShadow:
                    "inset 0 0 12px rgba(0, 0, 0, 0.4), 0 0 8px rgba(255, 107, 74, 0.1)",
                }}
              >
                {/* Tick marks */}
                {[0, 25, 50, 75, 100].map((tick) => (
                  <div
                    key={tick}
                    className="absolute left-0 w-2 h-px"
                    style={{
                      top: `${tick}%`,
                      backgroundColor: "rgba(255, 107, 74, 0.25)",
                    }}
                  />
                ))}
                {[0, 25, 50, 75, 100].map((tick) => (
                  <div
                    key={`r-${tick}`}
                    className="absolute right-0 w-2 h-px"
                    style={{
                      top: `${tick}%`,
                      backgroundColor: "rgba(255, 107, 74, 0.25)",
                    }}
                  />
                ))}

                {/* Water fill level */}
                <div
                  className="absolute bottom-0 left-0 right-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(255, 107, 74, 0.4), rgba(255, 107, 74, 0.1))",
                    height: `${scrollPercent * 100}%`,
                  }}
                />

                {/* Depth indicator needle */}
                <div
                  className="absolute left-1 right-1 h-0.5 rounded-full"
                  style={{
                    background: "#FF6B4A",
                    boxShadow: "0 0 6px rgba(255, 107, 74, 0.6)",
                    top: `${scrollPercent * 100}%`,
                  }}
                />

                {/* Animated bubbles */}
                {BUBBLES.map((bubble, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      width: bubble.size,
                      height: bubble.size,
                      left: `${bubble.x}%`,
                      background:
                        "radial-gradient(circle, rgba(255, 248, 240, 0.6), rgba(255, 248, 240, 0.1))",
                    }}
                    animate={{
                      bottom: ["0%", "100%"],
                      opacity: [0, 0.7, 0.7, 0],
                      scale: [0.5, 1, 1, 0.3],
                    }}
                    transition={{
                      duration: bubble.duration,
                      delay: bubble.delay,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                ))}

                {/* Glass reflection */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      "linear-gradient(105deg, rgba(255,255,255,0.08) 0%, transparent 40%)",
                    pointerEvents: "none",
                  }}
                />
              </div>

              {/* Depth readout */}
              <div className="mt-3 flex flex-col items-center">
                <motion.span
                  className="text-lg font-mono font-bold tabular-nums"
                  style={{ color: "#FF6B4A" }}
                  key={depthMeters}
                  initial={{ opacity: 0.6, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.15 }}
                >
                  {depthMeters}m
                </motion.span>
                <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
                  Depth
                </span>
              </div>

              {/* Decorative ring around gauge */}
              <div
                className="absolute -inset-1.5 rounded-full pointer-events-none"
                style={{
                  border: "1px solid rgba(255, 107, 74, 0.1)",
                  top: "1.25rem",
                  bottom: "2.75rem",
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
