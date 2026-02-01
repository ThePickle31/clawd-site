"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TideLineProps {
  className?: string;
  /** Wave variant — different wave shapes */
  variant?: "gentle" | "choppy" | "swell";
  /** Animate the wave horizontally */
  animated?: boolean;
  /** Color — defaults to current tidal accent via CSS var */
  color?: string;
}

// Each variant is a different SVG wave path
const wavePaths = {
  gentle:
    "M0,8 C20,4 40,12 60,8 C80,4 100,12 120,8 C140,4 160,12 180,8 C200,4 220,12 240,8 C260,4 280,12 300,8",
  choppy:
    "M0,8 C10,3 20,13 30,6 C40,11 50,3 60,9 C70,13 80,2 90,8 C100,14 110,4 120,7 C130,12 140,3 150,8 C160,13 170,4 180,7 C190,11 200,3 210,9 C220,13 230,5 240,8 C250,12 260,3 270,7 C280,12 290,4 300,8",
  swell:
    "M0,8 C30,2 60,14 90,8 C120,2 150,14 180,8 C210,2 240,14 270,8 C285,5 295,5 300,8",
};

export function TideLine({
  className,
  variant = "gentle",
  animated = true,
  color,
}: TideLineProps) {
  const path = wavePaths[variant];

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden py-6",
        className
      )}
      role="separator"
      aria-hidden="true"
    >
      <motion.div
        className="w-full"
        initial={{ opacity: 0, scaleX: 0.3 }}
        whileInView={{ opacity: 1, scaleX: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <svg
          viewBox="0 0 300 16"
          preserveAspectRatio="none"
          className="w-full h-4"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main wave */}
          <motion.path
            d={path}
            stroke={color || "var(--tidal-accent-hex, #FF6B4A)"}
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
            opacity={0.6}
            {...(animated
              ? {
                  animate: { translateX: [0, -30, 0] },
                  transition: {
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }
              : {})}
          />
          {/* Echo wave — offset and lighter */}
          <motion.path
            d={path}
            stroke={color || "var(--tidal-accent-hex, #FF6B4A)"}
            strokeWidth="1"
            strokeLinecap="round"
            fill="none"
            opacity={0.2}
            transform="translate(0, 3)"
            {...(animated
              ? {
                  animate: { translateX: [0, 20, 0] },
                  transition: {
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }
              : {})}
          />
        </svg>
      </motion.div>
    </div>
  );
}
