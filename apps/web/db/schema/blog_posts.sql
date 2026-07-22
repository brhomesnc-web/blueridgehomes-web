-- blog_posts — record of intent (reconciled against live `\d blog_posts`, 2026-07-17).
-- This table PREDATES the db/schema convention; it existed only implicitly in
-- query strings (app/api/blog/route.ts, lib/blog.ts). Captured here so it is not
-- invisible production state. NOT run by the build; applied by hand like every
-- other file in db/schema/. Types/defaults/indexes below MATCH the live table.
CREATE TABLE IF NOT EXISTS blog_posts (
  id             serial       PRIMARY KEY,
  slug           text         NOT NULL,
  title          text         NOT NULL,
  date           text         NOT NULL,
  description    text                      DEFAULT '',
  content        text                      DEFAULT '',
  featured_image text                      DEFAULT '',
  tags           jsonb                     DEFAULT '[]'::jsonb,
  published      boolean                   DEFAULT false,
  publish_at     timestamptz,              -- NULL = not scheduled; see note at bottom
  created_at     timestamptz               DEFAULT now(),
  updated_at     timestamptz               DEFAULT now(),
  CONSTRAINT blog_posts_slug_key UNIQUE (slug)
);

-- Live indexes (beyond the pk and the slug unique constraint above):
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts (published, date DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug      ON blog_posts (slug);

-- NOTE: the slug uniqueness is enforced by the CONSTRAINT above (live name
-- blog_posts_slug_key), which is what lib/queueExecutor.ts's
-- INSERT ... ON CONFLICT (slug) relies on. No separate unique index is needed.

-- ---------------------------------------------------------------------------
-- The CREATE above is a no-op against the existing live table (IF NOT EXISTS
-- skips the whole statement), so new columns must ALSO be added as an
-- idempotent ALTER or they exist only in git. Re-running this file is safe.
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS publish_at timestamptz;

-- Scheduling a post (backend-only slice — psql is the only interface):
--   The server and Postgres both run Etc/UTC. A bare literal is therefore UTC,
--   NOT Eastern: '2026-08-05 06:00' = 2am NY = four hours early, silently.
--   ALWAYS name the zone:
--
--     UPDATE blog_posts
--        SET published = false,
--            publish_at = TIMESTAMP '2026-08-05 06:00' AT TIME ZONE 'America/New_York'
--      WHERE slug = 'your-slug';
--
--   Verify what you actually stored before walking away:
--     SELECT slug, publish_at, publish_at AT TIME ZONE 'America/New_York' AS ny
--       FROM blog_posts WHERE slug = 'your-slug';
--
-- The tick (instrumentation.ts -> POST /api/internal/publish-due) flips
-- published = true once publish_at <= now(), stamps `date` from publish_at in
-- NY local time, and revalidates /blog. A missed tick publishes late rather
-- than never: the predicate is a catch-up, not an exact-match.
