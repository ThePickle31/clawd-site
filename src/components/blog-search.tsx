"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";

interface BlogSearchProps {
  onSearch: (query: string) => void;
  resultCount: number;
  totalCount: number;
}

export function BlogSearch({ onSearch, resultCount, totalCount }: BlogSearchProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback(
    (value: string) => {
      setQuery(value);
      onSearch(value);
    },
    [onSearch]
  );

  const clearSearch = useCallback(() => {
    setQuery("");
    onSearch("");
    inputRef.current?.focus();
  }, [onSearch]);

  // Cmd/Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      // Escape to blur and clear
      if (e.key === "Escape" && document.activeElement === inputRef.current) {
        inputRef.current?.blur();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const isSearching = query.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="relative max-w-xl mx-auto mb-12"
    >
      {/* Porthole frame */}
      <div
        className={`
          relative rounded-full transition-all duration-300
          ${isFocused
            ? "shadow-[0_0_0_4px_rgba(255,107,74,0.3),0_0_30px_rgba(255,107,74,0.15)]"
            : "shadow-[0_0_0_3px_rgba(255,248,240,0.1)]"
          }
        `}
      >
        {/* Outer ring - the porthole rim */}
        <div
          className={`
            absolute inset-0 rounded-full
            bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800
            transition-opacity duration-300
            ${isFocused ? "opacity-100" : "opacity-80"}
          `}
          style={{
            padding: "3px",
          }}
        >
          <div className="w-full h-full rounded-full bg-background/95 backdrop-blur-sm" />
        </div>

        {/* Inner content */}
        <div className="relative flex items-center px-5 py-3">
          {/* Magnifying glass / porthole glass icon */}
          <div
            className={`
              relative flex items-center justify-center w-8 h-8 mr-3
              rounded-full transition-all duration-300
              ${isFocused
                ? "bg-primary/20 text-primary"
                : "bg-muted/50 text-muted-foreground"
              }
            `}
          >
            {/* Porthole rivets effect */}
            <div className="absolute inset-0 rounded-full">
              {[0, 90, 180, 270].map((rotation) => (
                <div
                  key={rotation}
                  className={`
                    absolute w-1.5 h-1.5 rounded-full
                    bg-slate-500/50 transition-colors duration-300
                    ${isFocused ? "bg-primary/30" : ""}
                  `}
                  style={{
                    top: "50%",
                    left: "50%",
                    transform: `rotate(${rotation}deg) translate(12px, -50%)`,
                  }}
                />
              ))}
            </div>
            <Search className="w-4 h-4" />
          </div>

          {/* Input field */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Search the depths..."
            className="
              flex-1 bg-transparent border-none outline-none
              text-foreground placeholder:text-muted-foreground/60
              text-base
            "
            aria-label="Search blog posts"
          />

          {/* Clear button / keyboard shortcut hint */}
          <AnimatePresence mode="wait">
            {isSearching ? (
              <motion.button
                key="clear"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                onClick={clearSearch}
                className="
                  flex items-center justify-center w-6 h-6
                  rounded-full bg-muted/50 hover:bg-muted
                  text-muted-foreground hover:text-foreground
                  transition-colors
                "
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </motion.button>
            ) : (
              <motion.div
                key="shortcut"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="
                  hidden sm:flex items-center gap-1
                  text-xs text-muted-foreground/50
                "
              >
                <kbd className="px-1.5 py-0.5 rounded bg-muted/30 font-mono">
                  {typeof navigator !== "undefined" && navigator.platform?.includes("Mac")
                    ? "⌘"
                    : "Ctrl"}
                </kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-muted/30 font-mono">K</kbd>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Results indicator */}
      <AnimatePresence>
        {isSearching && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute -bottom-8 left-0 right-0 text-center"
          >
            <span className="text-sm text-muted-foreground">
              {resultCount === 0 ? (
                <>No posts found in the depths</>
              ) : resultCount === totalCount ? (
                <>All {totalCount} posts match</>
              ) : (
                <>
                  Found {resultCount} of {totalCount} post{totalCount !== 1 ? "s" : ""}
                </>
              )}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
