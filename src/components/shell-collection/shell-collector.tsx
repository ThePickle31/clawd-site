"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useShellCollection, SHELLS } from "./shell-context";

export function ShellCollector() {
  const pathname = usePathname();
  const { collectShell, isCollected } = useShellCollection();

  useEffect(() => {
    // Find which shell matches this page
    const shell = SHELLS.find((s) => s.page === pathname);
    if (shell && !isCollected(shell.id)) {
      // Small delay so the page has time to render before toast
      const timer = setTimeout(() => collectShell(shell.id), 800);
      return () => clearTimeout(timer);
    }
  }, [pathname, collectShell, isCollected]);

  return null;
}
