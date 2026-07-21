"use client";
import { NodeViewWrapper, NodeViewContent, type NodeViewProps } from "@tiptap/react";
import ChartPreview from "@/components/media/ChartPreview";
import PhotoSlot from "@/components/media/PhotoSlot";
import {
  parseChartSpec,
  parsePhotoSpec,
  chartBody,
  type ChartSpec,
} from "@/lib/mediaBlocks";

/**
 * Node-view for CodeBlock: chart/photo blocks render as their interactive UI,
 * everything else renders as a normal code block.
 *
 * The block's JSON body IS the code block's text content — CodeBlock keeps
 * owning markdown serialization (verified: a ```chart fence round-trips
 * byte-identical through it), so this file never serializes a fence. It only
 * parses text→spec on render and writes spec→text on change.
 *
 * The shared media components are pure spec-in/spec-out; the adapters below map
 * their three callbacks onto ProseMirror transactions — the same three callbacks
 * BlogMarkdownEditor maps onto `replaceFence`.
 */
export default function MediaBlockView(props: NodeViewProps) {
  const { node, editor, getPos, deleteNode } = props;
  const language = (node.attrs.language as string | null) || "";
  const body = node.textContent;

  // Replace the code block's TEXT with a new JSON body (block stays a fence).
  //
  // No .focus() here, deliberately: the grid/title/source inputs call
  // onSpecChange on EVERY keystroke, so focusing the editor per character
  // yanked the caret out of the input being typed — the "only one character"
  // bug. A background text sync has no business stealing focus. (bake/fill in
  // replaceWithImage keep their focus() — that is a one-shot node replacement,
  // not a per-keystroke path.)
  function writeBody(next: string) {
    const pos = typeof getPos === "function" ? getPos() : null;
    if (pos == null) return;
    // Hardening guard (NOT the corruption fix): ProseMirror throws a RangeError
    // on an empty text node, and an exception inside a command during a
    // render-triggered update white-screens the whole admin tree. Not reachable
    // today — chartBody/photoBody are JSON.stringify, min output "{}" — so this
    // is belt-and-braces against future callers.
    if (!next || !next.trim()) return;
    editor
      .chain()
      .command(({ tr }) => {
        const from = pos + 1;
        const to = pos + 1 + node.content.size;
        tr.replaceWith(from, to, editor.schema.text(next));
        return true;
      })
      .run();
  }

  // Replace the whole code block with an Image node — this is what "bake" and
  // "fill" do. Requires @tiptap/extension-image to be registered.
  function replaceWithImage(path: string, alt: string) {
    const pos = typeof getPos === "function" ? getPos() : null;
    if (pos == null) return;
    const imageType = editor.schema.nodes.image;
    if (!imageType) return;
    editor
      .chain()
      .focus()
      .command(({ tr }) => {
        tr.replaceWith(pos, pos + node.nodeSize, imageType.create({ src: path, alt }));
        return true;
      })
      .run();
  }

  if (language === "chart") {
    const spec = parseChartSpec(body);
    return (
      <NodeViewWrapper>
        {/* ProseMirror still needs a contentDOM for this content-holding node;
            it is hidden because the JSON is edited through the grid, not typed. */}
        <div style={{ display: "none" }}>
          <NodeViewContent />
        </div>
        {/* contentEditable={false} is load-bearing: without it ProseMirror
            treats this interactive React UI as editable text and maps DOM
            positions inside it back to document offsets, so keystrokes land at
            mismapped positions (reversed / bled into neighbouring nodes). The
            hidden NodeViewContent above stays the ONLY editable region. */}
        <div contentEditable={false}>
          {spec ? (
            <ChartPreview
              spec={spec}
              slug={undefined}
              onSpecChange={(next: ChartSpec) => writeBody(chartBody(next))}
              onReplaceWithImage={replaceWithImage}
              onRemove={() => deleteNode()}
            />
          ) : (
            <div className="my-5 rounded-md border border-[#d9b3ad] bg-[#f6e9e7] px-4 py-3 text-[12.5px] text-[#8b3a32] not-prose">
              This chart block has invalid JSON — switch to Source to fix it.
            </div>
          )}
        </div>
      </NodeViewWrapper>
    );
  }

  if (language === "photo") {
    const spec = parsePhotoSpec(body);
    return (
      <NodeViewWrapper>
        <div style={{ display: "none" }}>
          <NodeViewContent />
        </div>
        {/* See the chart branch: the visible UI must be non-editable so
            ProseMirror never maps positions into it. */}
        <div contentEditable={false}>
          <PhotoSlot
            spec={spec}
            onReplaceWithImage={replaceWithImage}
            onRemove={() => deleteNode()}
          />
        </div>
      </NodeViewWrapper>
    );
  }

  // Ordinary fenced code block.
  return (
    <NodeViewWrapper>
      <pre>
        <NodeViewContent<"code"> as="code" />
      </pre>
    </NodeViewWrapper>
  );
}
