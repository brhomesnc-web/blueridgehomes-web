import { describe, it, expect } from "vitest";
import { Editor } from "@tiptap/core";
import CodeBlock from "@tiptap/extension-code-block";
import { buildRichExtensions } from "@/lib/richEditorExtensions";
import { hasUnresolvedMedia, listMediaFences } from "@/lib/mediaBlocks";

/**
 * ROUND-TRIP REGRESSION GUARD for the rich (TipTap) editor.
 *
 * The WYSIWYG is a view layer — markdown is the source of truth — so every save
 * runs content through parse→serialize. This test pins that the trip is
 * non-destructive for everything our generator emits.
 *
 * It builds its editor from the SAME `buildRichExtensions` the shipping editor
 * uses, so the guard can't drift from production. The only difference is the
 * CodeBlock: production passes one extended with a React node-view, this passes
 * the plain one. A node view is presentation only — it changes neither schema
 * nor markdown serialization.
 *
 * The load-bearing assertion is IMAGE SURVIVAL: StarterKit ships no Image node,
 * and without `@tiptap/extension-image` every `![alt](path)` degrades to bare
 * `alt` text. That would silently delete every baked chart and filled photo on
 * the first save, and slip past the approve backstop (which only looks for
 * surviving fences). If someone removes the Image extension, this test fails.
 */

function roundTrip(md: string): string {
  const editor = new Editor({ extensions: buildRichExtensions(CodeBlock), content: "" });
  editor.commands.setContent(md, { contentType: "markdown" });
  const out = editor.getMarkdown();
  editor.destroy();
  return out;
}

/**
 * Normalize the two differences we accept and have verified are harmless:
 *  - CommonMark bracket escaping in prose: `[x]` -> `\[x\]`. Renders identically
 *    and is idempotent (escaped once, never re-escaped).
 *  - trailing-newline normalization.
 */
function normalize(s: string): string {
  return s.replace(/\\([[\]])/g, "$1").replace(/\s+$/, "");
}

const FIXTURE = [
  "Opening lead paragraph with **bold**, *italic*, and an [inline link](https://blueridgehomesnc.com/contact).",
  "",
  "## An H2 question heading?",
  "",
  "### An H3 sub-heading",
  "",
  "- bullet one",
  "- bullet two with **bold**",
  "",
  "1. ordered one",
  "2. ordered two",
  "",
  "> A pull-quote blockquote line.",
  "",
  "A paragraph with an em-dash — and a curly apostrophe’s tail, plus [VERIFY: a prose placeholder].",
  "",
  "![A baked chart image](/optimized/blog-charts/chart-permits-1753089600000.png)",
  "",
  "```chart",
  '{"type":"bar","title":"Typical permit review timeline","unit":"weeks","xKey":"project","series":[{"key":"weeks","label":"Review time"}],"data":[{"project":"Remodel","weeks":"[VERIFY: county avg]"}],"source":"[VERIFY: cite source]"}',
  "```",
  "",
  "```photo",
  '{"intent":"steep wooded Buncombe County building lot","path":""}',
  "```",
  "",
].join("\n");

/**
 * NESTED LISTS - added with the tiptap 3.31.3 bump.
 *
 * tiptap 3.30.6 changed nested-list markdown serialization (nested lists
 * exported to Markdown now keep their hierarchy when the file is read back by
 * other Markdown tools). The FIXTURE above carries only FLAT lists, so that
 * change - and any regression that collapsed nesting - was invisible here:
 * every test stayed green while a stored post could have lost its hierarchy.
 *
 * Written in the CANONICAL indentation tiptap emits, which was measured rather
 * than assumed: two spaces for a nested bullet, three for a nested ordered
 * item. A non-canonical width is re-indented on the trip (pinned by the last
 * test below) - that is CommonMark normalization, not data loss, and it is
 * idempotent.
 */
const NESTED_LIST_FIXTURE = [
  "- parent bullet one",
  "  - child bullet a",
  "  - child bullet b",
  "- parent bullet two",
  "",
  "1. parent step one",
  "   1. sub-step one",
  "   2. sub-step two",
  "2. parent step two",
  "",
  "- mixed parent bullet",
  "  1. nested ordered under a bullet",
  "",
].join("\n");

describe("rich editor markdown round-trip", () => {
  it("preserves every construct the generator emits", () => {
    expect(normalize(roundTrip(FIXTURE))).toBe(normalize(FIXTURE));
  });

  it("is idempotent — repeated saves do not drift", () => {
    const once = roundTrip(FIXTURE);
    expect(roundTrip(once)).toBe(once);
  });

  // THE LANDMINE GUARD: images must survive. Without @tiptap/extension-image
  // these collapse to bare alt text and baked charts/photos are destroyed.
  it.each([
    "![A baked chart image](/optimized/blog-charts/chart-permits-1753089600000.png)",
    "![finished custom home exterior on a steep wooded lot](/optimized/breezeway/front.jpg)",
  ])("keeps the image node for %s", (img) => {
    const out = roundTrip(img + "\n");
    expect(out).toContain("](");
    expect(out).toContain(img.slice(img.indexOf("](") + 2, -1)); // the src survives
    expect(normalize(out)).toBe(normalize(img));
  });

  it("keeps an inline image inside a paragraph", () => {
    const md = "Text before ![alt](/optimized/blog/x.png) text after.\n";
    expect(normalize(roundTrip(md))).toBe(normalize(md));
  });

  it("keeps chart/photo fences intact, info-string and JSON body included", () => {
    const out = roundTrip(FIXTURE);

    // The approve-time backstop must still see the unresolved fences.
    expect(hasUnresolvedMedia(out)).toBe(true);

    const before = listMediaFences(FIXTURE);
    const after = listMediaFences(out);
    expect(after.map((f) => f.kind)).toEqual(before.map((f) => f.kind));
    // Bodies byte-identical — in-fence [VERIFY:] must NOT be escaped.
    expect(after.map((f) => f.body)).toEqual(before.map((f) => f.body));
    expect(after.every((f) => f.spec !== null)).toBe(true);
    expect(out).toContain('"[VERIFY: county avg]"');
  });

  it("preserves nested list hierarchy", () => {
    expect(normalize(roundTrip(NESTED_LIST_FIXTURE))).toBe(
      normalize(NESTED_LIST_FIXTURE)
    );
  });

  // Structural, not just byte equality: a serializer that flattened the nesting
  // would still emit perfectly valid markdown and pass a loose comparison, so
  // assert the indented markers themselves.
  it("keeps nested items indented rather than flattening them", () => {
    const out = roundTrip(NESTED_LIST_FIXTURE);
    expect(out).toContain("\n  - child bullet a");
    expect(out).toContain("\n   1. sub-step one");
    expect(out).toContain("\n  1. nested ordered under a bullet");
    // ...and the parents must not have gained indentation of their own.
    expect(out.startsWith("- parent bullet one\n")).toBe(true);
  });

  // Pins the canonicalization itself, so a future version that changes the
  // emitted indent width fails here instead of silently rewriting stored posts.
  it("re-indents non-canonical nesting without losing depth", () => {
    expect(normalize(roundTrip("- parent one\n    - child a\n- parent two\n"))).toBe(
      normalize("- parent one\n  - child a\n- parent two\n")
    );
    expect(normalize(roundTrip("1. first\n    1. sub one\n2. second\n"))).toBe(
      normalize("1. first\n   1. sub one\n2. second\n")
    );
  });
});
