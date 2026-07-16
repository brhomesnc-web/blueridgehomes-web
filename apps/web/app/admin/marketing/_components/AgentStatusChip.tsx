"use client";
import { useEffect, useState } from "react";

// Sidebar-footer agent-status chip + the human kill-switch (Pause).
// Wired to the stub source at /api/admin/marketing/agent-status.
type AgentState = "active" | "paused" | "error";
type Status = { state: AgentState; lastActionAt: string; lastActionLabel: string };

const DOT: Record<AgentState, string> = {
  active: "#5a8a5a",
  paused: "#c99a3d",
  error: "#a85450",
};
const LABEL: Record<AgentState, string> = {
  active: "Active",
  paused: "Paused",
  error: "Error",
};

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const diff = Math.floor((Date.now() - then) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function AgentStatusChip() {
  const [status, setStatus] = useState<Status | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const res = await fetch("/api/admin/marketing/agent-status");
      if (res.ok) setStatus(await res.json());
    } catch {
      /* leave prior status */
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  async function act(action: "pause" | "resume") {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/marketing/agent-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) setStatus(await res.json());
    } finally {
      setBusy(false);
      setConfirming(false);
    }
  }

  const state = status?.state ?? "active";

  return (
    <div className="rounded-lg border border-[var(--br-line)] bg-white/70 p-3">
      <div className="flex items-center gap-2">
        <span
          className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ background: DOT[state], boxShadow: `0 0 0 3px ${DOT[state]}22` }}
        />
        <span className="text-[12px] font-semibold text-[var(--br-text)]">
          Agent · {LABEL[state]}
        </span>
      </div>
      <div className="mt-1 truncate text-[11px] text-[var(--br-text-soft)]">
        {status
          ? `Last action ${timeAgo(status.lastActionAt)}`
          : "Checking status…"}
      </div>

      {confirming ? (
        <div className="mt-2.5">
          <div className="text-[11px] text-[var(--br-text-mid)]">
            Pause all agent activity?
          </div>
          <div className="mt-2 flex gap-2">
            <button
              disabled={busy}
              onClick={() => act("pause")}
              className="flex-1 rounded border border-[#d9b3ad] bg-[#f6e9e7] px-2 py-1 text-[11px] font-semibold text-[#8b3a32] disabled:opacity-50"
            >
              {busy ? "…" : "Pause"}
            </button>
            <button
              disabled={busy}
              onClick={() => setConfirming(false)}
              className="flex-1 rounded border border-[var(--br-line)] bg-white px-2 py-1 text-[11px] font-semibold text-[var(--br-text-mid)] disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : state === "paused" ? (
        <button
          disabled={busy}
          onClick={() => act("resume")}
          className="mt-2.5 w-full rounded border border-[var(--br-line)] bg-white px-2 py-1.5 text-[11px] font-semibold text-[var(--br-text-mid)] hover:bg-[var(--br-cream-2)] disabled:opacity-50"
        >
          {busy ? "…" : "Resume agent"}
        </button>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          className="mt-2.5 w-full rounded border border-[var(--br-line)] bg-white px-2 py-1.5 text-[11px] font-semibold text-[var(--br-text-mid)] hover:bg-[var(--br-cream-2)]"
        >
          Pause agent
        </button>
      )}
    </div>
  );
}
