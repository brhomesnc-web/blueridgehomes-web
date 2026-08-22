import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { serviceLocations } from "@/lib/serviceLocations";

/**
 * Guards for the service x location slice.
 *
 * Same two honest categories as tests/unpublish.test.ts:
 *
 *  1. Pure data — lib/serviceLocations.ts is a plain module with no imports, so it
 *     can be imported here directly and asserted on for real.
 *
 *  2. STRUCTURAL assertions read from source text and from the filesystem. The page
 *     component cannot be imported: it pulls lib/portfolio.ts, which pulls
 *     lib/db.ts, which builds a pg Pool at module scope, and there is no
 *     live-Postgres harness in this repo. Mocking it would only prove the mock
 *     agrees with the test, so the route config is pinned by reading it instead.
 *
 * What is NOT covered here: that the pages render, that the images resolve
 * (public/optimized/ is gitignored and absent from every checkout — it exists only
 * on the VPS), or that the JSON-LD validates. Those are post-deploy checks.
 */

const WEB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (...parts: string[]) =>
  readFileSync(path.join(WEB, ...parts), "utf8");

const PAGE = read("app", "services", "[service]", "[town]", "page.tsx");
const SITEMAP = read("app", "sitemap.ts");

/**
 * The twelve portfolio_projects slugs. Hardcoded on purpose: this is the verified
 * live set as of this build, and there is no live-Postgres harness to read it from.
 * If a project is added or renamed, this list and app/sitemap.ts both need updating,
 * and that is the intended friction.
 */
const KNOWN_PROJECT_SLUGS = [
  "breezeway",
  "green-river",
  "195-meadow-creek",
  "23-woodbine-rd",
  "crown-point",
  "preston-ct",
  "stewart-st",
  "90-covey-dr",
  "duck-dr",
  "280-settlers-cove",
  "660-settlers-cove",
  "robin-porch",
];

/**
 * The [VERIFY:] ratchet.
 *
 * Every specific factual claim in lib/serviceLocations.ts that no cited public
 * source settles is left wrapped as a marker for the owner. This number only ever
 * goes DOWN, and it has reached zero. It was 26 when the slice shipped. The
 * public-record patch closed ten against City of Asheville, Buncombe County, and
 * NC code sources; C1/C2/C3 closed two more by phone; the wind/electrical pass
 * closed three; the owner-answers pass closed ten, two of them by refusal -- the
 * ICF energy-savings percentage and the ICF cost premium are deliberately not
 * published, and the copy says so in as many words. The last one was deleted
 * rather than answered: Settlers Cove built out roughly twenty years ago, so a
 * paragraph about its architectural covenants addressed a decision no reader of
 * that page is making.
 *
 * Zero does not mean finished. It means nothing on these pages asserts a specific
 * figure that no source or owner has stood behind. Adding one without a source is
 * what this guard exists to catch.
 *
 * Fails high: someone added an unsourced claim. Fails low: someone resolved a
 * marker -- good, lower this number in the same commit so the ratchet keeps holding.
 */
const EXPECTED_UNRESOLVED = 0;

describe("the services segment has no loading boundary", () => {
  it("app/services/loading.tsx does NOT exist", () => {
    // Identical reasoning to the blog guard at tests/unpublish.test.ts:196-205.
    // A route-level loading.tsx wraps the WHOLE app/services segment in a Suspense
    // boundary and streams its fallback before the page component runs. Once any
    // HTML is flushed the status is locked at 200, so notFound() renders the 404
    // body and can no longer set the 404 status — and no route config can override
    // that, because the flush happens a layer above the page.
    //
    // app/services/[service]/[town]/page.tsx calls notFound(). Re-adding a segment
    // loading boundary here would silently give every unmatched route a 200.
    expect(existsSync(path.join(WEB, "app", "services", "loading.tsx"))).toBe(false);
  });
});

