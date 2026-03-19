import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const { rows } = await query("SELECT * FROM submissions ORDER BY created_at DESC");
    return NextResponse.json(rows);
  } catch (err) {
    console.error("Database error:", err);
    return NextResponse.json({ error: "Failed to fetch submissions." }, { status: 500 });
  }
}
