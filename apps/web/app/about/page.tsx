import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Blue Ridge Homes | Brian Barrett, Owner & Builder",
  description:
    "Blue Ridge Homes is owned and operated by Brian Barrett, a licensed NC general contractor with over 30 years of building experience in Asheville and Western North Carolina. NC License #56328.",
};

export default function AboutPage() {
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
                    src="/optimized/dividers/divider-deck-view.jpg"
                    alt="Sunset over the Blue Ridge Mountains from a custom home deck"
                    fill
                    priority
                    className="br-hero-image"
                    sizes="(max-width: 768px) 100vw, 100vw"
                  />
                </div>
              </div>
              <div className="br-hero-overlay-gradient" />
              <div className="br-hero-copy">
                <h1 className="br-hero-title">About Blue Ridge Homes</h1>
                <p className="br-hero-subtitle">
                  {"Owner-built. Locally rooted. Over 30 years in the mountains."}
                </p>
              </div>
            </div>
          </section>

          {/* Brian's Story — photo left, text right */}
          <section className="br-section">
            <div className="br-container">
              <div className="br-grid-2 br-commitment-grid" style={{ alignItems: "start" }}>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <div style={{
                    width: 320,
                    height: 320,
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "4px solid var(--br-line)",
                    flexShrink: 0,
                  }}>
                    <Image
                      src="/brand/brian-barrett.jpg"
                      alt="Brian Barrett, owner of Blue Ridge Homes"
                      width={320}
                      height={320}
                      style={{ objectFit: "cover", width: "100%", height: "100%" }}
                    />
                  </div>
                </div>
                <div className="br-commitment-copy">
                  <h2 className="br-title">Meet Brian Barrett</h2>
                  <p className="br-lead">
                    {"Brian Barrett has been building homes for over 30 years. He founded Blue Ridge Homes in 2004 after spending years in residential construction across the Southeast, and has since built over a hundred homes in the mountains of Western North Carolina."}
                  </p>
                  <p className="br-lead">
                    {"Unlike most contractors, Brian is on every jobsite, every day. There is no project manager between you and the person responsible for your home. When you call Blue Ridge Homes, you talk to the builder \u2014 the same person who walks your foundation, checks your framing, and hands you the keys."}
                  </p>
                  <p className="br-lead">
                    {"That hands-on approach is why Blue Ridge Homes has maintained a spotless complaint record with the NC Licensing Board since 2004. NC General Contractor License #56328."}
                  </p>
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

          {/* What Sets Us Apart */}
          <section className="br-section br-section-alt br-commitment-section">
            <div className="br-container">
              <div className="br-grid-2 br-commitment-grid">
                <div className="br-commitment-copy">
                  <h2 className="br-title">What Sets Us Apart</h2>
                  <p className="br-lead">
                    {"We are not the biggest builder in Asheville and we do not try to be. We take on a limited number of projects at a time so that every home gets the attention it deserves. That means fewer surprises, tighter timelines, and a level of quality control that larger operations cannot match."}
                  </p>
                  <div className="br-commitment-list">
                    <div className="br-commitment-item">
                      <span className="br-commitment-icon">{"\u2713"}</span>
                      <div>
                        <h3 className="br-commitment-title">Owner on Every Jobsite</h3>
                        <p className="br-commitment-body">
                          {"Brian personally manages every project. No layers of project managers \u2014 the owner of the company is your daily point of contact."}
                        </p>
                      </div>
                    </div>
                    <div className="br-commitment-item">
                      <span className="br-commitment-icon">{"\u2713"}</span>
                      <div>
                        <h3 className="br-commitment-title">Zero Complaints Since 2004</h3>
                        <p className="br-commitment-body">
                          Over twenty years as a licensed NC general contractor with a spotless record. That comes from doing what we say we will do.
                        </p>
                      </div>
                    </div>
                    <div className="br-commitment-item">
                      <span className="br-commitment-icon">{"\u2713"}</span>
                      <div>
                        <h3 className="br-commitment-title">Mountain Building Expertise</h3>
                        <p className="br-commitment-body">
                          {"Steep grades, rocky soil, complex permitting, and weather exposure \u2014 we have been solving these problems for decades across Buncombe, Henderson, and Haywood counties."}
                        </p>
                      </div>
                    </div>
                    <div className="br-commitment-item">
                      <span className="br-commitment-icon">{"\u2713"}</span>
                      <div>
                        <h3 className="br-commitment-title">ICF Pioneers</h3>
                        <p className="br-commitment-body">
                          {"We have been building with insulated concrete forms since 2006 \u2014 one of the first residential builders in the Asheville area to adopt the system."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="br-image-stack br-commitment-visuals">
                  <div className="br-frame br-frame-tall">
                    <Image
                      src="/optimized/195-meadow-creek/living-room-with-stone-fireplace-and-large-windows.jpg"
                      alt="Living room with stone fireplace in Meadow Creek custom home"
                      fill
                      className="br-frame-image"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <div className="br-frame br-frame-wide">
                    <Image
                      src="/optimized/green-river/backyard-view-with-pond-and-forest.jpg"
                      alt="Backyard view with pond and forest at Green River home"
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

          {/* Where We Build */}
          <section className="br-section">
            <div className="br-container">
              <h2 className="br-title br-title-center">Where We Build</h2>
              <p className="br-lead" style={{ maxWidth: 820, margin: "0 auto", textAlign: "center" }}>
                {"Blue Ridge Homes serves Asheville and the surrounding mountain communities of Western North Carolina. Our primary service area covers Buncombe County, Henderson County, and Haywood County \u2014 from Weaverville and Black Mountain to Hendersonville, Brevard, Waynesville, and everywhere in between."}
              </p>
              <p className="br-lead" style={{ maxWidth: 820, margin: "16px auto 0", textAlign: "center" }}>
                {"If you have land in the mountains and a vision for your home, we would love to talk about what is possible."}
              </p>
            </div>
          </section>

          {/* CTA */}
          <div className="br-closing-sequence">
            <section className="br-section br-cta br-closing-cta">
              <div className="br-container">
                <h2 className="br-title br-title-center">
                  {"Let\u2019s Talk About Your Project"}
                </h2>
                <p className="br-lead br-cta-copy">
                  {"Whether you are ready to build or just starting to explore what is possible, we are happy to talk it through."}
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
