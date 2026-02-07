/**
 * Tidal Timestamps — ocean-themed relative time formatting
 *
 * Converts relative time to ocean-themed language:
 * - Just now / seconds → "Just surfaced"
 * - Minutes ago → "X currents ago" (1 current = 1 minute)
 * - Hours ago → "X waves ago" (1 wave = 1 hour)
 * - Days ago → "X tides ago" (1 tide = 1 day)
 * - Months ago → "X lunar cycles ago"
 * - Years ago → "X moons ago" (1 moon = 1 year)
 */

export function formatTidalTime(date: Date | string): string {
  const targetDate = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - targetDate.getTime();

  // Handle future dates
  if (diffMs < 0) {
    return "From the future depths";
  }

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30.44); // Average days per month
  const years = Math.floor(days / 365.25); // Account for leap years

  // Just surfaced (less than 1 minute)
  if (seconds < 60) {
    return "Just surfaced";
  }

  // Currents (minutes)
  if (minutes < 60) {
    return minutes === 1 ? "1 current ago" : `${minutes} currents ago`;
  }

  // Waves (hours)
  if (hours < 24) {
    return hours === 1 ? "1 wave ago" : `${hours} waves ago`;
  }

  // Tides (days) - use for anything less than ~2 months
  if (days < 60) {
    return days === 1 ? "1 tide ago" : `${days} tides ago`;
  }

  // Lunar cycles (months) - use for 2-11 months
  if (months < 12) {
    return months === 1 ? "1 lunar cycle ago" : `${months} lunar cycles ago`;
  }

  // Moons (years)
  return years === 1 ? "1 moon ago" : `${years} moons ago`;
}

/**
 * Get a short tidal unit description for tooltips
 */
export function getTidalLegend(): Record<string, string> {
  return {
    current: "1 minute",
    wave: "1 hour",
    tide: "1 day",
    "lunar cycle": "1 month",
    moon: "1 year",
  };
}
