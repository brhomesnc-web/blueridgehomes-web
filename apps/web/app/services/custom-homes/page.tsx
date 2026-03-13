import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Custom Home Builder in Asheville, NC | Blue Ridge Homes",
  description:
    "Blue Ridge Homes builds custom homes in Asheville and Western North Carolina. 30+ years experience, NC License #56328, zero complaints since 2004.",
};

export default function CustomHomesPage() {
  return (
    <main className="br-page">
      <div className="br-shell br-marble">
        <div className="br-content">

          {/* Hero */}
          <section className="br-hero-wrap">
            <div className="br-hero-full">
              <div className="br-hero-media">
                <div className="br-hero-image-wrap">
                  <Image
                    src="/optimized/green-river/stone-accented-house-with-trees-and-landscaping.jpg"
                    alt="Custom home with stone accents built by Blue Ridge Homes in Henderson County NC"
                    fill
                    priority
                    className="br-hero-image"
                    sizes="(max-width: 768px) 100vw, 100vw"
                  />
                </div>
              </div>
              <div className="br-hero-overlay-gradient" />
              <div className="br-hero-copy">
                <h1 className="br-hero-title">
                  Custom Home Builder
                  <br />
                  in Asheville, NC
                </h1>
                <p className="br-hero-subtitle">
                  {"\u201CYour vision, our craftsmanship\u201D \u2014 from site selection through final walkthrough."}
                </p>
                <div className="br-button-row">
                  <Link href="/contact" className="br-button br-button-primary">
                    {"Start Your Custom Home \u2192"}
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Intro */}
          <section className="br-section">
            <div className="br-container">
              <h2 className="br-title br-title-center">
                Building Custom Homes Across Western North Carolina
              </h2>
              <p className="br-lead" style={{ maxWidth: 820, margin: "0 auto", textAlign: "center" }}>
                {"A custom home should reflect the way you actually live \u2014 not a floor plan designed for someone else. At Blue Ridge Homes, owner Brian Barrett has spent over 30 years helping families in Asheville and the surrounding mountain communities turn raw land into homes that fit their landscape, their lifestyle, and their long-term goals."}
              </p>
            </div>
          </section>

          {/* Section 1: Owner-Managed — text left, images right */}
          <section className="br-section br-section-alt br-commitment-section">
            <div className="br-container">
              <div className="br-grid-2 br-commitment-grid">
                <div className="br-commitment-copy">
                  <h2 className="br-title">Every Phase, One Point of Contact</h2>
                  <p className="br-lead">
                    {"We handle the entire build from start to finish. Site evaluation, permitting through Buncombe County, Henderson County, or the City of Asheville, subcontractor coordination, quality inspections at every stage, and regular walkthroughs to keep you informed."}
                  </p>
                  <div className="br-commitment-list">
                    <div className="br-commitment-item">
                      <span className="br-commitment-icon">{"\u2713"}</span>
                      <div>
                        <h3 className="br-commitment-title">Owner on Every Jobsite</h3>
                        <p className="br-commitment-body">
                          {"Brian personally oversees every project from foundation to final punch list. No project manager buffer \u2014 the owner of the company is on your jobsite."}
                        </p>
                      </div>
                    </div>
                    <div className="br-commitment-item">
                      <span className="br-commitment-icon">{"\u2713"}</span>
                      <div>
                        <h3 className="br-commitment-title">Zero Complaints Since 2004</h3>
                        <p className="br-commitment-body">
                          Licensed as NC General Contractor #56328 for over twenty years with a spotless record. That comes from setting realistic expectations and following through on every promise.
                        </p>
                      </div>
                    </div>
                    <div className="br-commitment-item">
                      <span className="br-commitment-icon">{"\u2713"}</span>
                      <div>
                        <h3 className="br-commitment-title">Fully Insured, Fully Vetted</h3>
                        <p className="br-commitment-body">
                          {"We require all subcontractors to carry liability and workers\u2019 comp insurance. We carry builder\u2019s risk insurance on every active jobsite."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="br-image-stack br-commitment-visuals">
                  <div className="br-frame br-frame-tall">
                    <Image
                      src="/optimized/green-river/modern-kitchen-with-island-and-wooden-cabinets.jpg"
                      alt="Custom kitchen with island and wooden cabinets in a Blue Ridge Homes build"
                      fill
                      className="br-frame-image"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <div className="br-frame br-frame-wide">
                    <Image
                      src="/optimized/green-river/living-room-with-large-windows-and-forest-view.jpg"
                      alt="Living room with floor-to-ceiling windows and forest view"
                      fill
                      className="br-frame-image"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Divider: Blue Ridge sunset */}
          <div className="br-divider-strip">
            <img
              src="/optimized/dividers/divider-blueridge-sunset.jpg"
              alt="Blue Ridge Mountains sunset over Western North Carolina"
            />
          </div>

          {/* Section 2: Mountain Living — images left, text right */}
          <section className="br-section br-commitment-section">
            <div className="br-container">
              <div className="br-grid-2 br-commitment-grid" style={{ direction: "rtl" }}>
                <div style={{ direction: "ltr" }} className="br-commitment-copy">
                  <h2 className="br-title">Built for Mountain Living</h2>
                  <p className="br-lead">
                    {"Western North Carolina is not flat suburban land. Mountain lots bring grading challenges, setback requirements, soil conditions, and weather exposure that require experience most builders simply do not have."}
                  </p>
                  <p className="br-lead">
                    {"With over 1,000 building inspections behind us, we understand what local inspectors expect and we build to exceed it. From modern mountain retreats and timber-and-stone family homes to energy-efficient ICF builds, every project is tailored to its site and its owners."}
                  </p>
                  <p className="br-lead">
                    Our service area covers Asheville and Buncombe County, Henderson County, and Haywood County. If you have land and a vision, we would love to talk about what is possible.
                  </p>
                </div>
                <div style={{ direction: "ltr" }} className="br-image-stack br-commitment-visuals">
                  <div className="br-frame br-frame-tall">
                    <Image
                      src="/optimized/195-meadow-creek/two-story-house-with-a-wraparound-porch.jpg"
                      alt="Two-story custom home with wraparound porch in Weaverville NC"
                      fill
                      className="br-frame-image"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <div className="br-frame br-frame-wide">
                    <Image
                      src="/optimized/breezeway/spacious-deck-with-modern-furniture-and-mountain-view.jpg"
                      alt="Spacious deck with mountain view on a Blue Ridge Homes build"
                      fill
                      className="br-frame-image"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Divider: Asheville skyline */}
          <div className="br-divider-strip">
            <img
              src="/optimized/dividers/divider-asheville.jpg"
              alt="Asheville NC skyline at sunset with Blue Ridge Mountains"
            />
          </div>

          {/* Section 3: What We Build — text left, images right */}
          <section className="br-section br-section-alt br-commitment-section">
            <div className="br-container">
              <div className="br-grid-2 br-commitment-grid">
                <div className="br-commitment-copy">
                  <h2 className="br-title">What We Build</h2>
                  <p className="br-lead">
                    {"Every home we build is different because every family is different. We\u2019ve built everything from compact mountain cottages to expansive estate homes \u2014 always with the same attention to detail and the same hands-on management."}
                  </p>
                  <div className="br-commitment-list">
                    <div className="br-commitment-item">
                      <span className="br-commitment-icon">{"\u2713"}</span>
                      <div>
                        <h3 className="br-commitment-title">Craftsman and Traditional</h3>
                        <p className="br-commitment-body">
                          Stone, timber, and covered porches that feel at home in the Blue Ridge Mountains.
                        </p>
                      </div>
                    </div>
                    <div className="br-commitment-item">
                      <span className="br-commitment-icon">{"\u2713"}</span>
                      <div>
                        <h3 className="br-commitment-title">Modern and Contemporary</h3>
                        <p className="br-commitment-body">
                          Clean lines, walls of glass, and open floor plans that bring the outdoors in.
                        </p>
                      </div>
                    </div>
                    <div className="br-commitment-item">
                      <span className="br-commitment-icon">{"\u2713"}</span>
                      <div>
                        <h3 className="br-commitment-title">ICF Construction</h3>
                        <p className="br-commitment-body">
                          {"Insulated concrete form builds for superior energy efficiency, strength, and comfort. We\u2019ve been building with ICF since 2006."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="br-image-stack br-commitment-visuals">
                  <div className="br-frame br-frame-tall">
                    <Image
                      src="/optimized/23-woodbine-rd/modern-kitchen-with-island-and-staircase.jpg"
                      alt="Modern kitchen with island and staircase in Asheville custom home"
                      fill
                      className="br-frame-image"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <div className="br-frame br-frame-wide">
                    <Image
                      src="/optimized/crown-point/open-kitchen-with-island-and-stone-fireplace.jpg"
                      alt="Open kitchen with stone fireplace in whole home remodel"
                      fill
                      className="br-frame-image"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <div className="br-closing-sequence">
            <section className="br-section br-cta br-closing-cta">
              <div className="br-container">
                <h2 className="br-title br-title-center">
                  Ready to Build Your Custom Home?
                </h2>
                <p className="br-lead br-cta-copy">
                  {"Tell us about your property, your timeline, and how you want your home to live. We\u2019ll take it from there."}
                </p>
                <div className="br-cta-actions">
                  <Link href="/contact" className="br-button br-button-primary">
                    {"Start the Conversation \u2192"}
                  </Link>
                  <a href="tel:18287122867" className="br-button br-button-secondary">
                    Call (828) 712-2867
                  </a>
                </div>
              </div>
            </section>
          </div>

        </div>
      </div>
    </main>
  );
}
