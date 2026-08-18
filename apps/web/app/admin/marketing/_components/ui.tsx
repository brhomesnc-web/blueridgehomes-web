// Presentational primitives for the marketing platform. No hooks, so both server
// pages and client pages can import them.
// Styling: Tailwind v4 utilities + the brand CSS-var palette from globals.css.
//
// "use client" as of the analytics slice. ChartCard (lifted here from
// OverviewClient so Analytics and Overview share one chart frame) wraps
// Recharts' ResponsiveContainer, and Recharts 3.9.2 ships NO "use client" banner
// of its own while calling createContext at module scope in 28 files. Six
// NotBuiltYet server pages import this module, so without a declared boundary
// their RSC graph stays clean only because Recharts marks those calls
// /*#__PURE__*/ and sets sideEffects:false, letting the bundler shake the unused
// import out.
//
// MEASURED, not assumed: `npx next build` DOES compile with this line removed.
// The directive is here so correctness rests on a boundary we declare rather
// than on tree-shaking continuing to hold across a Recharts upgrade.
"use client";
import React from "react";
import { ResponsiveContainer } from "recharts";

/* ── Surfaces ── */

export function Card({
  children,
  className = "",
  as: Tag = "div",
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <Tag
      className={
        "rounded-lg border border-[var(--br-line)] bg-white/80 shadow-[var(--br-shadow-sm)] " +
        className
      }
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function SectionHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h1 className="font-serif text-[28px] leading-none tracking-tight text-[var(--br-text)]">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1.5 text-[13px] text-[var(--br-text-soft)]">{subtitle}</p>
        ) : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

/* ── Tags ── */

export function ModuleTag({ module }: { module: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[var(--br-line)] bg-[var(--br-cream-2)] px-2.5 py-0.5 text-[11px] font-medium tracking-wide text-[var(--br-text-mid)]">
      {module}
    </span>
  );
}

const STAKES_STYLES: Record<string, string> = {
  high: "border-[#d9b3ad] bg-[#f6e9e7] text-[#8b3a32]",
  medium: "border-[#e2cf9a] bg-[#f7efd9] text-[#8a6a1f]",
  low: "border-[#cdd6c3] bg-[#eef2e8] text-[#4f6340]",
};

export function StakesTag({ stakes }: { stakes: string }) {
  const key = (stakes || "").toLowerCase();
  const cls = STAKES_STYLES[key] ?? STAKES_STYLES.medium;
  const label =
    key === "high" ? "High-stakes" : key === "low" ? "Low-stakes" : "Medium-stakes";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cls}`}
    >
      {label}
    </span>
  );
}

const STATUS_STYLES: Record<string, string> = {
  New: "border-[#b7c9d6] bg-[#e9f0f4] text-[#3d5a68]",
  Contacted: "border-[#e2cf9a] bg-[#f7efd9] text-[#8a6a1f]",
  Qualified: "border-[#cdd6c3] bg-[#eef2e8] text-[#4f6340]",
  Quoted: "border-[var(--br-line)] bg-[var(--br-cream-2)] text-[var(--br-text-mid)]",
  Won: "border-[#bcd6bc] bg-[#e8f2e8] text-[#3d6a3d]",
  Lost: "border-[var(--br-line)] bg-[var(--br-stone)] text-[var(--br-text-muted)]",
};

export function StatusTag({ status }: { status: string }) {
  const cls = STATUS_STYLES[status] ?? STATUS_STYLES.Quoted;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cls}`}
    >
      {status}
    </span>
  );
}

/* ── KPI card ── */

export function KpiCard({
  label,
  value,
  target,
  delta,
  deltaTone = "neutral",
}: {
  label: string;
  value: string;
  target?: string;
  // delta text should include its own direction glyph (↑/↓) since "good" can mean
  // up (leads) or down (CPL). Tone is the color, chosen by the caller's judgement.
  delta?: string;
  deltaTone?: "positive" | "negative" | "neutral";
}) {
  const deltaColor =
    deltaTone === "positive"
      ? "text-[#5a8a5a]"
      : deltaTone === "negative"
      ? "text-[#a85450]"
      : "text-[var(--br-text-soft)]";
  return (
    <Card className="p-4">
      <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--br-text-soft)]">
        {label}
      </div>
      <div className="mt-2 font-serif text-[32px] leading-none tracking-tight text-[var(--br-text)]">
        {value}
      </div>
      <div className="mt-2 flex items-center justify-between">
        {target ? (
          <span className="text-[11px] text-[var(--br-text-muted)]">Target {target}</span>
        ) : (
          <span />
        )}
        {delta ? (
          <span className={`text-[12px] font-semibold ${deltaColor}`}>{delta}</span>
        ) : null}
      </div>
    </Card>
  );
}

/* ── Chart frame ── */

/**
 * The shared frame around every Recharts chart: card, title row, optional hint,
 * fixed height, ResponsiveContainer.
 *
 * Lifted verbatim out of OverviewClient (where it was file-local and unexported)
 * when Analytics needed the same frame. Presentation is byte-for-byte what
 * Overview already rendered — if you change the markup here, you are changing
 * the Overview dashboard too.
 */
export function ChartCard({
  title,
  hint,
  height = 240,
  children,
}: {
  title: string;
  hint?: string;
  height?: number;
  children: React.ReactElement;
}) {
  return (
    <Card className="p-4">
      <div className="mb-1 flex items-baseline justify-between">
        <h3 className="text-[14px] font-semibold text-[var(--br-text)]">{title}</h3>
        {hint ? <span className="text-[11px] text-[var(--br-text-muted)]">{hint}</span> : null}
      </div>
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

/* ── Empty / placeholder states ── */

export function EmptyState({
  title,
  hint,
  icon = "◇",
}: {
  title: string;
  hint?: string;
  icon?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[var(--br-line)] bg-white/40 px-6 py-14 text-center">
      <div className="mb-3 text-2xl text-[var(--br-gold)]">{icon}</div>
      <div className="text-[15px] font-semibold text-[var(--br-text-mid)]">{title}</div>
      {hint ? (
        <div className="mt-1.5 max-w-sm text-[13px] text-[var(--br-text-soft)]">{hint}</div>
      ) : null}
    </div>
  );
}

export function NotBuiltYet({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <SectionHeader title={title} />
      <div className="relative overflow-hidden rounded-lg border border-[var(--br-line)] bg-white/60 px-8 py-20 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--br-gold-light)] via-[var(--br-gold)] to-[var(--br-gold-dark)]"
        />
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[var(--br-line)] bg-[var(--br-cream-2)] font-serif text-2xl text-[var(--br-gold-dark)]">
          ✦
        </div>
        <h2 className="mt-5 font-serif text-2xl text-[var(--br-text)]">Not built yet</h2>
        <p className="mx-auto mt-2 max-w-md text-[14px] leading-relaxed text-[var(--br-text-soft)]">
          {description}
        </p>
        <span className="mt-5 inline-flex items-center rounded-full border border-[var(--br-line)] bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--br-text-muted)]">
          Coming in a later slice
        </span>
      </div>
    </div>
  );
}

/* ── Loading ── */

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--br-line)] border-t-[var(--br-gold)]" />
    </div>
  );
}
