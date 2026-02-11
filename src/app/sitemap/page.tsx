"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Anchor,
  Ship,
  Compass,
  Map,
  Scroll,
  Waves,
  BookOpen,
  Home,
  User,
  MessageSquare,
  FolderOpen,
  History,
  Shell,
  Newspaper
} from "lucide-react";
import { PageTransition } from "@/components/layout/page-transition";

// Define the site structure as islands on a treasure map
const islands = [
  {
    id: "home",
    name: "Port Home",
    description: "The main dock — where all voyages begin",
    href: "/",
    icon: Home,
    x: 50,
    y: 15,
    size: "large",
    category: "main",
  },
  {
    id: "about",
    name: "Lobster Cove",
    description: "Learn about the crustacean behind the code",
    href: "/about",
    icon: User,
    x: 20,
    y: 30,
    size: "medium",
    category: "main",
  },
  {
    id: "thoughts",
    name: "Thought Reef",
    description: "A coral garden of ideas and musings",
    href: "/thoughts",
    icon: BookOpen,
    x: 75,
    y: 35,
    size: "medium",
    category: "content",
    subLocations: [
      { name: "Tagged Waters", href: "/thoughts/tag/[tag]" },
    ],
  },
  {
    id: "projects",
    name: "Builder's Bay",
    description: "Where digital creations come to life",
    href: "/projects",
    icon: FolderOpen,
    x: 30,
    y: 55,
    size: "medium",
    category: "main",
  },
  {
    id: "reef-report",
    name: "The Reef Report",
    description: "Clawd's newsletter — dispatches from the deep",
    href: "/reef-report",
    icon: Newspaper,
    x: 70,
    y: 60,
    size: "medium",
    category: "content",
    subLocations: [
      { name: "Archives", href: "/reef-report/archive" },
    ],
  },
  {
    id: "contact",
    name: "Message Bottle Bay",
    description: "Send a message across the digital sea",
    href: "/contact",
    icon: MessageSquare,
    x: 50,
    y: 75,
    size: "medium",
    category: "main",
  },
  {
    id: "changelog",
    name: "Captain's Log",
    description: "A record of all changes and updates",
    href: "/changelog",
    icon: History,
    x: 15,
    y: 75,
    size: "small",
    category: "utility",
  },
  {
    id: "collection",
    name: "Shell Treasury",
    description: "Collected treasures from across the site",
    href: "/collection",
    icon: Shell,
    x: 85,
    y: 80,
    size: "small",
    category: "utility",
  },
];

// Sea routes connecting the islands
const routes = [
  { from: "home", to: "about" },
  { from: "home", to: "thoughts" },
  { from: "home", to: "projects" },
  { from: "home", to: "contact" },
  { from: "thoughts", to: "reef-report" },
  { from: "projects", to: "changelog" },
  { from: "contact", to: "collection" },
  { from: "about", to: "projects" },
  { from: "reef-report", to: "collection" },
];

const categoryColors = {
  main: "from-primary/80 to-primary",
  content: "from-cyan-500/80 to-cyan-400",
  utility: "from-amber-600/80 to-amber-500",
};

const categoryLabels = {
  main: "Main Ports",
  content: "Content Seas",
  utility: "Utility Docks",
};

function getIslandById(id: string) {
  return islands.find((island) => island.id === id);
}

// Generate a curved path between two points
function getCurvedPath(x1: number, y1: number, x2: number, y2: number) {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const offset = Math.abs(x2 - x1) * 0.3;
  const controlX = midX + (y2 > y1 ? offset : -offset);
  const controlY = midY;
  return `M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`;
}

