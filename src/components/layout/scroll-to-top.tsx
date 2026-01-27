"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const rafRef = useRef(0);
  const needsUpdateRef = useRef(false);
  const lastVisibleRef = useRef(false);

  const updateVisibility = useCallback(() => {
    needsUpdateRef.current = false;
    const visible = window.scrollY > 300;
    // Only trigger state update when the value actually changes
    if (visible !== lastVisibleRef.current) {
      lastVisibleRef.current = visible;
      setIsVisible(visible);
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (!needsUpdateRef.current) {
      needsUpdateRef.current = true;
      rafRef.current = requestAnimationFrame(updateVisibility);
    }
  }, [updateVisibility]);

  useEffect(() => {
    updateVisibility();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [handleScroll, updateVisibility]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.2 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-[#FF6B4A] text-white shadow-lg hover:bg-[#FF6B4A]/90 hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-[#FF6B4A] focus:ring-offset-2 focus:ring-offset-background"
          aria-label="Scroll to top"
        >
          <ArrowUp className="size-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
