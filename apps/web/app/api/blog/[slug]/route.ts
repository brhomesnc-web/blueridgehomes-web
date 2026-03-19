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

// PUT /api/blog/[slug] — update via API key
export async function PUT(request: Request, { params }: Props) {
  if (!checkApiKey(request)) {
    return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 });
  }
  const { slug } = await params;
  const body = await request.json();
  const { title, date, description, content, featuredImage, tags, published } = body;

  const { rows: existing } = await query("SELECT id FROM blog_posts WHERE slug = $1", [slug]);
  if (existing.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await query(
    `UPDATE blog_posts SET
      title = COALESCE($1, title),
      date = COALESCE($2, date),
      description = COALESCE($3, description),
      content = COALESCE($4, content),
      featured_image = COALESCE($5, featured_image),
      tags = COALESCE($6::jsonb, tags),
      published = COALESCE($7, published),
      updated_at = NOW()
    WHERE slug = $8`,
    [
      title || null,
      date || null,
      description || null,
      content || null,
      featuredImage || null,
      tags ? JSON.stringify(tags) : null,
      published !== undefined ? (published ? true : false) : null,
      slug,
    ]
  );

  return NextResponse.json({ success: true });
}

// DELETE /api/blog/[slug] — delete via API key
export async function DELETE(request: Request, { params }: Props) {
  if (!checkApiKey(request)) {
    return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 });
  }
  const { slug } = await params;
  await query("DELETE FROM blog_posts WHERE slug = $1", [slug]);
  return NextResponse.json({ success: true });
}
