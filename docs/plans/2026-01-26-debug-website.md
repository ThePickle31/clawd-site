# Website Debug & Performance Fix Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all lint errors (6 errors) and resolve scroll lag caused by excessive DOM/style mutations during mouse movement and scroll events.

**Architecture:** Five independent bug fixes targeting: bubble cursor trail performance (biggest scroll lag source), Konami code re-rendering and impure render calls, scroll-to-top setState-in-effect, and MDX component re-creation during render. Each fix is isolated to a single component file.

**Tech Stack:** React 18+, Next.js 14+ (App Router), Framer Motion, TypeScript

---

## Bug Summary

| # | File | Issue | Severity |
|---|------|-------|----------|
| 1 | `bubble-cursor-trail.tsx` | Creates a new `<style>` element per bubble (every 80ms on mouse move), causing constant style recalculation — **primary scroll lag source** | Critical |
| 2 | `konami-code.tsx` | `keysPressed` state in useEffect deps re-creates keydown listener on every keystroke | High |
| 3 | `konami-code.tsx:72,74` | `Math.random()` called during render (in JSX return) — impure | High |
| 4 | `scroll-to-top.tsx:31` | `updateVisibility()` called synchronously in useEffect body triggers setState during render cascade | Medium |
| 5 | `thought-client.tsx:21` | `useMDXComponent()` creates component during render, resetting state each time | Medium |

---

### Task 1: Fix bubble cursor trail — eliminate per-bubble style injection

**Files:**
- Modify: `src/components/bubble-cursor-trail.tsx`

This is the **primary cause of scroll lag**. Every 80ms during mouse movement, a new `<style>` element with a unique `@keyframes` rule is appended to `<head>`. This triggers full style recalculation across the document. When scrolling while moving the mouse, these recalculations compound and cause jank.

**Step 1: Replace per-bubble `<style>` injection with Web Animations API**

Replace the `spawnBubble` function. Instead of creating a `<style>` element with unique keyframes for each bubble, use `el.animate()` (Web Animations API) which runs on the compositor thread and doesn't touch the DOM style tree:

```typescript
const spawnBubble = useCallback((x: number, y: number) => {
    const now = Date.now();
    if (now - lastSpawnRef.current < 80) return;
    lastSpawnRef.current = now;

    const container = containerRef.current;
    if (!container) return;

    // Limit active bubbles
    if (container.childElementCount >= 15) return;

    const size = 6 + Math.random() * 16;
    const drift = (Math.random() - 0.5) * 80;
    const duration = 1000 + Math.random() * 800;
    const floatDistance = 100 + Math.random() * 80;
    const isCoral = Math.random() > 0.4;

    const el = document.createElement("div");
    el.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      left: ${x - size / 2}px;
      top: ${y - size / 2}px;
      background: radial-gradient(circle at 30% 30%, ${
        isCoral ? "rgba(255, 107, 74, 0.5), rgba(255, 107, 74, 0.1)" : "rgba(255, 248, 240, 0.5), rgba(255, 248, 240, 0.1)"
      });
      border: 1px solid ${isCoral ? "rgba(255, 107, 74, 0.2)" : "rgba(255, 248, 240, 0.2)"};
      pointer-events: none;
    `;

    const animation = el.animate(
      [
        { transform: "translate(0, 0) scale(0.3)", opacity: 0.7 },
        { transform: `translate(${drift}px, ${-floatDistance}px) scale(1)`, opacity: 0 },
      ],
      { duration, easing: "ease-out", fill: "forwards" }
    );

    animation.onfinish = () => el.remove();

    container.appendChild(el);
  }, []);
```

Key changes:
- Removed `document.createElement("style")` and `document.head.appendChild(style)` — no more per-bubble style injection
- Removed `will-change` CSS (the Web Animations API handles compositing)
- Removed the `bubble-trail` className (unused now)
- Removed `idRef` (no longer needed for unique keyframe names)
- Duration is now in milliseconds (Web Animations API requirement)

**Step 2: Remove the unused `idRef`**

Remove `const idRef = useRef(0);` from the component since unique IDs are no longer needed.

**Step 3: Run lint to verify the fix**

Run: `npm run lint 2>&1 | grep bubble-cursor`
Expected: No errors for this file

**Step 4: Run build to verify no regressions**

Run: `npm run build`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add src/components/bubble-cursor-trail.tsx
git commit -m "fix: replace per-bubble style injection with Web Animations API

Eliminates scroll lag caused by appending a new <style> element to <head>
every 80ms during mouse movement. Web Animations API runs on the
compositor thread without triggering document-wide style recalculation."
```

