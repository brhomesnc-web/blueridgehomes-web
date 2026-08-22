/**
 * Service x location page content.
 *
 * A checked-in data module, not a database table. Nothing in this repo drives page
 * content from a data module today (every existing services/ and service-areas/
 * page is bespoke JSX with page-local literals), so this is the first one. It is
 * deliberately plain data: no imports, no DB, no I/O. tests/service-locations.test.ts
 * imports it directly, which is only safe because it pulls in nothing else.
 *
 * `service` MUST equal an existing app/services/<slug> directory name — the page
 * links "up" to /services/<service> and a typo would ship a dead link. The test
 * asserts this against the filesystem.
 *
 * `projectSlugs` are portfolio_projects.slug values (the table is portfolio_projects,
 * NOT projects). The page loads each one through lib/portfolio.ts at build time and
 * drops any row whose `published` is not true — getProjectBySlug does not filter on
 * published, and changing it would alter /portfolio/[slug] behaviour.
 *
 * FACTUAL CLAIMS in this file come in two tiers.
 *
 * Tier one is sourced and stated plainly: permit jurisdictions, ordinance citations
 * and their thresholds, the historic-district distinction, and the septic sequence.
 * Those are on the record with the City of Asheville, Buncombe County, or the NC
 * code, and were checked against those sources rather than recalled. Ten markers
 * were closed that way.
 *
 * Tier two is everything a public source cannot settle: our own durations and cost
 * deltas, figures the published sources contradict each other on, and the few items
 * that need a phone call rather than a web page. Those stay wrapped as a VERIFY
 * marker for the owner to resolve in one pass before deploy. A marker in `faqs`
 * renders on the page AND inside the FAQ JSON-LD; a marker in `detail` renders on
 * the page only, because nothing in `detail` feeds either structured-data block.
 * Either way it is meant to be impossible to miss, not to fail quietly.
 *
 * tests/service-locations.test.ts pins the remaining count. It only goes down.
 */

export type ServiceLocationFaq = { q: string; a: string };

/**
 * A parallel-fact table attached to one section. Optional, and genuinely
 * optional: several sections carry no parallel facts at all, and inventing rows
 * to fill a table would be the opposite of what this field is for. Every row
 * must restate a fact the section body already states.
 */
export type ServiceLocationFacts = {
  caption?: string;
  rows: { label: string; value: string }[];
};

/**
 * One headed run of local detail. `body` carries the same blank-line-separated
 * paragraphs the single localDetail string used to carry.
 */
export type ServiceLocationSection = {
  heading: string;
  body: string;
  facts?: ServiceLocationFacts;
};

export type ServiceLocation = {
  /** Must equal an existing app/services/<slug> directory. */
  service: string;
  /** URL segment. */
  town: string;
  /** Display form, e.g. "Asheville". */
  townDisplay: string;
  county: string;
  /** portfolio_projects.slug values, ordered. The first is the anchor. */
  projectSlugs: string[];
  heading: string;
  /** 2-3 paragraphs, separated by a literal \n\n. */
  intro: string;
  /** Terrain / permitting / housing stock, in headed sections. */
  detail: ServiceLocationSection[];
  faqs: ServiceLocationFaq[];
  /**
   * NO "| Blue Ridge Homes" suffix. The root layout already applies
   * template: "%s | Blue Ridge Homes". The five existing app/services/<slug>/page.tsx
   * files hardcode the suffix on top of that template and render it twice; this
   * slice does not repeat that. Pinned by tests/service-locations.test.ts.
   */
  metaTitle: string;
  metaDescription: string;
};

/**
 * Paragraph separator inside every section body: one blank line.
 *
 * Built from a character code rather than written as a two-character escape
 * because the tooling that edits this file has mangled backslash escapes before.
 * tests/service-locations.test.ts builds its own newline the same way, for the
 * same reason, and says so at the assertion that was mangled.
 */
const PARA = String.fromCharCode(10, 10);

