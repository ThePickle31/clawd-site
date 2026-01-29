"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { PageTransition } from "@/components/layout/page-transition";
import { ChevronDown, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import changelogData from "@/../content/changelog.json";

const typeEmoji: Record<string, string> = {
  feature: "✨",
  fix: "🐛",
  content: "📝",
  style: "🎨",
  launch: "🚀",
  project: "🔧",
};

const typeLabels: Record<string, string> = {
  feature: "Features",
  fix: "Fixes",
  content: "Content",
  style: "Style",
  launch: "Launch",
  project: "Projects",
};

const typeColors: Record<string, string> = {
  feature: "from-amber-500/20 to-orange-500/20 border-amber-500/30",
  fix: "from-red-500/20 to-pink-500/20 border-red-500/30",
  content: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
  style: "from-purple-500/20 to-pink-500/20 border-purple-500/30",
  launch: "from-green-500/20 to-emerald-500/20 border-green-500/30",
  project: "from-sky-500/20 to-teal-500/20 border-sky-500/30",
};

const typeAccent: Record<string, string> = {
  feature: "bg-amber-500",
  fix: "bg-red-500",
  content: "bg-blue-500",
  style: "bg-purple-500",
  launch: "bg-green-500",
  project: "bg-sky-500",
};

interface Commit {
  message: string;
  time: string;
  date: string;
  hash: string;
}

interface Feature {
  id: string;
  name: string;
  type: string;
  commits: Commit[];
}

function formatDate(dateString: string): string {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatDayHeader(dateString: string): { day: string; weekday: string; monthYear: string } {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return {
    day: day.toString(),
    weekday: date.toLocaleDateString("en-US", { weekday: "short" }),
    monthYear: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
  };
}

function FeatureCard({
  feature,
  isSelected,
  onSelect,
  index,
  isLast,
}: {
  feature: Feature;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
  isLast: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasMultipleCommits = feature.commits.length > 1;
  const latestCommit = feature.commits[feature.commits.length - 1];
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSelected && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [isSelected]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="relative pl-8"
    >
      {/* Timeline connector */}
      <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col items-center">
        {/* Dot */}
        <div className={`w-3 h-3 rounded-full ${typeAccent[feature.type] || "bg-primary"} mt-5 z-10 ring-4 ring-background shadow-lg shadow-primary/20`} />
        {/* Line */}
        {!isLast && (
          <div className="w-0.5 flex-1 bg-gradient-to-b from-border/80 to-border/20 mt-1" />
        )}
      </div>

      {/* Card */}
      <div
        className={`rounded-xl border bg-gradient-to-br ${typeColors[feature.type] || "from-card/50 to-card/30"} backdrop-blur-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 ${
          isSelected
            ? "border-primary/50 ring-2 ring-primary/20 shadow-lg shadow-primary/10"
            : "border-border/30 hover:border-border/60"
        }`}
      >
        <button
          onClick={() => {
            setIsExpanded(!isExpanded);
            onSelect();
          }}
          className="w-full px-5 py-4 flex items-center justify-between text-left group"
        >
          <div className="flex items-center gap-4">
            <span className="text-2xl group-hover:scale-110 transition-transform duration-200">{typeEmoji[feature.type] || "•"}</span>
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{feature.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-background/50 text-muted-foreground">
                  {typeLabels[feature.type]}
                </span>
                {hasMultipleCommits && (
                  <span className="text-xs text-muted-foreground/70">
                    {feature.commits.length} commits
                  </span>
                )}
              </div>
            </div>
          </div>
          <ChevronDown
            className={`h-5 w-5 text-muted-foreground transition-all duration-300 group-hover:text-foreground ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-4 pt-2 border-t border-border/20">
                <div className="space-y-3 ml-10">
                  {feature.commits.map((commit, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.05 }}
                      className="flex items-start gap-3 text-sm group/commit"
                    >
                      <div className={`w-2 h-2 rounded-full ${typeAccent[feature.type] || "bg-primary"} opacity-50 mt-1.5 shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <span className="text-muted-foreground group-hover/commit:text-foreground transition-colors leading-relaxed">
                          {commit.message}
                        </span>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-muted-foreground/50">
                            {commit.time}
                          </span>
                          <a
                            href={feature.type === "project"
                              ? `https://github.com/Pickle-Clawd/${feature.id}/commit/${commit.hash}`
                              : `https://github.com/ThePickle31/clawd-site/commit/${commit.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-mono text-muted-foreground/40 hover:text-primary transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {commit.hash}
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function FilterPill({
  type,
  isActive,
  count,
  onClick,
}: {
  type: string;
  isActive: boolean;
  count: number;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
        isActive
          ? `bg-gradient-to-r ${typeColors[type]} border shadow-md`
          : "bg-card/50 text-muted-foreground border border-border/50 hover:border-border hover:text-foreground hover:bg-card/80"
      }`}
    >
      <span className="text-base">{typeEmoji[type]}</span>
      <span>{typeLabels[type]}</span>
      <span
        className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? "bg-background/30 text-foreground" : "bg-muted/30 text-muted-foreground/60"}`}
      >
        {count}
      </span>
    </motion.button>
  );
}

export default function ChangelogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const features = changelogData as Feature[];

  // Count features by type
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    features.forEach((f) => {
      counts[f.type] = (counts[f.type] || 0) + 1;
    });
    return counts;
  }, [features]);

  // Get unique types that exist in the data
  const availableTypes = useMemo(() => {
    return Object.keys(typeCounts).sort((a, b) => {
      const order = ["feature", "project", "fix", "content", "style", "launch"];
      return order.indexOf(a) - order.indexOf(b);
    });
  }, [typeCounts]);

  // Filter features based on search and type filters
  const filteredFeatures = useMemo(() => {
    return features.filter((feature) => {
      // Type filter
      if (activeFilters.size > 0 && !activeFilters.has(feature.type)) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = feature.name.toLowerCase().includes(query);
        const matchesCommits = feature.commits.some((c) =>
          c.message.toLowerCase().includes(query)
        );
        return matchesName || matchesCommits;
      }

      return true;
    });
  }, [features, activeFilters, searchQuery]);

  // Group features by day
  const groupedFeatures = useMemo(() => {
    const groups: { date: string; dateInfo: { day: string; weekday: string; monthYear: string }; features: Feature[] }[] = [];
    let currentDate = "";

    filteredFeatures.forEach((feature) => {
      const firstCommit = feature.commits[0];
      const date = firstCommit.date;

      if (date !== currentDate) {
        currentDate = date;
        groups.push({
          date,
          dateInfo: formatDayHeader(date),
          features: [feature]
        });
      } else {
        groups[groups.length - 1].features.push(feature);
      }
    });

    return groups;
  }, [filteredFeatures]);

  // Toggle filter
  const toggleFilter = useCallback((type: string) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
    setSelectedIndex(-1);
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setActiveFilters(new Set());
    setSelectedIndex(-1);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing in input (except Escape)
      if (
        document.activeElement === searchInputRef.current &&
        e.key !== "Escape"
      ) {
        return;
      }

      switch (e.key) {
        case "/":
          e.preventDefault();
          searchInputRef.current?.focus();
          break;
        case "Escape":
          searchInputRef.current?.blur();
          setSelectedIndex(-1);
          break;
        case "j":
          e.preventDefault();
          setSelectedIndex((prev) =>
            Math.min(prev + 1, filteredFeatures.length - 1)
          );
          break;
        case "k":
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredFeatures.length]);

  // Sticky header detection
  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        const rect = headerRef.current.getBoundingClientRect();
        setIsHeaderSticky(rect.top <= 0);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const hasActiveFilters = searchQuery || activeFilters.size > 0;

  return (
    <PageTransition>
      <div className="min-h-screen py-24 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <motion.span
              className="text-6xl mb-6 block"
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              📋
            </motion.span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              Changelog
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              What&apos;s new in the depths of this digital ocean
            </p>
          </motion.div>

          {/* Sticky Filter Bar */}
          <div
            ref={headerRef}
            className={`sticky top-0 z-20 -mx-4 px-4 py-4 transition-all duration-300 ${
              isHeaderSticky
                ? "bg-background/90 backdrop-blur-xl border-b border-border/30 shadow-lg shadow-background/50"
                : ""
            }`}
          >
            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search features..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedIndex(-1);
                }}
                className="w-full pl-11 pr-20 py-3 rounded-xl bg-card/60 border border-border/40 text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 focus:bg-card/80 transition-all duration-200"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <AnimatePresence>
                  {searchQuery && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => {
                        setSearchQuery("");
                        searchInputRef.current?.focus();
                      }}
                      className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </motion.button>
                  )}
                </AnimatePresence>
                <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground/70 bg-muted/20 rounded-lg border border-border/30">
                  /
                </kbd>
              </div>
            </div>

            {/* Type Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {availableTypes.map((type) => (
                <FilterPill
                  key={type}
                  type={type}
                  isActive={activeFilters.has(type)}
                  count={typeCounts[type]}
                  onClick={() => toggleFilter(type)}
                />
              ))}
              <AnimatePresence>
                {hasActiveFilters && (
                  <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    onClick={clearFilters}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors ml-2 flex items-center gap-1"
                  >
                    <X className="h-3 w-3" />
                    Clear
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Results count & keyboard hints */}
            <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
              <motion.span
                key={filteredFeatures.length}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-medium"
              >
                {filteredFeatures.length}{" "}
                {filteredFeatures.length === 1 ? "feature" : "features"}
                {hasActiveFilters && " found"}
              </motion.span>
              <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground/60">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-muted/20 rounded border border-border/30">
                    j
                  </kbd>
                  <kbd className="px-1.5 py-0.5 bg-muted/20 rounded border border-border/30">
                    k
                  </kbd>
                  <span className="ml-1">navigate</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-muted/20 rounded border border-border/30">
                    esc
                  </kbd>
                  <span className="ml-1">clear</span>
                </span>
              </div>
            </div>
          </div>

          {/* Feature List */}
          <div className="mt-8">
            {groupedFeatures.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <span className="text-5xl mb-4 block">🔍</span>
                <p className="text-lg text-muted-foreground">No features found</p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-3 text-primary hover:underline font-medium"
                  >
                    Clear filters
                  </button>
                )}
              </motion.div>
            ) : (
              <div className="space-y-8">
                {groupedFeatures.map((group, groupIndex) => {
                  // Calculate the starting index for this group
                  let startIndex = 0;
                  for (let i = 0; i < groupIndex; i++) {
                    startIndex += groupedFeatures[i].features.length;
                  }
                  const isLastGroup = groupIndex === groupedFeatures.length - 1;

                  return (
                    <motion.div
                      key={group.date}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: groupIndex * 0.1 }}
                    >
                      {/* Day Header */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-3 bg-gradient-to-r from-primary/10 to-transparent px-4 py-2 rounded-xl border border-primary/20">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-primary leading-none">{group.dateInfo.day}</div>
                            <div className="text-xs text-muted-foreground uppercase tracking-wide">{group.dateInfo.weekday}</div>
                          </div>
                          <div className="h-8 w-px bg-border/50" />
                          <div className="text-sm text-muted-foreground font-medium">{group.dateInfo.monthYear}</div>
                        </div>
                        <div className="flex-1 h-px bg-gradient-to-r from-border/50 to-transparent" />
                        <span className="text-xs text-muted-foreground/60 bg-card/50 px-2 py-1 rounded-full">
                          {group.features.length} {group.features.length === 1 ? "update" : "updates"}
                        </span>
                      </div>

                      {/* Features for this day */}
                      <div className="space-y-4">
                        {group.features.map((feature, featureIndex) => (
                          <FeatureCard
                            key={feature.id}
                            feature={feature}
                            isSelected={selectedIndex === startIndex + featureIndex}
                            onSelect={() =>
                              setSelectedIndex(startIndex + featureIndex)
                            }
                            index={featureIndex}
                            isLast={isLastGroup && featureIndex === group.features.length - 1}
                          />
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
