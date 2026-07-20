/**
 * The model call: Anthropic Messages API → parse → validate → ContentDraftPayload.
 *
 * No SDK — global fetch on Node v22. The brief (system prompt) lives in
 * contentBrief.ts so it can be iterated without touching this plumbing. Output is
 * validated with the SAME validateContentDraft the enqueue path uses, so a
 * generated draft that wouldn't survive enqueue never leaves this function.
 */

import {
  validateContentDraft,
  SLUG_PATTERN,
  type ContentDraftPayload,
} from "./approvalQueue";
import {
  CONTENT_SYSTEM_PROMPT,
  buildUserPrompt,
  type GenerateInput,
} from "./contentBrief";

// Constant at top — easy to bump when a newer model ships.
const MODEL = "claude-sonnet-5";
const MAX_TOKENS = 4096;
const TIMEOUT_MS = 60_000;

type AnthropicContentBlock = { type: string; text?: string };
type AnthropicResponse = { content?: AnthropicContentBlock[] };

// Lowercase, non-alphanumeric runs -> single hyphen, trim/collapse hyphens.
function slugify(source: string): string {
  return source
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// The brief demands raw JSON, but models occasionally wrap it. Strip a leading
// ```json / ``` fence and trailing fence, then narrow to the outermost {...}.
function extractJson(raw: string): string {
  let s = raw.trim();
  s = s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const first = s.indexOf("{");
  const last = s.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) {
    s = s.slice(first, last + 1);
  }
  return s;
}

export async function generateDraft(
  input: GenerateInput
): Promise<ContentDraftPayload> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error("ANTHROPIC_API_KEY is not set — cannot generate a draft.");
  }

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);

  let data: AnthropicResponse;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: CONTENT_SYSTEM_PROMPT,
        messages: [{ role: "user", content: buildUserPrompt(input) }],
      }),
      signal: ctrl.signal,
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Anthropic API error ${res.status}: ${body.slice(0, 500)}`);
    }

    data = (await res.json()) as AnthropicResponse;
  } finally {
    clearTimeout(t);
  }

  // Concatenate every text block the model returned.
  const rawText = (data.content ?? [])
    .filter((b) => b.type === "text" && typeof b.text === "string")
    .map((b) => b.text as string)
    .join("")
    .trim();

  if (!rawText) {
    throw new Error("Anthropic returned no text content.");
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(extractJson(rawText)) as Record<string, unknown>;
  } catch {
    throw new Error(
      `Could not parse model output as JSON. Raw (truncated): ${rawText.slice(0, 800)}`
    );
  }

  const title = typeof parsed.title === "string" ? parsed.title.trim() : "";
  const content = typeof parsed.content === "string" ? parsed.content : "";
  const description =
    typeof parsed.description === "string" ? parsed.description.trim() : "";

  // Derive a safe slug: model's slug first, fall back to the title.
  let slug = slugify(typeof parsed.slug === "string" ? parsed.slug : "");
  if (!slug || !SLUG_PATTERN.test(slug)) {
    slug = slugify(title);
  }

  const tags = Array.isArray(parsed.tags)
    ? parsed.tags
        .filter((t): t is string => typeof t === "string")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  const payload: ContentDraftPayload = {
    slug,
    title,
    date: new Date().toISOString().slice(0, 10),
    content,
    description,
    featured_image: "", // editor adds photos in a later slice
    tags,
  };

  // Same gate the enqueue path uses — fail here with the real reason rather than
  // queuing something that can't be approved.
  const check = validateContentDraft(payload);
  if (!check.ok) {
    throw new Error(`Generated draft is invalid: ${check.error}`);
  }
  return check.payload;
}
