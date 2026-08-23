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

/**
 * THE SAME CLAIM, WITHOUT A DIGIT.
 *
 * The percentage guard above reads the whole of icf-construction/page.tsx --
 * metadata export included -- and it was PASSING on 2026-08-22 while four
 * uncited comparative energy claims sat live on that page: the metadata
 * description, the hero subtitle, the intro paragraph, and a body want-list.
 * Every one of them matched the ENERGY_WORD test in the guard above. Every one failed
 * `numberNextToPercent`, because none carried a digit.
 *
 * The surface was never the gap. The PATTERN was. A percentage guard cannot see
 * "significantly less energy", and the copy that replaced the percentage said
 * exactly that.
 *
 * WHAT THIS GUARD CAN AND CANNOT DO -- stated plainly, because a green check
 * here is worth only what its weakest half is worth:
 *
 *   The DENOMINATOR is real and complete. The candidate set is "every sentence,
 *   in a rendered text unit, that mentions energy". That is machine-decidable:
 *   the extractor pulls string literals and JSX text nodes, splits sentences
 *   INSIDE each unit, and every candidate lands in exactly one of three buckets.
 *   The buckets are asserted to sum to the total. Nothing is silently skipped.
 *
 *   The CLASSIFIER is vocabulary-bounded and therefore incomplete. A comparative
 *   phrased in words COMPARATIVE does not list lands in the mechanism bucket and
 *   passes. That is a known false-negative surface, not a solved problem. It is
 *   mitigated only by the bucket counts being asserted, so a reviewer can see how
 *   many sentences were waved through rather than being told "clean".
 *
 * Sentence splitting happens INSIDE each text unit and never across two. An
 * earlier draft split the raw source and produced six false positives by running
 * a "sentence" out of one JSX string and into the regulatory copy in the next.
 */
