import { NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();
    const rows = db.prepare("SELECT * FROM submissions ORDER BY created_at DESC").all();
    return NextResponse.json(rows);
  } catch (err) {
    console.error("Database error:", err);
    return NextResponse.json({ error: "Failed to fetch submissions." }, { status: 500 });
  }
}
