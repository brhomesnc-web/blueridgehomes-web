import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { query, withTransaction } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { executeApprovedAction } from "@/lib/queueExecutor";
import {
  QUEUE_COLUMNS,
  buildPreview,
  validateContentDraft,
  type QueueRow,
} from "@/lib/approvalQueue";
import { hasUnresolvedMedia } from "@/lib/mediaBlocks";

// GET one queue item (full payload) and PATCH it. getSession()-guarded.
// Reviewer is "admin" — the app has a single admin identity (admin_config is a
// single row); a later multi-user slice can carry a real reviewer name.
//
// PATCH does three things behind one door, all gated to pending rows and all
// inside one transaction:
//   { payload }                    -> Save draft (payload/title/preview, stays pending)
//   { payload, status:'approved' } -> Approve with edits (save then publish edited)
//   { status }                     -> Approve / Reject / Re-open (existing drawer path)
//
// Approve is transactional: the status flip and the executor's effect (the
// blog_posts insert) both land, or neither does. Because the executor reads the
// RETURNING row's payload, writing an edited payload in the same UPDATE means the
// published post carries the edits — no separate ordering step.
const REVIEWABLE = ["approved", "rejected", "pending"] as const;
type Reviewable = (typeof REVIEWABLE)[number];

// Thrown to abort the transaction, then mapped to a status code outside it.
// Throwing is the only way to roll back from inside withTransaction.
class NotFoundError extends Error {}
class NotPendingError extends Error {}
class UnresolvedMediaError extends Error {}
class ExecuteError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.code = code;
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const { rows } = await query<QueueRow>(
      `SELECT ${QUEUE_COLUMNS} FROM approval_queue WHERE id = $1`,
      [id]
    );
    if (rows.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ item: rows[0] });
  } catch {
    // Most likely: relation "approval_queue" does not exist (DDL not applied yet).
    return NextResponse.json(
      { error: "Approval queue is not available yet." },
      { status: 503 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  let body: { status?: string; payload?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const hasPayload = body.payload !== undefined;
  const hasStatus = body.status !== undefined;

  // Must ask for at least one action.
  if (!hasPayload && !hasStatus) {
    return NextResponse.json(
      { error: "Provide a payload to save, a status to review, or both" },
      { status: 400 }
    );
  }

  // A review status, when present, must be one of the allowed values.
  if (hasStatus && !REVIEWABLE.includes(body.status as Reviewable)) {
    return NextResponse.json(
      { error: "status must be one of approved, rejected, pending" },
      { status: 400 }
    );
  }

  // A payload edit is only meaningful alongside no-status (save) or approve.
  // Re-validate here so a bad slug/required field fails fast with the real
  // message before we open a transaction.
  let validPayloadJson: string | null = null;
  let validTitle = "";
  let validPreview = "";
  if (hasPayload) {
    const parsed = validateContentDraft(body.payload);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    validPayloadJson = JSON.stringify(parsed.payload);
    validTitle = parsed.payload.title;
    validPreview = buildPreview(parsed.payload);
  }

  // No review status → treat as a plain save that keeps the row pending.
  const effectiveStatus: Reviewable = hasStatus
    ? (body.status as Reviewable)
    : "pending";
  const reopening = effectiveStatus === "pending";
  const stamping = !reopening; // approve/reject record who reviewed and when

  try {
    // Set inside the tx, read only after it commits. If the tx rolls back we
    // throw before the read, so an unpublished post never gets revalidated.
    let publishedSlug: string | null = null;

    const item = await withTransaction(async (client) => {
      // Build the SET clause: always status/review stamp; add payload columns
      // when editing. Gated to pending rows so edits/reviews are race-safe.
      const sets: string[] = ["status = $1"];
      const values: unknown[] = [effectiveStatus];
      let n = 1;

      sets.push(`reviewed_at = ${stamping ? "now()" : "NULL"}`);
      if (stamping) {
        n += 1;
        sets.push(`reviewer = $${n}`);
        values.push("admin");
      } else {
        sets.push("reviewer = NULL");
      }

      if (hasPayload) {
        n += 1;
        sets.push(`payload = $${n}::jsonb`);
        values.push(validPayloadJson);
        n += 1;
        sets.push(`title = $${n}`);
        values.push(validTitle);
        n += 1;
        sets.push(`preview = $${n}`);
        values.push(validPreview);
      }

      const idParam = n + 1;
      values.push(id);

      const { rows } = await client.query<QueueRow>(
        `UPDATE approval_queue
            SET ${sets.join(", ")}
          WHERE id = $${idParam} AND status = 'pending'
        RETURNING ${QUEUE_COLUMNS}`,
        values
      );

      if (rows.length === 0) {
        // Distinguish "no such id" (404) from "exists but not pending" (409).
        const { rows: existing } = await client.query<{ status: string }>(
          "SELECT status FROM approval_queue WHERE id = $1",
          [id]
        );
        if (existing.length === 0) throw new NotFoundError();
        throw new NotPendingError();
      }

      const row = rows[0];

      // Only approval executes. Reject, save, and re-open are status/payload only.
      if (row.status === "approved") {
        // Approve-scoped backstop (F6 — NOT in validateContentDraft, which also
        // runs at enqueue where media fences are legitimately present). Whatever
        // is about to publish — edited-this-request or previously stored — must
        // have no unbaked chart / unfilled photo fence left, or a reader would
        // see raw JSON. Covers the agent door and any editor bypass.
        const publishing = row.payload as { content?: string } | null;
        if (publishing?.content && hasUnresolvedMedia(publishing.content)) {
          throw new UnresolvedMediaError();
        }
        const result = await executeApprovedAction(client, row);
        if (!result.ok) {
          // Rolls back the UPDATE above: nothing published, row stays pending.
          throw new ExecuteError(result.error, result.code);
        }
        publishedSlug = result.slug;
      }

      return row;
    });

    // Post-commit: the /blog pages are statically generated, so an approved post
    // stays invisible until something invalidates them. Gated on approve —
    // save-draft, reject and re-open reach here too and publish nothing.
    if (item.status === "approved") {
      revalidatePath("/blog");
      if (publishedSlug) revalidatePath(`/blog/${publishedSlug}`);
    }

    return NextResponse.json({ item });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (err instanceof UnresolvedMediaError) {
      return NextResponse.json(
        { error: "Resolve all media blocks before publishing." },
        { status: 400 }
      );
    }
    if (err instanceof NotPendingError) {
      return NextResponse.json(
        { error: "Only pending drafts can be edited or reviewed" },
        { status: 409 }
      );
    }
    if (err instanceof ExecuteError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: 409 });
    }
    // Most likely: relation "approval_queue" does not exist (DDL not applied yet).
    return NextResponse.json(
      { error: "Approval queue is not available yet." },
      { status: 503 }
    );
  }
}
