import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Guards for the portfolio soft-404 slice.
 *
 * Same honest categories as tests/unpublish.test.ts and
 * tests/service-locations.test.ts — except that here BOTH guards fall in the
 * structural category. lib/portfolio.ts cannot be imported: it pulls lib/db.ts,
 * which builds a pg Pool at module scope, and there is no live-Postgres harness
 * in this repo. Mocking the database would only prove the mock agrees with the
 * test, so the SQL is pinned by reading it.
 *
 * READ THIS BEFORE TRUSTING THE published GUARD. It proves the WHERE clause says
 * `published = true`. It does NOT prove that an unpublished slug resolves to null
 * at run time — nothing in this repo executes SQL. That remains a curl-after-
 * deploy check, and the slice report says so rather than claiming coverage it
 * does not have.
 */

const WEB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (...parts: string[]) => readFileSync(path.join(WEB, ...parts), "utf8");

/** One exported function's source, from its declaration to the next `export`. */
function fnBody(src: string, name: string): string {
  const start = src.indexOf(`export async function ${name}`);
  expect(start, `${name} not found`).toBeGreaterThan(-1);
  const end = src.indexOf("\nexport ", start + 1);
  return end > start ? src.slice(start, end) : src.slice(start);
}

describe("the portfolio segment has no loading boundary", () => {
  it("app/portfolio/loading.tsx does NOT exist", () => {
    // Identical reasoning to the blog guard in tests/unpublish.test.ts and the
    // services guard in tests/service-locations.test.ts — but unlike either of
    // those, this one is a REGRESSION guard rather than a precaution. The file
    // existed until this slice and was the confirmed cause of /portfolio/[slug]
    // answering 200 with an injected noindex instead of a real 404.
    //
    // A route-level loading.tsx wraps the WHOLE app/portfolio segment in a
    // Suspense boundary and streams its fallback before the page component runs.
    // Once any HTML is flushed the status is locked at 200, so notFound() renders
    // the 404 body and can no longer set the 404 status — and no route config can
    // override that, because the flush happens a layer above the page.
    //
    // The cost was accepted knowingly: the portfolio index loses its spinner.
    // OPS.md recorded this arrangement as "unaddressed by design" on the grounds
    // that no portfolio URL needed to 404. Six homepage links did.
    expect(existsSync(path.join(WEB, "app", "portfolio", "loading.tsx"))).toBe(false);
  });

  it("the page still calls notFound(), which the boundary was masking", () => {
    // Deleting the boundary only matters while this call is here. If someone
    // removes it, the segment silently returns to 200-on-missing and the guard
    // above would still pass.
    const page = read("app", "portfolio", "[slug]", "page.tsx");
    expect(page).toContain('import { notFound } from "next/navigation"');
    expect(page).toMatch(/if\s*\(!project\)\s*\{\s*notFound\(\);/);
  });
});

describe("getProjectBySlug agrees with the listing queries", () => {
  const PORTFOLIO = read("lib", "portfolio.ts");

  it("the slug lookup is gated on published = true", () => {
    // Without this clause an unpublished project is absent from
    // generateStaticParams and from the portfolio index, yet still renders at 200
    // to anyone holding the URL. Unlisted is not unpublished.
    expect(fnBody(PORTFOLIO, "getProjectBySlug")).toMatch(
      /WHERE\s+slug\s*=\s*\$1\s+AND\s+published\s*=\s*true/
    );
  });

  it("the slug is still bound as a parameter, not interpolated", () => {
    const body = fnBody(PORTFOLIO, "getProjectBySlug");
    expect(body).toContain("[slug]");
    expect(body).not.toMatch(/\$\{slug\}/);
  });

  it("getPublishedProjects — the query it must agree with — is also gated", () => {
    // These two feeding different row sets IS the bug this slice fixed. If they
    // ever diverge again, the divergence is the defect, so both are pinned.
    expect(fnBody(PORTFOLIO, "getPublishedProjects")).toMatch(/published\s*=\s*true/);
  });

  it("getAllProjects stays deliberately UNfiltered — it backs the admin list", () => {
    // Guarding against an over-eager future fix that "consistently" adds the
    // filter everywhere and hides drafts from the admin that has to edit them.
    expect(fnBody(PORTFOLIO, "getAllProjects")).not.toMatch(/published\s*=\s*true/);
  });
});

describe("the homepage links to canonical portfolio slugs", () => {
  const HOME = read("app", "page.tsx");

  // The six that drifted. Each was a live 200-with-noindex before this slice:
  // the homepage linked to a slug no portfolio_projects row carries.
  const RETIRED = [
    "meadow-creek",
    "crown-pointe",
    "woodbine-road",
    "preston-court",
    "duck-drive",
    "covey-drive",
  ];

  const CANONICAL = [
    "195-meadow-creek",
    "crown-point",
    "23-woodbine-rd",
    "preston-ct",
    "duck-dr",
    "90-covey-dr",
    "breezeway",
    "green-river",
  ];

  it.each(RETIRED)("no longer carries the retired slug %s", (slug) => {
    expect(HOME).not.toContain(`slug: "${slug}",`);
  });

  it.each(CANONICAL)("carries the canonical slug %s exactly once", (slug) => {
    expect(HOME.split(`slug: "${slug}",`).length - 1).toBe(1);
  });

  it("each card's image folder matches its slug", () => {
    // The independent corroboration: the image paths never drifted, so a slug
    // that disagrees with its own card's folder is the tell. Two cards are
    // deliberately exempt — their folders never matched their slugs.
    const EXEMPT = new Set(["breezeway", "green-river"]);
    const cards = HOME.matchAll(
      /slug: "([^"]+)",\s*\n\s*image: "\/optimized\/([^/]+)\//g
    );
    const pairs = [...cards].map(([, slug, folder]) => ({ slug, folder }));
    expect(pairs.length, "expected 8 slug/image pairs").toBe(8);
    for (const { slug, folder } of pairs) {
      if (EXEMPT.has(slug)) continue;
      expect(folder, `slug ${slug} disagrees with its image folder`).toBe(slug);
    }
  });
});