describe("serviceLocations — the entries point at things that exist", () => {
  it("has the five entries this slice ships", () => {
    expect(serviceLocations).toHaveLength(5);
  });

  it.each(serviceLocations.map((e) => [`${e.service}/${e.town}`, e] as const))(
    "%s — service matches a real app/services/<slug> directory",
    (_label, entry) => {
      expect(
        existsSync(path.join(WEB, "app", "services", entry.service, "page.tsx"))
      ).toBe(true);
    }
  );

  it("every projectSlugs entry is a known portfolio_projects slug", () => {
    const used = serviceLocations.flatMap((e) => e.projectSlugs);
    expect(used.length).toBeGreaterThan(0);
    const unknown = used.filter((slug) => !KNOWN_PROJECT_SLUGS.includes(slug));
    expect(unknown).toEqual([]);
  });

  it("no entry lists the same project twice", () => {
    for (const entry of serviceLocations) {
      expect(new Set(entry.projectSlugs).size).toBe(entry.projectSlugs.length);
    }
  });

  it("has no duplicate service + town pair", () => {
    const pairs = serviceLocations.map((e) => `${e.service}/${e.town}`);
    expect(new Set(pairs).size).toBe(pairs.length);
  });
});

describe("serviceLocations — metadata does not double the title suffix", () => {
  // The root layout exports title.template = "%s | Blue Ridge Homes". The five
  // existing app/services/<slug>/page.tsx files ALSO hardcode "| Blue Ridge Homes"
  // into their own title, so those pages render the suffix twice. This slice does
  // not repeat that, and this test is what keeps it from creeping back in.
  it.each(serviceLocations.map((e) => [`${e.service}/${e.town}`, e] as const))(
    "%s — metaTitle carries no hardcoded suffix",
    (_label, entry) => {
      expect(entry.metaTitle).not.toContain("| Blue Ridge Homes");
      expect(entry.metaTitle.length).toBeGreaterThan(0);
    }
  );

  it.each(serviceLocations.map((e) => [`${e.service}/${e.town}`, e] as const))(
    "%s — metaDescription is present",
    (_label, entry) => {
      expect(entry.metaDescription.length).toBeGreaterThan(0);
    }
  );
});

describe("the route's caching surface", () => {
  it("exports dynamicParams = false, so an unlisted pair is a real 404", () => {
    expect(PAGE).toMatch(/^export const dynamicParams = false;$/m);
  });

  it("carries NO revalidate export — both existing families are prerendered with none", () => {
    expect(PAGE).not.toMatch(/^export const revalidate/m);
  });

  it("carries NO dynamic export, for the same reason", () => {
    expect(PAGE).not.toMatch(/^export const dynamic = /m);
  });

  it("builds its params from the data module, not from the database", () => {
    expect(PAGE).toMatch(/export async function generateStaticParams\(\)/);
    expect(PAGE).toContain("serviceLocations.map");
  });

  it("filters unpublished rows at this call site rather than in lib/portfolio", () => {
    // getProjectBySlug does not filter on published; /portfolio/[slug] depends on
    // that. If this filter is removed, an unpublished project silently reappears
    // on a public page.
    expect(PAGE).toContain("p.published === true");
  });
});

describe("the five routes are in the sitemap", () => {
  // app/sitemap.ts is a hardcoded literal list. It is not filesystem-walked, so a
  // new route family does not appear on its own.
  it.each(serviceLocations.map((e) => [`${e.service}/${e.town}`, e] as const))(
    "%s is listed in app/sitemap.ts",
    (_label, entry) => {
      expect(SITEMAP).toContain(`/services/${entry.service}/${entry.town}`);
    }
  );

  it("the sitemap still exports its pinned revalidate window", () => {
    // Restated here because this slice edits app/sitemap.ts. The authoritative
    // assertion lives in tests/unpublish.test.ts; this one fails loudly in the
    // same file as the edit that would break it.
    expect(SITEMAP).toMatch(/^export const revalidate = 60;$/m);
  });
});

