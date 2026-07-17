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
