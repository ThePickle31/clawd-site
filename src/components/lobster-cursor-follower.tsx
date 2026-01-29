"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function LobsterCursorFollower() {
  const [enabled, setEnabled] = useState(true);
  const [showToggle, setShowToggle] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const targetRef = useRef({ x: 0, y: 0 });
  const positionRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>(0);
  const enabledRef = useRef(true);

  // Load preference from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("clawd-lobster-follower");
    if (stored !== null) {
      const isEnabled = stored === "true";
      setEnabled(isEnabled);
      enabledRef.current = isEnabled;
    }
  }, []);

  // Save preference to localStorage
  const toggleEnabled = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      enabledRef.current = next;
      localStorage.setItem("clawd-lobster-follower", String(next));
      return next;
    });
  }, []);

  // Check for pointer device and reduced motion
  useEffect(() => {
    const pointerQuery = window.matchMedia("(pointer: fine)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const check = () => {
      const canShow = pointerQuery.matches && !motionQuery.matches;
      setShowToggle(canShow);
      if (!canShow) setIsVisible(false);
    };

    check();
    pointerQuery.addEventListener("change", check);
    motionQuery.addEventListener("change", check);

    return () => {
      pointerQuery.removeEventListener("change", check);
      motionQuery.removeEventListener("change", check);
    };
  }, []);

  // Smooth follow animation
  useEffect(() => {
    const animate = () => {
      const easing = 0.08;
      const dx = targetRef.current.x - positionRef.current.x;
      const dy = targetRef.current.y - positionRef.current.y;

      positionRef.current.x += dx * easing;
      positionRef.current.y += dy * easing;

      setPosition({ x: positionRef.current.x, y: positionRef.current.y });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, []);

  // Track mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
      if (enabledRef.current && !isVisible) {
        setIsVisible(true);
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isVisible]);

  if (!showToggle) return null;

  return (
    <>
      {/* Toggle button - fixed in bottom left */}
      <button
        onClick={toggleEnabled}
        className="fixed bottom-4 left-4 z-[200] p-2 rounded-full bg-background/80 backdrop-blur-sm border border-primary/20 hover:border-primary/50 transition-all duration-200 group"
        title={enabled ? "Hide lobster friend" : "Show lobster friend"}
        aria-label={enabled ? "Hide lobster cursor follower" : "Show lobster cursor follower"}
      >
        <span
          className={`text-xl transition-all duration-200 block ${
            enabled ? "opacity-100 scale-100" : "opacity-50 scale-90 grayscale"
          }`}
        >
          🦞
        </span>
      </button>

      {/* The lobster follower */}
      <AnimatePresence>
        {enabled && isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="fixed z-[150] pointer-events-none"
            style={{
              left: position.x + 20,
              top: position.y + 20,
            }}
          >
            {/* Single tilted lobster */}
            <span 
              className="text-lg select-none block"
              style={{ 
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                transform: "rotate(-18deg)"
              }}
            >
              🦞
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
