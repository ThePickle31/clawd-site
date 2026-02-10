'use client';

import { cn } from '@/lib/utils';

// Deterministic pseudo-random based on index and seed offset (avoids hydration issues)
function seededValue(index: number, seedMultiplier: number): number {
  return ((index * seedMultiplier) % 1000) / 1000;
}

interface CoralBranch {
  xPercent: number;
  height: number;
  delay: number;
  type: 'coral' | 'seaweed' | 'fan';
  color: 'coral' | 'teal' | 'purple' | 'pink';
}

function generateBranches(count: number, seedOffset: number = 0): CoralBranch[] {
  const types: Array<'coral' | 'seaweed' | 'fan'> = ['coral', 'seaweed', 'fan'];
  const colors: Array<'coral' | 'teal' | 'purple' | 'pink'> = ['coral', 'teal', 'purple', 'pink'];

  return [...Array(count)].map((_, i) => {
    const idx = i + seedOffset;
    return {
      xPercent: seededValue(idx, 1234567) * 100,
      height: 40 + seededValue(idx, 7654321) * 60, // 40-100% height
      delay: seededValue(idx, 2468135) * 0.8, // 0-0.8s delay
      type: types[Math.floor(seededValue(idx, 9876543) * 3)],
      color: colors[Math.floor(seededValue(idx, 1357924) * 4)],
    };
  });
}

const colorMap = {
  coral: 'bg-gradient-to-t from-[#FF6B4A] to-[#FF8C6B]',
  teal: 'bg-gradient-to-t from-[#4ECDC4] to-[#7EDBCF]',
  purple: 'bg-gradient-to-t from-[#C4A7E7] to-[#D4BFFF]',
  pink: 'bg-gradient-to-t from-[#F0B27A] to-[#FFDAB3]',
};

const opacityMap = {
  coral: 'from-[#FF6B4A]/60 to-[#FF8C6B]/40',
  teal: 'from-[#4ECDC4]/60 to-[#7EDBCF]/40',
  purple: 'from-[#C4A7E7]/60 to-[#D4BFFF]/40',
  pink: 'from-[#F0B27A]/60 to-[#FFDAB3]/40',
};

interface CoralReefSkeletonProps {
  /** Number of coral/seaweed branches to render */
  branchCount?: number;
  /** Seed offset for deterministic generation (different values = different arrangements) */
  seedOffset?: number;
  /** Height of the skeleton container */
  height?: string;
  /** Additional classes for the container */
  className?: string;
  /** Variant: 'full' for standalone, 'inline' for within content */
  variant?: 'full' | 'inline';
  /** Whether to show the shimmer effect */
  shimmer?: boolean;
}

// Pre-generate default branches for common usage
const defaultBranches = generateBranches(12, 42);

