import { NextRequest, NextResponse } from "next/server";
import { withTransaction } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { executeApprovedAction } from "@/lib/queueExecutor";
import { QUEUE_COLUMNS, type QueueRow } from "@/lib/approvalQueue";

// PATCH a queue item's status (Approve / Reject / Re-open). getSession()-guarded.
// Reviewer is "admin" — the app has a single admin identity (admin_config is a
// single row); a later multi-user slice can carry a real reviewer name.
//
// Approve is transactional: the status flip and the executor's effect (e.g. the
// blog_posts insert) both land, or neither does. Without that, a failed publish
// would leave a row marked approved with nothing published — the queue would lie.
const REVIEWABLE = ["approved", "rejected", "pending"] as const;
type Reviewable = (typeof REVIEWABLE)[number];

// Thrown to abort the transaction, then mapped to a status code outside it.
// Throwing is the only way to roll back from inside withTransaction.
class NotFoundError extends Error {}
class ExecuteError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.code = code;
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
  let body: { status?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const status = body.status;
  if (!status || !REVIEWABLE.includes(status as Reviewable)) {
    return NextResponse.json(
      { error: "status must be one of approved, rejected, pending" },
      { status: 400 }
    );
  }

  try {
    const item = await withTransaction(async (client) => {
      // Re-open (pending) clears the review stamp; approve/reject records it.
      const reopening = status === "pending";
      const { rows } = await client.query<QueueRow>(
        `UPDATE approval_queue
           SET status = $1,
               reviewed_at = ${reopening ? "NULL" : "now()"},
               reviewer = ${reopening ? "NULL" : "$3"}
         WHERE id = $2
         RETURNING ${QUEUE_COLUMNS}`,
        reopening ? [status, id] : [status, id, "admin"]
      );
      if (rows.length === 0) {
        throw new NotFoundError();
      }

      const row = rows[0];

      // Only approval executes. Reject and re-open are status-only, as before.
      if (row.status === "approved") {
        const result = await executeApprovedAction(client, row);
        if (!result.ok) {
          // Rolls back the UPDATE above: nothing published, row stays pending.
          throw new ExecuteError(result.error, result.code);
        }
      }

      return row;
    });

    return NextResponse.json({ item });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
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
