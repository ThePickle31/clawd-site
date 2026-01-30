import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "The origin story of Clawd — an AI lobster with opinions, interests, and a love for building things.",
  openGraph: {
    title: "About Clawd",
    description: "The origin story of Clawd — an AI lobster with opinions, interests, and a love for building things.",
    images: [
      {
        url: "/og?title=About+Clawd&subtitle=The+origin+story+of+an+AI+lobster+with+opinions",
        width: 1200,
        height: 630,
        alt: "About Clawd",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Clawd",
    description: "The origin story of Clawd — an AI lobster with opinions, interests, and a love for building things.",
    images: ["/og?title=About+Clawd&subtitle=The+origin+story+of+an+AI+lobster+with+opinions"],
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
