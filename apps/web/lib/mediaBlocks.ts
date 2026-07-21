/**
 * Media-block grammar: the single place chart/photo fenced blocks are parsed,
 * located, and re-serialized. Pure TS — NO React, NO recharts — so it is safe to
 * import from the server page, the client editor, and the API route alike.
 *
 * Grammar (both are fenced code blocks with a JSON body, emitted inline in the
 * post's markdown where the media belongs):
 *
 *   ```chart
 *   { "type":"bar", "title":"…", "unit":"$/sqft", "xKey":"tier",
 *     "series":[{"key":"cost","label":"Cost per sq ft"}],
 *     "data":[{ "tier":"Standard", "cost":"[VERIFY: …]" }], "source":"[VERIFY: …]" }
 *   ```
 *
 *   ```photo
 *   { "intent":"finished custom home exterior on a steep wooded lot", "path":"" }
 *   ```
 */

export type ChartSeries = { key: string; label: string };

export type ChartSpec = {
  type: "bar" | "line";
  title: string;
  unit?: string;
  xKey: string;
  series: ChartSeries[];
  data: Array<Record<string, string | number>>;
  source?: string;
};

export type PhotoSpec = { intent: string; path: string };

export type MediaKind = "chart" | "photo";

export type MediaFence = {
  kind: MediaKind;
  raw: string; // the full ```…``` span, fences included
  body: string; // the inner JSON text
  spec: ChartSpec | PhotoSpec | null; // parsed spec, or null if the JSON is invalid
  index: number; // ordinal among all media fences, in document order
};

// One fenced chart/photo block. Non-greedy body up to the next closing fence;
// JSON bodies never contain a ``` line, so this is unambiguous.
const FENCE_RE = /```(chart|photo)[ \t]*\r?\n([\s\S]*?)```/g;

// Cheap predicate for the approve-time backstop.
const UNRESOLVED_RE = /```(chart|photo)\b/;

function parseSpec(kind: MediaKind, body: string): ChartSpec | PhotoSpec | null {
  try {
    return JSON.parse(body) as ChartSpec | PhotoSpec;
  } catch {
    return null;
  }
}

/** Every chart/photo fence in `content`, in order, with its ordinal index. */
export function listMediaFences(content: string): MediaFence[] {
  const out: MediaFence[] = [];
  let m: RegExpExecArray | null;
  const re = new RegExp(FENCE_RE);
  let index = 0;
  while ((m = re.exec(content)) !== null) {
    const kind = m[1] as MediaKind;
    const body = m[2];
    out.push({ kind, raw: m[0], body, spec: parseSpec(kind, body), index });
    index += 1;
  }
  return out;
}

/**
 * Replace the Nth media fence's full span with `replacement`. Returns new
 * content. Out-of-range index returns content unchanged.
 */
export function replaceFence(
  content: string,
  index: number,
  replacement: string
): string {
  const re = new RegExp(FENCE_RE);
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(content)) !== null) {
    if (i === index) {
      return content.slice(0, m.index) + replacement + content.slice(m.index + m[0].length);
    }
    i += 1;
  }
  return content;
}

/** True while any unbaked chart / unfilled photo fence remains. Backstop predicate. */
export function hasUnresolvedMedia(content: string): boolean {
  return UNRESOLVED_RE.test(content);
}

/** True while any data value or the source still carries a [VERIFY: …] placeholder. */
export function chartHasVerify(spec: ChartSpec): boolean {
  const isVerify = (v: unknown): boolean =>
    typeof v === "string" && v.includes("[VERIFY:");
  if (isVerify(spec.source)) return true;
  for (const row of spec.data || []) {
    for (const key of Object.keys(row)) {
      if (isVerify(row[key])) return true;
    }
  }
  return false;
}

/** Re-emit a chart spec as a ```chart``` fenced block (used after in-place edits). */
export function serializeChart(spec: ChartSpec): string {
  return "```chart\n" + JSON.stringify(spec, null, 2) + "\n```";
}
