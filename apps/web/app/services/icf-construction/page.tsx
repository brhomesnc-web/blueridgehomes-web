import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ICF Construction in Asheville, NC | Blue Ridge Homes",
  description:
    "Blue Ridge Homes has been building with insulated concrete forms (ICF) since 2006. Stronger, quieter, more energy-efficient homes in Asheville and Western NC. NC License #56328.",
};

export default function ICFConstructionPage() {
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
                    src="/optimized/breezeway/modern-house-with-wood-and-blue-exterior.jpg"
                    alt="Modern ICF-built home with wood and blue exterior by Blue Ridge Homes"
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
                  ICF Construction
                  <br />
                  in Asheville, NC
                </h1>
                <p className="br-hero-subtitle">
                  {"Insulated concrete form homes \u2014 stronger, quieter, and more energy-efficient than conventional framing."}
                </p>
                <div className="br-button-row">
                  <Link href="/contact" className="br-button br-button-primary">
                    {"Learn About ICF \u2192"}
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Intro */}
          <section className="br-section">
            <div className="br-container">
              <h2 className="br-title br-title-center">
                Building Stronger Homes in Western North Carolina
              </h2>
              <p className="br-lead" style={{ maxWidth: 820, margin: "0 auto", textAlign: "center" }}>
                {"Insulated concrete forms create a continuous shell of reinforced concrete wrapped in rigid foam insulation. The result is a home that uses significantly less energy, resists severe weather, and stays remarkably quiet. Blue Ridge Homes has been building with ICF since 2006 \u2014 we were one of the first residential builders in the Asheville area to adopt the system."}
              </p>
            </div>
          </section>

          {/* Section 1: What Is ICF */}
          <section className="br-section br-section-alt br-commitment-section">
            <div className="br-container">
              <div className="br-grid-2 br-commitment-grid">
                <div className="br-commitment-copy">
                  <h2 className="br-title">How ICF Works</h2>
                  <p className="br-lead">
                    {"ICF walls are built by stacking hollow foam blocks, reinforcing them with steel rebar, and filling the cores with concrete. Once cured, you have a solid concrete wall with built-in insulation on both sides \u2014 no separate framing, no fiberglass batts, no gaps."}
                  </p>
                  <div className="br-commitment-list">
                    <div className="br-commitment-item">
                      <span className="br-commitment-icon">{"\u2713"}</span>
                      <div>
                        <h3 className="br-commitment-title">Continuous Insulation</h3>
                        <p className="br-commitment-body">
                          No thermal bridging from studs. The foam-concrete-foam sandwich eliminates the weak points found in conventional framing.
                        </p>
                      </div>
                    </div>
                    <div className="br-commitment-item">
                      <span className="br-commitment-icon">{"\u2713"}</span>
                      <div>
                        <h3 className="br-commitment-title">Reinforced Concrete Core</h3>
                        <p className="br-commitment-body">
                          {"Steel-reinforced concrete walls rated for wind speeds well above what Western North Carolina requires \u2014 built to last generations."}
                        </p>
                      </div>
                    </div>
                    <div className="br-commitment-item">
                      <span className="br-commitment-icon">{"\u2713"}</span>
                      <div>
                        <h3 className="br-commitment-title">Any Exterior Finish</h3>
                        <p className="br-commitment-body">
                          ICF accepts stone, siding, stucco, and brick. From the outside, an ICF home looks like any other custom build.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="br-image-stack br-commitment-visuals">
                  <div className="br-frame br-frame-tall">
                    <Image
                      src="/optimized/icf/construction-site-with-white-foundation-blocks.jpg"
                      alt="ICF foundation blocks stacked and ready for concrete pour"
                      fill
                      className="br-frame-image"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <div className="br-frame br-frame-wide">
                    <Image
                      src="/optimized/icf/construction-site-with-insulated-forms.jpg"
                      alt="ICF wall construction with insulated forms and rebar"
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
              src="/optimized/dividers/divider-turtleback-falls.jpg"
              alt="Turtleback Falls in Western North Carolina"
            />
          </div>

          {/* Section 2: Why ICF */}
          <section className="br-section br-commitment-section">
            <div className="br-container">
              <div className="br-grid-2 br-commitment-grid" style={{ direction: "rtl" }}>
                <div style={{ direction: "ltr" }} className="br-commitment-copy">
                  <h2 className="br-title">Why Build With ICF</h2>
                  <p className="br-lead">
                    {"Homeowners who choose ICF are usually thinking long term. They want lower energy bills, a home that can handle severe weather, and walls that block outside noise almost entirely. In the mountains, where temperatures swing and storms hit hard, those advantages compound."}
                  </p>
                  <p className="br-lead">
                    {"ICF homes typically use 40 to 60 percent less energy for heating and cooling compared to conventional wood-frame construction. The concrete mass also moderates temperature swings, so your HVAC system runs less and lasts longer."}
                  </p>
                  <p className="br-lead">
                    {"We have built ICF homes from full basement foundations to entire above-grade wall systems. Whether you want the full envelope or just a concrete-core first floor, we can design the approach that fits your site and your budget."}
                  </p>
                </div>
                <div style={{ direction: "ltr" }} className="br-image-stack br-commitment-visuals">
                  <div className="br-frame br-frame-tall">
                    <Image
                      src="/optimized/icf/foundation-construction-with-workers-on-site.jpg"
                      alt="ICF foundation construction with crew on site"
                      fill
                      className="br-frame-image"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <div className="br-frame br-frame-wide">
                    <Image
                      src="/optimized/icf/close-up-of-interlocking-construction-blocks.jpg"
                      alt="Close-up of interlocking ICF blocks before concrete pour"
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

          {/* Section 3: The Finished Product */}
          <section className="br-section br-section-alt br-commitment-section">
            <div className="br-container">
              <div className="br-grid-2 br-commitment-grid">
                <div className="br-commitment-copy">
                  <h2 className="br-title">The Finished Product</h2>
                  <p className="br-lead">
                    {"From the inside, an ICF home feels different before you know why. The walls are solid and quiet. There are no drafts. The temperature stays even from room to room. Visitors notice it immediately \u2014 they just cannot always put their finger on what is different."}
                  </p>
                  <div className="br-commitment-list">
                    <div className="br-commitment-item">
                      <span className="br-commitment-icon">{"\u2713"}</span>
                      <div>
                        <h3 className="br-commitment-title">Energy Savings</h3>
                        <p className="br-commitment-body">
                          40 to 60 percent reduction in heating and cooling costs compared to conventional wood-frame construction.
                        </p>
                      </div>
                    </div>
                    <div className="br-commitment-item">
                      <span className="br-commitment-icon">{"\u2713"}</span>
                      <div>
                        <h3 className="br-commitment-title">Sound Reduction</h3>
                        <p className="br-commitment-body">
                          {"Concrete walls block outside noise far more effectively than wood framing \u2014 ideal for properties near roads or in exposed locations."}
                        </p>
                      </div>
                    </div>
                    <div className="br-commitment-item">
                      <span className="br-commitment-icon">{"\u2713"}</span>
                      <div>
                        <h3 className="br-commitment-title">Storm and Fire Resistance</h3>
                        <p className="br-commitment-body">
                          {"Reinforced concrete walls rated for extreme wind and fire exposure. ICF homes have survived hurricanes and wildfires that destroyed neighboring wood-frame structures."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="br-image-stack br-commitment-visuals">
                  <div className="br-frame br-frame-tall">
                    <Image
                      src="/optimized/green-river/living-room-with-large-windows-and-forest-view.jpg"
                      alt="Living room with floor-to-ceiling windows in ICF-built Green River home"
                      fill
                      className="br-frame-image"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <div className="br-frame br-frame-wide">
                    <Image
                      src="/optimized/green-river/stone-accented-house-with-trees-and-landscaping.jpg"
                      alt="Finished ICF home with stone accents in Green River NC"
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
                  Interested in ICF?
                </h2>
                <p className="br-lead br-cta-copy">
                  {"Whether you are comparing wall systems or ready to build, we are happy to walk you through what ICF can do for your project."}
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