export function CoralReefSkeleton({
  branchCount = 12,
  seedOffset = 42,
  height = '200px',
  className,
  variant = 'full',
  shimmer = true,
}: CoralReefSkeletonProps) {
  const branches =
    branchCount === 12 && seedOffset === 42
      ? defaultBranches
      : generateBranches(branchCount, seedOffset);

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg',
        variant === 'full' && 'bg-ocean-deep/30',
        className
      )}
      style={{ height }}
      role="status"
      aria-label="Loading..."
    >
      {/* Ocean floor base */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-[#1A3A5C] to-transparent" />

      {/* Coral and seaweed branches */}
      {branches.map((branch, i) => (
        <div
          key={i}
          className="absolute bottom-0"
          style={{
            left: `${branch.xPercent}%`,
            transform: 'translateX(-50%)',
          }}
        >
          {branch.type === 'coral' && (
            <CoralStalk
              height={branch.height}
              delay={branch.delay}
              color={branch.color}
              shimmer={shimmer}
            />
          )}
          {branch.type === 'seaweed' && (
            <SeaweedStrand
              height={branch.height}
              delay={branch.delay}
              color={branch.color}
              shimmer={shimmer}
            />
          )}
          {branch.type === 'fan' && (
            <CoralFan
              height={branch.height}
              delay={branch.delay}
              color={branch.color}
              shimmer={shimmer}
            />
          )}
        </div>
      ))}

      {/* Ambient particles (bubbles) */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="coral-bubble absolute rounded-full bg-white/20"
            style={{
              width: `${4 + seededValue(i, 3579) * 6}px`,
              height: `${4 + seededValue(i, 3579) * 6}px`,
              left: `${seededValue(i, 2468) * 100}%`,
              bottom: `${seededValue(i, 1357) * 60}%`,
              animationDelay: `${seededValue(i, 4680) * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Screen reader text */}
      <span className="sr-only">Loading content...</span>
    </div>
  );
}

function CoralStalk({
  height,
  delay,
  color,
  shimmer,
}: {
  height: number;
  delay: number;
  color: 'coral' | 'teal' | 'purple' | 'pink';
  shimmer: boolean;
}) {
  return (
    <div
      className="coral-grow relative"
      style={{
        animationDelay: `${delay}s`,
        '--coral-height': `${height}%`,
      } as React.CSSProperties}
    >
      {/* Main stalk */}
      <div
        className={cn(
          'w-2 rounded-t-full',
          shimmer ? `bg-gradient-to-t ${opacityMap[color]}` : colorMap[color]
        )}
        style={{ height: `${height * 0.6}px` }}
      />
      {/* Branches */}
      <div
        className={cn(
          'coral-branch-left absolute bottom-[40%] -left-2 w-1.5 h-4 rounded-full origin-bottom-right',
          shimmer ? `bg-gradient-to-t ${opacityMap[color]}` : colorMap[color]
        )}
        style={{ animationDelay: `${delay + 0.2}s` }}
      />
      <div
        className={cn(
          'coral-branch-right absolute bottom-[60%] -right-2 w-1.5 h-5 rounded-full origin-bottom-left',
          shimmer ? `bg-gradient-to-t ${opacityMap[color]}` : colorMap[color]
        )}
        style={{ animationDelay: `${delay + 0.3}s` }}
      />
      <div
        className={cn(
          'coral-branch-left absolute bottom-[75%] -left-1.5 w-1 h-3 rounded-full origin-bottom-right',
          shimmer ? `bg-gradient-to-t ${opacityMap[color]}` : colorMap[color]
        )}
        style={{ animationDelay: `${delay + 0.4}s` }}
      />
    </div>
  );
}

function SeaweedStrand({
  height,
  delay,
  color,
  shimmer,
}: {
  height: number;
  delay: number;
  color: 'coral' | 'teal' | 'purple' | 'pink';
  shimmer: boolean;
}) {
  return (
    <div
      className="seaweed-sway"
      style={{
        animationDelay: `${delay}s`,
        transformOrigin: 'bottom center',
      }}
    >
      <div
        className={cn(
          'seaweed-grow w-1 rounded-full',
          shimmer ? `bg-gradient-to-t ${opacityMap[color]}` : colorMap[color]
        )}
        style={{
          height: `${height * 0.7}px`,
          animationDelay: `${delay}s`,
        }}
      />
    </div>
  );
}

function CoralFan({
  height,
  delay,
  color,
  shimmer,
}: {
  height: number;
  delay: number;
  color: 'coral' | 'teal' | 'purple' | 'pink';
  shimmer: boolean;
}) {
  return (
    <div
      className="coral-fan-grow relative"
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Fan shape using multiple overlapping elements */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={cn(
            'absolute bottom-0 w-0.5 rounded-t-full origin-bottom',
            shimmer ? `bg-gradient-to-t ${opacityMap[color]}` : colorMap[color]
          )}
          style={{
            height: `${height * (0.5 + i * 0.1)}px`,
            transform: `rotate(${(i - 2) * 15}deg)`,
            left: '50%',
            marginLeft: '-1px',
            animationDelay: `${delay + i * 0.05}s`,
          }}
        />
      ))}
    </div>
  );
}

// Text skeleton variants using coral theme
export function CoralTextSkeleton({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-3', className)} role="status" aria-label="Loading text...">
      {[...Array(lines)].map((_, i) => (
        <div
          key={i}
          className="coral-shimmer h-4 rounded bg-ocean-light/50"
          style={{
            width: `${60 + seededValue(i, 7890) * 40}%`,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
      <span className="sr-only">Loading text...</span>
    </div>
  );
}

// Card skeleton with coral reef at bottom
export function CoralCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl bg-card border border-border p-4',
        className
      )}
      role="status"
      aria-label="Loading card..."
    >
      {/* Header */}
      <div className="coral-shimmer h-6 w-3/4 rounded bg-ocean-light/50 mb-3" />

      {/* Content lines */}
      <div className="space-y-2 mb-8">
        <div className="coral-shimmer h-4 w-full rounded bg-ocean-light/40" style={{ animationDelay: '0.1s' }} />
        <div className="coral-shimmer h-4 w-5/6 rounded bg-ocean-light/40" style={{ animationDelay: '0.2s' }} />
        <div className="coral-shimmer h-4 w-4/6 rounded bg-ocean-light/40" style={{ animationDelay: '0.3s' }} />
      </div>

      {/* Coral reef footer */}
      <div className="absolute bottom-0 left-0 right-0 h-12 overflow-hidden">
        <CoralReefSkeleton
          height="48px"
          branchCount={6}
          seedOffset={123}
          variant="inline"
          className="!bg-transparent"
        />
      </div>

      <span className="sr-only">Loading card...</span>
    </div>
  );
}