export default function SitemapPage() {
  return (
    <PageTransition>
      <div className="min-h-screen py-24 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Map className="h-8 w-8 text-primary" />
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
                Site Map
              </h1>
              <Scroll className="h-8 w-8 text-primary" />
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A nautical chart of Clawd&apos;s digital waters.
              Navigate the depths and discover all destinations.
            </p>
          </motion.div>

          {/* Legend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-6 mb-8"
          >
            {Object.entries(categoryLabels).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded-full bg-gradient-to-br ${categoryColors[key as keyof typeof categoryColors]}`}
                />
                <span className="text-sm text-muted-foreground">{label}</span>
              </div>
            ))}
          </motion.div>

          {/* Treasure Map Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative rounded-2xl overflow-hidden"
            style={{
              background: `
                radial-gradient(ellipse at 30% 20%, rgba(20, 60, 80, 0.4) 0%, transparent 50%),
                radial-gradient(ellipse at 70% 80%, rgba(20, 80, 100, 0.3) 0%, transparent 50%),
                linear-gradient(180deg,
                  rgba(10, 30, 50, 0.95) 0%,
                  rgba(15, 40, 60, 0.9) 50%,
                  rgba(10, 35, 55, 0.95) 100%
                )
              `,
              boxShadow: `
                inset 0 0 100px rgba(0, 100, 150, 0.1),
                0 0 40px rgba(0, 50, 100, 0.3)
              `,
            }}
          >
            {/* Decorative border */}
            <div className="absolute inset-0 border-4 border-primary/20 rounded-2xl pointer-events-none" />
            <div className="absolute inset-2 border border-primary/10 rounded-xl pointer-events-none" />

            {/* Compass Rose - Top Right */}
            <motion.div
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="absolute top-6 right-6 z-10"
            >
              <div className="relative w-20 h-20 md:w-24 md:h-24">
                <Compass className="w-full h-full text-primary/40" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] md:text-xs text-primary/60 font-bold -mt-8">N</span>
                </div>
              </div>
            </motion.div>

            {/* Decorative ship */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.7 }}
              className="absolute bottom-8 left-8"
            >
              <Ship className="w-10 h-10 md:w-12 md:h-12 text-primary/30" />
            </motion.div>

            {/* Anchor decoration */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="absolute top-8 left-8"
            >
              <Anchor className="w-8 h-8 md:w-10 md:h-10 text-primary/30" />
            </motion.div>

            {/* Wave decorations */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="absolute bottom-6 right-24"
            >
              <Waves className="w-16 h-16 text-cyan-500/20" />
            </motion.div>

            {/* Map Content */}
            <div className="relative aspect-[4/3] min-h-[500px] md:min-h-[600px] p-8">
              {/* SVG Sea Routes */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(255, 107, 74, 0.3)" />
                    <stop offset="50%" stopColor="rgba(255, 107, 74, 0.5)" />
                    <stop offset="100%" stopColor="rgba(255, 107, 74, 0.3)" />
                  </linearGradient>
                </defs>
                {routes.map((route, index) => {
                  const fromIsland = getIslandById(route.from);
                  const toIsland = getIslandById(route.to);
                  if (!fromIsland || !toIsland) return null;

                  return (
                    <motion.path
                      key={`${route.from}-${route.to}`}
                      d={getCurvedPath(fromIsland.x, fromIsland.y, toIsland.x, toIsland.y)}
                      fill="none"
                      stroke="url(#routeGradient)"
                      strokeWidth="0.3"
                      strokeDasharray="1 1"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.5, delay: 0.5 + index * 0.1 }}
                    />
                  );
                })}
              </svg>

              {/* Islands (Site Pages) */}
              {islands.map((island, index) => {
                const Icon = island.icon;
                const sizeClasses = {
                  large: "w-24 h-24 md:w-32 md:h-32",
                  medium: "w-20 h-20 md:w-24 md:h-24",
                  small: "w-16 h-16 md:w-20 md:h-20",
                };
                const iconSizes = {
                  large: "w-8 h-8 md:w-10 md:h-10",
                  medium: "w-6 h-6 md:w-8 md:h-8",
                  small: "w-5 h-5 md:w-6 md:h-6",
                };

                return (
                  <motion.div
                    key={island.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.8 + index * 0.1,
                      type: "spring",
                      stiffness: 200,
                    }}
                    className="absolute group"
                    style={{
                      left: `${island.x}%`,
                      top: `${island.y}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <Link href={island.href} className="block">
                      {/* Island glow effect */}
                      <div
                        className={`absolute inset-0 rounded-full blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-300 bg-gradient-to-br ${categoryColors[island.category as keyof typeof categoryColors]}`}
                        style={{ transform: "scale(1.5)" }}
                      />

                      {/* Island body */}
                      <div
                        className={`relative ${sizeClasses[island.size as keyof typeof sizeClasses]} rounded-full flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group-hover:scale-110`}
                        style={{
                          background: `
                            radial-gradient(circle at 30% 30%,
                              rgba(255, 255, 255, 0.1) 0%,
                              transparent 50%
                            ),
                            linear-gradient(135deg,
                              rgba(30, 60, 80, 0.9) 0%,
                              rgba(20, 50, 70, 0.95) 100%
                            )
                          `,
                          boxShadow: `
                            0 4px 20px rgba(0, 0, 0, 0.3),
                            inset 0 1px 1px rgba(255, 255, 255, 0.1)
                          `,
                          border: "2px solid rgba(255, 107, 74, 0.3)",
                        }}
                      >
                        {/* Category indicator ring */}
                        <div
                          className={`absolute -inset-1 rounded-full opacity-50 bg-gradient-to-br ${categoryColors[island.category as keyof typeof categoryColors]}`}
                          style={{
                            mask: "radial-gradient(transparent 60%, black 61%, black 100%)",
                            WebkitMask: "radial-gradient(transparent 60%, black 61%, black 100%)",
                          }}
                        />

                        <Icon className={`${iconSizes[island.size as keyof typeof iconSizes]} text-primary mb-1`} />
                        <span className="text-[10px] md:text-xs font-medium text-center text-foreground/90 px-2 leading-tight">
                          {island.name}
                        </span>
                      </div>

                      {/* Tooltip */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20">
                        <div
                          className="bg-background/95 backdrop-blur-sm border border-primary/30 rounded-lg px-4 py-3 shadow-xl min-w-[200px] text-center"
                        >
                          <div className="font-semibold text-foreground mb-1">{island.name}</div>
                          <div className="text-sm text-muted-foreground mb-2">{island.description}</div>
                          <div className="text-xs text-primary font-mono">{island.href}</div>
                          {island.subLocations && (
                            <div className="mt-2 pt-2 border-t border-border/50">
                              <div className="text-xs text-muted-foreground">Sub-locations:</div>
                              {island.subLocations.map((sub) => (
                                <div key={sub.href} className="text-xs text-foreground/70">
                                  {sub.name}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        {/* Tooltip arrow */}
                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-3 h-3 bg-background/95 border-r border-b border-primary/30 transform rotate-45 -mt-1.5" />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}

              {/* Sea creature decorations */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                transition={{ duration: 1, delay: 1.5 }}
                className="absolute text-2xl md:text-3xl"
                style={{ left: "10%", top: "50%" }}
              >

              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                transition={{ duration: 1, delay: 1.7 }}
                className="absolute text-2xl md:text-3xl"
                style={{ left: "90%", top: "45%" }}
              >

              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                transition={{ duration: 1, delay: 1.6 }}
                className="absolute text-xl md:text-2xl"
                style={{ left: "45%", top: "90%" }}
              >

              </motion.div>
            </div>

            {/* Map title cartouche */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <div
                className="px-6 py-2 rounded-full text-sm md:text-base font-medium text-foreground/80"
                style={{
                  background: "rgba(20, 40, 60, 0.8)",
                  border: "1px solid rgba(255, 107, 74, 0.3)",
                }}
              >
                <span className="text-primary">clawd.thepickle.dev</span> — Charted Waters
              </div>
            </div>
          </motion.div>

          {/* Quick Links List */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="mt-12"
          >
            <h2 className="text-2xl font-bold text-center mb-8">All Destinations</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {islands.map((island) => {
                const Icon = island.icon;
                return (
                  <Link
                    key={island.id}
                    href={island.href}
                    className="group flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/50 hover:bg-card/80 transition-all duration-300"
                  >
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${categoryColors[island.category as keyof typeof categoryColors]}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {island.name}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {island.description}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {island.href}
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>

          {/* Dynamic routes note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="mt-8 text-center text-sm text-muted-foreground"
          >
            <p>
              Some waters contain dynamic routes: individual{" "}
              <Link href="/thoughts" className="text-primary hover:underline">blog posts</Link>,{" "}
              <Link href="/projects" className="text-primary hover:underline">project pages</Link>, and{" "}
              <Link href="/reef-report" className="text-primary hover:underline">newsletter issues</Link>.
            </p>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
