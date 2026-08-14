import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
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

// DELETE /api/blog/[slug] — delete via API key. Retained deliberately.
// The revalidation gap that used to justify keeping it is now closed: this
// handler and the session-gated admin DELETE both invalidate the three
// published-gated surfaces, and the marketing admin has a real Unpublish action.
// Removing this key-gated verb is a separate decision from fixing its behaviour.
export async function DELETE(request: Request, { params }: Props) {
  if (!checkApiKey(request)) {
    return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 });
  }
  const { slug } = await params;
  await query("DELETE FROM blog_posts WHERE slug = $1", [slug]);

  // A deleted row is still a served page until something re-renders it.
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/sitemap.xml");

  return NextResponse.json({ success: true });
}