describe("the energy claim carries no uncited comparative", () => {
  const ENERGY_SURFACE: string[][] = [
    ["app", "services", "icf-construction", "page.tsx"],
    ["app", "services", "custom-homes", "page.tsx"],
    ["app", "service-areas", "hendersonville", "page.tsx"],
    ["app", "service-areas", "mills-river", "page.tsx"],
    ["app", "page.tsx"],
    ["lib", "serviceLocations.ts"],
  ];

  const ENERGY =
    /energy|efficien|heating|cooling|HVAC|insulat|thermal|R-value|utility bill|energy bill/i;
  const COMPARATIVE =
    /\b(more|less|lower|higher|better|best|superior|greater|reduces?|reduction|saves?|savings|outperforms?|exceeds?|significantly|dramatically|cheaper|far more|pays off)\b|energy-efficient|energy efficiency|energy performance|energy savings|energy bills/i;
  const REFUSAL =
    /do not quote|does not quote|too widely to quote|not to quote|will not publish/i;

  /** Rendered text units: quoted string literals and bare JSX text nodes. */
  function textUnits(src: string): string[] {
    const units: string[] = [];
    for (const m of src.matchAll(/"((?:[^"\\]|\\.)*)"/g)) {
      if (/[a-z]{3}\s+[a-z]{3}/i.test(m[1])) units.push(m[1]);
    }
    for (const m of src.matchAll(/>([^<>{}]+)</g)) {
      const v = m[1].trim();
      if (/[a-z]{3}\s+[a-z]{3}/i.test(v)) units.push(v);
    }
    return units;
  }

  function classify(src: string) {
    const sentences = textUnits(src).flatMap((u) =>
      u.replace(/\s+/g, " ").split(/(?<=[.!?])\s+/)
    );
    const candidates = sentences.filter((s) => ENERGY.test(s));
    return {
      candidates,
      refusal: candidates.filter((s) => REFUSAL.test(s)),
      offenders: candidates.filter((s) => !REFUSAL.test(s) && COMPARATIVE.test(s)),
      mechanism: candidates.filter((s) => !REFUSAL.test(s) && !COMPARATIVE.test(s)),
    };
  }

  /**
   * ACCEPTED RESIDUE -- a ratchet, same shape as EXPECTED_UNRESOLVED above.
   *
   * Four uncited comparative energy claims survive this commit ON PURPOSE, each
   * for a reason that is not "we did not notice". Listed rather than excluded by
   * pattern, so they are a worklist instead of a blind spot. THIS NUMBER ONLY
   * EVER GOES DOWN.
   *
   * Four offenders, three keys -- entry 1 covers two of them. EXPECTED_ACCEPTED
   * below is asserted against the OFFENDER count, not against the length of this
   * list. The two are not the same number and must not be conflated.
   *
   *    1. "the mechanical system cycles less" is wording the numbers-rule pass
   *       produced, surviving in two places: the page writes "so the mechanical
   *       system cycles less", the module "and the mechanical system cycles
   *       less". One key covers both. Rewriting them would re-open a decision
   *       that pass already made, in a commit scoped to a different job.
   *    2. "at a lower total cost" is comparative-claims inventory row #45 -- one of
   *       the two tail-clause misses. It belongs to that batch.
   *    3. "energy-efficient ICF builds" is a category label in a list of build
   *       types rather than a performance assertion. Weakest of the four. Left for
   *       an owner decision rather than resolved unilaterally.
   */
  const ACCEPTED = [
    "the mechanical system cycles less",
    "at a lower total cost",
    "energy-efficient ICF builds",
  ];
  const EXPECTED_ACCEPTED = 4;

  it("every energy sentence lands in exactly one bucket, and the buckets sum", () => {
    let total = 0;
    let sum = 0;
    for (const parts of ENERGY_SURFACE) {
      const c = classify(read(...parts));
      total += c.candidates.length;
      sum += c.refusal.length + c.offenders.length + c.mechanism.length;
    }
    // The denominator claim. If this ever fails, a candidate was double-counted
    // or dropped and every other number in this describe is worthless.
    expect(sum, "buckets do not sum to the candidate total").toBe(total);
    expect(total, "candidate set collapsed to zero -- extractor is broken").toBeGreaterThan(20);
  });

  it("no unaccepted uncited comparative energy claim on any guarded page", () => {
    const unaccepted: string[] = [];
    for (const parts of ENERGY_SURFACE) {
      const c = classify(read(...parts));
      for (const s of c.offenders) {
        if (!ACCEPTED.some((a) => s.includes(a))) {
          unaccepted.push(`${parts.join("/")}: ${s.trim().slice(0, 160)}`);
        }
      }
    }
    expect(unaccepted, `uncited comparative energy claim: ${unaccepted.join(" | ")}`)
      .toEqual([]);
  });

  it("the accepted-residue ratchet has not been raised", () => {
    let offenders = 0;
    for (const parts of ENERGY_SURFACE) offenders += classify(read(...parts)).offenders.length;
    expect(
      offenders,
      "accepted residue changed. Lower EXPECTED_ACCEPTED in the same commit if you resolved one; " +
        "never raise it."
    ).toBe(EXPECTED_ACCEPTED);
  });

  it("the matcher catches every wording this commit removed", () => {
    // Guards the guard, per OPS.md "Guard Failure Classes -> 1. Guard the guard".
    // These are the ELEVEN strings removed on 2026-08-22, verbatim. If the regex
    // is broken by a later edit this fails, rather than the suite going green on
    // a page that has the claim back.
    const removed = [
      "Stronger, quieter, more energy-efficient homes in Asheville and Western NC.",
      "Insulated concrete form homes - stronger, quieter, and more energy-efficient than conventional framing.",
      "The result is a home that uses significantly less energy, resists severe weather, and stays remarkably quiet.",
      "They want lower energy bills, a home that can handle severe weather, and walls that block outside noise almost entirely.",
      "Insulated concrete form builds for superior energy efficiency, strength, and comfort.",
      "Insulated concrete form homes in Asheville, NC. Quieter, more efficient, storm-resistant walls on mountain sites.",
      "One of the few ICF-experienced builders in Western NC. Stronger walls, lower energy bills, and superior comfort.",
      "New custom builds including insulated concrete form (ICF) construction for superior energy efficiency.",
      "Insulated concrete form construction for superior energy performance, an investment that pays off quickly.",
      "Energy Savings",
      "ICF and Energy-Efficient Builds",
    ];
    for (const s of removed) {
      const c = classify(`<p>${s}</p>`);
      expect(c.offenders.length, `matcher went blind to: ${s}`).toBeGreaterThan(0);
    }
  });

  it("does not fire on the mechanism wording that replaced them", () => {
    // The planted negative. Every replacement written in this commit, asserted
    // NOT to trip the guard -- otherwise the fix and the guard disagree.
    const replacements = [
      "Stronger, quieter homes in Asheville and Western NC.",
      "Insulated concrete form homes - stronger and quieter than conventional framing.",
      "The result is a home that resists severe weather and stays remarkably quiet.",
      "They want a home that can handle severe weather and walls that block outside noise almost entirely.",
      "Insulated concrete form builds with a continuous insulated envelope and no thermal bridging through studs.",
      "Insulated concrete form homes in Asheville, NC. Quieter, storm-resistant walls on mountain sites.",
      "Stronger walls and superior comfort.",
      "New custom builds including insulated concrete form (ICF) construction with a continuous insulated envelope and no thermal bridging through studs.",
      "Insulated concrete form construction with a concrete core that adds thermal mass.",
      "No Thermal Bridging",
      "ICF Construction",
    ];
    for (const s of replacements) {
      const c = classify(`<p>${s}</p>`);
      expect(c.offenders, `guard fires on corrected wording: ${s}`).toEqual([]);
    }
  });

  it("does not fire on the refusal wording either page uses", () => {
    const refusals = [
      "ICF walls outperform conventional framing on energy, but the published comparisons range from single digits to more than half, so we do not quote a figure.",
      "Published comparisons vary too widely to quote; ask us for a real utility history from a finished house.",
    ];
    for (const s of refusals) {
      const c = classify(`<p>${s}</p>`);
      expect(c.offenders, `guard fires on refusal wording: ${s}`).toEqual([]);
    }
  });
});

