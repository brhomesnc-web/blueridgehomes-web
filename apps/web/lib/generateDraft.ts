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
// A full 700-1100 word post plus the tool envelope needs headroom — 4096 was
// truncating the content mid-post. 8192 comfortably fits.
const MAX_TOKENS = 8192;
const TIMEOUT_MS = 60_000;

// Forced tool-use is the root fix for JSON.parse failures: the API returns the
// fields as a pre-parsed object (escaping handled server-side), so a long
// markdown post with newlines/quotes can never break an envelope the model had
// to hand-author.
const OUTPUT_TOOL = {
  name: "emit_blog_post",
  description: "Return the finished blog post as structured fields.",
  input_schema: {
    type: "object" as const,
    properties: {
      title: { type: "string" },
      slug: {
        type: "string",
        description:
          "lowercase; words separated by single hyphens; letters and digits only; no leading/trailing/doubled hyphens",
      },
      description: {
        type: "string",
        description: "1-2 sentence meta description including the keyword",
      },
      tags: {
        type: "array",
        items: { type: "string" },
        description: "2-5 short topical tags",
      },
      content: {
        type: "string",
        description: "full post body in CommonMark markdown, per the format rules",
      },
    },
    required: ["title", "slug", "description", "content"],
  },
};

type AnthropicContentBlock = {
  type: string;
  name?: string;
  input?: unknown;
};
type AnthropicResponse = { content?: AnthropicContentBlock[] };

// Lowercase, non-alphanumeric runs -> single hyphen, trim/collapse hyphens.
function slugify(source: string): string {
  return source
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
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
        tools: [OUTPUT_TOOL],
        tool_choice: { type: "tool", name: "emit_blog_post" },
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

  // Read the forced tool call's pre-parsed input — no JSON.parse, so unescaped
  // newlines/quotes in a long markdown post can't break anything.
  const block = Array.isArray(data.content)
    ? data.content.find(
        (b) => b.type === "tool_use" && b.name === "emit_blog_post"
      )
    : undefined;
  if (!block || !block.input) {
    throw new Error(
      "Model did not return the emit_blog_post tool call. Raw: " +
        JSON.stringify(data.content).slice(0, 600)
    );
  }
  const out = block.input as {
    title?: string;
    slug?: string;
    description?: string;
    tags?: string[];
    content?: string;
  };

  const title = typeof out.title === "string" ? out.title.trim() : "";
  const content = typeof out.content === "string" ? out.content.trim() : "";
  const description =
    typeof out.description === "string" ? out.description.trim() : "";

  if (!title) {
    throw new Error("Generated draft is missing a title.");
  }
  if (!content) {
    throw new Error("Generated draft is missing content.");
  }

  // Derive a safe slug: model's slug first, fall back to the title.
  let slug = slugify(typeof out.slug === "string" ? out.slug : "");
  if (!slug || !SLUG_PATTERN.test(slug)) {
    slug = slugify(title);
  }

  const tags = Array.isArray(out.tags)
    ? out.tags
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
