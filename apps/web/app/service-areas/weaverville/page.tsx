import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Custom Home Builder in Weaverville, NC",
  description: "Blue Ridge Homes builds custom homes and manages remodeling projects in Weaverville, NC. 30+ years experience in Buncombe County. NC License #56328.",
  alternates: { canonical: "https://blueridgehomesnc.com/service-areas/weaverville" },
};

export default function WeavervillePage() {
  return (
    <main className="br-page">
      <div className="br-shell br-marble">
        <div className="br-content">

          <section className="br-hero-wrap">
            <div className="br-hero-full">
              <div className="br-hero-media">
                <div className="br-hero-image-wrap">
                  <Image src="/optimized/195-meadow-creek/front-exterior-meadow-creek.jpg" alt="Custom home built by Blue Ridge Homes in Weaverville NC" fill priority className="br-hero-image" sizes="100vw" />
                </div>
              </div>
              <div className="br-hero-overlay-gradient" />
              <div className="br-hero-copy">
                <h1 className="br-hero-title">Custom Home Builder<br />in Weaverville, NC</h1>
                <p className="br-hero-subtitle">Building quality homes in the Reems Creek Valley and North Buncombe communities since 2004.</p>
                <div className="br-button-row">
                  <Link href="/contact" className="br-button br-button-primary">{"Start Your Project \u2192"}</Link>
                </div>
              </div>
            </div>
          </section>

          <section className="br-section">
            <div className="br-container">
              <h2 className="br-title br-title-center">Your Weaverville Home Builder</h2>
              <p className="br-lead" style={{ maxWidth: 820, margin: "0 auto", textAlign: "center" }}>
                {"Weaverville\u2019s mix of established neighborhoods, mountain-view lots, and new developments makes it one of the most sought-after communities in Buncombe County. Blue Ridge Homes has built extensively throughout the area \u2014 from Settlers Cove and Reems Creek to Ox Creek Road and the communities along Highway 19/23. We understand the terrain, the local permitting process, and what it takes to build a home that belongs in these mountains."}
              </p>
            </div>
          </section>

          <div className="br-divider-strip">
            <img src="/optimized/dividers/divider-asheville.jpg" alt="Blue Ridge Mountains near Weaverville NC" />
          </div>

          <section className="br-section br-section-alt br-commitment-section">
            <div className="br-container">
              <div className="br-grid-2 br-commitment-grid">
                <div className="br-commitment-copy">
                  <h2 className="br-title">What We Build in Weaverville</h2>
                  <p className="br-lead">
                    {"Whether you\u2019re building on a sloped lot off Reems Creek or remodeling a home in an established neighborhood, we bring the same hands-on approach to every project."}
                  </p>
                  <div className="br-commitment-list">
                    <div className="br-commitment-item">
                      <span className="br-commitment-icon">{"\u2713"}</span>
                      <div>
                        <h3 className="br-commitment-title">Custom Homes</h3>
                        <p className="br-commitment-body">New construction on your lot, from foundation to final walkthrough. We handle site prep, grading, and construction management.</p>
                      </div>
                    </div>
                    <div className="br-commitment-item">
                      <span className="br-commitment-icon">{"\u2713"}</span>
                      <div>
                        <h3 className="br-commitment-title">Whole-Home Remodeling</h3>
                        <p className="br-commitment-body">Complete interior renovations, kitchen and bath remodels, and structural modifications for Weaverville homes.</p>
                      </div>
                    </div>
                    <div className="br-commitment-item">
                      <span className="br-commitment-icon">{"\u2713"}</span>
                      <div>
                        <h3 className="br-commitment-title">Additions &amp; Expansions</h3>
                        <p className="br-commitment-body">Room additions, screened porches, and garage builds that integrate seamlessly with your existing home.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="br-image-stack br-commitment-visuals">
                  <div className="br-frame br-frame-tall">
                    <Image src="/optimized/90-covey-dr/two-story-house-with-stone-facade-and-driveway.jpg" alt="Custom home at 90 Covey Drive in Weaverville NC" fill className="br-frame-image" sizes="(max-width: 768px) 100vw, 50vw" />
                  </div>
                  <div className="br-frame br-frame-wide">
                    <Image src="/optimized/660-settlers-cove/spacious-kitchen-with-wooden-cabinets-and-island.webp" alt="Custom kitchen in Settlers Cove Weaverville" fill className="br-frame-image" sizes="(max-width: 768px) 100vw, 50vw" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Reciprocal links to the service x location pages. Before this slice
              the town -> service link count in this repo was zero. */}
          <section className="br-section" style={{ paddingBottom: 0 }}>
            <div className="br-container">
              <p className="br-lead" style={{ textAlign: "center", maxWidth: 760, margin: "0 auto" }}>
                Go deeper on what we build here:{" "}
                <Link href="/services/custom-homes/weaverville">custom home building in Weaverville</Link>
                {" and "}
                <Link href="/services/remodeling/weaverville">whole-home remodeling in Weaverville</Link>.
              </p>
            </div>
          </section>

          <section className="br-section">
            <div className="br-container">
              <h2 className="br-title br-title-center">Our Work in Weaverville</h2>
              <p className="br-lead" style={{ maxWidth: 720, margin: "0 auto 32px", textAlign: "center" }}>
                {"We\u2019ve completed multiple custom homes and remodels throughout the Weaverville area."}
              </p>
              <div className="br-portfolio-grid">
                {[
                  { slug: "195-meadow-creek", title: "Meadow Creek", cover: "/optimized/195-meadow-creek/front-exterior-meadow-creek.jpg", location: "Weaverville, NC" },
                  { slug: "90-covey-dr", title: "90 Covey Drive", cover: "/optimized/90-covey-dr/two-story-house-with-stone-facade-and-driveway.jpg", location: "Weaverville, NC" },
                  { slug: "280-settlers-cove", title: "280 Settlers Cove", cover: "/optimized/280-settlers-cove/gray-house-with-gabled-roof-and-lush-greenery.webp", location: "Weaverville, NC" },
                  { slug: "660-settlers-cove", title: "660 Settlers Cove", cover: "/optimized/660-settlers-cove/charming-house-with-stone-facade-and-lush-trees.webp", location: "Weaverville, NC" },
                ].map((p) => (
                  <Link key={p.slug} href={`/portfolio/${p.slug}`} className="br-portfolio-card">
                    <div className="br-portfolio-card-image">
                      <Image src={p.cover} alt={`${p.title} - Custom home in ${p.location}`} fill sizes="(max-width: 640px) 100vw, 50vw" />
                      <div className="br-portfolio-card-overlay">
                        <h2 className="br-portfolio-card-title">{p.title}</h2>
                        <div className="br-portfolio-card-meta">{p.location}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <div className="br-closing-sequence">
            <section className="br-section br-cta br-closing-cta">
              <div className="br-container">
                <h2 className="br-title br-title-center">Ready to Build in Weaverville?</h2>
                <p className="br-lead br-cta-copy">{"Tell us about your property and your vision. We\u2019ll show you what\u2019s possible."}</p>
                <div className="br-cta-actions">
                  <Link href="/contact" className="br-button br-button-primary">{"Start the Conversation \u2192"}</Link>
                  <a href="tel:18287122867" className="br-button br-button-secondary">Call (828) 712-2867</a>
                </div>
              </div>
            </section>
          </div>

        </div>
      </div>
    </main>
  );
}
