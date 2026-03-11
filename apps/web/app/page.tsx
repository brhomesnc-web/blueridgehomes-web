import Image from "next/image";
import Link from "next/link";

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

const commitments = [
  {
    title: "A Transparent Process",
    body: "A building experience shaped around clear communication, practical guidance, and fewer surprises. With over 1,000 building inspections behind us, we know what quality looks like \u2014 and we hold every project to that standard.",
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

const portfolioCards = [
  {
    title: "Modern Mountain Retreat",
    image: "/optimized/crown-point/open-kitchen-with-island-and-stone-fireplace-1200.webp",
  },
  {
    title: "Luxury Craftsman Home",
    image: "/optimized/green-river/modern-house-with-trees-and-stone-path-1200.webp",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  name: "Blue Ridge Homes",
  description:
    "Custom home builder and remodeling contractor serving Asheville and Western North Carolina for over 30 years.",
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
  areaServed: {
    "@type": "GeoCircle",
    geoMidpoint: {
      "@type": "GeoCoordinates",
      latitude: 35.5951,
      longitude: -82.5515,
    },
    geoRadius: "80000",
  },
  priceRange: "$",
  foundingDate: "1994",
  knowsAbout: [
    "Custom Home Building",
    "Home Remodeling",
    "Kitchen Renovation",
    "Bathroom Renovation",
    "Home Additions",
    "Mountain Home Construction",
  ],
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
            <section className="br-hero-wrap">
              <div className="br-hero-full">
                {/* Full-width hero image */}
                <div className="br-hero-media">
                  <div className="br-hero-image-wrap">
                    <Image
                      src="/optimized/dads/195-meadow-creek-dr-001.webp"
                      alt="Charming mountain home with stone chimney and covered porch in Western North Carolina"
                      fill
                      priority
                      className="br-hero-image"
                      sizes="(max-width: 768px) 100vw, 100vw"
                    />
                  </div>
                </div>

                {/* Text overlay on left */}
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
                          <span className="br-commitment-icon">✓</span>
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
                        src="/optimized/23-woodbine-rd/IMG_20250902_143142038_HDR-1200.webp"
                        alt="Charming stone and wood porch detail on a Blue Ridge Homes project"
                        fill
                        className="br-frame-image"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>

                    <div className="br-frame br-frame-wide">
                      <Image
                        src="/optimized/23-woodbine-rd/IMG_20250902_143932078_HDR-1200.webp"
                        alt="Mountain view from stone patio at a luxury Blue Ridge home"
                        fill
                        className="br-frame-image"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

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

            <div className="br-closing-sequence">
              <section id="portfolio" className="br-section-tight br-closing-portfolio">
                <div className="br-container">
                  <div className="br-portfolio-grid">
                    {portfolioCards.map((card) => (
                      <Link href="/portfolio" className="br-portfolio-card" key={card.title}>
                        <div className="br-portfolio-media">
                          <Image
                            src={card.image}
                            alt={card.title}
                            fill
                            className="br-portfolio-image"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                          <div className="br-portfolio-overlay" />
                          <h3 className="br-portfolio-title">{card.title}</h3>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </section>

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