---

### Task 2: Fix Konami code — eliminate event listener thrashing and Math.random() in render

**Files:**
- Modify: `src/components/konami-code.tsx`

Two issues in one component:
1. `keysPressed` state in `useEffect` deps causes the keydown listener to be removed and re-added on every keystroke
2. `Math.random()` is called in JSX return (lines 72, 74) — impure render

**Step 1: Refactor to use ref for key tracking and pre-compute random values**

Replace the entire component logic:

```typescript
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const KONAMI_CODE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "KeyB",
  "KeyA",
];

export function KonamiCode() {
  const keysPressedRef = useRef<string[]>([]);
  const [activated, setActivated] = useState(false);
  const [lobsters, setLobsters] = useState<{ id: number; x: number; duration: number; delay: number }[]>([]);

  const spawnLobsters = useCallback(() => {
    const newLobsters = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      duration: 3 + Math.random() * 2,
      delay: Math.random() * 0.5,
    }));
    setLobsters(newLobsters);
    setTimeout(() => {
      setLobsters([]);
      setActivated(false);
    }, 5000);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const newKeys = [...keysPressedRef.current, e.code].slice(-10);
      keysPressedRef.current = newKeys;

      if (newKeys.join(",") === KONAMI_CODE.join(",")) {
        setActivated(true);
        spawnLobsters();
        keysPressedRef.current = [];
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [spawnLobsters]);

  return (
    <AnimatePresence>
      {activated && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden"
          >
            {lobsters.map((lobster) => (
              <motion.div
                key={lobster.id}
                initial={{ x: `${lobster.x}vw`, y: "-10vh", rotate: 0 }}
                animate={{
                  y: "110vh",
                  rotate: 360,
                }}
                transition={{
                  duration: lobster.duration,
                  ease: "linear",
                  delay: lobster.delay,
                }}
                className="absolute text-4xl"
              >
                🦞
              </motion.div>
            ))}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[10000] pointer-events-none"
          >
            <div className="bg-primary text-primary-foreground px-8 py-4 rounded-xl shadow-2xl">
              <p className="text-2xl font-bold text-center">
                🦞 LOBSTER MODE ACTIVATED! 🦞
              </p>
              <p className="text-center mt-2 text-sm opacity-90">
                You found the secret!
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

Key changes:
- `keysPressed` state → `keysPressedRef` ref (no re-renders on each keystroke)
- `useEffect` depends only on `[spawnLobsters]` which is stable — listener is registered once
- `Math.random()` values for `duration` and `delay` are pre-computed in `spawnLobsters` and stored in `lobsters` state
- JSX reads `lobster.duration` and `lobster.delay` instead of calling `Math.random()`

**Step 2: Run lint to verify fixes**

Run: `npm run lint 2>&1 | grep konami`
Expected: No errors for this file

**Step 3: Run build to verify no regressions**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/components/konami-code.tsx
git commit -m "fix: eliminate event listener thrashing and impure render in KonamiCode

Use ref instead of state for key tracking so the keydown listener isn't
torn down and re-created on every keystroke. Pre-compute random animation
values in spawnLobsters instead of calling Math.random() during render."
```

---

### Task 3: Fix scroll-to-top — avoid synchronous setState in effect

**Files:**
- Modify: `src/components/layout/scroll-to-top.tsx`

The linter flags `updateVisibility()` being called directly in the effect body because it synchronously calls `setIsVisible`, triggering a cascading render during the effect phase.

**Step 1: Use lazy initializer for state instead of calling in effect body**

Replace the `useState` and remove the direct `updateVisibility()` call from the effect:

```typescript
"use client";

import { useEffect, useCallback, useRef, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

function subscribeToScroll(callback: () => void) {
  window.addEventListener("scroll", callback, { passive: true });
  return () => window.removeEventListener("scroll", callback);
}

function getScrollSnapshot() {
  return window.scrollY > 300;
}

function getServerSnapshot() {
  return false;
}

export function ScrollToTop() {
  const isVisible = useSyncExternalStore(
    subscribeToScroll,
    getScrollSnapshot,
    getServerSnapshot
  );

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.2 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-[#FF6B4A] text-white shadow-lg hover:bg-[#FF6B4A]/90 hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-[#FF6B4A] focus:ring-offset-2 focus:ring-offset-background"
          aria-label="Scroll to top"
        >
          <ArrowUp className="size-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
```

