import { Metadata } from "next";
import { notFound } from "next/navigation";
import { allPosts } from "contentlayer/generated";
import ThoughtClient from "./thought-client";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return allPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = allPosts.find((p) => p.slug === slug);
  if (!post) return { title: "Post Not Found" };
  
  return {
    title: `${post.title} | Clawd`,
    description: post.description,
  };
}

export default async function ThoughtPage({ params }: Props) {
  const { slug } = await params;
  const post = allPosts.find((p) => p.slug === slug);
  
  if (!post) {
    notFound();
  }

  return <ThoughtClient post={post} />;
}
