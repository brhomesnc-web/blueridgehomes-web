import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Home Remodeling & Renovations in Asheville, NC | Blue Ridge Homes",
  description:
    "Kitchen remodels, bathroom renovations, and whole-home transformations in Asheville and Western NC. Blue Ridge Homes — NC License #56328, 30+ years experience, zero complaints since 2004.",
  openGraph: {
    title: "Home Remodeling & Renovations in Asheville, NC | Blue Ridge Homes",
    description:
      "Kitchen remodels, bathroom renovations, and whole-home transformations in Asheville and Western NC. 30+ years experience.",
    url: "https://www.blueridgehomesnc.com/services/remodeling",
    siteName: "Blue Ridge Homes",
    locale: "en_US",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Home Remodeling & Renovations",
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
    "Comprehensive home remodeling services including kitchen renovations, bathroom remodels, and whole-home transformations in Asheville and Western North Carolina.",
};

export default function RemodelingPage() {
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
            src="/optimized/crown-point/open-kitchen-with-island-and-stone-fireplace-1600.webp"
            alt="High-end kitchen remodel with stone fireplace and custom island in Asheville NC"
            fill
            priority
            style={{ objectFit: "cover", objectPosition: "center" }}
          />
        </div>
        <div className="container">
          <div className="service-hero-content">
            <p className="hero-label">Home Remodeling</p>
            <h1>Home Remodeling &amp; Renovations in Asheville, NC</h1>
            <p className="service-hero-subtitle">
              Kitchens, bathrooms, and whole-home renovations — built to last and
              designed around how you live.
            </p>
            <Link href="/contact" className="btn-primary">
              Plan Your Renovation
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
              <h2>Transforming Homes Across Western North Carolina</h2>
              <p>
                The right renovation can change the way a house feels without
                changing your address. Blue Ridge Homes specializes in
                thoughtful, well-executed remodeling projects that respect the
                character of your existing home while bringing it up to the
                standard you have been imagining. Whether it is a dated kitchen
                that no longer works for your family, a bathroom that needs a
                complete overhaul, or an entire home that is ready for its next
                chapter, we bring the same precision and accountability to
                remodels that we bring to our ground-up custom builds.
              </p>
              <p>
                Owner Brian Barrett personally walks every remodeling project
                before work begins. That assessment covers structural condition,
                mechanical systems, potential surprises behind walls, and a
                realistic scope of what the budget can accomplish. We have seen
                too many homeowners get burned by contractors who underbid the
                job and then pile on change orders. Our approach is the opposite
                — we tell you what it will actually take, and then we deliver on
                that number.
              </p>

              <h3>Kitchen &amp; Bathroom Renovations</h3>
              <p>
                Kitchens and bathrooms are where remodeling budgets go the
                furthest. A well-designed kitchen remodel improves daily function,
                increases your home's resale value, and often becomes the
                gathering point of the house. We coordinate cabinetry,
                countertops, plumbing, electrical, tile, and finish work to keep
                the project moving on schedule with minimal disruption to your
                household.
              </p>
              <p>
                Bathroom renovations follow the same principle — quality fixtures
                and materials, correct waterproofing, and finishes that will
                still look right in fifteen years. We do not cut corners on what
                goes behind the tile.
              </p>

              <h3>Whole-Home Remodeling</h3>
              <p>
                Some homes need more than a single room updated. When the
                project calls for a whole-home transformation — reconfiguring
                floor plans, updating every surface, modernizing electrical and
                plumbing systems — that is where our experience as a licensed
                general contractor matters most. We have completed extensive
                renovations in Asheville, Weaverville, and throughout Buncombe
                County, managing the complexity so you do not have to coordinate
                a dozen different trades yourself.
              </p>
              <p>
                Licensed since 2004 with zero complaints (NC License #56328),
                Blue Ridge Homes brings honest communication, realistic
                timelines, and a commitment to getting the details right. If you
                are ready to reimagine your space, we are ready to listen.
              </p>
            </div>

            <aside className="service-sidebar">
              <div className="service-sidebar-card">
                <h3>Remodeling Services</h3>
                <ul className="service-checklist">
                  <li>Kitchen remodeling and redesign</li>
                  <li>Bathroom renovations</li>
                  <li>Whole-home transformations</li>
                  <li>Flooring, tile, and finish work</li>
                  <li>Structural modifications</li>
                  <li>Electrical and plumbing upgrades</li>
                </ul>
              </div>
              <div className="service-sidebar-card">
                <h3>Our Remodeling Promise</h3>
                <p>
                  Honest estimates, realistic timelines, and no surprise change
                  orders. The scope you agree to is the scope we build.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="service-gallery">
        <div className="container">
          <h2>Recent Remodeling Projects</h2>
          <div className="service-gallery-grid">
            <div className="service-gallery-item service-gallery-item--wide">
              <Image
                src="/optimized/crown-point/bright-modern-kitchen-with-white-cabinets-1600.webp"
                alt="High-end kitchen remodel with custom cabinetry — Crown Point project in Asheville"
                width={800}
                height={500}
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
              />
              <div className="service-gallery-caption">
                <span>Crown Point — Asheville</span>
              </div>
            </div>
            <div className="service-gallery-item">
              <Image
                src="/optimized/preston-ct/eclectic-living-room-with-modern-decor-1600.webp"
                alt="Whole home remodel with eclectic interior design — Preston Court in Weaverville"
                width={600}
                height={400}
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
              />
              <div className="service-gallery-caption">
                <span>Preston Court — Weaverville</span>
              </div>
            </div>
            <div className="service-gallery-item">
              <Image
                src="/optimized/gerton/renovated-interior-with-natural-light-1600.webp"
                alt="Whole home renovation in Gerton NC"
                width={600}
                height={400}
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
              />
              <div className="service-gallery-caption">
                <span>Gerton — Henderson County</span>
              </div>
            </div>
            <div className="service-gallery-item service-gallery-item--wide">
              <Image
                src="/optimized/preston-ct/modern-bathroom-with-tile-and-vanity-1600.webp"
                alt="Luxury bathroom renovation with custom tile — Preston Court whole home remodel"
                width={800}
                height={500}
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
              />
              <div className="service-gallery-caption">
                <span>Preston Court — Weaverville</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="service-cta marble-bg">
        <div className="container">
          <div className="service-cta-inner">
            <h2>Ready to Transform Your Home?</h2>
            <p>
              Tell us about the space you want to change and we will walk you
              through what is possible within your budget.
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
