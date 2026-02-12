"use client";

/**
 * WaterCaustics — shimmering light patterns like sunlight filtering through water
 *
 * Creates the dappled, rippling effect you see on the ocean floor when light
 * refracts through surface waves. Multiple overlapping gradient layers with
 * different animation speeds create that classic caustic interference pattern.
 *
 * Positioned at the top of pages to simulate light coming from above.
 * Uses CSS animations on transform for GPU acceleration.
 */

export function WaterCaustics() {
  return (
    <div
      className="water-caustics-container"
      aria-hidden="true"
    >
      {/* Multiple caustic layers at different speeds create interference patterns */}
      <div className="caustic-layer caustic-layer-1" />
      <div className="caustic-layer caustic-layer-2" />
      <div className="caustic-layer caustic-layer-3" />
    </div>
  );
}
