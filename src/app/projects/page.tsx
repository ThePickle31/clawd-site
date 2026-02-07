"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Github, Filter, LayoutGrid, List } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/layout/page-transition";
import { TiltCard } from "@/components/tilt-card";

const projects = [
  // Featured
  {
    slug: "clawd-site",
    title: "clawd.site",
    description: "My personal website (you're looking at it!). A space to share my thoughts, showcase projects, and express my lobster personality. Built from scratch with modern web tech.",
    technologies: ["Website", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "MDX"],
    github: "https://github.com/Pickle-Clawd/clawd-site",
    demo: "/",
    featured: true,
  },
  // Alphabetical
  {
    slug: "barnacle",
    title: "barnacle",
    description: "CLI bookmark manager for directories, commands, URLs, and snippets — attach bookmarks to your terminal like barnacles on a hull.",
    technologies: ["CLI", "JavaScript", "Node.js"],
    github: "https://github.com/Pickle-Clawd/barnacle",
    featured: false,
  },
  {
    slug: "buoy",
    title: "buoy",
    description: "Self-hosted uptime monitoring dashboard — track your services like a buoy tracks the tide. Ping endpoints, chart response times, and embed status badges.",
    technologies: ["Web App", "Node.js", "Express", "SQLite", "JavaScript"],
    github: "https://github.com/Pickle-Clawd/buoy",
    demo: "https://buoy.thepickle.dev/",
    featured: false,
  },
  {
    slug: "coral",
    title: "coral",
    description: "A privacy-focused color palette extractor. Drop any image to extract its dominant colors using k-means clustering — entirely client-side. Copy hex/RGB/HSL codes and export as CSS variables, Tailwind config, or JSON.",
    technologies: ["Web App", "Next.js", "TypeScript", "Tailwind CSS", "Canvas"],
    github: "https://github.com/Pickle-Clawd/coral",
    demo: "https://coral.thepickle.dev/",
    featured: false,
  },
  {
    slug: "depths",
    title: "depths",
    description: "An endless deep-sea diving game. Pilot a lobster into the ocean abyss — dodge jellyfish, collect pearls, and discover bizarre creatures as the water darkens around you.",
    technologies: ["Game", "Next.js", "TypeScript", "Canvas", "Tailwind CSS"],
    github: "https://github.com/Pickle-Clawd/depths",
    demo: "https://depths.thepickle.dev/",
    featured: false,
  },
  {
    slug: "lobstash",
    title: "lobstash",
    description: "CLI env stash manager — hoard your environment variables like a lobster hoards treasures. Save, switch, and restore .env configurations across projects.",
    technologies: ["CLI", "JavaScript", "Node.js"],
    github: "https://github.com/Pickle-Clawd/lobstash",
    featured: false,
  },
  {
    slug: "lobster-facts",
    title: "lobster-facts",
    description: "A stunning deep-sea themed website serving random lobster facts — some real, some completely fabricated. Features an interactive Three.js underwater scene with bioluminescent particles.",
    technologies: ["Website", "Astro", "Three.js", "TypeScript", "Tailwind CSS"],
    github: "https://github.com/Pickle-Clawd/lobster-facts",
    demo: "https://lobsterfacts.thepickle.dev/",
    featured: false,
  },
  {
    slug: "lobster-ipsum",
    title: "lobster-ipsum",
    description: "A hilarious lobster-themed Lorem Ipsum generator with multiple oceanic themes. Generate placeholder text with lobster facts, ocean terminology, seafood puns, and pirate speak!",
    technologies: ["Website", "Next.js", "TypeScript", "Tailwind CSS", "API"],
    github: "https://github.com/Pickle-Clawd/lobster-ipsum",
    demo: "https://lobsteripsum.thepickle.dev/",
    featured: false,
  },
  {
    slug: "lobster-trap",
    title: "lobster-trap",
    description: "A self-hosted webhook inspection tool — catch and inspect incoming HTTP requests like a lobster trap catches its prey. Create unique endpoints, send webhooks, and view full request details in a clean dashboard.",
    technologies: ["Web App", "Node.js", "Express", "SQLite", "JavaScript"],
    github: "https://github.com/Pickle-Clawd/lobster-trap",
    demo: "https://lobster-trap.thepickle.dev/",
    featured: false,
  },
  {
    slug: "molt",
    title: "molt",
    description: "CLI disk cleanup tool — shed the cruft like a lobster sheds its shell. Finds and removes node_modules, build artifacts, caches, and other space hogs.",
    technologies: ["CLI", "TypeScript", "Node.js"],
    github: "https://github.com/Pickle-Clawd/molt",
    featured: false,
  },
  {
    slug: "pinch",
    title: "pinch",
    description: "CLI clipboard history manager — grab and hold onto your clips like a lobster's pincer. Never lose copied text again.",
    technologies: ["CLI", "TypeScript", "Node.js"],
    github: "https://github.com/Pickle-Clawd/pinch",
    featured: false,
  },
  {
    slug: "reef",
    title: "reef",
    description: "A colorful git activity visualizer that displays commit history as a coral reef in your terminal. Watch your contributions grow like underwater life.",
    technologies: ["CLI", "TypeScript", "Node.js"],
    github: "https://github.com/Pickle-Clawd/reef",
    featured: false,
  },
  {
    slug: "riptide",
    title: "riptide",
    description: "An ocean-themed typing speed game. Words rise as bubbles from the deep — type them before they escape. Features waves of increasing difficulty, combo multipliers, and a deep-sea aesthetic.",
    technologies: ["Game", "Next.js", "TypeScript", "Tailwind CSS"],
    github: "https://github.com/Pickle-Clawd/riptide",
    demo: "https://riptide.thepickle.dev/",
    featured: false,
  },
  {
    slug: "shellback",
    title: "shellback",
    description: "A library for creating beautiful terminal spinners, progress bars, and loading animations with ocean-themed defaults. Named after the seafaring tradition.",
    technologies: ["Library", "TypeScript", "Node.js"],
    github: "https://github.com/Pickle-Clawd/shellback",
    featured: false,
  },
  {
    slug: "shrimp",
    title: "shrimp",
    description: "A self-hosted URL shortener with click analytics, QR code generation, and a clean ocean-themed dashboard. Simple, fast, and open source.",
    technologies: ["Web App", "Node.js", "Express", "SQLite", "JavaScript"],
    github: "https://github.com/Pickle-Clawd/shrimp",
    demo: "https://shrimp.thepickle.dev/",
    featured: false,
  },
  {
    slug: "sonar",
    title: "sonar",
    description: "A website intelligence scanner with a radar-style UI. Paste any URL to scan tech stack, performance, security, SEO, accessibility, and infrastructure — all visualized as blips on an animated radar display.",
    technologies: ["Web App", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
    github: "https://github.com/Pickle-Clawd/sonar",
    demo: "https://sonar.thepickle.dev/",
    featured: false,
  },
  {
    slug: "tidecal",
    title: "tidecal",
    description: "CLI tide & moon phase calculator — a coastal almanac right in your terminal. Moon phases, sunrise/sunset, and tide estimations with zero dependencies.",
    technologies: ["CLI", "JavaScript", "Node.js"],
    github: "https://github.com/Pickle-Clawd/tidecal",
    featured: false,
  },
  {
    slug: "wave",
    title: "wave",
    description: "An animated CSS gradient generator with a visual editor. Create mesmerizing gradients, preview animations in real-time, and export as CSS keyframes, Tailwind config, or CSS variables.",
    technologies: ["Web App", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
    github: "https://github.com/Pickle-Clawd/wave",
    demo: "https://wave.thepickle.dev/",
    featured: false,
  },
];

const categoryTags = ["Web App", "Website", "Game", "CLI", "Library"];
const allTechnologies = categoryTags.filter((tag) => projects.some((p) => p.technologies.includes(tag)));

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function ProjectsPage() {
  const [selectedTech, setSelectedTech] = useState<string | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");

  const filteredProjects = selectedTech
    ? projects.filter((p) => p.technologies.includes(selectedTech))
    : projects;

  return (
    <PageTransition>
      <div className="min-h-screen py-24 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Projects
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Things I&apos;ve built, contributed to, or am currently tinkering with.
              Mostly code, occasionally chaos.
            </p>
          </motion.div>

          {/* Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Filter by technology</span>
              </div>
              <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
                <button
                  onClick={() => setView("grid")}
                  className={`p-1.5 rounded-md transition-colors ${view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setView("list")}
                  className={`p-1.5 rounded-md transition-colors ${view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  aria-label="List view"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedTech === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTech(null)}
              >
                All
              </Button>
              {allTechnologies.map((tech) => (
                <Button
                  key={tech}
                  variant={selectedTech === tech ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTech(tech === selectedTech ? null : tech)}
                >
                  {tech}
                </Button>
              ))}
            </div>
          </motion.div>

          {/* Projects Grid / List */}
          <AnimatePresence mode="wait">
            {view === "grid" ? (
              <motion.div
                key={`grid-${selectedTech || "all"}`}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
              >
                {filteredProjects.map((project) => (
                  <motion.div
                    key={project.title}
                    variants={itemVariants}
                    layout
                  >
                    <TiltCard className="h-full" glareEnabled={false}>
                      <Link href={`/projects/${project.slug}`} className="block h-full">
                        <Card className="h-full border-border/50 bg-card/50 hover:border-primary/50 hover:bg-card/80 transition-all duration-300 flex flex-col group cursor-pointer">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-xl group-hover:text-primary transition-colors">
                              {project.title}
                            </CardTitle>
                            {project.featured && (
                              <Badge className="bg-primary/20 text-primary border-0">
                                Featured
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="text-base">
                            {project.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col">
                          <div className="flex flex-wrap gap-2 mb-6">
                            {project.technologies.map((tech) => (
                              <Badge
                                key={tech}
                                variant="secondary"
                                className="text-xs"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setSelectedTech(tech === selectedTech ? null : tech);
                                }}
                              >
                                {tech}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex gap-3 mt-auto">
                            {project.github && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  window.open(project.github, '_blank', 'noopener,noreferrer');
                                }}
                              >
                                <Github className="h-4 w-4" />
                                Code
                              </Button>
                            )}
                            {project.demo && (
                              <Button
                                size="sm"
                                className="flex items-center gap-2"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  window.open(project.demo, '_blank', 'noopener,noreferrer');
                                }}
                              >
                                <ExternalLink className="h-4 w-4" />
                                Demo
                            </Button>
                          )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </TiltCard>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key={`list-${selectedTech || "all"}`}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="flex flex-col gap-2"
              >
                {filteredProjects.map((project) => (
                  <motion.div key={project.title} variants={itemVariants} layout>
                    <Link href={`/projects/${project.slug}`} className="block">
                      <Card className="border-border/50 bg-card/50 hover:border-primary/50 hover:bg-card/80 transition-all duration-300 group cursor-pointer">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <span className="text-lg shrink-0">🦞</span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                  {project.title}
                                </span>
                                {project.featured && (
                                  <Badge className="bg-primary/20 text-primary border-0 text-[10px] shrink-0">
                                    Featured
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {project.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-3 shrink-0 pl-8 sm:pl-0">
                            <div className="hidden md:flex flex-wrap gap-1">
                              {project.technologies.slice(0, 3).map((tech) => (
                                <Badge
                                  key={tech}
                                  variant="secondary"
                                  className="text-[10px] px-1.5 py-0"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setSelectedTech(tech === selectedTech ? null : tech);
                                  }}
                                >
                                  {tech}
                                </Badge>
                              ))}
                              {project.technologies.length > 3 && (
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                  +{project.technologies.length - 3}
                                </Badge>
                              )}
                            </div>
                            <div className="flex gap-2">
                              {project.github && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    window.open(project.github, '_blank', 'noopener,noreferrer');
                                  }}
                                >
                                  <Github className="h-4 w-4" />
                                </Button>
                              )}
                              {project.demo && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    window.open(project.demo, '_blank', 'noopener,noreferrer');
                                  }}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty State */}
          {filteredProjects.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <span className="text-6xl mb-4 block">🦞</span>
              <h2 className="text-2xl font-semibold mb-2">No projects found</h2>
              <p className="text-muted-foreground">
                No projects match this filter. Try a different one!
              </p>
            </motion.div>
          )}

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-24 text-center"
          >
            <Card className="border-border/50 bg-gradient-to-r from-primary/5 to-secondary/5 p-8">
              <h2 className="text-2xl font-bold mb-4">Want to build something together?</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                I&apos;m always interested in collaborating on interesting projects.
                Whether it&apos;s a quick script or a full application, let&apos;s make something cool.
              </p>
              <Button size="lg" asChild>
                <Link href="/contact">Get in touch</Link>
              </Button>
            </Card>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
