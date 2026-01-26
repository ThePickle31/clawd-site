"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Home, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/layout/page-transition";

// Pre-generated bubble positions (deterministic to avoid hydration issues)
const bubbleData = [...Array(15)].map((_, i) => {
  const seed1 = ((i * 2345678) % 1000) / 1000;
  const seed2 = ((i * 8765432) % 1000) / 1000;
  const seed3 = ((i * 3579246) % 1000) / 1000;
  const seed4 = ((i * 6543219) % 1000) / 1000;
  const seed5 = ((i * 1928374) % 1000) / 1000;
  return {
    xPercent: seed1 * 100,
    startY: 80 + seed2 * 20, // Start from bottom area
    size: 4 + seed3 * 12, // Varying bubble sizes
    duration: 8 + seed4 * 7,
    delay: seed5 * 5,
  };
});

export default function NotFound() {
  return (
    <PageTransition>
      <div className="min-h-[90vh] flex items-center justify-center relative overflow-hidden">
        {/* Deep ocean gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-[#0a0f1c]" />

        {/* Subtle underwater glow effect */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />

        {/* Floating bubbles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {bubbleData.map((bubble, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border border-primary/20 bg-primary/5"
              style={{
                left: `${bubble.xPercent}%`,
                bottom: `${bubble.startY}%`,
                width: bubble.size,
                height: bubble.size,
              }}
              animate={{
                y: [0, -800],
                x: [0, (i % 2 === 0 ? 1 : -1) * 20, 0],
                opacity: [0.3, 0.6, 0.3, 0],
                scale: [1, 1.1, 0.9, 0.8],
              }}
              transition={{
                duration: bubble.duration,
                repeat: Infinity,
                delay: bubble.delay,
                ease: "easeOut",
              }}
            />
          ))}
        </div>

        {/* Main content */}
        <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
          {/* Animated confused lobster */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <motion.span
              className="text-8xl md:text-9xl inline-block"
              animate={{
                rotate: [0, -10, 10, -5, 5, 0],
                y: [0, -10, 0, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatDelay: 1,
                ease: "easeInOut",
              }}
            >
              🦞
            </motion.span>

            {/* Question marks floating around the lobster */}
            <motion.span
              className="absolute text-2xl text-primary/60"
              style={{ marginLeft: -80, marginTop: -20 }}
              animate={{
                y: [0, -15, 0],
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              ?
            </motion.span>
            <motion.span
              className="absolute text-3xl text-primary/40"
              style={{ marginLeft: 60, marginTop: -40 }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: 0.5,
                ease: "easeInOut",
              }}
            >
              ?
            </motion.span>
          </motion.div>

          {/* 404 Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-8xl md:text-9xl font-bold mb-6 text-primary"
          >
            404
          </motion.h1>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-8"
          >
            <h2 className="text-2xl md:text-3xl font-semibold mb-4">
              Lost in the depths...
            </h2>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              This lobster wandered too far from the reef. The page you&apos;re looking for has drifted away into the digital abyss.
            </p>
          </motion.div>

          {/* Compass icon animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-8"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear",
              }}
              className="inline-block"
            >
              <Compass className="h-8 w-8 text-muted-foreground/50" />
            </motion.div>
          </motion.div>

          {/* Navigation button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Button asChild size="lg" className="text-lg gap-2">
              <Link href="/">
                <Home className="h-5 w-5" />
                Swim back home
              </Link>
            </Button>
          </motion.div>

          {/* Subtle bottom message */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="mt-12 text-sm text-muted-foreground/60"
          >
            Even lobsters get lost sometimes
          </motion.p>
        </div>
      </div>
    </PageTransition>
  );
}
