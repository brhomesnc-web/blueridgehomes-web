-- search_console_daily — Google Search Console performance, one row per
-- (date, query, page).
--
-- Applied MANUALLY on the VPS Postgres (:5433, db brhomes) by the operator — it
-- is NOT executed by the build. No migration runner exists in this repo; every
-- file in db/schema/ is a checked-in snapshot applied by hand through psql. See
-- approval_queue.sql for where that convention started.
--
-- Written by lib/analyticsIngest.ts (ingestSearchConsole), driven by the hourly
-- tick in instrumentation.ts -> POST /api/internal/ingest-analytics. Read by
-- app/admin/marketing/analytics/page.tsx.
--
-- WHY the trailing-window re-ingest matters here specifically: Search Console
-- data lags 2-3 days AND back-fills — a row for a given date keeps changing for
-- days after that date. Ingesting only "yesterday" would permanently record the
-- partial numbers. The ingest therefore re-walks a 7-day window every run and
-- lets ON CONFLICT overwrite, so late-arriving clicks land.

CREATE TABLE IF NOT EXISTS search_console_daily (
  id           serial        PRIMARY KEY,
  date         date          NOT NULL,           -- GSC `date` dimension (property timezone, America/Los_Angeles per Google)
  query        text          NOT NULL,           -- the search term
  page         text          NOT NULL,           -- the landing page URL, absolute
  clicks       integer       NOT NULL DEFAULT 0,
  impressions  integer       NOT NULL DEFAULT 0,
  ctr          numeric(9,6)  NOT NULL DEFAULT 0, -- GSC returns a 0..1 fraction, NOT a percentage. Stored as given.
  position     numeric(6,2)  NOT NULL DEFAULT 0, -- average position, 1-based
  ingested_at  timestamptz   NOT NULL DEFAULT now(),

  -- The re-ingest key: lib/analyticsIngest.ts does
  -- INSERT ... ON CONFLICT (date, query, page) DO UPDATE against this.
  --
  -- Btree caps an index entry at ~2704 bytes. A GSC query maxes out well under
  -- 100 chars and a page URL on this site under ~150, so the pair has three
  -- orders of magnitude of headroom. Noted because a future dimension swap to
  -- something unbounded would fail at INSERT time, not at CREATE time.
  CONSTRAINT search_console_daily_date_query_page_key UNIQUE (date, query, page)
);

-- The admin panel aggregates a trailing window grouped by query and by page;
-- the route's staleness check reads max(ingested_at).
CREATE INDEX IF NOT EXISTS search_console_daily_date_idx
  ON search_console_daily (date DESC);
CREATE INDEX IF NOT EXISTS search_console_daily_date_clicks_idx
  ON search_console_daily (date DESC, clicks DESC);
CREATE INDEX IF NOT EXISTS search_console_daily_ingested_at_idx
  ON search_console_daily (ingested_at DESC);

-- ---------------------------------------------------------------------------
-- CREATE TABLE IF NOT EXISTS skips the ENTIRE statement when the table already
-- exists — it does not diff columns. So any column added to the block above in a
-- later edit exists only in git until it is ALSO added as an idempotent ALTER
-- here. Same trap documented in blog_posts.sql. Re-running this file is safe.
ALTER TABLE search_console_daily ADD COLUMN IF NOT EXISTS clicks      integer      NOT NULL DEFAULT 0;
ALTER TABLE search_console_daily ADD COLUMN IF NOT EXISTS impressions integer      NOT NULL DEFAULT 0;
ALTER TABLE search_console_daily ADD COLUMN IF NOT EXISTS ctr         numeric(9,6) NOT NULL DEFAULT 0;
ALTER TABLE search_console_daily ADD COLUMN IF NOT EXISTS position    numeric(6,2) NOT NULL DEFAULT 0;
ALTER TABLE search_console_daily ADD COLUMN IF NOT EXISTS ingested_at timestamptz  NOT NULL DEFAULT now();

-- Verify what you actually applied:
--   \d search_console_daily
--   SELECT date, query, page, clicks, impressions, round(ctr * 100, 2) AS ctr_pct, position
--     FROM search_console_daily ORDER BY date DESC, clicks DESC LIMIT 20;
