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
  const { slug, title, date, description, content, featuredImage, tags } = body;

  // Creating a post and publishing one are separate acts. This route used to
  // write `published` straight from the body, making it a session-gated door that
  // published without ever touching the approval queue. Rejected rather than
  // ignored, for the same reason as the PUT.
  if (body && Object.prototype.hasOwnProperty.call(body, "published")) {
    return NextResponse.json(
      {
        error:
          "This route creates drafts only. Publishing goes through the approval queue, or the marketing admin's Publish now action (PATCH /api/admin/marketing/content/[slug]/schedule).",
        code: "published_not_accepted",
      },
      { status: 400 }
    );
  }

  if (!slug || !title || !date) {
    return NextResponse.json({ error: "Slug, title, and date are required" }, { status: 400 });
  }

  const { rows: existing } = await query("SELECT id FROM blog_posts WHERE slug = $1", [slug]);
  if (existing.length > 0) {
    return NextResponse.json({ error: "A post with this slug already exists" }, { status: 409 });
  }

  // published is a literal false, not a parameter: there is no request that can
  // make this INSERT publish. Nothing goes live here, so there is deliberately
  // nothing to revalidate — the omission below is not an oversight.
  await query(
    "INSERT INTO blog_posts (slug, title, date, description, content, featured_image, tags, published) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, false)",
    [slug, title, date, description || "", content || "", featuredImage || "", JSON.stringify(tags || [])]
  );

  return NextResponse.json({ success: true, slug });
}
