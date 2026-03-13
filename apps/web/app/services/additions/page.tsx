import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Home Additions in Asheville, NC | Blue Ridge Homes",
  description:
    "Blue Ridge Homes builds home additions across Asheville and Western NC. Porches, sunrooms, garages, second stories, and in-law suites. NC License #56328.",
};

export default function AdditionsPage() {
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
                    src="/optimized/robin-porch/cozy-screened-porch-with-wooded-view.jpg"
                    alt="Screened porch addition with wooded mountain view by Blue Ridge Homes"
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
                  Home Additions
                  <br />
                  in Asheville, NC
                </h1>
                <p className="br-hero-subtitle">
                  {"More space, same home \u2014 built to match your existing structure inside and out."}
                </p>
                <div className="br-button-row">
                  <Link href="/contact" className="br-button br-button-primary">
                    {"Plan Your Addition \u2192"}
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Intro */}
          <section className="br-section">
            <div className="br-container">
              <h2 className="br-title br-title-center">
                Adding Space Without Starting Over
              </h2>
              <p className="br-lead" style={{ maxWidth: 820, margin: "0 auto", textAlign: "center" }}>
                {"Sometimes your home has the right location and the right bones, but not enough room. An addition lets you expand without giving up the property, the neighborhood, or the equity you have already built. At Blue Ridge Homes, we tie new construction into existing structures so the result looks and feels like it was always part of the house."}
              </p>
            </div>
          </section>

          {/* Section 1: What We Add */}
          <section className="br-section br-section-alt br-commitment-section">
            <div className="br-container">
              <div className="br-grid-2 br-commitment-grid">
                <div className="br-commitment-copy">
                  <h2 className="br-title">What We Add</h2>
                  <p className="br-lead">
                    {"Whether you need a screened porch for mountain evenings, a garage with a bonus room above, or an entirely new wing, we handle the full scope \u2014 foundation, framing, roofline integration, and finish work."}
                  </p>
                  <div className="br-commitment-list">
                    <div className="br-commitment-item">
                      <span className="br-commitment-icon">{"\u2713"}</span>
                      <div>
                        <h3 className="br-commitment-title">Porches and Sunrooms</h3>
                        <p className="br-commitment-body">
                          Screened porches, covered decks, and three-season rooms that extend your living space into the mountain air.
                        </p>
                      </div>
                    </div>
                    <div className="br-commitment-item">
                      <span className="br-commitment-icon">{"\u2713"}</span>
                      <div>
                        <h3 className="br-commitment-title">Garages and Workshops</h3>
                        <p className="br-commitment-body">
                          {"Attached or detached garages with optional finished space above \u2014 built to match the existing home\u2019s style."}
                        </p>
                      </div>
                    </div>
                    <div className="br-commitment-item">
                      <span className="br-commitment-icon">{"\u2713"}</span>
                      <div>
                        <h3 className="br-commitment-title">In-Law Suites and New Wings</h3>
                        <p className="br-commitment-body">
                          {"Full living spaces with bedrooms, bathrooms, and kitchenettes \u2014 designed for privacy while staying connected to the main house."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="br-image-stack br-commitment-visuals">
                  <div className="br-frame br-frame-tall">
                    <Image
                      src="/optimized/robin-porch/cozy-porch-with-ceiling-fan-and-wooded-view.jpg"
                      alt="Covered porch addition with ceiling fan and mountain view"
                      fill
                      className="br-frame-image"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <div className="br-frame br-frame-wide">
                    <Image
                      src="/optimized/robin-porch/cozy-porch-with-wicker-chair-and-outdoor-deck.jpg"
                      alt="Screened porch with wicker furniture overlooking wooded lot"
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
              src="/optimized/dividers/divider-creek-falls.jpg"
              alt="Mountain creek waterfall in Western North Carolina"
            />
          </div>

          {/* Section 2: The Hard Part */}
          <section className="br-section br-commitment-section">
            <div className="br-container">
              <div className="br-grid-2 br-commitment-grid" style={{ direction: "rtl" }}>
                <div style={{ direction: "ltr" }} className="br-commitment-copy">
                  <h2 className="br-title">The Hard Part Is Where It Meets</h2>
                  <p className="br-lead">
                    {"Anyone can frame a new room. The challenge is tying it into an existing structure so the rooflines align, the foundation settles evenly, and the siding matches. That transition is where most additions fail \u2014 and where experience matters most."}
                  </p>
                  <p className="br-lead">
                    {"We match existing roof pitches, siding profiles, and trim details so the addition reads as original construction. On mountain lots, that also means dealing with grade changes, drainage, and foundation types that vary from one side of the house to the other."}
                  </p>
                  <p className="br-lead">
                    {"Brian evaluates every addition project on site before pricing. That walk-through catches the structural and grading issues that determine whether a project is straightforward or complex."}
                  </p>
                </div>
                <div style={{ direction: "ltr" }} className="br-image-stack br-commitment-visuals">
                  <div className="br-frame br-frame-tall">
                    <Image
                      src="/optimized/280-settlers-cove/deck-with-railing-and-screened-porch-surrounded-by-trees.jpg"
                      alt="Deck and screened porch addition surrounded by trees"
                      fill
                      className="br-frame-image"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <div className="br-frame br-frame-wide">
                    <Image
                      src="/optimized/280-settlers-cove/screened-porch-with-wooden-deck-and-ceiling-fan.jpg"
                      alt="Screened porch with wooden deck and ceiling fan"
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
              src="/optimized/dividers/divider-deck-view.jpg"
              alt="Sunset view from Town Mountain overlooking the Blue Ridge"
            />
          </div>

          {/* Section 3: Built to Code */}
          <section className="br-section br-section-alt br-commitment-section">
            <div className="br-container">
              <div className="br-grid-2 br-commitment-grid">
                <div className="br-commitment-copy">
                  <h2 className="br-title">Permitted, Inspected, Built Right</h2>
                  <p className="br-lead">
                    {"Every addition we build is fully permitted and inspected through the local jurisdiction. We handle the permit applications, coordinate inspections, and make sure the work meets current building code \u2014 even when the original house does not."}
                  </p>
                  <div className="br-commitment-list">
                    <div className="br-commitment-item">
                      <span className="br-commitment-icon">{"\u2713"}</span>
                      <div>
                        <h3 className="br-commitment-title">Structural Integration</h3>
                        <p className="br-commitment-body">
                          New foundations tied to existing, load paths verified, and framing connections engineered for the long term.
                        </p>
                      </div>
                    </div>
                    <div className="br-commitment-item">
                      <span className="br-commitment-icon">{"\u2713"}</span>
                      <div>
                        <h3 className="br-commitment-title">Matched Finishes</h3>
                        <p className="br-commitment-body">
                          {"Siding, roofing, trim, and paint matched to the existing home so the addition looks original \u2014 not bolted on."}
                        </p>
                      </div>
                    </div>
                    <div className="br-commitment-item">
                      <span className="br-commitment-icon">{"\u2713"}</span>
                      <div>
                        <h3 className="br-commitment-title">Mountain-Ready</h3>
                        <p className="br-commitment-body">
                          {"Grading, drainage, and foundation design that accounts for the slope, soil, and weather exposure of your specific site."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="br-image-stack br-commitment-visuals">
                  <div className="br-frame br-frame-tall">
                    <Image
                      src="/optimized/280-settlers-cove/gray-house-with-gabled-roof-and-lush-greenery.webp"
                      alt="Home with gabled roof addition in Settlers Cove"
                      fill
                      className="br-frame-image"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <div className="br-frame br-frame-wide">
                    <Image
                      src="/optimized/280-settlers-cove/screened-porch-with-wooden-flooring-and-ceiling-fan.jpg"
                      alt="Finished screened porch with wood flooring and ceiling fan"
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
                  Ready to Add On?
                </h2>
                <p className="br-lead br-cta-copy">
                  {"Tell us what your home is missing and we will walk through what is possible \u2014 structurally, visually, and within your budget."}
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
