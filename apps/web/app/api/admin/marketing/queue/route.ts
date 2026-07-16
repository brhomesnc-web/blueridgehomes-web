import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

// Approval queue — list by status + status counts. getSession()-guarded like
// every admin API (recon §1). No producers write to this table in this slice.
//
// The approval_queue table is applied MANUALLY on the VPS from
// db/schema/approval_queue.sql and may not exist yet — so every read is wrapped
// to degrade to an empty queue (tableMissing: true) instead of a 500. That lets
// the whole marketing UI render before the DDL is applied.

const STATUSES = ["pending", "approved", "rejected", "auto_approved"] as const;
type Status = (typeof STATUSES)[number];

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
    if (r.status in counts) counts[r.status as Status] = n;
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

    let sql =
      "SELECT id, created_at, module, action, stakes, title, preview, payload, status, reviewed_at, reviewer FROM approval_queue";
    const params: string[] = [];
    if (statusParam && statusParam !== "all" && STATUSES.includes(statusParam as Status)) {
      sql += " WHERE status = $1";
      params.push(statusParam);
    }
    sql += " ORDER BY created_at DESC LIMIT 200";

    const { rows: items } = await query(sql, params);
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
