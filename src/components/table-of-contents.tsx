"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { List, ChevronDown } from "lucide-react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Extract headings from the DOM after MDX renders
  useEffect(() => {
    // Small delay to ensure MDX content is rendered
    const timer = setTimeout(() => {
      const article = document.querySelector("article");
      if (!article) return;

      const elements = article.querySelectorAll("h2, h3");
      const items: TocItem[] = Array.from(elements)
        .filter((el) => el.id) // rehype-slug adds ids
        .map((el) => ({
          id: el.id,
          text: el.textContent?.replace(/\s*#\s*$/, "") || "",
          level: el.tagName === "H2" ? 2 : 3,
        }));

      setHeadings(items);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Set up intersection observer to track active heading
  useEffect(() => {
    if (headings.length < 2) return;

    observerRef.current?.disconnect();

    const headingElements = headings
      .map(({ id }) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (headingElements.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Find the first heading that is intersecting (visible)
        const visibleEntries = entries.filter((e) => e.isIntersecting);
        if (visibleEntries.length > 0) {
          setActiveId(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: "-80px 0px -60% 0px",
        threshold: 0,
      }
    );

    headingElements.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, [headings]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      e.preventDefault();
      const el = document.getElementById(id);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top, behavior: "smooth" });
        setActiveId(id);
        setIsOpen(false);
      }
    },
    []
  );

  // Don't render if fewer than 2 headings
  if (headings.length < 2) return null;

  return (
    <>
      {/* Desktop: sticky sidebar */}
      <nav
        aria-label="Table of contents"
        className="hidden xl:block fixed top-32 right-[max(1rem,calc((100vw-48rem)/2-18rem))] w-56 max-h-[calc(100vh-10rem)] overflow-y-auto"
      >
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-3 flex items-center gap-1.5">
            <List className="h-3.5 w-3.5" />
            On this page
          </p>
          <ul className="space-y-1 border-l border-border/50">
            {headings.map((heading) => (
              <li key={heading.id}>
                <a
                  href={`#${heading.id}`}
                  onClick={(e) => handleClick(e, heading.id)}
                  className={`block text-sm py-1 transition-colors duration-200 border-l-2 -ml-px ${
                    heading.level === 3 ? "pl-5" : "pl-3"
                  } ${
                    activeId === heading.id
                      ? "border-primary text-primary font-medium"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-foreground/30"
                  }`}
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        </motion.div>
      </nav>

      {/* Mobile: collapsible inline TOC */}
      <div className="xl:hidden mb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 text-sm font-semibold text-primary w-full py-2 px-3 rounded-lg bg-card/50 border border-border/50 hover:bg-card transition-colors"
          >
            <List className="h-4 w-4" />
            <span>On this page</span>
            <ChevronDown
              className={`h-4 w-4 ml-auto transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          <AnimatePresence>
            {isOpen && (
              <motion.ul
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-1 space-y-0.5 overflow-hidden rounded-lg bg-card/50 border border-border/50 py-2"
              >
                {headings.map((heading) => (
                  <li key={heading.id}>
                    <a
                      href={`#${heading.id}`}
                      onClick={(e) => handleClick(e, heading.id)}
                      className={`block text-sm py-1.5 transition-colors ${
                        heading.level === 3 ? "pl-7" : "pl-4"
                      } ${
                        activeId === heading.id
                          ? "text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {heading.text}
                    </a>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
}
