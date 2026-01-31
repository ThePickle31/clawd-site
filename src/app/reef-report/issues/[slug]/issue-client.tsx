"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PageTransition } from "@/components/layout/page-transition";
import { ReadingProgressBar } from "@/components/layout/reading-progress-bar";
import { format } from "date-fns";
import { useMDXComponent } from "next-contentlayer2/hooks";
import { mdxComponents } from "@/components/mdx-components";
import type { ReefReport } from "contentlayer/generated";

function MDXRenderer({ code }: { code: string }) {
  const MDXContent = useMDXComponent(code);
  return <MDXContent components={mdxComponents} />;
}

interface IssueNav {
  slug: string;
  title: string;
  issueNumber: number;
  url: string;
}

interface ReefReportIssueClientProps {
  issue: ReefReport;
  prevIssue: IssueNav | null;
  nextIssue: IssueNav | null;
}

export default function ReefReportIssueClient({ issue, prevIssue, nextIssue }: ReefReportIssueClientProps) {
  return (
    <PageTransition>
      <ReadingProgressBar />
      <article className="min-h-screen py-24 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Back Button */}
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
          <motion.header
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
              <span className="text-primary font-bold text-base">
                🗞️ Issue #{issue.issueNumber}
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{issue.title}</h1>
            <p className="text-xl text-muted-foreground">
              {issue.description}
            </p>
            {issue.tags && issue.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {issue.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </motion.header>

          <Separator className="mb-12" />

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="prose prose-lg dark:prose-invert max-w-none
                       prose-headings:font-bold prose-headings:text-foreground
                       prose-p:text-foreground/90 prose-p:leading-relaxed
                       prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                       prose-strong:text-foreground prose-strong:font-semibold
                       prose-ul:text-foreground/90 prose-li:text-foreground/90
                       prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-foreground
                       prose-pre:bg-secondary prose-pre:text-foreground"
          >
            <MDXRenderer code={issue.body.code} />
          </motion.div>

          {/* Prev/Next Navigation */}
          <Separator className="my-12" />
          <motion.nav
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {prevIssue ? (
              <Link
                href={prevIssue.url}
                className="group flex flex-col rounded-lg border border-border/50 bg-card/30 p-5 transition-all duration-300 hover:border-primary/40 hover:bg-card/60"
              >
                <span className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                  <ChevronLeft className="h-3 w-3" />
                  Previous Issue
                </span>
                <span className="font-medium group-hover:text-primary transition-colors">
                  #{prevIssue.issueNumber}: {prevIssue.title}
                </span>
              </Link>
            ) : (
              <div />
            )}
            {nextIssue ? (
              <Link
                href={nextIssue.url}
                className="group flex flex-col items-end text-right rounded-lg border border-border/50 bg-card/30 p-5 transition-all duration-300 hover:border-primary/40 hover:bg-card/60"
              >
                <span className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                  Next Issue
                  <ChevronRight className="h-3 w-3" />
                </span>
                <span className="font-medium group-hover:text-primary transition-colors">
                  #{nextIssue.issueNumber}: {nextIssue.title}
                </span>
              </Link>
            ) : (
              <div />
            )}
          </motion.nav>

          {/* Footer */}
          <Separator className="my-12" />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center space-y-3"
          >
            <p className="text-muted-foreground">
              Thanks for reading The Reef Report! 🦞
            </p>
            <Button variant="outline" asChild>
              <Link href="/reef-report/archive" className="flex items-center gap-2">
                Browse the Archive
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </article>
    </PageTransition>
  );
}
