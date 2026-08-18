-- analytics_daily — GA4 traffic, one row per (date, channel).
--
-- Applied MANUALLY on the VPS Postgres (:5433, db brhomes) by the operator — it
-- is NOT executed by the build. There is no migration runner in this repo; every
-- file in db/schema/ is a checked-in snapshot of intent that someone runs through
-- psql by hand. See approval_queue.sql for where that convention started.
--
-- Written by lib/analyticsIngest.ts (ingestGa4), driven by the hourly tick in
-- instrumentation.ts -> POST /api/internal/ingest-analytics. Read by
-- app/admin/marketing/analytics/page.tsx.
--
-- `channel` is GA4's sessionDefaultChannelGroup dimension verbatim: 'Organic
-- Search', 'Direct', 'Paid Search', 'Referral', 'Organic Social', ... It is NOT
-- normalized on the way in — GA4 owns that vocabulary and re-deriving it here
-- would drift from what the GA4 UI shows the operator.

CREATE TABLE IF NOT EXISTS analytics_daily (
  id           serial       PRIMARY KEY,
  date         date         NOT NULL,          -- the GA4 `date` dimension, America/New_York per the property's reporting zone
  channel      text         NOT NULL,          -- GA4 sessionDefaultChannelGroup, verbatim
  sessions     integer      NOT NULL DEFAULT 0,
  users        integer      NOT NULL DEFAULT 0, -- GA4 totalUsers
  conversions  integer      NOT NULL DEFAULT 0, -- GA4 keyEvents (renamed from `conversions` in 2024; column keeps the business word)
  ingested_at  timestamptz  NOT NULL DEFAULT now(),

  -- The re-ingest key. The ingest walks a trailing window every run, so the same
  -- (date, channel) is written many times; this constraint is what makes that an
  -- UPDATE instead of a pile of duplicates. lib/analyticsIngest.ts's
  -- INSERT ... ON CONFLICT (date, channel) DO UPDATE relies on it existing.
  CONSTRAINT analytics_daily_date_channel_key UNIQUE (date, channel)
);

-- The admin panel reads a trailing window newest-first, and the route's
-- staleness check reads max(ingested_at).
CREATE INDEX IF NOT EXISTS analytics_daily_date_idx
  ON analytics_daily (date DESC);
CREATE INDEX IF NOT EXISTS analytics_daily_ingested_at_idx
  ON analytics_daily (ingested_at DESC);

-- ---------------------------------------------------------------------------
-- CREATE TABLE IF NOT EXISTS skips the ENTIRE statement when the table already
-- exists — it does not diff columns. So any column added to the block above in a
-- later edit exists only in git until it is ALSO added as an idempotent ALTER
-- here. Same trap documented in blog_posts.sql. Re-running this file is safe.
ALTER TABLE analytics_daily ADD COLUMN IF NOT EXISTS sessions    integer     NOT NULL DEFAULT 0;
ALTER TABLE analytics_daily ADD COLUMN IF NOT EXISTS users       integer     NOT NULL DEFAULT 0;
ALTER TABLE analytics_daily ADD COLUMN IF NOT EXISTS conversions integer     NOT NULL DEFAULT 0;
ALTER TABLE analytics_daily ADD COLUMN IF NOT EXISTS ingested_at timestamptz NOT NULL DEFAULT now();

-- Verify what you actually applied:
--   \d analytics_daily
--   SELECT date, channel, sessions, users, conversions FROM analytics_daily
--    ORDER BY date DESC, sessions DESC LIMIT 20;
