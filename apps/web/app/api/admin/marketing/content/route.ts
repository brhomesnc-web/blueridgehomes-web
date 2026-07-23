import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { validateContentDraft, enqueueContentDraft } from "@/lib/approvalQueue";
import { listAllPosts } from "@/lib/blog";

// Content module API — the human (session-gated) half.
//   GET  → blog_posts inventory for the admin, drafts included
//   POST → validate a draft and enqueue it for approval
// The agent half lives at app/api/agent/content and is key-gated. Both POSTs
// share the same core in lib/approvalQueue.ts.

export async function GET() {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // lib/blog.ts listAllPosts(): the admin inventory needs drafts and the real
    // column names, so this uses the all-posts reader (NOT getAllPosts(), which
    // hard-filters published = TRUE and drops publish_at/updated_at). The high
    // limit keeps this route's previously-unbounded output unchanged; the NY
    // conversion stays in SQL so publish_at_ny arrives preformatted.
    const posts = await listAllPosts({ limit: 1000 });
    return NextResponse.json({ posts });
  } catch (err) {
    // blog_posts does exist, but degrade like the queue does rather than 500 the
    // whole page.
    console.error("Content inventory error:", err);
    return NextResponse.json({ posts: [], error: "Failed to load posts." });
  }
}

export async function POST(request: Request) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    console.error("Content enqueue error:", err);
    return NextResponse.json(
      { error: "Approval queue is not available yet." },
      { status: 503 }
    );
  }
}
