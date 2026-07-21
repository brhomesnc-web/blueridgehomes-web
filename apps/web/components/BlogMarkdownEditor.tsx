"use client";
import { useRef, useState } from "react";
import Markdown from "react-markdown";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import ImagePicker from "@/components/admin/ImagePicker";
import {
  listMediaFences,
  replaceFence,
  serializeChart,
  chartHasVerify,
  type ChartSpec,
  type PhotoSpec,
} from "@/lib/mediaBlocks";

/**
 * Client-only blog markdown renderer for the EDITORS.
 *
 * This is the ONLY module that imports recharts — recharts isolation is by
 * module boundary (repo has no next/dynamic), so the server page never pulls it
 * in. Chart/photo fences render as interactive, reviewable blocks: a live chart
 * preview + editable data grid + Bake control, and a photo slot + fill/drop.
 * Baking rasterizes the recharts SVG to a PNG via the existing upload route and
 * swaps the ```chart``` block for a plain ![](path) image; filling a photo swaps
 * the ```photo``` block for ![](path). By approve time no fence remains.
 *
 * Rendering strategy: split `content` at media-fence boundaries and render the
 * markdown between fences with react-markdown, the fences with these components.
 * Each block knows its ordinal `index` (from listMediaFences), so bake/fill/drop
 * target the exact fence — duplicates included — via replaceFence.
 */

const COLORS = ["#c9a54e", "#6b4226", "#7d8c6a", "#9a8e80", "#4f6d7a", "#b8923d", "#a9705a"];
const GRID = "#e5d8ca";
const AXIS = "#a89a8c";
const CHART_FONT = "ui-sans-serif, system-ui, sans-serif"; // generic stack — bakes faithfully (F5)

const axisProps = {
  tick: { fill: AXIS, fontSize: 11, fontFamily: CHART_FONT },
  stroke: GRID,
} as const;

// A data value is a number, or a "[VERIFY: …]"/free string. For the chart, coerce
// a real number or null (recharts skips null).
function toNum(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const s = String(v ?? "").trim();
  if (!s || s.includes("[VERIFY")) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function isVerify(v: unknown): boolean {
  return typeof v === "string" && v.includes("[VERIFY");
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not rasterize the chart SVG."));
    img.src = src;
  });
}

type BlockProps = {
  index: number;
  content: string;
  onChange: (next: string) => void;
};

