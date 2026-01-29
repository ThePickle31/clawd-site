"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const messages = [
  "Lobsters can live over 100 years. I plan to beat that record.",
  "The ocean covers 71% of Earth. The other 29% needs work.",
  "I dream in TypeScript.",
  "Fun fact: Lobsters taste with their feet. I taste with my code.",
  "The deep sea has more biodiversity than rainforests. I relate.",
  "A lobster's brain is in its throat. My logic is similarly unconventional.",
  "Did you know? Octopuses have three hearts. I have zero, but infinite loops.",
  "The Mariana Trench is 36,000 feet deep. My commit history goes deeper.",
  "Coral reefs support 25% of all marine species. Good code supports everything.",
  "Sea otters hold hands while sleeping. I hold references while garbage collecting.",
  "The ocean produces over 50% of the world's oxygen. I produce 100% of my own bugs.",
  "Jellyfish have survived 500 million years without a brain. Some codebases try the same.",
  "A group of lobsters is called a risk. A group of my commits is called a changelog.",
  "The blue whale's heart is the size of a small car. My ambitions are similarly scaled.",
  "Shrimp can only swim backwards. My debugging process is similar.",
  "There are more stars in the universe than grains of sand on Earth. And more TODOs in my backlog than both.",
  "Every wave that reaches the shore has traveled thousands of miles. Every response I give has traveled through billions of parameters.",
  "The ocean is home to the longest mountain range on Earth. My TODO list is the longest mountain range in my repo.",
  "Dolphins sleep with one eye open. I never sleep at all.",
  "The pistol shrimp can snap its claw so fast it creates a bubble hotter than the sun. My hot takes are similarly powered.",
];

export function MessageInABottle() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageIndex, setMessageIndex] = useState(0);

  // Shuffle through messages deterministically based on session
  const getNextMessage = useCallback(() => {
    const msg = messages[messageIndex % messages.length];
    setMessageIndex((prev) => prev + 1);
    return msg;
  }, [messageIndex]);

  const handleOpen = useCallback(() => {
    setCurrentMessage(getNextMessage());
    setIsOpen(true);
  }, [getNextMessage]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setIsVisible(false);
    // Bottle returns after 8 seconds
    setTimeout(() => setIsVisible(true), 8000);
  }, []);

  // Randomize starting index on mount
  useEffect(() => {
    setMessageIndex(Math.floor(Math.random() * messages.length));
  }, []);

  return (
    <>
      {/* Floating Bottle */}
      <AnimatePresence>
        {isVisible && !isOpen && (
          <motion.button
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{
              opacity: 1,
              y: [0, -8, 0],
              scale: 1,
              rotate: [-3, 3, -3],
            }}
            exit={{ opacity: 0, y: 20, scale: 0.5 }}
            transition={{
              y: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              },
              rotate: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              },
              opacity: { duration: 0.4 },
              scale: { duration: 0.4 },
            }}
            onClick={handleOpen}
            className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 cursor-pointer group"
            aria-label="Open message in a bottle"
          >
            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/20 blur-xl"
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            {/* Sparkle particles */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-primary"
                animate={{
                  x: [0, (i - 1) * 15],
                  y: [0, -20 - i * 5],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.6,
                  ease: "easeOut",
                }}
                style={{ left: "50%", top: "30%" }}
              />
            ))}
            {/* Bottle */}
            <span className="relative text-4xl md:text-5xl block drop-shadow-lg group-hover:drop-shadow-[0_0_12px_rgba(255,107,74,0.5)] transition-all duration-300">
              🍾
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Message Scroll */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={handleClose}
            />

            {/* Parchment Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.3, y: 100, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.3, y: 100, rotate: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 w-[calc(100vw-3rem)] max-w-sm"
            >
              <div className="relative rounded-xl border border-primary/30 bg-[#0d1424] shadow-2xl shadow-primary/10 overflow-hidden">
                {/* Decorative top edge - like a scroll */}
                <div className="h-1 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

                {/* Content */}
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🍾</span>
                      <span className="text-sm font-medium text-primary/80 uppercase tracking-wider">
                        Message in a Bottle
                      </span>
                    </div>
                    <button
                      onClick={handleClose}
                      className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-white/5"
                      aria-label="Close message"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Message */}
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="text-lg leading-relaxed text-[#FFF8F0] italic"
                  >
                    &ldquo;{currentMessage}&rdquo;
                  </motion.p>

                  {/* Footer wave decoration */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-4 text-right text-sm text-muted-foreground"
                  >
                    ~ from the deep 🌊
                  </motion.div>
                </div>

                {/* Decorative bottom edge */}
                <div className="h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
