"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { GitCommit } from "lucide-react";

interface StatusData {
  lastActive: string;
  status: "online" | "idle" | "offline";
  activity: string;
  emoji: string;
  session: string;
}

interface GitHubEvent {
  type: string;
  repo: { name: string };
  created_at: string;
  payload?: {
    commits?: Array<{ message: string }>;
  };
}

interface ActivityState {
  status: StatusData | null;
  latestCommit: { repo: string; time: string; message: string } | null;
  loading: boolean;
  error: boolean;
}

type PulseColor = "green" | "amber" | "gray";

function getTimeAgo(dateString: string): string {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function getPulseColor(lastActive: string): PulseColor {
  const now = new Date();
  const past = new Date(lastActive);
  const diffMins = Math.floor((now.getTime() - past.getTime()) / 60000);

  if (diffMins < 5) return "green";
  if (diffMins < 60) return "amber";
  return "gray";
}

const colorClasses: Record<PulseColor, { dot: string; glow: string; text: string }> = {
  green: {
    dot: "bg-emerald-500",
    glow: "bg-emerald-500/50",
    text: "text-emerald-400",
  },
  amber: {
    dot: "bg-amber-500",
    glow: "bg-amber-500/50",
    text: "text-amber-400",
  },
  gray: {
    dot: "bg-gray-500",
    glow: "bg-gray-500/50",
    text: "text-gray-400",
  },
};

const statusLabels: Record<PulseColor, string> = {
  green: "Online",
  amber: "Idle",
  gray: "Sleeping",
};

export function ActivityPulse() {
  const [state, setState] = useState<ActivityState>({
    status: null,
    latestCommit: null,
    loading: true,
    error: false,
  });

  const fetchData = useCallback(async () => {
    try {
      const [statusRes, eventsRes] = await Promise.all([
        fetch("/status.json", { cache: "no-store" }),
        fetch("https://api.github.com/users/Pickle-Clawd/events?per_page=10", {
          headers: { Accept: "application/vnd.github.v3+json" },
        }),
      ]);

      let status: StatusData | null = null;
      let latestCommit: { repo: string; time: string; message: string } | null = null;

      if (statusRes.ok) {
        status = await statusRes.json();
      }

      if (eventsRes.ok) {
        const events: GitHubEvent[] = await eventsRes.json();
        const pushEvent = events.find((e) => e.type === "PushEvent");
        if (pushEvent) {
          const repoName = pushEvent.repo.name.split("/").pop() || pushEvent.repo.name;
          const commitMessage = pushEvent.payload?.commits?.[0]?.message?.split("\n")[0] || "";
          latestCommit = {
            repo: repoName,
            time: getTimeAgo(pushEvent.created_at),
            message: commitMessage.length > 40 ? commitMessage.slice(0, 40) + "..." : commitMessage,
          };
        }
      }

      setState({
        status,
        latestCommit,
        loading: false,
        error: !status && !latestCommit,
      });
    } catch {
      setState((prev) => ({ ...prev, loading: false, error: true }));
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (state.loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 text-sm text-muted-foreground"
      >
        <div className="h-2 w-2 rounded-full bg-gray-500 animate-pulse" />
        <span>Loading...</span>
      </motion.div>
    );
  }

  if (state.error || !state.status) {
    return null; // Gracefully hide on error
  }

  const pulseColor = getPulseColor(state.status.lastActive);
  const colors = colorClasses[pulseColor];
  const timeAgo = getTimeAgo(state.status.lastActive);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 1.0 }}
      className="flex flex-col items-center gap-2 mt-4"
    >
      {/* Status line */}
      <div className="flex items-center gap-3 text-sm">
        {/* Pulsing dot */}
        <div className="relative flex items-center justify-center">
          {pulseColor === "green" && (
            <motion.div
              className={`absolute h-3 w-3 rounded-full ${colors.glow}`}
              animate={{ scale: [1, 1.8, 1], opacity: [0.7, 0, 0.7] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
          <div className={`h-2 w-2 rounded-full ${colors.dot}`} />
        </div>

        {/* Status text */}
        <span className={colors.text}>{statusLabels[pulseColor]}</span>
        <span className="text-muted-foreground/60">•</span>
        <span className="text-muted-foreground">{timeAgo}</span>
      </div>

      {/* Activity line */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground/80">
        <span>{state.status.emoji}</span>
        <span>{state.status.activity}</span>
      </div>

      {/* Recent commit */}
      {state.latestCommit && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
          <GitCommit className="h-3 w-3" />
          <span>
            {state.latestCommit.repo} • {state.latestCommit.time}
          </span>
        </div>
      )}
    </motion.div>
  );
}

// Export for navbar use
export function StatusIndicator() {
  const [pulseColor, setPulseColor] = useState<PulseColor>("gray");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/status.json", { cache: "no-store" });
        if (res.ok) {
          const status: StatusData = await res.json();
          setPulseColor(getPulseColor(status.lastActive));
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return null;

  const colors = colorClasses[pulseColor];

  return (
    <div className="relative flex items-center justify-center ml-1">
      {pulseColor === "green" && (
        <motion.div
          className={`absolute h-2.5 w-2.5 rounded-full ${colors.glow}`}
          animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      <div className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
    </div>
  );
}
