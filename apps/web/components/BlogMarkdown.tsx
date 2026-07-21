import Markdown from "react-markdown";
import type { ComponentPropsWithoutRef } from "react";

/**
 * Server-safe blog markdown renderer for the LIVE post page.
 *
 * Deliberately has NO "use client" and NO recharts anywhere in its import graph
 * — the live blog page is a server component and must never pull the charting
 * lib into the server bundle. By publish time every chart/photo block has been
 * baked to a plain ![](path) image (handled by the default `img` renderer), so
 * this component only needs a DEFENSIVE fallback: if an unresolved ```chart``` /
 * ```photo``` fence somehow reaches a reader, show a quiet "media pending" note
 * instead of dumping raw JSON. The interactive rendering lives in the client-only
 * BlogMarkdownEditor.
 */

// react-markdown wraps a fenced block as <pre><code class="language-x">. Override
// `pre` so we can intercept media fences before the default <pre> styles them.
function Pre(props: ComponentPropsWithoutRef<"pre">) {
  const child = props.children as
    | { props?: { className?: string } }
    | undefined;
  const className = child?.props?.className || "";
  if (/language-(chart|photo)/.test(className)) {
    return (
      <div className="my-6 rounded-md border border-dashed border-[var(--br-line)] bg-[var(--br-stone)] px-4 py-3 text-[13px] italic text-[var(--br-text-muted)]">
        Media pending — this block has not been finalized yet.
      </div>
    );
  }
  return <pre {...props} />;
}

export default function BlogMarkdown({ children }: { children: string }) {
  return <Markdown components={{ pre: Pre }}>{children}</Markdown>;
}
