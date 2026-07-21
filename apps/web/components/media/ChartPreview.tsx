"use client";
import { useRef, useState } from "react";
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
import {
  chartHasVerify,
  chartHasInvalidNumber,
  type ChartSpec,
} from "@/lib/mediaBlocks";

/**
 * The chart block's editing UI — live recharts preview, editable data grid, and
 * bake-to-image.
 *
 * PURE spec-in / spec-out: this component knows nothing about markdown strings,
 * fence ordinals, or TipTap. It reports intent through three callbacks, so both
 * renderers can drive it — the string-world BlogMarkdownEditor maps them onto
 * `replaceFence`, and the TipTap node-view maps them onto editor transactions.
 *
 * recharts lives here (client-only). The server blog page must never import it.
 */

const COLORS = ["#c9a54e", "#6b4226", "#7d8c6a", "#9a8e80", "#4f6d7a", "#b8923d", "#a9705a"];
const GRID = "#e5d8ca";
const AXIS = "#a89a8c";
// Generic stack: an SVG rasterized to canvas can't use page webfonts, so this
// keeps the baked PNG faithful to what the editor previews.
const CHART_FONT = "ui-sans-serif, system-ui, sans-serif";

const axisProps = {
  tick: { fill: AXIS, fontSize: 11, fontFamily: CHART_FONT },
  stroke: GRID,
} as const;

// A data value is a number, or a "[VERIFY: …]"/free string. For the chart, coerce
// to a real number or null (recharts skips null).
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

export type ChartPreviewProps = {
  spec: ChartSpec;
  slug?: string;
  onSpecChange: (next: ChartSpec) => void;
  onReplaceWithImage: (path: string, alt: string) => void;
  onRemove: () => void;
};

export default function ChartPreview({
  spec,
  slug,
  onSpecChange,
  onReplaceWithImage,
  onRemove,
}: ChartPreviewProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [baking, setBaking] = useState(false);
  const [bakeError, setBakeError] = useState("");

  const chartData = spec.data.map((row) => {
    const r: Record<string, string | number | null> = { [spec.xKey]: row[spec.xKey] };
    for (const s of spec.series) r[s.key] = toNum(row[s.key]);
    return r;
  });

  function setCell(rowIdx: number, key: string, raw: string) {
    // Store the raw string as typed, so decimals/partial entry survive the
    // round-trip; toNum coerces for the chart, and the two gates below decide
    // whether it may bake.
    onSpecChange({
      ...spec,
      data: spec.data.map((r, i) => (i === rowIdx ? { ...r, [key]: raw } : r)),
    });
  }

  const verifyLeft = chartHasVerify(spec);
  const invalidLeft = chartHasInvalidNumber(spec);
  const bakeBlocked = verifyLeft || invalidLeft;

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

      ctx.fillStyle = "#1e1812";
      ctx.font = `600 ${17 * scale}px ${CHART_FONT}`;
      ctx.fillText(spec.title || "", pad, 8 * scale);

      let y = titleH;
      // Legend (multi-series only — recharts' HTML legend isn't part of the SVG)
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
      const filename = `chart-${slug || "post"}-${Date.now()}.png`;
      fd.append("file", blob, filename); // explicit name — a Blob carries none
      fd.append("folder", "blog-charts");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.path) throw new Error(data.error || "Upload failed.");

      onReplaceWithImage(data.path, spec.title || "chart");
    } catch (e) {
      setBakeError(e instanceof Error ? e.message : "Bake failed.");
    } finally {
      setBaking(false);
    }
  }

  return (
    <div className="my-6 rounded-lg border border-[var(--br-line)] bg-white p-4 not-prose">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="shrink-0 rounded-full bg-[var(--br-stone)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--br-text-mid)]">
          Chart · {spec.type}
        </span>
        <input
          value={spec.title}
          onChange={(e) => onSpecChange({ ...spec, title: e.target.value })}
          className="min-w-0 flex-1 rounded border border-[var(--br-line)] bg-white/70 px-2 py-1 text-[13px] font-semibold text-[var(--br-text)] outline-none focus:border-[var(--br-gold)]"
        />
        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 text-[11.5px] font-semibold text-[var(--br-text-soft)] underline hover:text-[#8b3a32]"
        >
          Remove
        </button>
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
                  const bad = !flag && !Number.isFinite(Number(String(v ?? "").trim() || NaN));
                  return (
                    <td key={s.key} className="px-1 py-1">
                      <input
                        value={String(v ?? "")}
                        onChange={(e) => setCell(ri, s.key, e.target.value)}
                        className={
                          "w-full rounded border px-1.5 py-1 text-[12.5px] outline-none focus:border-[var(--br-gold)] " +
                          (flag || bad
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
          onChange={(e) => onSpecChange({ ...spec, source: e.target.value })}
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
            : invalidLeft
              ? "Every value must be a number — fix the highlighted cells before baking."
              : "Ready to bake into a published image."}
        </span>
        <button
          type="button"
          onClick={bake}
          disabled={bakeBlocked || baking}
          className="shrink-0 rounded-md border border-[var(--br-gold-dark)] bg-[var(--br-gold)] px-3 py-1.5 text-[12.5px] font-semibold text-white hover:bg-[var(--br-gold-dark)] disabled:opacity-40"
        >
          {baking ? "Baking…" : "Bake chart → image"}
        </button>
      </div>
    </div>
  );
}
