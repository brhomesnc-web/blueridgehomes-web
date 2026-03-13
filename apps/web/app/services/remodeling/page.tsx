import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Whole Home Remodeling in Asheville, NC | Blue Ridge Homes",
  description:
    "Blue Ridge Homes specializes in whole home remodeling across Asheville and Western NC. Kitchens, bathrooms, structural updates, and full renovations. NC License #56328.",
};

export default function RemodelingPage() {
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
                    src="/optimized/crown-point/open-kitchen-with-island-and-stone-fireplace.jpg"
                    alt="Whole home remodel with open concept kitchen and exposed beams by Blue Ridge Homes"
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
                  Whole Home Remodeling
                  <br />
                  in Asheville, NC
                </h1>
                <p className="br-hero-subtitle">
                  {"Not just cosmetic updates \u2014 full-scale renovations that transform how your home lives."}
                </p>
                <div className="br-button-row">
                  <Link href="/contact" className="br-button br-button-primary">
                    {"Plan Your Remodel \u2192"}
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Intro */}
          <section className="br-section">
            <div className="br-container">
              <h2 className="br-title br-title-center">
                Remodeling Done Right in Western North Carolina
              </h2>
              <p className="br-lead" style={{ maxWidth: 820, margin: "0 auto", textAlign: "center" }}>
                {"A good remodel is harder than a new build. You are working inside an existing structure with hidden conditions, load-bearing walls, outdated wiring, and decades of settling. It takes a builder who understands structure \u2014 not just finishes. At Blue Ridge Homes, we have been renovating mountain homes since 2004, and we bring the same hands-on management to every remodel that we bring to our custom builds."}
              </p>
            </div>
          </section>

          {/* Section 1: What We Handle */}
          <section className="br-section br-section-alt br-commitment-section">
            <div className="br-container">
              <div className="br-grid-2 br-commitment-grid">
                <div className="br-commitment-copy">
                  <h2 className="br-title">More Than a Surface Refresh</h2>
                  <p className="br-lead">
                    {"We handle renovations that go well beyond paint and countertops. If your project involves moving walls, updating electrical or plumbing, reinforcing structure, or reconfiguring layouts, that is where we do our best work."}
                  </p>
                  <div className="br-commitment-list">
                    <div className="br-commitment-item">
                      <span className="br-commitment-icon">{"\u2713"}</span>
                      <div>
                        <h3 className="br-commitment-title">Kitchen and Bath Renovations</h3>
                        <p className="br-commitment-body">
                          Complete gut-and-rebuild kitchen and bathroom remodels with custom cabinetry, tile, and fixtures.
                        </p>
                      </div>
                    </div>
                    <div className="br-commitment-item">
                      <span className="br-commitment-icon">{"\u2713"}</span>
                      <div>
                        <h3 className="br-commitment-title">Structural Modifications</h3>
                        <p className="br-commitment-body">
                          {"Removing load-bearing walls, adding support beams, reinforcing foundations, and opening up floor plans safely."}
                        </p>
                      </div>
                    </div>
                    <div className="br-commitment-item">
                      <span className="br-commitment-icon">{"\u2713"}</span>
                      <div>
                        <h3 className="br-commitment-title">Whole Home Transformations</h3>
                        <p className="br-commitment-body">
                          {"Full interior renovations that update layout, systems, and finishes throughout the entire home."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="br-image-stack br-commitment-visuals">
                  <div className="br-frame br-frame-tall">
                    <Image
                      src="/optimized/crown-point/modern-kitchen-with-large-island-and-pendant-lights.jpg"
                      alt="Remodeled kitchen with large island and pendant lighting"
                      fill
                      className="br-frame-image"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <div className="br-frame br-frame-wide">
                    <Image
                      src="/optimized/crown-point/elegant-bathroom-with-bathtub-and-glass-shower.jpg"
                      alt="Elegant remodeled bathroom with soaking tub and glass shower"
                      fill
                      className="br-frame-image"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Divider */}
          <div className="br-divider-strip">
            <img
              src="/optimized/dividers/divider-blueridge-sunset.jpg"
              alt="Blue Ridge Mountains sunset over Western North Carolina"
            />
          </div>

          {/* Section 2: Why It Matters */}
          <section className="br-section br-commitment-section">
            <div className="br-container">
              <div className="br-grid-2 br-commitment-grid" style={{ direction: "rtl" }}>
                <div style={{ direction: "ltr" }} className="br-commitment-copy">
                  <h2 className="br-title">Built by a Contractor, Not a Handyman</h2>
                  <p className="br-lead">
                    {"Remodeling in the mountains means dealing with older construction methods, balloon framing, stone foundations, and systems that were not built to modern code. We know what to look for before the first wall comes down."}
                  </p>
                  <p className="br-lead">
                    {"Brian personally walks every remodel project before we price it. That means fewer surprises, realistic timelines, and a scope of work that accounts for what is actually behind your walls \u2014 not just what is visible on the surface."}
                  </p>
                  <p className="br-lead">
                    {"Every subcontractor we bring in is licensed, insured, and has worked with us before. We do not experiment on your home."}
                  </p>
                </div>
                <div style={{ direction: "ltr" }} className="br-image-stack br-commitment-visuals">
                  <div className="br-frame br-frame-tall">
                    <Image
                      src="/optimized/preston-ct/contemporary-kitchen-with-island-and-pendant-lights.jpg"
                      alt="Contemporary kitchen remodel with island and pendant lights in Weaverville NC"
                      fill
                      className="br-frame-image"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <div className="br-frame br-frame-wide">
                    <Image
                      src="/optimized/preston-ct/stylish-dining-room-with-wooden-table-and-chandelier.jpg"
                      alt="Stylish dining room with custom chandelier in whole home remodel"
                      fill
                      className="br-frame-image"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Divider */}
          <div className="br-divider-strip">
            <img
              src="/optimized/dividers/divider-asheville.jpg"
              alt="Asheville NC skyline at sunset with Blue Ridge Mountains"
            />
          </div>

          {/* Section 3: The Details */}
          <section className="br-section br-section-alt br-commitment-section">
            <div className="br-container">
              <div className="br-grid-2 br-commitment-grid">
                <div className="br-commitment-copy">
                  <h2 className="br-title">The Details That Last</h2>
                  <p className="br-lead">
                    {"A remodel should feel like it was always part of the house. We match materials, align trim details, and build transitions so the new work blends with the existing structure \u2014 not fights against it."}
                  </p>
                  <div className="br-commitment-list">
                    <div className="br-commitment-item">
                      <span className="br-commitment-icon">{"\u2713"}</span>
                      <div>
                        <h3 className="br-commitment-title">Custom Millwork and Trim</h3>
                        <p className="br-commitment-body">
                          Matching existing profiles or designing new details that complement the original character of the home.
                        </p>
                      </div>
                    </div>
                    <div className="br-commitment-item">
                      <span className="br-commitment-icon">{"\u2713"}</span>
                      <div>
                        <h3 className="br-commitment-title">Updated Systems</h3>
                        <p className="br-commitment-body">
                          {"Electrical, plumbing, and HVAC brought to current code as part of the renovation \u2014 not left as a problem for later."}
                        </p>
                      </div>
                    </div>
                    <div className="br-commitment-item">
                      <span className="br-commitment-icon">{"\u2713"}</span>
                      <div>
                        <h3 className="br-commitment-title">Permitted and Inspected</h3>
                        <p className="br-commitment-body">
                          {"Every remodel is properly permitted through the local jurisdiction and inspected at every stage. No shortcuts."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="br-image-stack br-commitment-visuals">
                  <div className="br-frame br-frame-tall">
                    <Image
                      src="/optimized/preston-ct/elegant-home-bar-with-shelving-and-mini-fridge.jpg"
                      alt="Custom home bar with built-in shelving in Preston Court remodel"
                      fill
                      className="br-frame-image"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <div className="br-frame br-frame-wide">
                    <Image
                      src="/optimized/preston-ct/stylish-stairway-with-patterned-carpet.jpg"
                      alt="Refinished stairway with patterned runner in Preston Court remodel"
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
                  Ready to Remodel?
                </h2>
                <p className="br-lead br-cta-copy">
                  {"Tell us about your home, what is working and what is not, and we will walk through the options with you."}
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
