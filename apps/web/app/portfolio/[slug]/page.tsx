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
