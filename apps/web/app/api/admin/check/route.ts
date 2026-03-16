import { NextResponse } from "next/server";
import { getSession, isSetupComplete } from "@/lib/auth";

export async function GET() {
  return NextResponse.json({
    setupComplete: isSetupComplete(),
    authenticated: await getSession(),
  });
}
