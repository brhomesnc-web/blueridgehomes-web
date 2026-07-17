import { NextResponse } from "next/server";
import { checkMarketingApiKey } from "@/lib/agentAuth";
import { validateContentDraft, enqueueContentDraft } from "@/lib/approvalQueue";

// Content module API — the agent (key-gated) half.
//
// The first endpoint to wire lib/agentAuth.ts. Note what this route CANNOT do:
// it proposes only. Unlike POST /api/blog — which takes BLOG_AGENT_API_KEY and
// writes straight to the public site — everything here lands as a pending row a
// human must approve. That gap is the point of the module.
//
// Requires MARKETING_AGENT_API_KEY in .env.local; checkMarketingApiKey returns
// false when it is unset, so this route is closed until the key is added.
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
