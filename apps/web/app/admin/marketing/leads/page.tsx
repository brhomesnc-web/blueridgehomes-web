"use client";
import { useEffect, useMemo, useState } from "react";
import { SectionHeader, StatusTag, EmptyState, Spinner } from "../_components/ui";

type Lead = {
  key: string;
  id: number;
  source: "contact" | "feedback";
  name: string;
  email: string;
  phone: string | null;
  project_type: string | null;
  message: string;
  created_at: string;
  status: string;
  rating: number | null;
  stage: string;
};

// Full pipeline stage set. `live` stages receive mapped data from submissions;
// the rest are placeholders until the v2 enrichment layer.
const STAGES: { key: string; label: string; live: boolean }[] = [
  { key: "New", label: "New", live: true },
  { key: "Contacted", label: "Contacted", live: true },
  { key: "Qualified", label: "Qualified", live: true },
  { key: "Quoted", label: "Quoted", live: false },
  { key: "Won", label: "Won", live: false },
  { key: "Lost", label: "Lost", live: true },
];

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Math.floor((Date.now() - then) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"all" | "contact" | "feedback">("all");
  const [projectType, setProjectType] = useState("all");
  const [selected, setSelected] = useState<Lead | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/marketing/leads");
        const d = await res.json();
        setLeads(d.leads || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const projectTypes = useMemo(() => {
    const set = new Set<string>();
    leads.forEach((l) => l.project_type && set.add(l.project_type));
    return Array.from(set).sort();
  }, [leads]);

  const filtered = useMemo(
    () =>
      leads.filter(
        (l) =>
          (source === "all" || l.source === source) &&
          (projectType === "all" || l.project_type === projectType)
      ),
    [leads, source, projectType]
  );

  const byStage = useMemo(() => {
    const map: Record<string, Lead[]> = {};
    STAGES.forEach((s) => (map[s.key] = []));
    filtered.forEach((l) => {
      (map[l.stage] ??= []).push(l);
    });
    return map;
  }, [filtered]);

  return (
    <div>
      <SectionHeader
        title="Lead Pipeline"
        subtitle={`${filtered.length} lead${filtered.length === 1 ? "" : "s"} · read-through of contact + feedback submissions`}
        right={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as typeof source)}
              className="rounded-md border border-[var(--br-line)] bg-white/70 px-2.5 py-1.5 text-[12.5px] text-[var(--br-text-mid)]"
            >
              <option value="all">All sources</option>
              <option value="contact">Contact form</option>
              <option value="feedback">Feedback</option>
            </select>
            <select
              value={projectType}
              onChange={(e) => setProjectType(e.target.value)}
              className="rounded-md border border-[var(--br-line)] bg-white/70 px-2.5 py-1.5 text-[12.5px] text-[var(--br-text-mid)]"
            >
              <option value="all">All project types</option>
              {projectTypes.map((pt) => (
                <option key={pt} value={pt}>
                  {pt}
                </option>
              ))}
            </select>
          </div>
        }
      />

      <div className="mb-4 rounded-md border border-[#b7c9d6] bg-[#e9f0f4] px-4 py-2.5 text-[12.5px] text-[#3d5a68]">
        Stages map from existing submission status. <strong>Quoted / Won</strong> and
        AI fit-scoring arrive with the v2 enrichment layer — no data is invented here.
      </div>

      {loading ? (
        <Spinner />
      ) : leads.length === 0 ? (
        <EmptyState
          title="No leads yet"
          hint="Contact-form and feedback submissions will appear here as they arrive."
          icon="◇"
        />
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-3">
          {STAGES.map((stage) => {
            const items = byStage[stage.key] ?? [];
            return (
              <div
                key={stage.key}
                className="flex w-[248px] shrink-0 flex-col rounded-lg border border-[var(--br-line)] bg-white/50"
              >
                <div className="flex items-center justify-between border-b border-[var(--br-line)] px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-[var(--br-text)]">
                      {stage.label}
                    </span>
                    {!stage.live ? (
                      <span className="rounded-full bg-[var(--br-stone)] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[var(--br-text-muted)]">
                        v2
                      </span>
                    ) : null}
                  </div>
                  <span className="text-[12px] font-semibold text-[var(--br-text-soft)]">
                    {items.length}
                  </span>
                </div>

                <div className="flex flex-col gap-2 p-2.5">
                  {items.length === 0 ? (
                    <div className="rounded-md border border-dashed border-[var(--br-line)] px-3 py-6 text-center text-[11.5px] text-[var(--br-text-muted)]">
                      {stage.live ? "Empty" : "Arrives in v2"}
                    </div>
                  ) : (
                    items.map((lead) => (
                      <button
                        key={lead.key}
                        onClick={() => setSelected(lead)}
                        className="rounded-md border border-[var(--br-line)] bg-white px-3 py-2.5 text-left transition-shadow hover:shadow-[var(--br-shadow-sm)]"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-[13.5px] font-semibold text-[var(--br-text)]">
                            {lead.name}
                          </span>
                          <span
                            className={
                              "shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase " +
                              (lead.source === "feedback"
                                ? "bg-[#eef2e8] text-[#4f6340]"
                                : "bg-[#e9f0f4] text-[#3d5a68]")
                            }
                          >
                            {lead.source}
                          </span>
                        </div>
                        {lead.project_type ? (
                          <div className="mt-0.5 truncate text-[12px] text-[var(--br-text-soft)]">
                            {lead.project_type}
                          </div>
                        ) : null}
                        <div className="mt-1 text-[11px] text-[var(--br-text-muted)]">
                          {timeAgo(lead.created_at)}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lead detail drawer */}
      {selected ? (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setSelected(null)}
          />
          <aside className="absolute right-0 top-0 h-full w-full max-w-[420px] overflow-y-auto border-l border-[var(--br-line)] bg-[var(--br-cream)] shadow-2xl">
            <div className="flex items-start justify-between border-b border-[var(--br-line)] px-5 py-4">
              <div>
                <div className="font-serif text-[22px] leading-tight text-[var(--br-text)]">
                  {selected.name}
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <StatusTag status={selected.stage} />
                  <span className="text-[11px] uppercase tracking-wide text-[var(--br-text-muted)]">
                    {selected.source === "feedback" ? "Feedback" : "Contact form"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-2xl leading-none text-[var(--br-text-soft)] hover:text-[var(--br-text)]"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 px-5 py-5">
              <Field label="Email">
                <a
                  href={`mailto:${selected.email}`}
                  className="text-[var(--br-gold-dark)] underline"
                >
                  {selected.email}
                </a>
              </Field>
              <Field label="Phone">{selected.phone || "Not provided"}</Field>
              <Field label="Project type">
                {selected.project_type || "Not provided"}
              </Field>
              {selected.rating != null ? (
                <Field label="Rating">{selected.rating} / 5</Field>
              ) : null}
              <Field label="Received">
                {new Date(selected.created_at).toLocaleString()} ({timeAgo(selected.created_at)})
              </Field>
              <Field label="Message">
                <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-[var(--br-text-mid)]">
                  {selected.message}
                </p>
              </Field>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--br-text-soft)]">
        {label}
      </div>
      <div className="text-[13.5px] text-[var(--br-text)]">{children}</div>
    </div>
  );
}