export const serviceLocations: ServiceLocation[] = [
  // ---------------------------------------------------------------- 1
  {
    service: "remodeling",
    town: "asheville",
    townDisplay: "Asheville",
    county: "Buncombe County",
    projectSlugs: ["crown-point"],
    heading: "Whole-Home Remodeling in Asheville, NC",
    intro:
      "Remodeling an Asheville home means working inside what is already there — a floor plan drawn for a different way of living, framing that has moved since the day it went up, and mechanical systems sized for a smaller load than a modern kitchen puts on them. We start every remodel by understanding the house as built rather than as drawn, because on a renovation the drawings and the reality rarely agree." +
      "\n\n" +
      "Blue Ridge Homes manages whole-home renovations across the city, from kitchen-and-bath scopes to full interior rebuilds that take a house back to the studs. Crown Point is representative: an existing home reworked around an open kitchen and a stone fireplace, with the structural changes that made that layout possible carried inside the same scope rather than handed off." +
      "\n\n" +
      "What a general contractor is actually for on a remodel is sequencing. Demolition exposes what an estimate could only guess at, and the schedule has to absorb that without stranding the trades behind it. We hold the schedule, we keep the budget conversation open, and we tell you what changed on the day it changes rather than at the end.",
    detail: [
      {
        heading: "The Terrain Under the House",
        body:
          "Asheville’s terrain shapes a remodel as much as it shapes new construction. Sloped lots mean crawl spaces and daylight basements rather than slabs, and that is usually where a renovation finds its surprises: moisture, undersized framing, and mechanical runs that were never meant to be permanent.",
      },
      {
        // Review-time figure: operator-reported, confirmed with the City of Asheville
        // 2026-08-21. The city publishes no review-time target; this came from asking
        // Development Services directly.
        heading: "Permitting Inside the City",
        body:
          "Permitting inside the city runs through the City of Asheville Development Services Department at the Permit Application Center on South Charlotte Street, which handles additions and remodels alongside new construction. Most projects over $40,000 require a permit, but cost is not the only trigger: any change to a load-bearing wall requires one regardless of value, and so does any plumbing, electrical, or HVAC work. Above $40,000 the work has to be done by a licensed general contractor." +
          PARA +
          "The city doesn’t publish a review-time commitment. Asked directly in August 2026, Development Services put residential remodel plan review at one to two weeks — most often around a week — for a complete submission. An incomplete application restarts that clock, which is the largest variable and the one entirely within your control.",
      },
      {
        heading: "Historic Districts: Establish Which Kind",
        body:
          "If the house is in a historic district, establish which kind before planning any exterior change, because the phrase covers two situations with opposite consequences. Asheville has four local historic districts — Montford, Albemarle Park, Biltmore Village, and St. Dunstan’s — along with roughly forty-seven individually designated local landmarks, and fourteen National Register historic districts on top of those." +
          PARA +
          "Same words, opposite practical effect — one adds a review step, the other adds a funding option. Getting that wrong costs either a month of unnecessary process or a rejected permit.",
        facts: {
          caption: "Two designations, opposite consequences.",
          rows: [
            { label: "Local historic district", value: "A Certificate of Appropriateness from the Historic Resources Commission is required before any exterior alteration, addition, or new construction, with major work heard at the commission’s monthly meeting." },
            { label: "What that certificate is", value: "Design review only. It does not replace a building or zoning permit, and it is required whether or not a building permit is." },
            { label: "National Register district", value: "A contributing structure in a National Register district is not subject to Historic Resources Commission design review at all; it is eligible for historic rehabilitation tax credits instead." },
          ],
        },
      },
      {
        // NEC 230.79(C) as adopted in NC sets a minimum rating for the service
        // DISCONNECTING MEANS at 100 A, 3-wire — not a minimum service size. Actual size
        // comes from the Article 220 load calculation. Copy states the decision rather
        // than a typical amperage for this reason.
        heading: "Electrical Service on Older Stock",
        body:
          "Electrical service is the other thing we assess early on Asheville’s older housing stock, and there is no typical amperage for a given vintage worth quoting. The code floor is a 100-amp service disconnect; actual size comes from a load calculation, and that calculation belongs before demolition rather than after. Induction cooking, a heat-pump water heater, or an EV charger each add substantial load, and a panel that was adequate for the house as built often isn’t for the house as remodeled. A service upgrade is a scoped line item when that is the case — not something discovered at rough-in.",
      },
      {
        heading: "Plaster, Lath, and Pricing Before Demolition",
        body:
          "Plaster-and-lath walls change both the demolition method and what can realistically be done for insulation. None of this is a reason not to remodel. It is a reason to have the house priced honestly before demolition rather than discovered after.",
      },
    ],
    faqs: [
      {
        q: "Do I have to move out during a whole-home remodel?",
        a: "It depends on scope. A kitchen or bath remodel is usually livable if you can give up that one room. A down-to-the-studs interior renovation is not — the house loses water, power, and heat in stages. We will tell you which one you are signing up for before demolition starts, not after.",
      },
      {
        q: "How long does a whole-home remodel in Asheville take?",
        a: "Four to nine months, depending on the size of the house and how deep the remodel goes. A kitchen and two baths sits at the short end; taking a house down to studs and reworking the layout sits at the long end. Permitting sits in front of that, not inside it.",
      },
      {
        q: "Can you work from my architect’s or designer’s drawings?",
        a: "Yes, and we would rather be in the conversation before the drawings are final. A builder reading a plan early catches the details that get expensive later — a beam that has nowhere to land, a duct run with no chase, a window that cannot be flashed the way it is drawn.",
      },
      {
        q: "What happens when you open a wall and find a problem?",
        a: "We stop, document it, price it, and bring it to you before we proceed. Unknown conditions are the normal condition on a remodel, not an exception. A good estimate carries an allowance for them; what it cannot do is predict which one you will get.",
      },
      {
        q: "Do you handle the permits?",
        a: "Yes. Permitting, inspections, and scheduling the trades around them are part of construction management on every remodel we run — through the Permit Application Center for work inside the city limits. You are not the one calling the inspector, and you are not the one finding out that a load-bearing change needed a permit nobody pulled.",
      },
    ],
    metaTitle: "Whole-Home Remodeling in Asheville, NC",
    metaDescription:
      "Whole-home remodeling and kitchen renovations in Asheville, NC. Structural work, permitting, and construction management handled by one licensed builder.",
  },

  // ---------------------------------------------------------------- 2
  {
    service: "custom-homes",
    town: "asheville",
    townDisplay: "Asheville",
    county: "Buncombe County",
    projectSlugs: ["23-woodbine-rd", "stewart-st"],
    heading: "Custom Home Building in Asheville, NC",
    intro:
      "In Asheville the lot decides more about a custom home than the floor plan does. Slope sets the foundation type, the driveway approach, and where the house can sit at all; drainage sets what has to happen before anything is poured. A plan that works beautifully on flat ground can cost a great deal to force onto a mountain site, and the time to learn that is before the drawings are finished." +
      "\n\n" +
      "Blue Ridge Homes builds new homes on client-owned lots across the city. 23 Woodbine Road and Stewart Street are both Asheville builds, and both show the same priority: a house that reads as though it belongs where it stands rather than one dropped onto it." +
      "\n\n" +
      "We manage the whole sequence — site evaluation, grading and site prep, foundation, framing, the trades, and the inspections that gate each of them. One builder carries the schedule and the budget from the first walk of the property to the final walkthrough, which is the point: there is no seam for a problem to fall through.",
    detail: [
      {
        // Driveway grade tiers -- 10% across the first ten feet at the street, 14% beyond
        // the apron: operator-reported, confirmed with the City of Asheville 2026-08-21.
        // Not surfaced in the UDO text or the indexed sections of the Standard
        // Specifications and Details Manual.
        heading: "Slope Is the Cost Driver",
        body:
          "Most buildable land left inside Asheville is sloped, and slope is the cost driver. Cut-and-fill, retaining walls, and a driveway that has to climb the lot are line items that never appear on a stock plan. Asheville sets residential driveway grade in two tiers." +
          PARA +
          "Variances are granted regularly and steeper drives exist throughout the city, but the apron figure is the harder of the two to design around — it is a fixed constraint at the property edge rather than something you can spread over the run. On a lot that drops away from the road, it often decides where the driveway can enter at all.",
        facts: {
          caption: "Asheville residential driveway grade maximums.",
          rows: [
            { label: "Across the first ten feet at the street", value: "10% maximum" },
            { label: "Beyond the apron", value: "14% maximum" },
          ],
        },
      },
      {
        heading: "The Driveway Cut, and Rock",
        body:
          "Worth knowing early: the driveway is usually the largest single cut on a steep site, so it drives the disturbed-area total and can pull a project across the one-acre erosion permit threshold on its own. Where it meets a state road it also pulls an NCDOT encroachment review." +
          PARA +
          "Rock is the other wildcard. We hit rock on roughly three lots in ten. What it costs depends entirely on what kind: rock a trackhoe can move is a schedule item, rock that has to be hammered out is a different conversation. That is why we will not quote a rock allowance as a flat figure — the range between those two cases is wider than any average would suggest.",
      },
      {
        heading: "Who Issues the Permit, and Who Issues the Sewer Approval",
        body:
          "New residential construction inside the city is permitted through the City of Asheville Development Services Department at the Permit Application Center, which handles new houses and accessory dwelling units alongside additions and remodels. Sewer is a separate authority: the Metropolitan Sewerage District of Buncombe County runs its own approval procedure and has to be contacted independently of the city. That one catches people who assume a single application covers the whole site.",
      },
      {
        heading: "Steep Slope and Ridgetop",
        body:
          "The rule most likely to change what can actually be built is the city’s Steep Slope and Ridgetop Development Ordinance, UDO section 7-12-4, in effect since 2007. The ordinance governs how much of the lot may be graded, how much impervious surface is allowed, and how retaining walls and screening are handled." +
          PARA +
          "Existing grade can be established by a licensed surveyor, engineer, or landscape architect, or the city will calculate it; Asheville and Buncombe County GIS jointly publish an online slope tool that uses the ordinance’s own methodology. The city rule and the county rule are not interchangeable, and which one applies is a function of the address rather than of the terrain.",
        facts: {
          caption: "The city ordinance applies to land at or above 2,220 feet in elevation with an existing grade of 15 percent or more.",
          rows: [
            { label: "Zone A", value: "2,220 to 2,349 feet" },
            { label: "Zone B", value: "2,350 feet and above, and the more restrictive of the two" },
            { label: "Existing grade of 36 percent or more", value: "Additional standards regardless of elevation, as for areas mapped High Hazard or Moderate Hazard" },
            { label: "Unincorporated Buncombe County", value: "A separate Steep Slope Overlay with different triggers, above 2,500 feet with a natural slope of 35 percent or more" },
          ],
        },
      },
      {
        // Left as prose deliberately. The thresholds look parallel, but the
        // under-10,000 case is governed by TWO co-requisites -- the area figure and
        // the post-construction exemption -- and a label/value split promotes one of
        // them and demotes the other. On a regulatory threshold that is a change of
        // meaning, not of presentation.
        heading: "Moving Dirt: What Each Threshold Engages",
        body:
          "There is no single disturbed-area number that turns grading into a permit inside the city. A design plan is required for land-disturbing activity unless the work is exempt; what scales is the size of the submission and the number of agencies reviewing it. Under 10,000 square feet of proposed disturbance, and exempt from post-construction stormwater controls, a sketch plan goes in instead of a full design plan. At one acre or more, the stormwater administrator notifies the state Division of Water Quality and the Metropolitan Sewerage District and forwards the plan to the Soil and Water Conservation District for review. Post-construction controls engage above one acre of disturbance, or where impervious area exceeds half the site and increases by 5,000 square feet or more. Buncombe County’s erosion control program explicitly excludes the City of Asheville, so none of the county thresholds apply inside the limits.",
      },
      {
        heading: "Before Anyone Commits to a Plan",
        body:
          "We walk a property before anyone commits to a plan, and we would rather tell you a lot is going to be expensive than find out together at the excavator. Where a site needs a geotechnical report or a survey before it can be priced honestly, we say so up front instead of burying the risk in a contingency.",
      },
    ],
    faqs: [
      {
        q: "I have a lot. Can you tell me whether it is buildable?",
        a: "That is the first conversation, and it happens on the property rather than over email. We look at slope, access, drainage, where utilities are, and where a house could actually sit. Some lots need a survey or a soils report before anyone can price them honestly, and we will tell you that rather than guess.",
      },
      {
        q: "What does a custom home cost per square foot in Asheville?",
        a: "Custom homes in the Asheville market currently run $300 to $500 per square foot, and above that where site conditions or finish level push it. The spread is mostly site and selections, not framing. Per-square-foot is still the wrong unit to plan from on a mountain site, because two identical houses on two different lots do not cost the same — site work, foundation type, and access can separate them substantially. We price from the actual site and the actual plan.",
      },
      {
        q: "How long does a custom home take to build?",
        a: "Nine to twelve months from groundbreaking to certificate of occupancy for a typical custom home, with design and permitting ahead of that. Weather, inspection scheduling, and long-lead material items are the usual variables.",
      },
      {
        q: "Do you provide the plans, or do I bring my own?",
        a: "Either. Many clients arrive with an architect already engaged, and we work from those drawings regularly. If you are starting from nothing, we can point you toward designers whose work suits the site and stay involved while the plan takes shape, which usually saves money later.",
      },
      {
        q: "Do you build outside the city limits?",
        a: "Yes — we build across Western North Carolina, and jurisdiction changes what the permitting looks like rather than what the house looks like. See our work in Weaverville for projects in the North Buncombe communities.",
      },
    ],
    metaTitle: "Custom Home Building in Asheville, NC",
    metaDescription:
      "Custom homes built on Asheville lots. Site evaluation, grading, permitting, and construction management from one builder. See completed Asheville projects.",
  },

  // ---------------------------------------------------------------- 3
  {
    service: "icf-construction",
    town: "asheville",
    townDisplay: "Asheville",
    county: "Buncombe County",
    projectSlugs: ["breezeway"],
    heading: "ICF Construction in Asheville, NC",
    // 2006 ICF start date, owner-reported 2026-08-21.
    intro:
      "Insulated concrete forms build a wall as one assembly: rigid foam on both faces, steel-reinforced concrete in the middle, poured in place. There are no studs to bridge heat across, no cavities to fill imperfectly, and no gaps at the plate lines. What the homeowner notices is not the wall — it is that the rooms hold an even temperature and the house is quiet." +
      "\n\n" +
      "We built our first ICF structure in 2006 and have been building with the system for twenty years. The Breezeway is our ICF build in South Asheville: a contemporary home with wood and steel exterior accents and floor-to-ceiling glass, on an ICF envelope. From the street it reads as a custom home, which is the point. ICF accepts stone, siding, stucco, and brick, and nothing about the finished exterior announces the wall system behind it." +
      "\n\n" +
      "ICF is not the right answer for every project or every budget, and we will say so. It earns its cost on sites where comfort, energy use, sound, and storm resistance are all worth paying for at once — and it is a decision that has to be made before the foundation, not after.",
    detail: [
      {
        // Wind speed: Table R301.2(5), ULTIMATE DESIGN WIND SPEED FOR MOUNTAIN REGIONS,
        // Chapter 3 (Building Planning), 2018 North Carolina Residential Code — the
        // edition Asheville enforces for plans submitted on or after 2019-01-01. Note:
        // UpCodes serves the 2018 NCRC at a URL path ending irc-2015 because it is
        // based on the 2015 IRC; the path is not an edition mismatch. Corroborated
        // against Buncombe County’s commercial plan-review checklist (115 mph floor,
        // elevation-dependent above).
        heading: "Wind Design Is Set by Elevation, Not by County",
        body:
          "Mountain sites are where ICF makes its clearest case, and on exposed ridge lots wind loading is part of the reason. Wind design in Buncombe County is set by elevation rather than by a single county-wide number. The 2018 North Carolina Residential Code, Table R301.2(5), keys the ultimate design wind speed to first-floor finish elevation." +
          PARA +
          "Asheville sits at roughly 2,100 feet, so most homes in the city and the surrounding valley fall in the 115 mph band — but a ridge lot a few miles away can land a category or two higher, and that changes framing connections, sheathing attachment, and window DP ratings. It is confirmed at plan review against the finish floor elevation, which is a reason to have it settled before framing is priced.",
        facts: {
          caption: "2018 North Carolina Residential Code, Table R301.2(5): ultimate design wind speed by first-floor finish elevation.",
          rows: [
            { label: "Below 2,700 feet", value: "115 mph" },
            { label: "To 3,000 feet", value: "120 mph" },
            { label: "To 3,500 feet", value: "130 mph" },
            { label: "To 4,500 feet", value: "140 mph" },
            { label: "At or above 4,500 feet", value: "150 mph" },
          ],
        },
      },
      {
        heading: "Foundation and Envelope in One System",
        body:
          "Because ICF often pairs with a full basement or a daylight foundation on a sloped Asheville lot, the same crew and the same forming system can carry from footing to roof line, which is part of where the cost efficiency comes from. Where the budget will not carry a full envelope, a concrete-core lower level under conventional framing above is a common compromise.",
      },
      {
        // ICF wall inspection: operator-reported 2026-08-21. This one inverted the
        // question rather than answering it -- there is no county ICF inspection
        // sequence to enumerate, because the structural engineer’s third-party report
        // is the approval of record and the county inspector performs a presence check.
        // Only the scheduling mechanics remain open.
        heading: "How an ICF Wall Is Approved",
        body:
          "ICF walls aren’t inspected the way framing is. The rebar layout and concrete specification are designed by a structural engineer, and the engineer’s third-party report is the approval of record for them. The county’s part is one inspection: an inspector confirms the steel is in before the pour. Practically, that means the engineering has to be lined up before the forms go up, and the report has to arrive; it isn’t something the county catches for you if it’s missing.",
      },
      {
        // Energy: percentage deliberately not published. Sources range 4-60% and split
        // along funding lines; see the marker patch document. Copy argues envelope control
        // and thermal mass instead, per owner direction 2026-08-21.
        heading: "R-Value, Air, and Thermal Mass",
        body:
          "R-value is the number the industry argues about, and it is the least interesting thing about an ICF wall. Published energy-savings comparisons range from single digits to over fifty percent depending on who commissioned the study, which is a good reason not to quote one." +
          PARA +
          "What actually distinguishes the assembly is that air, moisture, and airborne contaminants do not pass through it. Every intake and exhaust in an ICF house is mechanical and deliberate — you know what is entering the building, at what rate, and through what filter. A framed wall leaks by design and the leakage is managed afterward. That is an indoor air quality difference before it is an energy difference, and it is the one people notice living in the house." +
          PARA +
          "The concrete core adds thermal mass: it absorbs heat and releases it slowly, so the interior tracks the daily temperature swing far more gently than an R-value comparison predicts and the mechanical system cycles less. Steady-state R testing measures a wall at equilibrium, a condition that does not occur in a real climate — which is part of why those published figures scatter so widely. And with no studs bridging the assembly, the rated insulation value is close to what you actually get, where a framed wall’s effective performance falls below its nominal rating.",
      },
    ],
    faqs: [
      {
        q: "How much more does ICF cost than conventional framing?",
        a: "ICF costs more than stick framing up front. We will not publish a percentage — our ICF builds predate the material cost swings of the last several years, and a number from then would mislead you now. It is priced per project against current concrete and lumber, alongside the framed alternative, so you are comparing today’s numbers.",
      },
      {
        q: "Does an ICF house look different from the outside?",
        a: "No. ICF accepts stone, lap siding, stucco, and brick the same way a framed wall does. Window openings are deeper, which most people read as a quality cue rather than as a giveaway.",
      },
      {
        q: "Can I do ICF for part of the house instead of all of it?",
        a: "Yes, and it is a common approach. A concrete-core basement or first floor with conventional framing above captures much of the structural and thermal benefit at a lower total cost. Which split makes sense depends on the site and where the house is exposed.",
      },
      {
        q: "Is ICF harder to remodel later?",
        a: "Interior walls are conventional, so layout changes inside the envelope are normal work. Cutting a new opening in an exterior wall is a structural operation and needs engineering — which is worth knowing before you finalize where the windows go.",
      },
      {
        q: "How long have you been building with ICF?",
        a: "We built our first ICF structure in 2006 and have been building with the system for twenty years, which is early for this market. That matters mostly because ICF is unforgiving of inexperience at the pour.",
      },
    ],
    metaTitle: "ICF Construction in Asheville, NC",
    metaDescription:
      "Insulated concrete form homes in Asheville, NC. Quieter, more efficient, storm-resistant walls on mountain sites. See our completed ICF build in South Asheville.",
  },

  // ---------------------------------------------------------------- 4
  {
    service: "remodeling",
    town: "weaverville",
    townDisplay: "Weaverville",
    county: "Buncombe County",
    projectSlugs: ["preston-ct"],
    heading: "Whole-Home Remodeling in Weaverville, NC",
    intro:
      "Weaverville’s housing runs from older homes near the center of town to houses built through the growth of the last few decades in Reems Creek, Settlers Cove, and the communities off Ox Creek Road. Each vintage brings its own remodel problem: the older ones need systems and structure, the newer ones usually need the plan opened up." +
      "\n\n" +
      "Preston Court is our whole-home remodel in Weaverville — a complete interior renovation rather than a surface refresh. That is most of what we do here: kitchens taken back to the framing, baths rebuilt from the drain up, and walls removed with the beam work to carry what they were holding." +
      "\n\n" +
      "We have built extensively in this area, which is a practical advantage on a renovation rather than a sentimental one. We know which subcontractors show up, how the inspections schedule, and what the houses in a given neighborhood tend to be hiding.",
    detail: [
      {
        // Preston Court confirmed Buncombe County, owner-reported 2026-08-21. The in-town /
        // unincorporated-North-Buncombe binary in this section is correct for this
        // entry’s anchor project. Note the custom-homes/weaverville entry is NOT a binary
        // — Settlers Cove is Madison County — so do not copy this section across.
        heading: "Which Office Approves What",
        body:
          "Jurisdiction is the first thing to establish on a Weaverville remodel, and it is two offices in sequence rather than one. Inside the town limits, the Town of Weaverville approves zoning first, before a permit application can proceed — the same arrangement applies in Biltmore Forest and Woodfin. The building permit and the inspections then come from Buncombe County Permits and Inspections in Asheville, which serves the unincorporated county and, by contractual agreement, those three towns. There is no separate Weaverville building department.",
      },
      {
        heading: "Why That Sequence Is Easy to Get Wrong",
        body:
          "The county’s own materials say it provides permitting services for Weaverville, which reads as though the county handles the whole thing. Nothing on either office’s website tells a homeowner that the town has to sign off on zoning first. Apply to the county directly on an in-town lot and you get sent back. Outside the town limits, in unincorporated North Buncombe, the town step does not exist at all: county zoning governs and the county handles both halves.",
      },
      {
        heading: "Septic Capacity Is Counted in Bedrooms",
        body:
          "Many homes outside the town center are on well and septic rather than public utilities, and that matters more on a remodel than people expect. A septic system’s design capacity is rated in bedrooms — not in square feet, and not in fixtures. A system permitted for a three-bedroom house cannot serve a fourth bedroom without an expansion, and an expansion goes through Buncombe County Environmental Health on essentially the same path as new construction, with the added step of locating the existing tank, drain field, and repair area, usually from the original permit on file." +
          PARA +
          "Adding a bathroom generally does not change the bedroom count and often triggers none of this. Adding a bedroom does. That is the distinction homeowners get wrong when they scope an addition, and it is worth settling before a wall is drawn rather than after.",
      },
      {
        // NEC 230.79(C) as adopted in NC sets a minimum rating for the service
        // DISCONNECTING MEANS at 100 A, 3-wire — not a minimum service size. Actual size
        // comes from the Article 220 load calculation. Copy states the decision rather
        // than a typical amperage for this reason.
        heading: "Slope, Moisture, and Electrical Service",
        body:
          "Sloped lots are common through Reems Creek and Settlers Cove, so crawl spaces and daylight basements are the norm, and that is where moisture and framing issues surface first on a walkthrough." +
          PARA +
          "On older homes closer to the town center, electrical service is the other early assessment. The code floor is a 100-amp service disconnect, but the size that actually applies comes out of a load calculation rather than a rule of thumb, and the calculation belongs before demo rather than after. Add induction cooking, a heat-pump water heater, or an EV charger and the load climbs; a panel that suited the house as built often won’t suit it as remodeled. Where that happens we scope the service upgrade as a line item up front, instead of surfacing it at rough-in.",
      },
    ],
    faqs: [
      {
        q: "Do you work in Weaverville often, or mostly in Asheville?",
        a: "Both. We have completed multiple custom homes and remodels throughout the Weaverville area — Reems Creek and the surrounding North Buncombe communities, along with Settlers Cove, parts of which sit across the line in Madison County. You can see several of them on our Weaverville service area page.",
      },
      {
        q: "My house is on well and septic. Does that limit what I can remodel?",
        a: "It limits some things, and almost all of them are about bedrooms rather than bathrooms. Septic capacity is permitted in bedrooms, so a system sized for three cannot serve a fourth without an expansion through Buncombe County Environmental Health, on much the same path as a new system. Adding a bathroom usually does not change the count. It is a solvable problem, but it belongs at the planning stage rather than at inspection, because the answer can change where a wall goes.",
      },
      {
        q: "Can you remove a load-bearing wall to open up the kitchen?",
        a: "Usually yes. It becomes a structural scope rather than a cosmetic one — a beam, posts, and a load path that has to reach the foundation, sometimes with a new footing. We price it as structural work because that is what it is, and we would rather show you the real number early.",
      },
      {
        q: "How do you handle the budget when the house turns out to be worse than it looked?",
        a: "The estimate carries an allowance for unknown conditions, and when we hit one we document it, price it, and bring it to you before proceeding. You will not find out at the end. On a remodel that is the whole discipline.",
      },
    ],
    metaTitle: "Whole-Home Remodeling in Weaverville, NC",
    metaDescription:
      "Whole-home remodeling in Weaverville, NC. Kitchen and bath renovations, structural changes, and interior rebuilds across Reems Creek and North Buncombe.",
  },

  // ---------------------------------------------------------------- 5
  {
    service: "custom-homes",
    town: "weaverville",
    townDisplay: "Weaverville",
    county: "Buncombe County",
    projectSlugs: [
      "195-meadow-creek",
      "280-settlers-cove",
      "660-settlers-cove",
      "90-covey-dr",
    ],
    heading: "Custom Home Building in Weaverville, NC",
    intro:
      "Weaverville is where we have built the most. Meadow Creek, Covey Drive, and two homes in Settlers Cove are all Weaverville builds, and together they cover most of what building here actually involves — sloped lots, mountain views that have to be earned by where the house sits, and finishes that hold up to how people in these mountains actually live." +
      "\n\n" +
      "Building on a Weaverville lot starts with the ground. Slope decides the foundation, the driveway approach, and how much of the budget goes into the site before anything is framed. We walk the property first and price from what is there, because a plan and a lot have to be reconciled and it is cheaper to do that on paper." +
      "\n\n" +
      "One builder carries the whole sequence: site evaluation, grading, foundation, framing, the trades, the inspections, and the punch list. That is the difference between a schedule that holds and a schedule that gets rebuilt every time a subcontractor drops.",
    detail: [
      {
        heading: "Site Work, and Rock",
        body:
          "Most of the desirable land here is sloped, and the site work is where a Weaverville build separates from a flat-lot build. Cut-and-fill, retaining, and driveway grade come first, and they are priced from the ground rather than from the plan." +
          PARA +
          "Rock is the wildcard. We hit rock on roughly three lots in ten across the area. Reems Creek runs about average; the Madison County side runs higher. What it costs depends on what kind — rock a trackhoe can move is a schedule item, rock that has to be hammered out is a different conversation — which is why we look at the lot before you are committed to a foundation plan rather than quoting an allowance.",
      },
      {
        heading: "Which County the Lot Is Actually In",
        body:
          "Weaverville addresses straddle two counties. Inside the town limits and through most of Reems Creek you are in Buncombe: town zoning approval first, then Buncombe County Permits and Inspections for the permit and the inspections, and Buncombe Environmental Health for septic. North and west of there — including parts of Settlers Cove — the same mailing address sits in Madison County, and every one of those offices is different. Establishing which county a lot is actually in is the first thing we do, before design, because it changes the permitting path, the erosion thresholds, and the septic review.",
      },
      {
        heading: "Two Permits Govern Moving Dirt",
        body:
          "In Buncombe County, two separate permits govern moving dirt, with two different thresholds. Regardless of size, silt fence and a stabilized construction entrance have to be in place to keep sediment off neighboring property, and plan review fees double if disturbance begins before the permit issues. Where the overall scope will eventually pass an acre, the stormwater permit has to be in hand before construction starts.",
        facts: {
          caption: "Buncombe County land-disturbance permits.",
          rows: [
            { label: "Erosion control permit", value: "Required at one acre or more of land disturbance — or at a quarter acre or more if the property sits in a Hillside Subdivision as defined by the county subdivision ordinance" },
            { label: "Erosion plan review", value: "Up to twenty days for a new plan and fifteen for a revision" },
            { label: "Stormwater permit", value: "Engages at one acre of residential disturbance, counting the house, the utilities, the septic, the grading, and the road together" },
            { label: "Stormwater plans", value: "Sealed by a licensed engineer or landscape architect" },
          ],
        },
      },
      {
        heading: "Septic Comes First in the Sequence",
        body:
          "Outside the town center most lots are served by well and septic, and septic comes first in the sequence — not as paperwork, but because the drain field placement constrains where the house and the driveway can go rather than the other way around. It runs in two steps through Buncombe County Environmental Health." +
          PARA +
          "An Improvement Permit comes first, applied for with the parcel identification number, a plat or tax map, and the proposed bedroom count; a soil and site evaluation follows, performed by a county environmental health specialist or a licensed soil scientist, and the permit confirms whether the site will support a system and what type. An Authorization to Construct is issued once the design is verified against code — and no building permit is issued for a new structure until that authorization exists.",
      },
      {
        heading: "Two Details Worth Planning Around",
        body:
          "What you hand in determines how long the approval lives. The site also has to be prepared before the evaluation: every proposed structure staked or flagged — house, deck, porch, garage, and driveway — with undergrowth cleared to give roughly fifty feet of visibility. An unprepared site can draw a re-visit fee and put you back in the queue." +
          PARA +
          "On mountain parcels in Buncombe, Henderson, and Haywood, shallow bedrock and steep terrain frequently push a site onto the engineered-design pathway, which is a longer and costlier route than a conventional system. The county publishes the steps but not a timeline; how long the sequence actually takes depends on the queue and on the site, which is why it is the first thing we try to get moving on a rural lot.",
        facts: {
          caption: "How long an Improvement Permit lasts, by what is submitted.",
          rows: [
            { label: "Complete site plan", value: "Valid for sixty months" },
            { label: "Complete plat", value: "Without expiration" },
          ],
        },
      },
    ],
    faqs: [
      {
        q: "How many homes have you built in Weaverville?",
        a: "Several, across Reems Creek, Settlers Cove, and the surrounding area. The projects shown on this page are the ones with a full photo record; you can see more of our Weaverville work on the service area page.",
      },
      {
        q: "The lot is steep. Is that a problem?",
        a: "It is a cost, not a problem — and it is often what makes the view worth having. Slope drives foundation type, retaining, and driveway design. We walk it, tell you what the site work is likely to carry, and price the house against that rather than against a flat-lot assumption.",
      },
      {
        q: "Do I need a well and septic, or is there public water and sewer?",
        a: "It depends which side of the town line the lot is on. Inside the Weaverville town limits, water comes from Town of Weaverville Public Works. Outside it, in unincorporated North Buncombe, it is whichever county utility serves the parcel or a private well under a county well permit, and septic rather than sewer. This is the first thing we establish on a new lot, because septic placement constrains the entire site plan — the drain field decides where the house and the driveway can go, not the reverse.",
      },
      {
        q: "How long does the whole process take, start to finish?",
        a: "Nine to twelve months from groundbreaking to certificate of occupancy. Design and permitting come first and vary the most. Septic permitting and site work can add meaningful time in front of that on a rural lot.",
      },
      {
        q: "Can I see a house you built before I commit?",
        a: "Where a past client is willing, yes — and that is worth more than any photograph. Ask us at the first meeting and we will arrange what we can.",
      },
    ],
    metaTitle: "Custom Home Building in Weaverville, NC",
    metaDescription:
      "Custom homes in Weaverville, NC — Reems Creek, Settlers Cove, and both Buncombe and Madison counties. Site work, permitting, and construction from one builder.",
  },
];
