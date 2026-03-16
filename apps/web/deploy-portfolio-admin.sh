#!/bin/bash
set -e
cd /var/www/brhomes/apps/web

echo "=== 1. Create portfolio table and seed data ==="
node << 'SEEDJS'
const db = require('better-sqlite3')('/var/www/brhomes/data/submissions.db');

// Create table
db.exec(`
  CREATE TABLE IF NOT EXISTS portfolio_projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    location TEXT NOT NULL,
    tag TEXT NOT NULL DEFAULT 'custom',
    type TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    cover TEXT NOT NULL DEFAULT '',
    images TEXT NOT NULL DEFAULT '[]',
    sort_order INTEGER NOT NULL DEFAULT 0,
    published INTEGER NOT NULL DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )
`);

const existing = db.prepare("SELECT COUNT(*) as c FROM portfolio_projects").get();
if (existing.c > 0) {
  console.log(`Portfolio table already has ${existing.c} projects — skipping seed`);
  process.exit(0);
}

const projects = [
  {
    slug: "breezeway", title: "The Breezeway", location: "South Asheville", tag: "custom",
    type: "Custom Home — ICF Construction",
    description: "A modern ICF-built home featuring wood and steel exterior accents, open living spaces with floor-to-ceiling windows, and a contemporary kitchen. Built with insulated concrete forms for superior energy efficiency and comfort.",
    cover: "/optimized/breezeway/modern-house-with-wood-and-blue-exterior.jpg",
    images: ["modern-house-with-wood-and-blue-exterior.jpg","modern-house-with-wood-and-blue-paneling.jpg","modern-house-with-large-windows-at-dusk.jpg","bright-living-room-with-modern-furniture-and-large-windows.jpg","bright-living-room-with-large-window-fireplace-shelves.jpg","bright-living-room-with-modern-decor-and-large-windows.jpg","contemporary-kitchen-with-stainless-steel-appliances.jpg","modern-kitchen-and-living-area-with-red-chairs.jpg","modern-kitchen-with-dark-cabinets-and-blue-backsplash.jpg","cozy-bedroom-with-large-windows-and-stylish-decor.jpg","bright-bedroom-with-large-windows-and-metal-bed.jpg","bright-bedroom-with-large-windows-and-natural-light.jpg","modern-bathroom-with-red-vanity-and-glass-shower.jpg","modern-bathroom-with-tub-and-dual-sinks.jpg","modern-entryway-with-stairs-and-plants.jpg","spacious-deck-with-modern-furniture-and-mountain-view.jpg","green-door-with-wreath-and-interior-view.jpg"].map(f => "/optimized/breezeway/" + f),
  },
  {
    slug: "green-river", title: "Green River Retreat", location: "Green River, NC", tag: "custom",
    type: "Custom Home — ICF Construction",
    description: "A custom ICF home nestled in a wooded setting along the Green River. Stone accents, expansive windows framing forest views, and a modern open floor plan with high ceilings throughout.",
    cover: "/optimized/green-river/stone-accented-house-with-trees-and-landscaping.jpg",
    images: ["stone-accented-house-with-trees-and-landscaping.jpg","house-with-trees-and-stone-accents.jpg","dark-colored-house-with-garage-in-wooded-area.jpg","modern-house-with-trees-and-stone-path.jpg","cozy-home-surrounded-by-lush-greenery.jpg","modern-garage-with-stone-accents-and-lush-greenery.jpg","living-room-with-large-windows-and-forest-view.jpg","living-room-with-tall-windows-and-forest-view.jpg","large-windows-and-high-ceiling-in-living-area.jpg","cozy-living-room-with-large-windows-and-sofa.jpg","modern-kitchen-with-island-and-wooden-cabinets.jpg","modern-hallway-with-wood-floors-and-accent-lighting.jpg","hallway-with-recessed-lighting-and-window-view.jpg","modern-bathroom-with-purple-lighting-and-forest-view.jpg","modern-bathroom-with-purple-lighting-and-large-windows.jpg","backyard-view-with-pond-and-forest.jpg"].map(f => "/optimized/green-river/" + f),
  },
  {
    slug: "195-meadow-creek", title: "Meadow Creek", location: "Weaverville, NC", tag: "custom",
    type: "Custom Home",
    description: "A timber-and-stone family home in Weaverville with a wraparound porch, stone fireplace, and open-concept living. Custom millwork throughout with hardwood floors and a covered walkway connecting to a detached garage.",
    cover: "/optimized/195-meadow-creek/front-exterior-meadow-creek.jpg",
    images: ["front-exterior-meadow-creek.jpg","spacious-house-with-stone-accents-and-large-driveway.jpg","house-with-stone-facade-and-small-porch.jpg","exterior-view-of-a-cozy-house-with-a-porch.jpg","rustic-stone-chimney-and-siding.jpg","covered-walkway-with-lush-garden-and-plants.jpg","inviting-stone-patio-with-seating-and-plants.jpg","living-room-with-stone-fireplace-and-large-windows.jpg","open-concept-kitchen-and-living-space-with-fireplace.jpg","spacious-kitchen-with-island-and-dining-table.jpg","elegant-kitchen-with-stainless-steel-appliances.jpg","open-dining-area-with-glass-table-and-upholstered-chairs.jpg","bright-living-room-with-large-windows-and-cozy-seating.jpg","bright-bedroom-with-large-windows-and-wooden-bed.jpg","staircase-with-decorative-wall-art-and-sink.jpg"].map(f => "/optimized/195-meadow-creek/" + f),
  },
  {
    slug: "23-woodbine-rd", title: "23 Woodbine Road", location: "Asheville, NC", tag: "custom",
    type: "Custom Home",
    description: "A contemporary two-story custom build in Asheville featuring cable railings, floor-to-ceiling windows, and a minimalist design approach. Clean lines throughout with modern bathrooms and an open deck overlooking the property.",
    cover: "/optimized/23-woodbine-rd/modern-two-story-house-with-wood-accents.jpg",
    images: ["modern-two-story-house-with-wood-accents.jpg","contemporary-two-story-home-with-deck.jpg","contemporary-staircase-with-cable-railing.jpg","living-room-with-large-windows-and-open-deck.jpg","minimalist-room-with-large-windows-and-wood-flooring.jpg","home-office-with-deck-and-outdoor-seating.jpg","modern-entryway-with-mirror-and-cabinet.jpg","modern-bedroom-with-large-windows-and-a-bed.jpg","modern-bedroom-with-art-and-ensuite-bathroom.jpg","contemporary-bedroom-with-dresser-and-wall-art.jpg","contemporary-bathroom-with-dark-tiles-and-freestanding-tub.jpg","modern-bathroom-with-double-vanity-and-glass-shower.jpg","modern-bathroom-with-glass-shower-and-bathtub.jpg","modern-bathroom-with-shower-and-vanity.jpg","laundry-room-with-wood-flooring-and-metal-sink.jpg"].map(f => "/optimized/23-woodbine-rd/" + f),
  },
  {
    slug: "crown-point", title: "Crown Point", location: "Asheville, NC", tag: "remodel",
    type: "Whole Home Remodel",
    description: "A complete whole home renovation featuring a new open-concept kitchen with exposed beams, custom wet bar, updated bathrooms, and a stone patio with mountain views.",
    cover: "/optimized/crown-point/open-kitchen-with-island-and-stone-fireplace.jpg",
    images: ["open-kitchen-with-island-and-stone-fireplace.jpg","modern-kitchen-with-large-island-and-pendant-lights.jpg","open-concept-kitchen-with-wooden-beams-and-island.jpg","modern-kitchen-with-wooden-beams-and-island.jpg","spacious-kitchen-and-dining-area-with-wooden-beams.jpg","spacious-kitchen-with-island-and-wooden-floors.jpg","spacious-living-room-with-large-windows-and-chandelier.jpg","elegant-wooden-wet-bar-with-glass-cabinets.jpg","modern-lighting-and-wet-bar-with-wooden-floors.jpg","modern-staircase-with-wooden-steps-and-railing.jpg","elegant-bathroom-with-bathtub-and-glass-shower.jpg","elegant-bathroom-with-double-vanity-and-large-shower.jpg","modern-bathroom-with-wooden-cabinetry-and-glass-shower.jpg","spacious-shower-with-grey-tiles.jpg","dark-wood-cabinetry-with-brass-handles.jpg","scenic-mountain-view-from-a-stone-patio.jpg"].map(f => "/optimized/crown-point/" + f),
  },
  {
    slug: "preston-ct", title: "Preston Court", location: "Weaverville, NC", tag: "remodel",
    type: "Whole Home Remodel",
    description: "A whole home remodel transforming a dated interior into a vibrant, personality-filled space. New kitchen with island, custom built-ins, refined dining spaces, and an eclectic design throughout.",
    cover: "/optimized/preston-ct/contemporary-kitchen-with-island-and-pendant-lights.jpg",
    images: ["contemporary-kitchen-with-island-and-pendant-lights.jpg","modern-kitchen-with-island-and-cabinetry.jpg","spacious-kitchen-with-island-and-seating.jpg","stylish-dining-room-with-wooden-table-and-chandelier.jpg","dining-room-with-wooden-table-and-black-chairs.jpg","dining-nook-with-round-table-and-bench-seating.jpg","elegant-dining-area-with-wall-art-and-sconces.jpg","elegant-home-bar-with-shelving-and-mini-fridge.jpg","stylish-stairway-with-patterned-carpet.jpg","elegant-bathroom-with-decorative-wallpaper.jpg","wooden-front-door-with-sideboard-and-lamp.jpg","wooden-sideboard-with-mirror-and-lamps.jpg"].map(f => "/optimized/preston-ct/" + f),
  },
  {
    slug: "stewart-st", title: "Stewart Street", location: "Asheville, NC", tag: "custom",
    type: "Custom Home",
    description: "A custom bungalow on Stewart Street built using modular construction methods. Crane-set sections assembled on site with custom finishes throughout.",
    cover: "/optimized/stewart-st/cozy-white-bungalow-with-front-porch.jpg",
    images: ["cozy-white-bungalow-with-front-porch.jpg","crane-lifting-a-modular-home-section.jpg","crane-lifting-building-materials-on-site.jpg","modular-home-on-trailer-with-construction-materials.jpg"].map(f => "/optimized/stewart-st/" + f),
  },
  {
    slug: "90-covey-dr", title: "90 Covey Drive", location: "Weaverville, NC", tag: "custom",
    type: "Custom Home",
    description: "A stone-and-siding custom home with a traditional craftsman exterior, open living areas, and a well-appointed kitchen with hardwood floors throughout.",
    cover: "/optimized/90-covey-dr/two-story-house-with-stone-facade-and-driveway.jpg",
    images: ["two-story-house-with-stone-facade-and-driveway.jpg","two-story-house-with-stone-facade-and-garage.jpg","stone-exterior-house-with-gabled-roof.jpg","spacious-living-room-with-fireplace-and-large-windows.jpg","cozy-kitchen-with-light-wood-cabinets-and-hardwood-floor.jpg","modern-kitchen-with-wood-cabinets-and-granite-countertop.jpg","modern-kitchen-with-wooden-cabinets-and-appliances.jpg"].map(f => "/optimized/90-covey-dr/" + f),
  },
  {
    slug: "duck-dr", title: "Duck Drive", location: "Mars Hill, NC", tag: "custom",
    type: "Custom Home",
    description: "A cozy mountain cottage with a covered front porch, open living and kitchen layout, and a warm interior designed for comfortable mountain living.",
    cover: "/optimized/duck-dr/cozy-cottage-with-wooden-porch-and-lush-greenery.jpg",
    images: ["cozy-cottage-with-wooden-porch-and-lush-greenery.jpg","gray-house-with-a-wooden-porch-and-stairs.jpg","open-living-space-with-a-kitchen-and-fireplace.jpg","living-room-with-fireplace-and-ceiling-fan.jpg","modern-kitchen-with-dark-cabinets-and-island.jpg","modern-kitchen-with-island-and-pendant-lights.jpg","modern-bathroom-with-tub-and-vanity.jpg","room-with-large-windows-and-hardwood-floors.jpg"].map(f => "/optimized/duck-dr/" + f),
  },
  {
    slug: "280-settlers-cove", title: "280 Settlers Cove", location: "Weaverville, NC", tag: "custom",
    type: "Custom Home",
    description: "A custom home featuring a stone fireplace, screened porch overlooking the woods, and a warm kitchen with wood cabinetry. Designed to take full advantage of the wooded lot.",
    cover: "/optimized/280-settlers-cove/gray-house-with-gabled-roof-and-lush-greenery.webp",
    images: ["gray-house-with-gabled-roof-and-lush-greenery.webp","two-story-house-with-large-windows-and-lush-greenery.webp","cozy-living-room-with-stone-fireplace-and-leather-sofas.webp","living-room-with-stone-fireplace-and-dining-area.webp","open-living-room-with-leather-sofa-and-ceiling-fan.webp","warm-kitchen-with-wooden-cabinets-and-black-appliances.webp","bathroom-with-double-vanity-and-hardwood-floor.jpg","deck-with-railing-and-screened-porch-surrounded-by-trees.jpg","screened-porch-with-wooden-deck-and-ceiling-fan.jpg","screened-porch-with-wooden-flooring-and-ceiling-fan.jpg"].map(f => "/optimized/280-settlers-cove/" + f),
  },
  {
    slug: "660-settlers-cove", title: "660 Settlers Cove", location: "Weaverville, NC", tag: "custom",
    type: "Custom Home",
    description: "A charming stone-facade custom home surrounded by mature trees. Hardwood floors, stone fireplace, covered porch, and a spacious kitchen with custom cabinetry.",
    cover: "/optimized/660-settlers-cove/charming-house-with-stone-facade-and-lush-trees.webp",
    images: ["charming-house-with-stone-facade-and-lush-trees.webp","two-story-house-with-garage-and-trees.webp","green-house-with-double-garage-and-trees.webp","aerial-view-of-a-house-amidst-trees-and-driveway.webp","living-room-with-hardwood-floors-and-stone-fireplace.webp","spacious-kitchen-with-wooden-cabinets-and-island.webp","spacious-dining-room-with-hardwood-floors.webp","spacious-room-with-hardwood-floors-and-chandelier.webp","covered-porch-with-wooden-deck-and-forest-view.webp","screened-porch-with-wooded-view-and-ceiling-fan.webp"].map(f => "/optimized/660-settlers-cove/" + f),
  },
  {
    slug: "robin-porch", title: "Robin Porch", location: "Charlotte, NC", tag: "addition",
    type: "Addition",
    description: "A screened porch addition with a ceiling fan, wicker furnishings, and a view into the surrounding woods. Designed to extend the living space outdoors while staying protected.",
    cover: "/optimized/robin-porch/cozy-screened-porch-with-wooded-view.jpg",
    images: ["cozy-screened-porch-with-wooded-view.jpg","cozy-porch-with-ceiling-fan-and-wooded-view.jpg","cozy-porch-with-wicker-chair-and-outdoor-deck.jpg","cozy-porch-with-wicker-chairs-and-lamp.jpg","cozy-sunroom-with-wicker-furniture-and-a-lamp.jpg","cozy-wicker-chairs-with-floral-cushions.jpg","screened-porch-with-ceiling-fan-and-trees.jpg"].map(f => "/optimized/robin-porch/" + f),
  },
];

