import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const { rows } = await query("SELECT * FROM submissions WHERE id = $1", [id]);
  if (rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const submission = rows[0];
  // Mark as read if new
  if (submission.status === "new") {
    await query("UPDATE submissions SET status = 'read', read = TRUE WHERE id = $1", [id]);
  }
  return NextResponse.json({ submission });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json();
  const { rows } = await query("SELECT * FROM submissions WHERE id = $1", [id]);
  if (rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (body.status) {
    await query("UPDATE submissions SET status = $1 WHERE id = $2", [body.status, id]);
  }
  if (body.reply_text !== undefined) {
    await query("UPDATE submissions SET reply_text = $1, replied_at = NOW(), status = 'replied' WHERE id = $2", [body.reply_text, id]);
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await query("DELETE FROM submissions WHERE id = $1", [id]);
  return NextResponse.json({ success: true });
}
