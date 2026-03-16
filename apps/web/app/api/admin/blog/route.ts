import { NextResponse } from "next/server";
import getDb from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = getDb();
  const posts = db.prepare(
    "SELECT id, slug, title, date, description, featured_image, tags, published, created_at, updated_at FROM blog_posts ORDER BY date DESC"
  ).all();
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

  const db = getDb();
  const existing = db.prepare("SELECT id FROM blog_posts WHERE slug = ?").get(slug);
  if (existing) {
    return NextResponse.json({ error: "A post with this slug already exists" }, { status: 409 });
  }

  db.prepare(
    "INSERT INTO blog_posts (slug, title, date, description, content, featured_image, tags, published) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(slug, title, date, description || "", content || "", featuredImage || "", JSON.stringify(tags || []), published ? 1 : 0);

  return NextResponse.json({ success: true, slug });
}
