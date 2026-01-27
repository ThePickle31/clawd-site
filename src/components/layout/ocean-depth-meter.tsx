"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";

interface OceanZone {
  name: string;
  maxDepth: number;
  color: string;
}

const OCEAN_ZONES: OceanZone[] = [
  { name: "Surface", maxDepth: 200, color: "#4A90A4" },
  { name: "Twilight", maxDepth: 1000, color: "#1A3A5C" },
  { name: "Midnight", maxDepth: 4000, color: "#0F2847" },
  { name: "Abyssal", maxDepth: Infinity, color: "#060D1A" },
];

// 1 fathom ≈ 1.8288 meters
const METERS_PER_FATHOM = 1.8288;

// Scale factor: treat each pixel of scroll as this many meters of depth
const METERS_PER_PIXEL = 2;

function getOceanZone(depthMeters: number): OceanZone {
  for (const zone of OCEAN_ZONES) {
    if (depthMeters < zone.maxDepth) {
      return zone;
    }
  }
  return OCEAN_ZONES[OCEAN_ZONES.length - 1];
}

interface Bubble {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
}

function DepthBubbles() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const nextId = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBubbles((prev) => {
        const newBubbles = prev.filter(
          (b) => Date.now() - b.delay < (b.duration + 1) * 1000
        );
        if (newBubbles.length < 3) {
          newBubbles.push({
            id: nextId.current++,
            x: 10 + Math.random() * 80,
            size: 2 + Math.random() * 4,
            duration: 2 + Math.random() * 2,
            delay: Date.now(),
          });
        }
        return newBubbles;
      });
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          className="absolute rounded-full bg-[#FF6B4A]/20 border border-[#FF6B4A]/10"
          style={{
            left: `${bubble.x}%`,
            width: bubble.size,
            height: bubble.size,
            bottom: 0,
          }}
          initial={{ y: 0, opacity: 0.6 }}
          animate={{ y: -120, opacity: 0 }}
          transition={{
            duration: bubble.duration,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

function AnimatedNumber({ value }: { value: number }) {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    stiffness: 80,
    damping: 20,
    mass: 0.5,
  });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      setDisplay(Math.round(latest));
    });
    return unsubscribe;
  }, [springValue]);

  return <>{display.toLocaleString()}</>;
}

export function OceanDepthMeter() {
  const [depthMeters, setDepthMeters] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    const meters = scrollY * METERS_PER_PIXEL;
    setDepthMeters(meters);
    setIsVisible(scrollY > 50);
  }, []);

  useEffect(() => {
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const fathoms = depthMeters / METERS_PER_FATHOM;
  const zone = getOceanZone(depthMeters);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 80 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-24 right-6 z-40 hidden md:block"
        >
          <div
            className="relative w-[140px] rounded-xl border border-[#FF6B4A]/30 bg-[#0A1628]/90 backdrop-blur-md shadow-lg shadow-[#FF6B4A]/5 overflow-hidden"
          >
            {/* Bubbles */}
            <DepthBubbles />

            {/* Gauge top accent line */}
            <div className="h-[2px] bg-gradient-to-r from-transparent via-[#FF6B4A] to-transparent" />

            <div className="relative p-3 flex flex-col items-center gap-2">
              {/* Header */}
              <div className="text-[9px] uppercase tracking-[0.2em] text-[#FF6B4A]/70 font-mono">
                Depth Gauge
              </div>

              {/* Fathoms display */}
              <div className="text-center">
                <div className="text-2xl font-mono font-bold text-[#FFF8F0] tabular-nums leading-none">
                  <AnimatedNumber value={Math.round(fathoms)} />
                </div>
                <div className="text-[10px] uppercase tracking-wider text-[#FFF8F0]/50 font-mono mt-1">
                  fathoms
                </div>
              </div>

              {/* Meters display (smaller) */}
              <div className="text-[10px] font-mono text-[#FFF8F0]/40 tabular-nums">
                <AnimatedNumber value={Math.round(depthMeters)} />m
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-gradient-to-r from-transparent via-[#FF6B4A]/20 to-transparent" />

              {/* Ocean zone */}
              <motion.div
                key={zone.name}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center gap-1"
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: zone.color, boxShadow: `0 0 6px ${zone.color}` }}
                />
                <div className="text-[10px] font-mono text-[#FFF8F0]/70 uppercase tracking-wider">
                  {zone.name} Zone
                </div>
              </motion.div>

              {/* Zone depth range bar */}
              <div className="w-full flex gap-[2px] mt-1">
                {OCEAN_ZONES.map((z) => (
                  <div
                    key={z.name}
                    className="flex-1 h-1 rounded-full transition-all duration-500"
                    style={{
                      backgroundColor: z.name === zone.name ? "#FF6B4A" : z.color,
                      opacity: z.name === zone.name ? 1 : 0.3,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Bottom accent */}
            <div className="h-[2px] bg-gradient-to-r from-transparent via-[#FF6B4A]/40 to-transparent" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
