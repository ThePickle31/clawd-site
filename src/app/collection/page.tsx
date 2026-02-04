"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Sparkles } from "lucide-react";
import { PageTransition } from "@/components/layout/page-transition";
import { useShellCollection, SHELLS, Shell } from "@/components/shell-collection/shell-context";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
  },
};

const shellVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.8 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

// Decorative sand particle positions (deterministic)
const sandParticles = Array.from({ length: 20 }, (_, i) => ({
  left: `${(i * 17 + 7) % 100}%`,
  bottom: `${(i * 13 + 3) % 8}%`,
  size: 2 + (i % 3),
  delay: i * 0.3,
}));

function ShellDisplay({ shell, collected, index }: { shell: Shell; collected: boolean; index: number }) {
  const [expanded, setExpanded] = useState(false);

  const pageName = shell.page === "/" ? "Home" : shell.page.slice(1).charAt(0).toUpperCase() + shell.page.slice(2);

  return (
    <motion.div
      variants={shellVariants}
      layout
      className="relative"
    >
      <motion.button
        onClick={() => setExpanded(!expanded)}
        className={`
          relative w-full rounded-2xl border p-6 text-left transition-all duration-300
          ${collected
            ? "border-primary/30 bg-gradient-to-b from-primary/5 to-transparent hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
            : "border-border/30 bg-muted/10 hover:border-border/50"
          }
        `}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Shell emoji display */}
        <div className="flex items-start gap-4">
          <motion.div
            className={`
              relative flex h-16 w-16 shrink-0 items-center justify-center rounded-xl text-3xl
              ${collected
                ? "bg-primary/10"
                : "bg-muted/30 grayscale opacity-50"
              }
            `}
            animate={collected ? {
              boxShadow: [
                "0 0 0px rgba(255, 107, 74, 0)",
                "0 0 20px rgba(255, 107, 74, 0.15)",
                "0 0 0px rgba(255, 107, 74, 0)",
              ],
            } : {}}
            transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
          >
            <span className="relative z-10">{shell.emoji}</span>
            {collected && (
              <motion.div
                className="absolute inset-0 rounded-xl bg-primary/5"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, delay: index * 0.4 }}
              />
            )}
          </motion.div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className={`font-semibold text-lg ${collected ? "text-foreground" : "text-muted-foreground/60"}`}>
                {collected ? shell.name : "???"}
              </h3>
              {collected && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-primary text-xs"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                </motion.span>
              )}
            </div>
            <p className={`text-sm mt-0.5 ${collected ? "text-muted-foreground" : "text-muted-foreground/40 italic"}`}>
              {collected ? shell.description : "This shell hasn't been discovered yet..."}
            </p>
          </div>
        </div>

        {/* Expanded details */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t border-border/30">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  {collected ? (
                    <span className="text-muted-foreground">
                      Found on the{" "}
                      <Link
                        href={shell.page}
                        className="text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {pageName}
                      </Link>
                      {" "}page
                    </span>
                  ) : (
                    <span className="text-muted-foreground/50">
                      Visit the{" "}
                      <Link
                        href={shell.page}
                        className="text-primary/60 hover:text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {pageName}
                      </Link>
                      {" "}page to find this shell
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  );
}

export default function CollectionPage() {
  const { totalCollected, totalShells, allCollected, isCollected } = useShellCollection();
  const progress = (totalCollected / totalShells) * 100;

  return (
    <PageTransition>
      <div className="min-h-screen py-24 px-4 relative overflow-hidden">
        {/* Ocean floor sand particles */}
        <div className="fixed inset-0 pointer-events-none z-0">
          {sandParticles.map((p, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-primary/10"
              style={{
                left: p.left,
                bottom: p.bottom,
                width: p.size,
                height: p.size,
              }}
              animate={{
                opacity: [0.2, 0.5, 0.2],
                y: [0, -3, 0],
              }}
              transition={{
                duration: 4 + (i % 3),
                repeat: Infinity,
                delay: p.delay,
              }}
            />
          ))}
        </div>

        <div className="max-w-3xl mx-auto relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <motion.div
              className="text-5xl mb-6"
              animate={{ rotate: [0, -5, 5, -3, 0] }}
              transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }}
            >
              🐚
            </motion.div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Shell Collection
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Treasures gathered from the depths of this site. Explore different pages to discover hidden shells washed ashore.
            </p>

            {/* Progress */}
            <div className="max-w-xs mx-auto">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>{totalCollected} of {totalShells} collected</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                />
              </div>
            </div>
          </motion.div>

          {/* All collected celebration */}
          <AnimatePresence>
            {allCollected && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-12 text-center p-6 rounded-2xl border border-primary/30 bg-gradient-to-b from-primary/10 to-transparent"
              >
                <motion.p
                  className="text-2xl mb-2"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ✨
                </motion.p>
                <p className="text-lg font-semibold text-primary">
                  Collection Complete!
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  You&apos;ve explored every corner of the ocean floor. A true deep-sea collector.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Shell grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-4"
          >
            {SHELLS.map((shell, index) => (
              <ShellDisplay
                key={shell.id}
                shell={shell}
                collected={isCollected(shell.id)}
                index={index}
              />
            ))}
          </motion.div>

          {/* Hint section */}
          {!allCollected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="mt-16 text-center"
            >
              <p className="text-sm text-muted-foreground/60 italic">
                Shells appear as floating 🐚 on each page. Click them to add to your collection.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
