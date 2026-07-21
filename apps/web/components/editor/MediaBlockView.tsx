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
  function writeBody(next: string) {
    const pos = typeof getPos === "function" ? getPos() : null;
    if (pos == null) return;
    editor
      .chain()
      .focus()
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
        <PhotoSlot
          spec={spec}
          onReplaceWithImage={replaceWithImage}
          onRemove={() => deleteNode()}
        />
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
