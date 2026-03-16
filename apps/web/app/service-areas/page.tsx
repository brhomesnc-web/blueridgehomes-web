import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Service Areas | Blue Ridge Homes – Custom Homes & Remodeling in Western NC",
  description: "Blue Ridge Homes serves Asheville, Weaverville, Hendersonville, Black Mountain, Mills River, and Brevard. Custom homes, remodeling, and additions across Western North Carolina.",
};

const areas = [
  { slug: "weaverville", name: "Weaverville", county: "Buncombe County", image: "/optimized/195-meadow-creek/front-exterior-meadow-creek.jpg" },
  { slug: "hendersonville", name: "Hendersonville", county: "Henderson County", image: "/optimized/green-river/stone-accented-house-with-trees-and-landscaping.jpg" },
  { slug: "black-mountain", name: "Black Mountain", county: "Buncombe County", image: "/optimized/280-settlers-cove/gray-house-with-gabled-roof-and-lush-greenery.webp" },
  { slug: "mills-river", name: "Mills River", county: "Henderson County", image: "/optimized/green-river/modern-house-with-trees-and-stone-path.jpg" },
  { slug: "brevard", name: "Brevard", county: "Transylvania County", image: "/optimized/90-covey-dr/two-story-house-with-stone-facade-and-driveway.jpg" },
];

export default function ServiceAreasPage() {
  return (
    <main className="br-page">
      <div className="br-shell br-marble">
        <div className="br-content">
          <section className="br-section">
            <div className="br-container">
              <h1 className="br-title br-title-center" style={{ marginBottom: 8 }}>Areas We Serve</h1>
              <p className="br-lead" style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
                Blue Ridge Homes builds custom homes and manages whole-home remodels across Western North Carolina. From downtown Asheville to the surrounding mountain communities, we bring the same hands-on craftsmanship wherever we build.
              </p>
            </div>
          </section>

          <section className="br-section" style={{ paddingTop: 0 }}>
            <div className="br-container">
              <div className="br-portfolio-grid">
                {areas.map((area) => (
                  <Link key={area.slug} href={`/service-areas/${area.slug}`} className="br-portfolio-card">
                    <div className="br-portfolio-card-image">
                      <Image
                        src={area.image}
                        alt={`Custom home builder in ${area.name}, NC`}
                        fill
                        sizes="(max-width: 640px) 100vw, 50vw"
                      />
                      <div className="br-portfolio-card-overlay">
                        <h2 className="br-portfolio-card-title">{area.name}</h2>
                        <div className="br-portfolio-card-meta">{area.county}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <div className="br-closing-sequence">
            <section className="br-section br-cta br-closing-cta">
              <div className="br-container">
                <h2 className="br-title br-title-center">Building Across Western North Carolina</h2>
                <p className="br-lead br-cta-copy">
                  {"Don\u2019t see your town listed? We build throughout Buncombe, Henderson, and Transylvania counties. Tell us where you\u2019re building."}
                </p>
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
