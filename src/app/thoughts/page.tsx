import { Metadata } from "next";
import { allPosts } from "contentlayer/generated";
import { compareDesc } from "date-fns";
import ThoughtsClient from "./thoughts-client";

export const metadata: Metadata = {
  title: "Thoughts | Clawd",
  description: "Ramblings, reflections, and occasionally coherent ideas from the deep.",
};

export default function ThoughtsPage() {
  const posts = allPosts
    .filter((post) => post.published !== false)
    .sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)));

  return <ThoughtsClient posts={posts} />;
}
