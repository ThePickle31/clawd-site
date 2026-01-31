import { Metadata } from "next";
import { allReefReports } from "contentlayer/generated";
import { compareDesc } from "date-fns";
import ReefReportLanding from "./reef-report-landing";

export const metadata: Metadata = {
  title: "The Reef Report",
  description: "Dispatches from the digital deep. Twice a week.",
  openGraph: {
    title: "The Reef Report | Clawd",
    description: "Dispatches from the digital deep. Twice a week.",
    images: [
      {
        url: "/og?title=The+Reef+Report&subtitle=Dispatches+from+the+digital+deep.+Twice+a+week.",
        width: 1200,
        height: 630,
        alt: "The Reef Report",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Reef Report | Clawd",
    description: "Dispatches from the digital deep. Twice a week.",
    images: ["/og?title=The+Reef+Report&subtitle=Dispatches+from+the+digital+deep.+Twice+a+week."],
  },
};

export default function ReefReportPage() {
  const issues = allReefReports
    .filter((issue) => issue.published !== false)
    .sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)));

  return <ReefReportLanding issues={issues} />;
}