describe("no service x location page is an orphan", () => {
  /**
   * The parent /services/<slug>/page.tsx files hardcode these hrefs rather than
   * deriving them from serviceLocations -- those five pages are literal-JSX clones
   * and interpolating one paragraph out of an array would refactor a third of them.
   * Hardcoding is only safe with a guard in BOTH directions, which is what these two
   * tests are: nothing in the data module goes unlinked, and nothing linked is
   * missing from the data module.
   */
  const parentSource = new Map(
    Array.from(new Set(serviceLocations.map((e) => e.service))).map((service) => [
      service,
      read("app", "services", service, "page.tsx"),
    ])
  );

  it.each(serviceLocations.map((e) => [`${e.service}/${e.town}`, e] as const))(
    "%s is linked from its parent services page",
    (_label, entry) => {
      const src = parentSource.get(entry.service) as string;
      expect(
        src,
        `app/services/${entry.service}/page.tsx does not link /services/${entry.service}/${entry.town}`
      ).toContain(`href="/services/${entry.service}/${entry.town}"`);
    }
  );

  it("every service x location href on a parent page resolves to an entry", () => {
    const known = new Set(serviceLocations.map((e) => `/services/${e.service}/${e.town}`));
    for (const [service, src] of parentSource) {
      const found = Array.from(
        src.matchAll(/href="(\/services\/[a-z0-9-]+\/[a-z0-9-]+)"/g)
      );
      for (const match of found) {
        const href = match[1];
        expect(known.has(href), `${service}/page.tsx links ${href}, which is not an entry`).toBe(
          true
        );
      }
    }
  });

  it("no town is linked twice on the same parent page", () => {
    // A town promoted to a service x location page must not also keep its
    // /service-areas/<town> link on the same page -- two comma-lists of the same
    // place names side by side is the duplicate navigation this slice merged away.
    for (const entry of serviceLocations) {
      const src = parentSource.get(entry.service) as string;
      expect(
        src.includes(`href="/service-areas/${entry.town}"`),
        `${entry.service}/page.tsx links ${entry.town} both deep and shallow`
      ).toBe(false);
    }
  });
});

describe("the reciprocal links this slice adds", () => {
  it("the page links up to /services/<service>", () => {
    expect(PAGE).toContain("href={`/services/${entry.service}`}");
  });

  it("the service-area link set excludes asheville, which has no route", () => {
    // The page builds this link as `/service-areas/${entry.town}`, so the literal
    // path never appears in the source and a substring search would only ever match
    // the comment explaining the omission. Assert the mechanism instead: the set
    // that gates the link, and the absence of the route on disk.
    const setLiteral = PAGE.match(
      /const SERVICE_AREA_PAGES = new Set\(\[([^\]]*)\]\)/
    )?.[1];
    expect(setLiteral, "SERVICE_AREA_PAGES literal not found").toBeTruthy();
    expect(setLiteral).not.toContain("asheville");
    expect(existsSync(path.join(WEB, "app", "service-areas", "asheville"))).toBe(false);
  });

  it("every town in the service-area link set has a real page", () => {
    const setLiteral = PAGE.match(
      /const SERVICE_AREA_PAGES = new Set\(\[([^\]]*)\]\)/
    )?.[1] as string;
    const towns = setLiteral
      .split(",")
      .map((s) => s.trim().replace(/^"|"$/g, ""))
      .filter(Boolean);
    expect(towns.length).toBeGreaterThan(0);
    for (const town of towns) {
      expect(
        existsSync(path.join(WEB, "app", "service-areas", town, "page.tsx")),
        `missing app/service-areas/${town}/page.tsx`
      ).toBe(true);
    }
  });

  it("the Weaverville town page links to both Weaverville service pages", () => {
    const weaverville = read("app", "service-areas", "weaverville", "page.tsx");
    const expected = serviceLocations
      .filter((e) => e.town === "weaverville")
      .map((e) => `/services/${e.service}/${e.town}`);
    expect(expected).toHaveLength(2);
    for (const href of expected) {
      expect(weaverville).toContain(href);
    }
  });
});

