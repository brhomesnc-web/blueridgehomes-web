import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const db = getDb();
  let query = "SELECT id, name, email, phone, project_type, message, created_at, read, status, replied_at FROM submissions";
  const params: string[] = [];
  if (status && status !== "all") {
    query += " WHERE status = ?";
    params.push(status);
  }
  query += " ORDER BY created_at DESC";
  const submissions = db.prepare(query).all(...params);
  const counts = {
    all: db.prepare("SELECT COUNT(*) as c FROM submissions").get() as { c: number },
    new: db.prepare("SELECT COUNT(*) as c FROM submissions WHERE status = 'new'").get() as { c: number },
    read: db.prepare("SELECT COUNT(*) as c FROM submissions WHERE status = 'read'").get() as { c: number },
    replied: db.prepare("SELECT COUNT(*) as c FROM submissions WHERE status = 'replied'").get() as { c: number },
    archived: db.prepare("SELECT COUNT(*) as c FROM submissions WHERE status = 'archived'").get() as { c: number },
  };
  return NextResponse.json({
    submissions,
    counts: { all: counts.all.c, new: counts.new.c, read: counts.read.c, replied: counts.replied.c, archived: counts.archived.c },
  });
}
