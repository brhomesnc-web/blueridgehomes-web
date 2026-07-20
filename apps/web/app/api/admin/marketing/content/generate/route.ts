import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { enqueueContentDraft } from "@/lib/approvalQueue";
import { generateDraft } from "@/lib/generateDraft";

// Content module API — the in-platform generator door (session-gated).
//
// Brian clicks "Generate draft" in the admin UI; this calls the Anthropic API,
// builds a validated ContentDraftPayload, and enqueues it via the SAME shared
// chokepoint the compose form uses (enqueueContentDraft) — which validates,
// inserts, and fires the push notification. No validation or INSERT is
// duplicated here; the draft lands pending, exactly like a hand-written one.

export async function POST(request: Request) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { topic?: unknown; keyword?: unknown; audience?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const topic = typeof body.topic === "string" ? body.topic.trim() : "";
  if (!topic) {
    return NextResponse.json({ error: "topic is required" }, { status: 400 });
  }
  const keyword = typeof body.keyword === "string" ? body.keyword : undefined;
  const audience = typeof body.audience === "string" ? body.audience : undefined;

  let payload;
  try {
    payload = await generateDraft({ topic, keyword, audience });
  } catch (err) {
    console.error("Draft generation error:", err);
    const detail = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "generation failed", detail },
      { status: 502 }
    );
  }

  try {
    const item = await enqueueContentDraft(payload, {
      reviewer: null,
      action: "publish_post",
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (err) {
    console.error("Generated draft enqueue error:", err);
    return NextResponse.json(
      { error: "Approval queue is not available yet." },
      { status: 503 }
    );
  }
}
