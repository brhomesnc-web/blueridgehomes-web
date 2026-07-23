import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET /api/blog — list published posts (public, no auth)
export async function GET() {
  const { rows: posts } = await query(
    "SELECT slug, title, date, description, featured_image, tags, published FROM blog_posts WHERE published = TRUE ORDER BY date DESC"
  );
  return NextResponse.json({ posts });
}

// POST /api/blog — REMOVED (bypass-removal, 2026-07-23). This was a
// BLOG_AGENT_API_KEY-gated door that wrote `published` straight into blog_posts,
// bypassing the approval queue. executeApprovedAction is now the only path that can
// publish. Drafts are proposed via POST /api/agent/content and go live only through
// the approval queue.
export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error: "gone",
      detail:
        "This endpoint has been removed. Drafts are proposed via /api/agent/content and published via the approval queue.",
    },
    { status: 410 }
  );
}
