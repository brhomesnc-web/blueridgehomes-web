"use client";
import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Project = {
  title: string;
  location: string;
  type: string;
  description: string;
  cover: string;
  images: string[];
};

const projects: Record<string, Project> = {
  "breezeway": {
    title: "The Breezeway",
    location: "South Asheville",
    type: "Custom Home \u2014 ICF Construction",
    description: "A modern ICF-built home featuring wood and steel exterior accents, open living spaces with floor-to-ceiling windows, and a contemporary kitchen. Built with insulated concrete forms for superior energy efficiency and comfort.",
    cover: "/optimized/breezeway/modern-house-with-wood-and-blue-exterior.jpg",
    images: [
      "modern-house-with-wood-and-blue-exterior.jpg",
      "modern-house-with-wood-and-blue-paneling.jpg",
      "modern-house-with-large-windows-at-dusk.jpg",
      "bright-living-room-with-modern-furniture-and-large-windows.jpg",
      "bright-living-room-with-large-window-fireplace-shelves.jpg",
      "bright-living-room-with-modern-decor-and-large-windows.jpg",
      "contemporary-kitchen-with-stainless-steel-appliances.jpg",
      "modern-kitchen-and-living-area-with-red-chairs.jpg",
      "modern-kitchen-with-dark-cabinets-and-blue-backsplash.jpg",
      "cozy-bedroom-with-large-windows-and-stylish-decor.jpg",
      "bright-bedroom-with-large-windows-and-metal-bed.jpg",
      "bright-bedroom-with-large-windows-and-natural-light.jpg",
      "modern-bathroom-with-red-vanity-and-glass-shower.jpg",
      "modern-bathroom-with-tub-and-dual-sinks.jpg",
      "modern-entryway-with-stairs-and-plants.jpg",
      "spacious-deck-with-modern-furniture-and-mountain-view.jpg",
      "green-door-with-wreath-and-interior-view.jpg",
    ].map(f => "/optimized/breezeway/" + f),
  },
  "green-river": {
    title: "Green River Retreat",
    location: "Green River, NC",
    type: "Custom Home \u2014 ICF Construction",
    description: "A custom ICF home nestled in a wooded setting along the Green River. Stone accents, expansive windows framing forest views, and a modern open floor plan with high ceilings throughout.",
    cover: "/optimized/green-river/stone-accented-house-with-trees-and-landscaping.jpg",
    images: [
      "stone-accented-house-with-trees-and-landscaping.jpg",
      "house-with-trees-and-stone-accents.jpg",
      "dark-colored-house-with-garage-in-wooded-area.jpg",
      "modern-house-with-trees-and-stone-path.jpg",
      "cozy-home-surrounded-by-lush-greenery.jpg",
      "modern-garage-with-stone-accents-and-lush-greenery.jpg",
      "living-room-with-large-windows-and-forest-view.jpg",
      "living-room-with-tall-windows-and-forest-view.jpg",
      "large-windows-and-high-ceiling-in-living-area.jpg",
      "cozy-living-room-with-large-windows-and-sofa.jpg",
      "modern-kitchen-with-island-and-wooden-cabinets.jpg",
      "modern-hallway-with-wood-floors-and-accent-lighting.jpg",
      "hallway-with-recessed-lighting-and-window-view.jpg",
      "modern-bathroom-with-purple-lighting-and-forest-view.jpg",
      "modern-bathroom-with-purple-lighting-and-large-windows.jpg",
      "backyard-view-with-pond-and-forest.jpg",
    ].map(f => "/optimized/green-river/" + f),
  },
  "195-meadow-creek": {
    title: "Meadow Creek",
    location: "Weaverville, NC",
    type: "Custom Home",
    description: "A timber-and-stone family home in Weaverville with a wraparound porch, stone fireplace, and open-concept living. Custom millwork throughout with hardwood floors and a covered walkway connecting to a detached garage.",
    cover: "/optimized/195-meadow-creek/front-exterior-meadow-creek.jpg",
    images: [
      "front-exterior-meadow-creek.jpg",
      "spacious-house-with-stone-accents-and-large-driveway.jpg",
      "house-with-stone-facade-and-small-porch.jpg",
      "exterior-view-of-a-cozy-house-with-a-porch.jpg",
      "rustic-stone-chimney-and-siding.jpg",
      "covered-walkway-with-lush-garden-and-plants.jpg",
      "inviting-stone-patio-with-seating-and-plants.jpg",
      "living-room-with-stone-fireplace-and-large-windows.jpg",
      "open-concept-kitchen-and-living-space-with-fireplace.jpg",
      "spacious-kitchen-with-island-and-dining-table.jpg",
      "elegant-kitchen-with-stainless-steel-appliances.jpg",
      "open-dining-area-with-glass-table-and-upholstered-chairs.jpg",
      "bright-living-room-with-large-windows-and-cozy-seating.jpg",
      "bright-bedroom-with-large-windows-and-wooden-bed.jpg",
      "staircase-with-decorative-wall-art-and-sink.jpg",
    ].map(f => "/optimized/195-meadow-creek/" + f),
  },
  "23-woodbine-rd": {
    title: "23 Woodbine Road",
    location: "Asheville, NC",
    type: "Custom Home",
    description: "A contemporary two-story custom build in Asheville featuring cable railings, floor-to-ceiling windows, and a minimalist design approach. Clean lines throughout with modern bathrooms and an open deck overlooking the property.",
    cover: "/optimized/23-woodbine-rd/modern-two-story-house-with-wood-accents.jpg",
    images: [
      "modern-two-story-house-with-wood-accents.jpg",
      "contemporary-two-story-home-with-deck.jpg",
      "contemporary-staircase-with-cable-railing.jpg",
      "living-room-with-large-windows-and-open-deck.jpg",
      "minimalist-room-with-large-windows-and-wood-flooring.jpg",
      "home-office-with-deck-and-outdoor-seating.jpg",
      "modern-entryway-with-mirror-and-cabinet.jpg",
      "modern-bedroom-with-large-windows-and-a-bed.jpg",
      "modern-bedroom-with-art-and-ensuite-bathroom.jpg",
      "contemporary-bedroom-with-dresser-and-wall-art.jpg",
      "contemporary-bathroom-with-dark-tiles-and-freestanding-tub.jpg",
      "modern-bathroom-with-double-vanity-and-glass-shower.jpg",
      "modern-bathroom-with-glass-shower-and-bathtub.jpg",
      "modern-bathroom-with-shower-and-vanity.jpg",
      "laundry-room-with-wood-flooring-and-metal-sink.jpg",
    ].map(f => "/optimized/23-woodbine-rd/" + f),
  },
  "crown-point": {
    title: "Crown Point",
    location: "Asheville, NC",
    type: "Whole Home Remodel",
    description: "A complete whole home renovation featuring a new open-concept kitchen with exposed beams, custom wet bar, updated bathrooms, and a stone patio with mountain views.",
    cover: "/optimized/crown-point/open-kitchen-with-island-and-stone-fireplace.jpg",
    images: [
      "open-kitchen-with-island-and-stone-fireplace.jpg",
      "modern-kitchen-with-large-island-and-pendant-lights.jpg",
      "open-concept-kitchen-with-wooden-beams-and-island.jpg",
      "modern-kitchen-with-wooden-beams-and-island.jpg",
      "spacious-kitchen-and-dining-area-with-wooden-beams.jpg",
      "spacious-kitchen-with-island-and-wooden-floors.jpg",
      "spacious-living-room-with-large-windows-and-chandelier.jpg",
      "elegant-wooden-wet-bar-with-glass-cabinets.jpg",
      "modern-lighting-and-wet-bar-with-wooden-floors.jpg",
      "modern-staircase-with-wooden-steps-and-railing.jpg",
      "elegant-bathroom-with-bathtub-and-glass-shower.jpg",
      "elegant-bathroom-with-double-vanity-and-large-shower.jpg",
      "modern-bathroom-with-wooden-cabinetry-and-glass-shower.jpg",
      "spacious-shower-with-grey-tiles.jpg",
      "dark-wood-cabinetry-with-brass-handles.jpg",
      "scenic-mountain-view-from-a-stone-patio.jpg",
    ].map(f => "/optimized/crown-point/" + f),
  },
  "preston-ct": {
    title: "Preston Court",
    location: "Weaverville, NC",
    type: "Whole Home Remodel",
    description: "A whole home remodel transforming a dated interior into a vibrant, personality-filled space. New kitchen with island, custom built-ins, refined dining spaces, and an eclectic design throughout.",
    cover: "/optimized/preston-ct/contemporary-kitchen-with-island-and-pendant-lights.jpg",
    images: [
      "contemporary-kitchen-with-island-and-pendant-lights.jpg",
      "modern-kitchen-with-island-and-cabinetry.jpg",
      "spacious-kitchen-with-island-and-seating.jpg",
      "stylish-dining-room-with-wooden-table-and-chandelier.jpg",
      "dining-room-with-wooden-table-and-black-chairs.jpg",
      "dining-nook-with-round-table-and-bench-seating.jpg",
      "elegant-dining-area-with-wall-art-and-sconces.jpg",
      "elegant-home-bar-with-shelving-and-mini-fridge.jpg",
      "stylish-stairway-with-patterned-carpet.jpg",
      "elegant-bathroom-with-decorative-wallpaper.jpg",
      "wooden-front-door-with-sideboard-and-lamp.jpg",
      "wooden-sideboard-with-mirror-and-lamps.jpg",
    ].map(f => "/optimized/preston-ct/" + f),
  },
  "stewart-st": {
    title: "Stewart Street",
    location: "Asheville, NC",
    type: "Custom Home",
    description: "A custom bungalow on Stewart Street built using modular construction methods. Crane-set sections assembled on site with custom finishes throughout.",
    cover: "/optimized/stewart-st/cozy-white-bungalow-with-front-porch.jpg",
    images: [
      "cozy-white-bungalow-with-front-porch.jpg",
      "crane-lifting-a-modular-home-section.jpg",
      "crane-lifting-building-materials-on-site.jpg",
      "modular-home-on-trailer-with-construction-materials.jpg",
    ].map(f => "/optimized/stewart-st/" + f),
  },
  "90-covey-dr": {
    title: "90 Covey Drive",
    location: "Weaverville, NC",
    type: "Custom Home",
    description: "A stone-and-siding custom home with a traditional craftsman exterior, open living areas, and a well-appointed kitchen with hardwood floors throughout.",
    cover: "/optimized/90-covey-dr/two-story-house-with-stone-facade-and-driveway.jpg",
    images: [
      "two-story-house-with-stone-facade-and-driveway.jpg",
      "two-story-house-with-stone-facade-and-garage.jpg",
      "stone-exterior-house-with-gabled-roof.jpg",
      "spacious-living-room-with-fireplace-and-large-windows.jpg",
      "cozy-kitchen-with-light-wood-cabinets-and-hardwood-floor.jpg",
      "modern-kitchen-with-wood-cabinets-and-granite-countertop.jpg",
      "modern-kitchen-with-wooden-cabinets-and-appliances.jpg",
    ].map(f => "/optimized/90-covey-dr/" + f),
  },
  "duck-dr": {
    title: "Duck Drive",
    location: "Mars Hill, NC",
    type: "Custom Home",
    description: "A cozy mountain cottage with a covered front porch, open living and kitchen layout, and a warm interior designed for comfortable mountain living.",
    cover: "/optimized/duck-dr/cozy-cottage-with-wooden-porch-and-lush-greenery.jpg",
    images: [
      "cozy-cottage-with-wooden-porch-and-lush-greenery.jpg",
      "gray-house-with-a-wooden-porch-and-stairs.jpg",
      "open-living-space-with-a-kitchen-and-fireplace.jpg",
      "living-room-with-fireplace-and-ceiling-fan.jpg",
      "modern-kitchen-with-dark-cabinets-and-island.jpg",
      "modern-kitchen-with-island-and-pendant-lights.jpg",
      "modern-bathroom-with-tub-and-vanity.jpg",
      "room-with-large-windows-and-hardwood-floors.jpg",
    ].map(f => "/optimized/duck-dr/" + f),
  },
  "280-settlers-cove": {
    title: "280 Settlers Cove",
    location: "Weaverville, NC",
    type: "Custom Home",
    description: "A custom home featuring a stone fireplace, screened porch overlooking the woods, and a warm kitchen with wood cabinetry. Designed to take full advantage of the wooded lot.",
    cover: "/optimized/280-settlers-cove/gray-house-with-gabled-roof-and-lush-greenery.webp",
    images: [
      "gray-house-with-gabled-roof-and-lush-greenery.webp",
      "two-story-house-with-large-windows-and-lush-greenery.webp",
      "cozy-living-room-with-stone-fireplace-and-leather-sofas.webp",
      "living-room-with-stone-fireplace-and-dining-area.webp",
      "open-living-room-with-leather-sofa-and-ceiling-fan.webp",
      "warm-kitchen-with-wooden-cabinets-and-black-appliances.webp",
      "bathroom-with-double-vanity-and-hardwood-floor.jpg",
      "deck-with-railing-and-screened-porch-surrounded-by-trees.jpg",
      "screened-porch-with-wooden-deck-and-ceiling-fan.jpg",
      "screened-porch-with-wooden-flooring-and-ceiling-fan.jpg",
    ].map(f => "/optimized/280-settlers-cove/" + f),
  },
  "660-settlers-cove": {
    title: "660 Settlers Cove",
    location: "Weaverville, NC",
    type: "Custom Home",
    description: "A charming stone-facade custom home surrounded by mature trees. Hardwood floors, stone fireplace, covered porch, and a spacious kitchen with custom cabinetry.",
    cover: "/optimized/660-settlers-cove/charming-house-with-stone-facade-and-lush-trees.webp",
    images: [
      "charming-house-with-stone-facade-and-lush-trees.webp",
      "two-story-house-with-garage-and-trees.webp",
      "green-house-with-double-garage-and-trees.webp",
      "aerial-view-of-a-house-amidst-trees-and-driveway.webp",
      "living-room-with-hardwood-floors-and-stone-fireplace.webp",
      "spacious-kitchen-with-wooden-cabinets-and-island.webp",
      "spacious-dining-room-with-hardwood-floors.webp",
      "spacious-room-with-hardwood-floors-and-chandelier.webp",
      "covered-porch-with-wooden-deck-and-forest-view.webp",
      "screened-porch-with-wooded-view-and-ceiling-fan.webp",
    ].map(f => "/optimized/660-settlers-cove/" + f),
  },
  "robin-porch": {
    title: "Robin Porch",
    location: "Charlotte, NC",
    type: "Addition",
    description: "A screened porch addition with a ceiling fan, wicker furnishings, and a view into the surrounding woods. Designed to extend the living space outdoors while staying protected.",
    cover: "/optimized/robin-porch/cozy-screened-porch-with-wooded-view.jpg",
    images: [
      "cozy-screened-porch-with-wooded-view.jpg",
      "cozy-porch-with-ceiling-fan-and-wooded-view.jpg",
      "cozy-porch-with-wicker-chair-and-outdoor-deck.jpg",
      "cozy-porch-with-wicker-chairs-and-lamp.jpg",
      "cozy-sunroom-with-wicker-furniture-and-a-lamp.jpg",
      "cozy-wicker-chairs-with-floral-cushions.jpg",
      "screened-porch-with-ceiling-fan-and-trees.jpg",
    ].map(f => "/optimized/robin-porch/" + f),
  },
};

export default function ProjectPage() {
  const params = useParams();
  const slug = params.slug as string;
  const project = projects[slug];
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

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
                {/* Main Image */}
                <div className="br-gallery-main" onClick={() => setLightboxOpen(true)}>
                  <img
                    src={project.images[activeIndex]}
                    alt={`${project.title} \u2014 image ${activeIndex + 1} of ${project.images.length}`}
                  />
                </div>
                {/* Thumbnail Strip */}
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
                <h2 className="br-title br-title-center">
                  Like What You See?
                </h2>
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
