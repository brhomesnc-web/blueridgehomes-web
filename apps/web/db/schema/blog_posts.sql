-- blog_posts — record of intent.
--
-- This table PREDATES the db/schema convention; it existed only implicitly in
-- query strings (app/api/blog/route.ts, lib/blog.ts). Captured here so it is not
-- invisible production state. NOT run by the build; applied by hand like every
-- other file in db/schema/.
--
-- ⚠ UNVERIFIED AGAINST LIVE. This shape is INFERRED from the code that reads and
-- writes the table, not from `\d blog_posts`. Confidence per column:
--
--   confirmed by code   tags is jsonb        ($7::jsonb cast + lib/blog.ts's
--                                             "pg driver returns JSONB as parsed")
--                       published is boolean (published = TRUE comparisons)
--                       id exists            (SELECT id / RETURNING id)
--   INFERRED, may differ date, updated_at, id's serial-ness, every NOT NULL and
--                       every DEFAULT below — none of these are observable from
--                       the query strings alone.
--
-- `date` is the one to check: the INSERT binds a JS string with no cast, so the
-- live column could be text OR date/timestamptz with Postgres coercing on the way
-- in. If it is a date type, node-pg returns a JS Date, not a string — which would
-- make lib/blog.ts's `date: string` typing wrong too.
--
-- Reconcile against `\d blog_posts` on the VPS and correct this file. Until then,
-- treat it as intent, not record. CREATE TABLE IF NOT EXISTS means a wrong type
-- here is a SILENT no-op against the existing table — it will not error, it will
-- just quietly disagree with production.

CREATE TABLE IF NOT EXISTS blog_posts (
  id             serial       PRIMARY KEY,
  slug           text         NOT NULL,
  title          text         NOT NULL,
  date           text         NOT NULL,
  description    text         NOT NULL DEFAULT '',
  content        text         NOT NULL,
  featured_image text         NOT NULL DEFAULT '',
  tags           jsonb        NOT NULL DEFAULT '[]'::jsonb,
  published      boolean      NOT NULL DEFAULT false,
  updated_at     timestamptz
);

-- Required by the Content module's execute-on-approve step
-- (lib/queueExecutor.ts INSERT ... ON CONFLICT (slug) DO NOTHING).
-- Without this, ON CONFLICT raises and the approve tx fails closed (503).
--
-- Unlike the CREATE TABLE above, this index is NEW state this commit introduces —
-- it is a real change to production, not a recording of it. Apply it deliberately:
--   psql -p 5433 -d <db> -f /var/www/brhomes/apps/web/db/schema/blog_posts.sql
-- It will fail if duplicate slugs already exist; the pre-Content blog door used a
-- check-then-insert with a race window, so verify first:
--   SELECT slug, count(*) FROM blog_posts GROUP BY slug HAVING count(*) > 1;
CREATE UNIQUE INDEX IF NOT EXISTS blog_posts_slug_key ON blog_posts (slug);
