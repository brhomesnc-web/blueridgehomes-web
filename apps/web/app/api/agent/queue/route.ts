import { NextResponse } from "next/server";
import { checkMarketingApiKey } from "@/lib/agentAuth";
import { listQueue } from "@/lib/approvalQueue";

// GET /api/agent/queue — key-gated read of the approval queue. Optional ?status=
// filter (pending | approved | rejected | auto_approved); an absent/unrecognized
// value returns every row. Read-only: no approve, publish, or reject here. Under
// /api/agent/* to dodge the nginx namespace trap (see /api/agent/posts).
export async function GET(request: Request) {
  if (!checkMarketingApiKey(request)) {
    return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? undefined;

  try {
    const items = await listQueue({ status });
    return NextResponse.json({ ok: true, items });
  } catch (err) {
    console.error("Agent queue read error:", err);
    return NextResponse.json(
      { ok: false, error: "Approval queue is not available yet." },
      { status: 503 }
    );
  }
}
