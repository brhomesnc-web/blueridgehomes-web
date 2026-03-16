import { NextResponse } from "next/server";
import getDb from "@/lib/db";

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
  const db = getDb();
  const post = db.prepare("SELECT * FROM blog_posts WHERE slug = ? AND published = 1").get(slug);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ post });
}

// PUT /api/blog/[slug] — update via API key
export async function PUT(request: Request, { params }: Props) {
  if (!checkApiKey(request)) {
    return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 });
  }
  const { slug } = await params;
  const body = await request.json();
  const { title, date, description, content, featuredImage, tags, published } = body;

  const db = getDb();
  const existing = db.prepare("SELECT id FROM blog_posts WHERE slug = ?").get(slug);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  db.prepare(
    "UPDATE blog_posts SET title = COALESCE(?, title), date = COALESCE(?, date), description = COALESCE(?, description), content = COALESCE(?, content), featured_image = COALESCE(?, featured_image), tags = COALESCE(?, tags), published = COALESCE(?, published), updated_at = datetime('now') WHERE slug = ?"
  ).run(title || null, date || null, description || null, content || null, featuredImage || null, tags ? JSON.stringify(tags) : null, published !== undefined ? (published ? 1 : 0) : null, slug);

  return NextResponse.json({ success: true });
}

// DELETE /api/blog/[slug] — delete via API key
export async function DELETE(request: Request, { params }: Props) {
  if (!checkApiKey(request)) {
    return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 });
  }
  const { slug } = await params;
  const db = getDb();
  db.prepare("DELETE FROM blog_posts WHERE slug = ?").run(slug);
  return NextResponse.json({ success: true });
}
