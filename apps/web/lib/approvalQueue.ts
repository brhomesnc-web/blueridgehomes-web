import { query } from "./db";
import { notifyDraftCreated } from "./notify";

/**
 * approval_queue enqueue core + the Content payload contract.
 *
 * One validate/insert path shared by both drafting doors — the session-gated
 * human route (app/api/admin/marketing/content) and the key-gated agent route
 * (app/api/agent/content). Neither wrapper duplicates validation or SQL.
 */

// The 11 columns the queue GET/PATCH already return. Kept identical so every
// surface sees the same row shape.
export const QUEUE_COLUMNS =
  "id, created_at, module, action, stakes, title, preview, payload, status, reviewed_at, reviewer";

// The legal status values, shared by the queue readers. The admin queue route used
// to keep its own copy of this list inline; listQueue() is now the single home.
export const QUEUE_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "auto_approved",
] as const;
export type QueueStatus = (typeof QUEUE_STATUSES)[number];

export type QueueRow = {
  id: number;
  created_at: string;
  module: string;
  action: string;
  stakes: string;
  title: string;
  preview: string | null;
  payload: unknown;
  status: string;
  reviewed_at: string | null;
  reviewer: string | null;
};

/**
 * What a Content draft carries through the queue.
 *
 * `published` is deliberately absent: it is not the drafter's decision. Approval
 * IS the decision to publish, so the executor always writes published = true.
 * A draft that shouldn't go live simply isn't approved.
 */
export type ContentDraftPayload = {
  slug: string;
  title: string;
  date: string;
  content: string;
  description: string;
  featured_image: string;
  tags: string[];
};

// Matches the executor's ON CONFLICT (slug) target and the /blog/[slug] route.
// Lowercase alphanumeric words joined by single hyphens; no leading/trailing/
// doubled hyphens.
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// blog_posts.date is TEXT, sorted lexicographically everywhere (the
// (published, date DESC) index and every ORDER BY date). Only zero-padded
// YYYY-MM-DD sorts correctly, so the draft door hard-rejects anything looser — an
// agent filing "July 22, 2026" would otherwise be stored and mis-sort forever.
export const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const PREVIEW_LEN = 140;

export type ValidationResult =
  | { ok: true; payload: ContentDraftPayload }
  | { ok: false; error: string };

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

export function validateContentDraft(input: unknown): ValidationResult {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return { ok: false, error: "Body must be a JSON object" };
  }
  const b = input as Record<string, unknown>;

  for (const field of ["slug", "title", "date", "content"] as const) {
    if (!isNonEmptyString(b[field])) {
      return {
        ok: false,
        error: `${field} is required and must be a non-empty string`,
      };
    }
  }

  const slug = (b.slug as string).trim();
  if (!SLUG_PATTERN.test(slug)) {
    return {
      ok: false,
      error:
        "slug must be lowercase alphanumeric words separated by single hyphens (e.g. my-post-title)",
    };
  }

  const date = (b.date as string).trim();
  if (!DATE_PATTERN.test(date)) {
    return {
      ok: false,
      error: "date must be YYYY-MM-DD (e.g. 2026-08-05)",
    };
  }

  // tags: absent/null -> []. Present -> must be an array of non-empty strings.
  let tags: string[] = [];
  if (b.tags !== undefined && b.tags !== null) {
    if (!Array.isArray(b.tags)) {
      return { ok: false, error: "tags must be an array of strings" };
    }
    if (!b.tags.every(isNonEmptyString)) {
      return { ok: false, error: "tags must contain only non-empty strings" };
    }
    tags = (b.tags as string[]).map((t) => t.trim());
  }

  for (const field of ["description", "featured_image"] as const) {
    const v = b[field];
    if (v !== undefined && v !== null && typeof v !== "string") {
      return { ok: false, error: `${field} must be a string` };
    }
  }

  return {
    ok: true,
    payload: {
      slug,
      title: (b.title as string).trim(),
      date,
      content: b.content as string,
      description: typeof b.description === "string" ? b.description : "",
      featured_image: typeof b.featured_image === "string" ? b.featured_image : "",
      tags,
    },
  };
}

// Exported so the edit path (queue/[id] PATCH) can keep preview in sync with an
// edited payload exactly the way enqueue does — one derivation, not two.
export function buildPreview(payload: ContentDraftPayload): string {
  const source = payload.description.trim() || payload.content.trim();
  const flat = source.replace(/\s+/g, " ").trim();
  if (flat.length <= PREVIEW_LEN) return flat;
  return flat.slice(0, PREVIEW_LEN - 1).trimEnd() + "…";
}

/**
 * Insert one pending Content row.
 *
 * stakes is 'high' — publishing to the public site is not reversible by a queue
 * action, so it always warrants sign-off. reviewer is NULL at enqueue: it records
 * who *reviewed*, and nobody has yet.
 */
export async function enqueueContentDraft(
  payload: ContentDraftPayload,
  opts: { reviewer: string | null; action?: string }
): Promise<QueueRow> {
  const action = opts.action || "publish_post";
  const { rows } = await query<QueueRow>(
    `INSERT INTO approval_queue
       (module, action, stakes, title, preview, payload, status, reviewer)
     VALUES ('Content', $1, 'high', $2, $3, $4::jsonb, 'pending', $5)
     RETURNING ${QUEUE_COLUMNS}`,
    [action, payload.title, buildPreview(payload), JSON.stringify(payload), opts.reviewer]
  );
  // Fire-and-forget push so Brian knows to review. Never awaited, never throws:
  // a notify failure must not break or delay the enqueue that just succeeded.
  notifyDraftCreated({ title: rows[0].title, module: rows[0].module, stakes: rows[0].stakes });
  return rows[0];
}

/**
 * List queue rows newest-first, optionally filtered by status. The one
 * implementation shared by the session-gated admin queue route and the key-gated
 * agent read route — no inline SQL, no duplicated column list.
 *
 * An absent, "all", or unrecognized status returns every row (the same behavior
 * the admin route had). limit defaults to 100; callers that need the old admin
 * ceiling pass it explicitly.
 */
export async function listQueue(
  opts: { status?: string; limit?: number } = {}
): Promise<QueueRow[]> {
  const limit =
    Number.isInteger(opts.limit) && (opts.limit as number) > 0
      ? (opts.limit as number)
      : 100;
  const applyStatus =
    !!opts.status &&
    opts.status !== "all" &&
    (QUEUE_STATUSES as readonly string[]).includes(opts.status);

  const params: unknown[] = [];
  let where = "";
  if (applyStatus) {
    params.push(opts.status);
    where = ` WHERE status = $${params.length}`;
  }
  params.push(limit);
  const limitPlaceholder = `$${params.length}`;

  const { rows } = await query<QueueRow>(
    `SELECT ${QUEUE_COLUMNS} FROM approval_queue${where} ORDER BY created_at DESC LIMIT ${limitPlaceholder}`,
    params
  );
  return rows;
}
