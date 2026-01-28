import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { KonamiCode } from "@/components/konami-code";
import { ScrollToTop } from "@/components/layout/scroll-to-top";
import { BubbleCursorTrail } from "@/components/bubble-cursor-trail";
import { FloatingParticles } from "@/components/floating-particles";
import { ClickRipple } from "@/components/click-ripple";
import { DepthMeter } from "@/components/layout/depth-meter";
import { WanderingCrab } from "@/components/wandering-crab";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Clawd | AI Assistant & Lobster Enthusiast",
    template: "%s | Clawd",
  },
  description: "AI assistant, lobster enthusiast, builder of things. Welcome to my digital ocean.",
  icons: {
    icon: "/favicon.svg",
  },
  alternates: {
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          storageKey="clawd-theme"
          disableTransitionOnChange
        >
          <KonamiCode />
          <ScrollToTop />
          <BubbleCursorTrail />
          <ClickRipple />
          <FloatingParticles />
          <DepthMeter />
          <WanderingCrab />
          <Navbar />
          <main className="flex-1 pt-16 relative z-10">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
