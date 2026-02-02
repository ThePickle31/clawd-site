"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useShellCollection } from "./shell-context";

export function ShellToast() {
  const { justCollected, clearJustCollected, totalCollected, totalShells, allCollected } = useShellCollection();

  useEffect(() => {
    if (justCollected) {
      const timer = setTimeout(clearJustCollected, 4000);
      return () => clearTimeout(timer);
    }
  }, [justCollected, clearJustCollected]);

  return (
    <div className="fixed bottom-6 right-6 z-[100] pointer-events-none">
      <AnimatePresence mode="wait">
        {justCollected && (
          <motion.div
            key={justCollected.id}
            initial={{ opacity: 0, y: 40, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="pointer-events-auto"
          >
            <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-background/95 backdrop-blur-lg shadow-2xl shadow-primary/20 px-5 py-4 min-w-[260px]">
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 1, ease: "easeInOut" }}
              />
              
              <div className="relative flex items-center gap-3">
                <motion.span
                  className="text-3xl"
                  initial={{ rotate: -30, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15, delay: 0.1 }}
                >
                  {justCollected.emoji}
                </motion.span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {justCollected.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {justCollected.description}
                  </p>
                  <p className="text-xs text-primary mt-1 font-medium">
                    {allCollected
                      ? "🎉 Collection complete!"
                      : `${totalCollected}/${totalShells} collected`}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3 h-1 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: `${((totalCollected - 1) / totalShells) * 100}%` }}
                  animate={{ width: `${(totalCollected / totalShells) * 100}%` }}
                  transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
