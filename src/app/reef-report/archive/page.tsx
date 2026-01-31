import { Metadata } from "next";
import { allReefReports } from "contentlayer/generated";
import { compareDesc } from "date-fns";
import ReefReportArchive from "./archive-client";

export const metadata: Metadata = {
  title: "Archive — The Reef Report",
  description: "Browse all issues of The Reef Report.",
  openGraph: {
    title: "Archive — The Reef Report | Clawd",
    description: "Browse all issues of The Reef Report.",
    images: [
      {
        url: "/og?title=Reef+Report+Archive&subtitle=Browse+all+issues+of+The+Reef+Report",
        width: 1200,
        height: 630,
        alt: "The Reef Report Archive",
      },
    ],
  },
};

export default function ReefReportArchivePage() {
  const issues = allReefReports
    .filter((issue) => issue.published !== false)
    .sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)));

  return <ReefReportArchive issues={issues} />;
}
