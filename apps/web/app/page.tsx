import Image from "next/image";
import Link from "next/link";
import ProjectCarousel from "@/components/site/ProjectCarousel";

type StatValue = { kind: "value"; value: string; lines: [string, string] };
type StatMeta = { kind: "meta"; meta: [string, string]; sub: string };
type Stat = StatValue | StatMeta;

const stats: Stat[] = [
  { kind: "value", value: "30+", lines: ["Years", "Experience"] },
  { kind: "value", value: "400+", lines: ["Custom", "Projects"] },
  { kind: "value", value: "98%", lines: ["Client", "Satisfaction"] },
  { kind: "meta", meta: ["Fully Licensed", "& Insured"], sub: "NC #56328" },
  { kind: "meta", meta: ["Custom Homes", "& Remodeling"], sub: "Since 1994" },
];

const services = [
  {
    title: "Custom Homes",
    body: "From modern mountain retreats to craftsman-style estates, we design and build custom homes tailored to Asheville\u2019s terrain and your lifestyle.",
    href: "/services/custom-homes",
    image: "/optimized/green-river/modern-house-with-trees-and-stone-path.jpg",
  },
  {
    title: "Remodeling",
    body: "Kitchens, bathrooms, and whole-home renovations that modernize your space while preserving its character.",
    href: "/services/remodeling",
    image: "/optimized/crown-point/open-kitchen-with-island-and-stone-fireplace.jpg",
  },
  {
    title: "Home Additions",
    body: "Seamless expansions \u2014 extra bedrooms, sunrooms, second stories \u2014 that blend naturally with your existing home.",
    href: "/services/additions",
    image: "/optimized/23-woodbine-rd/modern-kitchen-with-island-and-staircase.jpg",
  },
  {
    title: "ICF Construction",
    body: "One of the few ICF-experienced builders in Western NC. Stronger walls, lower energy bills, and superior comfort.",
    href: "/services/icf-construction",
    image: "/optimized/breezeway/modern-house-with-large-windows-at-dusk.jpg",
  },
  {
    title: "Construction Consulting",
    body: "Expert guidance on budgeting, site evaluation, permitting, and project planning before you break ground.",
    href: "/services/consulting",
    image: "/optimized/195-meadow-creek/house-with-stone-facade-and-small-porch.jpg",
  },
];

const commitments = [
  {
    title: "A Transparent Process",
    body: "A building experience shaped around clear communication, practical guidance, and fewer surprises. With over 1,000 building inspections across Western North Carolina behind us, we know what quality looks like \u2014 and we hold every project to that standard. Licensed NC General Contractor #56328 since 2004.",
  },
  {
    title: "Clear Timelines",
    body: "Reliable communication and realistic schedules you can understand and trust from start to finish.",
  },
  {
    title: "Dedicated Leadership",
    body: "Direct collaboration with our experienced team throughout the design and construction process. We\u2019ve been a licensed NC general contractor since 2004 with zero complaints on record.",
  },
];

const processSteps = [
  {
    number: "01",
    title: "Discover",
    body: "We begin by understanding your property, priorities, budget, and the way you want your home to live.",
  },
  {
    number: "02",
    title: "Build",
    body: "Craftsmanship, communication, and steady project management bring the vision into a beautifully executed home.",
  },
  {
    number: "03",
    title: "Deliver",
    body: "The finished result is a lasting home with timeless materials, strong detailing, and enduring value.",
  },
];