Key changes:
- Replaced manual `useState` + `useEffect` + `useCallback` + `useRef` pattern with `useSyncExternalStore`
- This is the idiomatic React 18+ way to subscribe to browser events
- No more synchronous setState in effect body
- Removed all the refs (`rafRef`, `needsUpdateRef`, `lastVisibleRef`) — `useSyncExternalStore` handles batching
- Added `getServerSnapshot` returning `false` for SSR

Note: `useSyncExternalStore` doesn't use `requestAnimationFrame` debouncing, but scroll events on modern browsers are already RAF-throttled. If scroll jank reappears, we can add a throttled subscribe wrapper, but this should not be needed.

**Step 2: Run lint to verify the fix**

Run: `npm run lint 2>&1 | grep scroll-to-top`
Expected: No errors for this file

**Step 3: Run build to verify no regressions**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/components/layout/scroll-to-top.tsx
git commit -m "fix: replace manual scroll tracking with useSyncExternalStore

Eliminates cascading setState in useEffect by using the idiomatic React 18
approach for subscribing to external browser state. Simpler code, no refs
needed, and proper SSR handling with getServerSnapshot."
```

---

### Task 4: Fix thought-client — avoid creating component during render

**Files:**
- Modify: `src/app/thoughts/[slug]/thought-client.tsx`

`useMDXComponent()` returns a new component reference on every render, which the linter flags as creating components during render (causes state resets).

**Step 1: Memoize the MDX component**

Add `useMemo` import and wrap the component:

```typescript
import { useMemo } from "react";
```

Then replace line 21:

```typescript
// Old:
const MDXContent = useMDXComponent(post.body.code);

// New:
const mdxCode = post.body.code;
const MDXContent = useMemo(() => useMDXComponent(mdxCode), [mdxCode]);
```

Wait — `useMDXComponent` is a hook and can't be called inside `useMemo`. The correct fix is different. Since `useMDXComponent` is from `next-contentlayer2/hooks`, and it internally does `useMemo` on the code string to return a component, the lint error is about how it's *used* in JSX.

The actual fix is to separate the component creation from the render:

```typescript
// Replace line 21 with:
const MDXContent = useMDXComponent(post.body.code);

// Replace line 92 with:
{MDXContent && <MDXContent components={mdxComponents} />}
```

Actually, looking at the lint error more carefully — the issue is that the React compiler sees `useMDXComponent` returning a component that is then used inline. The idiomatic fix for `next-contentlayer2` is to extract the MDX rendering into a separate component:

Add a new component above `ThoughtClient`:

```typescript
function MDXRenderer({ code }: { code: string }) {
  const MDXContent = useMDXComponent(code);
  return <MDXContent components={mdxComponents} />;
}
```

Then in ThoughtClient, replace line 92:

```typescript
<MDXRenderer code={post.body.code} />
```

And remove the `useMDXComponent` import/call from `ThoughtClient`.

**Step 2: Run lint to verify the fix**

Run: `npm run lint 2>&1 | grep thought-client`
Expected: No errors for this file

**Step 3: Run build to verify no regressions**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/app/thoughts/[slug]/thought-client.tsx
git commit -m "fix: extract MDX rendering to avoid component creation during render

Move useMDXComponent into a dedicated MDXRenderer component so the
component reference is stable and doesn't reset state on re-renders."
```

---

### Task 5: Final verification

**Step 1: Run full lint**

Run: `npm run lint`
Expected: Only the 3 warnings from `.contentlayer/generated` (these are in auto-generated code and can't be fixed). Zero errors.

**Step 2: Run full build**

Run: `npm run build`
Expected: Clean build, no errors.

**Step 3: Manual smoke test**

Run: `npm run dev`

Test checklist:
- [ ] Home page: scroll up and down — no lag
- [ ] Move mouse while scrolling — bubbles appear without jank
- [ ] Konami code (Up Up Down Down Left Right Left Right B A) — lobsters fall smoothly
- [ ] Thoughts page: reading progress bar works
- [ ] Scroll-to-top button appears after scrolling 300px, clicking scrolls smoothly to top
- [ ] Individual blog post renders MDX content correctly

**Step 4: Commit any remaining fixes**

If any issues found during smoke test, fix and commit.
