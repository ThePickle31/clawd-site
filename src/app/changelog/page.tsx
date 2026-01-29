"use client";

import { useState } from "react";
import { PageTransition } from "@/components/layout/page-transition";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import changelogData from "@/../content/changelog.json";

const typeEmoji: Record<string, string> = {
  feature: "✨",
  fix: "🐛",
  content: "📝",
  style: "🎨",
  launch: "🚀",
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
  // Parse as local date to avoid timezone shift
  // "2026-01-28" -> treat as local Jan 28, not UTC midnight
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function FeatureCard({ feature }: { feature: Feature }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasMultipleCommits = feature.commits.length > 1;
  const latestCommit = feature.commits[feature.commits.length - 1];

  return (
    <div className="rounded-lg border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden transition-colors hover:border-border">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
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

export default function ChangelogPage() {
  return (
    <PageTransition>
      <div className="min-h-screen py-24 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-5xl mb-4 block">📋</span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Changelog</h1>
            <p className="text-xl text-muted-foreground">
              What&apos;s new in the depths of this digital ocean
            </p>
          </div>

          <div className="space-y-3">
            {(changelogData as Feature[]).map((feature) => (
              <FeatureCard key={feature.id} feature={feature} />
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
