import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  let sql = "SELECT id, name, email, phone, project_type, message, created_at, read, status, replied_at FROM submissions";
  const params: string[] = [];

  if (status && status !== "all") {
    sql += " WHERE status = $1";
    params.push(status);
  }
  sql += " ORDER BY created_at DESC";

  const { rows: submissions } = await query(sql, params);

  const countResult = await Promise.all([
    query("SELECT COUNT(*) as c FROM submissions"),
    query("SELECT COUNT(*) as c FROM submissions WHERE status = 'new'"),
    query("SELECT COUNT(*) as c FROM submissions WHERE status = 'read'"),
    query("SELECT COUNT(*) as c FROM submissions WHERE status = 'replied'"),
    query("SELECT COUNT(*) as c FROM submissions WHERE status = 'archived'"),
  ]);

  const counts = {
    all: Number(countResult[0].rows[0].c),
    new: Number(countResult[1].rows[0].c),
    read: Number(countResult[2].rows[0].c),
    replied: Number(countResult[3].rows[0].c),
    archived: Number(countResult[4].rows[0].c),
  };

  return NextResponse.json({ submissions, counts });
}
