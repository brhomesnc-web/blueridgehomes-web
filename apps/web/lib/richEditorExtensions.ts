import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Markdown } from "@tiptap/markdown";
import type { AnyExtension } from "@tiptap/core";

/**
 * The single source of truth for the rich editor's extension list.
 *
 * Shared deliberately: `BlogEditorRich` builds the real editor from this, and the
 * round-trip regression test builds its editor from this too — so the test can
 * never drift from what actually ships and silently stop guarding the thing it
 * exists to guard.
 *
 * `@tiptap/extension-image` is LOAD-BEARING, not decorative. StarterKit ships no
 * Image node; without this extension every `![alt](path)` round-trips down to
 * bare `alt` text, which would silently delete every baked chart and filled photo
 * on the first save — and slip past the approve backstop, which only looks for
 * surviving ```chart```/```photo``` fences. The regression test asserts image
 * survival for exactly this reason.
 *
 * The CodeBlock is injected by the caller: production passes a CodeBlock extended
 * with a React node-view (chart/photo UI), the test passes the plain one. A node
 * view is presentation only — it does not affect schema or markdown
 * serialization — so both configurations serialize identically.
 */
export function buildRichExtensions(codeBlock: AnyExtension): AnyExtension[] {
  return [
    // CodeBlock is disabled here and supplied by the caller instead.
    StarterKit.configure({ codeBlock: false }) as AnyExtension,
    codeBlock,
    Image as AnyExtension,
    Markdown as AnyExtension,
  ];
}
