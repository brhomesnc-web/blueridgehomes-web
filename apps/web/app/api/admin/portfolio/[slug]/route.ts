import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { slug } = await params;
  const db = getDb();
  const project = db.prepare("SELECT * FROM portfolio_projects WHERE slug = ?").get(slug) as Record<string, unknown> | undefined;
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ project: { ...project, images: JSON.parse(project.images as string) } });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { slug } = await params;
  const body = await request.json();
  const db = getDb();
  const existing = db.prepare("SELECT id FROM portfolio_projects WHERE slug = ?").get(slug);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const fields: string[] = [];
  const values: unknown[] = [];
  if (body.title !== undefined) { fields.push("title = ?"); values.push(body.title); }
  if (body.location !== undefined) { fields.push("location = ?"); values.push(body.location); }
  if (body.tag !== undefined) { fields.push("tag = ?"); values.push(body.tag); }
  if (body.type !== undefined) { fields.push("type = ?"); values.push(body.type); }
  if (body.description !== undefined) { fields.push("description = ?"); values.push(body.description); }
  if (body.cover !== undefined) { fields.push("cover = ?"); values.push(body.cover); }
  if (body.images !== undefined) { fields.push("images = ?"); values.push(JSON.stringify(body.images)); }
  if (body.sort_order !== undefined) { fields.push("sort_order = ?"); values.push(body.sort_order); }
  if (body.published !== undefined) { fields.push("published = ?"); values.push(body.published ? 1 : 0); }
  if (fields.length > 0) {
    fields.push("updated_at = datetime('now')");
    values.push(slug);
    db.prepare(`UPDATE portfolio_projects SET ${fields.join(", ")} WHERE slug = ?`).run(...values);
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { slug } = await params;
  const db = getDb();
  db.prepare("DELETE FROM portfolio_projects WHERE slug = ?").run(slug);
  return NextResponse.json({ success: true });
}
