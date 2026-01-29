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
};

const typeLabels: Record<string, string> = {
  feature: "Features",
  fix: "Fixes",
  content: "Content",
  style: "Style",
  launch: "Launch",
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

function getMonthYear(dateString: string): string {
  const [year, month] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function FeatureCard({
  feature,
  isSelected,
  onSelect,
}: {
  feature: Feature;
  isSelected: boolean;
  onSelect: () => void;
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
    <div
      ref={cardRef}
      className={`rounded-lg border bg-card/30 backdrop-blur-sm overflow-hidden transition-all duration-200 ${
        isSelected
          ? "border-primary/50 ring-1 ring-primary/30"
          : "border-border/50 hover:border-border"
      }`}
    >
      <button
        onClick={() => {
          setIsExpanded(!isExpanded);
          onSelect();
        }}
        className="w-full px-5 py-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{typeEmoji[feature.type] || "•"}</span>
          <div>
            <h3 className="font-medium text-foreground">{feature.name}</h3>
            <p className="text-sm text-muted-foreground">
              {formatDate(latestCommit.date)}
              {hasMultipleCommits && (
                <span className="ml-2 text-xs opacity-60">
                  ({feature.commits.length} commits)
                </span>
              )}
            </p>
          </div>
        </div>
        <ChevronDown
          className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${
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
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 pt-1 border-t border-border/30">
              <div className="space-y-2 ml-8">
                {feature.commits.map((commit, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 text-sm group"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/50 mt-2 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                        {commit.message}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground/60">
                          {formatDate(commit.date)} at {commit.time}
                        </span>
                        <a
                          href={`https://github.com/ThePickle31/clawd-site/commit/${commit.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-mono text-muted-foreground/50 hover:text-primary transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {commit.hash}
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
        isActive
          ? "bg-primary/20 text-primary border border-primary/30"
          : "bg-card/50 text-muted-foreground border border-border/50 hover:border-border hover:text-foreground"
      }`}
    >
      <span>{typeEmoji[type]}</span>
      <span>{typeLabels[type]}</span>
      <span
        className={`text-xs ${isActive ? "text-primary/70" : "text-muted-foreground/60"}`}
      >
        {count}
      </span>
    </button>
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
      const order = ["feature", "fix", "content", "style", "launch"];
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

  // Group features by month
  const groupedFeatures = useMemo(() => {
    const groups: { month: string; features: Feature[] }[] = [];
    let currentMonth = "";

    filteredFeatures.forEach((feature) => {
      const latestCommit = feature.commits[feature.commits.length - 1];
      const month = getMonthYear(latestCommit.date);

      if (month !== currentMonth) {
        currentMonth = month;
        groups.push({ month, features: [feature] });
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
          <div className="text-center mb-8">
            <span className="text-5xl mb-4 block">📋</span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Changelog</h1>
            <p className="text-xl text-muted-foreground">
              What&apos;s new in the depths of this digital ocean
            </p>
          </div>

          {/* Sticky Filter Bar */}
          <div
            ref={headerRef}
            className={`sticky top-0 z-20 -mx-4 px-4 py-4 transition-all duration-200 ${
              isHeaderSticky
                ? "bg-background/80 backdrop-blur-lg border-b border-border/50 shadow-sm"
                : ""
            }`}
          >
            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search features..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedIndex(-1);
                }}
                className="w-full pl-10 pr-20 py-2.5 rounded-lg bg-card/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      searchInputRef.current?.focus();
                    }}
                    className="p-1 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs text-muted-foreground bg-muted/30 rounded border border-border/50">
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
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors ml-2"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Results count & keyboard hints */}
            <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
              <span>
                {filteredFeatures.length}{" "}
                {filteredFeatures.length === 1 ? "feature" : "features"}
                {hasActiveFilters && " found"}
              </span>
              <div className="hidden sm:flex items-center gap-3 text-xs">
                <span>
                  <kbd className="px-1 py-0.5 bg-muted/30 rounded border border-border/50">
                    j
                  </kbd>
                  <kbd className="px-1 py-0.5 bg-muted/30 rounded border border-border/50 ml-0.5">
                    k
                  </kbd>{" "}
                  navigate
                </span>
                <span>
                  <kbd className="px-1 py-0.5 bg-muted/30 rounded border border-border/50">
                    /
                  </kbd>{" "}
                  search
                </span>
              </div>
            </div>
          </div>

          {/* Feature List */}
          <div className="mt-6 space-y-6">
            {groupedFeatures.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-4xl mb-4 block">🔍</span>
                <p className="text-muted-foreground">No features found</p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-2 text-primary hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              groupedFeatures.map((group, groupIndex) => {
                // Calculate the starting index for this group
                let startIndex = 0;
                for (let i = 0; i < groupIndex; i++) {
                  startIndex += groupedFeatures[i].features.length;
                }

                return (
                  <div key={group.month}>
                    {/* Month Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <h2 className="text-sm font-medium text-muted-foreground">
                        {group.month}
                      </h2>
                      <div className="flex-1 h-px bg-border/50" />
                    </div>

                    {/* Features in this month */}
                    <div className="space-y-3">
                      {group.features.map((feature, featureIndex) => (
                        <FeatureCard
                          key={feature.id}
                          feature={feature}
                          isSelected={selectedIndex === startIndex + featureIndex}
                          onSelect={() =>
                            setSelectedIndex(startIndex + featureIndex)
                          }
                        />
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
