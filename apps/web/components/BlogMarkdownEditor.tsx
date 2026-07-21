"use client";
import Markdown from "react-markdown";
import ChartPreview from "@/components/media/ChartPreview";
import PhotoSlot from "@/components/media/PhotoSlot";
import {
  listMediaFences,
  replaceFence,
  serializeChart,
  type ChartSpec,
  type PhotoSpec,
} from "@/lib/mediaBlocks";

/**
 * The STRING-WORLD renderer: markdown in, markdown out, media fences rendered as
 * interactive blocks.
 *
 * Rendering strategy: split `content` at media-fence boundaries, render the
 * markdown between fences with react-markdown, and the fences with the shared
 * media components. Each block knows its ordinal `index` (from listMediaFences),
 * so edits target the exact fence — duplicates included — via replaceFence.
 *
 * ChartPreview/PhotoSlot are pure spec-in/spec-out (they know nothing about
 * markdown). This file owns the ADAPTERS that map their three callbacks back
 * onto the content string. The TipTap node-view maps the same callbacks onto
 * editor transactions instead — one component contract, two renderers.
 */

export default function BlogMarkdownEditor({
  content,
  onChange,
  slug,
}: {
  content: string;
  onChange: (next: string) => void;
  slug?: string;
}) {
  const fences = listMediaFences(content);
  if (fences.length === 0) {
    return <Markdown>{content}</Markdown>;
  }

  const parts: React.ReactNode[] = [];
  let cursor = 0;

  fences.forEach((f, i) => {
    const at = content.indexOf(f.raw, cursor);
    if (at === -1) return;
    if (at > cursor) {
      const md = content.slice(cursor, at);
      if (md.trim()) parts.push(<Markdown key={`md-${i}`}>{md}</Markdown>);
    }

    // ── adapters: spec-in/spec-out callbacks → the content string ──
    const index = f.index;
    const replaceWithImage = (path: string, alt: string) =>
      onChange(replaceFence(content, index, `![${alt}](${path})`));
    const remove = () => onChange(replaceFence(content, index, ""));

    if (f.kind === "chart") {
      const spec = f.spec as ChartSpec | null;
      parts.push(
        spec ? (
          <ChartPreview
            key={`c-${i}`}
            spec={spec}
            slug={slug}
            onSpecChange={(next) =>
              onChange(replaceFence(content, index, serializeChart(next)))
            }
            onReplaceWithImage={replaceWithImage}
            onRemove={remove}
          />
        ) : (
          <div
            key={`c-${i}`}
            className="my-5 rounded-md border border-[#d9b3ad] bg-[#f6e9e7] px-4 py-3 text-[12.5px] text-[#8b3a32] not-prose"
          >
            This <code>```chart```</code> block has invalid JSON — fix it in the raw markdown
            before it can render.
          </div>
        )
      );
    } else {
      parts.push(
        <PhotoSlot
          key={`p-${i}`}
          spec={f.spec as PhotoSpec | null}
          onReplaceWithImage={replaceWithImage}
          onRemove={remove}
        />
      );
    }

    cursor = at + f.raw.length;
  });

  if (cursor < content.length) {
    const md = content.slice(cursor);
    if (md.trim()) parts.push(<Markdown key="md-tail">{md}</Markdown>);
  }

  return <>{parts}</>;
}
