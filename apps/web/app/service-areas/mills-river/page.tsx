import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Custom Home Builder in Mills River, NC",
  description: "Blue Ridge Homes builds custom homes and manages remodeling projects in Mills River and southern Henderson County, NC. 30+ years experience. NC License #56328.",
  alternates: { canonical: "https://blueridgehomesnc.com/service-areas/mills-river" },
};

export default function MillsRiverPage() {
  return (
    <main className="br-page">
      <div className="br-shell br-marble">
        <div className="br-content">

          <section className="br-hero-wrap">
            <div className="br-hero-full">
              <div className="br-hero-media">
                <div className="br-hero-image-wrap">
                  <Image src="/optimized/green-river/modern-house-with-trees-and-stone-path.jpg" alt="Custom home built by Blue Ridge Homes near Mills River NC" fill priority className="br-hero-image" sizes="100vw" />
                </div>
              </div>
              <div className="br-hero-overlay-gradient" />
              <div className="br-hero-copy">
                <h1 className="br-hero-title">Custom Home Builder<br />in Mills River, NC</h1>
                <p className="br-hero-subtitle">Quality custom homes and remodeling in the heart of Henderson County's river valley.</p>
                <div className="br-button-row">
                  <Link href="/contact" className="br-button br-button-primary">{"Start Your Project \u2192"}</Link>
                </div>
              </div>
            </div>
          </section>

          <section className="br-section">
            <div className="br-container">
              <h2 className="br-title br-title-center">Building in Mills River</h2>
              <p className="br-lead" style={{ maxWidth: 820, margin: "0 auto", textAlign: "center" }}>
                {"Mills River sits between Asheville and Hendersonville along the French Broad River valley, offering a rare combination of rural character with easy access to both cities. The area\u2019s rolling farmland, wooded acreage, and proximity to the Pisgah National Forest make it one of the most desirable places to build in Henderson County. Blue Ridge Homes has experience building throughout the Mills River area \u2014 from the communities along North Mills River Road and Banner Farm to the neighborhoods near the Asheville Regional Airport. We understand the local terrain, well and septic requirements, and what it takes to build a lasting home in this part of the valley."}
              </p>
            </div>
          </section>

          <div className="br-divider-strip">
            <img src="/optimized/dividers/divider-asheville.jpg" alt="French Broad River valley near Mills River NC" />
          </div>

          <section className="br-section br-section-alt br-commitment-section">
            <div className="br-container">
              <div className="br-grid-2 br-commitment-grid">
                <div className="br-commitment-copy">
                  <h2 className="br-title">Services in Mills River</h2>
                  <p className="br-lead">
                    {"From new construction on acreage to updating an existing home, we manage every phase of your Mills River project with the same hands-on attention."}
                  </p>
                  <div className="br-commitment-list">
                    <div className="br-commitment-item">
                      <span className="br-commitment-icon">{"\u2713"}</span>
                      <div>
                        <h3 className="br-commitment-title">Custom Homes on Acreage</h3>
                        <p className="br-commitment-body">{"New construction on rural and semi-rural lots with full site management \u2014 including well, septic, grading, and driveway engineering."}</p>
                      </div>
                    </div>
                    <div className="br-commitment-item">
                      <span className="br-commitment-icon">{"\u2713"}</span>
                      <div>
                        <h3 className="br-commitment-title">Whole-Home Remodeling</h3>
                        <p className="br-commitment-body">Complete renovations that modernize older Mills River homes while maintaining the rural character that drew you to the area.</p>
                      </div>
                    </div>
                    <div className="br-commitment-item">
                      <span className="br-commitment-icon">{"\u2713"}</span>
                      <div>
                        <h3 className="br-commitment-title">ICF Construction</h3>
                        <p className="br-commitment-body">{"Insulated concrete form construction with a concrete core that adds thermal mass \u2014 which moderates the valley\u2019s temperature swings."}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="br-image-stack br-commitment-visuals">
                  <div className="br-frame br-frame-tall">
                    <Image src="/optimized/green-river/living-room-with-large-windows-and-forest-view.jpg" alt="Living room with forest views in Henderson County custom home" fill className="br-frame-image" sizes="(max-width: 768px) 100vw, 50vw" />
                  </div>
                  <div className="br-frame br-frame-wide">
                    <Image src="/optimized/green-river/modern-kitchen-with-island-and-wooden-cabinets.jpg" alt="Custom kitchen in Mills River area home" fill className="br-frame-image" sizes="(max-width: 768px) 100vw, 50vw" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="br-closing-sequence">
            <section className="br-section br-cta br-closing-cta">
              <div className="br-container">
                <h2 className="br-title br-title-center">Ready to Build in Mills River?</h2>
                <p className="br-lead br-cta-copy">{"Whether you have land along the French Broad or you\u2019re still looking, tell us about your project and we\u2019ll take it from there."}</p>
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
