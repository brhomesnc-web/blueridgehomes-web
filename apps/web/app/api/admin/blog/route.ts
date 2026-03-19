import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { rows: posts } = await query(
    "SELECT id, slug, title, date, description, featured_image, tags, published, created_at, updated_at FROM blog_posts ORDER BY date DESC"
  );
  return NextResponse.json({ posts });
}

export async function POST(request: Request) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const { slug, title, date, description, content, featuredImage, tags, published } = body;

  if (!slug || !title || !date) {
    return NextResponse.json({ error: "Slug, title, and date are required" }, { status: 400 });
  }

  const { rows: existing } = await query("SELECT id FROM blog_posts WHERE slug = $1", [slug]);
  if (existing.length > 0) {
    return NextResponse.json({ error: "A post with this slug already exists" }, { status: 409 });
  }

  await query(
    "INSERT INTO blog_posts (slug, title, date, description, content, featured_image, tags, published) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8)",
    [slug, title, date, description || "", content || "", featuredImage || "", JSON.stringify(tags || []), published ? true : false]
  );

  return NextResponse.json({ success: true, slug });
}
