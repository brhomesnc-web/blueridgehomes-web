import type { PoolClient } from "pg";
import {
  validateContentDraft,
  type ContentDraftPayload,
  type QueueRow,
} from "./approvalQueue";

/**
 * The central execute-on-approve dispatcher.
 *
 * Every module registers its "what actually happens when a human approves this"
 * step here, keyed by (module, action). Approving a row is only a status flip
 * until something in this switch turns it into a real effect.
 *
 * Contract with the caller: this runs on a client already inside a transaction,
 * and it never commits or rolls back. It returns ok:false instead of throwing so
 * the caller decides the HTTP mapping; the caller aborts the tx on failure, which
 * is what undoes the status flip.
 */

export type ExecuteResult =
  | { ok: true; slug: string; published: boolean }
  | { ok: false; error: string; code: string };

/**
 * One of exactly three code paths that can set published = true, and the only one
 * that can do it to a post the queue has not already approved. The other two act
 * on rows this INSERT created: the 60s scheduler tick
 * (app/api/internal/publish-due/route.ts) flips scheduled rows when they come
 * due, and the schedule route's `publish_now` action flips one on demand.
 *
 * The old BLOG_AGENT_API_KEY doors (POST /api/blog, PUT /api/blog/[slug]) became
 * 410 stubs in 566dd15, and the session-gated admin CRUD (POST /api/admin/blog,
 * PUT /api/admin/blog/[slug]) stopped accepting `published` at all in the
 * unpublish slice — it now 400s on a body that carries the key. So nothing
 * outside the approval path can put a post on the site. The
 * column order here is simply blog_posts' own declared order — see
 * db/schema/blog_posts.sql, which is the reference now that the old route is gone.
 *
 * ON CONFLICT (slug) DO NOTHING requires a unique index on blog_posts.slug (manual
 * VPS step). Without it Postgres errors, the tx rolls back, and the caller returns
 * 503 — it fails closed, never double-publishes.
 *
 * published is NOT a literal any more: approval is the decision to publish,
 * but publishAtLocal decides WHEN. Absent (null) publishes immediately, exactly
 * as before; present schedules, and the 60s tick in instrumentation.ts flips the
 * row live at that instant.
 *
 * publishAtLocal is a naive NY wall-clock string (see lib/publishAt.ts), so the
 * three derived columns all fall out of the one parameter:
 *   - published  = there is no schedule
 *   - date       = the schedule's date portion (already NY-local), else the
 *                  drafter's date. Without this a scheduled post would display
 *                  whatever date the drafter happened to type.
 *   - publish_at = the instant, converted from NY to timestamptz by Postgres.
 * The ::timestamp casts are required so Postgres can type a NULL parameter.
 * NULL AT TIME ZONE '…' is NULL, so the last column needs no CASE.
 *
 * The scheduler re-stamps `date` from publish_at at flip time using the same
 * derivation, so the row can never disagree with itself.
 *
 * RETURNING id, slug hands the caller the slug the DB actually holds — the
 * validated/trimmed one, not whatever raw string the payload carried. That is
 * the value the /blog/[slug] route keys on, so it is what gets revalidated.
 * `published` comes back too: a scheduled approve puts nothing on /blog, and
 * revalidating a page that did not change is pointless work.
 */
async function publishContentPost(
  client: PoolClient,
  payload: ContentDraftPayload,
  publishAtLocal: string | null
): Promise<ExecuteResult> {
  const { rows } = await client.query<{ id: number; slug: string; published: boolean }>(
    `INSERT INTO blog_posts
       (slug, title, date, description, content, featured_image, tags, published, publish_at)
     VALUES (
       $1, $2,
       CASE WHEN $8::timestamp IS NULL THEN $3 ELSE to_char($8::timestamp, 'YYYY-MM-DD') END,
       $4, $5, $6, $7::jsonb,
       $8::timestamp IS NULL,
       $8::timestamp AT TIME ZONE 'America/New_York'
     )
     ON CONFLICT (slug) DO NOTHING
     RETURNING id, slug, published`,
    [
      payload.slug,
      payload.title,
      payload.date,
      payload.description,
      payload.content,
      payload.featured_image,
      JSON.stringify(payload.tags),
      publishAtLocal,
    ]
  );

  if (rows.length === 0) {
    // DO NOTHING swallowed the insert: the slug is taken. Caller rolls back, so
    // the row stays pending and can be edited and retried.
    return {
      ok: false,
      error: "A post with this slug already exists",
      code: "slug_conflict",
    };
  }

  return { ok: true, slug: rows[0].slug, published: rows[0].published };
}

export async function executeApprovedAction(
  client: PoolClient,
  row: QueueRow,
  publishAtLocal: string | null = null
): Promise<ExecuteResult> {
  switch (`${row.module}/${row.action}`) {
    case "Content/publish_post": {
      // payload is jsonb — it was validated at enqueue, but it is untrusted
      // storage and could have been written by anything. Re-validate rather than
      // cast: this is the last gate before a public INSERT.
      const parsed = validateContentDraft(row.payload);
      if (!parsed.ok) {
        return {
          ok: false,
          error: `Stored payload is invalid: ${parsed.error}`,
          code: "invalid_payload",
        };
      }
      return publishContentPost(client, parsed.payload, publishAtLocal);
    }

    default:
      return {
        ok: false,
        error: `No executor for ${row.module}/${row.action}`,
        code: "no_executor",
      };
  }
}
