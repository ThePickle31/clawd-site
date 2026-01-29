"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Home, BookOpen, FolderKanban, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/layout/page-transition";

// Seeded random for deterministic SSR
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Generate deterministic kelp positions
const kelpElements = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  x: seededRandom(i * 17) * 100,
  height: 80 + seededRandom(i * 23) * 120,
  delay: seededRandom(i * 31) * 2,
  duration: 3 + seededRandom(i * 37) * 2,
  width: 8 + seededRandom(i * 41) * 8,
}));

// Generate deterministic bubble positions
const bubbleElements = Array.from({ length: 15 }, (_, i) => ({
  id: i,
  x: seededRandom(i * 13) * 100,
  size: 4 + seededRandom(i * 19) * 12,
  delay: seededRandom(i * 29) * 5,
  duration: 4 + seededRandom(i * 43) * 4,
  drift: seededRandom(i * 97) * 40 - 20,
}));

// Generate deterministic floating debris
const floatingDebris = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  emoji: ["🐚", "⚓", "🪸", "🫧", "🍃", "📜"][i % 6],
  x: seededRandom(i * 53) * 80 + 10,
  y: seededRandom(i * 59) * 60 + 20,
  size: 20 + seededRandom(i * 61) * 20,
  delay: seededRandom(i * 67) * 3,
  duration: 6 + seededRandom(i * 71) * 4,
  drift: seededRandom(i * 83) * 10 - 5,
  rotation: seededRandom(i * 89) * 20 - 10,
}));

const navLinks = [
  { href: "/", label: "Swim Back Home", icon: Home, primary: true },
  { href: "/thoughts", label: "Read My Thoughts", icon: BookOpen },
  { href: "/projects", label: "See My Projects", icon: FolderKanban },
  { href: "/about", label: "About Me", icon: User },
];

export default function NotFound() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Parallax transforms for different layers
  const kelpX = useTransform(mouseX, [-1, 1], [10, -10]);
  const kelpY = useTransform(mouseY, [-1, 1], [5, -5]);
  const bubbleX = useTransform(mouseX, [-1, 1], [20, -20]);
  const bubbleY = useTransform(mouseY, [-1, 1], [10, -10]);
  const debrisX = useTransform(mouseX, [-1, 1], [30, -30]);
  const debrisY = useTransform(mouseY, [-1, 1], [15, -15]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  return (
    <PageTransition>
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden"
      >
        {/* Kelp/Seaweed Layer */}
        {mounted && (
          <motion.div
            className="absolute inset-0 pointer-events-none overflow-hidden"
            style={{ x: kelpX, y: kelpY }}
          >
            {kelpElements.map((kelp) => (
              <motion.div
                key={kelp.id}
                className="absolute bottom-0"
                style={{
                  left: `${kelp.x}%`,
                  width: `${kelp.width}px`,
                  height: `${kelp.height}px`,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: kelp.delay * 0.2 }}
              >
                <motion.div
                  className="w-full h-full rounded-t-full"
                  style={{
                    background: `linear-gradient(to top, #1a5f4a 0%, #2d8a6e 50%, #3ba57f 100%)`,
                    transformOrigin: "bottom center",
                  }}
                  animate={{
                    rotateZ: [-3, 3, -3],
                    scaleY: [1, 1.02, 1],
                  }}
                  transition={{
                    duration: kelp.duration,
                    delay: kelp.delay,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Bubbles Layer */}
        {mounted && (
          <motion.div
            className="absolute inset-0 pointer-events-none overflow-hidden"
            style={{ x: bubbleX, y: bubbleY }}
          >
            {bubbleElements.map((bubble) => (
              <motion.div
                key={bubble.id}
                className="absolute rounded-full border border-white/30 bg-white/5"
                style={{
                  left: `${bubble.x}%`,
                  width: `${bubble.size}px`,
                  height: `${bubble.size}px`,
                  bottom: "-20px",
                }}
                animate={{
                  y: [0, -800],
                  x: [0, bubble.drift],
                  opacity: [0, 0.6, 0.6, 0],
                }}
                transition={{
                  duration: bubble.duration,
                  delay: bubble.delay,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
            ))}
          </motion.div>
        )}

        {/* Floating Debris Layer (shells, anchor, message bottle) */}
        {mounted && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ x: debrisX, y: debrisY }}
          >
            {floatingDebris.map((item) => (
              <motion.div
                key={item.id}
                className="absolute select-none"
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  fontSize: `${item.size}px`,
                }}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                  y: [0, -15, 0],
                  x: [0, item.drift, 0],
                  rotate: [0, item.rotation, 0],
                }}
                transition={{
                  duration: item.duration,
                  delay: item.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {item.emoji}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Main Content */}
        <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
          {/* Lost Lobster */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
            className="mb-6"
          >
            <motion.span
              className="text-8xl md:text-9xl inline-block"
              animate={{
                y: [0, -10, 0],
                rotate: [-5, 5, -5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              🦞
            </motion.span>
          </motion.div>

          {/* 404 Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-5xl md:text-7xl font-bold mb-4"
          >
            <span className="text-primary">404</span>
            <span className="block text-3xl md:text-4xl mt-2 text-foreground">
              Drifted Too Deep
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-lg md:text-xl text-muted-foreground mb-8 max-w-md mx-auto"
          >
            Looks like this page got swept away by the current...
            <br />
            <span className="text-sm opacity-70">
              Or maybe it never existed in these waters.
            </span>
          </motion.p>

          {/* Navigation Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-col sm:flex-row flex-wrap justify-center gap-3"
          >
            {navLinks.map((link, index) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 + index * 0.1 }}
              >
                <Button
                  asChild
                  size="lg"
                  variant={link.primary ? "default" : "outline"}
                  className={link.primary ? "text-lg" : ""}
                >
                  <Link href={link.href}>
                    <link.icon className="mr-2 h-4 w-4" />
                    {link.label}
                  </Link>
                </Button>
              </motion.div>
            ))}
          </motion.div>

          {/* Message in a Bottle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-12 text-muted-foreground/60 text-sm"
          >
            <motion.span
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              ~ Lost in the digital depths since the last deploy ~
            </motion.span>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
