"use client";
import { useState, useCallback, useEffect } from "react";

type Props = {
  title: string;
  images: string[];
};

export default function ProjectGallery({ title, images }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const prev = useCallback(() => {
    setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  }, [images.length]);
  const next = useCallback(() => {
    setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  }, [images.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [prev, next]);

  if (!images || images.length === 0) return null;

  return (
    <>
      <div className="br-gallery-viewer">
        <div className="br-gallery-main" onClick={() => setLightboxOpen(true)}>
          <img
            src={images[activeIndex]}
            alt={`${title} — image ${activeIndex + 1} of ${images.length}`}
          />
        </div>
        <div className="br-gallery-thumbs">
          {images.map((src, i) => (
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
        {activeIndex + 1} of {images.length} photos
      </div>

      {lightboxOpen && (
        <div className="br-lightbox" onClick={() => setLightboxOpen(false)}>
          <button className="br-lightbox-close" onClick={() => setLightboxOpen(false)}>{"×"}</button>
          <button className="br-lightbox-nav br-lightbox-prev" onClick={(e) => { e.stopPropagation(); prev(); }}>{"‹"}</button>
          <img
            src={images[activeIndex]}
            alt={`${title} — image ${activeIndex + 1}`}
            onClick={(e) => e.stopPropagation()}
          />
          <button className="br-lightbox-nav br-lightbox-next" onClick={(e) => { e.stopPropagation(); next(); }}>{"›"}</button>
          <div className="br-lightbox-counter">{activeIndex + 1} / {images.length}</div>
        </div>
      )}
    </>
  );
}
