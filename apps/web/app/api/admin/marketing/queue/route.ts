import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { listQueue, type QueueStatus } from "@/lib/approvalQueue";

// Approval queue — list by status + status counts. getSession()-guarded like
// every admin API (recon §1). No producers write to this table in this slice.
//
// The approval_queue table is applied MANUALLY on the VPS from
// db/schema/approval_queue.sql and may not exist yet — so every read is wrapped
// to degrade to an empty queue (tableMissing: true) instead of a 500. That lets
// the whole marketing UI render before the DDL is applied.

const EMPTY_COUNTS = {
  all: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
  auto_approved: 0,
};

async function loadCounts() {
  const { rows } = await query<{ status: string; c: string }>(
    "SELECT status, COUNT(*)::int AS c FROM approval_queue GROUP BY status"
  );
  const counts = { ...EMPTY_COUNTS };
  for (const r of rows) {
    const n = Number(r.c);
    if (r.status in counts) counts[r.status as QueueStatus] = n;
    counts.all += n;
  }
  return counts;
}

export async function GET(request: NextRequest) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const countOnly = searchParams.get("count") === "1";
  const statusParam = searchParams.get("status");

  try {
    const counts = await loadCounts();

    if (countOnly) {
      return NextResponse.json({ counts });
    }

    // Queue-list SQL now lives in lib/approvalQueue.ts listQueue(); limit: 200
    // preserves this route's prior ceiling exactly. An unrecognized/"all"/absent
    // status returns every row, same as before.
    const items = await listQueue({ status: statusParam ?? undefined, limit: 200 });
    return NextResponse.json({ items, counts });
  } catch {
    // Most likely: relation "approval_queue" does not exist (DDL not applied yet).
    return NextResponse.json({
      items: [],
      counts: EMPTY_COUNTS,
      tableMissing: true,
    });
  }
}
