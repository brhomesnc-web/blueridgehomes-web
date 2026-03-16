import { NextResponse } from "next/server";
import { getPublishedProjects } from "@/lib/portfolio";

export async function GET() {
  const projects = getPublishedProjects();
  return NextResponse.json({ projects });
}
