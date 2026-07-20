"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SectionHeader, StakesTag, EmptyState, Spinner } from "../_components/ui";
import { CONTENT_CALENDAR } from "@/lib/contentCalendar";

type Post = {
  slug: string;
  title: string;
  date: string;
  description: string | null;
  featured_image: string | null;
  tags: string[] | string | null;
  published: boolean;
  updated_at: string | null;
};

type ContentPayload = {
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
  created_at: string;
  module: string;
  action: string;
  stakes: string;
  title: string;
  preview: string | null;
  payload: ContentPayload | null;
  status: string;
  reviewed_at: string | null;
  reviewer: string | null;
};

// Mirrors SLUG_PATTERN in lib/approvalQueue.ts — client-side check so the compose
// form fails before a round-trip. The server still validates; this is UX, not a gate.
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Math.floor((Date.now() - then) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
}

// pg returns jsonb parsed, but blog_posts.tags has been written by more than one
// code path over time — handle the string case the way lib/blog.ts does.
function normalizeTags(tags: Post["tags"]): string[] {
  if (Array.isArray(tags)) return tags;
  if (typeof tags === "string") {
    try {
      const parsed = JSON.parse(tags);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const TABS = [
  { key: "posts", label: "Posts" },
  { key: "queue", label: "Review Queue" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

const EMPTY_FORM = {
  title: "",
  slug: "",
  date: "",
  description: "",
  tags: "",
  content: "",
};

export default function ContentPage() {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("posts");

  const [posts, setPosts] = useState<Post[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingQueue, setLoadingQueue] = useState(true);

  const [selected, setSelected] = useState<QueueItem | null>(null);
  const [acting, setActing] = useState(false);
  const [drawerError, setDrawerError] = useState("");
  const [banner, setBanner] = useState<{ text: string; href?: string } | null>(null);

  const [composeOpen, setComposeOpen] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [generateOpen, setGenerateOpen] = useState(false);
  const [genForm, setGenForm] = useState({ topic: "", keyword: "", audience: "" });
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");

  const loadPosts = useCallback(async () => {
    setLoadingPosts(true);
    try {
      const res = await fetch("/api/admin/marketing/content");
      const d = await res.json();
      setPosts(d.posts || []);
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  const loadQueue = useCallback(async () => {
    setLoadingQueue(true);
    try {
      // The queue GET has no module param — filter client-side.
      const res = await fetch("/api/admin/marketing/queue?status=pending");
      const d = await res.json();
      const items: QueueItem[] = d.items || [];
      setQueue(items.filter((i) => i.module === "Content"));
    } finally {
      setLoadingQueue(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
    loadQueue();
  }, [loadPosts, loadQueue]);

  const counts = useMemo(() => {
    const live = posts.filter((p) => p.published).length;
    return { live, drafts: posts.length - live };
  }, [posts]);

  async function review(item: QueueItem, status: "approved" | "rejected") {
    setActing(true);
    setDrawerError("");
    try {
      const res = await fetch(`/api/admin/marketing/queue/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const d = await res.json();

      if (!res.ok) {
        // 409 slug_conflict: the tx rolled back, so the item is still pending.
        setDrawerError(
          d.code === "slug_conflict"
            ? "That slug is already published — edit the draft and retry."
            : d.error || "Something went wrong."
        );
        return;
      }

      setSelected(null);
      if (status === "approved") {
        const slug = item.payload?.slug;
        setBanner({
          text: slug ? `Published to /blog/${slug}` : "Published.",
          href: slug ? `/blog/${slug}` : undefined,
        });
      } else {
        setBanner({ text: `Rejected "${item.title}".` });
      }
      await Promise.all([loadPosts(), loadQueue()]);
    } catch {
      setDrawerError("Network error — nothing was changed.");
    } finally {
      setActing(false);
    }
  }

  async function submitDraft() {
    setFormError("");
    const slug = form.slug.trim();
    if (!form.title.trim() || !slug || !form.date.trim() || !form.content.trim()) {
      setFormError("Title, slug, date, and content are required.");
      return;
    }
    if (!SLUG_PATTERN.test(slug)) {
      setFormError(
        "Slug must be lowercase words separated by single hyphens (e.g. my-post-title)."
      );
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/marketing/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          title: form.title.trim(),
          date: form.date.trim(),
          description: form.description.trim(),
          content: form.content,
          tags: form.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });
      const d = await res.json();
      if (!res.ok) {
        setFormError(d.error || "Failed to queue the draft.");
        return;
      }
      setComposeOpen(false);
      setForm({ ...EMPTY_FORM });
      setSlugTouched(false);
      setBanner({ text: "Draft queued for review." });
      setTab("queue");
      await loadQueue();
    } catch {
      setFormError("Network error — the draft was not queued.");
    } finally {
      setSaving(false);
    }
  }

  async function generateDraft() {
    setGenError("");
    if (!genForm.topic.trim()) {
      setGenError("Topic is required.");
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch("/api/admin/marketing/content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: genForm.topic.trim(),
          keyword: genForm.keyword.trim(),
          audience: genForm.audience.trim(),
        }),
      });
      const d = await res.json();
      if (!res.ok) {
        // 502 generation failed carries a detail; other errors carry error.
        setGenError(d.detail || d.error || "Generation failed.");
        return;
      }
      // The enqueued queue item comes back; jump to it so Brian judges it now.
      const item: QueueItem = d.item;
      setGenerateOpen(false);
      setGenForm({ topic: "", keyword: "", audience: "" });
      setBanner({ text: "Draft generated and queued for review." });
      setTab("queue");
      await loadQueue();
      if (item) {
        setDrawerError("");
        setSelected(item);
      }
    } catch {
      setGenError("Network error — no draft was generated.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div>
      <SectionHeader
        title="Content"
        subtitle={
          tab === "posts"
            ? `${counts.live} live · ${counts.drafts} draft${counts.drafts === 1 ? "" : "s"} · blog_posts inventory`
            : `${queue.length} Content item${queue.length === 1 ? "" : "s"} awaiting review`
        }
        right={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex overflow-hidden rounded-md border border-[var(--br-line)]">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={
                    "px-3 py-1.5 text-[12.5px] font-semibold transition-colors " +
                    (tab === t.key
                      ? "bg-[var(--br-gold)] text-white"
                      : "bg-white/70 text-[var(--br-text-mid)] hover:bg-[var(--br-cream-2)]")
                  }
                >
                  {t.label}
                  {t.key === "queue" && queue.length > 0 ? (
                    <span className="ml-1.5 rounded-full bg-black/10 px-1.5 py-0.5 text-[10px]">
                      {queue.length}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
            {tab === "posts" ? (
              <>
                <button
                  onClick={() => {
                    // Fast path: pre-fill the next recommended calendar slot so
                    // the drawer opens ready to Generate with no typing.
                    const slot = CONTENT_CALENDAR[0];
                    setGenForm(
                      slot
                        ? { topic: slot.topic, keyword: slot.keyword, audience: slot.audience }
                        : { topic: "", keyword: "", audience: "" }
                    );
                    setGenError("");
                    setGenerateOpen(true);
                  }}
                  className="rounded-md border border-[var(--br-line)] bg-white/70 px-3 py-1.5 text-[12.5px] font-semibold text-[var(--br-text-mid)] hover:bg-[var(--br-cream-2)]"
                >
                  ✦ Generate draft
                </button>
                <button
                  onClick={() => {
                    setForm({
                      ...EMPTY_FORM,
                      date: new Date().toISOString().slice(0, 10),
                    });
                    setSlugTouched(false);
                    setFormError("");
                    setComposeOpen(true);
                  }}
                  className="rounded-md border border-[var(--br-gold-dark)] bg-[var(--br-gold)] px-3 py-1.5 text-[12.5px] font-semibold text-white hover:bg-[var(--br-gold-dark)]"
                >
                  + New draft
                </button>
              </>
            ) : null}
          </div>
        }
      />

      {banner ? (
        <div className="mb-4 flex items-center justify-between gap-4 rounded-md border border-[#cdd6c3] bg-[#eef2e8] px-4 py-2.5 text-[12.5px] text-[#4f6340]">
          <span>
            {banner.text}
            {banner.href ? (
              <>
                {" "}
                <a
                  href={banner.href}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold underline"
                >
                  View post →
                </a>
              </>
            ) : null}
          </span>
          <button
            onClick={() => setBanner(null)}
            className="text-[16px] leading-none text-[#4f6340]/70 hover:text-[#4f6340]"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ) : null}

      <div className="mb-4 rounded-md border border-[#b7c9d6] bg-[#e9f0f4] px-4 py-2.5 text-[12.5px] text-[#3d5a68]">
        Drafts — human or agent — land in the approval queue. <strong>Approving publishes
        the post live</strong> in the same transaction; nothing reaches the site unreviewed.
      </div>

      {tab === "posts" ? (
        loadingPosts ? (
          <Spinner />
        ) : posts.length === 0 ? (
          <EmptyState
            title="No posts yet"
            hint="Queue a draft with “New draft”. Approved drafts appear here as live posts."
            icon="◇"
          />
        ) : (
          <div className="flex flex-col gap-2">
            {posts.map((post) => (
              <div
                key={post.slug}
                className="flex items-center justify-between gap-4 rounded-lg border border-[var(--br-line)] bg-white/70 px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[14px] font-semibold text-[var(--br-text)]">
                      {post.title}
                    </span>
                    <PostStatePill published={post.published} />
                  </div>
                  <div className="mt-0.5 truncate text-[12px] text-[var(--br-text-soft)]">
                    /{post.slug} · {timeAgo(post.date)}
                  </div>
                  {normalizeTags(post.tags).length > 0 ? (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {normalizeTags(post.tags).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-[var(--br-line)] bg-[var(--br-cream-2)] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[var(--br-text-muted)]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
                {post.published ? (
                  <a
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 text-[12.5px] font-semibold text-[var(--br-gold-dark)] underline"
                  >
                    View →
                  </a>
                ) : (
                  <span className="shrink-0 text-[12px] text-[var(--br-text-muted)]">
                    Not public
                  </span>
                )}
              </div>
            ))}
          </div>
        )
      ) : loadingQueue ? (
        <Spinner />
      ) : queue.length === 0 ? (
        <EmptyState
          title="Nothing awaiting review"
          hint="Content drafts from the admin form or the agent API appear here as pending items."
          icon="◇"
        />
      ) : (
        <div className="flex flex-col gap-2">
          {queue.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setDrawerError("");
                setSelected(item);
              }}
              className="rounded-lg border border-[var(--br-line)] bg-white/70 px-4 py-3 text-left transition-shadow hover:shadow-[var(--br-shadow-sm)]"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="truncate text-[14px] font-semibold text-[var(--br-text)]">
                  {item.title}
                </span>
                <StakesTag stakes={item.stakes} />
              </div>
              {item.preview ? (
                <div className="mt-1 truncate text-[12.5px] text-[var(--br-text-soft)]">
                  {item.preview}
                </div>
              ) : null}
              <div className="mt-1 text-[11px] text-[var(--br-text-muted)]">
                {item.payload?.slug ? `/${item.payload.slug} · ` : ""}
                {timeAgo(item.created_at)}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Review drawer */}
      {selected ? (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => (acting ? null : setSelected(null))}
          />
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-[560px] flex-col border-l border-[var(--br-line)] bg-[var(--br-cream)] shadow-2xl">
            <div className="flex items-start justify-between border-b border-[var(--br-line)] px-5 py-4">
              <div className="min-w-0">
                <div className="truncate font-serif text-[22px] leading-tight text-[var(--br-text)]">
                  {selected.title}
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <StakesTag stakes={selected.stakes} />
                  <span className="text-[11px] uppercase tracking-wide text-[var(--br-text-muted)]">
                    {selected.action} · {timeAgo(selected.created_at)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                disabled={acting}
                className="text-2xl leading-none text-[var(--br-text-soft)] hover:text-[var(--br-text)] disabled:opacity-40"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
              {selected.payload ? (
                <>
                  <Field label="Slug">/{selected.payload.slug}</Field>
                  <Field label="Date">{selected.payload.date}</Field>
                  <Field label="Tags">
                    {selected.payload.tags?.length ? (
                      <div className="flex flex-wrap gap-1.5">
                        {selected.payload.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-[var(--br-line)] bg-[var(--br-cream-2)] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[var(--br-text-muted)]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : (
                      "None"
                    )}
                  </Field>
                  <Field label="Description">
                    {selected.payload.description || "Not provided"}
                  </Field>
                  {selected.payload.featured_image ? (
                    <Field label="Featured image">{selected.payload.featured_image}</Field>
                  ) : null}
                  <Field label="Content">
                    <pre className="max-h-[40vh] overflow-auto whitespace-pre-wrap rounded-md border border-[var(--br-line)] bg-white/70 p-3 font-sans text-[13px] leading-relaxed text-[var(--br-text-mid)]">
                      {selected.payload.content}
                    </pre>
                  </Field>
                </>
              ) : (
                <div className="rounded-md border border-[#d9b3ad] bg-[#f6e9e7] px-4 py-3 text-[12.5px] text-[#8b3a32]">
                  This item has no readable payload — approving it will fail. Reject it.
                </div>
              )}
            </div>

            {drawerError ? (
              <div className="mx-5 mb-3 rounded-md border border-[#d9b3ad] bg-[#f6e9e7] px-4 py-2.5 text-[12.5px] text-[#8b3a32]">
                {drawerError}
              </div>
            ) : null}

            <div className="flex items-center justify-end gap-2 border-t border-[var(--br-line)] px-5 py-4">
              {selected.payload ? (
                <button
                  onClick={() => router.push(`/admin/marketing/content/${selected.id}/edit`)}
                  disabled={acting}
                  className="mr-auto rounded-md border border-[var(--br-line)] bg-white/70 px-4 py-2 text-[13px] font-semibold text-[var(--br-text-mid)] hover:bg-[var(--br-stone)] disabled:opacity-50"
                >
                  Edit draft →
                </button>
              ) : null}
              <button
                onClick={() => review(selected, "rejected")}
                disabled={acting}
                className="rounded-md border border-[var(--br-line)] bg-white/70 px-4 py-2 text-[13px] font-semibold text-[var(--br-text-mid)] hover:bg-[var(--br-stone)] disabled:opacity-50"
              >
                Reject
              </button>
              <button
                onClick={() => review(selected, "approved")}
                disabled={acting}
                className="rounded-md border border-[var(--br-gold-dark)] bg-[var(--br-gold)] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[var(--br-gold-dark)] disabled:opacity-50"
              >
                {acting ? "Working…" : "Approve & publish"}
              </button>
            </div>
          </aside>
        </div>
      ) : null}

      {/* Compose draft */}
      {composeOpen ? (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => (saving ? null : setComposeOpen(false))}
          />
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-[560px] flex-col border-l border-[var(--br-line)] bg-[var(--br-cream)] shadow-2xl">
            <div className="flex items-start justify-between border-b border-[var(--br-line)] px-5 py-4">
              <div>
                <div className="font-serif text-[22px] leading-tight text-[var(--br-text)]">
                  New draft
                </div>
                <div className="mt-1 text-[11px] uppercase tracking-wide text-[var(--br-text-muted)]">
                  Queues for review — does not publish
                </div>
              </div>
              <button
                onClick={() => setComposeOpen(false)}
                disabled={saving}
                className="text-2xl leading-none text-[var(--br-text-soft)] hover:text-[var(--br-text)] disabled:opacity-40"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
              <Labeled label="Title">
                <input
                  value={form.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setForm((f) => ({
                      ...f,
                      title,
                      slug: slugTouched ? f.slug : slugify(title),
                    }));
                  }}
                  placeholder="Choosing a Builder in Weaverville"
                  className={inputClass}
                />
              </Labeled>
              <Labeled label="Slug">
                <input
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setForm((f) => ({ ...f, slug: e.target.value }));
                  }}
                  placeholder="choosing-a-builder-in-weaverville"
                  className={inputClass}
                />
                {form.slug && !SLUG_PATTERN.test(form.slug) ? (
                  <div className="mt-1 text-[11.5px] text-[#8b3a32]">
                    Lowercase words separated by single hyphens.
                  </div>
                ) : null}
              </Labeled>
              <Labeled label="Date">
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  className={inputClass}
                />
              </Labeled>
              <Labeled label="Description">
                <input
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="One-line summary for the blog card"
                  className={inputClass}
                />
              </Labeled>
              <Labeled label="Tags">
                <input
                  value={form.tags}
                  onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                  placeholder="remodeling, weaverville"
                  className={inputClass}
                />
                <div className="mt-1 text-[11.5px] text-[var(--br-text-muted)]">
                  Comma-separated.
                </div>
              </Labeled>
              <Labeled label="Content">
                <textarea
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  placeholder="Markdown — rendered by react-markdown on the live post."
                  className={`${inputClass} min-h-[220px] resize-y font-sans leading-relaxed`}
                />
              </Labeled>
            </div>

            {formError ? (
              <div className="mx-5 mb-3 rounded-md border border-[#d9b3ad] bg-[#f6e9e7] px-4 py-2.5 text-[12.5px] text-[#8b3a32]">
                {formError}
              </div>
            ) : null}

            <div className="flex items-center justify-end gap-2 border-t border-[var(--br-line)] px-5 py-4">
              <button
                onClick={() => setComposeOpen(false)}
                disabled={saving}
                className="rounded-md border border-[var(--br-line)] bg-white/70 px-4 py-2 text-[13px] font-semibold text-[var(--br-text-mid)] hover:bg-[var(--br-stone)] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={submitDraft}
                disabled={saving}
                className="rounded-md border border-[var(--br-gold-dark)] bg-[var(--br-gold)] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[var(--br-gold-dark)] disabled:opacity-50"
              >
                {saving ? "Queueing…" : "Queue for review"}
              </button>
            </div>
          </aside>
        </div>
      ) : null}

      {/* Generate draft */}
      {generateOpen ? (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => (generating ? null : setGenerateOpen(false))}
          />
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-[560px] flex-col border-l border-[var(--br-line)] bg-[var(--br-cream)] shadow-2xl">
            <div className="flex items-start justify-between border-b border-[var(--br-line)] px-5 py-4">
              <div>
                <div className="font-serif text-[22px] leading-tight text-[var(--br-text)]">
                  Generate draft
                </div>
                <div className="mt-1 text-[11px] uppercase tracking-wide text-[var(--br-text-muted)]">
                  Writes a full post · queues for review · does not publish
                </div>
              </div>
              <button
                onClick={() => setGenerateOpen(false)}
                disabled={generating}
                className="text-2xl leading-none text-[var(--br-text-soft)] hover:text-[var(--br-text)] disabled:opacity-40"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
              <div className="rounded-md border border-[#b7c9d6] bg-[#e9f0f4] px-4 py-2.5 text-[12.5px] text-[#3d5a68]">
                The writer drafts in the Blue Ridge Homes voice and lands a pending
                draft in the queue. Generation takes ~20-40s. Review and edit before
                approving — it may include <strong>[VERIFY: …]</strong> placeholders
                for figures to confirm.
              </div>

              {/* Editorial-calendar presets — one tap fills topic/keyword/audience. */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--br-text-soft)]">
                    From the calendar
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setGenForm({ topic: "", keyword: "", audience: "" })
                    }
                    className="text-[11.5px] font-semibold text-[var(--br-gold-dark)] underline"
                  >
                    Write my own
                  </button>
                </div>
                <div className="flex flex-col gap-1.5">
                  {CONTENT_CALENDAR.map((slot, i) => {
                    const active = genForm.topic === slot.topic;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() =>
                          setGenForm({
                            topic: slot.topic,
                            keyword: slot.keyword,
                            audience: slot.audience,
                          })
                        }
                        className={
                          "flex items-start gap-2 rounded-md border px-3 py-2 text-left transition-colors " +
                          (active
                            ? "border-[var(--br-gold-dark)] bg-[var(--br-gold)]/10"
                            : "border-[var(--br-line)] bg-white/70 hover:bg-[var(--br-cream-2)]")
                        }
                      >
                        <span className="mt-0.5 shrink-0 rounded-full border border-[var(--br-line)] bg-[var(--br-cream-2)] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[var(--br-text-muted)]">
                          {slot.month}
                        </span>
                        <span className="min-w-0 text-[12.5px] leading-snug text-[var(--br-text)]">
                          {slot.topic}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <Labeled label="Topic">
                <input
                  value={genForm.topic}
                  onChange={(e) => setGenForm((g) => ({ ...g, topic: e.target.value }))}
                  placeholder="Resilient roofing choices for steep mountain lots"
                  className={inputClass}
                />
              </Labeled>
              <Labeled label="Target keyword (optional)">
                <input
                  value={genForm.keyword}
                  onChange={(e) => setGenForm((g) => ({ ...g, keyword: e.target.value }))}
                  placeholder="mountain home roofing asheville"
                  className={inputClass}
                />
                <div className="mt-1 text-[11.5px] text-[var(--br-text-muted)]">
                  Left blank, the writer picks one that fits.
                </div>
              </Labeled>
              <Labeled label="Audience (optional)">
                <input
                  value={genForm.audience}
                  onChange={(e) => setGenForm((g) => ({ ...g, audience: e.target.value }))}
                  placeholder="resilience-minded rebuilders"
                  className={inputClass}
                />
              </Labeled>
            </div>

            {genError ? (
              <div className="mx-5 mb-3 rounded-md border border-[#d9b3ad] bg-[#f6e9e7] px-4 py-2.5 text-[12.5px] text-[#8b3a32]">
                {genError}
              </div>
            ) : null}

            <div className="flex items-center justify-end gap-2 border-t border-[var(--br-line)] px-5 py-4">
              <button
                onClick={() => setGenerateOpen(false)}
                disabled={generating}
                className="rounded-md border border-[var(--br-line)] bg-white/70 px-4 py-2 text-[13px] font-semibold text-[var(--br-text-mid)] hover:bg-[var(--br-stone)] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={generateDraft}
                disabled={generating}
                className="rounded-md border border-[var(--br-gold-dark)] bg-[var(--br-gold)] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[var(--br-gold-dark)] disabled:opacity-50"
              >
                {generating ? "Generating…" : "Generate & queue"}
              </button>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-[var(--br-line)] bg-white/70 px-2.5 py-1.5 text-[13px] text-[var(--br-text-mid)] outline-none focus:border-[var(--br-gold)]";

// StatusTag's map covers the lead pipeline stages only — "Live"/"Draft" would both
// fall through to its neutral default and read identically. Own pill instead.
function PostStatePill({ published }: { published: boolean }) {
  return (
    <span
      className={
        "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide " +
        (published
          ? "border-[#cdd6c3] bg-[#eef2e8] text-[#4f6340]"
          : "border-[var(--br-line)] bg-[var(--br-stone)] text-[var(--br-text-muted)]")
      }
    >
      {published ? "Live" : "Draft"}
    </span>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--br-text-soft)]">
        {label}
      </div>
      <div className="text-[13.5px] text-[var(--br-text)]">{children}</div>
    </div>
  );
}

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
