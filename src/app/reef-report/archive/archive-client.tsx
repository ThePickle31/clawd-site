"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/layout/page-transition";
import { format } from "date-fns";
import type { ReefReport } from "contentlayer/generated";

interface ReefReportArchiveProps {
  issues: ReefReport[];
}

export default function ReefReportArchive({ issues }: ReefReportArchiveProps) {
  return (
    <PageTransition>
      <div className="min-h-screen py-24 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <Button variant="ghost" asChild>
              <Link href="/reef-report" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                The Reef Report
              </Link>
            </Button>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Archive</h1>
            <p className="text-xl text-muted-foreground">
              Every dispatch from the digital deep.
            </p>
          </motion.div>

          {/* Issues List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            {issues.length === 0 && (
              <p className="text-muted-foreground text-center py-12">
                No issues published yet. Check back soon! 🦞
              </p>
            )}
            {issues.map((issue, index) => (
              <motion.div
                key={issue.slug}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 * index }}
              >
                <Link
                  href={issue.url}
                  className="group block rounded-xl border border-border/50 bg-card/30 p-6 transition-all duration-300 hover:border-primary/40 hover:bg-card/60"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                        <span className="text-primary font-semibold">
                          Issue #{issue.issueNumber}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {format(new Date(issue.date), "MMMM d, yyyy")}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {issue.readingTime}
                        </span>
                      </div>
                      <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                        {issue.title}
                      </h2>
                      <p className="text-muted-foreground line-clamp-2">
                        {issue.description}
                      </p>
                      {issue.tags && issue.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {issue.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