const insert = db.prepare(`
  INSERT INTO portfolio_projects (slug, title, location, tag, type, description, cover, images, sort_order, published)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
`);

const tx = db.transaction(() => {
  projects.forEach((p, i) => {
    insert.run(p.slug, p.title, p.location, p.tag, p.type, p.description, p.cover, JSON.stringify(p.images), i);
    console.log(`  Seeded: ${p.title} (${p.images.length} images)`);
  });
});
tx();
console.log(`Seeded ${projects.length} portfolio projects`);
SEEDJS

echo "=== 2. Create lib/portfolio.ts ==="
cat > lib/portfolio.ts << 'LIBFILE'
import getDb from "./db";

export type PortfolioProject = {
  id: number;
  slug: string;
  title: string;
  location: string;
  tag: string;
  type: string;
  description: string;
  cover: string;
  images: string[];
  sort_order: number;
  published: number;
  created_at: string;
  updated_at: string;
};

type RawProject = Omit<PortfolioProject, "images"> & { images: string };

export function getPublishedProjects(): PortfolioProject[] {
  const db = getDb();
  const rows = db.prepare(
    "SELECT * FROM portfolio_projects WHERE published = 1 ORDER BY sort_order ASC"
  ).all() as RawProject[];
  return rows.map((r) => ({ ...r, images: JSON.parse(r.images) }));
}

