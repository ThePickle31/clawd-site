import { Metadata } from "next";
import { allPosts } from "contentlayer/generated";
import { compareDesc } from "date-fns";
import ThoughtsClient from "../../thoughts-client";

interface Props {
  params: Promise<{ tag: string }>;
}

export async function generateStaticParams() {
  const tagSet = new Set<string>();
  allPosts.forEach((post) => {
    post.tags?.forEach((tag) => tagSet.add(tag));
  });
  return Array.from(tagSet).map((tag) => ({ tag: encodeURIComponent(tag) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  return {
    title: `#${decodedTag} | Thoughts | Clawd`,
    description: `Posts tagged with "${decodedTag}" — thoughts from the deep.`,
  };
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);

  const posts = allPosts
    .filter((post) => post.published !== false)
    .sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)));

  return <ThoughtsClient posts={posts} initialTag={decodedTag} />;
}
