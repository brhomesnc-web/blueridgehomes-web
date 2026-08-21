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
 * EVERY specific factual claim in this file is wrapped in a VERIFY marker for the
 * owner to resolve in one pass before deploy. Those markers render literally on the
 * page and inside the FAQ JSON-LD. That is intentional: an unresolved marker is
 * meant to be impossible to miss, not to fail quietly.
 */

export type ServiceLocationFaq = { q: string; a: string };

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
  /** Terrain / permitting / housing stock. Separated by a literal \n\n. */
  localDetail: string;
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
    localDetail:
      "Asheville’s terrain shapes a remodel as much as it shapes new construction. Sloped lots mean crawl spaces and daylight basements rather than slabs, and that is usually where a renovation finds its surprises: moisture, undersized framing, and mechanical runs that were never meant to be permanent." +
      "\n\n" +
      "Permitting for a residential remodel inside the city runs through [VERIFY: the permit office with jurisdiction over residential remodels inside Asheville city limits], and a structural change, a service upgrade, and a footprint expansion each pull a different review. Plan on [VERIFY: typical review time for a residential remodel permit in Asheville] before work can start. Some of the older neighborhoods also sit inside a local historic district, which adds a design review step ahead of any exterior change — [VERIFY: which Asheville neighborhoods carry local historic district design review]." +
      "\n\n" +
      "Older houses here commonly arrive with [VERIFY: the electrical service size older Asheville homes typically carry, and the size a modern kitchen remodel requires], and plaster-and-lath walls change both the demolition method and what can realistically be done for insulation. None of that is a reason not to remodel. It is a reason to have it priced honestly before demolition rather than discovered after.",
    faqs: [
      {
        q: "Do I have to move out during a whole-home remodel?",
        a: "It depends on scope. A kitchen or bath remodel is usually livable if you can give up that one room. A down-to-the-studs interior renovation is not — the house loses water, power, and heat in stages. We will tell you which one you are signing up for before demolition starts, not after.",
      },
      {
        q: "How long does a whole-home remodel in Asheville take?",
        a: "Duration is driven by scope and by how much the house surprises us once it is open. A full interior renovation typically runs [VERIFY: typical duration of a whole-home interior renovation, in months]. Permitting sits in front of that, not inside it.",
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
        a: "Yes. Permitting, inspections, and scheduling the trades around them are part of construction management on every remodel we run. You are not the one calling the inspector.",
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
    localDetail:
      "Most buildable land left inside Asheville is sloped, and slope is the cost driver. Cut-and-fill, retaining walls, and a driveway that has to meet [VERIFY: the maximum residential driveway grade permitted in Asheville] are line items that never appear on a stock plan. Rock is the other one — [VERIFY: how commonly rock is encountered on Asheville building lots, and the typical cost impact of removal]." +
      "\n\n" +
      "New residential construction inside the city is permitted through [VERIFY: the permit office with jurisdiction over new residential construction inside Asheville city limits], with separate review for grading and stormwater once disturbed area passes [VERIFY: the disturbed-area threshold that triggers a separate grading or stormwater permit in Asheville]. Steep-slope lots may carry additional review — [VERIFY: whether Asheville applies a steep-slope or hillside development ordinance, and at what grade it applies]." +
      "\n\n" +
      "We walk a property before anyone commits to a plan, and we would rather tell you a lot is going to be expensive than find out together at the excavator. Where a site needs a geotechnical report or a survey before it can be priced honestly, we say so up front instead of burying the risk in a contingency.",
    faqs: [
      {
        q: "I have a lot. Can you tell me whether it is buildable?",
        a: "That is the first conversation, and it happens on the property rather than over email. We look at slope, access, drainage, where utilities are, and where a house could actually sit. Some lots need a survey or a soils report before anyone can price them honestly, and we will tell you that rather than guess.",
      },
      {
        q: "What does a custom home cost per square foot in Asheville?",
        a: "Per-square-foot is the wrong unit on a mountain site, because two identical houses on two different lots do not cost the same — site work, foundation type, and access can separate them substantially. For a current range on comparable builds, see [VERIFY: current custom home cost range per square foot for the Asheville market]. We price from the actual site and the actual plan.",
      },
      {
        q: "How long does a custom home take to build?",
        a: "From permit to final inspection, plan on [VERIFY: typical construction duration for a custom home in the Asheville market, in months], with design and permitting ahead of that. Weather, inspection scheduling, and long-lead material items are the usual variables.",
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
    intro:
      "Insulated concrete forms build a wall as one assembly: rigid foam on both faces, steel-reinforced concrete in the middle, poured in place. There are no studs to bridge heat across, no cavities to fill imperfectly, and no gaps at the plate lines. What the homeowner notices is not the wall — it is that the rooms hold an even temperature and the house is quiet." +
      "\n\n" +
      "The Breezeway is our ICF build in South Asheville: a contemporary home with wood and steel exterior accents and floor-to-ceiling glass, on an ICF envelope. From the street it reads as a custom home, which is the point. ICF accepts stone, siding, stucco, and brick, and nothing about the finished exterior announces the wall system behind it." +
      "\n\n" +
      "ICF is not the right answer for every project or every budget, and we will say so. It earns its cost on sites where comfort, energy use, sound, and storm resistance are all worth paying for at once — and it is a decision that has to be made before the foundation, not after.",
    localDetail:
      "Mountain sites are where ICF makes its clearest case. Temperature swings are wide here, and the thermal mass of a concrete core flattens them, so the mechanical system cycles less. On exposed ridge lots the wind loading matters too — [VERIFY: the design wind speed used for residential construction in Buncombe County]." +
      "\n\n" +
      "Because ICF often pairs with a full basement or a daylight foundation on a sloped Asheville lot, the same crew and the same forming system can carry from footing to roof line, which is part of where the cost efficiency comes from. Where budget will not carry a full envelope, a concrete-core lower level under conventional framing above is a common compromise." +
      "\n\n" +
      "Inspectors here are familiar with the system, but ICF pulls a different sequence than stick framing — rebar and embed placement are inspected before the pour, and there is no undoing a pour. Expect [VERIFY: the number and type of inspections an ICF wall assembly requires in Buncombe County] and a schedule that front-loads coordination. Energy performance relative to conventional framing is commonly cited as [VERIFY: the heating and cooling energy reduction of an ICF home versus conventional wood framing]; we would rather you see a real utility history than a brochure figure.",
    faqs: [
      {
        q: "How much more does ICF cost than conventional framing?",
        a: "The wall assembly costs more than a stick-framed wall, and part of that comes back in a smaller mechanical system and in operating cost over the life of the house. For a current premium on comparable builds, see [VERIFY: the typical cost premium of an ICF wall assembly versus conventional framing, as a percentage of total build cost]. We price it against your actual plan rather than a rule of thumb.",
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
        a: "Blue Ridge Homes has been building with insulated concrete forms since [VERIFY: the year Blue Ridge Homes began building with ICF], which is early for this market. That matters mostly because ICF is unforgiving of inexperience at the pour.",
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
    localDetail:
      "Jurisdiction is the first thing to establish on a Weaverville remodel, because it is not always the town. Properties inside the town limits and properties in the surrounding North Buncombe area are permitted differently — [VERIFY: which permitting authority has jurisdiction for residential remodels inside the Weaverville town limits, and which applies to the surrounding unincorporated area]." +
      "\n\n" +
      "Many homes in the area outside the town center are on well and septic rather than public utilities. That matters more on a remodel than people expect: adding a bedroom or a bathroom can change the required septic capacity and trigger a separate review — [VERIFY: whether adding a bedroom or bathroom to a septic-served home in Buncombe County requires a septic permit review, and through which office]. We check this before the plan is finalized, not after the fixtures are ordered." +
      "\n\n" +
      "Sloped lots are common through Reems Creek and Settlers Cove, so crawl spaces and daylight basements are the norm. That is where moisture and framing issues surface, and it is the first place we look on a walkthrough. Older homes closer to the town center may also carry [VERIFY: the electrical service size typical of older Weaverville homes, and the size a modern remodel requires].",
    faqs: [
      {
        q: "Do you work in Weaverville often, or mostly in Asheville?",
        a: "Both. We have completed multiple custom homes and remodels throughout the Weaverville area — Reems Creek, Settlers Cove, and the surrounding North Buncombe communities. You can see several of them on our Weaverville service area page.",
      },
      {
        q: "My house is on well and septic. Does that limit what I can remodel?",
        a: "It limits some things and complicates others, mostly around adding bedrooms or bathrooms, because septic capacity is tied to bedroom count. It is a solvable problem, but it has to be established at the planning stage rather than discovered at inspection.",
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
    localDetail:
      "Most of the desirable land here is sloped, and the site work is where a Weaverville build separates from a flat-lot build. Cut-and-fill, retaining, and driveway grade come first; rock is the wildcard — [VERIFY: how commonly rock is encountered on building lots in the Reems Creek and Settlers Cove areas, and the typical cost impact of removal]." +
      "\n\n" +
      "Permitting depends on whether the lot sits inside the town limits or in the surrounding unincorporated area — [VERIFY: which permitting authority has jurisdiction over new residential construction inside the Weaverville town limits, and which applies to the surrounding unincorporated North Buncombe area]. Grading and stormwater may pull a separate review once disturbed area passes [VERIFY: the disturbed-area threshold that triggers a separate grading or stormwater permit in Buncombe County]." +
      "\n\n" +
      "Outside the town center, most lots are served by well and septic. Septic comes first in the sequence, because the drain field placement constrains where the house and the driveway can go — not the other way around. Expect [VERIFY: the typical soil evaluation and septic permit process and duration for a new home in Buncombe County] ahead of the building permit. Platted subdivisions such as Settlers Cove may also carry recorded covenants governing materials, height, or setbacks — [VERIFY: whether Settlers Cove and comparable Weaverville subdivisions carry architectural covenants, and what they restrict].",
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
        a: "It depends where the lot sits. Inside the town center there is more likely to be public service; outside it, well and septic is common. This is the first thing we establish, because septic placement constrains the whole site plan.",
      },
      {
        q: "How long does the whole process take, start to finish?",
        a: "Design and permitting come first and vary the most. Construction itself typically runs [VERIFY: typical construction duration for a custom home in the Weaverville area, in months]. Septic permitting and site work can add meaningful time in front of that on a rural lot.",
      },
      {
        q: "Can I see a house you built before I commit?",
        a: "Where a past client is willing, yes — and that is worth more than any photograph. Ask us at the first meeting and we will arrange what we can.",
      },
    ],
    metaTitle: "Custom Home Building in Weaverville, NC",
    metaDescription:
      "Custom homes built in Weaverville, NC — Reems Creek, Settlers Cove, and North Buncombe. Site work, permitting, and construction managed by one builder.",
  },
];
