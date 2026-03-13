import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Construction Consulting in Asheville, NC | Blue Ridge Homes",
  description:
    "Expert construction consulting for homeowners in Asheville and Western NC. Budgeting, site evaluation, permitting guidance, and project planning. 30+ years experience, 1,000+ inspections.",
  openGraph: {
    title: "Construction Consulting in Asheville, NC | Blue Ridge Homes",
    description:
      "Expert construction consulting for homeowners in Asheville and Western NC. Budgeting, site evaluation, permitting, and project planning.",
    url: "https://www.blueridgehomesnc.com/services/consulting",
    siteName: "Blue Ridge Homes",
    locale: "en_US",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Construction Consulting",
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
    "Construction consulting services for homeowners in Asheville and Western North Carolina. Expert guidance on budgeting, site evaluation, permitting, and project planning before construction begins.",
};

export default function ConsultingPage() {
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
            src="/optimized/dads/stone-accented-house-with-trees-and-landscaping-1600.webp"
            alt="Completed custom home with stone accents and mature landscaping — Blue Ridge Homes consulting project"
            fill
            priority
            style={{ objectFit: "cover", objectPosition: "center" }}
          />
        </div>
        <div className="container">
          <div className="service-hero-content">
            <p className="hero-label">Construction Consulting</p>
            <h1>Construction Consulting in Asheville, NC</h1>
            <p className="service-hero-subtitle">
              Expert guidance before you break ground — budgeting, site
              evaluation, permitting, and project planning.
            </p>
            <Link href="/contact" className="btn-primary">
              Schedule a Consultation
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
              <h2>Make Better Decisions Before Construction Begins</h2>
              <p>
                Building or remodeling a home involves hundreds of decisions, and
                the ones that matter most happen before the first hammer swings.
                Choosing the wrong site, underestimating the budget, missing a
                zoning restriction, or hiring an unqualified contractor — any of
                these missteps can turn an exciting project into an expensive
                lesson. Our consulting services exist to make sure that does not
                happen to you.
              </p>
              <p>
                Brian Barrett brings over 30 years of construction experience
                and more than 1,000 completed building inspections to every
                consulting engagement. Whether you are buying land to build on,
                evaluating a home before a major renovation, or simply trying to
                understand what a project will realistically cost, he provides
                straightforward professional guidance based on actual Western
                North Carolina building conditions — not internet estimates or
                national averages.
              </p>

              <h3>What Our Consulting Covers</h3>
              <p>
                Every consulting engagement is tailored to what you need, but
                our clients most commonly ask for help with budget development,
                site evaluation, permitting navigation, and project planning.
                For land buyers, we assess grading, access, utilities,
                stormwater, and any conditions that could affect construction
                cost or timeline. For homeowners planning a renovation or
                addition, we evaluate the existing structure, identify potential
                issues behind walls and under floors, and provide honest cost
                projections before you commit to a contractor.
              </p>
              <p>
                We also help clients who are working with architects or other
                contractors and want an independent second opinion. Having a
                licensed general contractor review your plans, estimates, or
                construction progress can save you significant money and prevent
                problems that are far more expensive to fix after the fact.
              </p>

              <h3>Local Knowledge That Matters</h3>
              <p>
                Building in Asheville and Buncombe County is different from
                building in Raleigh or Charlotte. Mountain terrain, steep slopes,
                particular soil conditions, stricter stormwater regulations, and
                the specific requirements of City of Asheville versus Buncombe
                County permitting all affect your project. We have worked in
                these jurisdictions since 2004 and maintain strong working
                relationships with local building officials, engineers, and
                subcontractors.
              </p>
              <p>
                In addition to our in-house expertise, we have a network of
                trusted architects, structural engineers, and specialty
                contractors that we can connect you with depending on the scope
                of your project. You will find us easy to work with, honest in
                our assessments, and proactive about identifying issues before
                they become problems.
              </p>
              <p>
                If you have a project in Buncombe, Henderson, or Haywood County
                — whether you are in the early planning stages or already
                underway — we would be glad to help you make more confident
                decisions.
              </p>
            </div>

            <aside className="service-sidebar">
              <div className="service-sidebar-card">
                <h3>Consulting Services</h3>
                <ul className="service-checklist">
                  <li>Budget development and cost projections</li>
                  <li>Building site evaluation</li>
                  <li>Permitting guidance and navigation</li>
                  <li>Pre-purchase home and land assessments</li>
                  <li>Contractor and plan review</li>
                  <li>Project management oversight</li>
                </ul>
              </div>
              <div className="service-sidebar-card">
                <h3>Why Consult First</h3>
                <p>
                  The decisions you make before construction starts determine 80%
                  of your project's outcome. Expert guidance upfront saves time,
                  money, and headaches down the road.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Gallery — lighter section for consulting, showing range of work */}
      <section className="service-gallery">
        <div className="container">
          <h2>Projects We Have Guided</h2>
          <div className="service-gallery-grid">
            <div className="service-gallery-item service-gallery-item--wide">
              <Image
                src="/optimized/green-river/modern-house-with-trees-and-stone-path-1600.webp"
                alt="Modern forest home built with consulting guidance — Green River NC"
                width={800}
                height={500}
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
              />
              <div className="service-gallery-caption">
                <span>Green River — Henderson County</span>
              </div>
            </div>
            <div className="service-gallery-item">
              <Image
                src="/optimized/90-covey-dr/custom-home-with-stone-exterior-1600.webp"
                alt="Custom home with stone exterior — Covey Drive in Weaverville"
                width={600}
                height={400}
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
              />
              <div className="service-gallery-caption">
                <span>Covey Drive — Weaverville</span>
              </div>
            </div>
            <div className="service-gallery-item">
              <Image
                src="/optimized/duck-dr/spec-home-exterior-1600.webp"
                alt="Spec home built with Blue Ridge Homes consulting — Mars Hill NC"
                width={600}
                height={400}
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
              />
              <div className="service-gallery-caption">
                <span>Duck Drive — Mars Hill</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="service-cta marble-bg">
        <div className="container">
          <div className="service-cta-inner">
            <h2>Not Sure Where to Start?</h2>
            <p>
              That is exactly what consulting is for. Tell us about your project
              or property and we will help you figure out the next step.
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
