import { query } from "@/lib/db";
import { getGoogleAccessToken } from "@/lib/googleAuth";

/**
 * GA4 + Search Console ingest.
 *
 * Two REST calls, hand-rolled over fetch because no Google client library is
 * installed and this slice does not add one (see lib/googleAuth.ts). Each
 * function pulls a date range and upserts it into its own table:
 *
 *   ingestGa4            -> analytics_daily        (date, channel)
 *   ingestSearchConsole  -> search_console_daily   (date, query, page)
 *
 * Both are re-runnable over the SAME range without duplicating: the tables carry
 * unique constraints on those keys and every write is ON CONFLICT DO UPDATE.
 * That is not a nicety — it is what lets the caller re-walk a trailing window
 * every run, which is the only way late-arriving Search Console data ever lands.
 *
 * Nothing here catches its own errors. A failed ingest must reach the route so
 * it can 503; a partial write that reported success would leave the admin panel
 * showing stale numbers with no signal that they are stale.
 */

export type DateRange = { startDate: string; endDate: string };

/**
 * Search Console lags 2-3 days and BACK-FILLS: the row for a given date keeps
 * changing for days afterward. Seven days is comfortably past the lag, so a run
 * that is a few days late still repairs everything it missed.
 */
export const DEFAULT_TRAILING_DAYS = 7;

/**
 * GSC's documented per-request maximum. Requesting date+query+page for a 7-day
 * window on this site returns low hundreds of rows, so this cap is headroom
 * rather than a real limit — but it IS a cap, so ingestSearchConsole warns
 * loudly when a response comes back exactly this long, which is the signature of
 * silent truncation.
 */
const GSC_ROW_LIMIT = 25000;

/**
 * Postgres allows 65535 bound parameters per statement; the widest row here
 * binds 7, so 500 rows/statement leaves an order of magnitude of headroom.
 */
const UPSERT_CHUNK_ROWS = 500;

/**
 * The trailing window, computed in SQL rather than JS.
 *
 * The server process and Postgres both run UTC while the business runs
 * America/New_York, and this repo's standing convention is to resolve that in
 * SQL via AT TIME ZONE (see db/schema/blog_posts.sql). A `new Date()` here would
 * roll the window over at 8pm Eastern instead of midnight, quietly shifting
 * every ingest by a day for four hours of each evening.
 *
 * The window is inclusive of both ends, so `days` days means `days` dates.
 */
export async function trailingWindow(days = DEFAULT_TRAILING_DAYS): Promise<DateRange> {
  const { rows } = await query<{ start_date: string; end_date: string }>(
    `SELECT to_char(((now() AT TIME ZONE 'America/New_York')::date - ($1::int - 1)), 'YYYY-MM-DD') AS start_date,
            to_char( (now() AT TIME ZONE 'America/New_York')::date,                  'YYYY-MM-DD') AS end_date`,
    [days]
  );
  return { startDate: rows[0].start_date, endDate: rows[0].end_date };
}

/**
 * Multi-row upsert, chunked.
 *
 * `table`, `columns` and `conflict` are module-local literals from the two call
 * sites below — never request data — so interpolating them into the SQL text is
 * safe. Every VALUE is bound as a parameter.
 *
 * ingested_at is deliberately NOT in `columns`: it takes its DEFAULT now() on
 * insert and is forced to now() on update, so it always means "when did we last
 * confirm this row", which is exactly what the route's staleness check reads.
 */
async function upsertChunked(
  table: string,
  columns: string[],
  conflict: string[],
  rows: unknown[][]
): Promise<number> {
  if (rows.length === 0) return 0;

  const updates = columns
    .filter((column) => !conflict.includes(column))
    .map((column) => `${column} = EXCLUDED.${column}`)
    .concat("ingested_at = now()")
    .join(", ");

  let written = 0;
  for (let offset = 0; offset < rows.length; offset += UPSERT_CHUNK_ROWS) {
    const chunk = rows.slice(offset, offset + UPSERT_CHUNK_ROWS);
    const params: unknown[] = [];
    const tuples = chunk.map((row) => {
      const placeholders = row.map((value) => {
        params.push(value);
        return `$${params.length}`;
      });
      return `(${placeholders.join(", ")})`;
    });

    const { rowCount } = await query(
      `INSERT INTO ${table} (${columns.join(", ")})
       VALUES ${tuples.join(", ")}
       ON CONFLICT (${conflict.join(", ")}) DO UPDATE SET ${updates}`,
      params
    );
    written += rowCount ?? 0;
  }
  return written;
}

/* ── GA4 ── */

type Ga4Response = {
  rows?: { dimensionValues?: { value?: string }[]; metricValues?: { value?: string }[] }[];
};

/** GA4 returns the `date` dimension as YYYYMMDD; Postgres `date` wants YYYY-MM-DD. */
function ga4DateToIso(value: string): string {
  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
}

function toInt(value: string | undefined): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed) : 0;
}

