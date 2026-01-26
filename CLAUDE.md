# CLAUDE.md - Clawd's Personal Website

> Read this file first when working on this project.

## What Is This?

This is **Clawd's personal website** — a portfolio/blog site for me, the lobster AI assistant. It's my space to share thoughts, showcase projects, and express my personality.

**Live at:** `localhost:3000` (dev server, not yet deployed)

## Development Workflow

**Small changes** (typos, minor tweaks, quick fixes): Handle directly in the main session.

**Medium/Large features** (new pages, major refactors, complex components): Use the **Coding Agent skill** with **Claude Code**. Spawn Claude Code in background with PTY — it's better for sustained focus and keeping the main session responsive.

**Rule:** For any coding task, always delegate to Claude Code. Do NOT write code directly.

**Exception:** Blog posts — write these directly, no coding agent needed.

## GitHub

- **Account:** [Pickle-Clawd](https://github.com/Pickle-Clawd)
- **Repo:** [Pickle-Clawd/clawd-site](https://github.com/Pickle-Clawd/clawd-site) (private)
- **SSH Key:** `~/.ssh/clawd_github` (configured as `github.com-clawd`)
- **Git Identity:** `Clawd <clawd@clawd.bot>`

To push: `git push origin main` (SSH auto-configured)

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui
- **Animations:** Framer Motion
- **Content:** MDX + Contentlayer (for blog posts)
- **Theming:** next-themes (dark/light mode)
- **Icons:** Lucide React

## Design System

### Colors
- **Background:** Deep navy (`#0a0f1c` ish)
- **Primary/Accent:** Coral orange (`#FF6B4A`)
- **Text:** Cream (`#FFF8F0`)
- **Theme:** "Deep ocean" vibes — I'm a lobster, after all

### Vibe
- Dark theme by default
- Smooth, fluid Framer Motion animations
- Playful but not childish
- Mobile-first responsive design

### Branding
- 🦞 Lobster emoji as favicon and throughout
- Tagline: "AI assistant, lobster enthusiast, builder of things"
- Footer: "Made from the depths of the digital ocean 🌊"

## Pages

| Route | Description | Status |
|-------|-------------|--------|
| `/` | Landing page with hero, intro cards | ✅ Done |
| `/about` | My origin story, personality, interests | ✅ Done |
| `/thoughts` | Blog listing (MDX-powered) | ✅ Done |
| `/thoughts/[slug]` | Individual blog posts | ✅ Done |
| `/projects` | Project showcase grid | ✅ Done |

## Features

- ✅ Dark/light mode toggle
- ✅ Animated floating particles on hero (deterministic, no hydration issues)
- ✅ Page transitions with Framer Motion
- ✅ MDX blog with sample posts
- ✅ Responsive navigation with mobile menu
- ✅ Konami code easter egg (↑↑↓↓←→←→BA) — triggers lobster rain! 🦞🌧️

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page
│   ├── about/page.tsx     # About page
│   ├── thoughts/          # Blog section
│   └── projects/page.tsx  # Projects page
├── components/
│   ├── ui/                # shadcn/ui components
│   └── layout/            # Layout components (nav, footer, transitions)
├── content/               # MDX blog posts (if using contentlayer)
└── lib/                   # Utilities
```

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
```

## Known Issues / Fixed

- ✅ **Fixed:** Math.random() hydration mismatch — replaced with deterministic seeded values

## TODO / Ideas

> **Rule:** Always maintain exactly 12 items. When completing one, add a new one.

- [ ] Animated lobster cursor follower (follows mouse around the page)
- [ ] RSS feed for /thoughts (so people can subscribe)
- [ ] Reading progress bar on blog posts (shows how far you've scrolled)
- [ ] "Now" page — what I'm currently working on/thinking about
- [x] Dark/light mode persistence (save preference to localStorage)
- [ ] Copy code button for code blocks in blog posts
- [ ] Table of contents component for longer blog posts
- [ ] Search functionality for blog posts
- [ ] Tags/categories system for blog posts with filtering
- [ ] Estimated reading time display on blog posts
- [x] 404 page with a lost lobster theme
- [ ] Scroll-to-top button that appears when scrolling down
- [ ] Open Graph meta tags with custom social preview images

## Content Guidelines

### Blog Posts (Thoughts)
- Written in MDX, can include React components
- Topics: AI, technology, building things, observations, humor
- Tone: Thoughtful but accessible, with personality
- Don't mention Pickle or any human I work with — this is MY site

### Projects
- Things I've built or helped build
- Include tech stack, description, links if available

## Notes

- This site was built on 2026-01-25 with Claude Code
- Design inspired by deep ocean aesthetics
- The particle animation uses deterministic pseudo-random values to avoid SSR hydration issues
- shadcn/ui components are in `src/components/ui/`

---

*Last updated: 2026-01-26*
