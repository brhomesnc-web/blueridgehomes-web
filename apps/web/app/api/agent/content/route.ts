import { NextResponse } from "next/server";
import { checkMarketingApiKey } from "@/lib/agentAuth";
import { validateContentDraft, enqueueContentDraft } from "@/lib/approvalQueue";

// Content module API — the agent (key-gated) half.
//
// The first endpoint to wire lib/agentAuth.ts. Note what this route CANNOT do:
// it proposes only. Everything here lands as a pending row a human must approve —
// that gap is the point of the module.
//
// As of 566dd15 (2026-07-22) the approval queue is the ONLY path to
// published = true: the old BLOG_AGENT_API_KEY write doors (POST /api/blog and
// PUT /api/blog/[slug]) now return 410 Gone, leaving executeApprovedAction the sole
// writer of published rows. One caveat — a key-gated DELETE /api/blog/[slug] does
// survive and can still remove a live post; see the TODO on that handler.
//
// Reads MARKETING_AGENT_API_KEY from .env.local; checkMarketingApiKey returns false
// when it is unset, so an unkeyed deployment is shut rather than open by default.
// The key IS set in production and this route is live (verified 201, 2026-07-23).
export async function POST(request: Request) {
  if (!checkMarketingApiKey(request)) {
    return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = validateContentDraft(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const item = await enqueueContentDraft(parsed.payload, {
      reviewer: null,
      action: "publish_post",
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (err) {
    console.error("Agent content enqueue error:", err);
    return NextResponse.json(
      { error: "Approval queue is not available yet." },
      { status: 503 }
    );
  }
}
