"use client";
import { useEffect, useRef } from "react";
import { useEditor, EditorContent, ReactNodeViewRenderer, type Editor } from "@tiptap/react";
import CodeBlock from "@tiptap/extension-code-block";
import { buildRichExtensions } from "@/lib/richEditorExtensions";
import MediaBlockView from "@/components/editor/MediaBlockView";

/**
 * The WYSIWYG surface. A VIEW LAYER ONLY — markdown stays the single source of
 * truth: content comes in as a markdown string and every change emits a markdown
 * string back, so storage, the generator, the live page, the bake and the
 * approve-time backstop are all untouched.
 *
 * Chart/photo fences render as interactive node-views (see MediaBlockView) while
 * CodeBlock keeps owning their markdown serialization.
 */

// CodeBlock carrying the chart/photo node-view. Extending only `addNodeView`
// leaves schema and markdown serialization exactly as the plain CodeBlock's.
const MediaCodeBlock = CodeBlock.extend({
  addNodeView() {
    return ReactNodeViewRenderer(MediaBlockView);
  },
});

function ToolbarButton({
  onClick,
  active,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()} // keep the selection
      onClick={onClick}
      className={
        "rounded border px-2 py-1 text-[12px] font-semibold transition-colors " +
        (active
          ? "border-[var(--br-gold-dark)] bg-[var(--br-gold)] text-white"
          : "border-[var(--br-line)] bg-white/70 text-[var(--br-text-mid)] hover:bg-[var(--br-cream-2)]")
      }
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  return (
    <div className="mb-2 flex flex-wrap items-center gap-1.5 rounded-md border border-[var(--br-line)] bg-[var(--br-cream-2)] p-1.5">
      <ToolbarButton
        title="Heading 2"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        H2
      </ToolbarButton>
      <ToolbarButton
        title="Heading 3"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        H3
      </ToolbarButton>
      <ToolbarButton
        title="Bold"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <strong>B</strong>
      </ToolbarButton>
      <ToolbarButton
        title="Italic"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <em>I</em>
      </ToolbarButton>
      <ToolbarButton
        title="Link"
        active={editor.isActive("link")}
        onClick={() => {
          if (editor.isActive("link")) {
            editor.chain().focus().unsetLink().run();
            return;
          }
          const url = window.prompt("Link URL");
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }}
      >
        Link
      </ToolbarButton>
      <ToolbarButton
        title="Bullet list"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        • List
      </ToolbarButton>
      <ToolbarButton
        title="Numbered list"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        1. List
      </ToolbarButton>
      <ToolbarButton
        title="Blockquote"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        &ldquo; Quote
      </ToolbarButton>
    </div>
  );
}

export default function BlogEditorRich({
  content,
  onChange,
}: {
  content: string;
  onChange: (next: string) => void;
}) {
  // Guards the echo: our own onUpdate emit must not be fed straight back in as
  // an external content change (which would reset the cursor on every keystroke).
  const lastEmitted = useRef<string>(content);

  const editor = useEditor({
    extensions: buildRichExtensions(MediaCodeBlock),
    content,
    immediatelyRender: false, // required under SSR/hydration
    editorProps: {
      attributes: { class: "br-blog-prose focus:outline-none min-h-[420px]" },
    },
    onCreate({ editor }) {
      editor.commands.setContent(content, { contentType: "markdown" });
      lastEmitted.current = editor.getMarkdown();
    },
    onUpdate({ editor }) {
      const md = editor.getMarkdown();
      lastEmitted.current = md;
      onChange(md);
    },
  });

  // External content changes (e.g. toggling back from Source) re-seed the editor.
  useEffect(() => {
    if (!editor) return;
    if (content === lastEmitted.current) return;
    lastEmitted.current = content;
    editor.commands.setContent(content, { contentType: "markdown" });
  }, [content, editor]);

  if (!editor) {
    return (
      <div className="rounded-md border border-[var(--br-line)] bg-white p-5 text-[13px] italic text-[var(--br-text-muted)]">
        Loading editor…
      </div>
    );
  }

  return (
    <div>
      <Toolbar editor={editor} />
      <div className="rounded-md border border-[var(--br-line)] bg-white p-5">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
