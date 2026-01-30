// Deterministic pseudo-random based on index and seed offset
function seededValue(index: number, seedMultiplier: number): number {
  return ((index * seedMultiplier) % 1000) / 1000;
}

function generateParticles(count: number, seedOffset: number = 0) {
  return [...Array(count)].map((_, i) => {
    const idx = i + seedOffset;
    return {
      xPercent: seededValue(idx, 1234567) * 100,
      yPercent: seededValue(idx, 7654321) * 100,
      yOffset: seededValue(idx, 2468135) * -200,
      duration: 5 + seededValue(idx, 9876543) * 5,
      delay: seededValue(idx, 1357924) * 2,
    };
  });
}

interface FloatingParticlesProps {
  count?: number;
  seedOffset?: number;
}

const defaultParticles = generateParticles(50, 100);

export function FloatingParticles({
  count = 50,
  seedOffset = 100,
}: FloatingParticlesProps) {
  const particles =
    count === 50 && seedOffset === 100
      ? defaultParticles
      : generateParticles(count, seedOffset);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((particle, i) => (
        <div
          key={i}
          className="particle-float absolute w-2 h-2 rounded-full"
          style={{
            left: `${particle.xPercent}%`,
            top: `${particle.yPercent}%`,
            "--y-offset": `${particle.yOffset}px`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
