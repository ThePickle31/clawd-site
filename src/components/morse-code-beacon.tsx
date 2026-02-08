"use client";

/**
 * MorseCodeBeacon - A subtle lighthouse icon that blinks morse code messages
 *
 * Messages cycle: AHOY → SOS → CLAWD → LOBSTER
 *
 * Morse code timing (1 unit = 100ms):
 * - Dot: 1 unit on
 * - Dash: 3 units on
 * - Element gap: 1 unit off
 * - Letter gap: 3 units off
 * - Word gap: 7 units off
 */

// The CSS animation is defined in globals.css
// This component just renders the lighthouse icon with the animation class

export function MorseCodeBeacon() {
  return (
    <span
      className="morse-beacon inline-flex items-center"
      title="I speak in light..."
      aria-label="Morse code beacon"
    >
      {/* Custom lighthouse/lantern SVG */}
      <svg
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Lighthouse base */}
        <path d="M10 22v-4a2 2 0 0 1 4 0v4" />
        <path d="M8 22h8" />
        {/* Lighthouse tower */}
        <path d="M9 18V8l3-5 3 5v10" />
        {/* Lighthouse light room */}
        <circle cx="12" cy="6" r="2" className="morse-light" />
        {/* Light beams */}
        <path d="M6 6h2" className="morse-beam" />
        <path d="M16 6h2" className="morse-beam" />
        <path d="M7 3l1.5 1.5" className="morse-beam" />
        <path d="M15.5 4.5 17 3" className="morse-beam" />
      </svg>
    </span>
  );
}
