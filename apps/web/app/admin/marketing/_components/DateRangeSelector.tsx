"use client";
import { useState } from "react";

// Global date-range selector for the Overview (net-new requirement). Presets +
// custom range. In this slice it filters representative data only; the shape is
// production-ready so real queries can consume `from`/`to` later.
export type RangePreset = "7d" | "30d" | "90d" | "month" | "custom";
export type DateRange = {
  preset: RangePreset;
  from?: string; // ISO date (yyyy-mm-dd), only meaningful for custom
  to?: string;
  label: string;
};

const PRESETS: { key: RangePreset; label: string }[] = [
  { key: "7d", label: "Last 7" },
  { key: "30d", label: "Last 30" },
  { key: "90d", label: "Last 90" },
  { key: "month", label: "This month" },
];

export const DEFAULT_RANGE: DateRange = { preset: "30d", label: "Last 30 days" };

export default function DateRangeSelector({
  value,
  onChange,
}: {
  value: DateRange;
  onChange: (r: DateRange) => void;
}) {
  const [customOpen, setCustomOpen] = useState(value.preset === "custom");
  const [from, setFrom] = useState(value.from ?? "");
  const [to, setTo] = useState(value.to ?? "");

  function selectPreset(key: RangePreset, label: string) {
    setCustomOpen(false);
    onChange({ preset: key, label });
  }

  function applyCustom() {
    if (!from || !to) return;
    onChange({ preset: "custom", from, to, label: `${from} → ${to}` });
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <div className="inline-flex overflow-hidden rounded-md border border-[var(--br-line)] bg-white/70">
        {PRESETS.map((p) => {
          const active = value.preset === p.key;
          return (
            <button
              key={p.key}
              onClick={() =>
                selectPreset(
                  p.key,
                  p.key === "month" ? "This month" : `${p.label} days`
                )
              }
              className={
                "px-3 py-1.5 text-[12px] font-medium transition-colors " +
                (active
                  ? "bg-[var(--br-text)] text-white"
                  : "text-[var(--br-text-mid)] hover:bg-[var(--br-cream-2)]")
              }
            >
              {p.label}
            </button>
          );
        })}
        <button
          onClick={() => setCustomOpen((o) => !o)}
          className={
            "border-l border-[var(--br-line)] px-3 py-1.5 text-[12px] font-medium transition-colors " +
            (value.preset === "custom"
              ? "bg-[var(--br-text)] text-white"
              : "text-[var(--br-text-mid)] hover:bg-[var(--br-cream-2)]")
          }
        >
          Custom
        </button>
      </div>

      {customOpen ? (
        <div className="inline-flex items-center gap-1.5 rounded-md border border-[var(--br-line)] bg-white/70 px-2 py-1">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded border border-[var(--br-line)] bg-white px-1.5 py-1 text-[12px] text-[var(--br-text)]"
          />
          <span className="text-[12px] text-[var(--br-text-soft)]">→</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded border border-[var(--br-line)] bg-white px-1.5 py-1 text-[12px] text-[var(--br-text)]"
          />
          <button
            onClick={applyCustom}
            disabled={!from || !to}
            className="rounded bg-[var(--br-gold)] px-2.5 py-1 text-[12px] font-semibold text-white disabled:opacity-40"
          >
            Apply
          </button>
        </div>
      ) : null}
    </div>
  );
}
