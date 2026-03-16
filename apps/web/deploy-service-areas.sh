#!/bin/bash
set -e
cd /var/www/brhomes/apps/web

echo "=== Creating service area pages ==="

# --- Service Areas index page ---
mkdir -p app/service-areas
cat > app/service-areas/page.tsx << 'INDEXPAGE'
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
INDEXPAGE

# ============================
# WEAVERVILLE
# ============================
mkdir -p app/service-areas/weaverville
cat > app/service-areas/weaverville/page.tsx << 'WEAVERVILLE'
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Custom Home Builder in Weaverville, NC | Blue Ridge Homes",
  description: "Blue Ridge Homes builds custom homes and manages remodeling projects in Weaverville, NC. 30+ years experience in Buncombe County. NC License #56328.",
  alternates: { canonical: "https://brhomesnc.com/service-areas/weaverville" },
};

export default function WeavervillePage() {
  return (
    <main className="br-page">
      <div className="br-shell br-marble">
        <div className="br-content">

          <section className="br-hero-wrap">
            <div className="br-hero-full">
              <div className="br-hero-media">
                <div className="br-hero-image-wrap">
                  <Image src="/optimized/195-meadow-creek/front-exterior-meadow-creek.jpg" alt="Custom home built by Blue Ridge Homes in Weaverville NC" fill priority className="br-hero-image" sizes="100vw" />
                </div>
              </div>
              <div className="br-hero-overlay-gradient" />
              <div className="br-hero-copy">
                <h1 className="br-hero-title">Custom Home Builder<br />in Weaverville, NC</h1>
                <p className="br-hero-subtitle">Building quality homes in the Reems Creek Valley and North Buncombe communities since 2004.</p>
                <div className="br-button-row">
                  <Link href="/contact" className="br-button br-button-primary">{"Start Your Project \u2192"}</Link>
                </div>
              </div>
            </div>
          </section>

          <section className="br-section">
            <div className="br-container">
              <h2 className="br-title br-title-center">Your Weaverville Home Builder</h2>
              <p className="br-lead" style={{ maxWidth: 820, margin: "0 auto", textAlign: "center" }}>
                {"Weaverville\u2019s mix of established neighborhoods, mountain-view lots, and new developments makes it one of the most sought-after communities in Buncombe County. Blue Ridge Homes has built extensively throughout the area \u2014 from Settlers Cove and Reems Creek to Ox Creek Road and the communities along Highway 19/23. We understand the terrain, the local permitting process, and what it takes to build a home that belongs in these mountains."}
              </p>
            </div>
          </section>

          <div className="br-divider-strip">
            <img src="/optimized/dividers/divider-asheville.jpg" alt="Blue Ridge Mountains near Weaverville NC" />
          </div>

          <section className="br-section br-section-alt br-commitment-section">
            <div className="br-container">
              <div className="br-grid-2 br-commitment-grid">
                <div className="br-commitment-copy">
                  <h2 className="br-title">What We Build in Weaverville</h2>
                  <p className="br-lead">
                    {"Whether you\u2019re building on a sloped lot off Reems Creek or remodeling a home in an established neighborhood, we bring the same hands-on approach to every project."}
                  </p>
                  <div className="br-commitment-list">
                    <div className="br-commitment-item">
                      <span className="br-commitment-icon">{"\u2713"}</span>
                      <div>
                        <h3 className="br-commitment-title">Custom Homes</h3>
                        <p className="br-commitment-body">New construction on your lot, from foundation to final walkthrough. We handle site prep, grading, and construction management.</p>
                      </div>
                    </div>
                    <div className="br-commitment-item">
                      <span className="br-commitment-icon">{"\u2713"}</span>
                      <div>
                        <h3 className="br-commitment-title">Whole-Home Remodeling</h3>
                        <p className="br-commitment-body">Complete interior renovations, kitchen and bath remodels, and structural modifications for Weaverville homes.</p>
                      </div>
                    </div>
                    <div className="br-commitment-item">
                      <span className="br-commitment-icon">{"\u2713"}</span>
                      <div>
                        <h3 className="br-commitment-title">Additions &amp; Expansions</h3>
                        <p className="br-commitment-body">Room additions, screened porches, and garage builds that integrate seamlessly with your existing home.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="br-image-stack br-commitment-visuals">
                  <div className="br-frame br-frame-tall">
                    <Image src="/optimized/90-covey-dr/two-story-house-with-stone-facade-and-driveway.jpg" alt="Custom home at 90 Covey Drive in Weaverville NC" fill className="br-frame-image" sizes="(max-width: 768px) 100vw, 50vw" />
                  </div>
                  <div className="br-frame br-frame-wide">
                    <Image src="/optimized/660-settlers-cove/spacious-kitchen-with-wooden-cabinets-and-island.webp" alt="Custom kitchen in Settlers Cove Weaverville" fill className="br-frame-image" sizes="(max-width: 768px) 100vw, 50vw" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="br-section">
            <div className="br-container">
              <h2 className="br-title br-title-center">Our Work in Weaverville</h2>
              <p className="br-lead" style={{ maxWidth: 720, margin: "0 auto 32px", textAlign: "center" }}>
                {"We\u2019ve completed multiple custom homes and remodels throughout the Weaverville area."}
              </p>
              <div className="br-portfolio-grid">
                {[
                  { slug: "195-meadow-creek", title: "Meadow Creek", cover: "/optimized/195-meadow-creek/front-exterior-meadow-creek.jpg", location: "Weaverville, NC" },
                  { slug: "90-covey-dr", title: "90 Covey Drive", cover: "/optimized/90-covey-dr/two-story-house-with-stone-facade-and-driveway.jpg", location: "Weaverville, NC" },
                  { slug: "280-settlers-cove", title: "280 Settlers Cove", cover: "/optimized/280-settlers-cove/gray-house-with-gabled-roof-and-lush-greenery.webp", location: "Weaverville, NC" },
                  { slug: "660-settlers-cove", title: "660 Settlers Cove", cover: "/optimized/660-settlers-cove/charming-house-with-stone-facade-and-lush-trees.webp", location: "Weaverville, NC" },
                ].map((p) => (
                  <Link key={p.slug} href={`/portfolio/${p.slug}`} className="br-portfolio-card">
                    <div className="br-portfolio-card-image">
                      <Image src={p.cover} alt={`${p.title} - Custom home in ${p.location}`} fill sizes="(max-width: 640px) 100vw, 50vw" />
                      <div className="br-portfolio-card-overlay">
                        <h2 className="br-portfolio-card-title">{p.title}</h2>
                        <div className="br-portfolio-card-meta">{p.location}</div>
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
                <h2 className="br-title br-title-center">Ready to Build in Weaverville?</h2>
                <p className="br-lead br-cta-copy">{"Tell us about your property and your vision. We\u2019ll show you what\u2019s possible."}</p>
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
WEAVERVILLE

# ============================
# HENDERSONVILLE
# ============================
mkdir -p app/service-areas/hendersonville
cat > app/service-areas/hendersonville/page.tsx << 'HENDERSONVILLE'
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Custom Home Builder in Hendersonville, NC | Blue Ridge Homes",
  description: "Blue Ridge Homes builds custom homes and manages remodeling projects in Hendersonville and Henderson County, NC. 30+ years experience. NC License #56328.",
  alternates: { canonical: "https://brhomesnc.com/service-areas/hendersonville" },
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
                        <p className="br-commitment-body">{"New custom builds including insulated concrete form (ICF) construction for superior energy efficiency \u2014 especially valuable in Henderson County\u2019s varied climate."}</p>
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
HENDERSONVILLE

# ============================
# BLACK MOUNTAIN
# ============================
mkdir -p app/service-areas/black-mountain
cat > app/service-areas/black-mountain/page.tsx << 'BLACKMOUNTAIN'
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Custom Home Builder in Black Mountain, NC | Blue Ridge Homes",
  description: "Blue Ridge Homes builds custom homes and manages remodeling projects in Black Mountain and Swannanoa, NC. 30+ years experience. NC License #56328.",
  alternates: { canonical: "https://brhomesnc.com/service-areas/black-mountain" },
};

export default function BlackMountainPage() {
  return (
    <main className="br-page">
      <div className="br-shell br-marble">
        <div className="br-content">

          <section className="br-hero-wrap">
            <div className="br-hero-full">
              <div className="br-hero-media">
                <div className="br-hero-image-wrap">
                  <Image src="/optimized/280-settlers-cove/gray-house-with-gabled-roof-and-lush-greenery.webp" alt="Custom home with mountain setting near Black Mountain NC" fill priority className="br-hero-image" sizes="100vw" />
                </div>
              </div>
              <div className="br-hero-overlay-gradient" />
              <div className="br-hero-copy">
                <h1 className="br-hero-title">Custom Home Builder<br />in Black Mountain, NC</h1>
                <p className="br-hero-subtitle">Building homes that honor the character of one of Western North Carolina's most charming communities.</p>
                <div className="br-button-row">
                  <Link href="/contact" className="br-button br-button-primary">{"Start Your Project \u2192"}</Link>
                </div>
              </div>
            </div>
          </section>

          <section className="br-section">
            <div className="br-container">
              <h2 className="br-title br-title-center">Building in Black Mountain &amp; Swannanoa</h2>
              <p className="br-lead" style={{ maxWidth: 820, margin: "0 auto", textAlign: "center" }}>
                {"Black Mountain\u2019s small-town character and natural setting make it one of the most desirable places to build in Western North Carolina. Whether you\u2019re building a new home in Grovemont, renovating in the historic downtown area, or constructing on a mountain lot off Flat Creek, Blue Ridge Homes brings the craftsmanship and local knowledge your project demands. We also serve the neighboring Swannanoa valley and surrounding eastern Buncombe County communities."}
              </p>
            </div>
          </section>

          <div className="br-divider-strip">
            <img src="/optimized/dividers/divider-asheville.jpg" alt="Mountain scenery near Black Mountain NC" />
          </div>

          <section className="br-section br-section-alt br-commitment-section">
            <div className="br-container">
              <div className="br-grid-2 br-commitment-grid">
                <div className="br-commitment-copy">
                  <h2 className="br-title">Services in Black Mountain</h2>
                  <p className="br-lead">
                    {"From new construction to thoughtful renovations of older homes, we deliver the same quality and personal attention on every project."}
                  </p>
                  <div className="br-commitment-list">
                    <div className="br-commitment-item">
                      <span className="br-commitment-icon">{"\u2713"}</span>
                      <div>
                        <h3 className="br-commitment-title">Custom Homes</h3>
                        <p className="br-commitment-body">New homes designed for mountain lots, from craftsman-style builds to contemporary designs with expansive views.</p>
                      </div>
                    </div>
                    <div className="br-commitment-item">
                      <span className="br-commitment-icon">{"\u2713"}</span>
                      <div>
                        <h3 className="br-commitment-title">Remodeling &amp; Renovations</h3>
                        <p className="br-commitment-body">{"Kitchens, bathrooms, and whole-home updates that modernize Black Mountain\u2019s older housing stock while respecting its character."}</p>
                      </div>
                    </div>
                    <div className="br-commitment-item">
                      <span className="br-commitment-icon">{"\u2713"}</span>
                      <div>
                        <h3 className="br-commitment-title">Storm Recovery &amp; Rebuilding</h3>
                        <p className="br-commitment-body">{"Structural repairs, rebuilds, and resilient construction for communities recovering from storm damage \u2014 including Helene recovery work in the Swannanoa valley."}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="br-image-stack br-commitment-visuals">
                  <div className="br-frame br-frame-tall">
                    <Image src="/optimized/280-settlers-cove/cozy-living-room-with-stone-fireplace-and-leather-sofas.webp" alt="Living room with stone fireplace in mountain home" fill className="br-frame-image" sizes="(max-width: 768px) 100vw, 50vw" />
                  </div>
                  <div className="br-frame br-frame-wide">
                    <Image src="/optimized/280-settlers-cove/screened-porch-with-wooden-deck-and-ceiling-fan.jpg" alt="Screened porch overlooking woods" fill className="br-frame-image" sizes="(max-width: 768px) 100vw, 50vw" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="br-closing-sequence">
            <section className="br-section br-cta br-closing-cta">
              <div className="br-container">
                <h2 className="br-title br-title-center">Ready to Build in Black Mountain?</h2>
                <p className="br-lead br-cta-copy">{"Tell us about your project and we\u2019ll show you what\u2019s possible in Black Mountain and the Swannanoa valley."}</p>
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
BLACKMOUNTAIN

# ============================
# MILLS RIVER
# ============================
mkdir -p app/service-areas/mills-river
cat > app/service-areas/mills-river/page.tsx << 'MILLSRIVER'
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Custom Home Builder in Mills River, NC | Blue Ridge Homes",
  description: "Blue Ridge Homes builds custom homes and manages remodeling projects in Mills River and southern Henderson County, NC. 30+ years experience. NC License #56328.",
  alternates: { canonical: "https://brhomesnc.com/service-areas/mills-river" },
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
                        <h3 className="br-commitment-title">ICF &amp; Energy-Efficient Builds</h3>
                        <p className="br-commitment-body">{"Insulated concrete form construction for superior energy performance \u2014 an investment that pays off quickly in the valley\u2019s temperature swings."}</p>
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
MILLSRIVER

# ============================
# BREVARD
# ============================
mkdir -p app/service-areas/brevard
cat > app/service-areas/brevard/page.tsx << 'BREVARD'
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
BREVARD

echo "=== Adding service areas layout ==="
cat > app/service-areas/layout.tsx << 'LAYOUT'
export default function ServiceAreasLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
LAYOUT

echo "=== Updating sitemap to include service areas ==="
# Check if sitemap already has service-areas
if grep -q "service-areas" app/sitemap.xml/route.ts 2>/dev/null || grep -q "service-areas" app/sitemap.ts 2>/dev/null; then
  echo "Sitemap already includes service areas — skipping"
else
  echo "Will need manual sitemap update if not auto-detected"
fi

echo "=== Build & deploy ==="
./deploy.sh

echo ""
echo "=== DONE ==="
echo "Service area pages created:"
echo "  /service-areas (index with grid)"
echo "  /service-areas/weaverville"
echo "  /service-areas/hendersonville"
echo "  /service-areas/black-mountain"
echo "  /service-areas/mills-river"
echo "  /service-areas/brevard"
echo ""
echo "Each page has:"
echo "  - SEO metadata with canonical URLs"
echo "  - Hero with local imagery"
echo "  - Local content section"
echo "  - Divider strip"
echo "  - Services checklist (custom, remodel, additions/ICF)"
echo "  - Portfolio projects from that area (where available)"
echo "  - Closing CTA"
