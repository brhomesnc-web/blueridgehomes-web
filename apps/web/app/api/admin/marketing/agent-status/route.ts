import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

// Stub agent-status source for the sidebar footer chip + kill-switch.
//
// There are no real agent producers in this slice, so state lives in a module
// variable (resets on server restart — fine for a stub). A later slice replaces
// this with a real status store the agent modules heartbeat into. Every handler
// is getSession()-guarded, matching every other admin API (recon §1).
type AgentState = "active" | "paused" | "error";

let state: AgentState = "active";
// Seed a plausible "last action" a few minutes back so the chip renders a real
// relative time. Set once at module load.
const lastActionAt = new Date(Date.now() - 4 * 60 * 1000).toISOString();
const lastActionLabel = "Drafted a blog post for review";

export async function GET() {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ state, lastActionAt, lastActionLabel });
}

// POST { action: "pause" | "resume" } — the human kill-switch. Stub: flips the
// in-memory state. Deferred agent modules will consult real state before acting.
export async function POST(request: Request) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: { action?: string } = {};
  try {
    body = await request.json();
  } catch {
    /* empty body ok */
  }
  if (body.action === "pause") state = "paused";
  else if (body.action === "resume") state = "active";
  return NextResponse.json({ state, lastActionAt, lastActionLabel });
}
