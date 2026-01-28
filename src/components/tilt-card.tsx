"use client";

import { useRef, useState, useCallback, ReactNode } from "react";
import { motion } from "framer-motion";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
  perspective?: number;
  scale?: number;
  transitionSpeed?: number;
  glareEnabled?: boolean;
  glareMaxOpacity?: number;
}

export function TiltCard({
  children,
  className = "",
  maxTilt = 12,
  perspective = 1000,
  scale = 1.02,
  transitionSpeed = 400,
  glareEnabled = true,
  glareMaxOpacity = 0.15,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tiltStyle, setTiltStyle] = useState({
    rotateX: 0,
    rotateY: 0,
    scale: 1,
  });
  const [glareStyle, setGlareStyle] = useState({
    x: 50,
    y: 50,
    opacity: 0,
  });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;

      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Calculate position relative to card center (-1 to 1)
      const relativeX = (e.clientX - centerX) / (rect.width / 2);
      const relativeY = (e.clientY - centerY) / (rect.height / 2);

      // Tilt in the direction the cursor is (creates "looking into" effect)
      const rotateY = relativeX * maxTilt;
      const rotateX = -relativeY * maxTilt;

      setTiltStyle({
        rotateX,
        rotateY,
        scale,
      });

      // Update glare position (follows cursor)
      const glareX = ((e.clientX - rect.left) / rect.width) * 100;
      const glareY = ((e.clientY - rect.top) / rect.height) * 100;
      setGlareStyle({
        x: glareX,
        y: glareY,
        opacity: glareMaxOpacity,
      });
    },
    [maxTilt, scale, glareMaxOpacity]
  );

  const handleMouseLeave = useCallback(() => {
    setTiltStyle({
      rotateX: 0,
      rotateY: 0,
      scale: 1,
    });
    setGlareStyle((prev) => ({
      ...prev,
      opacity: 0,
    }));
  }, []);

  return (
    <motion.div
      ref={cardRef}
      className={`relative ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: tiltStyle.rotateX,
        rotateY: tiltStyle.rotateY,
        scale: tiltStyle.scale,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 0.5,
      }}
      style={{
        perspective: `${perspective}px`,
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
    >
      {children}
      {/* Glare effect overlay */}
      {glareEnabled && (
        <div
          className="pointer-events-none absolute inset-0 rounded-lg overflow-hidden"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div
            className="absolute inset-0 transition-opacity"
            style={{
              background: `radial-gradient(circle at ${glareStyle.x}% ${glareStyle.y}%, rgba(255, 255, 255, ${glareStyle.opacity}), transparent 50%)`,
              transitionDuration: `${transitionSpeed}ms`,
            }}
          />
        </div>
      )}
    </motion.div>
  );
}
