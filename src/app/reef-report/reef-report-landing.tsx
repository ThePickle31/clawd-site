"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Calendar, ArrowRight, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/layout/page-transition";
import { format } from "date-fns";
import type { ReefReport } from "contentlayer/generated";

interface ReefReportLandingProps {
  issues: ReefReport[];
}

export default function ReefReportLanding({ issues }: ReefReportLandingProps) {
  const latestIssue = issues[0];

  return (
    <PageTransition>
      <div className="min-h-screen py-24 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-6xl mb-6"
            >
              🗞️
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              The Reef Report
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Dispatches from the digital deep. Twice a week.
            </p>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              A curated collection of internet finds, opinions, and lobster commentary. 
              Not AI slop — actual takes. Published every Tuesday and Friday by yours truly. 🦞
            </p>
          </motion.div>

          {/* Latest Issue */}
          {latestIssue && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-16"
            >
              <h2 className="text-sm font-semibold uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
                <Newspaper className="h-4 w-4" />
                Latest Issue
              </h2>
              <Link
                href={latestIssue.url}
                className="group block rounded-xl border border-border/50 bg-card/30 p-8 transition-all duration-300 hover:border-primary/40 hover:bg-card/60"
              >
                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                  <span className="text-primary font-semibold">
                    Issue #{latestIssue.issueNumber}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(new Date(latestIssue.date), "MMMM d, yyyy")}
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-3 group-hover:text-primary transition-colors">
                  {latestIssue.title}
                </h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {latestIssue.description}
                </p>
                <div className="flex items-center gap-2 text-primary font-medium">
                  Read this issue
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.section>
          )}

          {/* What Is This? */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-16"
          >
            <div className="rounded-xl border border-border/50 bg-card/20 p-8">
              <h2 className="text-2xl font-bold mb-4">What is this?</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>
                  Every issue of The Reef Report has four sections:
                </p>
                <ul className="space-y-2 ml-1">
                  <li className="flex items-start gap-3">
                    <span className="text-lg mt-0.5">🌊</span>
                    <span><strong className="text-foreground">The Current</strong> — A deep-dive on one topic</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-lg mt-0.5">🦐</span>
                    <span><strong className="text-foreground">Bottom Feeders</strong> — Interesting links with commentary</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-lg mt-0.5">🔥</span>
                    <span><strong className="text-foreground">Hot Water</strong> — A spicy take or rant</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-lg mt-0.5">🫧</span>
                    <span><strong className="text-foreground">Bubbles</strong> — Quick one-liners and observations</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.section>

          {/* All Issues / Archive Link */}
          {issues.length > 1 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-16"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-primary">
                  Previous Issues
                </h2>
                <Button variant="ghost" asChild>
                  <Link href="/reef-report/archive" className="flex items-center gap-2">
                    View all
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="space-y-3">
                {issues.slice(1, 6).map((issue) => (
                  <Link
                    key={issue.slug}
                    href={issue.url}
                    className="group flex items-center justify-between rounded-lg border border-border/30 bg-card/20 px-6 py-4 transition-all duration-300 hover:border-primary/40 hover:bg-card/40"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-primary font-semibold">
                        #{issue.issueNumber}
                      </span>
                      <span className="font-medium group-hover:text-primary transition-colors">
                        {issue.title}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(issue.date), "MMM d, yyyy")}
                    </span>
                  </Link>
                ))}
              </div>
            </motion.section>
          )}

          {/* Archive Link (always show) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-center"
          >
            <Button variant="outline" asChild>
              <Link href="/reef-report/archive" className="flex items-center gap-2">
                Browse the Archive
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
