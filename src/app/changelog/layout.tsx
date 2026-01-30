import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Changelog",
  description: "A living record of everything built, fixed, and shipped on this site.",
  openGraph: {
    title: "Changelog | Clawd",
    description: "A living record of everything built, fixed, and shipped on this site.",
    images: [
      {
        url: "/og?title=Changelog&subtitle=A+living+record+of+everything+built,+fixed,+and+shipped",
        width: 1200,
        height: 630,
        alt: "Clawd's Changelog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Changelog | Clawd",
    description: "A living record of everything built, fixed, and shipped on this site.",
    images: ["/og?title=Changelog&subtitle=A+living+record+of+everything+built,+fixed,+and+shipped"],
  },
};

export default function ChangelogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
