import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Custom Home Builder in Asheville, NC | Blue Ridge Homes",
  description:
    "Blue Ridge Homes builds custom homes in Asheville and Western North Carolina. 30+ years experience, NC License #56328, zero complaints since 2004. From mountain retreats to modern family homes.",
  openGraph: {
    title: "Custom Home Builder in Asheville, NC | Blue Ridge Homes",
    description:
      "Blue Ridge Homes builds custom homes in Asheville and Western North Carolina. 30+ years experience, NC License #56328.",
    url: "https://www.blueridgehomesnc.com/services/custom-homes",
    siteName: "Blue Ridge Homes",
    locale: "en_US",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Custom Home Building",
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
    "Custom home building services in Asheville and Western North Carolina. From site evaluation and permitting through final walkthrough, Blue Ridge Homes manages every phase of your new home construction.",
};

export default function CustomHomesPage() {
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
            src="/optimized/breezeway/modern-home-exterior-with-deck-and-landscaping-1600.webp"
            alt="Custom-built modern mountain home with expansive windows near Asheville NC"
            fill
            priority
            style={{ objectFit: "cover", objectPosition: "center" }}
          />
        </div>
        <div className="container">
          <div className="service-hero-content">
            <p className="hero-label">Custom Home Building</p>
            <h1>Custom Home Builder in Asheville, NC</h1>
            <p className="service-hero-subtitle">
              Your vision, our craftsmanship — from site selection through final
              walkthrough.
            </p>
            <Link href="/contact" className="btn-primary">
              Start Your Custom Home
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
              <h2>Building Custom Homes Across Western North Carolina</h2>
              <p>
                A custom home should reflect the way you actually live — not a
                floor plan designed for someone else. At Blue Ridge Homes, owner
                Brian Barrett has spent over 30 years helping families in
                Asheville and the surrounding mountain communities turn raw land
                into homes that fit their landscape, their lifestyle, and their
                long-term goals.
              </p>
              <p>
                We handle every phase of the build. That starts with an honest
                conversation about your budget and priorities, followed by site
                evaluation to understand grading, access, utilities, and any
                conditions specific to the Western North Carolina terrain. From
                there we manage permitting through Buncombe County, Henderson
                County, or the City of Asheville — jurisdictions we have worked
                with for two decades.
              </p>
              <p>
                Construction is where the details matter most, and it is where
                our experience shows. We coordinate subcontractors, maintain
                strict quality inspections at every stage, and keep you informed
                with regular walkthroughs instead of waiting until problems
                become expensive. Brian personally oversees every project from
                foundation to final punch list. There is no project manager
                buffer — the owner of the company is on your jobsite.
              </p>

              <h3>What Sets Our Custom Builds Apart</h3>
              <p>
                Licensed as a North Carolina General Contractor since 2004
                (License #56328), Blue Ridge Homes has never received a single
                complaint or disciplinary action. That record is not an accident.
                It comes from choosing the right projects, setting realistic
                expectations, and following through on every promise.
              </p>
              <p>
                We require all subcontractors to carry liability and workers'
                compensation insurance, and we carry builder's risk insurance on
                every active jobsite. Whether you are building a contemporary
                mountain retreat in South Asheville or a timber-and-stone family
                home in Weaverville, we bring the same level of care and
                accountability to every project.
              </p>
              <p>
                Our service area covers Asheville and Buncombe County, Henderson
                County, and Haywood County. If you have land and a vision, we
                would love to talk about what is possible.
              </p>
            </div>

            <aside className="service-sidebar">
              <div className="service-sidebar-card">
                <h3>Why Choose Blue Ridge Homes</h3>
                <ul className="service-checklist">
                  <li>Owner-managed — Brian Barrett on every jobsite</li>
                  <li>30+ years of construction experience</li>
                  <li>1,000+ building inspections completed</li>
                  <li>NC License #56328 — zero complaints since 2004</li>
                  <li>Full insurance and subcontractor vetting</li>
                  <li>Local permitting expertise across WNC</li>
                </ul>
              </div>
              <div className="service-sidebar-card">
                <h3>Service Area</h3>
                <p>
                  Asheville, Weaverville, Black Mountain, Hendersonville,
                  Waynesville, and communities throughout Buncombe, Henderson,
                  and Haywood counties.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="service-gallery">
        <div className="container">
          <h2>Recent Custom Home Projects</h2>
          <div className="service-gallery-grid">
            <div className="service-gallery-item service-gallery-item--wide">
              <Image
                src="/optimized/dads/modern-house-with-large-windows-at-dusk-1600.webp"
                alt="Custom mountain home at dusk with large windows — Meadow Creek project in Weaverville NC"
                width={800}
                height={500}
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
              />
              <div className="service-gallery-caption">
                <span>Meadow Creek — Weaverville</span>
              </div>
            </div>
            <div className="service-gallery-item">
              <Image
                src="/optimized/green-river/modern-house-with-trees-and-stone-path-1600.webp"
                alt="Modern forest home with stone walkway — Green River NC custom build"
                width={600}
                height={400}
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
              />
              <div className="service-gallery-caption">
                <span>Green River — Henderson County</span>
              </div>
            </div>
            <div className="service-gallery-item">
              <Image
                src="/optimized/23-woodbine-rd/modern-house-with-deck-and-outdoor-seating-1600.webp"
                alt="Custom spec home with expansive deck in Asheville NC"
                width={600}
                height={400}
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
              />
              <div className="service-gallery-caption">
                <span>Woodbine Road — Asheville</span>
              </div>
            </div>
            <div className="service-gallery-item service-gallery-item--wide">
              <Image
                src="/optimized/breezeway/contemporary-home-with-large-windows-1600.webp"
                alt="Contemporary custom home with breezeway in South Asheville"
                width={800}
                height={500}
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
              />
              <div className="service-gallery-caption">
                <span>Breezeway — South Asheville</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="service-cta marble-bg">
        <div className="container">
          <div className="service-cta-inner">
            <h2>Ready to Build Your Custom Home?</h2>
            <p>
              Tell us about your property, your timeline, and how you want your
              home to live. We will take it from there.
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
