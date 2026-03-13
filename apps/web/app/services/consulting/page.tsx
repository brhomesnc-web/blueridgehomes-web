import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Construction Consulting in Asheville, NC | Blue Ridge Homes",
  description:
    "Blue Ridge Homes offers construction consulting for homeowners, buyers, and investors in Asheville and Western NC. Site evaluation, project feasibility, builder oversight, and inspection guidance. NC License #56328.",
};

export default function ConsultingPage() {
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
                    src="/optimized/crown-point/scenic-mountain-view-from-a-stone-patio.jpg"
                    alt="Mountain view from stone patio overlooking Western North Carolina"
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
                  Construction Consulting
                  <br />
                  in Asheville, NC
                </h1>
                <p className="br-hero-subtitle">
                  {"30 years of building experience, available by the hour \u2014 before you buy, build, or hire."}
                </p>
                <div className="br-button-row">
                  <Link href="/contact" className="br-button br-button-primary">
                    {"Schedule a Consultation \u2192"}
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Intro */}
          <section className="br-section">
            <div className="br-container">
              <h2 className="br-title br-title-center">
                Expert Guidance Before You Commit
              </h2>
              <p className="br-lead" style={{ maxWidth: 820, margin: "0 auto", textAlign: "center" }}>
                {"Not every project needs a general contractor from day one. Sometimes you need an experienced builder to walk a property with you, review a set of plans, or tell you what a realistic budget looks like before you sign anything. That is what our consulting service is for \u2014 honest, practical advice from someone who has built over a hundred homes in these mountains."}
              </p>
            </div>
          </section>

          {/* Section 1: What We Consult On */}
          <section className="br-section br-section-alt br-commitment-section">
            <div className="br-container">
              <div className="br-grid-2 br-commitment-grid">
                <div className="br-commitment-copy">
                  <h2 className="br-title">What We Can Help With</h2>
                  <p className="br-lead">
                    {"Whether you are evaluating a property, reviewing bids from other builders, or trying to figure out if a renovation is worth the investment, we can give you a clear-eyed assessment based on decades of local experience."}
                  </p>
                  <div className="br-commitment-list">
                    <div className="br-commitment-item">
                      <span className="br-commitment-icon">{"\u2713"}</span>
                      <div>
                        <h3 className="br-commitment-title">Site and Land Evaluation</h3>
                        <p className="br-commitment-body">
                          {"Assessing buildability, access, grading costs, septic feasibility, and utility availability before you buy a lot."}
                        </p>
                      </div>
                    </div>
                    <div className="br-commitment-item">
                      <span className="br-commitment-icon">{"\u2713"}</span>
                      <div>
                        <h3 className="br-commitment-title">Budget and Feasibility Review</h3>
                        <p className="br-commitment-body">
                          {"Reviewing plans, specs, or contractor bids to identify missing costs, unrealistic allowances, or scope gaps before you commit."}
                        </p>
                      </div>
                    </div>
                    <div className="br-commitment-item">
                      <span className="br-commitment-icon">{"\u2713"}</span>
                      <div>
                        <h3 className="br-commitment-title">Pre-Purchase Inspections</h3>
                        <p className="br-commitment-body">
                          {"Walking a property with you to identify structural concerns, deferred maintenance, and renovation potential that a standard home inspection might miss."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="br-image-stack br-commitment-visuals">
                  <div className="br-frame br-frame-tall">
                    <Image
                      src="/optimized/195-meadow-creek/house-with-stone-facade-and-small-porch.jpg"
                      alt="Custom home with stone facade in Weaverville NC"
                      fill
                      className="br-frame-image"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <div className="br-frame br-frame-wide">
                    <Image
                      src="/optimized/90-covey-dr/stone-exterior-house-with-gabled-roof.jpg"
                      alt="Stone exterior home with gabled roof in Weaverville"
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

          {/* Section 2: Why It Matters */}
          <section className="br-section br-commitment-section">
            <div className="br-container">
              <div className="br-grid-2 br-commitment-grid" style={{ direction: "rtl" }}>
                <div style={{ direction: "ltr" }} className="br-commitment-copy">
                  <h2 className="br-title">Mountain Building Is Different</h2>
                  <p className="br-lead">
                    {"Building in Western North Carolina is not the same as building on flat land in a planned subdivision. Steep grades, rocky soil, long driveways, well and septic requirements, and weather exposure all add cost and complexity that do not show up in standard construction estimates."}
                  </p>
                  <p className="br-lead">
                    {"We have seen buyers close on mountain lots that turned out to cost more to develop than the land itself. We have seen homeowners accept bids that left out tens of thousands in site work. A two-hour consultation can save you from a six-figure mistake."}
                  </p>
                  <p className="br-lead">
                    {"Brian has personally managed builds across Buncombe, Henderson, and Haywood counties. He knows the local inspectors, the permitting processes, and the soil conditions that vary from one ridge to the next."}
                  </p>
                </div>
                <div style={{ direction: "ltr" }} className="br-image-stack br-commitment-visuals">
                  <div className="br-frame br-frame-tall">
                    <Image
                      src="/optimized/660-settlers-cove/charming-house-with-stone-facade-and-lush-trees.webp"
                      alt="Custom home with stone facade surrounded by mature trees"
                      fill
                      className="br-frame-image"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <div className="br-frame br-frame-wide">
                    <Image
                      src="/optimized/845-settlers-cove/rustic-home-with-stone-facade-and-landscaped-yard.webp"
                      alt="Rustic mountain home with stone facade and landscaped yard"
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

          {/* Section 3: How It Works */}
          <section className="br-section br-section-alt br-commitment-section">
            <div className="br-container">
              <div className="br-grid-2 br-commitment-grid">
                <div className="br-commitment-copy">
                  <h2 className="br-title">How Consulting Works</h2>
                  <p className="br-lead">
                    {"Our consulting is straightforward. You tell us what you are trying to figure out, we meet on site or review your documents, and we give you a direct assessment. No sales pitch, no obligation to hire us for the build."}
                  </p>
                  <div className="br-commitment-list">
                    <div className="br-commitment-item">
                      <span className="br-commitment-icon">{"\u2713"}</span>
                      <div>
                        <h3 className="br-commitment-title">On-Site Consultations</h3>
                        <p className="br-commitment-body">
                          We meet you at the property, walk the site, and discuss what is realistic for your goals and budget.
                        </p>
                      </div>
                    </div>
                    <div className="br-commitment-item">
                      <span className="br-commitment-icon">{"\u2713"}</span>
                      <div>
                        <h3 className="br-commitment-title">Plan and Bid Reviews</h3>
                        <p className="br-commitment-body">
                          {"We review construction documents and contractor proposals to identify gaps, missing scope, and unrealistic pricing."}
                        </p>
                      </div>
                    </div>
                    <div className="br-commitment-item">
                      <span className="br-commitment-icon">{"\u2713"}</span>
                      <div>
                        <h3 className="br-commitment-title">No Obligation</h3>
                        <p className="br-commitment-body">
                          {"Consulting is a standalone service. You are paying for expertise and honest answers \u2014 not a pitch to hire us for the project."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="br-image-stack br-commitment-visuals">
                  <div className="br-frame br-frame-tall">
                    <Image
                      src="/optimized/green-river/house-with-trees-and-stone-accents.jpg"
                      alt="Custom home with stone accents nestled in trees"
                      fill
                      className="br-frame-image"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <div className="br-frame br-frame-wide">
                    <Image
                      src="/optimized/195-meadow-creek/exterior-view-of-a-cozy-house-with-a-porch.jpg"
                      alt="Cozy mountain home with covered porch in Weaverville NC"
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
                  Have a Question About Your Project?
                </h2>
                <p className="br-lead br-cta-copy">
                  {"Whether you are buying land, planning a build, or evaluating a contractor\u2019s bid, we are happy to talk it through."}
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
