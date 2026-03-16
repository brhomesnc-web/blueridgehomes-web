import { NextResponse } from "next/server";
import getDb from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = getDb();
  const projects = db.prepare(
    "SELECT id, slug, title, location, tag, type, cover, sort_order, published FROM portfolio_projects ORDER BY sort_order ASC"
  ).all();
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
  const db = getDb();
  const existing = db.prepare("SELECT id FROM portfolio_projects WHERE slug = ?").get(slug);
  if (existing) {
    return NextResponse.json({ error: "A project with this slug already exists" }, { status: 409 });
  }
  const maxOrder = db.prepare("SELECT MAX(sort_order) as m FROM portfolio_projects").get() as { m: number | null };
  const sortOrder = (maxOrder.m ?? -1) + 1;
  db.prepare(
    "INSERT INTO portfolio_projects (slug, title, location, tag, type, description, cover, images, sort_order, published) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(slug, title, location, tag || "custom", type || "", description || "", cover || "", JSON.stringify(images || []), sortOrder, published ? 1 : 0);
  return NextResponse.json({ success: true, slug });
}
