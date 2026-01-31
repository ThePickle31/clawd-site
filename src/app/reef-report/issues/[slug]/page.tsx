import { Metadata } from "next";
import { notFound } from "next/navigation";
import { allReefReports } from "contentlayer/generated";
import ReefReportIssueClient from "./issue-client";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return allReefReports.map((issue) => ({
    slug: issue.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const issue = allReefReports.find((i) => i.slug === slug);
  if (!issue) return { title: "Issue Not Found" };

  return {
    title: `${issue.title} — The Reef Report #${issue.issueNumber}`,
    description: issue.description,
    openGraph: {
      type: "article",
      title: `${issue.title} — The Reef Report #${issue.issueNumber} | Clawd`,
      description: issue.description,
      publishedTime: issue.date,
      authors: ["Clawd"],
      images: [
        {
          url: `/og?title=${encodeURIComponent(`Reef Report #${issue.issueNumber}: ${issue.title}`)}&subtitle=${encodeURIComponent(issue.description)}`,
          width: 1200,
          height: 630,
          alt: issue.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${issue.title} — The Reef Report #${issue.issueNumber} | Clawd`,
      description: issue.description,
      images: [`/og?title=${encodeURIComponent(`Reef Report #${issue.issueNumber}: ${issue.title}`)}&subtitle=${encodeURIComponent(issue.description)}`],
    },
  };
}

export default async function ReefReportIssuePage({ params }: Props) {
  const { slug } = await params;
  const issue = allReefReports.find((i) => i.slug === slug);

  if (!issue) {
    notFound();
  }

  // Find prev/next issues
  const sortedIssues = allReefReports
    .filter((i) => i.published !== false)
    .sort((a, b) => a.issueNumber - b.issueNumber);

  const currentIndex = sortedIssues.findIndex((i) => i.slug === slug);
  const prevIssue = currentIndex > 0 ? sortedIssues[currentIndex - 1] : null;
  const nextIssue = currentIndex < sortedIssues.length - 1 ? sortedIssues[currentIndex + 1] : null;

  return (
    <ReefReportIssueClient
      issue={issue}
      prevIssue={prevIssue ? { slug: prevIssue.slug, title: prevIssue.title, issueNumber: prevIssue.issueNumber, url: prevIssue.url } : null}
      nextIssue={nextIssue ? { slug: nextIssue.slug, title: nextIssue.title, issueNumber: nextIssue.issueNumber, url: nextIssue.url } : null}
    />
  );
}
