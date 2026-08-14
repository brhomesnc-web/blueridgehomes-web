import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Guards for the draft publish / schedule path.
 *
 * The gap this slice closed: the Schedule → button that opens the post-manage
 * modal was gated `!post.published && post.publish_at`. A draft passes the first
 * clause and fails the second, and THREE of the four ways a draft comes into
 * being leave publish_at NULL (unpublish, cancel, POST /api/admin/blog). Only
 * queue-approve-with-a-schedule sets it — which is why the gap stayed invisible
 * to anyone exercising that one flow. So a draft had no forward path at all.
 *
 * STRUCTURAL assertions read from source text, same discipline as
 * unpublish.test.ts. page.tsx is a client component whose behaviour is a click →
 * fetch → re-render cycle; there is no jsdom/RTL harness and no fetch mock in
 * this repo, and standing one up to assert "the button I just wrote calls the
 * handler I just wrote" would prove the mock agrees with the test.
 *
 * What is therefore NOT covered, and is a curl/click-after-deploy check instead:
 * that clicking Publish now actually reaches the route, that the row flips, that
 * the banner renders, and that loadPosts() repaints the card as Live. See the
 * production-verification steps in the slice report.
 *
 * What IS covered honestly: the render gates, the handler's shape, the reuse of
 * existing classnames, and — cross-file — the two route guards that make this a
 * UI-only fix. If either guard grows a publish_at clause, drafts silently lose
 * the path again and these fail.
 */

const WEB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (...parts: string[]) =>
  readFileSync(path.join(WEB, ...parts), "utf8");

const PAGE = read("app", "admin", "marketing", "content", "page.tsx");
const SCHEDULE = read(
  "app", "api", "admin", "marketing", "content", "[slug]", "schedule", "route.ts"
);

/** The per-card action cluster, through to the end of the Posts branch. */
function actionCluster(src: string): string {
  const start = src.indexOf('<div className="flex shrink-0 items-center gap-3">');
  expect(start, "action cluster not found").toBeGreaterThan(-1);
  const end = src.indexOf(") : loadingQueue ? (", start);
  expect(end, "end of the Posts branch not found").toBeGreaterThan(start);
  return src.slice(start, end);
}

/** The publishNow() handler body. */
function publishNowHandler(src: string): string {
  const start = src.indexOf("async function publishNow(post: Post) {");
  expect(start, "publishNow handler not found").toBeGreaterThan(-1);
  const end = src.indexOf("async function submitDraft()", start);
  expect(end, "end of publishNow not found").toBeGreaterThan(start);
  return src.slice(start, end);
}

/** The Publish now button, from its render gate to that gate's `) : null}`. */
function publishNowButton(cluster: string): string {
  const start = cluster.indexOf("{!post.published && !post.publish_at ? (");
  expect(start, "Publish now render gate not found").toBeGreaterThan(-1);
  const end = cluster.indexOf(") : null}", start);
  expect(end, "Publish now gate is unterminated").toBeGreaterThan(start);
  return cluster.slice(start, end);
}

/** The `UPDATE blog_posts` WHERE clause of one action branch of the route. */
function whereClause(from: string, to: string): string {
  const branch = SCHEDULE.slice(SCHEDULE.indexOf(from), SCHEDULE.indexOf(to));
  expect(branch, `branch ${from} not found`).not.toBe("");
  const sql = branch.match(/`([^`]*UPDATE blog_posts[^`]*)`/)?.[1] ?? "";
  expect(sql, `no UPDATE in branch ${from}`).not.toBe("");
  return sql.split(/\bWHERE\b/)[1] ?? "";
}

const CLUSTER = actionCluster(PAGE);
const BUTTON = publishNowButton(CLUSTER);
const HANDLER = publishNowHandler(PAGE);

/** The primary-gold button classname the manage modal's Save already used. */
const GOLD =
  "rounded-md border border-[var(--br-gold-dark)] bg-[var(--br-gold)] " +
  "px-3 py-1.5 text-[12.5px] font-semibold text-white " +
  "hover:bg-[var(--br-gold-dark)] disabled:opacity-50";

describe("the Schedule → trigger reaches drafts", () => {
  it("its gate no longer requires publish_at", () => {
    // THE regression this file exists to prevent. Re-adding the clause puts
    // every unpublished/cancelled post back in the dead end.
    expect(CLUSTER).not.toContain("{!post.published && post.publish_at ? (");
    expect(CLUSTER).toContain("{!post.published ? (");
  });

  it("the widened gate is the one actually wrapping Schedule →", () => {
    // Asserting the string exists proves nothing about WHICH button it gates.
    const start = CLUSTER.indexOf("{!post.published ? (");
    const end = CLUSTER.indexOf(") : null}", start);
    expect(CLUSTER.slice(start, end)).toContain("Schedule →");
  });

  it("the goes-live sub-line is deliberately NOT widened", () => {
    // A draft has no publish_at_ny, so it correctly renders nothing there.
    // Widening this too would print "goes live null ET".
    expect(PAGE).toContain("{!post.published && post.publish_at_ny");
  });

  it("a draft opening the modal with an empty datetime is refused inline", () => {
    // The one edge the widened gate newly exposes: publish_at_ny is NULL for a
    // draft, so the input opens empty. Save must produce the inline error, not
    // a request the route would reject.
    expect(PAGE).toContain('if (action === "reschedule" && !manageValue)');
    expect(PAGE).toContain('setManageError("Pick a date and time first.");');
  });
});

