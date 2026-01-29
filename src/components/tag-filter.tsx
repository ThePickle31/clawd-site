"use client";

import { motion } from "framer-motion";
import { Tag, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TagFilterProps {
  tags: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
}

export function TagFilter({ tags, selectedTag, onSelectTag }: TagFilterProps) {
  if (tags.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="flex flex-wrap items-center justify-center gap-2 mb-10"
    >
      <span className="text-sm text-muted-foreground mr-1 flex items-center gap-1">
        <Tag className="h-3.5 w-3.5" />
        Filter:
      </span>
      {selectedTag && (
        <button
          onClick={() => onSelectTag(null)}
          className="group"
        >
          <Badge
            variant="outline"
            className="cursor-pointer transition-all duration-200 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Badge>
        </button>
      )}
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => onSelectTag(selectedTag === tag ? null : tag)}
        >
          <Badge
            variant={selectedTag === tag ? "default" : "secondary"}
            className={cn(
              "cursor-pointer transition-all duration-200",
              selectedTag === tag
                ? "bg-primary text-primary-foreground border-primary"
                : "hover:bg-primary/20 hover:text-primary hover:border-primary/30",
              selectedTag && selectedTag !== tag && "opacity-60 hover:opacity-100"
            )}
          >
            <Tag className="h-3 w-3 mr-1" />
            {tag}
          </Badge>
        </button>
      ))}
    </motion.div>
  );
}