const projects = [
  {
    title: "Meadow Creek Residence",
    location: "Weaverville",
    type: "Custom Home",
    slug: "meadow-creek",
    image: "/optimized/195-meadow-creek/exterior-view-of-a-cozy-house-with-a-porch.jpg",
  },
  {
    title: "The Breezeway",
    location: "South Asheville",
    type: "Custom Home",
    slug: "breezeway",
    image: "/optimized/breezeway/modern-house-with-large-windows-at-dusk.jpg",
  },
  {
    title: "Green River Modern",
    location: "Green River, NC",
    type: "Custom Home",
    slug: "green-river",
    image: "/optimized/green-river/modern-house-with-trees-and-stone-path.jpg",
  },
  {
    title: "Crown Pointe Remodel",
    location: "Asheville",
    type: "Whole Home Remodel",
    slug: "crown-pointe",
    image: "/optimized/crown-point/open-kitchen-with-island-and-stone-fireplace.jpg",
  },
  {
    title: "Woodbine Road",
    location: "Asheville",
    type: "Custom Spec",
    slug: "woodbine-road",
    image: "/optimized/23-woodbine-rd/modern-home-with-wooden-accents-and-large-windows.jpg",
  },
  {
    title: "Preston Court",
    location: "Weaverville",
    type: "Whole Home Remodel",
    slug: "preston-court",
    image: "/optimized/preston-ct/EA_03795-Medium.jpg",
  },
  {
    title: "Duck Drive",
    location: "Mars Hill",
    type: "Spec Home",
    slug: "duck-drive",
    image: "/optimized/duck-dr/cozy-cottage-with-wooden-porch-and-lush-greenery.jpg",
  },
  {
    title: "Covey Drive",
    location: "Weaverville",
    type: "Custom Home",
    slug: "covey-drive",
    image: "/optimized/90-covey-dr/stone-exterior-house-with-gabled-roof.jpg",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  name: "Blue Ridge Homes",
  description:
    "Custom home builder, remodeling contractor, and ICF construction specialist serving Asheville, Buncombe County, Henderson County, and Haywood County for over 30 years.",
  url: "https://www.brhomesnc.com",
  telephone: "(828) 712-2867",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Asheville",
    addressRegion: "NC",
    postalCode: "28801",
    addressCountry: "US",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 35.5951,
    longitude: -82.5515,
  },
  areaServed: [
    { "@type": "AdministrativeArea", name: "Buncombe County, NC" },
    { "@type": "AdministrativeArea", name: "Henderson County, NC" },
    { "@type": "AdministrativeArea", name: "Haywood County, NC" },
    { "@type": "City", name: "Asheville, NC" },
  ],
  priceRange: "$$",
  foundingDate: "2004",
  founder: { "@type": "Person", name: "Brian Barrett" },
  numberOfEmployees: { "@type": "QuantitativeValue", minValue: 1, maxValue: 10 },
  knowsAbout: [
    "Custom Home Building",
    "Home Remodeling",
    "ICF Construction",
    "Home Additions",
    "Kitchen Renovation",
    "Bathroom Renovation",
    "Construction Consulting",
    "Mountain Home Construction",
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Services",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Custom Home Building" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Home Remodeling" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "ICF Construction" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Home Additions" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Construction Consulting" } },
    ],
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="br-page">
        <div className="br-shell br-marble">
          <div className="br-content">
            {/* ── Hero ── */}
            <section className="br-hero-wrap">
              <div className="br-hero-full">
                <div className="br-hero-media">
                  <div className="br-hero-image-wrap">
                    <Image
                      src="/optimized/195-meadow-creek/exterior-view-of-a-cozy-house-with-a-porch.jpg"
                      alt="Custom mountain home with stone chimney and covered porch built by Blue Ridge Homes in Weaverville NC"
                      fill
                      priority
                      className="br-hero-image"
                      sizes="(max-width: 768px) 100vw, 100vw"
                    />
                  </div>
                </div>
                <div className="br-hero-overlay-gradient" />
                <div className="br-hero-copy">
                  <h1 className="br-hero-title">
                    Modern Mountain Living,
                    <br />
                    Built with Integrity.
                  </h1>
                  <p className="br-hero-subtitle">
                    Custom Homes &amp; Remodels
                    <br />
                    in Asheville &amp; Western North Carolina
                  </p>
                  <div className="br-button-row">
                    <Link href="/contact" className="br-button br-button-primary">
                      Start the Conversation &rarr;
                    </Link>
                  </div>
                </div>
              </div>

              <div className="br-stats-band">
                <div className="br-stats-grid">
                  {stats.map((item, index) => (
                    <div
                      className={`br-stat ${item.kind === "meta" ? "br-stat-card" : "br-stat-value-card"}`}
                      key={index}
                    >
                      {item.kind === "value" ? (
                        <>
                          <div className="br-stat-value">{item.value}</div>
                          <div className="br-stat-label">
                            {item.lines[0]}
                            <br />
                            {item.lines[1]}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="br-stat-meta">
                            <span>{item.meta[0]}</span>
                            <span>{item.meta[1]}</span>
                          </div>
                          <div className="br-stat-sub">{item.sub}</div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── Services Overview ── */}
            <section className="br-section br-services-overview">
              <div className="br-container">
                <h2 className="br-title">Your Trusted General Contractor in Asheville, NC</h2>
                <p className="br-lead">
                  Blue Ridge Homes is a family-owned custom home builder, remodeling
                  contractor, and licensed general contractor serving Asheville, Buncombe County,
                  Henderson County, and Haywood County. With over 30 years of construction
                  experience and more than 1,000 building inspections behind us, we bring a
                  level of precision and foresight that most builders simply don&apos;t have.
                  From custom homes and whole-home renovations to ICF construction and home
                  additions, every project is owner-managed with transparent pricing and
                  clear communication.
                </p>
                <div className="br-services-grid">
                  {services.map((svc) => (
                    <Link
                      key={svc.title}
                      href={svc.href}
                      className="br-service-card"
                    >
                      <Image
                        src={svc.image}
                        alt={`${svc.title} services by Blue Ridge Homes in Asheville NC`}
                        fill
                        className="br-service-card-img"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <div className="br-service-card-overlay" />
                      <div className="br-service-card-content">
                        <h3 className="br-service-card-title">{svc.title}</h3>
                        <p className="br-service-card-body">{svc.body}</p>
                        <span className="br-service-card-link">Learn more &rarr;</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>

            {/* ── Project Carousel ── */}
            <section className="br-section-tight br-projects-section">
              <div className="br-container">
                <h2 className="br-title br-title-center">Our Work</h2>
                <p className="br-process-subtitle">
                  A selection of recent projects across Western North Carolina
                </p>
              </div>
              <ProjectCarousel projects={projects} />
              <div style={{ textAlign: "center", marginTop: 20 }}>
                <Link href="/portfolio" className="br-button br-button-secondary" style={{ display: "inline-block" }}>
                  View All Projects
                </Link>
              </div>
            </section>

            {/* ── Commitment ── */}
            <section className="br-section br-commitment-section">
              <div className="br-container">
                <div className="br-grid-2 br-commitment-grid">
                  <div className="br-commitment-copy">
                    <h2 className="br-title">Our Commitment</h2>
                    <p className="br-lead">
                      For over 30 years, a better customer experience has been at
                      the heart of everything we do. Here&apos;s our promise to you:
                    </p>
                    <div className="br-commitment-list">
                      {commitments.map((item) => (
                        <div className="br-commitment-item" key={item.title}>
                          <span className="br-commitment-icon">{"\u2713"}</span>
                          <div>
                            <h3 className="br-commitment-title">{item.title}</h3>
                            <p className="br-commitment-body">{item.body}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="br-image-stack br-commitment-visuals">
                    <div className="br-frame br-frame-tall">
                      <Image
                        src="/optimized/23-woodbine-rd/modern-kitchen-with-island-and-staircase.jpg"
                        alt="Stone and wood porch detail on a Blue Ridge Homes project"
                        fill
                        className="br-frame-image"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                    <div className="br-frame br-frame-wide">
                      <Image
                        src="/optimized/23-woodbine-rd/rooftop-deck-with-seating-and-trees.jpg"
                        alt="Mountain view from stone patio at a Blue Ridge home"
                        fill
                        className="br-frame-image"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ── Process ── */}
            <section id="process" className="br-section-tight br-process-section">
              <div className="br-container">
                <div className="br-process-intro">
                  <div className="br-process-heading">
                    <h2 className="br-title br-title-center">Our Proven Process</h2>
                  </div>
                  <p className="br-process-subtitle">
                    A seamless journey to your dream home
                  </p>
                </div>
                <div className="br-process-row">
                  {processSteps.map((step) => (
                    <div className="br-process-step" key={step.number}>
                      <div className="br-process-number">{step.number}</div>
                      <h3 className="br-process-title">{step.title}</h3>
                      <p className="br-process-body">{step.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── Footer CTA ── */}
            <div className="br-closing-sequence">
              <section id="contact" className="br-section br-cta br-closing-cta">
                <div className="br-container">
                  <h2 className="br-title br-title-center">
                    Let&apos;s Build Something Enduring
                  </h2>
                  <p className="br-lead br-cta-copy">
                    Custom craftsmanship, thoughtful process, and a home designed to
                    feel timeless from the day you move in. Serving Asheville,
                    Buncombe County, Henderson County, and Haywood County.
                  </p>
                  <div className="br-cta-actions">
                    <Link href="/contact" className="br-button br-button-primary">
                      Start the Conversation &rarr;
                    </Link>
                    <a href="tel:18287122867" className="br-button br-button-secondary">
                      Call (828) 712-2867
                    </a>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
