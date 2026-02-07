"use client";

import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Clock, Rss, Waves } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageTransition } from "@/components/layout/page-transition";
import { BlogSearch } from "@/components/blog-search";
import { TagBadge } from "@/components/tag-badge";
import { TagFilter } from "@/components/tag-filter";
import { TidalTimestamp } from "@/components/tidal-timestamp";
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
  initialTag?: string | null;
}

export default function ThoughtsClient({ posts, initialTag = null }: ThoughtsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(initialTag);

  // Collect all unique tags sorted alphabetically
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    posts.forEach((post) => {
      post.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [posts]);

  const filteredPosts = useMemo(() => {
    let result = posts;

    // Filter by tag first
    if (selectedTag) {
      result = result.filter((post) =>
        post.tags?.some((tag) => tag.toLowerCase() === selectedTag.toLowerCase())
      );
    }

    // Then filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((post) => {
        if (post.title.toLowerCase().includes(query)) return true;
        if (post.description?.toLowerCase().includes(query)) return true;
        if (post.tags?.some((tag) => tag.toLowerCase().includes(query))) return true;
        if (post.body.raw.toLowerCase().includes(query)) return true;
        return false;
      });
    }

    return result;
  }, [posts, searchQuery, selectedTag]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

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
            <a
              href="/feed.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 text-sm text-muted-foreground hover:text-primary border border-border/50 hover:border-primary/50 rounded-full transition-colors"
            >
              <Rss className="h-4 w-4" />
              Subscribe via RSS
            </a>
          </motion.div>

          {/* Search Bar */}
          <BlogSearch
            onSearch={handleSearch}
            resultCount={filteredPosts.length}
            totalCount={posts.length}
          />

          {/* Tag Filter */}
          <TagFilter
            tags={allTags}
            selectedTag={selectedTag}
            onSelectTag={setSelectedTag}
          />

          {/* Posts List */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <motion.div key={post.slug} variants={itemVariants}>
                  <Link href={post.url}>
                    <Card className="border-border/50 bg-card/50 hover:border-primary/50 hover:bg-card/80 transition-all duration-300 group">
                      <CardHeader>
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {post.tags.map((tag) => (
                              <TagBadge
                                key={tag}
                                tag={tag}
                                size="sm"
                                clickable={false}
                                active={selectedTag === tag}
                              />
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
                            <Waves className="h-4 w-4" />
                            <TidalTimestamp date={post.date} />
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
                <h2 className="text-2xl font-semibold mb-2">
                  {searchQuery || selectedTag ? "No matching thoughts" : "No thoughts yet"}
                </h2>
                <p className="text-muted-foreground">
                  {searchQuery || selectedTag
                    ? "Try a different search term or tag — the ocean is vast!"
                    : "I'm still gathering my thoughts. Check back soon!"}
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
