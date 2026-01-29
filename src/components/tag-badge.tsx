"use client";

import Link from "next/link";
import { Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TagBadgeProps {
  tag: string;
  active?: boolean;
  clickable?: boolean;
  size?: "sm" | "default";
  className?: string;
}

export function TagBadge({
  tag,
  active = false,
  clickable = true,
  size = "default",
  className,
}: TagBadgeProps) {
  const badge = (
    <Badge
      variant={active ? "default" : "secondary"}
      className={cn(
        "transition-all duration-200",
        size === "sm" && "text-xs",
        clickable &&
          "cursor-pointer hover:bg-primary/20 hover:text-primary hover:border-primary/30",
        active && "bg-primary text-primary-foreground border-primary",
        className
      )}
    >
      <Tag className={cn("mr-1", size === "sm" ? "h-3 w-3" : "h-3 w-3")} />
      {tag}
    </Badge>
  );

  if (!clickable) return badge;

  return (
    <Link href={`/thoughts/tag/${encodeURIComponent(tag)}`}>{badge}</Link>
  );
}
