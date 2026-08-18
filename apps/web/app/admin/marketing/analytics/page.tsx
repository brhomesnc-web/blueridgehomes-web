import { query } from "@/lib/db";
import AnalyticsClient, {
  type AnalyticsData,
  type Ga4ChannelRow,
  type GscRow,
} from "../_components/AnalyticsClient";

/**
 * Analytics — the first admin page on which every number is measured.
 *
 * Server component, same shape as the Overview page: read with lib/db query(),
 * hand the result to a client component that owns the Recharts rendering. Unlike
 * Overview there is no representative series here at all. If a table is empty or
 * its DDL has not been applied, the client renders EmptyState.
 *
 * Reads what lib/analyticsIngest.ts writes. Both tables are keyed for re-ingest,
 * so the trailing window below always sees one row per key, never duplicates.
 */
export const dynamic = "force-dynamic";

/** Reporting window for every panel. Wide enough that a low-traffic week still
 *  shows a ranking, short enough to reflect current search performance. */
const WINDOW_DAYS = 28;

/** Postgres undefined_table — the db/schema DDL is not applied on this database. */
const UNDEFINED_TABLE = "42P01";

function isMissingTable(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    String((err as { code: unknown }).code) === UNDEFINED_TABLE
  );
}

/**
 * The window predicate, resolved in SQL.
 *
 * The process runs UTC and the business runs America/New_York; this repo's
 * convention is to settle that with AT TIME ZONE rather than in JS (see
 * db/schema/blog_posts.sql). A JS-computed cutoff would move the window a day
 * early for the four hours after 8pm Eastern.
 */
const WINDOW_PREDICATE =
  "date > (now() AT TIME ZONE 'America/New_York')::date - $1::int";

/**
 * Aggregates over the window, grouped by one GSC dimension.
 *
 * ctr is recomputed from the summed clicks/impressions rather than averaged —
 * averaging per-day ratios weights a 1-impression day the same as a 1000-
 * impression one. Average position is impression-weighted for the same reason.
 * ::float8 so pg returns numbers; a bare numeric comes back as a string.
 */
function gscRollup(dimension: "query" | "page"): string {
  return `SELECT ${dimension} AS key,
                 SUM(clicks)::int      AS clicks,
                 SUM(impressions)::int AS impressions,
                 COALESCE(SUM(clicks)::numeric / NULLIF(SUM(impressions), 0), 0)::float8       AS ctr,
                 COALESCE(SUM(position * impressions) / NULLIF(SUM(impressions), 0), 0)::float8 AS position
            FROM search_console_daily
           WHERE ${WINDOW_PREDICATE}
        GROUP BY ${dimension}
        ORDER BY clicks DESC, impressions DESC
           LIMIT 25`;
}

async function loadAnalytics(): Promise<AnalyticsData> {
  const empty: AnalyticsData = {
    windowDays: WINDOW_DAYS,
    lastIngest: null,
    tablesReady: true,
    gscTotals: null,
    gscQueries: [],
    gscPages: [],
    ga4Channels: [],
  };

  try {
    const [totals, queries, pages, channels, ingest] = await Promise.all([
      query<{ clicks: number; impressions: number; ctr: number; position: number }>(
        `SELECT COALESCE(SUM(clicks), 0)::int      AS clicks,
                COALESCE(SUM(impressions), 0)::int AS impressions,
                COALESCE(SUM(clicks)::numeric / NULLIF(SUM(impressions), 0), 0)::float8       AS ctr,
                COALESCE(SUM(position * impressions) / NULLIF(SUM(impressions), 0), 0)::float8 AS position
           FROM search_console_daily
          WHERE ${WINDOW_PREDICATE}`,
        [WINDOW_DAYS]
      ),
      query<GscRow>(gscRollup("query"), [WINDOW_DAYS]),
      query<GscRow>(gscRollup("page"), [WINDOW_DAYS]),
      query<Ga4ChannelRow>(
        `SELECT channel,
                SUM(sessions)::int    AS sessions,
                SUM(users)::int       AS users,
                SUM(conversions)::int AS conversions
           FROM analytics_daily
          WHERE ${WINDOW_PREDICATE}
       GROUP BY channel
       ORDER BY sessions DESC`,
        [WINDOW_DAYS]
      ),
      // GREATEST, not LEAST: this line is a "last confirmed" timestamp for the
      // operator, not the staleness decision. The route owns that, and uses
      // LEAST so the older table drives.
      query<{ last_ingest: string | null }>(
        `SELECT to_char(
                  GREATEST(
                    (SELECT max(ingested_at) FROM analytics_daily),
                    (SELECT max(ingested_at) FROM search_console_daily)
                  ) AT TIME ZONE 'America/New_York',
                  'YYYY-MM-DD HH24:MI'
                ) AS last_ingest`
      ),
    ]);

    const totalRow = totals.rows[0];
    return {
      ...empty,
      lastIngest: ingest.rows[0]?.last_ingest ?? null,
      // A window with no impressions has no meaningful CTR or position, so the
      // KPI cards get null and render an em dash rather than 0.0% / 0.0.
      gscTotals: totalRow && totalRow.impressions > 0 ? totalRow : null,
      gscQueries: queries.rows,
      gscPages: pages.rows,
      ga4Channels: channels.rows,
    };
  } catch (err) {
    if (isMissingTable(err)) {
      return { ...empty, tablesReady: false };
    }
    // Any other failure is a real fault, not an empty state. Log it and degrade
    // to the same honest blank rather than rendering a number nobody measured.
    console.error(
      "[analytics] panel query failed:",
      err instanceof Error ? err.message : err
    );
    return { ...empty, tablesReady: false };
  }
}

export default async function AnalyticsPage() {
  const data = await loadAnalytics();
  return <AnalyticsClient data={data} />;
}
