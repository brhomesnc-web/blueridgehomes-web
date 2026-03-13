import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "ICF Construction — Insulated Concrete Forms in Asheville, NC | Blue Ridge Homes",
  description:
    "ICF home construction in Asheville and Western NC using BuildBlock insulated concrete forms. Energy-efficient, storm-resistant custom homes. Blue Ridge Homes — ICF experience since 2006.",
  openGraph: {
    title:
      "ICF Construction — Insulated Concrete Forms in Asheville, NC | Blue Ridge Homes",
    description:
      "ICF home construction in Asheville and Western NC using BuildBlock insulated concrete forms. Energy-efficient, storm-resistant custom homes.",
    url: "https://www.blueridgehomesnc.com/services/icf-construction",
    siteName: "Blue Ridge Homes",
    locale: "en_US",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "ICF Construction — Insulated Concrete Forms",
  provider: {
    "@type": "HomeAndConstructionBusiness",
    name: "Blue Ridge Homes",
    telephone: "(828) 712-2867",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Asheville",
      addressRegion: "NC",
      addressCountry: "US",
    },
    hasCredential: {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "license",
      name: "NC General Contractor License #56328",
    },
  },
  areaServed: [
    { "@type": "City", name: "Asheville, NC" },
    { "@type": "AdministrativeArea", name: "Buncombe County, NC" },
    { "@type": "AdministrativeArea", name: "Henderson County, NC" },
    { "@type": "AdministrativeArea", name: "Haywood County, NC" },
  ],
  description:
    "Insulated Concrete Form (ICF) construction using the BuildBlock system. Energy-efficient, storm-resistant, and quieter homes for Asheville and Western North Carolina homeowners.",
};

export default function ICFConstructionPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="service-hero">
        <div className="service-hero-bg">
          <Image
            src="/optimized/icf/icf-wall-construction-in-progress-1600.webp"
            alt="Insulated concrete form wall construction in progress — Blue Ridge Homes ICF build in Western NC"
            fill
            priority
            style={{ objectFit: "cover", objectPosition: "center" }}
          />
        </div>
        <div className="container">
          <div className="service-hero-content">
            <p className="hero-label">ICF Construction</p>
            <h1>
              ICF Construction — Insulated Concrete Forms in Asheville, NC
            </h1>
            <p className="service-hero-subtitle">
              Stronger walls, lower energy bills, and a quieter home — built
              with the BuildBlock ICF system.
            </p>
            <Link href="/contact" className="btn-primary">
              Learn About ICF
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="service-content marble-bg">
        <div className="container">
          <div className="service-content-grid">
            <div className="service-text">
              <h2>One of the Few ICF Builders in Western North Carolina</h2>
              <p>
                Insulated Concrete Forms represent one of the most significant
                advances in residential construction over the past two decades,
                yet very few builders in the Asheville area have real experience
                with the technology. Blue Ridge Homes has been building with ICF
                since 2006, using the BuildBlock system to construct walls that
                are stronger, quieter, and dramatically more energy-efficient
                than traditional wood framing.
              </p>
              <p>
                The concept is straightforward: interlocking insulated foam
                blocks are stacked to form the wall shape, reinforced with steel
                rebar, and then filled with concrete. The foam stays in place
                permanently, creating a continuous insulation envelope with no
                gaps, no thermal bridging, and no settling over time. The result
                is a solid concrete wall sandwiched between two layers of rigid
                insulation — a structure that outperforms stick-built walls by
                every measurable standard.
              </p>

              <h3>Why Choose ICF for Your WNC Home</h3>
              <p>
                Western North Carolina has temperature swings that test any
                building envelope. Summer highs in the valleys, winter cold at
                elevation, and persistent moisture throughout the year make
                energy efficiency and durability more than selling points — they
                are practical necessities. ICF walls typically reduce heating and
                cooling costs by 30 to 50 percent compared to conventional
                framing, and the thermal mass of the concrete core helps
                stabilize indoor temperatures even during the most volatile
                mountain weather.
              </p>
              <p>
                Beyond energy savings, ICF homes offer measurable advantages in
                structural resilience. Reinforced concrete walls resist high
                winds, are naturally fire-resistant, and stand up to the kind of
                storm damage that can compromise a stick-built home. They also
                reduce exterior noise significantly — a benefit homeowners often
                do not expect but immediately notice once they move in.
              </p>

              <h3>Our ICF Experience</h3>
              <p>
                Building with insulated concrete forms requires specific
                knowledge that general contractors typically do not have. Bracing
                must be precisely calculated for the concrete pour. Window and
                door bucks need to be integrated before the walls go up.
                Electrical and plumbing runs must be planned in advance because
                you cannot cut into a concrete wall the way you would a stud
                wall. Brian Barrett has managed ICF projects from foundation to
                finish for nearly twenty years and understands the sequencing,
                the subcontractor coordination, and the inspection requirements
                specific to this building method.
              </p>
              <p>
                If you are considering a new home in Asheville, Buncombe County,
                Henderson County, or Haywood County and want to explore whether
                ICF construction is the right fit, we are happy to walk you
                through the costs, timelines, and long-term benefits.
              </p>
            </div>

            <aside className="service-sidebar">
              <div className="service-sidebar-card">
                <h3>ICF Advantages</h3>
                <ul className="service-checklist">
                  <li>30–50% lower heating and cooling costs</li>
                  <li>Superior storm and wind resistance</li>
                  <li>Natural fire resistance</li>
                  <li>Dramatically reduced exterior noise</li>
                  <li>No thermal bridging or insulation settling</li>
                  <li>Stable indoor temperatures year-round</li>
                </ul>
              </div>
              <div className="service-sidebar-card">
                <h3>BuildBlock System</h3>
                <p>
                  We use the BuildBlock ICF system — interlocking EPS blocks with
                  integrated rebar channels, filled with reinforced concrete for
                  maximum structural integrity.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="service-gallery">
        <div className="container">
          <h2>ICF Construction Process</h2>
          <div className="service-gallery-grid">
            <div className="service-gallery-item service-gallery-item--wide">
              <Image
                src="/optimized/icf/icf-blocks-stacked-for-wall-1600.webp"
                alt="ICF blocks stacked and ready for concrete pour — insulated concrete form wall construction"
                width={800}
                height={500}
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
              />
              <div className="service-gallery-caption">
                <span>ICF Wall Assembly</span>
              </div>
            </div>
            <div className="service-gallery-item">
              <Image
                src="/optimized/icf/icf-foundation-with-rebar-1600.webp"
                alt="ICF foundation with steel rebar reinforcement before concrete pour"
                width={600}
                height={400}
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
              />
              <div className="service-gallery-caption">
                <span>Rebar &amp; Reinforcement</span>
              </div>
            </div>
            <div className="service-gallery-item">
              <Image
                src="/optimized/icf/icf-concrete-pour-in-progress-1600.webp"
                alt="Concrete being poured into ICF forms on a residential build site"
                width={600}
                height={400}
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
              />
              <div className="service-gallery-caption">
                <span>Concrete Pour</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="service-cta marble-bg">
        <div className="container">
          <div className="service-cta-inner">
            <h2>Interested in an ICF Home?</h2>
            <p>
              We will walk you through the costs, the process, and the long-term
              savings so you can decide if ICF is the right fit for your build.
            </p>
            <div className="service-cta-actions">
              <Link href="/contact" className="btn-primary">
                Start the Conversation
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
              <a href="tel:8287122867" className="btn-outline">
                Call (828) 712-2867
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
