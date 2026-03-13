"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const projects = [
  {
    slug: "breezeway",
    title: "The Breezeway",
    location: "South Asheville",
    tag: "custom",
    cover: "/optimized/breezeway/modern-house-with-wood-and-blue-exterior.jpg",
  },
  {
    slug: "green-river",
    title: "Green River Retreat",
    location: "Green River, NC",
    tag: "custom",
    cover: "/optimized/green-river/stone-accented-house-with-trees-and-landscaping.jpg",
  },
  {
    slug: "195-meadow-creek",
    title: "Meadow Creek",
    location: "Weaverville, NC",
    tag: "custom",
    cover: "/optimized/195-meadow-creek/front-exterior-meadow-creek.jpg",
  },
  {
    slug: "23-woodbine-rd",
    title: "23 Woodbine Road",
    location: "Asheville, NC",
    tag: "custom",
    cover: "/optimized/23-woodbine-rd/modern-two-story-house-with-wood-accents.jpg",
  },
  {
    slug: "crown-point",
    title: "Crown Point",
    location: "Asheville, NC",
    tag: "remodel",
    cover: "/optimized/crown-point/open-kitchen-with-island-and-stone-fireplace.jpg",
  },
  {
    slug: "preston-ct",
    title: "Preston Court",
    location: "Weaverville, NC",
    tag: "remodel",
    cover: "/optimized/preston-ct/contemporary-kitchen-with-island-and-pendant-lights.jpg",
  },
  {
    slug: "stewart-st",
    title: "Stewart Street",
    location: "Asheville, NC",
    tag: "custom",
    cover: "/optimized/stewart-st/cozy-white-bungalow-with-front-porch.jpg",
  },
  {
    slug: "90-covey-dr",
    title: "90 Covey Drive",
    location: "Weaverville, NC",
    tag: "custom",
    cover: "/optimized/90-covey-dr/two-story-house-with-stone-facade-and-driveway.jpg",
  },
  {
    slug: "duck-dr",
    title: "Duck Drive",
    location: "Mars Hill, NC",
    tag: "custom",
    cover: "/optimized/duck-dr/cozy-cottage-with-wooden-porch-and-lush-greenery.jpg",
  },
  {
    slug: "280-settlers-cove",
    title: "280 Settlers Cove",
    location: "Weaverville, NC",
    tag: "custom",
    cover: "/optimized/280-settlers-cove/gray-house-with-gabled-roof-and-lush-greenery.webp",
  },
  {
    slug: "660-settlers-cove",
    title: "660 Settlers Cove",
    location: "Weaverville, NC",
    tag: "custom",
    cover: "/optimized/660-settlers-cove/charming-house-with-stone-facade-and-lush-trees.webp",
  },
  {
    slug: "robin-porch",
    title: "Robin Porch",
    location: "Charlotte, NC",
    tag: "addition",
    cover: "/optimized/robin-porch/cozy-screened-porch-with-wooded-view.jpg",
  },
];

const filters = [
  { label: "All Projects", value: "all" },
  { label: "Custom Homes", value: "custom" },
  { label: "Remodeling", value: "remodel" },
  { label: "Additions", value: "addition" },
];

export default function PortfolioPage() {
  const [activeFilter, setActiveFilter] = useState("all");

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