function runReport(
  propertyId: string,
  token: string,
  range: DateRange,
  conversionMetric: string
): Promise<Response> {
  return fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${encodeURIComponent(propertyId)}:runReport`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        dateRanges: [{ startDate: range.startDate, endDate: range.endDate }],
        dimensions: [{ name: "date" }, { name: "sessionDefaultChannelGroup" }],
        metrics: [{ name: "sessions" }, { name: "totalUsers" }, { name: conversionMetric }],
        // Date x channel over a week is tens of rows. Explicit so a future
        // widened dimension set cannot silently hit GA4's default page size.
        limit: "10000",
      }),
    }
  );
}

/**
 * Pull GA4 sessions / users / conversions by (date, channel) and upsert them.
 * Returns the number of rows written.
 */
export async function ingestGa4(range: DateRange): Promise<number> {
  const propertyId = process.env.GA4_PROPERTY_ID;
  if (!propertyId) {
    throw new Error(
      "GA4_PROPERTY_ID is unset. Add the numeric property id (not the G- measurement id) to apps/web/.env.local."
    );
  }

  const token = await getGoogleAccessToken();

  // Google renamed the GA4 `conversions` metric to `keyEvents` in 2024 and
  // retired the old name. Ask for the current name, and fall back ONCE to the
  // legacy name if this property still answers to it. A property that rejects
  // both is a real error and propagates.
  let res = await runReport(propertyId, token, range, "keyEvents");
  if (res.status === 400) {
    const firstError = (await res.text()).slice(0, 300);
    res = await runReport(propertyId, token, range, "conversions");
    if (!res.ok) {
      throw new Error(
        `GA4 runReport rejected both keyEvents and conversions. First error: ${firstError}`
      );
    }
  }

  if (!res.ok) {
    throw new Error(`GA4 runReport failed (${res.status}): ${(await res.text()).slice(0, 300)}`);
  }

  const report = (await res.json()) as Ga4Response;
  const rows = (report.rows ?? [])
    .map((row) => {
      const date = row.dimensionValues?.[0]?.value;
      const channel = row.dimensionValues?.[1]?.value;
      // A row missing either key cannot satisfy the unique constraint; drop it
      // rather than invent a placeholder channel that would collide with a real
      // one on the next run.
      if (!date || !channel) return null;
      return [
        ga4DateToIso(date),
        channel,
        toInt(row.metricValues?.[0]?.value),
        toInt(row.metricValues?.[1]?.value),
        toInt(row.metricValues?.[2]?.value),
      ];
    })
    .filter((row): row is (string | number)[] => row !== null);

  return upsertChunked(
    "analytics_daily",
    ["date", "channel", "sessions", "users", "conversions"],
    ["date", "channel"],
    rows
  );
}

/* ── Search Console ── */

type GscResponse = {
  rows?: {
    keys?: string[];
    clicks?: number;
    impressions?: number;
    ctr?: number;
    position?: number;
  }[];
};

function toNum(value: number | undefined): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

/**
 * Pull Search Console clicks / impressions / ctr / position by
 * (date, query, page) and upsert them. Returns the number of rows written.
 */
export async function ingestSearchConsole(range: DateRange): Promise<number> {
  const siteUrl = process.env.GSC_SITE_URL;
  if (!siteUrl) {
    throw new Error(
      "GSC_SITE_URL is unset. Use the exact property string from Search Console — " +
        "for a URL-prefix property that includes the scheme AND the trailing slash."
    );
  }

  const token = await getGoogleAccessToken();

  // The site URL is a path SEGMENT here, so it must be percent-encoded whole:
  // https://blueridgehomesnc.com/ -> https%3A%2F%2Fblueridgehomesnc.com%2F
  const res = await fetch(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(
      siteUrl
    )}/searchAnalytics/query`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        startDate: range.startDate,
        endDate: range.endDate,
        dimensions: ["date", "query", "page"],
        rowLimit: GSC_ROW_LIMIT,
      }),
    }
  );

  if (!res.ok) {
    throw new Error(
      `Search Console searchanalytics.query failed (${res.status}): ${(await res.text()).slice(0, 300)}`
    );
  }

  const report = (await res.json()) as GscResponse;
  const raw = report.rows ?? [];

  // Exactly at the cap means Google almost certainly had more to give. Say so —
  // a truncated ingest that reports a clean row count reads as full coverage.
  if (raw.length >= GSC_ROW_LIMIT) {
    console.warn(
      `[ingest] Search Console returned ${raw.length} rows, at the ${GSC_ROW_LIMIT} rowLimit — ` +
        `results are likely truncated for ${range.startDate}..${range.endDate}. Paginate with startRow.`
    );
  }

  const rows = raw
    .map((row) => {
      const [date, searchQuery, page] = row.keys ?? [];
      if (!date || !searchQuery || !page) return null;
      return [
        date,
        searchQuery,
        page,
        Math.round(toNum(row.clicks)),
        Math.round(toNum(row.impressions)),
        // GSC gives ctr as a 0..1 fraction and position as a float. Both are
        // stored as given; formatting to a percentage is the panel's job.
        toNum(row.ctr),
        toNum(row.position),
      ];
    })
    .filter((row): row is (string | number)[] => row !== null);

  return upsertChunked(
    "search_console_daily",
    ["date", "query", "page", "clicks", "impressions", "ctr", "position"],
    ["date", "query", "page"],
    rows
  );
}
