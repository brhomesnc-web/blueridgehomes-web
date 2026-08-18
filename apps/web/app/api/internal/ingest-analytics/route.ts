import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { checkApiKey } from "@/lib/agentAuth";
import {
  DEFAULT_TRAILING_DAYS,
  ingestGa4,
  ingestSearchConsole,
  trailingWindow,
} from "@/lib/analyticsIngest";

/**
 * The analytics ingest's business end.
 *
 * instrumentation.ts ticks hourly and POSTs here; this handler decides whether
 * the data is actually stale and, if so, pulls GA4 and Search Console. Same
 * split as /api/internal/publish-due: the timer never touches the database or
 * Google, it just knocks on this door.
 *
 * WHY the staleness check lives HERE and not in the timer: setInterval has no
 * calendar semantics and its clock restarts on every deploy. A naked 24h
 * interval on a unit that gets deployed most days would fire approximately
 * never. So the tick is hourly and cheap, and the LAST-RUN MARKER IS
 * max(ingested_at) IN THE TABLES — durable state that survives a restart,
 * rather than a module variable that does not.
 *
 * POST only, gated on PUBLISH_SCHEDULER_KEY. Reusing the scheduler's existing
 * key rather than minting a second one is deliberate: both doors are the same
 * trust boundary (the local timer), and a second key is a second thing to fail
 * to set. Reachable from the public internet via nginx's catch-all `location /`,
 * so the key check happens BEFORE any DB or Google work.
 */

/**
 * Re-ingest when the freshest row is older than this. Comfortably under 24h so
 * the run drifts earlier rather than skipping a day, and comfortably over the
 * 1h tick so a normal day does exactly one real ingest.
 */
const STALE_AFTER_HOURS = 20;

/** Postgres undefined_table — the DDL in db/schema/ has not been applied yet. */
const UNDEFINED_TABLE = "42P01";

function pgErrorCode(err: unknown): string | undefined {
  return typeof err === "object" && err !== null && "code" in err
    ? String((err as { code: unknown }).code)
    : undefined;
}

type StalenessRow = { is_stale: boolean; last_ingest: string | null };

export async function POST(request: Request) {
  if (!checkApiKey(request, process.env.PUBLISH_SCHEDULER_KEY || "")) {
    return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 });
  }

  let staleness: StalenessRow;
  try {
    // LEAST, not GREATEST: the OLDER of the two tables drives the decision, so a
    // fresh GA4 pull cannot mask a Search Console table that never ingested. The
    // 'epoch' coalesce makes an empty table read as infinitely stale, which is
    // what makes the very first run happen with no special-casing.
    const { rows } = await query<StalenessRow>(
      `SELECT LEAST(
                COALESCE((SELECT max(ingested_at) FROM analytics_daily),       'epoch'::timestamptz),
                COALESCE((SELECT max(ingested_at) FROM search_console_daily),  'epoch'::timestamptz)
              ) < now() - ($1::int * interval '1 hour') AS is_stale,
              to_char(
                LEAST(
                  COALESCE((SELECT max(ingested_at) FROM analytics_daily),      'epoch'::timestamptz),
                  COALESCE((SELECT max(ingested_at) FROM search_console_daily), 'epoch'::timestamptz)
                ) AT TIME ZONE 'America/New_York',
                'YYYY-MM-DD HH24:MI'
              ) AS last_ingest`,
      [STALE_AFTER_HOURS]
    );
    staleness = rows[0];
  } catch (err) {
    // Most likely: relation "analytics_daily" does not exist — db/schema/
    // analytics_daily.sql and search_console_daily.sql have not been applied to
    // this database yet. Same degrade shape as publish-due's missing publish_at.
    const code = pgErrorCode(err);
    console.error(
      "[ingest] staleness check failed:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json(
      {
        error:
          code === UNDEFINED_TABLE
            ? "Analytics tables are not present. Apply db/schema/analytics_daily.sql and db/schema/search_console_daily.sql."
            : "Analytics ingest is not available yet.",
      },
      { status: 503 }
    );
  }

  // The common case for 23 of every 24 ticks. Cheap: one index-only-ish read and
  // no Google round-trip.
  if (!staleness.is_stale) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      lastIngest: staleness.last_ingest,
      ga4Rows: 0,
      gscRows: 0,
    });
  }

  let ga4Rows: number;
  let gscRows: number;
  try {
    const range = await trailingWindow(DEFAULT_TRAILING_DAYS);
    // Sequential, not Promise.all: they share one cached access token, and
    // running them in order means the second mints nothing and a GA4 failure
    // does not leave a half-finished GSC write racing it.
    ga4Rows = await ingestGa4(range);
    gscRows = await ingestSearchConsole(range);
    console.log(
      `[ingest] ${range.startDate}..${range.endDate} — analytics_daily ${ga4Rows} row(s), search_console_daily ${gscRows} row(s)`
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // The tables exist (the staleness read above succeeded), so this is an
    // upstream failure: unset/!decodable service-account key, an API not enabled
    // on the project, or the service account not granted on the property. 502
    // rather than 503 keeps "Google said no" distinguishable from "DDL missing"
    // in the journal.
    console.error("[ingest] ingest failed:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }

  return NextResponse.json({ ok: true, ga4Rows, gscRows });
}
