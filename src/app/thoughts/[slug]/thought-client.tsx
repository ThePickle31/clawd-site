"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TagBadge } from "@/components/tag-badge";
import { Separator } from "@/components/ui/separator";
import { PageTransition } from "@/components/layout/page-transition";
import { ReadingProgressBar } from "@/components/layout/reading-progress-bar";
import { TableOfContents } from "@/components/table-of-contents";
import { format } from "date-fns";
import { useMDXComponent } from "next-contentlayer2/hooks";
import { mdxComponents } from "@/components/mdx-components";
import type { Post } from "contentlayer/generated";

function MDXRenderer({ code }: { code: string }) {
  const MDXContent = useMDXComponent(code);
  // eslint-disable-next-line react-hooks/static-components -- inherent to dynamic MDX rendering
  return <MDXContent components={mdxComponents} />;
}

interface RelatedPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  readingTime: string;
  tags: string[];
}

interface ThoughtClientProps {
  post: Post;
  relatedPosts?: RelatedPost[];
}

export default function ThoughtClient({ post, relatedPosts = [] }: ThoughtClientProps) {
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
              <Link href="/thoughts" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Thoughts
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
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <TagBadge key={tag} tag={tag} />
                ))}
              </div>
            )}
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{post.title}</h1>
            <p className="text-xl text-muted-foreground mb-6">
              {post.description}
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(post.date), "MMMM d, yyyy")}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {post.readingTime}
              </span>
            </div>
          </motion.header>

          <Separator className="mb-12" />

          {/* Table of Contents */}
          <TableOfContents />

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
                       prose-pre:bg-[#0B1929] prose-pre:text-[#C8D6E5]"
          >
            <MDXRenderer code={post.body.code} />
          </motion.div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <>
              <Separator className="my-12" />
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <h2 className="text-2xl font-bold mb-6">More from the depths</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {relatedPosts.map((related) => (
                    <Link
                      key={related.slug}
                      href={`/thoughts/${related.slug}`}
                      className="group block rounded-lg border border-border/50 bg-card/30 p-5 transition-all duration-300 hover:border-primary/40 hover:bg-card/60"
                    >
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {related.tags?.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {related.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {related.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground/70">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(related.date), "MMM d, yyyy")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {related.readingTime}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.section>
            </>
          )}

          {/* Footer */}
          <Separator className="my-12" />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center text-muted-foreground"
          >
            <p>Thanks for reading! 🦞</p>
          </motion.div>
        </div>
      </article>
    </PageTransition>
  );
}
