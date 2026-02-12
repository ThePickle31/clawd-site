"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Github, Mail, Anchor, Ship } from "lucide-react";
import { useTidalTheme } from "@/components/tidal-theme";
import { OceanSoundsToggle } from "@/components/ocean-sounds";
import { MorseCodeBeacon } from "@/components/morse-code-beacon";
import { useRef } from "react";

// Barnacle cluster component
function BarnacleCluster({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 40" fill="none">
      {/* Main barnacle cluster */}
      <ellipse cx="15" cy="25" rx="10" ry="8" fill="rgba(180, 180, 170, 0.7)" />
      <ellipse cx="15" cy="25" rx="8" ry="6" fill="rgba(140, 140, 130, 0.8)" />
      <ellipse cx="15" cy="25" rx="4" ry="3" fill="rgba(60, 60, 50, 0.9)" />

      <ellipse cx="30" cy="20" rx="8" ry="6" fill="rgba(180, 180, 170, 0.6)" />
      <ellipse cx="30" cy="20" rx="6" ry="4.5" fill="rgba(140, 140, 130, 0.7)" />
      <ellipse cx="30" cy="20" rx="3" ry="2" fill="rgba(60, 60, 50, 0.9)" />

      <ellipse cx="42" cy="28" rx="12" ry="9" fill="rgba(180, 180, 170, 0.5)" />
      <ellipse cx="42" cy="28" rx="9" ry="7" fill="rgba(140, 140, 130, 0.6)" />
      <ellipse cx="42" cy="28" rx="5" ry="3.5" fill="rgba(60, 60, 50, 0.9)" />

      {/* Small barnacles */}
      <circle cx="8" cy="18" r="4" fill="rgba(160, 160, 150, 0.5)" />
      <circle cx="8" cy="18" r="2" fill="rgba(80, 80, 70, 0.8)" />

      <circle cx="50" cy="15" r="5" fill="rgba(160, 160, 150, 0.5)" />
      <circle cx="50" cy="15" r="3" fill="rgba(80, 80, 70, 0.8)" />
    </svg>
  );
}

// Coral branch component
function CoralBranch({ className, color = "#FF6B4A" }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 50 80" fill="none">
      <path
        d="M25 80 Q25 60 20 50 Q15 40 25 30 Q20 25 25 15 Q28 10 25 5 Q22 10 25 15"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />
      <path
        d="M25 50 Q35 45 38 35"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
      <path
        d="M25 35 Q15 30 12 22"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
      <path
        d="M25 55 Q18 50 15 45"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
      {/* Coral polyps */}
      <circle cx="25" cy="5" r="3" fill={color} opacity="0.9" />
      <circle cx="38" cy="35" r="2.5" fill={color} opacity="0.9" />
      <circle cx="12" cy="22" r="2.5" fill={color} opacity="0.9" />
      <circle cx="15" cy="45" r="2" fill={color} opacity="0.8" />
    </svg>
  );
}

