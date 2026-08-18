import { SignJWT, importPKCS8 } from "jose";

/**
 * Google service-account auth for the analytics ingest.
 *
 * No Google client library is installed and this slice deliberately does not add
 * one (recon: `googleapis` pulls ~50MB and a discovery layer we would use two
 * endpoints of). `jose` is already a dependency for the admin session cookies, so
 * the JWT-bearer flow is hand-rolled here against Google's documented
 * OAuth2 token endpoint:
 *
 *   sign a JWT assertion with the service account's RS256 private key
 *     -> POST it as grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer
 *     -> receive a ~1h access token
 *
 * ESSENTIAL work, so this module fails CLOSED: every error path throws rather
 * than returning null. The ingest route turns that throw into a 503. Contrast
 * lib/notify.ts, which warns and returns because a missing SMTP config must not
 * take down a form post.
 *
 * NEVER log `raw`, `private_key`, the assertion, or the access token. The error
 * messages below are written to name the FAILURE without echoing the SECRET.
 */

const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";

/** GA4 Data API (read) + Search Console (read). Both are read-only by design. */
const SCOPES = [
  "https://www.googleapis.com/auth/analytics.readonly",
  "https://www.googleapis.com/auth/webmasters.readonly",
].join(" ");

/** Assertion lifetime. Google caps this at 1h and rejects anything longer. */
const ASSERTION_TTL_SEC = 3600;

/**
 * Renew this many seconds BEFORE the token's stated expiry. Covers clock skew
 * between this VPS and Google plus the round-trip of whatever request is about
 * to use the token — a token that expires mid-flight reads as a 401 from the
 * Data API, which is a confusing way to learn your clock is off.
 */
const RENEW_SKEW_SEC = 120;

type ServiceAccount = {
  client_email: string;
  private_key: string;
  token_uri?: string;
};

/**
 * Module-scope cache. Single standalone process (systemd brhomes-web, one
 * `node server.js`), so this is a real process-wide cache and not a per-worker
 * one. `inFlight` collapses concurrent callers onto one token request: the GA4
 * and GSC ingests run back-to-back in the same tick and would otherwise mint
 * two tokens for no reason.
 */
let cachedToken: { token: string; expiresAtMs: number } | null = null;
let inFlight: Promise<string> | null = null;

function loadServiceAccount(): ServiceAccount {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!raw || !raw.trim()) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_KEY is unset. Add the base64 of the service-account " +
        "JSON (single line) to apps/web/.env.local and restart the unit."
    );
  }

  // NOTE: Buffer.from(x, 'base64') does NOT throw on malformed input — it skips
  // characters it cannot decode and returns whatever is left. So there is no
  // point wrapping this in a try/catch; the real guard is the JSON.parse below,
  // which is what actually catches "that wasn't base64" and "that wasn't JSON".
  const decoded = Buffer.from(raw.trim(), "base64").toString("utf8");

  let parsed: unknown;
  try {
    parsed = JSON.parse(decoded);
  } catch {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_KEY did not base64-decode to valid JSON. Re-encode " +
        "the service-account key file with `base64 -w0 key.json` and make sure the " +
        ".env.local value is on ONE line with no quotes."
    );
  }

  const sa = parsed as Partial<ServiceAccount>;
  if (!sa.client_email || !sa.private_key) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_KEY decoded to JSON but is missing client_email " +
        "and/or private_key — that is an OAuth client secret file, not a " +
        "service-account key. Download the key from the service account itself."
    );
  }

  return {
    client_email: sa.client_email,
    private_key: sa.private_key,
    token_uri: sa.token_uri,
  };
}

async function mintAccessToken(): Promise<string> {
  const sa = loadServiceAccount();
  const audience = sa.token_uri || TOKEN_ENDPOINT;
  const nowSec = Math.floor(Date.now() / 1000);

  let key: CryptoKey;
  try {
    // Service-account private_key is PEM PKCS#8 ("-----BEGIN PRIVATE KEY-----").
    // JSON.parse already turned the literal \n escapes into real newlines, which
    // is what importPKCS8 requires.
    key = (await importPKCS8(sa.private_key, "RS256")) as CryptoKey;
  } catch {
    throw new Error(
      "The private_key inside GOOGLE_SERVICE_ACCOUNT_KEY is not importable as " +
        "PKCS#8/RS256. The key was likely mangled by shell escaping when the " +
        "env var was written — re-encode from the original key file."
    );
  }

  const assertion = await new SignJWT({ scope: SCOPES })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(sa.client_email)
    .setAudience(audience)
    .setIssuedAt(nowSec)
    .setExpirationTime(nowSec + ASSERTION_TTL_SEC)
    .sign(key);

  const res = await fetch(audience, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  const bodyText = await res.text();

  if (!res.ok) {
    // Google's token errors are {error, error_description} and carry no secret
    // material, so surfacing them is safe AND is the only way to tell
    // "invalid_grant: account not found" (wrong key) from "invalid_scope"
    // (API not enabled) without guessing. The assertion itself is never logged.
    let detail = "";
    try {
      const parsed = JSON.parse(bodyText) as {
        error?: string;
        error_description?: string;
      };
      detail = [parsed.error, parsed.error_description].filter(Boolean).join(": ");
    } catch {
      detail = bodyText.slice(0, 200);
    }
    throw new Error(
      `Google token endpoint rejected the service-account assertion (${res.status}): ${detail}`
    );
  }

  const token = JSON.parse(bodyText) as {
    access_token?: string;
    expires_in?: number;
  };
  if (!token.access_token) {
    throw new Error("Google token endpoint returned 200 with no access_token.");
  }

  const ttlSec = typeof token.expires_in === "number" ? token.expires_in : ASSERTION_TTL_SEC;
  cachedToken = {
    token: token.access_token,
    expiresAtMs: Date.now() + Math.max(ttlSec - RENEW_SKEW_SEC, 0) * 1000,
  };
  return cachedToken.token;
}

/**
 * A valid access token for the two read scopes, minted on demand and reused
 * until shortly before it expires.
 *
 * THROWS on any misconfiguration — callers should let it propagate to a 503
 * rather than swallowing it, because a silently token-less ingest looks exactly
 * like a site with no traffic.
 */
export async function getGoogleAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAtMs > Date.now()) {
    return cachedToken.token;
  }

  // Collapse a stampede onto one mint. Cleared in `finally` so a FAILED mint does
  // not poison every later call with the same rejected promise.
  if (!inFlight) {
    inFlight = mintAccessToken().finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
}
