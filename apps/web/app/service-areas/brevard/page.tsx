import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Custom Home Builder in Brevard, NC | Blue Ridge Homes",
  description: "Blue Ridge Homes builds custom homes and manages remodeling projects in Brevard and Transylvania County, NC. 30+ years experience. NC License #56328.",
  alternates: { canonical: "https://brhomesnc.com/service-areas/brevard" },
};

export default function BrevardPage() {
  return (
    <main className="br-page">
      <div className="br-shell br-marble">
        <div className="br-content">

          <section className="br-hero-wrap">
            <div className="br-hero-full">
              <div className="br-hero-media">
                <div className="br-hero-image-wrap">
                  <Image src="/optimized/breezeway/modern-house-with-wood-and-blue-exterior.jpg" alt="Modern custom home built by Blue Ridge Homes" fill priority className="br-hero-image" sizes="100vw" />
                </div>
              </div>
              <div className="br-hero-overlay-gradient" />
              <div className="br-hero-copy">
                <h1 className="br-hero-title">Custom Home Builder<br />in Brevard, NC</h1>
                <p className="br-hero-subtitle">{"Custom homes and remodeling in Transylvania County \u2014 the Land of Waterfalls."}</p>
                <div className="br-button-row">
                  <Link href="/contact" className="br-button br-button-primary">{"Start Your Project \u2192"}</Link>
                </div>
              </div>
            </div>
          </section>

          <section className="br-section">
            <div className="br-container">
              <h2 className="br-title br-title-center">Building in Transylvania County</h2>
              <p className="br-lead" style={{ maxWidth: 820, margin: "0 auto", textAlign: "center" }}>
                {"Brevard and the surrounding Transylvania County communities are known for their natural beauty, outdoor recreation, and a growing population of families and retirees drawn to the area\u2019s quality of life. Building here means working with mountain terrain, seasonal weather, and the unique permitting requirements of Transylvania County. Blue Ridge Homes brings decades of mountain building experience to every project \u2014 from Connestee Falls and Sherwood Forest to Cedar Mountain and the French Broad valley."}
              </p>
            </div>
          </section>

          <div className="br-divider-strip">
            <img src="/optimized/dividers/divider-asheville.jpg" alt="Mountain waterfall scenery near Brevard NC" />
          </div>

          <section className="br-section br-section-alt br-commitment-section">
            <div className="br-container">
              <div className="br-grid-2 br-commitment-grid">
                <div className="br-commitment-copy">
                  <h2 className="br-title">Services in Brevard</h2>
                  <p className="br-lead">
                    {"Whether you\u2019re building a retirement home, a family retreat, or renovating an existing property, we deliver the same quality and attention on every Transylvania County project."}
                  </p>
                  <div className="br-commitment-list">
                    <div className="br-commitment-item">
                      <span className="br-commitment-icon">{"\u2713"}</span>
                      <div>
                        <h3 className="br-commitment-title">Custom Homes</h3>
                        <p className="br-commitment-body">New construction on mountain lots with full site management, from grading and foundation through finish carpentry.</p>
                      </div>
                    </div>
                    <div className="br-commitment-item">
                      <span className="br-commitment-icon">{"\u2713"}</span>
                      <div>
                        <h3 className="br-commitment-title">Remodeling &amp; Additions</h3>
                        <p className="br-commitment-body">Kitchen and bath renovations, room additions, and whole-home remodels for Brevard and Transylvania County properties.</p>
                      </div>
                    </div>
                    <div className="br-commitment-item">
                      <span className="br-commitment-icon">{"\u2713"}</span>
                      <div>
                        <h3 className="br-commitment-title">Weather-Resilient Construction</h3>
                        <p className="br-commitment-body">{"ICF and conventional builds engineered for Transylvania County\u2019s high rainfall and mountain weather patterns."}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="br-image-stack br-commitment-visuals">
                  <div className="br-frame br-frame-tall">
                    <Image src="/optimized/breezeway/bright-living-room-with-modern-furniture-and-large-windows.jpg" alt="Modern living room with mountain views" fill className="br-frame-image" sizes="(max-width: 768px) 100vw, 50vw" />
                  </div>
                  <div className="br-frame br-frame-wide">
                    <Image src="/optimized/breezeway/contemporary-kitchen-with-stainless-steel-appliances.jpg" alt="Contemporary kitchen in custom mountain home" fill className="br-frame-image" sizes="(max-width: 768px) 100vw, 50vw" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="br-closing-sequence">
            <section className="br-section br-cta br-closing-cta">
              <div className="br-container">
                <h2 className="br-title br-title-center">Ready to Build in Brevard?</h2>
                <p className="br-lead br-cta-copy">{"Tell us about your Transylvania County project. We\u2019d love to help you build something enduring."}</p>
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
