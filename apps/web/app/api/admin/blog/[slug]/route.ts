import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

type Props = { params: Promise<{ slug: string }> };

export async function GET(request: Request, { params }: Props) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { slug } = await params;
  const { rows } = await query("SELECT * FROM blog_posts WHERE slug = $1", [slug]);
  if (rows.length === 0) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }
  return NextResponse.json({ post: rows[0] });
}

export async function PUT(request: Request, { params }: Props) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { slug } = await params;
  const body = await request.json();
  const { title, date, description, content, featuredImage, tags, published } = body;

  const { rows: existing } = await query("SELECT id FROM blog_posts WHERE slug = $1", [slug]);
  if (existing.length === 0) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  await query(
    `UPDATE blog_posts SET title = $1, date = $2, description = $3, content = $4, featured_image = $5, tags = $6::jsonb, published = $7, updated_at = NOW() WHERE slug = $8`,
    [title, date, description || "", content || "", featuredImage || "", JSON.stringify(tags || []), published ? true : false, slug]
  );

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request, { params }: Props) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { slug } = await params;
  await query("DELETE FROM blog_posts WHERE slug = $1", [slug]);
  return NextResponse.json({ success: true });
}