export function getAllProjects(): PortfolioProject[] {
  const db = getDb();
  const rows = db.prepare(
    "SELECT * FROM portfolio_projects ORDER BY sort_order ASC"
  ).all() as RawProject[];
  return rows.map((r) => ({ ...r, images: JSON.parse(r.images) }));
}

export function getProjectBySlug(slug: string): PortfolioProject | null {
  const db = getDb();
  const row = db.prepare(
    "SELECT * FROM portfolio_projects WHERE slug = ?"
  ).get(slug) as RawProject | undefined;
  if (!row) return null;
  return { ...row, images: JSON.parse(row.images) };
}
LIBFILE

echo "=== 3. Create public API routes ==="
mkdir -p app/api/portfolio
cat > app/api/portfolio/route.ts << 'PUBROUTE'
import { NextResponse } from "next/server";
import { getPublishedProjects } from "@/lib/portfolio";

export async function GET() {
  const projects = getPublishedProjects();
  return NextResponse.json({ projects });
}
PUBROUTE

mkdir -p "app/api/portfolio/[slug]"
cat > "app/api/portfolio/[slug]/route.ts" << 'PUBDETAIL'
import { NextRequest, NextResponse } from "next/server";
import { getProjectBySlug } from "@/lib/portfolio";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project || !project.published) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ project });
}
PUBDETAIL

