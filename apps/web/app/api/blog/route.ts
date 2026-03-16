import { NextResponse } from "next/server";
import getDb from "@/lib/db";

function checkApiKey(request: Request): boolean {
  const key = request.headers.get("x-api-key") || request.headers.get("authorization")?.replace("Bearer ", "");
  const expected = process.env.BLOG_AGENT_API_KEY;
  if (!expected || !key) return false;
  return key === expected;
}

// GET /api/blog — list published posts (public, no auth)
export async function GET() {
  const db = getDb();
  const posts = db.prepare(
    "SELECT slug, title, date, description, featured_image, tags, published FROM blog_posts WHERE published = 1 ORDER BY date DESC"
  ).all();
  return NextResponse.json({ posts });
}

// POST /api/blog — create post via API key (for agents)
export async function POST(request: Request) {
  if (!checkApiKey(request)) {
    return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 });
  }

  const body = await request.json();
  const { slug, title, date, description, content, featuredImage, tags, published } = body;

  if (!slug || !title || !date || !content) {
    return NextResponse.json(
      { error: "slug, title, date, and content are required" },
      { status: 400 }
    );
  }

  const db = getDb();
  const existing = db.prepare("SELECT id FROM blog_posts WHERE slug = ?").get(slug);
  if (existing) {
    return NextResponse.json({ error: "A post with this slug already exists" }, { status: 409 });
  }

  db.prepare(
    "INSERT INTO blog_posts (slug, title, date, description, content, featured_image, tags, published) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(slug, title, date, description || "", content, featuredImage || "", JSON.stringify(tags || []), published ? 1 : 0);

  return NextResponse.json({ success: true, slug, url: `/blog/${slug}` });
}
