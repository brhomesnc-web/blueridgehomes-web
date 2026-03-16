import { NextResponse } from "next/server";
import getDb from "@/lib/db";
import { getSession } from "@/lib/auth";

type Props = { params: Promise<{ slug: string }> };

export async function GET(request: Request, { params }: Props) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { slug } = await params;
  const db = getDb();
  const post = db.prepare("SELECT * FROM blog_posts WHERE slug = ?").get(slug);
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }
  return NextResponse.json({ post });
}

export async function PUT(request: Request, { params }: Props) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { slug } = await params;
  const body = await request.json();
  const { title, date, description, content, featuredImage, tags, published } = body;

  const db = getDb();
  const existing = db.prepare("SELECT id FROM blog_posts WHERE slug = ?").get(slug);
  if (!existing) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  db.prepare(
    "UPDATE blog_posts SET title = ?, date = ?, description = ?, content = ?, featured_image = ?, tags = ?, published = ?, updated_at = datetime('now') WHERE slug = ?"
  ).run(title, date, description || "", content || "", featuredImage || "", JSON.stringify(tags || []), published ? 1 : 0, slug);

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request, { params }: Props) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { slug } = await params;
  const db = getDb();
  db.prepare("DELETE FROM blog_posts WHERE slug = ?").run(slug);
  return NextResponse.json({ success: true });
}
