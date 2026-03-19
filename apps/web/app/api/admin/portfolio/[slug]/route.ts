import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { slug } = await params;
  const { rows } = await query("SELECT * FROM portfolio_projects WHERE slug = $1", [slug]);
  if (rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const project = rows[0];
  // pg driver parses JSONB automatically, but handle string fallback
  const images = typeof project.images === "string" ? JSON.parse(project.images) : project.images;
  return NextResponse.json({ project: { ...project, images } });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { slug } = await params;
  const body = await request.json();
  const { rows: existing } = await query("SELECT id FROM portfolio_projects WHERE slug = $1", [slug]);
  if (existing.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;
  if (body.title !== undefined) { fields.push(`title = $${idx++}`); values.push(body.title); }
  if (body.location !== undefined) { fields.push(`location = $${idx++}`); values.push(body.location); }
  if (body.tag !== undefined) { fields.push(`tag = $${idx++}`); values.push(body.tag); }
  if (body.type !== undefined) { fields.push(`type = $${idx++}`); values.push(body.type); }
  if (body.description !== undefined) { fields.push(`description = $${idx++}`); values.push(body.description); }
  if (body.cover !== undefined) { fields.push(`cover = $${idx++}`); values.push(body.cover); }
  if (body.images !== undefined) { fields.push(`images = $${idx++}::jsonb`); values.push(JSON.stringify(body.images)); }
  if (body.sort_order !== undefined) { fields.push(`sort_order = $${idx++}`); values.push(body.sort_order); }
  if (body.published !== undefined) { fields.push(`published = $${idx++}`); values.push(body.published ? true : false); }
  if (fields.length > 0) {
    fields.push("updated_at = NOW()");
    values.push(slug);
    await query(`UPDATE portfolio_projects SET ${fields.join(", ")} WHERE slug = $${idx}`, values);
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { slug } = await params;
  await query("DELETE FROM portfolio_projects WHERE slug = $1", [slug]);
  return NextResponse.json({ success: true });
}