describe("Publish now — the per-card publish_now affordance", () => {
  it("renders on drafts only, so scheduled cards are unchanged", () => {
    expect(BUTTON).toContain("Publish now");
    expect(BUTTON).toContain("publishNow(post)");
  });

  it("is one click — no arming state gates it", () => {
    // Unpublish is two-click because it is the destructive direction. Publishing
    // is reversible from the card it produces, and the manage modal's own
    // Publish now already fires on a single click.
    expect(BUTTON).not.toContain("unpublishArmed === post.slug");
    expect(BUTTON).not.toContain("Confirm");
  });

  it("carries the primary-gold classname verbatim — no new variant", () => {
    expect(BUTTON).toContain(GOLD);
    // Already in use elsewhere in this file, so this is reuse, not invention.
    expect(PAGE.split(GOLD).length - 1).toBeGreaterThanOrEqual(2);
  });

  it("only the primary button swaps its label, and only on the clicked card", () => {
    // publishingSlug rather than a bare boolean: a global flag would print
    // "Working…" on every draft card at once.
    expect(BUTTON).toContain(
      '{publishingSlug === post.slug ? "Working…" : "Publish now"}'
    );
  });

  it("is disabled while either card-area action is in flight", () => {
    expect(BUTTON).toContain("disabled={publishingNow || unpublishing}");
  });
});

describe("the handler follows the card area's house pattern", () => {
  it("PATCHes the existing schedule route with action publish_now", () => {
    expect(HANDLER).toContain('method: "PATCH"');
    expect(HANDLER).toContain(
      "`/api/admin/marketing/content/${post.slug}/schedule`"
    );
    expect(HANDLER).toContain('body: JSON.stringify({ action: "publish_now" })');
  });

  it("is a distinct caller from the modal's manageSchedule path", () => {
    expect(HANDLER).not.toContain("manageSchedule");
    // The modal path is untouched and still reaches the same action.
    expect(PAGE).toContain('manageSchedule("publish_now")');
  });

  it("surfaces errors in the shared card callout, not a new one", () => {
    expect(HANDLER).toContain("setPostsError(d.error");
    expect(HANDLER).toContain('setPostsError("Network error — nothing was changed.");');
  });

  it("re-reads from the server rather than mutating local state", () => {
    // The pill, the header counts and the whole action set derive from
    // published/publish_at. A local patch would drift from all three.
    expect(HANDLER).toContain("await loadPosts();");
    expect(HANDLER).not.toContain("setPosts(");
  });

  it("banners with the href variant, so success offers View post →", () => {
    expect(HANDLER).toContain("href: `/blog/${post.slug}`");
  });

  it("clears its in-flight state in finally, so a failure cannot strand it", () => {
    expect(HANDLER).toMatch(/finally \{\s*setPublishingSlug\(null\);\s*\}/);
  });
});

describe("the live and scheduled cards are unchanged", () => {
  it("View → / Not public and Unpublish still key on published alone", () => {
    expect(CLUSTER.match(/\{post\.published \? \(/g)).toHaveLength(2);
    expect(CLUSTER).toContain("Not public");
    expect(CLUSTER).toContain("Unpublish");
  });

  it("every gate this slice added excludes a published post", () => {
    // Both new/widened gates open with !post.published, so nothing new can
    // appear on a live card.
    expect(CLUSTER).toContain("{!post.published && !post.publish_at ? (");
    expect(CLUSTER).toContain("{!post.published ? (");
  });
});

describe("the server side this depends on — and must stay that way", () => {
  /**
   * This slice is UI-only precisely because neither guard reads publish_at. If
   * either grows such a clause, the draft path breaks again from the other side
   * and nothing in page.tsx would show it.
   */
  it("publish_now guards on published = false, which a draft satisfies", () => {
    const where = whereClause(
      'if (action === "publish_now")',
      'if (action === "unpublish")'
    );
    expect(where).toMatch(/published\s*=\s*false/);
    expect(where).not.toContain("publish_at");
  });

  it("reschedule guards the same way, so a draft can be given a publish_at", () => {
    const where = whereClause(
      'if (action === "reschedule")',
      'if (action === "publish_now")'
    );
    expect(where).toMatch(/published\s*=\s*false/);
    expect(where).not.toContain("publish_at");
  });
});
