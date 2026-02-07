"use client";

import { useState, useRef, useEffect } from "react";
import { formatTidalTime } from "@/lib/tidal-time";
import { format } from "date-fns";

interface TidalTimestampProps {
  date: Date | string;
  className?: string;
  showIcon?: boolean;
}

/**
 * TidalTimestamp — displays ocean-themed relative time with hover tooltip
 *
 * Shows tidal time (e.g., "3 tides ago") with a tooltip revealing the actual date.
 * Accessible via hover on desktop and tap on mobile.
 */
export function TidalTimestamp({
  date,
  className = "",
  showIcon = false,
}: TidalTimestampProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<"above" | "below">("above");
  const containerRef = useRef<HTMLSpanElement>(null);

  const targetDate = typeof date === "string" ? new Date(date) : date;
  const tidalTime = formatTidalTime(targetDate);
  const actualDate = format(targetDate, "MMMM d, yyyy");
  const actualDateTime = format(targetDate, "MMMM d, yyyy 'at' h:mm a");

  // Determine tooltip position based on available space
  useEffect(() => {
    if (showTooltip && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceAbove = rect.top;
      const tooltipHeight = 60; // Approximate tooltip height

      setTooltipPosition(spaceAbove < tooltipHeight ? "below" : "above");
    }
  }, [showTooltip]);

  return (
    <span
      ref={containerRef}
      className={`relative inline-flex items-center gap-1 cursor-help group ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onFocus={() => setShowTooltip(true)}
      onBlur={() => setShowTooltip(false)}
      tabIndex={0}
      role="text"
      aria-label={`${tidalTime} (${actualDateTime})`}
    >
      {showIcon && <span className="text-xs opacity-70">~</span>}
      <span className="border-b border-dotted border-current/30 group-hover:border-primary/50 transition-colors">
        {tidalTime}
      </span>

      {/* Tooltip */}
      {showTooltip && (
        <span
          className={`absolute left-1/2 -translate-x-1/2 z-50 px-3 py-2 text-xs font-normal whitespace-nowrap bg-card/95 backdrop-blur-sm border border-border/50 rounded-lg shadow-lg shadow-black/20 text-foreground ${
            tooltipPosition === "above" ? "bottom-full mb-2" : "top-full mt-2"
          }`}
          role="tooltip"
        >
          <span className="block text-muted-foreground/70 text-[10px] uppercase tracking-wide mb-0.5">
            Actual date
          </span>
          <span className="block font-medium">{actualDate}</span>
          {/* Arrow */}
          <span
            className={`absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-card/95 border-border/50 rotate-45 ${
              tooltipPosition === "above"
                ? "top-full -mt-1 border-r border-b"
                : "bottom-full -mb-1 border-l border-t"
            }`}
          />
        </span>
      )}
    </span>
  );
}
