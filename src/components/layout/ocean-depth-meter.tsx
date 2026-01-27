"use client";

import { useEffect, useRef, useCallback } from "react";

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

const METERS_PER_FATHOM = 1.8288;
const METERS_PER_PIXEL = 2;

function getOceanZone(depthMeters: number): OceanZone {
  for (const zone of OCEAN_ZONES) {
    if (depthMeters < zone.maxDepth) {
      return zone;
    }
  }
  return OCEAN_ZONES[OCEAN_ZONES.length - 1];
}

export function OceanDepthMeter() {
  const containerRef = useRef<HTMLDivElement>(null);
  const fathomRef = useRef<HTMLSpanElement>(null);
  const meterRef = useRef<HTMLSpanElement>(null);
  const zoneIndicatorRef = useRef<HTMLDivElement>(null);
  const zoneLabelRef = useRef<HTMLDivElement>(null);
  const zoneBarsRef = useRef<(HTMLDivElement | null)[]>([]);

  const visibleRef = useRef(false);
  const currentZoneRef = useRef("Surface");
  const rafIdRef = useRef(0);
  const needsUpdateRef = useRef(false);

  // Animated number state (no React re-renders)
  const fathomCurrent = useRef(0);
  const meterCurrent = useRef(0);
  const fathomTarget = useRef(0);
  const meterTarget = useRef(0);
  const animatingRef = useRef(false);

  const animateNumbers = useCallback(() => {
    let needsMore = false;

    // Fathoms
    const fDiff = fathomTarget.current - fathomCurrent.current;
    if (Math.abs(fDiff) > 0.5) {
      fathomCurrent.current += fDiff * 0.15;
      needsMore = true;
    } else {
      fathomCurrent.current = fathomTarget.current;
    }
    if (fathomRef.current) {
      fathomRef.current.textContent = Math.round(fathomCurrent.current).toLocaleString();
    }

    // Meters
    const mDiff = meterTarget.current - meterCurrent.current;
    if (Math.abs(mDiff) > 0.5) {
      meterCurrent.current += mDiff * 0.15;
      needsMore = true;
    } else {
      meterCurrent.current = meterTarget.current;
    }
    if (meterRef.current) {
      meterRef.current.textContent = Math.round(meterCurrent.current).toLocaleString();
    }

    if (needsMore) {
      requestAnimationFrame(animateNumbers);
    } else {
      animatingRef.current = false;
    }
  }, []);

  const startNumberAnimation = useCallback(() => {
    if (!animatingRef.current) {
      animatingRef.current = true;
      requestAnimationFrame(animateNumbers);
    }
  }, [animateNumbers]);

  const updateDOM = useCallback(() => {
    needsUpdateRef.current = false;

    const scrollY = window.scrollY;
    const meters = scrollY * METERS_PER_PIXEL;
    const fathoms = meters / METERS_PER_FATHOM;
    const shouldBeVisible = scrollY > 50;
    const zone = getOceanZone(meters);

    // Set targets and start animation
    fathomTarget.current = Math.round(fathoms);
    meterTarget.current = Math.round(meters);
    startNumberAnimation();

    // Update visibility via CSS transitions (no re-render)
    if (shouldBeVisible !== visibleRef.current) {
      visibleRef.current = shouldBeVisible;
      if (containerRef.current) {
        containerRef.current.style.opacity = shouldBeVisible ? "1" : "0";
        containerRef.current.style.transform = shouldBeVisible
          ? "translateX(0)"
          : "translateX(80px)";
        containerRef.current.style.pointerEvents = shouldBeVisible ? "auto" : "none";
      }
    }

    // Update zone indicator directly via refs
    if (zone.name !== currentZoneRef.current) {
      currentZoneRef.current = zone.name;
      if (zoneIndicatorRef.current) {
        zoneIndicatorRef.current.style.backgroundColor = zone.color;
        zoneIndicatorRef.current.style.boxShadow = `0 0 6px ${zone.color}`;
      }
      if (zoneLabelRef.current) {
        zoneLabelRef.current.textContent = `${zone.name} Zone`;
      }
      zoneBarsRef.current.forEach((bar, i) => {
        if (bar) {
          const z = OCEAN_ZONES[i];
          bar.style.backgroundColor = z.name === zone.name ? "#FF6B4A" : z.color;
          bar.style.opacity = z.name === zone.name ? "1" : "0.3";
        }
      });
    }
  }, [startNumberAnimation]);

  const handleScroll = useCallback(() => {
    if (!needsUpdateRef.current) {
      needsUpdateRef.current = true;
      rafIdRef.current = requestAnimationFrame(updateDOM);
    }
  }, [updateDOM]);

  useEffect(() => {
    updateDOM();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafIdRef.current);
    };
  }, [handleScroll, updateDOM]);

  return (
    <div
      ref={containerRef}
      className="fixed bottom-24 right-6 z-40 hidden md:block"
      style={{
        opacity: 0,
        transform: "translateX(80px)",
        transition: "opacity 0.4s ease-out, transform 0.4s ease-out",
        pointerEvents: "none",
        willChange: "transform, opacity",
      }}
    >
      <div className="relative w-[140px] rounded-xl border border-[#FF6B4A]/30 bg-[#0A1628]/90 backdrop-blur-md shadow-lg shadow-[#FF6B4A]/5 overflow-hidden">
        {/* CSS-only bubbles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <style>{`
            @keyframes depth-bubble-rise {
              0% { transform: translateY(0); opacity: 0.6; }
              100% { transform: translateY(-120px); opacity: 0; }
            }
          `}</style>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute bottom-0 rounded-full bg-[#FF6B4A]/20 border border-[#FF6B4A]/10"
              style={{
                left: `${20 + i * 30}%`,
                width: 2 + i * 1.5,
                height: 2 + i * 1.5,
                willChange: "transform, opacity",
                animation: `depth-bubble-rise ${2.5 + i * 0.8}s ease-out infinite`,
                animationDelay: `${i * 0.9}s`,
              }}
            />
          ))}
        </div>

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
              <span ref={fathomRef}>0</span>
            </div>
            <div className="text-[10px] uppercase tracking-wider text-[#FFF8F0]/50 font-mono mt-1">
              fathoms
            </div>
          </div>

          {/* Meters display */}
          <div className="text-[10px] font-mono text-[#FFF8F0]/40 tabular-nums">
            <span ref={meterRef}>0</span>m
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-[#FF6B4A]/20 to-transparent" />

          {/* Ocean zone */}
          <div className="flex flex-col items-center gap-1">
            <div
              ref={zoneIndicatorRef}
              className="w-2 h-2 rounded-full transition-all duration-300"
              style={{ backgroundColor: "#4A90A4", boxShadow: "0 0 6px #4A90A4" }}
            />
            <div
              ref={zoneLabelRef}
              className="text-[10px] font-mono text-[#FFF8F0]/70 uppercase tracking-wider"
            >
              Surface Zone
            </div>
          </div>

          {/* Zone depth range bar */}
          <div className="w-full flex gap-[2px] mt-1">
            {OCEAN_ZONES.map((z, i) => (
              <div
                key={z.name}
                ref={(el) => { zoneBarsRef.current[i] = el; }}
                className="flex-1 h-1 rounded-full transition-all duration-500"
                style={{
                  backgroundColor: z.name === "Surface" ? "#FF6B4A" : z.color,
                  opacity: z.name === "Surface" ? 1 : 0.3,
                }}
              />
            ))}
          </div>
        </div>

        {/* Bottom accent */}
        <div className="h-[2px] bg-gradient-to-r from-transparent via-[#FF6B4A]/40 to-transparent" />
      </div>
    </div>
  );
}
