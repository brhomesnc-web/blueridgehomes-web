-- approval_queue — the marketing platform's human-in-the-loop review table.
--
-- Introduces version-controlled schema for this repo (recon §3 found NO migration
-- system; all prior tables were applied ad-hoc on the VPS). This file is the
-- source of truth for the table shape and is applied MANUALLY on the VPS Postgres
-- (:5433) by the operator — it is NOT executed by the build.
--
-- Column idioms mirror the existing `submissions` table (recon §3): serial PK,
-- timestamptz created_at default now(), snake_case columns, a text status enum
-- (as submissions.status uses new|read|replied|archived), and JSONB for payload.
--
-- Producers (agent modules that enqueue actions for review) are deferred to a
-- later slice; nothing writes to this table yet.

CREATE TABLE IF NOT EXISTS approval_queue (
  id           serial       PRIMARY KEY,
  created_at   timestamptz  NOT NULL DEFAULT now(),
  module       text         NOT NULL,                 -- e.g. 'Content' | 'Social' | 'Ads' | 'Email' | 'Reviews'
  action       text         NOT NULL,                 -- machine action key, e.g. 'publish_post'
  stakes       text         NOT NULL DEFAULT 'medium' -- 'high' | 'medium' | 'low'
                 CHECK (stakes IN ('high', 'medium', 'low')),
  title        text         NOT NULL,                 -- human-facing headline
  preview      text,                                  -- human-facing preview / summary
  payload      jsonb        NOT NULL DEFAULT '{}'::jsonb,
  status       text         NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'approved', 'rejected', 'auto_approved')),
  reviewed_at  timestamptz,
  reviewer     text
);

-- The queue is read almost exclusively by status (tab filters) ordered newest-first.
CREATE INDEX IF NOT EXISTS approval_queue_status_created_idx
  ON approval_queue (status, created_at DESC);
