import { NextResponse } from "next/server";
import { query } from "@/lib/db";

function checkApiKey(request: Request): boolean {
  const key = request.headers.get("x-api-key") || request.headers.get("authorization")?.replace("Bearer ", "");
  const expected = process.env.BLOG_AGENT_API_KEY;
  if (!expected || !key) return false;
  return key === expected;
}

// GET /api/blog — list published posts (public, no auth)
export async function GET() {
  const { rows: posts } = await query(
    "SELECT slug, title, date, description, featured_image, tags, published FROM blog_posts WHERE published = TRUE ORDER BY date DESC"
  );
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

  const { rows: existing } = await query("SELECT id FROM blog_posts WHERE slug = $1", [slug]);
  if (existing.length > 0) {
    return NextResponse.json({ error: "A post with this slug already exists" }, { status: 409 });
  }

  await query(
    "INSERT INTO blog_posts (slug, title, date, description, content, featured_image, tags, published) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8)",
    [slug, title, date, description || "", content, featuredImage || "", JSON.stringify(tags || []), published ? true : false]
  );

  return NextResponse.json({ success: true, slug, url: `/blog/${slug}` });
}
