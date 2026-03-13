import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Home Additions & Expansions in Asheville, NC | Blue Ridge Homes",
  description:
    "Seamless home additions in Asheville and Western NC — extra bedrooms, sunrooms, second stories, and in-law suites. Blue Ridge Homes, NC License #56328, 30+ years experience.",
  openGraph: {
    title: "Home Additions & Expansions in Asheville, NC | Blue Ridge Homes",
    description:
      "Seamless home additions in Asheville and Western NC — extra bedrooms, sunrooms, second stories, and in-law suites.",
    url: "https://www.blueridgehomesnc.com/services/additions",
    siteName: "Blue Ridge Homes",
    locale: "en_US",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Home Additions & Expansions",
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
    "Home addition and expansion services in Asheville and Western North Carolina. From extra bedrooms and sunrooms to second stories and in-law suites.",
};

export default function AdditionsPage() {
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
            src="/optimized/23-woodbine-rd/modern-house-with-deck-and-outdoor-seating-1600.webp"
            alt="Custom home addition with expansive deck and outdoor living in Asheville NC"
            fill
            priority
            style={{ objectFit: "cover", objectPosition: "center" }}
          />
        </div>
        <div className="container">
          <div className="service-hero-content">
            <p className="hero-label">Home Additions</p>
            <h1>Home Additions &amp; Expansions in Asheville, NC</h1>
            <p className="service-hero-subtitle">
              More space that feels like it was always part of the house.
            </p>
            <Link href="/contact" className="btn-primary">
              Discuss Your Addition
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
              <h2>Expanding Homes Throughout Western North Carolina</h2>
              <p>
                Sometimes the house is right but the space is not. A growing
                family, aging parents who need their own suite, a home office
                that can no longer share a corner of the dining room — these are
                the reasons homeowners across Asheville and Buncombe County call
                us about additions. The goal is always the same: more room that
                feels like it belongs, integrated so naturally that guests never
                realize it was not part of the original build.
              </p>
              <p>
                Home additions in Western North Carolina come with unique
                considerations. Mountain lots often have grading challenges,
                setback requirements, and soil conditions that require careful
                engineering before the first footing is poured. Brian Barrett has
                navigated these site conditions for over three decades, working
                closely with structural engineers and local building departments
                to make sure every addition is code-compliant, structurally
                sound, and designed to handle WNC weather.
              </p>

              <h3>Types of Additions We Build</h3>
              <p>
                Our addition projects range from single-room expansions to
                multi-level builds. Extra bedrooms, primary suite additions,
                sunrooms and screened porches, second-story additions, detached
                guest quarters, and in-law suites with separate entrances — we
                have built them all across Asheville, Weaverville, Black
                Mountain, and the surrounding counties. Each project starts with
                a thorough structural assessment of your existing home to
                identify load paths, foundation capacity, and the best way to
                tie new construction into what is already there.
              </p>
              <p>
                The hardest part of any addition is the connection point — where
                old meets new. Rooflines need to match or complement. Siding,
                trim, and finishes need to blend. Interior floor levels need to
                transition cleanly. We pay particular attention to these details
                because they are what separates a thoughtful addition from one
                that looks bolted on.
              </p>

              <h3>Permitting and Local Expertise</h3>
              <p>
                Additions in Buncombe County, Henderson County, and the City of
                Asheville each have different permitting requirements, zoning
                setbacks, and review processes. We handle all of this on your
                behalf, managing the paperwork, drawings, and inspections so the
                project stays on track. With over 1,000 building inspections
                under our belt and a spotless record with the NC Licensing Board
                (License #56328, zero complaints since 2004), we know what
                inspectors expect and we build to exceed it.
              </p>
              <p>
                If your home needs more space, let us show you what is possible
                without the disruption of moving.
              </p>
            </div>

            <aside className="service-sidebar">
              <div className="service-sidebar-card">
                <h3>Addition Types</h3>
                <ul className="service-checklist">
                  <li>Extra bedrooms and primary suites</li>
                  <li>In-law suites with separate entry</li>
                  <li>Sunrooms and screened porches</li>
                  <li>Second-story additions</li>
                  <li>Home office expansions</li>
                  <li>Detached guest quarters</li>
                </ul>
              </div>
              <div className="service-sidebar-card">
                <h3>Seamless Integration</h3>
                <p>
                  Rooflines, siding, and finishes matched precisely to your
                  existing home — the addition should look like it was always
                  there.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="service-gallery">
        <div className="container">
          <h2>Addition &amp; Expansion Projects</h2>
          <div className="service-gallery-grid">
            <div className="service-gallery-item service-gallery-item--wide">
              <Image
                src="/optimized/robin-porch/covered-porch-with-stone-columns-1600.webp"
                alt="Custom porch addition with stone columns — Charlotte NC"
                width={800}
                height={500}
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
              />
              <div className="service-gallery-caption">
                <span>Robin Porch — Charlotte</span>
              </div>
            </div>
            <div className="service-gallery-item">
              <Image
                src="/optimized/23-woodbine-rd/modern-deck-with-mountain-views-1600.webp"
                alt="Expansive deck addition with mountain views — Woodbine Road in Asheville"
                width={600}
                height={400}
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
              />
              <div className="service-gallery-caption">
                <span>Woodbine Road — Asheville</span>
              </div>
            </div>
            <div className="service-gallery-item">
              <Image
                src="/optimized/dads/charming-porch-with-stone-and-wood-details-1600.webp"
                alt="Stone and wood porch detail on custom mountain home — Weaverville NC"
                width={600}
                height={400}
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
              />
              <div className="service-gallery-caption">
                <span>Meadow Creek — Weaverville</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="service-cta marble-bg">
        <div className="container">
          <div className="service-cta-inner">
            <h2>Need More Space?</h2>
            <p>
              Tell us about your home and what you need — we will evaluate the
              structure and show you what is possible.
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
