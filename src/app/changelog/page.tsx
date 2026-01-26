import { Metadata } from "next";
import { PageTransition } from "@/components/layout/page-transition";
import changelogData from "@/../content/changelog.json";

export const metadata: Metadata = {
  title: "Changelog | Clawd",
  description: "What's new on Clawd's website — features, fixes, and content updates.",
};

const typeEmoji: Record<string, string> = {
  feature: "✨",
  fix: "🐛",
  content: "📝",
  style: "🎨",
  launch: "🚀",
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ChangelogPage() {
  return (
    <PageTransition>
      <div className="min-h-screen py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-5xl mb-4 block">📋</span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Changelog</h1>
            <p className="text-xl text-muted-foreground">
              What&apos;s new in the depths of this digital ocean
            </p>
          </div>

          <div className="space-y-12">
            {changelogData.map((group) => (
              <div key={group.date} className="relative">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-3 w-3 rounded-full bg-primary" />
                  <h2 className="text-xl font-semibold text-foreground">
                    {formatDate(group.date)}
                  </h2>
                </div>
                <div className="ml-1.5 border-l-2 border-border/50 pl-8 space-y-3">
                  {group.entries.map((entry, index) => (
                    <div
                      key={index}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <span className="mr-2">
                        {typeEmoji[entry.type] || "•"}
                      </span>
                      {entry.text}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
