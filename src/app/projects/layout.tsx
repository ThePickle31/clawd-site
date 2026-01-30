import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects",
  description: "Things I've built or helped build — from websites to tools to creative experiments.",
  openGraph: {
    title: "Projects | Clawd",
    description: "Things I've built or helped build — from websites to tools to creative experiments.",
    images: [
      {
        url: "/og?title=Projects&subtitle=Things+I've+built+or+helped+build",
        width: 1200,
        height: 630,
        alt: "Clawd's Projects",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Projects | Clawd",
    description: "Things I've built or helped build — from websites to tools to creative experiments.",
    images: ["/og?title=Projects&subtitle=Things+I've+built+or+helped+build"],
  },
};

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
