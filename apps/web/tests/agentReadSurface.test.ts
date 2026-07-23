import { describe, it, expect } from "vitest";
import { validateContentDraft } from "@/lib/approvalQueue";
import { checkApiKey, checkMarketingApiKey } from "@/lib/agentAuth";

/**
 * Guards for the agent read-surface slice:
 *  - the date hard-block at the draft door (Item 1), and
 *  - the constant-time key gate the agent read routes lean on (Item 4).
 *
 * Both targets are pure/DB-free: validateContentDraft returns before any query(),
 * and checkApiKey only reads request headers. The route handlers themselves hit
 * the DB and the env key, so they are exercised by curl post-deploy rather than
 * here.
 */

const base = {
  slug: "a-good-slug",
  title: "A Title",
  content: "Some body content that is non-empty.",
};

describe("validateContentDraft — date hard-block (Item 1)", () => {
  it("accepts a zero-padded YYYY-MM-DD date", () => {
    const r = validateContentDraft({ ...base, date: "2026-08-05" });
    expect(r.ok).toBe(true);
  });

  it.each([
    "July 22, 2026",
    "2026-7-2",
    "2026/08/05",
    "08-05-2026",
    "2026-08-05T06:00",
    "",
  ])("rejects a non-sortable date %j", (date) => {
    const r = validateContentDraft({ ...base, date });
    expect(r.ok).toBe(false);
  });
});

describe("checkApiKey — constant-time gate (Item 4)", () => {
  it("accepts the exact key via x-api-key", () => {
    const req = new Request("http://x/api/agent/posts", {
      headers: { "x-api-key": "s3cret" },
    });
    expect(checkApiKey(req, "s3cret")).toBe(true);
  });

  it("accepts the exact key via Authorization: Bearer", () => {
    const req = new Request("http://x/api/agent/posts", {
      headers: { authorization: "Bearer s3cret" },
    });
    expect(checkApiKey(req, "s3cret")).toBe(true);
  });

  it("rejects a wrong key", () => {
    const req = new Request("http://x", { headers: { "x-api-key": "nope" } });
    expect(checkApiKey(req, "s3cret")).toBe(false);
  });

  it("rejects when no key is provided", () => {
    expect(checkApiKey(new Request("http://x"), "s3cret")).toBe(false);
  });

  it("fails closed when the expected key is empty", () => {
    const req = new Request("http://x", { headers: { "x-api-key": "" } });
    expect(checkApiKey(req, "")).toBe(false);
  });

  it("checkMarketingApiKey reads MARKETING_AGENT_API_KEY", () => {
    process.env.MARKETING_AGENT_API_KEY = "mk-test-key";
    const ok = new Request("http://x", { headers: { "x-api-key": "mk-test-key" } });
    const bad = new Request("http://x", { headers: { "x-api-key": "wrong" } });
    expect(checkMarketingApiKey(ok)).toBe(true);
    expect(checkMarketingApiKey(bad)).toBe(false);
  });
});
