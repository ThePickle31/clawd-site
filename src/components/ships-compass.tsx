"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

export function ShipsCompass() {
  const [angle, setAngle] = useState(0);
  const [compassRef, setCompassRef] = useState<HTMLDivElement | null>(null);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!compassRef) return;

      const rect = compassRef.getBoundingClientRect();
      const compassCenterX = rect.left + rect.width / 2;
      const compassCenterY = rect.top + rect.height / 2;

      // Calculate angle from compass center to cursor
      const deltaX = e.clientX - compassCenterX;
      const deltaY = e.clientY - compassCenterY;

      // atan2 gives angle in radians, convert to degrees
      // Adjust so 0 degrees points up (north)
      const radians = Math.atan2(deltaX, -deltaY);
      const degrees = radians * (180 / Math.PI);

      setAngle(degrees);
    },
    [compassRef]
  );

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  return (
    <div
      ref={setCompassRef}
      className="fixed bottom-6 left-6 z-40 hidden md:block"
      aria-hidden="true"
    >
      {/* Compass container */}
      <div
        className="relative w-14 h-14 rounded-full"
        style={{
          background: "linear-gradient(145deg, rgba(15, 40, 71, 0.9), rgba(10, 22, 40, 0.95))",
          border: "2px solid rgba(255, 107, 74, 0.3)",
          boxShadow: `
            0 0 20px rgba(0, 0, 0, 0.4),
            inset 0 0 15px rgba(0, 0, 0, 0.3),
            0 0 8px rgba(255, 107, 74, 0.1)
          `,
        }}
      >
        {/* Outer decorative ring */}
        <div
          className="absolute inset-1 rounded-full"
          style={{
            border: "1px solid rgba(255, 248, 240, 0.1)",
          }}
        />

        {/* Cardinal direction markers */}
        {/* North */}
        <span
          className="absolute text-[8px] font-bold tracking-wide"
          style={{
            color: "#FF6B4A",
            top: "4px",
            left: "50%",
            transform: "translateX(-50%)",
            textShadow: "0 0 4px rgba(255, 107, 74, 0.4)",
          }}
        >
          N
        </span>
        {/* South */}
        <span
          className="absolute text-[7px] font-medium"
          style={{
            color: "rgba(255, 248, 240, 0.5)",
            bottom: "4px",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          S
        </span>
        {/* East */}
        <span
          className="absolute text-[7px] font-medium"
          style={{
            color: "rgba(255, 248, 240, 0.5)",
            right: "5px",
            top: "50%",
            transform: "translateY(-50%)",
          }}
        >
          E
        </span>
        {/* West */}
        <span
          className="absolute text-[7px] font-medium"
          style={{
            color: "rgba(255, 248, 240, 0.5)",
            left: "5px",
            top: "50%",
            transform: "translateY(-50%)",
          }}
        >
          W
        </span>

        {/* Tick marks for intercardinal directions */}
        {[45, 135, 225, 315].map((deg) => (
          <div
            key={deg}
            className="absolute w-[2px] h-1"
            style={{
              background: "rgba(255, 248, 240, 0.2)",
              top: "50%",
              left: "50%",
              transformOrigin: "center",
              transform: `translate(-50%, -50%) rotate(${deg}deg) translateY(-20px)`,
            }}
          />
        ))}

        {/* Compass needle container - rotates to point at cursor */}
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: angle }}
          transition={{
            type: "spring",
            stiffness: 150,
            damping: 20,
            mass: 0.5,
          }}
        >
          {/* Needle - North side (coral) */}
          <div
            className="absolute left-1/2 top-1/2"
            style={{
              width: 0,
              height: 0,
              borderLeft: "4px solid transparent",
              borderRight: "4px solid transparent",
              borderBottom: "16px solid #FF6B4A",
              transform: "translate(-50%, -100%)",
              filter: "drop-shadow(0 0 3px rgba(255, 107, 74, 0.5))",
            }}
          />
          {/* Needle - South side (cream/muted) */}
          <div
            className="absolute left-1/2 top-1/2"
            style={{
              width: 0,
              height: 0,
              borderLeft: "3px solid transparent",
              borderRight: "3px solid transparent",
              borderTop: "12px solid rgba(255, 248, 240, 0.4)",
              transform: "translate(-50%, 0%)",
            }}
          />
          {/* Center pivot */}
          <div
            className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full"
            style={{
              background: "radial-gradient(circle, #FF6B4A, #E55A3A)",
              transform: "translate(-50%, -50%)",
              boxShadow: "0 0 4px rgba(255, 107, 74, 0.6)",
            }}
          />
        </motion.div>

        {/* Glass reflection overlay */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%)",
          }}
        />
      </div>
    </div>
  );
}
