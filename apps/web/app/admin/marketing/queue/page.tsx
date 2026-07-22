"use client";
import { useCallback, useEffect, useState } from "react";
import {
  Card,
  SectionHeader,
  StakesTag,
  ModuleTag,
  EmptyState,
  Spinner,
} from "../_components/ui";

type QueueItem = {
  id: number;
  created_at: string;
  module: string;
  action: string;
  stakes: string;
  title: string;
  preview: string | null;
  payload: Record<string, unknown>;
  status: string;
  reviewed_at: string | null;
  reviewer: string | null;
};
type Counts = {
  all: number;
  pending: number;
  approved: number;
  rejected: number;
  auto_approved: number;
};

const TABS: { key: keyof Counts; label: string; status: string }[] = [
  { key: "pending", label: "Pending", status: "pending" },
  { key: "approved", label: "Approved", status: "approved" },
  { key: "rejected", label: "Rejected", status: "rejected" },
  { key: "auto_approved", label: "Auto-approved", status: "auto_approved" },
];

const EMPTY_COUNTS: Counts = {
  all: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
  auto_approved: 0,
};

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Math.floor((Date.now() - then) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function ApprovalQueuePage() {
  const [tab, setTab] = useState<string>("pending");
  const [items, setItems] = useState<QueueItem[]>([]);
  const [counts, setCounts] = useState<Counts>(EMPTY_COUNTS);
  const [loading, setLoading] = useState(true);
  const [tableMissing, setTableMissing] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [acting, setActing] = useState<number | null>(null);
  const [reviewError, setReviewError] = useState("");

  const load = useCallback(async (status: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/marketing/queue?status=${status}`);
      const d = await res.json();
      setItems(d.items || []);
      setCounts(d.counts || EMPTY_COUNTS);
      setTableMissing(Boolean(d.tableMissing));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(tab);
  }, [tab, load]);

  async function review(id: number, status: "approved" | "rejected") {
    setActing(id);
    setReviewError("");
    try {
      const res = await fetch(`/api/admin/marketing/queue/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        load(tab);
        return;
      }
      // Previously swallowed: a failed approve looked exactly like a no-op.
      // slug_conflict is the common one and gets materially easier to hit once
      // posts can be scheduled and re-approved.
      const d = await res.json().catch(() => ({}));
      setReviewError(
        d.code === "slug_conflict"
          ? "That slug is already published — edit the draft and retry."
          : d.error || "Something went wrong."
      );
    } catch {
      setReviewError("Network error — nothing was changed.");
    } finally {
      setActing(null);
    }
  }

  return (
    <div>
      <SectionHeader
        title="Approval Queue"
        subtitle="High-stakes actions require sign-off · low-stakes actions auto-approve and appear here for the record."
      />

      {reviewError ? (
        <div className="mb-4 rounded-md border border-[#d9b3ad] bg-[#f6e9e7] px-4 py-2.5 text-[12.5px] text-[#8b3a32]">
          {reviewError}
        </div>
      ) : null}

      {tableMissing ? (
        <div className="mb-4 rounded-md border border-[#e2cf9a] bg-[#f7efd9] px-4 py-2.5 text-[12.5px] text-[#8a6a1f]">
          The <code>approval_queue</code> table isn&apos;t on the server yet. Apply{" "}
          <code>db/schema/approval_queue.sql</code> on the VPS to activate the queue.
          Until then this view stays empty.
        </div>
      ) : null}

      {/* Tabs */}
      <div className="mb-5 flex flex-wrap gap-1.5">
        {TABS.map((t) => {
          const active = tab === t.status;
          return (
            <button
              key={t.status}
              onClick={() => setTab(t.status)}
              className={
                "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-[12.5px] font-medium transition-colors " +
                (active
                  ? "border-[var(--br-text)] bg-[var(--br-text)] text-white"
                  : "border-[var(--br-line)] bg-white/70 text-[var(--br-text-mid)] hover:bg-[var(--br-cream-2)]")
              }
            >
              {t.label}
              <span
                className={
                  "inline-flex min-w-[18px] items-center justify-center rounded-full px-1 text-[11px] font-bold " +
                  (active ? "bg-white/25 text-white" : "bg-[var(--br-stone)] text-[var(--br-text-mid)]")
                }
              >
                {counts[t.key]}
              </span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState
          title={
            tab === "pending"
              ? "Nothing awaiting review"
              : `No ${tab.replace("_", "-")} items`
          }
          hint={
            tab === "pending"
              ? "When an agent proposes a high-stakes action, it lands here for your sign-off."
              : "Items appear here once they've been actioned."
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => {
            const isOpen = expanded === item.id;
            return (
              <Card key={item.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <ModuleTag module={item.module} />
                      <StakesTag stakes={item.stakes} />
                      <span className="text-[11px] text-[var(--br-text-muted)]">
                        {timeAgo(item.created_at)}
                      </span>
                    </div>
                    <div className="font-serif text-[18px] leading-snug text-[var(--br-text)]">
                      {item.title}
                    </div>
                    {item.preview ? (
                      <p className="mt-1 line-clamp-2 text-[13.5px] text-[var(--br-text-soft)]">
                        {item.preview}
                      </p>
                    ) : null}
                  </div>
                </div>

                {isOpen ? (
                  <div className="mt-3 rounded-md border border-[var(--br-line)] bg-[var(--br-cream-2)] p-3">
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--br-text-soft)]">
                      Action
                    </div>
                    <div className="mb-2 text-[13px] text-[var(--br-text-mid)]">
                      {item.action}
                    </div>
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--br-text-soft)]">
                      Payload
                    </div>
                    <pre className="mt-1 max-h-56 overflow-auto whitespace-pre-wrap break-words text-[12px] text-[var(--br-text-mid)]">
                      {JSON.stringify(item.payload ?? {}, null, 2)}
                    </pre>
                  </div>
                ) : null}

                {/* Actions */}
                <div className="mt-3 flex items-center gap-2">
                  {item.status === "pending" ? (
                    <>
                      <button
                        disabled={acting === item.id}
                        onClick={() => review(item.id, "approved")}
                        className="rounded-md border border-[#bcd6bc] bg-[#e8f2e8] px-3 py-1.5 text-[12.5px] font-semibold text-[#3d6a3d] hover:brightness-95 disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => setExpanded(isOpen ? null : item.id)}
                        className="rounded-md border border-[var(--br-line)] bg-white px-3 py-1.5 text-[12.5px] font-semibold text-[var(--br-text-mid)] hover:bg-[var(--br-cream-2)]"
                      >
                        {isOpen ? "Hide" : "Edit / details"}
                      </button>
                      <button
                        disabled={acting === item.id}
                        onClick={() => review(item.id, "rejected")}
                        className="rounded-md border border-[#d9b3ad] bg-[#f6e9e7] px-3 py-1.5 text-[12.5px] font-semibold text-[#8b3a32] hover:brightness-95 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-3 text-[12px] text-[var(--br-text-soft)]">
                      <span>
                        {item.status === "auto_approved"
                          ? "Auto-approved (low-stakes, ran without review)"
                          : `${item.status[0].toUpperCase()}${item.status.slice(1)}`}
                        {item.reviewer ? ` · ${item.reviewer}` : ""}
                        {item.reviewed_at ? ` · ${timeAgo(item.reviewed_at)}` : ""}
                      </span>
                      <button
                        onClick={() => setExpanded(isOpen ? null : item.id)}
                        className="rounded border border-[var(--br-line)] bg-white px-2 py-1 text-[11px] font-medium text-[var(--br-text-mid)] hover:bg-[var(--br-cream-2)]"
                      >
                        {isOpen ? "Hide" : "Details"}
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
