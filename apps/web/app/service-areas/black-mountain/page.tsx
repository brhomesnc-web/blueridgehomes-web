import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Custom Home Builder in Black Mountain, NC | Blue Ridge Homes",
  description: "Blue Ridge Homes builds custom homes and manages remodeling projects in Black Mountain and Swannanoa, NC. 30+ years experience. NC License #56328.",
  alternates: { canonical: "https://blueridgehomesnc.com/service-areas/black-mountain" },
};

export default function BlackMountainPage() {
  return (
    <main className="br-page">
      <div className="br-shell br-marble">
        <div className="br-content">

          <section className="br-hero-wrap">
            <div className="br-hero-full">
              <div className="br-hero-media">
                <div className="br-hero-image-wrap">
                  <Image src="/optimized/280-settlers-cove/gray-house-with-gabled-roof-and-lush-greenery.webp" alt="Custom home with mountain setting near Black Mountain NC" fill priority className="br-hero-image" sizes="100vw" />
                </div>
              </div>
              <div className="br-hero-overlay-gradient" />
              <div className="br-hero-copy">
                <h1 className="br-hero-title">Custom Home Builder<br />in Black Mountain, NC</h1>
                <p className="br-hero-subtitle">Building homes that honor the character of one of Western North Carolina's most charming communities.</p>
                <div className="br-button-row">
                  <Link href="/contact" className="br-button br-button-primary">{"Start Your Project \u2192"}</Link>
                </div>
              </div>
            </div>
          </section>

          <section className="br-section">
            <div className="br-container">
              <h2 className="br-title br-title-center">Building in Black Mountain &amp; Swannanoa</h2>
              <p className="br-lead" style={{ maxWidth: 820, margin: "0 auto", textAlign: "center" }}>
                {"Black Mountain\u2019s small-town character and natural setting make it one of the most desirable places to build in Western North Carolina. Whether you\u2019re building a new home in Grovemont, renovating in the historic downtown area, or constructing on a mountain lot off Flat Creek, Blue Ridge Homes brings the craftsmanship and local knowledge your project demands. We also serve the neighboring Swannanoa valley and surrounding eastern Buncombe County communities."}
              </p>
            </div>
          </section>

          <div className="br-divider-strip">
            <img src="/optimized/dividers/divider-asheville.jpg" alt="Mountain scenery near Black Mountain NC" />
          </div>

          <section className="br-section br-section-alt br-commitment-section">
            <div className="br-container">
              <div className="br-grid-2 br-commitment-grid">
                <div className="br-commitment-copy">
                  <h2 className="br-title">Services in Black Mountain</h2>
                  <p className="br-lead">
                    {"From new construction to thoughtful renovations of older homes, we deliver the same quality and personal attention on every project."}
                  </p>
                  <div className="br-commitment-list">
                    <div className="br-commitment-item">
                      <span className="br-commitment-icon">{"\u2713"}</span>
                      <div>
                        <h3 className="br-commitment-title">Custom Homes</h3>
                        <p className="br-commitment-body">New homes designed for mountain lots, from craftsman-style builds to contemporary designs with expansive views.</p>
                      </div>
                    </div>
                    <div className="br-commitment-item">
                      <span className="br-commitment-icon">{"\u2713"}</span>
                      <div>
                        <h3 className="br-commitment-title">Remodeling &amp; Renovations</h3>
                        <p className="br-commitment-body">{"Kitchens, bathrooms, and whole-home updates that modernize Black Mountain\u2019s older housing stock while respecting its character."}</p>
                      </div>
                    </div>
                    <div className="br-commitment-item">
                      <span className="br-commitment-icon">{"\u2713"}</span>
                      <div>
                        <h3 className="br-commitment-title">Storm Recovery &amp; Rebuilding</h3>
                        <p className="br-commitment-body">{"Structural repairs, rebuilds, and resilient construction for communities recovering from storm damage \u2014 including Helene recovery work in the Swannanoa valley."}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="br-image-stack br-commitment-visuals">
                  <div className="br-frame br-frame-tall">
                    <Image src="/optimized/280-settlers-cove/cozy-living-room-with-stone-fireplace-and-leather-sofas.webp" alt="Living room with stone fireplace in mountain home" fill className="br-frame-image" sizes="(max-width: 768px) 100vw, 50vw" />
                  </div>
                  <div className="br-frame br-frame-wide">
                    <Image src="/optimized/280-settlers-cove/screened-porch-with-wooden-deck-and-ceiling-fan.jpg" alt="Screened porch overlooking woods" fill className="br-frame-image" sizes="(max-width: 768px) 100vw, 50vw" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="br-closing-sequence">
            <section className="br-section br-cta br-closing-cta">
              <div className="br-container">
                <h2 className="br-title br-title-center">Ready to Build in Black Mountain?</h2>
                <p className="br-lead br-cta-copy">{"Tell us about your project and we\u2019ll show you what\u2019s possible in Black Mountain and the Swannanoa valley."}</p>
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
