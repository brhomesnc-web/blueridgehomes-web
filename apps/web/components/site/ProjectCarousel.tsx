"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

type Project = {
  title: string;
  location: string;
  type: string;
  slug: string;
  image: string;
};

export default function ProjectCarousel({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const len = projects.length;

  const goTo = useCallback(
    (idx: number) => setActive(((idx % len) + len) % len),
    [len]
  );

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setActive((p) => (p + 1) % len), 4500);
    return () => clearInterval(id);
  }, [paused, len]);

  function getStyle(i: number) {
    let diff = i - active;
    if (diff > len / 2) diff -= len;
    if (diff < -len / 2) diff += len;

    const abs = Math.abs(diff);
    if (abs > 2) return { display: "none" } as React.CSSProperties;

    const tx = diff * 240;
    const sc = diff === 0 ? 1 : 0.75;
    const z = 10 - abs;
    const op = diff === 0 ? 1 : 0.6;
    const ry = diff < 0 ? 25 : diff > 0 ? -25 : 0;

    return {
      transform: `translateX(${tx}px) scale(${sc}) rotateY(${ry}deg)`,
      zIndex: z,
      opacity: op,
    } as React.CSSProperties;
  }

  return (
    <div
      className="br-coverflow"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="br-coverflow-stage">
        {projects.map((project, i) => (
          <Link
            key={project.slug}
            href={`/portfolio/${project.slug}`}
            className={`br-coverflow-card ${i === active ? "br-coverflow-active" : ""}`}
            style={getStyle(i)}
            onClick={(e) => {
              if (i !== active) {
                e.preventDefault();
                goTo(i);
              }
            }}
          >
            <Image
              src={project.image}
              alt={`${project.title} — ${project.type} in ${project.location}`}
              fill
              className="br-coverflow-image"
              sizes="(max-width: 768px) 70vw, 420px"
              priority={i === 0}
            />
            <div className="br-coverflow-overlay" />
            <div className="br-coverflow-caption">
              <span className="br-coverflow-title">{project.title}</span>
              <span className="br-coverflow-meta">
                {project.type} &middot; {project.location}
              </span>
            </div>
          </Link>
        ))}
      </div>

      <button
        className="br-coverflow-arrow br-coverflow-arrow-left"
        onClick={() => goTo(active - 1)}
        aria-label="Previous"
      >
        ‹
      </button>
      <button
        className="br-coverflow-arrow br-coverflow-arrow-right"
        onClick={() => goTo(active + 1)}
        aria-label="Next"
      >
        ›
      </button>
    </div>
  );
}
