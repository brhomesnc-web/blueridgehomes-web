import { NextResponse } from "next/server";
import { checkMarketingApiKey } from "@/lib/agentAuth";
import { listAllPosts } from "@/lib/blog";

// GET /api/agent/posts — key-gated read of the full blog inventory, drafts and
// scheduled posts included. Read-only: the agent proposes via /api/agent/content
// and never publishes. Under /api/agent/* on purpose — the regex nginx location
// that steals /api/content, /api/leads, etc. to the legacy port-3002 app does not
// match /api/agent/*, so this route actually reaches the Next app in production.
export async function GET(request: Request) {
  if (!checkMarketingApiKey(request)) {
    return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 });
  }

  try {
    const posts = await listAllPosts();
    return NextResponse.json({ ok: true, posts });
  } catch (err) {
    console.error("Agent posts read error:", err);
    return NextResponse.json({ ok: false, error: "Could not load posts." }, { status: 503 });
  }
}