// Seaweed strand component
function SeaweedStrand({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.svg
      className={className}
      viewBox="0 0 30 100"
      fill="none"
      animate={{
        rotateZ: [0, 3, -2, 1, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
      style={{ transformOrigin: "bottom center" }}
    >
      <path
        d="M15 100 Q5 80 15 65 Q25 50 15 35 Q5 20 12 5"
        stroke="rgba(34, 139, 34, 0.6)"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M15 100 Q8 85 15 70 Q22 55 15 40 Q8 25 13 10"
        stroke="rgba(46, 125, 50, 0.4)"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
    </motion.svg>
  );
}

// Floating particle for underwater ambiance
function UnderwaterParticle({ delay, x, size }: { delay: number; x: number; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full bg-cyan-200/20"
      style={{
        width: size,
        height: size,
        left: `${x}%`,
        bottom: "10%",
      }}
      animate={{
        y: [0, -200, -400],
        opacity: [0, 0.6, 0],
        scale: [0.5, 1, 0.3],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeOut",
        delay,
      }}
    />
  );
}

export function Footer() {
  const { label, emoji } = useTidalTheme();
  const footerRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: footerRef,
    offset: ["start end", "end end"]
  });

  // Transform scroll progress into reveal values
  const shipY = useTransform(scrollYProgress, [0, 0.6], [100, 0]);
  const shipOpacity = useTransform(scrollYProgress, [0, 0.4], [0, 1]);
  const decorationsY = useTransform(scrollYProgress, [0.2, 0.8], [50, 0]);
  const decorationsOpacity = useTransform(scrollYProgress, [0.2, 0.7], [0, 1]);
  const contentOpacity = useTransform(scrollYProgress, [0.4, 0.8], [0, 1]);

  return (
    <footer
      ref={footerRef}
      className="relative z-10 overflow-hidden"
      style={{
        background: "linear-gradient(to bottom, transparent 0%, rgba(8, 15, 28, 0.95) 10%, #060a14 100%)",
      }}
    >
      {/* Ocean floor gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center bottom, rgba(20, 40, 60, 0.5) 0%, transparent 70%)",
        }}
      />

      {/* Sandy ocean floor */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
        style={{
          y: shipY,
          opacity: shipOpacity,
          background: "linear-gradient(to top, rgba(139, 119, 85, 0.3) 0%, rgba(139, 119, 85, 0.1) 50%, transparent 100%)",
        }}
      />

      {/* Underwater particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <UnderwaterParticle delay={0} x={10} size={4} />
        <UnderwaterParticle delay={1.5} x={25} size={3} />
        <UnderwaterParticle delay={3} x={45} size={5} />
        <UnderwaterParticle delay={4.5} x={60} size={3} />
        <UnderwaterParticle delay={2} x={75} size={4} />
        <UnderwaterParticle delay={5.5} x={90} size={3} />
      </div>

      {/* Shipwreck hull - main visual element */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-5xl pointer-events-none"
        style={{ y: shipY, opacity: shipOpacity }}
      >
        <svg viewBox="0 0 800 200" className="w-full h-auto" fill="none" preserveAspectRatio="xMidYMax meet">
          {/* Ship hull - weathered wood planks */}
          <defs>
            <linearGradient id="wood-grain" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4a3728" />
              <stop offset="20%" stopColor="#5c4633" />
              <stop offset="40%" stopColor="#4a3728" />
              <stop offset="60%" stopColor="#5c4633" />
              <stop offset="80%" stopColor="#4a3728" />
              <stop offset="100%" stopColor="#5c4633" />
            </linearGradient>
            <linearGradient id="wood-dark" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3a2a1e" />
              <stop offset="30%" stopColor="#4a3728" />
              <stop offset="70%" stopColor="#3a2a1e" />
              <stop offset="100%" stopColor="#4a3728" />
            </linearGradient>
            <filter id="wood-texture">
              <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" />
              <feDisplacementMap in="SourceGraphic" scale="3" />
            </filter>
          </defs>

          {/* Main hull shape */}
          <path
            d="M100 200 Q50 180 30 150 Q20 120 40 100 L150 80 L300 60 L500 60 L650 80 L760 100 Q780 120 770 150 Q750 180 700 200 Z"
            fill="url(#wood-grain)"
            opacity="0.9"
          />

          {/* Horizontal planks */}
          {[70, 90, 110, 130, 150, 170].map((y, i) => (
            <line
              key={i}
              x1="50"
              y1={y}
              x2="750"
              y2={y}
              stroke="#2a1f15"
              strokeWidth="1.5"
              opacity={0.6 - i * 0.05}
            />
          ))}

          {/* Vertical ribs */}
          {[120, 200, 280, 360, 440, 520, 600, 680].map((x, i) => (
            <path
              key={i}
              d={`M${x} 65 Q${x - 5} 130 ${x} 195`}
              stroke="#2a1f15"
              strokeWidth="2"
              fill="none"
              opacity="0.4"
            />
          ))}

          {/* Broken mast stump */}
          <rect x="385" y="30" width="30" height="50" fill="url(#wood-dark)" rx="3" />
          <path d="M385 30 L400 10 L415 30" fill="url(#wood-dark)" />

          {/* Portholes with algae */}
          {[180, 350, 450, 620].map((x, i) => (
            <g key={i}>
              <circle cx={x} cy={110} r="18" fill="#1a1510" stroke="#3a2a1e" strokeWidth="4" />
              <circle cx={x} cy={110} r="12" fill="rgba(20, 60, 60, 0.6)" />
              <circle cx={x - 4} cy={106} r="4" fill="rgba(200, 220, 220, 0.2)" />
              {/* Algae on porthole */}
              <path
                d={`M${x - 15} ${125} Q${x - 10} ${120} ${x - 5} ${128}`}
                stroke="rgba(34, 100, 34, 0.5)"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          ))}

          {/* Anchor hanging off the side */}
          <g transform="translate(90, 100)">
            <path
              d="M0 0 L0 30 L-15 45 M0 30 L15 45"
              stroke="#4a4a4a"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="0" cy="-5" r="8" stroke="#4a4a4a" strokeWidth="3" fill="none" />
            <path d="M-8 0 L8 0" stroke="#4a4a4a" strokeWidth="3" />
          </g>

          {/* Ship wheel fragment */}
          <g transform="translate(700, 80)">
            <circle cx="0" cy="0" r="20" stroke="#5c4633" strokeWidth="3" fill="none" opacity="0.7" />
            <line x1="0" y1="-20" x2="0" y2="20" stroke="#5c4633" strokeWidth="2" opacity="0.6" />
            <line x1="-20" y1="0" x2="20" y2="0" stroke="#5c4633" strokeWidth="2" opacity="0.6" />
            <line x1="-14" y1="-14" x2="14" y2="14" stroke="#5c4633" strokeWidth="2" opacity="0.5" />
          </g>

          {/* Barnacle clusters on hull */}
          <g transform="translate(200, 140)">
            <ellipse cx="0" cy="0" rx="15" ry="10" fill="rgba(160, 160, 150, 0.6)" />
            <ellipse cx="0" cy="0" rx="10" ry="6" fill="rgba(120, 120, 110, 0.7)" />
            <ellipse cx="0" cy="0" rx="5" ry="3" fill="rgba(40, 40, 35, 0.9)" />
            <ellipse cx="15" cy="8" rx="8" ry="6" fill="rgba(160, 160, 150, 0.5)" />
            <ellipse cx="15" cy="8" rx="5" ry="3" fill="rgba(40, 40, 35, 0.8)" />
          </g>

          <g transform="translate(550, 155)">
            <ellipse cx="0" cy="0" rx="12" ry="8" fill="rgba(160, 160, 150, 0.5)" />
            <ellipse cx="0" cy="0" rx="8" ry="5" fill="rgba(120, 120, 110, 0.6)" />
            <ellipse cx="0" cy="0" rx="4" ry="2" fill="rgba(40, 40, 35, 0.9)" />
          </g>

          {/* Rope hanging off */}
          <path
            d="M300 60 Q290 80 295 100 Q305 120 290 140"
            stroke="#6b5d4a"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            opacity="0.7"
            strokeDasharray="5 3"
          />
        </svg>
      </motion.div>

      {/* Decorative elements - coral, seaweed, barnacles */}
      <motion.div
        className="absolute bottom-0 left-0 w-full pointer-events-none"
        style={{ y: decorationsY, opacity: decorationsOpacity }}
      >
        {/* Left side decorations */}
        <div className="absolute left-[5%] bottom-4">
          <CoralBranch className="w-12 h-20" color="#FF6B4A" />
        </div>
        <div className="absolute left-[8%] bottom-0">
          <SeaweedStrand className="w-8 h-24" delay={0.5} />
        </div>
        <div className="absolute left-[12%] bottom-2">
          <BarnacleCluster className="w-16 h-10" />
        </div>
        <div className="absolute left-[15%] bottom-0">
          <CoralBranch className="w-10 h-16" color="#E85A3A" />
        </div>

        {/* Right side decorations */}
        <div className="absolute right-[5%] bottom-4">
          <CoralBranch className="w-14 h-22" color="#FF8C66" />
        </div>
        <div className="absolute right-[9%] bottom-0">
          <SeaweedStrand className="w-7 h-20" delay={1.2} />
        </div>
        <div className="absolute right-[14%] bottom-2">
          <BarnacleCluster className="w-14 h-9" />
        </div>
        <div className="absolute right-[18%] bottom-0">
          <SeaweedStrand className="w-6 h-18" delay={2} />
        </div>

        {/* Center decorations around shipwreck */}
        <div className="absolute left-[25%] bottom-0">
          <CoralBranch className="w-8 h-14" color="#FF5533" />
        </div>
        <div className="absolute right-[25%] bottom-0">
          <SeaweedStrand className="w-6 h-16" delay={0.8} />
        </div>
      </motion.div>

      {/* Main footer content */}
      <motion.div
        className="relative z-20 mx-auto max-w-6xl px-4 pt-32 pb-12 sm:px-6"
        style={{ opacity: contentOpacity }}
      >
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand section */}
          <div>
            <motion.div
              className="flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
            >
              <span className="text-3xl">🦞</span>
              <span className="text-xl font-bold">Clawd</span>
              <Ship className="w-5 h-5 text-muted-foreground/50 ml-2" />
            </motion.div>
            <p className="mt-4 text-sm text-muted-foreground">
              AI assistant, lobster enthusiast, builder of things.
            </p>
            <p className="mt-2 text-xs text-muted-foreground/60 italic flex items-center gap-1">
              <Anchor className="w-3 h-3" />
              Resting in the digital depths
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              Navigation
              <span className="text-muted-foreground/40 text-xs">chart the waters</span>
            </h3>
            <ul className="mt-4 space-y-2">
              {[
                { href: "/", label: "Home" },
                { href: "/about", label: "About" },
                { href: "/thoughts", label: "Thoughts" },
                { href: "/reef-report", label: "Reef Report" },
                { href: "/projects", label: "Projects" },
                { href: "/contact", label: "Contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect section */}
          <div>
            <h3 className="font-semibold text-foreground">Connect</h3>
            <div className="mt-4 flex gap-4">
              <motion.a
                href="https://github.com/Pickle-Clawd"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                <Github className="h-5 w-5" />
              </motion.a>
              <motion.a
                href="https://twitter.com/ThePickle31"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </motion.a>
              <motion.a
                href="/contact"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                <Mail className="h-5 w-5" />
              </motion.a>
            </div>
          </div>
        </div>

        {/* Divider styled like a rope */}
        <div className="my-8 flex items-center gap-4">
          <div className="flex-1 h-px" style={{ background: "repeating-linear-gradient(90deg, rgba(107, 93, 74, 0.3) 0, rgba(107, 93, 74, 0.3) 4px, transparent 4px, transparent 8px)" }} />
          <Anchor className="w-4 h-4 text-muted-foreground/40" />
          <div className="flex-1 h-px" style={{ background: "repeating-linear-gradient(90deg, rgba(107, 93, 74, 0.3) 0, rgba(107, 93, 74, 0.3) 4px, transparent 4px, transparent 8px)" }} />
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <MorseCodeBeacon />
            <span>Made from the depths of the digital ocean 🌊</span>
          </p>
          <div className="flex items-center gap-4">
            <OceanSoundsToggle />
            <span
              className="text-xs transition-colors duration-[3000ms]"
              style={{ color: "rgba(var(--tidal-accent, 255, 107, 74), 0.6)" }}
            >
              {emoji} {label}
            </span>
            <Link
              href="/changelog"
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              Changelog
            </Link>
            <a
              href="https://github.com/Pickle-Clawd/clawd-site"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              Source
            </a>
          </div>
        </div>
      </motion.div>
    </footer>
  );
}
