import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Custom Home Builder in Hendersonville, NC",
  description: "Blue Ridge Homes builds custom homes and manages remodeling projects in Hendersonville and Henderson County, NC. 30+ years experience. NC License #56328.",
  alternates: { canonical: "https://blueridgehomesnc.com/service-areas/hendersonville" },
};

export default function HendersonvillePage() {
  return (
    <main className="br-page">
      <div className="br-shell br-marble">
        <div className="br-content">

          <section className="br-hero-wrap">
            <div className="br-hero-full">
              <div className="br-hero-media">
                <div className="br-hero-image-wrap">
                  <Image src="/optimized/green-river/stone-accented-house-with-trees-and-landscaping.jpg" alt="Custom ICF home built by Blue Ridge Homes near Hendersonville NC" fill priority className="br-hero-image" sizes="100vw" />
                </div>
              </div>
              <div className="br-hero-overlay-gradient" />
              <div className="br-hero-copy">
                <h1 className="br-hero-title">Custom Home Builder<br />in Hendersonville, NC</h1>
                <p className="br-hero-subtitle">Quality custom homes and remodeling throughout Henderson County and the Green River valley.</p>
                <div className="br-button-row">
                  <Link href="/contact" className="br-button br-button-primary">{"Start Your Project \u2192"}</Link>
                </div>
              </div>
            </div>
          </section>

          <section className="br-section">
            <div className="br-container">
              <h2 className="br-title br-title-center">Building in Henderson County</h2>
              <p className="br-lead" style={{ maxWidth: 820, margin: "0 auto", textAlign: "center" }}>
                {"Hendersonville and the surrounding Henderson County communities offer some of the best building sites in Western North Carolina. From wooded mountain lots along the Green River to established neighborhoods closer to downtown, we\u2019ve built homes throughout the area that take advantage of the region\u2019s natural beauty while meeting the practical demands of mountain construction. We understand the county\u2019s permitting requirements, soil conditions, and the engineering considerations that come with building on mountain terrain."}
              </p>
            </div>
          </section>

          <div className="br-divider-strip">
            <img src="/optimized/dividers/divider-asheville.jpg" alt="Mountain views near Hendersonville NC" />
          </div>

          <section className="br-section br-section-alt br-commitment-section">
            <div className="br-container">
              <div className="br-grid-2 br-commitment-grid">
                <div className="br-commitment-copy">
                  <h2 className="br-title">Services in Hendersonville</h2>
                  <p className="br-lead">
                    {"From new construction on raw land to updating an older home in one of Hendersonville\u2019s established neighborhoods, we manage every phase of the project."}
                  </p>
                  <div className="br-commitment-list">
                    <div className="br-commitment-item">
                      <span className="br-commitment-icon">{"\u2713"}</span>
                      <div>
                        <h3 className="br-commitment-title">Custom Homes &amp; ICF Construction</h3>
                        <p className="br-commitment-body">{"New custom builds including insulated concrete form (ICF) construction with a continuous insulated envelope and no thermal bridging through studs \u2014 especially valuable in Henderson County\u2019s varied climate."}</p>
                      </div>
                    </div>
                    <div className="br-commitment-item">
                      <span className="br-commitment-icon">{"\u2713"}</span>
                      <div>
                        <h3 className="br-commitment-title">Whole-Home Renovations</h3>
                        <p className="br-commitment-body">Complete interior and exterior renovations that modernize older Henderson County homes while preserving their character.</p>
                      </div>
                    </div>
                    <div className="br-commitment-item">
                      <span className="br-commitment-icon">{"\u2713"}</span>
                      <div>
                        <h3 className="br-commitment-title">Mountain Lot Expertise</h3>
                        <p className="br-commitment-body">Experience building on sloped and wooded lots with proper drainage, retaining walls, and foundation engineering.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="br-image-stack br-commitment-visuals">
                  <div className="br-frame br-frame-tall">
                    <Image src="/optimized/green-river/living-room-with-large-windows-and-forest-view.jpg" alt="Living room with forest view in Green River NC custom home" fill className="br-frame-image" sizes="(max-width: 768px) 100vw, 50vw" />
                  </div>
                  <div className="br-frame br-frame-wide">
                    <Image src="/optimized/green-river/modern-kitchen-with-island-and-wooden-cabinets.jpg" alt="Modern kitchen in Henderson County custom home" fill className="br-frame-image" sizes="(max-width: 768px) 100vw, 50vw" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="br-section">
            <div className="br-container">
              <h2 className="br-title br-title-center">Featured Project Near Hendersonville</h2>
              <p className="br-lead" style={{ maxWidth: 720, margin: "0 auto 32px", textAlign: "center" }}>
                Our Green River Retreat is an ICF-built custom home in the Green River valley of Henderson County.
              </p>
              <div className="br-portfolio-grid" style={{ maxWidth: 450, margin: "0 auto" }}>
                <Link href="/portfolio/green-river" className="br-portfolio-card">
                  <div className="br-portfolio-card-image">
                    <Image src="/optimized/green-river/stone-accented-house-with-trees-and-landscaping.jpg" alt="Green River Retreat - ICF custom home in Henderson County NC" fill sizes="(max-width: 640px) 100vw, 450px" />
                    <div className="br-portfolio-card-overlay">
                      <h2 className="br-portfolio-card-title">Green River Retreat</h2>
                      <div className="br-portfolio-card-meta">Green River, NC</div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </section>

          <div className="br-closing-sequence">
            <section className="br-section br-cta br-closing-cta">
              <div className="br-container">
                <h2 className="br-title br-title-center">Ready to Build in Hendersonville?</h2>
                <p className="br-lead br-cta-copy">{"Whether you have land or are still looking, we can help you plan your Henderson County home."}</p>
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
