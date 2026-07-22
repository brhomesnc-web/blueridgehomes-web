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
  | { ok: true; slug: string }
  | { ok: false; error: string; code: string };

/**
 * Column order matches app/api/blog/route.ts's INSERT exactly — that route stays
 * the reference for this table's shape.
 *
 * ON CONFLICT (slug) DO NOTHING requires a unique index on blog_posts.slug (manual
 * VPS step). Without it Postgres errors, the tx rolls back, and the caller returns
 * 503 — it fails closed, never double-publishes.
 *
 * published is the literal true: approval IS the decision to publish.
 *
 * RETURNING id, slug hands the caller the slug the DB actually holds — the
 * validated/trimmed one, not whatever raw string the payload carried. That is
 * the value the /blog/[slug] route keys on, so it is what gets revalidated.
 */
async function publishContentPost(
  client: PoolClient,
  payload: ContentDraftPayload
): Promise<ExecuteResult> {
  const { rows } = await client.query<{ id: number; slug: string }>(
    `INSERT INTO blog_posts
       (slug, title, date, description, content, featured_image, tags, published)
     VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8)
     ON CONFLICT (slug) DO NOTHING
     RETURNING id, slug`,
    [
      payload.slug,
      payload.title,
      payload.date,
      payload.description,
      payload.content,
      payload.featured_image,
      JSON.stringify(payload.tags),
      true,
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

  return { ok: true, slug: rows[0].slug };
}

export async function executeApprovedAction(
  client: PoolClient,
  row: QueueRow
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
      return publishContentPost(client, parsed.payload);
    }

    default:
      return {
        ok: false,
        error: `No executor for ${row.module}/${row.action}`,
        code: "no_executor",
      };
  }
}
