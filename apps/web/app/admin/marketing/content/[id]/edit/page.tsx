"use client";
import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Markdown from "react-markdown";
import ImagePicker from "@/components/admin/ImagePicker";
import { Spinner } from "../../../_components/ui";

// Dedicated editor for a queued Content draft: edit fields + markdown + photos,
// Save without publishing, or Approve with edits. Marketing Tailwind look;
// reuses the blog editor's caret-splice logic and the shared ImagePicker.

// Mirrors SLUG_PATTERN in lib/approvalQueue.ts — client-side check so a bad slug
// fails before a round-trip. The server still validates; this is UX, not a gate.
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type DraftPayload = {
  slug: string;
  title: string;
  date: string;
  content: string;
  description: string;
  featured_image: string;
  tags: string[];
};

type QueueItem = {
  id: number;
  status: string;
  payload: DraftPayload | null;
};

export default function ContentEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [banner, setBanner] = useState("");
  const [showInsert, setShowInsert] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/admin/marketing/queue/${id}`);
        const d = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setLoadError(
            res.status === 404 ? "That draft no longer exists." : d.error || "Failed to load."
          );
          setLoading(false);
          return;
        }
        const item: QueueItem = d.item;
        if (!item?.payload) {
          setLoadError("This item has no editable payload.");
          setLoading(false);
          return;
        }
        if (item.status !== "pending") {
          setLoadError("Only pending drafts can be edited — this one is " + item.status + ".");
          setLoading(false);
          return;
        }
        const p = item.payload;
        setTitle(p.title || "");
        setSlug(p.slug || "");
        setDate(p.date || "");
        setDescription(p.description || "");
        setTags((p.tags || []).join(", "));
        setContent(p.content || "");
        setFeaturedImage(p.featured_image || "");
        setLoading(false);
      } catch {
        if (!cancelled) {
          setLoadError("Network error while loading the draft.");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Port of the blog editor's caret splice: drop ![alt](path) at the cursor.
  function insertImageAtCursor(path: string) {
    const tag = `![image description](${path})`;
    const ta = textareaRef.current;
    if (!ta) {
      setContent((prev) => prev + `\n${tag}\n`);
      return;
    }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const next = content.slice(0, start) + tag + content.slice(end);
    setContent(next);
    requestAnimationFrame(() => {
      ta.focus();
      const pos = start + tag.length;
      ta.setSelectionRange(pos, pos);
    });
  }

  function buildPayload(): DraftPayload {
    return {
      slug: slug.trim(),
      title: title.trim(),
      date: date.trim(),
      content,
      description: description.trim(),
      featured_image: featuredImage.trim(),
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };
  }

  function clientValidate(): string | null {
    if (!title.trim() || !slug.trim() || !date.trim() || !content.trim()) {
      return "Title, slug, date, and content are required.";
    }
    if (!SLUG_PATTERN.test(slug.trim())) {
      return "Slug must be lowercase words separated by single hyphens (e.g. my-post-title).";
    }
    return null;
  }

  async function patch(bodyExtra: Record<string, unknown>): Promise<QueueItem | null> {
    const res = await fetch(`/api/admin/marketing/queue/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyExtra),
    });
    const d = await res.json();
    if (!res.ok) {
      setError(
        d.code === "slug_conflict"
          ? "A post with that slug already exists — change the slug and retry."
          : d.error || "Something went wrong."
      );
      return null;
    }
    return d.item as QueueItem;
  }

  async function saveDraft() {
    setError("");
    setBanner("");
    const invalid = clientValidate();
    if (invalid) {
      setError(invalid);
      return;
    }
    setSaving(true);
    try {
      const item = await patch({ payload: buildPayload() });
      if (item) setBanner("Draft saved.");
    } catch {
      setError("Network error — nothing was saved.");
    } finally {
      setSaving(false);
    }
  }

  async function approve() {
    setError("");
    setBanner("");
    const invalid = clientValidate();
    if (invalid) {
      setError(invalid);
      return;
    }
    setSaving(true);
    try {
      const item = await patch({ payload: buildPayload(), status: "approved" });
      if (item) router.push("/admin/marketing/content");
    } catch {
      setError("Network error — nothing was published.");
    } finally {
      setSaving(false);
    }
  }

  async function reject() {
    setError("");
    setBanner("");
    setSaving(true);
    try {
      const item = await patch({ status: "rejected" });
      if (item) router.push("/admin/marketing/content");
    } catch {
      setError("Network error — nothing was changed.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="py-10">
        <Spinner />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-2xl py-10">
        <div className="mb-4 rounded-md border border-[#d9b3ad] bg-[#f6e9e7] px-4 py-3 text-[13px] text-[#8b3a32]">
          {loadError}
        </div>
        <button
          onClick={() => router.push("/admin/marketing/content")}
          className="text-[12.5px] font-semibold text-[var(--br-gold-dark)] underline"
        >
          ← Back to Content
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <button
            onClick={() => router.push("/admin/marketing/content")}
            className="text-[12.5px] font-semibold text-[var(--br-text-soft)] hover:text-[var(--br-text)]"
          >
            ← Back to Content
          </button>
          <div className="mt-1 font-serif text-[24px] leading-tight text-[var(--br-text)]">
            Edit draft
          </div>
          <div className="mt-0.5 text-[11px] uppercase tracking-wide text-[var(--br-text-muted)]">
            Pending · edits stay in the queue until you approve
          </div>
        </div>
      </div>

      {banner ? (
        <div className="mb-4 rounded-md border border-[#cdd6c3] bg-[#eef2e8] px-4 py-2.5 text-[12.5px] text-[#4f6340]">
          {banner}
        </div>
      ) : null}
      {error ? (
        <div className="mb-4 rounded-md border border-[#d9b3ad] bg-[#f6e9e7] px-4 py-2.5 text-[12.5px] text-[#8b3a32]">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: fields + markdown */}
        <div className="space-y-4">
          <Labeled label="Title">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
            />
          </Labeled>
          <Labeled label="Slug">
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className={inputClass}
            />
            {slug && !SLUG_PATTERN.test(slug) ? (
              <div className="mt-1 text-[11.5px] text-[#8b3a32]">
                Lowercase words separated by single hyphens.
              </div>
            ) : null}
          </Labeled>
          <Labeled label="Date">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputClass}
            />
          </Labeled>
          <Labeled label="Description">
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputClass}
            />
          </Labeled>
          <Labeled label="Tags">
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="remodeling, weaverville"
              className={inputClass}
            />
            <div className="mt-1 text-[11.5px] text-[var(--br-text-muted)]">Comma-separated.</div>
          </Labeled>

          <Labeled label="Featured image">
            <ImagePicker value={featuredImage} onChange={setFeaturedImage} />
          </Labeled>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--br-text-soft)]">
                Content (Markdown)
              </div>
              <button
                type="button"
                onClick={() => setShowInsert((v) => !v)}
                className="text-[11.5px] font-semibold text-[var(--br-gold-dark)] underline"
              >
                {showInsert ? "Close inserter" : "Insert photo"}
              </button>
            </div>
            {showInsert ? (
              <div className="mb-2 rounded-md border border-[var(--br-line)] bg-white/70 p-3">
                <div className="mb-1.5 text-[11.5px] text-[var(--br-text-muted)]">
                  Pick or upload — drops <code>![image description](…)</code> at the cursor.
                </div>
                <ImagePicker
                  value=""
                  onChange={(path) => {
                    insertImageAtCursor(path);
                    setShowInsert(false);
                  }}
                />
              </div>
            ) : null}
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={`${inputClass} min-h-[420px] resize-y font-mono text-[12.5px] leading-relaxed`}
            />
          </div>
        </div>

        {/* Right: live preview — identical to the live post */}
        <div>
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--br-text-soft)]">
            Live preview
          </div>
          <div className="rounded-md border border-[var(--br-line)] bg-white p-5">
            <div className="br-blog-prose">
              {content ? (
                <Markdown>{content}</Markdown>
              ) : (
                <p className="italic text-[var(--br-text-muted)]">
                  Start typing to see the preview…
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="mt-6 flex flex-wrap items-center justify-end gap-2 border-t border-[var(--br-line)] pt-4">
        <button
          onClick={reject}
          disabled={saving}
          className="mr-auto rounded-md border border-[var(--br-line)] bg-white/70 px-4 py-2 text-[13px] font-semibold text-[var(--br-text-mid)] hover:bg-[var(--br-stone)] disabled:opacity-50"
        >
          Reject
        </button>
        <button
          onClick={saveDraft}
          disabled={saving}
          className="rounded-md border border-[var(--br-line)] bg-white/70 px-4 py-2 text-[13px] font-semibold text-[var(--br-text-mid)] hover:bg-[var(--br-stone)] disabled:opacity-50"
        >
          {saving ? "Working…" : "Save draft"}
        </button>
        <button
          onClick={approve}
          disabled={saving}
          className="rounded-md border border-[var(--br-gold-dark)] bg-[var(--br-gold)] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[var(--br-gold-dark)] disabled:opacity-50"
        >
          {saving ? "Working…" : "Approve & publish"}
        </button>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-[var(--br-line)] bg-white/70 px-2.5 py-1.5 text-[13px] text-[var(--br-text-mid)] outline-none focus:border-[var(--br-gold)]";

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--br-text-soft)]">
        {label}
      </div>
      {children}
    </div>
  );
}
