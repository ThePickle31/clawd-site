"use client";

import { useEffect, useState, createContext, useContext } from "react";

// Phase definitions with their colors
const PHASES = {
  dawn: {
    accent: [255, 139, 106],    // #FF8B6A
    glow: [255, 180, 140],       // warm golden glow
    bgShift: [15, 22, 45],       // slightly warmer navy
    label: "dawn tide",
    emoji: "\u{1F305}",          // sunrise
  },
  day: {
    accent: [78, 205, 196],      // #4ECDC4
    glow: [100, 220, 210],       // bright teal glow
    bgShift: [10, 24, 44],       // standard navy
    label: "high tide",
    emoji: "\u{2600}\u{FE0F}",   // sun
  },
  dusk: {
    accent: [224, 124, 79],      // #E07C4F
    glow: [160, 110, 200],       // purple-amber blend glow
    bgShift: [14, 18, 38],       // deeper warm navy
    label: "ebb tide",
    emoji: "\u{1F306}",          // dusk
  },
  night: {
    accent: [0, 212, 170],       // #00D4AA
    glow: [0, 180, 160],         // bioluminescent glow
    bgShift: [6, 12, 28],        // darkest navy
    label: "night tide",
    emoji: "\u{1F319}",          // crescent moon
  },
} as const;

type PhaseName = keyof typeof PHASES;

interface TidalContextValue {
  phase: PhaseName;
  label: string;
  emoji: string;
}

const TidalContext = createContext<TidalContextValue>({
  phase: "night",
  label: "night tide",
  emoji: "\u{1F319}",
});

export function useTidalTheme() {
  return useContext(TidalContext);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpColor(c1: number[], c2: number[], t: number): number[] {
  return [
    Math.round(lerp(c1[0], c2[0], t)),
    Math.round(lerp(c1[1], c2[1], t)),
    Math.round(lerp(c1[2], c2[2], t)),
  ];
}

function colorToRgb(c: number[]): string {
  return `${c[0]}, ${c[1]}, ${c[2]}`;
}

function colorToHex(c: number[]): string {
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

// Get phase and blend factor based on hour (0-23) with smooth transitions
// Each phase has a 1-hour transition zone at its boundaries
function getPhaseBlend(hour: number): { phase: PhaseName; accent: number[]; glow: number[]; bgShift: number[] } {
  // Phase boundaries: dawn 5-8, day 8-16, dusk 16-20, night 20-5
  // Transition zones: 1 hour on each side

  // Helper to get smoothstep for transition
  const smoothstep = (t: number) => t * t * (3 - 2 * t);

  if (hour >= 5 && hour < 6) {
    // night -> dawn transition
    const t = smoothstep(hour - 5);
    return {
      phase: "dawn",
      accent: lerpColor([...PHASES.night.accent], [...PHASES.dawn.accent], t),
      glow: lerpColor([...PHASES.night.glow], [...PHASES.dawn.glow], t),
      bgShift: lerpColor([...PHASES.night.bgShift], [...PHASES.dawn.bgShift], t),
    };
  } else if (hour >= 6 && hour < 7.5) {
    // solid dawn
    return { phase: "dawn", accent: [...PHASES.dawn.accent], glow: [...PHASES.dawn.glow], bgShift: [...PHASES.dawn.bgShift] };
  } else if (hour >= 7.5 && hour < 8.5) {
    // dawn -> day transition
    const t = smoothstep((hour - 7.5) / 1);
    return {
      phase: hour < 8 ? "dawn" : "day",
      accent: lerpColor([...PHASES.dawn.accent], [...PHASES.day.accent], t),
      glow: lerpColor([...PHASES.dawn.glow], [...PHASES.day.glow], t),
      bgShift: lerpColor([...PHASES.dawn.bgShift], [...PHASES.day.bgShift], t),
    };
  } else if (hour >= 8.5 && hour < 15.5) {
    // solid day
    return { phase: "day", accent: [...PHASES.day.accent], glow: [...PHASES.day.glow], bgShift: [...PHASES.day.bgShift] };
  } else if (hour >= 15.5 && hour < 16.5) {
    // day -> dusk transition
    const t = smoothstep((hour - 15.5) / 1);
    return {
      phase: hour < 16 ? "day" : "dusk",
      accent: lerpColor([...PHASES.day.accent], [...PHASES.dusk.accent], t),
      glow: lerpColor([...PHASES.day.glow], [...PHASES.dusk.glow], t),
      bgShift: lerpColor([...PHASES.day.bgShift], [...PHASES.dusk.bgShift], t),
    };
  } else if (hour >= 16.5 && hour < 19.5) {
    // solid dusk
    return { phase: "dusk", accent: [...PHASES.dusk.accent], glow: [...PHASES.dusk.glow], bgShift: [...PHASES.dusk.bgShift] };
  } else if (hour >= 19.5 && hour < 20.5) {
    // dusk -> night transition
    const t = smoothstep((hour - 19.5) / 1);
    return {
      phase: hour < 20 ? "dusk" : "night",
      accent: lerpColor([...PHASES.dusk.accent], [...PHASES.night.accent], t),
      glow: lerpColor([...PHASES.dusk.glow], [...PHASES.night.glow], t),
      bgShift: lerpColor([...PHASES.dusk.bgShift], [...PHASES.night.bgShift], t),
    };
  } else {
    // solid night (20.5+ or <5)
    return { phase: "night", accent: [...PHASES.night.accent], glow: [...PHASES.night.glow], bgShift: [...PHASES.night.bgShift] };
  }
}

function getCurrentHourFraction(): number {
  const now = new Date();
  return now.getHours() + now.getMinutes() / 60;
}

export function TidalThemeProvider({ children }: { children: React.ReactNode }) {
  const [phaseData, setPhaseData] = useState<{
    phase: PhaseName;
    accent: number[];
    glow: number[];
    bgShift: number[];
  } | null>(null);

  useEffect(() => {
    function update() {
      const hour = getCurrentHourFraction();
      const data = getPhaseBlend(hour);
      setPhaseData(data);

      // Set CSS custom properties on document
      const root = document.documentElement;
      root.style.setProperty("--tidal-accent", colorToRgb(data.accent));
      root.style.setProperty("--tidal-accent-hex", colorToHex(data.accent));
      root.style.setProperty("--tidal-glow", colorToRgb(data.glow));
      root.style.setProperty("--tidal-glow-hex", colorToHex(data.glow));
      root.style.setProperty("--tidal-bg-shift", colorToRgb(data.bgShift));
    }

    // Initial update
    update();

    // Update every minute to catch transitions
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, []);

  const contextValue: TidalContextValue = phaseData
    ? {
        phase: phaseData.phase,
        label: PHASES[phaseData.phase].label,
        emoji: PHASES[phaseData.phase].emoji,
      }
    : { phase: "night", label: "night tide", emoji: "\u{1F319}" };

  return (
    <TidalContext.Provider value={contextValue}>
      {children}
    </TidalContext.Provider>
  );
}
