import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const db = getDb();
    const result = db.prepare("DELETE FROM submissions WHERE id = ?").run(id);
    if (result.changes === 0) {
      return NextResponse.json({ error: "Submission not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Database error:", err);
    return NextResponse.json({ error: "Failed to delete submission." }, { status: 500 });
  }
}