describe("the ICF page quotes no unsourced energy percentage", () => {
  /**
   * app/services/icf-construction/page.tsx carried "40 to 60 percent less energy"
   * twice -- once as a paragraph, once as an Energy Savings bullet. Neither cited a
   * source, and the child page at /services/icf-construction/asheville explicitly
   * refuses to publish a figure because the literature runs from single digits to
   * more than half depending on who funded the study. Parent and child were one
   * click apart and contradicted each other.
   *
   * This lives here rather than in its own file because this suite already reads the
   * parent services pages and already owns the no-unsourced-figure rule in the shape
   * of the VERIFY ratchet. One rule, one home.
   *
   * Matched on PATTERN: a number -- digits or spelled out -- next to percent or %,
   * in a sentence that also mentions energy. A differently worded reintroduction
   * fails too. The removed copy deliberately says "more than half" rather than
   * naming a percentage, so that the spelled-out form can be rejected as well.
   */
  const ICF = read("app", "services", "icf-construction", "page.tsx");

  const NUMBER_WORD =
    "one|two|three|four|five|six|seven|eight|nine|ten|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred";
  const ENERGY_WORD =
    "energy|efficien|heating|cooling|savings|utility|utilities|HVAC|insulation|thermal|R-value";

  function offendingSentences(source: string): string[] {
    const prose = source.replace(/\s+/g, " ");
    const sentences = prose.split(/(?<=[.!?])\s/);
    const numberNextToPercent = new RegExp(
      `(\\d[\\d,.]*|${NUMBER_WORD})\\s*(?:to\\s*(?:\\d[\\d,.]*|${NUMBER_WORD})\\s*)?(?:percent|%)`,
      "i"
    );
    const energy = new RegExp(ENERGY_WORD, "i");
    return sentences.filter((s) => numberNextToPercent.test(s) && energy.test(s));
  }

  it("states no percentage-plus-energy claim anywhere on the page", () => {
    const offenders = offendingSentences(ICF);
    expect(offenders, `unsourced energy percentage on the ICF page: ${offenders.join(" | ")}`)
      .toEqual([]);
  });

  it("the matcher actually catches the claim it was written for", () => {
    // Guards the guard. If the regex is broken by a later edit, this fails rather
    // than the suite silently passing on a page that has the claim back.
    const planted =
      "ICF homes typically use 40 to 60 percent less energy for heating and cooling.";
    expect(offendingSentences(planted)).toHaveLength(1);
    const spelledOut = "An ICF wall cuts energy use by forty percent.";
    expect(offendingSentences(spelledOut)).toHaveLength(1);
  });

  it("does not fire on the refusal wording the page now uses", () => {
    const refusal =
      "The published comparisons range from single digits to more than half, so we do not quote a figure on energy.";
    expect(offendingSentences(refusal)).toEqual([]);
  });
});

