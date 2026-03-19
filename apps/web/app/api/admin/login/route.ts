import { NextResponse } from "next/server";
import {
  verifyPassword,
  verifyTotp,
  getAdminConfig,
  createSession,
  isSetupComplete,
  SESSION_COOKIE,
  SESSION_DURATION,
} from "@/lib/auth";

export async function POST(request: Request) {
  if (!(await isSetupComplete())) {
    return NextResponse.json({ error: "Admin not set up yet" }, { status: 403 });
  }

  const { password, totpCode } = await request.json();

  if (!password || !totpCode) {
    return NextResponse.json({ error: "Password and authenticator code required" }, { status: 400 });
  }

  const config = await getAdminConfig();
  if (!config) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 500 });
  }

  if (!verifyPassword(password, config.password_hash)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  if (!verifyTotp(totpCode, config.totp_secret)) {
    return NextResponse.json({ error: "Invalid authenticator code" }, { status: 401 });
  }

  const token = await createSession();

  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION,
    path: "/",
  });

  return response;
}