echo "=== 4. Rewrite public portfolio pages ==="
cat > app/portfolio/page.tsx << 'PUBLIST'
"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

type Project = {
  slug: string;
  title: string;
  location: string;
  tag: string;
  cover: string;
};

const filters = [
  { label: "All Projects", value: "all" },
  { label: "Custom Homes", value: "custom" },
  { label: "Remodeling", value: "remodel" },
  { label: "Additions", value: "addition" },
];

export default function PortfolioPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/portfolio")
      .then((r) => r.json())
      .then((d) => { setProjects(d.projects || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = activeFilter === "all"
    ? projects
    : projects.filter((p) => p.tag === activeFilter);

  return (
    <main className="br-page">
      <div className="br-shell br-marble">
        <div className="br-content">

          {/* Intro */}
          <section className="br-section">
            <div className="br-container">
              <h1 className="br-title br-title-center" style={{ marginBottom: 8 }}>Our Work</h1>
              <p className="br-lead" style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
                Custom homes, whole home remodels, and additions across Western North Carolina.
              </p>
            </div>
          </section>

          {/* Filters */}
          <section style={{ paddingBottom: 0 }}>
            <div className="br-container">
              <div className="br-portfolio-filters">
                {filters.map((f) => (
                  <button
                    key={f.value}
                    className={`br-portfolio-filter ${activeFilter === f.value ? "br-portfolio-filter-active" : ""}`}
                    onClick={() => setActiveFilter(f.value)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Grid */}
          <section className="br-section" style={{ paddingTop: 20 }}>
            <div className="br-container">
              {loading ? (
                <p style={{ textAlign: "center", color: "#a89a8c" }}>Loading projects...</p>
              ) : (
                <div className="br-portfolio-grid">
                  {filtered.map((project) => (
                    <Link
                      key={project.slug}
                      href={`/portfolio/${project.slug}`}
                      className="br-portfolio-card"
                    >
                      <div className="br-portfolio-card-image">
                        <Image
                          src={project.cover}
                          alt={`${project.title} in ${project.location} by Blue Ridge Homes`}
                          fill
                          sizes="(max-width: 640px) 100vw, 50vw"
                        />
                        <div className="br-portfolio-card-overlay">
                          <h2 className="br-portfolio-card-title">{project.title}</h2>
                          <div className="br-portfolio-card-meta">{project.location}</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* CTA */}
          <div className="br-closing-sequence">
            <section className="br-section br-cta br-closing-cta">
              <div className="br-container">
                <h2 className="br-title br-title-center">
                  Ready to Start Your Project?
                </h2>
                <p className="br-lead br-cta-copy">
                  {"Every home in this portfolio started with a conversation. Tell us what you are thinking and we will take it from there."}
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
PUBLIST

cat > "app/portfolio/[slug]/page.tsx" << 'PUBDETAIL'
"use client";
import { useState, useCallback, useEffect, use } from "react";
import Link from "next/link";

type Project = {
  title: string;
  location: string;
  type: string;
  description: string;
  cover: string;
  images: string[];
};

export default function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/portfolio/${slug}`)
      .then((r) => r.json())
      .then((d) => { setProject(d.project || null); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  const prev = useCallback(() => {
    if (!project) return;
    setActiveIndex((i) => (i === 0 ? project.images.length - 1 : i - 1));
  }, [project]);
  const next = useCallback(() => {
    if (!project) return;
    setActiveIndex((i) => (i === project.images.length - 1 ? 0 : i + 1));
  }, [project]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [prev, next]);

  if (loading) {
    return (
      <main className="br-page">
        <div className="br-shell br-marble">
          <div className="br-content">
            <section className="br-section">
              <div className="br-container">
                <p style={{ color: "#a89a8c" }}>Loading...</p>
              </div>
            </section>
          </div>
        </div>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="br-page">
        <div className="br-shell br-marble">
          <div className="br-content">
            <section className="br-section">
              <div className="br-container">
                <Link href="/portfolio" className="br-project-back">{"\u2190 Back to Portfolio"}</Link>
                <h1 className="br-title">Project Not Found</h1>
              </div>
            </section>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="br-page">
      <div className="br-shell br-marble">
        <div className="br-content">

          {/* Header */}
          <section className="br-section" style={{ paddingBottom: 0 }}>
            <div className="br-container">
              <Link href="/portfolio" className="br-project-back">{"\u2190 Back to Portfolio"}</Link>
              <h1 className="br-title" style={{ marginBottom: 4 }}>{project.title}</h1>
              <p className="br-project-meta">{project.location} &middot; {project.type}</p>
              <p className="br-project-desc" style={{ marginTop: 12 }}>{project.description}</p>
            </div>
          </section>

          {/* Gallery Viewer */}
          <section className="br-section">
            <div className="br-container">
              <div className="br-gallery-viewer">
                <div className="br-gallery-main" onClick={() => setLightboxOpen(true)}>
                  <img
                    src={project.images[activeIndex]}
                    alt={`${project.title} \u2014 image ${activeIndex + 1} of ${project.images.length}`}
                  />
                </div>
                <div className="br-gallery-thumbs">
                  {project.images.map((src, i) => (
                    <div
                      key={i}
                      className={`br-gallery-thumb ${i === activeIndex ? "br-gallery-thumb-active" : ""}`}
                      onClick={() => setActiveIndex(i)}
                    >
                      <img src={src} alt={`Thumbnail ${i + 1}`} loading="lazy" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="br-gallery-counter">
                {activeIndex + 1} of {project.images.length} photos
              </div>
            </div>
          </section>

          {/* CTA */}
          <div className="br-closing-sequence">
            <section className="br-section br-cta br-closing-cta">
              <div className="br-container">
                <h2 className="br-title br-title-center">Like What You See?</h2>
                <p className="br-lead br-cta-copy">
                  {"Every project in our portfolio started with a conversation. Tell us about yours."}
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

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="br-lightbox" onClick={() => setLightboxOpen(false)}>
          <button className="br-lightbox-close" onClick={() => setLightboxOpen(false)}>{"\u00D7"}</button>
          <button className="br-lightbox-nav br-lightbox-prev" onClick={(e) => { e.stopPropagation(); prev(); }}>{"\u2039"}</button>
          <img
            src={project.images[activeIndex]}
            alt={`${project.title} \u2014 image ${activeIndex + 1}`}
            onClick={(e) => e.stopPropagation()}
          />
          <button className="br-lightbox-nav br-lightbox-next" onClick={(e) => { e.stopPropagation(); next(); }}>{"\u203A"}</button>
          <div className="br-lightbox-counter">{activeIndex + 1} / {project.images.length}</div>
        </div>
      )}
    </main>
  );
}
PUBDETAIL

echo "=== 5. Create admin API routes ==="
mkdir -p app/api/admin/portfolio
cat > app/api/admin/portfolio/route.ts << 'ADMINLIST'
import { NextResponse } from "next/server";
import getDb from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = getDb();
  const projects = db.prepare(
    "SELECT id, slug, title, location, tag, type, cover, sort_order, published FROM portfolio_projects ORDER BY sort_order ASC"
  ).all();
  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const { slug, title, location, tag, type, description, cover, images, published } = body;
  if (!slug || !title || !location) {
    return NextResponse.json({ error: "Slug, title, and location are required" }, { status: 400 });
  }
  const db = getDb();
  const existing = db.prepare("SELECT id FROM portfolio_projects WHERE slug = ?").get(slug);
  if (existing) {
    return NextResponse.json({ error: "A project with this slug already exists" }, { status: 409 });
  }
  const maxOrder = db.prepare("SELECT MAX(sort_order) as m FROM portfolio_projects").get() as { m: number | null };
  const sortOrder = (maxOrder.m ?? -1) + 1;
  db.prepare(
    "INSERT INTO portfolio_projects (slug, title, location, tag, type, description, cover, images, sort_order, published) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(slug, title, location, tag || "custom", type || "", description || "", cover || "", JSON.stringify(images || []), sortOrder, published ? 1 : 0);
  return NextResponse.json({ success: true, slug });
}
ADMINLIST

mkdir -p "app/api/admin/portfolio/[slug]"
cat > "app/api/admin/portfolio/[slug]/route.ts" << 'ADMINSINGLE'
import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { slug } = await params;
  const db = getDb();
  const project = db.prepare("SELECT * FROM portfolio_projects WHERE slug = ?").get(slug) as Record<string, unknown> | undefined;
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ project: { ...project, images: JSON.parse(project.images as string) } });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { slug } = await params;
  const body = await request.json();
  const db = getDb();
  const existing = db.prepare("SELECT id FROM portfolio_projects WHERE slug = ?").get(slug);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const fields: string[] = [];
  const values: unknown[] = [];
  if (body.title !== undefined) { fields.push("title = ?"); values.push(body.title); }
  if (body.location !== undefined) { fields.push("location = ?"); values.push(body.location); }
  if (body.tag !== undefined) { fields.push("tag = ?"); values.push(body.tag); }
  if (body.type !== undefined) { fields.push("type = ?"); values.push(body.type); }
  if (body.description !== undefined) { fields.push("description = ?"); values.push(body.description); }
  if (body.cover !== undefined) { fields.push("cover = ?"); values.push(body.cover); }
  if (body.images !== undefined) { fields.push("images = ?"); values.push(JSON.stringify(body.images)); }
  if (body.sort_order !== undefined) { fields.push("sort_order = ?"); values.push(body.sort_order); }
  if (body.published !== undefined) { fields.push("published = ?"); values.push(body.published ? 1 : 0); }
  if (fields.length > 0) {
    fields.push("updated_at = datetime('now')");
    values.push(slug);
    db.prepare(`UPDATE portfolio_projects SET ${fields.join(", ")} WHERE slug = ?`).run(...values);
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { slug } = await params;
  const db = getDb();
  db.prepare("DELETE FROM portfolio_projects WHERE slug = ?").run(slug);
  return NextResponse.json({ success: true });
}
ADMINSINGLE

echo "=== 6. Create admin portfolio pages ==="

# --- List page ---
mkdir -p app/admin/portfolio
cat > app/admin/portfolio/page.tsx << 'ADMINPAGE'
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Project = {
  id: number;
  slug: string;
  title: string;
  location: string;
  tag: string;
  published: number;
  sort_order: number;
};

export default function AdminPortfolioList() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/portfolio")
      .then((r) => r.json())
      .then((d) => { setProjects(d.projects || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function togglePublished(slug: string, current: number) {
    await fetch(`/api/admin/portfolio/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !current }),
    });
    setProjects((prev) => prev.map((p) => (p.slug === slug ? { ...p, published: current ? 0 : 1 } : p)));
  }

  async function deleteProject(slug: string) {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    await fetch(`/api/admin/portfolio/${slug}`, { method: "DELETE" });
    setProjects((prev) => prev.filter((p) => p.slug !== slug));
  }

  async function moveProject(slug: string, direction: "up" | "down") {
    const idx = projects.findIndex((p) => p.slug === slug);
    if (idx < 0) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= projects.length) return;
    const a = projects[idx];
    const b = projects[swapIdx];
    await Promise.all([
      fetch(`/api/admin/portfolio/${a.slug}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sort_order: b.sort_order }) }),
      fetch(`/api/admin/portfolio/${b.slug}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sort_order: a.sort_order }) }),
    ]);
    const updated = [...projects];
    updated[idx] = { ...b, sort_order: a.sort_order };
    updated[swapIdx] = { ...a, sort_order: b.sort_order };
    updated.sort((x, y) => x.sort_order - y.sort_order);
    setProjects(updated);
  }

  const container: React.CSSProperties = { maxWidth: 900, margin: "0 auto", padding: "40px 20px", fontFamily: "Inter, sans-serif" };
  const btnSmall: React.CSSProperties = { padding: "6px 14px", borderRadius: 4, border: "1px solid #d8cdc0", background: "none", cursor: "pointer", fontSize: 13, color: "#3d3228" };
  const btnPrimary: React.CSSProperties = { padding: "10px 20px", borderRadius: 4, border: "none", background: "#6b4226", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 500 };
  const tagColors: Record<string, string> = { custom: "#27ae60", remodel: "#2980b9", addition: "#e67e22" };

  return (
    <div style={container}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <a href="/admin" style={{ fontSize: 13, color: "#a89a8c", textDecoration: "none" }}>{"\u2190 Dashboard"}</a>
          <h1 style={{ margin: "8px 0 0", color: "#1e1812", fontSize: 24 }}>Portfolio Projects</h1>
        </div>
        <button style={btnPrimary} onClick={() => router.push("/admin/portfolio/new")}>+ New Project</button>
      </div>

      {loading ? (
        <p style={{ color: "#a89a8c" }}>Loading...</p>
      ) : projects.length === 0 ? (
        <p style={{ color: "#a89a8c" }}>No portfolio projects yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {projects.map((p, idx) => (
            <div key={p.slug} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "14px 20px", background: "#fff", borderRadius: 8, border: "1px solid #d8cdc0",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <button onClick={() => moveProject(p.slug, "up")} disabled={idx === 0} style={{ ...btnSmall, padding: "2px 8px", opacity: idx === 0 ? 0.3 : 1 }}>{"\u25B2"}</button>
                  <button onClick={() => moveProject(p.slug, "down")} disabled={idx === projects.length - 1} style={{ ...btnSmall, padding: "2px 8px", opacity: idx === projects.length - 1 ? 0.3 : 1 }}>{"\u25BC"}</button>
                </div>
                <div>
                  <h3 style={{ margin: "0 0 4px", color: "#1e1812", fontSize: 15 }}>{p.title}</h3>
                  <span style={{ fontSize: 13, color: "#a89a8c" }}>
                    {p.location} &middot;{" "}
                    <span style={{ color: tagColors[p.tag] || "#a89a8c", fontWeight: 600 }}>{p.tag}</span> &middot;{" "}
                    <span style={{ color: p.published ? "#27ae60" : "#e67e22" }}>{p.published ? "Published" : "Draft"}</span>
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={btnSmall} onClick={() => togglePublished(p.slug, p.published)}>
                  {p.published ? "Unpublish" : "Publish"}
                </button>
                <button style={btnSmall} onClick={() => router.push(`/admin/portfolio/${p.slug}/edit`)}>Edit</button>
                <button style={{ ...btnSmall, color: "#c0392b", borderColor: "#e0c8c8" }} onClick={() => deleteProject(p.slug)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
ADMINPAGE

# --- New project page ---
mkdir -p app/admin/portfolio/new
cat > app/admin/portfolio/new/page.tsx << 'NEWPAGE'
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import PortfolioForm from "@/components/admin/PortfolioForm";

export default function NewProjectPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(data: Record<string, unknown>) {
    setSaving(true);
    setError("");
    const r = await fetch("/api/admin/portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const d = await r.json();
    if (d.success) {
      router.push("/admin/portfolio");
    } else {
      setError(d.error || "Failed to create project");
    }
    setSaving(false);
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px", fontFamily: "Inter, sans-serif" }}>
      <a href="/admin/portfolio" style={{ fontSize: 13, color: "#a89a8c", textDecoration: "none" }}>{"\u2190 Portfolio"}</a>
      <h1 style={{ margin: "8px 0 24px", color: "#1e1812", fontSize: 24 }}>New Project</h1>
      {error && <div style={{ padding: "10px 14px", borderRadius: 4, background: "#fce4e4", color: "#c0392b", fontSize: 13, marginBottom: 16 }}>{error}</div>}
      <PortfolioForm onSave={handleSave} saving={saving} />
    </div>
  );
}
NEWPAGE

# --- Edit project page ---
mkdir -p "app/admin/portfolio/[slug]/edit"
cat > "app/admin/portfolio/[slug]/edit/page.tsx" << 'EDITPAGE'
"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import PortfolioForm from "@/components/admin/PortfolioForm";

export default function EditProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [project, setProject] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/portfolio/${slug}`)
      .then((r) => r.json())
      .then((d) => { setProject(d.project || null); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  async function handleSave(data: Record<string, unknown>) {
    setSaving(true);
    setError("");
    const r = await fetch(`/api/admin/portfolio/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const d = await r.json();
    if (d.success) {
      router.push("/admin/portfolio");
    } else {
      setError(d.error || "Failed to update project");
    }
    setSaving(false);
  }

  if (loading) return <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px", fontFamily: "Inter, sans-serif" }}><p style={{ color: "#a89a8c" }}>Loading...</p></div>;
  if (!project) return <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px", fontFamily: "Inter, sans-serif" }}><p style={{ color: "#c0392b" }}>Project not found.</p></div>;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px", fontFamily: "Inter, sans-serif" }}>
      <a href="/admin/portfolio" style={{ fontSize: 13, color: "#a89a8c", textDecoration: "none" }}>{"\u2190 Portfolio"}</a>
      <h1 style={{ margin: "8px 0 24px", color: "#1e1812", fontSize: 24 }}>Edit: {project.title as string}</h1>
      {error && <div style={{ padding: "10px 14px", borderRadius: 4, background: "#fce4e4", color: "#c0392b", fontSize: 13, marginBottom: 16 }}>{error}</div>}
      <PortfolioForm project={project} onSave={handleSave} saving={saving} />
    </div>
  );
}
EDITPAGE

echo "=== 7. Create PortfolioForm component ==="
mkdir -p components/admin
cat > components/admin/PortfolioForm.tsx << 'FORMCOMP'
"use client";
import { useState, useEffect } from "react";

type Props = {
  project?: Record<string, unknown> | null;
  onSave: (data: Record<string, unknown>) => void;
  saving: boolean;
};

type FolderImages = Record<string, string[]>;

export default function PortfolioForm({ project, onSave, saving }: Props) {
  const [title, setTitle] = useState((project?.title as string) || "");
  const [slug, setSlug] = useState((project?.slug as string) || "");
  const [location, setLocation] = useState((project?.location as string) || "");
  const [tag, setTag] = useState((project?.tag as string) || "custom");
  const [type, setType] = useState((project?.type as string) || "");
  const [description, setDescription] = useState((project?.description as string) || "");
  const [cover, setCover] = useState((project?.cover as string) || "");
  const [images, setImages] = useState<string[]>((project?.images as string[]) || []);
  const [published, setPublished] = useState(project?.published !== undefined ? !!project.published : true);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<"cover" | "gallery">("gallery");
  const [folders, setFolders] = useState<FolderImages>({});
  const [pickerFolder, setPickerFolder] = useState("");
  const [loadingImages, setLoadingImages] = useState(false);

  // Auto-slug from title
  useEffect(() => {
    if (!project) {
      setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    }
  }, [title, project]);

  function loadImages() {
    if (Object.keys(folders).length > 0) { setShowPicker(true); return; }
    setLoadingImages(true);
    fetch("/api/admin/images")
      .then((r) => r.json())
      .then((d) => {
        setFolders(d.folders || {});
        const keys = Object.keys(d.folders || {});
        if (keys.length > 0 && !pickerFolder) setPickerFolder(keys[0]);
        setShowPicker(true);
        setLoadingImages(false);
      })
      .catch(() => setLoadingImages(false));
  }

  function openPicker(mode: "cover" | "gallery") {
    setPickerMode(mode);
    loadImages();
  }

  function selectImage(path: string) {
    if (pickerMode === "cover") {
      setCover(path);
      setShowPicker(false);
    } else {
      if (!images.includes(path)) {
        setImages([...images, path]);
      }
    }
  }

  function removeImage(path: string) {
    setImages(images.filter((i) => i !== path));
  }

  function moveImage(idx: number, direction: "up" | "down") {
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= images.length) return;
    const updated = [...images];
    [updated[idx], updated[swapIdx]] = [updated[swapIdx], updated[idx]];
    setImages(updated);
  }

  function handleSubmit() {
    onSave({ slug, title, location, tag, type, description, cover, images, published });
  }

  const card: React.CSSProperties = { background: "#fff", borderRadius: 8, border: "1px solid #d8cdc0", padding: 24, marginBottom: 20 };
  const label: React.CSSProperties = { display: "block", fontSize: 12, color: "#a89a8c", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6, fontWeight: 600 };
  const input: React.CSSProperties = { width: "100%", padding: "10px 12px", borderRadius: 4, border: "1px solid #d8cdc0", fontSize: 14, fontFamily: "Inter, sans-serif", color: "#1e1812", boxSizing: "border-box" };
  const btnSmall: React.CSSProperties = { padding: "6px 14px", borderRadius: 4, border: "1px solid #d8cdc0", background: "none", cursor: "pointer", fontSize: 13, color: "#3d3228" };
  const btnPrimary: React.CSSProperties = { padding: "12px 24px", borderRadius: 4, border: "none", background: "#6b4226", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 500 };

  return (
    <div>
      {/* Basic info */}
      <div style={card}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={label}>Title</label>
            <input style={input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. The Breezeway" />
          </div>
          <div>
            <label style={label}>Slug</label>
            <input style={input} value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g. breezeway" disabled={!!project} />
          </div>
          <div>
            <label style={label}>Location</label>
            <input style={input} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Asheville, NC" />
          </div>
          <div>
            <label style={label}>Type</label>
            <input style={input} value={type} onChange={(e) => setType(e.target.value)} placeholder="e.g. Custom Home, Whole Home Remodel" />
          </div>
          <div>
            <label style={label}>Tag (for filtering)</label>
            <select style={input} value={tag} onChange={(e) => setTag(e.target.value)}>
              <option value="custom">Custom Home</option>
              <option value="remodel">Remodel</option>
              <option value="addition">Addition</option>
            </select>
          </div>
          <div>
            <label style={label}>Status</label>
            <select style={input} value={published ? "1" : "0"} onChange={(e) => setPublished(e.target.value === "1")}>
              <option value="1">Published</option>
              <option value="0">Draft</option>
            </select>
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <label style={label}>Description</label>
          <textarea style={{ ...input, minHeight: 80, resize: "vertical" }} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the project..." />
        </div>
      </div>

      {/* Cover image */}
      <div style={card}>
        <label style={label}>Cover Image</label>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <input style={{ ...input, flex: 1 }} value={cover} onChange={(e) => setCover(e.target.value)} placeholder="/optimized/folder/image.jpg" />
          <button style={btnSmall} onClick={() => openPicker("cover")}>Browse</button>
        </div>
        {cover && <img src={cover} alt="Cover preview" style={{ maxHeight: 200, borderRadius: 4, border: "1px solid #d8cdc0" }} />}
      </div>

      {/* Gallery images */}
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <label style={{ ...label, marginBottom: 0 }}>Gallery Images ({images.length})</label>
          <button style={btnSmall} onClick={() => openPicker("gallery")}>{loadingImages ? "Loading..." : "+ Add Images"}</button>
        </div>
        {images.length === 0 ? (
          <p style={{ color: "#a89a8c", fontSize: 13 }}>No gallery images yet. Click "Add Images" to browse.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8 }}>
            {images.map((src, i) => (
              <div key={src} style={{ position: "relative", borderRadius: 4, overflow: "hidden", border: "1px solid #d8cdc0" }}>
                <img src={src} alt={`Gallery ${i + 1}`} style={{ width: "100%", height: 90, objectFit: "cover", display: "block" }} />
                <div style={{ position: "absolute", top: 0, right: 0, display: "flex", gap: 2, padding: 2 }}>
                  {i > 0 && (
                    <button onClick={() => moveImage(i, "up")} style={{ background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: 2, cursor: "pointer", fontSize: 11, padding: "2px 5px" }}>{"\u25C0"}</button>
                  )}
                  {i < images.length - 1 && (
                    <button onClick={() => moveImage(i, "down")} style={{ background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: 2, cursor: "pointer", fontSize: 11, padding: "2px 5px" }}>{"\u25B6"}</button>
                  )}
                  <button onClick={() => removeImage(src)} style={{ background: "rgba(192,57,43,0.8)", color: "#fff", border: "none", borderRadius: 2, cursor: "pointer", fontSize: 11, padding: "2px 5px" }}>{"\u00D7"}</button>
                </div>
                <div style={{ position: "absolute", bottom: 0, left: 0, background: "rgba(0,0,0,0.5)", color: "#fff", fontSize: 10, padding: "1px 5px" }}>{i + 1}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save */}
      <button style={{ ...btnPrimary, opacity: saving ? 0.6 : 1 }} onClick={handleSubmit} disabled={saving}>
        {saving ? "Saving..." : project ? "Update Project" : "Create Project"}
      </button>

      {/* Image Picker Modal */}
      {showPicker && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center" }} onClick={() => setShowPicker(false)}>
          <div style={{ background: "#fff", borderRadius: 8, width: "90vw", maxWidth: 800, maxHeight: "80vh", overflow: "hidden", display: "flex", flexDirection: "column" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #d8cdc0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 16, color: "#1e1812" }}>{pickerMode === "cover" ? "Select Cover Image" : "Add Gallery Images"}</h3>
              <button onClick={() => setShowPicker(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#a89a8c" }}>{"\u00D7"}</button>
            </div>
            <div style={{ padding: "12px 20px", borderBottom: "1px solid #e8e0d6", display: "flex", gap: 8, flexWrap: "wrap" }}>
              {Object.keys(folders).map((f) => (
                <button key={f} onClick={() => setPickerFolder(f)} style={{
                  padding: "4px 12px", borderRadius: 4, border: "1px solid #d8cdc0",
                  background: pickerFolder === f ? "#6b4226" : "none",
                  color: pickerFolder === f ? "#fff" : "#3d3228",
                  cursor: "pointer", fontSize: 12,
                }}>{f}</button>
              ))}
            </div>
            <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8 }}>
                {(folders[pickerFolder] || []).map((img) => {
                  const fullPath = `/optimized/${pickerFolder}/${img}`;
                  const isSelected = pickerMode === "gallery" && images.includes(fullPath);
                  return (
                    <div key={img} onClick={() => selectImage(fullPath)} style={{
                      cursor: "pointer", borderRadius: 4, overflow: "hidden",
                      border: isSelected ? "3px solid #6b4226" : "1px solid #d8cdc0",
                      opacity: isSelected ? 0.7 : 1,
                    }}>
                      <img src={fullPath} alt={img} style={{ width: "100%", height: 90, objectFit: "cover", display: "block" }} loading="lazy" />
                    </div>
                  );
                })}
              </div>
            </div>
            {pickerMode === "gallery" && (
              <div style={{ padding: "12px 20px", borderTop: "1px solid #d8cdc0", textAlign: "right" }}>
                <button style={{ padding: "8px 20px", borderRadius: 4, border: "none", background: "#6b4226", color: "#fff", cursor: "pointer", fontSize: 13 }} onClick={() => setShowPicker(false)}>
                  Done ({images.length} selected)
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
FORMCOMP

echo "=== 8. Update admin dashboard ==="
python3 << 'PYFIX'
import re

path = "app/admin/page.tsx"
with open(path, "r") as f:
    content = f.read()

# Check if portfolio card already exists
if "/admin/portfolio" in content:
    print("Portfolio card already in dashboard — skipping")
else:
    # Add portfolio card after the submissions card
    old = '''<div style={cardStyle} onClick={() => router.push("/admin/submissions")}>
          <h3 style={{ margin: "0 0 8px", color: "#1e1812" }}>Contact Submissions</h3>
          <p style={{ margin: 0, color: "#a89a8c", fontSize: 14 }}>View messages from the contact form</p>
        </div>'''

    new = old + '''
        <div style={cardStyle} onClick={() => router.push("/admin/portfolio")}>
          <h3 style={{ margin: "0 0 8px", color: "#1e1812" }}>Portfolio</h3>
          <p style={{ margin: 0, color: "#a89a8c", fontSize: 14 }}>Add, edit, and manage portfolio projects</p>
        </div>'''

    assert old in content, "Could not find submissions card in dashboard"
    content = content.replace(old, new)

    with open(path, "w") as f:
        f.write(content)
    print("Added portfolio card to dashboard")
PYFIX

echo "=== 9. Build & deploy ==="
./deploy.sh

echo ""
echo "=== DONE ==="
echo "Portfolio projects migrated to SQLite (12 projects seeded)"
echo "Admin: /admin/portfolio (list, create, edit, reorder, publish/unpublish)"
echo "Public pages now read from database"
