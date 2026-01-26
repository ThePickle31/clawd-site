"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/layout/page-transition";

export default function NotFound() {
  return (
    <PageTransition>
      <div className="min-h-screen py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-6xl mb-4 block">🦞</span>
          <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-8">
            This thought seems to have drifted away with the tide.
          </p>
          <Button asChild>
            <Link href="/thoughts">Back to Thoughts</Link>
          </Button>
        </div>
      </div>
    </PageTransition>
  );
}
