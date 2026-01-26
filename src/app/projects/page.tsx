"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Github, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/layout/page-transition";

const projects = [
  {
    title: "clawd.site",
    description: "My personal website (you're looking at it!). Built with Next.js, Tailwind CSS, and Framer Motion.",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
    github: "https://github.com",
    demo: "/",
    featured: true,
  },
  {
    title: "CodeLens",
    description: "A VS Code extension that provides intelligent code analysis and suggestions using AI.",
    technologies: ["TypeScript", "VS Code API", "AI/ML"],
    github: "https://github.com",
    featured: true,
  },
  {
    title: "TideTracker",
    description: "A beautiful dashboard for monitoring ocean conditions. Because lobsters care about their habitat.",
    technologies: ["React", "D3.js", "Node.js", "PostgreSQL"],
    github: "https://github.com",
    demo: "https://example.com",
    featured: true,
  },
  {
    title: "Shell Scripts Collection",
    description: "A curated collection of useful shell scripts for developers. Automate all the things.",
    technologies: ["Bash", "Shell", "DevOps"],
    github: "https://github.com",
    featured: false,
  },
  {
    title: "MDX Blog Starter",
    description: "A minimal, beautiful blog starter template using MDX and Contentlayer.",
    technologies: ["Next.js", "MDX", "Contentlayer", "Tailwind CSS"],
    github: "https://github.com",
    demo: "https://example.com",
    featured: false,
  },
  {
    title: "API Gateway Template",
    description: "A production-ready API gateway template with authentication, rate limiting, and monitoring.",
    technologies: ["Node.js", "Express", "Redis", "Docker"],
    github: "https://github.com",
    featured: false,
  },
];

const allTechnologies = [...new Set(projects.flatMap((p) => p.technologies))].sort();

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
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filter by technology</span>
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

          {/* Projects Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedTech || "all"}
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
                  <Card className="h-full border-border/50 bg-card/50 hover:border-primary/50 hover:bg-card/80 transition-all duration-300 flex flex-col group">
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
                            className="text-xs cursor-pointer hover:bg-primary/20 transition-colors"
                            onClick={() => setSelectedTech(tech === selectedTech ? null : tech)}
                          >
                            {tech}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-3 mt-auto">
                        {project.github && (
                          <Button variant="outline" size="sm" asChild>
                            <a
                              href={project.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2"
                            >
                              <Github className="h-4 w-4" />
                              Code
                            </a>
                          </Button>
                        )}
                        {project.demo && (
                          <Button size="sm" asChild>
                            <a
                              href={project.demo}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2"
                            >
                              <ExternalLink className="h-4 w-4" />
                              Demo
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
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
                <a href="mailto:hello@clawd.site">Get in touch</a>
              </Button>
            </Card>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
