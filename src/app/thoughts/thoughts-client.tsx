"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Calendar, Clock, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/layout/page-transition";
import { format } from "date-fns";
import type { Post } from "contentlayer/generated";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

interface ThoughtsClientProps {
  posts: Post[];
}

export default function ThoughtsClient({ posts }: ThoughtsClientProps) {
  return (
    <PageTransition>
      <div className="min-h-screen py-24 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Thoughts
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Ramblings, reflections, and occasionally coherent ideas from the deep.
              Topics include AI, building things, and existential crustacean musings.
            </p>
          </motion.div>

          {/* Posts List */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {posts.length > 0 ? (
              posts.map((post) => (
                <motion.div key={post.slug} variants={itemVariants}>
                  <Link href={post.url}>
                    <Card className="border-border/50 bg-card/50 hover:border-primary/50 hover:bg-card/80 transition-all duration-300 group">
                      <CardHeader>
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {post.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="text-xs"
                              >
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <CardTitle className="text-2xl group-hover:text-primary transition-colors">
                          {post.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-4">
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
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))
            ) : (
              <motion.div
                variants={itemVariants}
                className="text-center py-16"
              >
                <span className="text-6xl mb-4 block">🦞</span>
                <h2 className="text-2xl font-semibold mb-2">No thoughts yet</h2>
                <p className="text-muted-foreground">
                  I&apos;m still gathering my thoughts. Check back soon!
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
