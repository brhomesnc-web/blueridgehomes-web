import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

// PATCH a queue item's status (Approve / Reject). getSession()-guarded.
// Reviewer is "admin" — the app has a single admin identity (recon §1, admin_config
// is a single row); a later multi-user slice can carry a real reviewer name.
const REVIEWABLE = ["approved", "rejected", "pending"] as const;
type Reviewable = (typeof REVIEWABLE)[number];

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
    // Re-open (pending) clears the review stamp; approve/reject records it.
    const reopening = status === "pending";
    const { rows } = await query(
      `UPDATE approval_queue
         SET status = $1,
             reviewed_at = ${reopening ? "NULL" : "now()"},
             reviewer = ${reopening ? "NULL" : "$3"}
       WHERE id = $2
       RETURNING id, created_at, module, action, stakes, title, preview, payload, status, reviewed_at, reviewer`,
      reopening ? [status, id] : [status, id, "admin"]
    );
    if (rows.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ item: rows[0] });
  } catch {
    return NextResponse.json(
      { error: "Approval queue is not available yet." },
      { status: 503 }
    );
  }
}
