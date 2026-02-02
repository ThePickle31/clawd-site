"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useShellCollection, SHELLS } from "./shell-context";

export function ShellCounter() {
  const { totalCollected, totalShells, allCollected, isCollected } = useShellCollection();
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <motion.button
        className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted/50"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip((v) => !v)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.span
          key={totalCollected}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 20 }}
        >
          🐚
        </motion.span>
        <span className={allCollected ? "text-primary" : ""}>
          {totalCollected}/{totalShells}
        </span>
        {allCollected && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            ✨
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 w-56 rounded-lg border border-border/50 bg-background/95 backdrop-blur-lg shadow-xl p-3 z-50"
          >
            <p className="text-xs font-semibold text-foreground mb-2">
              {allCollected ? "🎉 Shell Collection Complete!" : "Shell Collection"}
            </p>
            <div className="space-y-1.5">
              {SHELLS.map((shell) => {
                const found = isCollected(shell.id);
                return (
                  <div
                    key={shell.id}
                    className={`flex items-center gap-2 text-xs ${
                      found ? "text-foreground" : "text-muted-foreground/50"
                    }`}
                  >
                    <span className={found ? "" : "grayscale opacity-40"}>
                      {shell.emoji}
                    </span>
                    <span className={found ? "" : "line-through"}>
                      {shell.name}
                    </span>
                    {!found && (
                      <span className="ml-auto text-[10px] italic">
                        Visit {shell.page === "/" ? "Home" : shell.page.slice(1)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Progress bar */}
            <div className="mt-2 h-1 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${(totalCollected / totalShells) * 100}%` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
