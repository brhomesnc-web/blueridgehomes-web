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
