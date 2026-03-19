import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { generateSecret, generateURI, verifySync } from "otplib";
import { query } from "./db";

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || "brh-admin-secret-change-in-production-2026"
);
const SESSION_COOKIE = "brh_admin_session";
const SESSION_DURATION = 60 * 60 * 8; // 8 hours

// ── Password ──
export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 12);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

// ── TOTP ──
export function generateTotpSecret(): string {
  return generateSecret();
}

export function getTotpUri(secret: string): string {
  return generateURI({ issuer: "BlueRidgeHomes", label: "admin", secret });
}

export function verifyTotp(token: string, secret: string): boolean {
  return verifySync({ token, secret }).valid === true;
}

// ── Session ──
export async function createSession(): Promise<string> {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(JWT_SECRET);
  return token;
}

export async function verifySession(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function getSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  if (!session?.value) return false;
  return verifySession(session.value);
}

export async function getAdminConfig() {
  const { rows } = await query<{
    id: number;
    password_hash: string;
    totp_secret: string;
    setup_complete: boolean;
    created_at: string;
  }>("SELECT * FROM admin_config WHERE id = 1");
  return rows[0] as {
    id: number;
    password_hash: string;
    totp_secret: string;
    setup_complete: boolean;
  } | undefined;
}

export async function isSetupComplete(): Promise<boolean> {
  const config = await getAdminConfig();
  return config?.setup_complete === true;
}

export { SESSION_COOKIE, SESSION_DURATION };
