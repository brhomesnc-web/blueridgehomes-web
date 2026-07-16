import { timingSafeEqual } from "crypto";

/**
 * Marketing-platform agent auth door.
 *
 * Generalizes the existing checkApiKey() from app/api/blog/route.ts (which reads
 * BLOG_AGENT_API_KEY and compares with ===) into a reusable helper for the
 * marketing platform's future agent-write endpoints. Same dual-header convention
 * (x-api-key OR Authorization: Bearer <key>), but the comparison is constant-time
 * via crypto.timingSafeEqual so key-guessing can't be timed.
 *
 * Reads MARKETING_AGENT_API_KEY from the environment (loaded by Next from
 * apps/web/.env.local — see recon §6). NOT wired to any endpoint in this slice;
 * agent producers that write into approval_queue arrive later and will import
 * this to gate their POST handlers.
 */
export function checkMarketingApiKey(request: Request): boolean {
  const provided =
    request.headers.get("x-api-key") ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    "";
  const expected = process.env.MARKETING_AGENT_API_KEY || "";

  if (!expected || !provided) return false;

  // timingSafeEqual throws on length mismatch, so guard first. The length check
  // itself is not secret (key length isn't sensitive), the byte comparison is.
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;

  return timingSafeEqual(a, b);
}
