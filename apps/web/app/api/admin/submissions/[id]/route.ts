import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const db = getDb();
  const submission = db.prepare("SELECT * FROM submissions WHERE id = ?").get(id);
  if (!submission) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  // Mark as read if new
  if ((submission as Record<string,unknown>).status === "new") {
    db.prepare("UPDATE submissions SET status = 'read', read = 1 WHERE id = ?").run(id);
  }
  return NextResponse.json({ submission });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json();
  const db = getDb();
  const submission = db.prepare("SELECT * FROM submissions WHERE id = ?").get(id);
  if (!submission) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (body.status) {
    db.prepare("UPDATE submissions SET status = ? WHERE id = ?").run(body.status, id);
  }
  if (body.reply_text !== undefined) {
    db.prepare("UPDATE submissions SET reply_text = ?, replied_at = datetime('now'), status = 'replied' WHERE id = ?").run(body.reply_text, id);
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const db = getDb();
  db.prepare("DELETE FROM submissions WHERE id = ?").run(id);
  return NextResponse.json({ success: true });
}
