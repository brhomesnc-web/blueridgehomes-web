import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
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
  const { title, date, description, content, featuredImage, tags } = body;

  // `published` is rejected, not ignored. This route used to write the column,
  // which meant opening a live post and clicking Save unpublished it silently and
  // without revalidating. It now PRESERVES the column, so fixing a typo in a live
  // post leaves it live. A body still carrying `published` is a caller that
  // believes this route controls visibility — tell it, loudly, where that lives.
  // A silent ignore is how this class of bug comes back.
  if (body && Object.prototype.hasOwnProperty.call(body, "published")) {
    return NextResponse.json(
      {
        error:
          "This route no longer changes publication state. Use the marketing admin's Publish now / Unpublish actions (PATCH /api/admin/marketing/content/[slug]/schedule) — they are the only paths that revalidate the static pages.",
        code: "published_not_accepted",
      },
      { status: 400 }
    );
  }

  const { rows: existing } = await query("SELECT id FROM blog_posts WHERE slug = $1", [slug]);
  if (existing.length === 0) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  await query(
    `UPDATE blog_posts SET title = $1, date = $2, description = $3, content = $4, featured_image = $5, tags = $6::jsonb, updated_at = NOW() WHERE slug = $7`,
    [title, date, description || "", content || "", featuredImage || "", JSON.stringify(tags || []), slug]
  );

  // The edited post may well be live, and /blog, /blog/<slug> and /sitemap.xml are
  // all prerendered with no expiry — without this the edit is invisible forever.
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/sitemap.xml");

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request, { params }: Props) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { slug } = await params;
  await query("DELETE FROM blog_posts WHERE slug = $1", [slug]);

  // Deleting the row does not remove the page: /blog/<slug> keeps serving from
  // the static cache until it is re-rendered, at which point getPostBySlug finds
  // nothing and it 404s.
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/sitemap.xml");

  return NextResponse.json({ success: true });
}