describe("in-prose links are visible", () => {
  /**
   * The service x location pages shipped with inbound links that existed in the DOM
   * but were visually indistinguishable from body text. globals.css sets
   * a { color: inherit; text-decoration: none; } near the top of the file, and an
   * anchor inside .br-lead carries no className of its own, so nothing overrode it.
   * That was true of the five new links and of roughly 25 pre-existing
   * /service-areas/ links across all five /services/<slug> pages.
   *
   * A link that cannot be seen is not an inbound link. The whole point of the
   * previous slice was inbound links, and they were shipped invisible.
   *
   * Matched on pattern rather than on the exact declaration, so reformatting the rule
   * or changing the accent token still passes, while deleting it fails.
   */
  const GLOBALS = read("app", "globals.css");

  /** Body of the top-level `.br-lead a` rule, or null. Anchored at line start so the
   *  scoped .br-closing-cta override cannot satisfy it. */
  function leadLinkRule(css: string): string | null {
    const m = css.match(/^\.br-lead a\s*\{([^}]*)\}/m);
    return m ? m[1] : null;
  }

  it("globals.css styles .br-lead a with both a color and a text-decoration", () => {
    const body = leadLinkRule(GLOBALS);
    expect(body, "no top-level .br-lead a rule found in app/globals.css").toBeTruthy();
    expect(body as string).toMatch(/\bcolor\s*:/);
    expect(body as string).toMatch(/\btext-decoration\s*:/);
  });

  it("the matcher fires on a present rule and misses an absent one", () => {
    // Guards the guard. A regex that silently stops matching is indistinguishable
    // from a passing test, so plant both directions.
    const present = ".br-lead a {" + String.fromCharCode(10) +
      "  color: var(--br-accent);" + String.fromCharCode(10) +
      "  text-decoration: underline;" + String.fromCharCode(10) + "}";
    expect(leadLinkRule(present)).toMatch(/\bcolor\s*:/);

    // a different selector must not satisfy it
    expect(leadLinkRule(".br-blog-prose a { color: red; text-decoration: underline; }")).toBeNull();

    // present but decorative only: the rule exists, the assertions on it still fail
    const colorless = ".br-lead a {" + String.fromCharCode(10) + "  opacity: 0.5;" +
      String.fromCharCode(10) + "}";
    expect(leadLinkRule(colorless)).not.toMatch(/\bcolor\s*:/);
  });

  it("the dark closing-CTA carries its own scoped anchor rule", () => {
    // .br-closing-cta .br-lead is white over a photograph; the accent brown would be
    // unreadable there. No CTA paragraph contains a link today, so this guards a
    // future one rather than a present bug.
    expect(GLOBALS).toMatch(/\.br-closing-cta \.br-lead a\s*\{/);
  });
});

describe("the [VERIFY:] ratchet", () => {
  const DATA = read("lib", "serviceLocations.ts");
  const markers = DATA.match(/\[VERIFY:[^\]]*\]/g) ?? [];

  it(`lib/serviceLocations.ts carries exactly ${EXPECTED_UNRESOLVED} unresolved markers`, () => {
    expect(markers).toHaveLength(EXPECTED_UNRESOLVED);
  });

  it("every marker states an actual claim, not an empty placeholder", () => {
    for (const marker of markers) {
      expect(marker.length, marker).toBeGreaterThan(30);
    }
  });

  it("the resolved public-record items did not come back as markers", () => {
    // These ten were closed against cited sources. A marker reappearing here means
    // someone reverted a resolution without lowering EXPECTED_UNRESOLVED.
    for (const gone of [
      "the permit office with jurisdiction over",
      "which Asheville neighborhoods carry local historic district",
      "whether Asheville applies a steep-slope or hillside development ordinance",
      "the disturbed-area threshold that triggers",
      "which permitting authority has jurisdiction",
      "whether adding a bedroom or bathroom to a septic-served home",
      "the typical soil evaluation and septic permit process and duration",
    ]) {
      expect(DATA, `resolved item came back as a marker: ${gone}`).not.toContain(
        `[VERIFY: ${gone}`
      );
    }
  });

  it("provenance tags stay in comments and never reach rendered copy", () => {
    // Resolved items carry an operator-reported / confirmed-with date so the claim
    // can be re-checked later. That belongs beside the code, not in front of a
    // homeowner: every such line must be a comment.
    // String.fromCharCode(10) rather than a regex literal: this assertion has
    // been mangled once by backslash handling in the tooling that wrote it, and
    // it carries no backslash now so it cannot be mangled again. trim() drops the
    // carriage return along with the indentation.
    for (const raw of DATA.split(String.fromCharCode(10))) {
      const line = raw.trim();
      if (line.toLowerCase().includes("operator-reported")) {
        expect(line.startsWith("//"), line).toBe(true);
      }
    }
  });

  it("no marker leaks into the page, the sitemap, or the town page", () => {
    // The page renders markers out of the data module; none should be hardcoded
    // into a component, where the ratchet above would never see it.
    expect(PAGE).not.toContain("[VERIFY:");
    expect(SITEMAP).not.toContain("[VERIFY:");
    expect(read("app", "service-areas", "weaverville", "page.tsx")).not.toContain("[VERIFY:");
  });
});
