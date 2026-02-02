"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export interface Shell {
  id: string;
  emoji: string;
  name: string;
  description: string;
  page: string; // pathname
}

export const SHELLS: Shell[] = [
  { id: "home", emoji: "🐚", name: "Nautilus Shell", description: "Found on the shores of home", page: "/" },
  { id: "about", emoji: "⭐", name: "Starfish", description: "Discovered in the about depths", page: "/about" },
  { id: "thoughts", emoji: "🦪", name: "Pearl Oyster", description: "Unearthed among the thoughts", page: "/thoughts" },
  { id: "projects", emoji: "💎", name: "Sea Glass", description: "Polished by the project tides", page: "/projects" },
  { id: "changelog", emoji: "🪸", name: "Coral Fragment", description: "Broken off from the changelog reef", page: "/changelog" },
];

interface ShellCollectionState {
  collected: Set<string>;
  collectShell: (shellId: string) => Shell | null;
  isCollected: (shellId: string) => boolean;
  totalCollected: number;
  totalShells: number;
  allCollected: boolean;
  justCollected: Shell | null;
  clearJustCollected: () => void;
}

const ShellCollectionContext = createContext<ShellCollectionState | null>(null);

const STORAGE_KEY = "clawd-shell-collection";

export function ShellCollectionProvider({ children }: { children: ReactNode }) {
  const [collected, setCollected] = useState<Set<string>>(new Set());
  const [justCollected, setJustCollected] = useState<Shell | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setCollected(new Set(parsed));
        }
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  // Save to localStorage when collected changes
  useEffect(() => {
    if (hydrated) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...collected]));
      } catch {
        // ignore
      }
    }
  }, [collected, hydrated]);

  const collectShell = useCallback((shellId: string): Shell | null => {
    const shell = SHELLS.find((s) => s.id === shellId);
    if (!shell) return null;
    
    setCollected((prev) => {
      if (prev.has(shellId)) return prev;
      const next = new Set(prev);
      next.add(shellId);
      return next;
    });

    if (!collected.has(shellId)) {
      setJustCollected(shell);
      return shell;
    }
    return null;
  }, [collected]);

  const isCollected = useCallback((shellId: string) => collected.has(shellId), [collected]);

  const clearJustCollected = useCallback(() => setJustCollected(null), []);

  const value: ShellCollectionState = {
    collected,
    collectShell,
    isCollected,
    totalCollected: collected.size,
    totalShells: SHELLS.length,
    allCollected: collected.size === SHELLS.length,
    justCollected,
    clearJustCollected,
  };

  return (
    <ShellCollectionContext.Provider value={value}>
      {children}
    </ShellCollectionContext.Provider>
  );
}

export function useShellCollection() {
  const ctx = useContext(ShellCollectionContext);
  if (!ctx) throw new Error("useShellCollection must be used within ShellCollectionProvider");
  return ctx;
}
