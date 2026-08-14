import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeTags } from "@/lib/tags";

/**
 * Guards for the unpublish + revalidation slice.
 *
 * Two honest categories only:
 *
 *  1. Pure logic — normalizeTags, which is a real function with real inputs.
 *
 *  2. STRUCTURAL assertions read from source text. The route handlers cannot be
 *     imported here: lib/db.ts builds a pg Pool at module scope and there is no
 *     live-Postgres harness in this repo. Mocking the database would only prove
 *     the mock agrees with the test, so the SQL is pinned by reading it instead.
 *     Blunt, but it is the assertion that actually catches the regression this
 *     slice exists to prevent — see the republish-trap block below.
 *
 * What is NOT covered: auth, status codes, transactional behaviour, and whether
 * revalidatePath() truly invalidates the static cache. Those are curl-after-deploy
 * checks, not vitest ones.
 */

const WEB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (...parts: string[]) =>
  readFileSync(path.join(WEB, ...parts), "utf8");

const SCHEDULE = read(
  "app", "api", "admin", "marketing", "content", "[slug]", "schedule", "route.ts"
);
const ADMIN_CRUD = read("app", "api", "admin", "blog", "[slug]", "route.ts");
const ADMIN_CREATE = read("app", "api", "admin", "blog", "route.ts");
const PUBLIC_CRUD = read("app", "api", "blog", "[slug]", "route.ts");

const EXPECTED_ACTIONS = ["reschedule", "publish_now", "cancel", "unpublish"];

/** The literal values in `const ACTIONS: Action[] = [...]`. */
function parseActions(src: string): string[] {
  const m = src.match(/const ACTIONS: Action\[\] = \[([^\]]*)\];/);
  expect(m, "ACTIONS array literal not found").not.toBeNull();
  return (m as RegExpMatchArray)[1]
    .split(",")
    .map((s) => s.trim().replace(/^"|"$/g, ""))
    .filter(Boolean);
}

/** Source of the `unpublish` branch, from its `if` to its success return. */
function unpublishBranch(src: string): string {
  const start = src.indexOf('if (action === "unpublish")');
  expect(start, "unpublish branch not found").toBeGreaterThan(-1);
  const end = src.indexOf("published: false });", start);
  expect(end, "unpublish success return not found").toBeGreaterThan(start);
  return src.slice(start, end);
}

