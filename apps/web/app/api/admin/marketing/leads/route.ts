import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

// Leads = READ-THROUGH of the existing `submissions` (contact form) and
// `feedback_submissions` (private feedback) tables (recon §3/§4). This slice does
// NOT create a leads table and does NOT write anywhere. getSession()-guarded.
//
// Both source tables already exist. feedback_submissions has no status column, so
// we inject 'new'. Existing submissions.status (new|read|replied|archived) is
// mapped onto the pipeline's first stages; stages past Contacted (Quoted/Won/Lost
// beyond archived) + AI fit-scoring arrive with the v2 enrichment layer.

type Lead = {
  key: string;
  id: number;
  source: "contact" | "feedback";
  name: string;
  email: string;
  phone: string | null;
  project_type: string | null;
  message: string;
  created_at: string;
  status: string;
  rating: number | null;
  stage: string;
};

// submissions.status → pipeline stage. Only the stages that map from real data
// are assigned; Quoted/Won stay empty (no data to invent).
function toStage(source: string, status: string): string {
  if (source === "feedback") return "New";
  switch (status) {
    case "new":
      return "New";
    case "read":
      return "Contacted";
    case "replied":
      return "Qualified";
    case "archived":
      return "Lost";
    default:
      return "New";
  }
}

export async function GET() {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { rows } = await query<{
      id: number;
      name: string;
      email: string;
      phone: string | null;
      project_type: string | null;
      message: string;
      created_at: string;
      status: string;
      rating: number | null;
      source: "contact" | "feedback";
    }>(
      `SELECT id, name, email, phone, project_type, message, created_at, status, NULL::int AS rating, 'contact'::text AS source
         FROM submissions
       UNION ALL
       SELECT id, name, email, phone, project_type, message, created_at, 'new'::text AS status, rating, 'feedback'::text AS source
         FROM feedback_submissions
       ORDER BY created_at DESC
       LIMIT 500`
    );

    const leads: Lead[] = rows.map((r) => ({
      key: `${r.source}-${r.id}`,
      id: r.id,
      source: r.source,
      name: r.name,
      email: r.email,
      phone: r.phone,
      project_type: r.project_type,
      message: r.message,
      created_at: r.created_at,
      status: r.status,
      rating: r.rating,
      stage: toStage(r.source, r.status),
    }));

    return NextResponse.json({ leads });
  } catch (err) {
    console.error("Leads read-through error:", err);
    return NextResponse.json(
      { leads: [], error: "Failed to load leads." },
      { status: 500 }
    );
  }
}
