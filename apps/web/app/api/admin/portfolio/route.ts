import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { rows: projects } = await query(
    "SELECT id, slug, title, location, tag, type, cover, sort_order, published FROM portfolio_projects ORDER BY sort_order ASC"
  );
  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const { slug, title, location, tag, type, description, cover, images, published } = body;
  if (!slug || !title || !location) {
    return NextResponse.json({ error: "Slug, title, and location are required" }, { status: 400 });
  }
  const { rows: existing } = await query("SELECT id FROM portfolio_projects WHERE slug = $1", [slug]);
  if (existing.length > 0) {
    return NextResponse.json({ error: "A project with this slug already exists" }, { status: 409 });
  }
  const { rows: maxRows } = await query("SELECT COALESCE(MAX(sort_order), -1) as m FROM portfolio_projects");
  const sortOrder = (maxRows[0].m ?? -1) + 1;
  await query(
    "INSERT INTO portfolio_projects (slug, title, location, tag, type, description, cover, images, sort_order, published) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10)",
    [slug, title, location, tag || "custom", type || "", description || "", cover || "", JSON.stringify(images || []), sortOrder, published ? true : false]
  );
  return NextResponse.json({ success: true, slug });
}
