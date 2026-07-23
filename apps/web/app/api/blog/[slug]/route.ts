import { NextResponse } from "next/server";
import { query } from "@/lib/db";

function checkApiKey(request: Request): boolean {
  const key = request.headers.get("x-api-key") || request.headers.get("authorization")?.replace("Bearer ", "");
  const expected = process.env.BLOG_AGENT_API_KEY;
  if (!expected || !key) return false;
  return key === expected;
}

type Props = { params: Promise<{ slug: string }> };

// GET /api/blog/[slug] — public, get single post
export async function GET(request: Request, { params }: Props) {
  const { slug } = await params;
  const { rows } = await query("SELECT * FROM blog_posts WHERE slug = $1 AND published = TRUE", [slug]);
  if (rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ post: rows[0] });
}

// PUT /api/blog/[slug] — REMOVED (bypass-removal, 2026-07-23). Was a
// BLOG_AGENT_API_KEY-gated door that could set `published` directly, bypassing the
// approval queue. Edits now go through the session-gated admin CRUD
// (/api/admin/blog/[slug]) or the approval queue.
export async function PUT() {
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

// DELETE /api/blog/[slug] — delete via API key.
// TODO(bypass-removal, 2026-07-23): retained deliberately. Gate B found the
// session-gated admin DELETE (/api/admin/blog/[slug]) deletes rows but does NOT
// revalidate /blog, and neither does this handler — a deleted post keeps serving
// from the static cache until the next revalidation. This stays until admin delete
// covers unpublish WITH revalidation; then remove this key-gated verb too.
export async function DELETE(request: Request, { params }: Props) {
  if (!checkApiKey(request)) {
    return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 });
  }
  const { slug } = await params;
  await query("DELETE FROM blog_posts WHERE slug = $1", [slug]);
  return NextResponse.json({ success: true });
}