/**
 * FIELD PIN over metaDescription and faqs[].a.
 *
 * These two field families are the registers that render TWICE and are invisible
 * to anyone reading the page prose: every metaDescription becomes both the HTML
 * meta description and `Service.description` in the JSON-LD block, and every FAQ
 * answer becomes both page copy and `FAQPage.mainEntity[].acceptedAnswer.text`.
 * The ICF metaDescription carried "more efficient" until this commit and no guard
 * in this repo read it.
 *
 * This one CAN state a true denominator, because the field set is enumerable from
 * the imported module rather than inferred from prose: N entries, each with
 * exactly one metaDescription, plus M FAQ answers. Both counts are asserted, so a
 * new entry cannot arrive unguarded.
 */
describe("data-module metadata and FAQ fields are pinned", () => {
  const EXPECTED_ENTRIES = 5;
  const EXPECTED_FAQ_ANSWERS = 24;

  const CLAIM =
    /\b(more|less|lower|higher|better|best|superior|greater|outperforms?|exceeds?|significantly|dramatically|cheaper|pays off)\b|energy-efficient|energy efficiency|energy performance/i;
  const ENERGY =
    /energy|efficien|heating|cooling|HVAC|insulat|thermal|R-value/i;

  it("the field denominator is what the guard thinks it is", () => {
    expect(serviceLocations, "entry count moved -- update both numbers here").toHaveLength(
      EXPECTED_ENTRIES
    );
    const answers = serviceLocations.flatMap((e) => e.faqs.map((f) => f.a));
    expect(answers, "FAQ answer count moved -- update both numbers here").toHaveLength(
      EXPECTED_FAQ_ANSWERS
    );
    // every entry actually has the field, so the sweep below reads all of them
    for (const e of serviceLocations) {
      expect(e.metaDescription.length, `${e.service}/${e.town} metaDescription empty`)
        .toBeGreaterThan(0);
    }
  });

  it("no metaDescription carries a comparative energy claim", () => {
    const bad = serviceLocations
      .filter((e) => ENERGY.test(e.metaDescription) && CLAIM.test(e.metaDescription))
      .map((e) => `${e.service}/${e.town}: ${e.metaDescription}`);
    expect(bad, `metaDescription renders to SERP AND JSON-LD: ${bad.join(" | ")}`).toEqual([]);
  });

  it("no FAQ answer carries a comparative energy claim, except the accepted one", () => {
    // "at a lower total cost" is inventory row #45, on the batch-2 worklist and
    // listed in the ratchet above. Named here so it is accepted, not invisible.
    const ACCEPTED_FAQ = "at a lower total cost";
    const bad = serviceLocations
      .flatMap((e) => e.faqs.map((f) => ({ e, a: f.a })))
      .filter(({ a }) => ENERGY.test(a) && CLAIM.test(a) && !a.includes(ACCEPTED_FAQ))
      .map(({ e, a }) => `${e.service}/${e.town}: ${a.slice(0, 120)}`);
    expect(bad, `FAQ answer renders to page AND FAQPage JSON-LD: ${bad.join(" | ")}`)
      .toEqual([]);
  });

  it("the metaDescription field pin actually fires", () => {
    // Planted positive: the exact string removed from the ICF entry this commit.
    const planted =
      "Insulated concrete form homes in Asheville, NC. Quieter, more efficient, storm-resistant walls on mountain sites.";
    expect(ENERGY.test(planted) && CLAIM.test(planted), "field pin went blind").toBe(true);
    // Planted negative: the wording that replaced it.
    const corrected =
      "Insulated concrete form homes in Asheville, NC. Quieter, storm-resistant walls on mountain sites.";
    expect(ENERGY.test(corrected) && CLAIM.test(corrected), "field pin fires on corrected wording")
      .toBe(false);
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

describe("sectioned local detail", () => {
  /**
   * Before this slice, nothing in the suite read the local-detail copy field at
   * all: it could change type and every assertion still passed. These four are
   * the guard that was missing.
   */
  it.each(serviceLocations.map((e) => [`${e.service}/${e.town}`, e] as const))(
    "%s has at least one section",
    (_label, entry) => {
      expect(Array.isArray(entry.detail)).toBe(true);
      expect(entry.detail.length).toBeGreaterThan(0);
    }
  );

  it("every section has a non-empty heading and a non-empty body", () => {
    for (const entry of serviceLocations) {
      for (const section of entry.detail) {
        const where = `${entry.service}/${entry.town}: ${section.heading}`;
        expect(section.heading.trim().length, where).toBeGreaterThan(0);
        expect(section.body.trim().length, where).toBeGreaterThan(0);
      }
    }
  });

  it("every facts row carries a non-empty label and value", () => {
    let rowsSeen = 0;
    for (const entry of serviceLocations) {
      for (const section of entry.detail) {
        if (!section.facts) continue;
        const where = `${entry.service}/${entry.town}: ${section.heading}`;
        expect(section.facts.rows.length, where).toBeGreaterThan(0);
        for (const row of section.facts.rows) {
          expect(row.label.trim().length, where).toBeGreaterThan(0);
          expect(row.value.trim().length, where).toBeGreaterThan(0);
          rowsSeen += 1;
        }
      }
    }
    // The field is optional by design -- one entry has no parallel facts worth
    // tabulating. This only asserts the feature is exercised somewhere.
    expect(rowsSeen).toBeGreaterThan(0);
  });

  it("no section heading is duplicated inside one entry", () => {
    // The page keys on section.heading.
    for (const entry of serviceLocations) {
      const headings = entry.detail.map((s) => s.heading);
      expect(new Set(headings).size, `${entry.service}/${entry.town}`).toBe(headings.length);
    }
  });
});

describe("provenance tags sit with the claim they document", () => {
  /**
   * The older guard asserts only that a provenance line is a comment, which is
   * true of a comment anywhere in the file. Splitting one copy field into several
   * sections can orphan a tag from the claim it documents without any assertion
   * noticing.
   *
   * This does NOT work from a vocabulary of tag words. A vocabulary decays: the
   * citation-style comments -- an NEC article, a code table, an ordinance section
   * -- carry no operator-reported marker at all, and would sit outside any such
   * list while being exactly as orphanable. They are correctly anchored today,
   * which is precisely the state that rots without anyone noticing.
   *
   * So it classifies EVERY comment block inside the data array and asserts the
   * classification accounts for all of them. A block is an entry separator, or it
   * is immediately above a field line, or it is an orphan and the suite fails.
   */
  const DATA_LINES = read("lib", "serviceLocations.ts").split(String.fromCharCode(10));
  const FIELD_LINE = /^[a-zA-Z][a-zA-Z0-9_]*:/;
  const NAMED_TAG = /operator-reported|owner-reported/i;

  type Block = { first: string; text: string; next: string; separator: boolean };

  /** Every contiguous // run from the data array on, with the line following it. */
  function commentBlocks(lines: string[]): Block[] {
    const start = lines.findIndex((l) => l.startsWith("export const serviceLocations"));
    const out: Block[] = [];
    let i = start === -1 ? 0 : start;
    while (i < lines.length) {
      if (!lines[i].trim().startsWith("//")) {
        i += 1;
        continue;
      }
      let j = i;
      while (j + 1 < lines.length && lines[j + 1].trim().startsWith("//")) j += 1;
      const text = lines.slice(i, j + 1).map((l) => l.trim()).join(" ");
      out.push({
        first: lines[i].trim(),
        text,
        next: j + 1 < lines.length ? lines[j + 1].trim() : "",
        // the dashed rule that numbers each entry, which sits above an object brace
        separator: i === j && text.includes("----"),
      });
      i = j + 1;
    }
    return out;
  }

  it("every comment block in the data array is anchored to a field", () => {
    const all = commentBlocks(DATA_LINES);
    const separators = all.filter((b) => b.separator);
    const anchored = all.filter((b) => !b.separator && FIELD_LINE.test(b.next));
    const orphans = all.filter((b) => !b.separator && !FIELD_LINE.test(b.next));

    // The scan asserts its own completeness rather than trusting the hit list:
    // every block found is accounted for by exactly one of the three buckets.
    expect(separators.length + anchored.length + orphans.length).toBe(all.length);
    expect(separators.length, "one dashed separator per entry").toBe(serviceLocations.length);
    expect(anchored.length, "no anchored comment blocks found at all").toBeGreaterThan(0);
    expect(
      orphans.map((b) => b.first),
      `comment not adjacent to the field it documents: ${orphans.map((b) => b.first).join(" | ")}`
    ).toEqual([]);
  });

  it("the named operator-reported and owner-reported tags survive and are anchored", () => {
    // The named convention specifically, on top of the structural rule above, so
    // that deleting every tag cannot pass by leaving nothing to check.
    const tagged = commentBlocks(DATA_LINES).filter((b) => NAMED_TAG.test(b.text));
    expect(tagged.length, "the provenance convention has vanished").toBeGreaterThan(0);
    for (const block of tagged) {
      expect(FIELD_LINE.test(block.next), block.first).toBe(true);
    }
  });

  it("the classifier catches an orphan, a blank-separated tag, and a separator", () => {
    // Guards the guard, using a CITATION-style comment with no operator-reported
    // marker in it -- the class the previous vocabulary-based guard could not see.
    const head = `export const serviceLocations: ServiceLocation[] = [`;
    const cite = `    // Wind speed: Table R301.2(5), 2018 North Carolina Residential Code.`;

    const anchored = commentBlocks([head, cite, `    heading: "Wind Design",`]);
    expect(anchored.map((b) => FIELD_LINE.test(b.next))).toEqual([true]);

    const blankSeparated = commentBlocks([head, cite, ``, `    heading: "Wind Design",`]);
    expect(blankSeparated.map((b) => b.separator)).toEqual([false]);
    expect(blankSeparated.map((b) => FIELD_LINE.test(b.next))).toEqual([false]);

    const floated = commentBlocks([head, cite, `export type ServiceLocation = {`]);
    expect(floated.map((b) => FIELD_LINE.test(b.next))).toEqual([false]);

    const sep = commentBlocks([head, `  // ---------------------------------- 1`, `  {`]);
    expect(sep.map((b) => b.separator)).toEqual([true]);
  });
});

describe("the ratchet still counts the way it did", () => {
  /**
   * The restructure moved copy between fields. It did not change how the ratchet
   * counts: the count is taken over the RAW TEXT of the data module, so it is
   * blind to whether the copy sits in one field or twenty. Pinned here so a later
   * change to the counting mechanism is visible as a test edit.
   */
  const DATA = read("lib", "serviceLocations.ts");

  // Same pattern the ratchet above uses, assembled from a character code so this
  // file keeps no literal backslash of its own -- the reason the provenance
  // assertion builds its newline the same way.
  const BS = String.fromCharCode(92);
  const PATTERN = BS + "[VERIFY:[^" + BS + "]]*" + BS + "]";
  const count = (source: string) => (source.match(new RegExp(PATTERN, "g")) ?? []).length;

  it("reads zero against the real file", () => {
    expect(count(DATA)).toBe(0);
  });

  it("reads one when one is planted, in a section body or anywhere else", () => {
    // Fails-at-one, proven without touching the file the ratchet reads.
    const planted = `      body: "[VERIFY: a claim nobody has sourced yet]",`;
    expect(count(planted)).toBe(1);
    expect(count(DATA + String.fromCharCode(10) + planted)).toBe(1);
  });
});