describe("schedule route — the action set", () => {
  it("ACTIONS contains all four actions", () => {
    expect(parseActions(SCHEDULE).sort()).toEqual([...EXPECTED_ACTIONS].sort());
  });

  it("the Action union carries all four", () => {
    const union = SCHEDULE.match(/type Action =([^;]*);/);
    expect(union).not.toBeNull();
    for (const action of EXPECTED_ACTIONS) {
      expect((union as RegExpMatchArray)[1]).toContain(`"${action}"`);
    }
  });

  it("the 400 message is generated from ACTIONS, so it names every action", () => {
    // Pinning the template is what makes the derived message below meaningful:
    // a hand-written list could drift from the array it is meant to describe.
    expect(SCHEDULE).toContain(
      "action must be one of ${ACTIONS.join(\", \")}"
    );
    const message = `action must be one of ${parseActions(SCHEDULE).join(", ")}`;
    for (const action of EXPECTED_ACTIONS) {
      expect(message).toContain(action);
    }
  });

  it("unpublish has its own 409 constant, distinct from ALREADY_LIVE", () => {
    expect(SCHEDULE).toMatch(/const NOT_LIVE = \{/);
    expect(unpublishBranch(SCHEDULE)).toContain(
      "NextResponse.json(NOT_LIVE, { status: 409 })"
    );
  });
});

describe("schedule route — the republish trap", () => {
  /**
   * THE test of this slice.
   *
   * The 60s scheduler tick matches `published = false AND publish_at IS NOT NULL
   * AND publish_at <= now()`. An unpublish that clears `published` but leaves a
   * past `publish_at` behind satisfies all three conjuncts, so the very next tick
   * republishes the post — and that path revalidates, so it comes back on the
   * live site inside a minute. Both column writes must land in ONE statement.
   */
  const branch = unpublishBranch(SCHEDULE);
  const sql = branch.match(/`([^`]*UPDATE blog_posts[^`]*)`/)?.[1] ?? "";

  it("issues exactly one UPDATE — the writes are not split across statements", () => {
    expect(sql).not.toBe("");
    expect(branch.match(/UPDATE blog_posts/g)).toHaveLength(1);
  });

  it("sets BOTH published = false AND publish_at = NULL in the SET clause", () => {
    const [setClause] = sql.split(/\bWHERE\b/);
    expect(setClause).toMatch(/published\s*=\s*false/);
    expect(setClause).toMatch(/publish_at\s*=\s*NULL/);
  });

  it("guards on published = true, inverting the other three actions", () => {
    const whereClause = sql.split(/\bWHERE\b/)[1] ?? "";
    expect(whereClause).toMatch(/published\s*=\s*true/);
    expect(whereClause).not.toMatch(/published\s*=\s*false/);
  });

  it("parameterises the slug rather than interpolating it", () => {
    expect(sql).toContain("slug = $1");
    expect(sql).not.toMatch(/slug = '/);
  });
});

describe("revalidation — every path that changes what a reader sees", () => {
  // /blog, /blog/<slug> and /sitemap.xml are all prerendered and all gated on
  // `published`. The site never expires on its own, so a mutation without these
  // is invisible to readers indefinitely.
  const SURFACES = ['revalidatePath("/blog")', 'revalidatePath("/sitemap.xml")'];

  it.each([
    ["schedule route — unpublish", unpublishBranch(SCHEDULE)],
    ["schedule route — publish_now", SCHEDULE.slice(
      SCHEDULE.indexOf('if (action === "publish_now")'),
      SCHEDULE.indexOf('if (action === "unpublish")')
    )],
    ["queue approve", read("app", "api", "admin", "marketing", "queue", "[id]", "route.ts")],
    ["scheduler tick", read("app", "api", "internal", "publish-due", "route.ts")],
    ["admin CRUD (PUT + DELETE)", ADMIN_CRUD],
    ["key-gated public DELETE", PUBLIC_CRUD],
  ])("%s revalidates /blog and /sitemap.xml", (_label, src) => {
    for (const call of SURFACES) expect(src).toContain(call);
    expect(src).toMatch(/revalidatePath\(`\/blog\/\$\{/);
  });

  it("reschedule and cancel deliberately do NOT revalidate", () => {
    // Neither changes anything a reader can see — an unpublished post is not on
    // /blog. Both carry a comment saying so; this pins the behaviour.
    const cancel = SCHEDULE.slice(SCHEDULE.indexOf("// cancel —"));
    expect(cancel).not.toContain("revalidatePath");
  });

  it("POST /api/admin/blog deliberately does NOT revalidate", () => {
    // It cannot publish, so nothing it writes is visible to a reader.
    expect(ADMIN_CREATE).not.toContain("revalidatePath");
  });
});

describe("the legacy publish doors are shut", () => {
  it("PUT /api/admin/blog/[slug] no longer writes published", () => {
    const update = ADMIN_CRUD.match(/UPDATE blog_posts SET[^`]*/)?.[0] ?? "";
    expect(update).not.toBe("");
    expect(update).not.toMatch(/published\s*=/);
    // The column is preserved, so fixing a typo in a live post leaves it live.
    expect(update).toContain("updated_at = NOW()");
  });

  it("PUT rejects a body carrying published, rather than ignoring it", () => {
    expect(ADMIN_CRUD).toContain(
      'Object.prototype.hasOwnProperty.call(body, "published")'
    );
    expect(ADMIN_CRUD).toContain('code: "published_not_accepted"');
    expect(ADMIN_CRUD).toContain("{ status: 400 }");
  });

  it("POST /api/admin/blog inserts a literal false, not a parameter", () => {
    const insert = ADMIN_CREATE.match(/INSERT INTO blog_posts[^"]*/)?.[0] ?? "";
    expect(insert).toContain("$7::jsonb, false)");
    // No 8th parameter means no request can reach the published column.
    expect(insert).not.toContain("$8");
  });

  it("POST rejects a body carrying published", () => {
    expect(ADMIN_CREATE).toContain(
      'Object.prototype.hasOwnProperty.call(body, "published")'
    );
    expect(ADMIN_CREATE).toContain('code: "published_not_accepted"');
  });
});

describe("normalizeTags — the jsonb round-trip that lost data", () => {
  // blog_posts.tags is jsonb; pg returns it ALREADY PARSED. The old code called
  // JSON.parse on the array, which stringifies it to "a,b" and throws, hit a
  // catch that substituted "", and the next save wrote that empty list back.
  it("passes an already-parsed array through — the case the bug could not survive", () => {
    expect(normalizeTags(["remodeling", "weaverville"])).toEqual([
      "remodeling",
      "weaverville",
    ]);
  });

  it("still parses a JSON string, which older rows really do hold", () => {
    expect(normalizeTags('["icf","asheville"]')).toEqual(["icf", "asheville"]);
  });

  it.each([
    ["garbage", "not json at all"],
    ["a JSON scalar", "42"],
    ["a JSON object", '{"a":1}'],
    ["null", null],
    ["undefined", undefined],
    ["a number", 7],
  ])("returns [] for %s", (_label, input) => {
    expect(normalizeTags(input)).toEqual([]);
  });

  it("drops non-string members rather than passing them to .join()", () => {
    expect(normalizeTags(["ok", 3, null, "fine"])).toEqual(["ok", "fine"]);
  });

  it("an empty array stays empty and is not confused with a failure", () => {
    expect(normalizeTags([])).toEqual([]);
  });
});