function ChartPreview({
  spec,
  index,
  content,
  onChange,
  slug,
}: BlockProps & { spec: ChartSpec; slug?: string }) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [baking, setBaking] = useState(false);
  const [bakeError, setBakeError] = useState("");

  const chartData = spec.data.map((row) => {
    const r: Record<string, string | number | null> = { [spec.xKey]: row[spec.xKey] };
    for (const s of spec.series) r[s.key] = toNum(row[s.key]);
    return r;
  });

  function patchSpec(next: ChartSpec) {
    onChange(replaceFence(content, index, serializeChart(next)));
  }

  function setCell(rowIdx: number, key: string, raw: string) {
    // Store the raw string as typed (so decimals/partial entry survive the
    // content round-trip); toNum coerces it for the chart and the bake, and
    // chartHasVerify still gates on any remaining [VERIFY:] placeholder.
    patchSpec({
      ...spec,
      data: spec.data.map((r, i) => (i === rowIdx ? { ...r, [key]: raw } : r)),
    });
  }

  const verifyLeft = chartHasVerify(spec);

  async function bake() {
    setBakeError("");
    const svg = chartRef.current?.querySelector("svg");
    if (!svg) {
      setBakeError("Chart is not ready to bake yet.");
      return;
    }
    setBaking(true);
    try {
      const bbox = svg.getBoundingClientRect();
      const w = Math.max(320, Math.round(bbox.width));
      const h = Math.max(200, Math.round(bbox.height));
      const clone = svg.cloneNode(true) as SVGSVGElement;
      clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      clone.setAttribute("width", String(w));
      clone.setAttribute("height", String(h));
      const xml = new XMLSerializer().serializeToString(clone);
      const img = await loadImage("data:image/svg+xml;charset=utf-8," + encodeURIComponent(xml));

      const scale = 2;
      const pad = 20 * scale;
      const titleH = 34 * scale;
      const multi = spec.series.length > 1;
      const legendH = multi ? 24 * scale : 0;
      const srcH = spec.source ? 22 * scale : 0;

      const canvas = document.createElement("canvas");
      canvas.width = w * scale;
      canvas.height = titleH + legendH + h * scale + srcH + pad;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas is unavailable.");

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.textBaseline = "top";

      // Title
      ctx.fillStyle = "#1e1812";
      ctx.font = `600 ${17 * scale}px ${CHART_FONT}`;
      ctx.fillText(spec.title || "", pad, 8 * scale);

      let y = titleH;
      // Legend (multi-series only — recharts' HTML legend isn't in the SVG)
      if (multi) {
        ctx.font = `${11 * scale}px ${CHART_FONT}`;
        let lx = pad;
        spec.series.forEach((s, i) => {
          ctx.fillStyle = COLORS[i % COLORS.length];
          ctx.fillRect(lx, y + 4 * scale, 10 * scale, 10 * scale);
          ctx.fillStyle = "#3d3228";
          const label = s.label || s.key;
          ctx.fillText(label, lx + 14 * scale, y + 3 * scale);
          lx += 14 * scale + ctx.measureText(label).width + 18 * scale;
        });
        y += legendH;
      }

      ctx.drawImage(img, 0, y, w * scale, h * scale);
      y += h * scale;

      if (spec.source) {
        ctx.fillStyle = "#9a8e80";
        ctx.font = `${11 * scale}px ${CHART_FONT}`;
        ctx.fillText(String(spec.source), pad, y + 4 * scale);
      }

      const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/png"));
      if (!blob) throw new Error("Could not produce the chart image.");

      const fd = new FormData();
      const filename = `chart-${slug || "post"}-${index}-${Date.now()}.png`;
      fd.append("file", blob, filename); // explicit name — a Blob has none (F4)
      fd.append("folder", "blog-charts");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.path) throw new Error(data.error || "Upload failed.");

      onChange(replaceFence(content, index, `![${spec.title || "chart"}](${data.path})`));
    } catch (e) {
      setBakeError(e instanceof Error ? e.message : "Bake failed.");
    } finally {
      setBaking(false);
    }
  }

  return (
    <div className="my-6 rounded-lg border border-[var(--br-line)] bg-white p-4 not-prose">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="rounded-full bg-[var(--br-stone)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--br-text-mid)]">
          Chart · {spec.type}
        </span>
        <input
          value={spec.title}
          onChange={(e) => patchSpec({ ...spec, title: e.target.value })}
          className="min-w-0 flex-1 rounded border border-[var(--br-line)] bg-white/70 px-2 py-1 text-[13px] font-semibold text-[var(--br-text)] outline-none focus:border-[var(--br-gold)]"
        />
      </div>

      <div ref={chartRef} style={{ width: "100%", height: 260, fontFamily: CHART_FONT }}>
        <ResponsiveContainer width="100%" height="100%">
          {spec.type === "line" ? (
            <LineChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
              <XAxis dataKey={spec.xKey} {...axisProps} />
              <YAxis {...axisProps} label={spec.unit ? { value: spec.unit, angle: -90, position: "insideLeft", fill: AXIS, fontSize: 11 } : undefined} />
              <Tooltip contentStyle={{ fontSize: 12, fontFamily: CHART_FONT }} />
              {spec.series.length > 1 ? <Legend wrapperStyle={{ fontSize: 11 }} /> : null}
              {spec.series.map((s, i) => (
                <Line key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={{ r: 3 }} />
              ))}
            </LineChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
              <XAxis dataKey={spec.xKey} {...axisProps} />
              <YAxis {...axisProps} label={spec.unit ? { value: spec.unit, angle: -90, position: "insideLeft", fill: AXIS, fontSize: 11 } : undefined} />
              <Tooltip contentStyle={{ fontSize: 12, fontFamily: CHART_FONT }} />
              {spec.series.length > 1 ? <Legend wrapperStyle={{ fontSize: 11 }} /> : null}
              {spec.series.map((s, i) => (
                <Bar key={s.key} dataKey={s.key} name={s.label} fill={COLORS[i % COLORS.length]} radius={[3, 3, 0, 0]} maxBarSize={48} />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Editable data grid */}
      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse text-[12.5px]">
          <thead>
            <tr>
              <th className="border-b border-[var(--br-line)] px-2 py-1 text-left font-semibold text-[var(--br-text-soft)]">
                {spec.xKey}
              </th>
              {spec.series.map((s) => (
                <th key={s.key} className="border-b border-[var(--br-line)] px-2 py-1 text-left font-semibold text-[var(--br-text-soft)]">
                  {s.label || s.key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {spec.data.map((row, ri) => (
              <tr key={ri}>
                <td className="px-2 py-1 text-[var(--br-text-mid)]">{String(row[spec.xKey] ?? "")}</td>
                {spec.series.map((s) => {
                  const v = row[s.key];
                  const flag = isVerify(v);
                  return (
                    <td key={s.key} className="px-1 py-1">
                      <input
                        value={String(v ?? "")}
                        onChange={(e) => setCell(ri, s.key, e.target.value)}
                        className={
                          "w-full rounded border px-1.5 py-1 text-[12.5px] outline-none focus:border-[var(--br-gold)] " +
                          (flag
                            ? "border-[#d9b3ad] bg-[#f6e9e7] text-[#8b3a32]"
                            : "border-[var(--br-line)] bg-white/70 text-[var(--br-text-mid)]")
                        }
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Source (also gates bake if it holds a [VERIFY:]) */}
      <div className="mt-2">
        <input
          value={spec.source ?? ""}
          onChange={(e) => patchSpec({ ...spec, source: e.target.value })}
          placeholder="Source / attribution (optional)"
          className={
            "w-full rounded border px-2 py-1 text-[12px] outline-none focus:border-[var(--br-gold)] " +
            (isVerify(spec.source)
              ? "border-[#d9b3ad] bg-[#f6e9e7] text-[#8b3a32]"
              : "border-[var(--br-line)] bg-white/70 text-[var(--br-text-muted)]")
          }
        />
      </div>

      {bakeError ? (
        <div className="mt-2 rounded border border-[#d9b3ad] bg-[#f6e9e7] px-3 py-1.5 text-[12px] text-[#8b3a32]">
          {bakeError}
        </div>
      ) : null}

      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-[11.5px] text-[var(--br-text-muted)]">
          {verifyLeft
            ? "Replace every [VERIFY: …] value with a real number before baking."
            : "Ready to bake into a published image."}
        </span>
        <button
          type="button"
          onClick={bake}
          disabled={verifyLeft || baking}
          className="rounded-md border border-[var(--br-gold-dark)] bg-[var(--br-gold)] px-3 py-1.5 text-[12.5px] font-semibold text-white hover:bg-[var(--br-gold-dark)] disabled:opacity-40"
        >
          {baking ? "Baking…" : "Bake chart → image"}
        </button>
      </div>
    </div>
  );
}

function PhotoSlot({
  spec,
  index,
  content,
  onChange,
}: BlockProps & { spec: PhotoSpec | null }) {
  const intent = spec?.intent || "(no description provided)";
  const path = spec?.path || "";
  return (
    <div className="my-5 rounded-lg border border-[var(--br-line)] bg-[var(--br-cream-2)] p-3 not-prose">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="rounded-full bg-[var(--br-stone)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--br-text-mid)]">
          Photo slot
        </span>
        <button
          type="button"
          onClick={() => onChange(replaceFence(content, index, ""))}
          className="text-[11.5px] font-semibold text-[var(--br-text-soft)] underline hover:text-[#8b3a32]"
        >
          Drop slot
        </button>
      </div>
      <div className="mb-2 text-[13px] text-[var(--br-text-mid)]">
        Wants: <em>{intent}</em>
      </div>
      <ImagePicker
        value={path}
        onChange={(p) => onChange(replaceFence(content, index, `![${intent}](${p})`))}
      />
    </div>
  );
}

function ChartBlock({
  spec,
  index,
  content,
  onChange,
  slug,
}: BlockProps & { spec: ChartSpec | null; slug?: string }) {
  if (!spec) {
    return (
      <div className="my-5 rounded-md border border-[#d9b3ad] bg-[#f6e9e7] px-4 py-3 text-[12.5px] text-[#8b3a32] not-prose">
        This <code>```chart```</code> block has invalid JSON — fix it in the raw markdown before it can render.
      </div>
    );
  }
  return <ChartPreview spec={spec} index={index} content={content} onChange={onChange} slug={slug} />;
}

export default function BlogMarkdownEditor({
  content,
  onChange,
  slug,
}: {
  content: string;
  onChange: (next: string) => void;
  slug?: string;
}) {
  const fences = listMediaFences(content);
  if (fences.length === 0) {
    return <Markdown>{content}</Markdown>;
  }

  const parts: React.ReactNode[] = [];
  let cursor = 0;
  fences.forEach((f, i) => {
    const at = content.indexOf(f.raw, cursor);
    if (at === -1) return;
    if (at > cursor) {
      const md = content.slice(cursor, at);
      if (md.trim()) parts.push(<Markdown key={`md-${i}`}>{md}</Markdown>);
    }
    parts.push(
      f.kind === "chart" ? (
        <ChartBlock
          key={`c-${i}`}
          spec={f.spec as ChartSpec | null}
          index={f.index}
          content={content}
          onChange={onChange}
          slug={slug}
        />
      ) : (
        <PhotoSlot
          key={`p-${i}`}
          spec={f.spec as PhotoSpec | null}
          index={f.index}
          content={content}
          onChange={onChange}
        />
      )
    );
    cursor = at + f.raw.length;
  });
  if (cursor < content.length) {
    const md = content.slice(cursor);
    if (md.trim()) parts.push(<Markdown key="md-tail">{md}</Markdown>);
  }

  return <>{parts}</>;
}
