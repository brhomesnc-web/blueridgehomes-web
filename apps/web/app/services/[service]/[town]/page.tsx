import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { serviceLocations, type ServiceLocation } from "@/lib/serviceLocations";
import { getProjectBySlug, type PortfolioProject } from "@/lib/portfolio";

/**
 * Service x location pages: /services/<service>/<town>.
 *
 * STATIC, with no `dynamic` and no `revalidate` export. Both existing page families
 * (app/services/<slug> and app/service-areas/<slug>) are prerendered with neither,
 * and this matches them. dynamicParams = false means an unlisted combination is a
 * real 404 at the routing layer rather than a render.
 *
 * This route calls notFound(), which is why app/services/loading.tsx was removed in
 * the same commit. A segment-level loading.tsx wraps the whole app/services segment
 * in a Suspense boundary and streams its fallback before the page component runs;
 * once any HTML is flushed the status is locked at 200, so notFound() would render
 * the 404 body while the response stayed 200. That is the exact bug documented for
 * app/blog in tests/unpublish.test.ts:196-205. tests/service-locations.test.ts pins
 * the absence for this segment too.
 *
 * Styling is the br-* global CSS system, matching app/service-areas/<town>/page.tsx.
 * Not PageWrapper, not Tailwind — only the orphaned app/services/page.tsx does that
 * and it is not the pattern anything else follows.
 */

type Params = { service: string; town: string };

export const dynamicParams = false;

export async function generateStaticParams() {
  // From the data module, deliberately NOT from the database. Nothing about which
  // service x town pages exist is a runtime fact.
  return serviceLocations.map((entry) => ({
    service: entry.service,
    town: entry.town,
  }));
}

function findEntry(service: string, town: string): ServiceLocation | undefined {
  return serviceLocations.find((e) => e.service === service && e.town === town);
}

/** Split a \n\n-separated copy field into paragraphs. */
function paragraphs(text: string): string[] {
  return text
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean);
}

/**
 * Display labels for the service slugs, matching the names already used in
 * app/page.tsx and the root layout's hasOfferCatalog. Kept local because
 * ServiceLocation carries the slug only.
 */
const SERVICE_LABEL: Record<string, string> = {
  "custom-homes": "Custom Homes",
  remodeling: "Remodeling",
  additions: "Home Additions",
  "icf-construction": "ICF Construction",
  consulting: "Construction Consulting",
};

/**
 * Towns that actually have a /service-areas/<town> page to link back to. Asheville
 * is deliberately absent: the root layout's JSON-LD areaServed claims the city, but
 * no /service-areas/asheville route was ever built and linking to one would 404.
 */
const SERVICE_AREA_PAGES = new Set([
  "weaverville",
  "hendersonville",
  "black-mountain",
  "mills-river",
  "brevard",
]);

export async function generateMetadata(
  { params }: { params: Promise<Params> }
): Promise<Metadata> {
  const { service, town } = await params;
  const entry = findEntry(service, town);
  if (!entry) return {};
  return {
    // No "| Blue Ridge Homes" here. The root layout applies
    // template: "%s | Blue Ridge Homes" already.
    title: entry.metaTitle,
    description: entry.metaDescription,
    alternates: { canonical: `/services/${service}/${town}` },
  };
}

export default async function ServiceLocationPage(
  { params }: { params: Promise<Params> }
) {
  const { service, town } = await params;
  const entry = findEntry(service, town);
  if (!entry) notFound();

  const loaded = await Promise.all(
    entry.projectSlugs.map((slug) => getProjectBySlug(slug))
  );

  // getProjectBySlug does NOT filter on published — /portfolio/[slug] relies on
  // that, so the filter belongs at this call site rather than in the shared
  // function. A row that is not published is simply omitted; if that empties the
  // list, the project section does not render and the rest of the page still does.
  const projects = loaded.filter(
    (p): p is PortfolioProject => p !== null && p.published === true
  );

  const heroImage = projects.find((p) => p.cover)?.cover ?? null;
  const serviceLabel = SERVICE_LABEL[entry.service] ?? entry.service;
  const siblings = serviceLocations.filter(
    (e) => e.town === entry.town && e.service !== entry.service
  );
  const canonicalUrl = `https://blueridgehomesnc.com/services/${entry.service}/${entry.town}`;

  // PAGE-SCOPED structured data only. The root layout already emits one site-wide
  // HomeBuilder/GeneralContractor block naming every service and town; a second
  // global block would duplicate it.
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: entry.heading,
    serviceType: serviceLabel,
    description: entry.metaDescription,
    url: canonicalUrl,
    provider: {
      "@type": "HomeBuilder",
      name: "Blue Ridge Homes",
      url: "https://blueridgehomesnc.com",
    },
    areaServed: [
      { "@type": "City", name: `${entry.townDisplay}, NC` },
      { "@type": "AdministrativeArea", name: `${entry.county}, NC` },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entry.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  return (
    <main className="br-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="br-shell br-marble">
        <div className="br-content">

          {/* Hero */}
          <section className="br-hero-wrap">
            <div className="br-hero-full">
              {heroImage ? (
                <div className="br-hero-media">
                  <div className="br-hero-image-wrap">
                    <Image
                      src={heroImage}
                      alt={`${serviceLabel} by Blue Ridge Homes in ${entry.townDisplay}, NC`}
                      fill
                      priority
                      className="br-hero-image"
                      sizes="100vw"
                    />
                  </div>
                </div>
              ) : null}
              <div className="br-hero-overlay-gradient" />
              <div className="br-hero-copy">
                <h1 className="br-hero-title">{entry.heading}</h1>
                <p className="br-hero-subtitle">
                  {`${serviceLabel} in ${entry.townDisplay} and throughout ${entry.county}.`}
                </p>
                <div className="br-button-row">
                  <Link href="/contact" className="br-button br-button-primary">
                    {"Start Your Project →"}
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Intro */}
          <section className="br-section">
            <div className="br-container">
              <Link href={`/services/${entry.service}`} className="br-project-back">
                {`← All ${serviceLabel}`}
              </Link>
              <h2 className="br-title br-title-center">
                {`${serviceLabel} in ${entry.townDisplay}`}
              </h2>
              {paragraphs(entry.intro).map((text, i) => (
                <p
                  key={i}
                  className="br-lead"
                  style={{ maxWidth: 820, margin: "0 auto 16px", textAlign: "center" }}
                >
                  {text}
                </p>
              ))}
            </div>
          </section>

          <div className="br-divider-strip">
            <img
              src="/optimized/dividers/divider-asheville.jpg"
              alt={`Blue Ridge Mountains near ${entry.townDisplay}, NC`}
            />
          </div>

          {/* Local detail */}
          <section className="br-section br-section-alt">
            <div className="br-container">
              <h2 className="br-title">
                {`Building in ${entry.townDisplay}: What the Site Decides`}
              </h2>
              {entry.detail.map((section) => (
                <div key={section.heading} className="br-detail-block">
                  <h3 className="br-subhead">{section.heading}</h3>
                  {paragraphs(section.body).map((text, i) => (
                    <p key={i} className="br-lead" style={{ maxWidth: 820 }}>
                      {text}
                    </p>
                  ))}
                  {section.facts ? (
                    <table className="br-facts">
                      {section.facts.caption ? (
                        <caption className="br-facts-caption">
                          {section.facts.caption}
                        </caption>
                      ) : null}
                      <tbody>
                        {section.facts.rows.map((row) => (
                          <tr key={row.label}>
                            <th scope="row">{row.label}</th>
                            <td>{row.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : null}
                </div>
              ))}
            </div>
          </section>

          {/* Projects — omitted entirely when nothing published resolves */}
          {projects.length > 0 ? (
            <section className="br-section">
              <div className="br-container">
                <h2 className="br-title br-title-center">
                  {`Our ${serviceLabel} Work in ${entry.townDisplay}`}
                </h2>
                <div className="br-portfolio-grid">
                  {projects.map((project) => (
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
                          <h3 className="br-portfolio-card-title">{project.title}</h3>
                          <div className="br-portfolio-card-meta">{project.location}</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          {/* FAQ */}
          <section className="br-section br-section-alt">
            <div className="br-container">
              <h2 className="br-title br-title-center">
                {`${serviceLabel} in ${entry.townDisplay}: Common Questions`}
              </h2>
              <div className="br-commitment-list" style={{ maxWidth: 820, margin: "0 auto" }}>
                {entry.faqs.map((faq) => (
                  <div key={faq.q} className="br-commitment-item">
                    <span className="br-commitment-icon">{"✓"}</span>
                    <div>
                      <h3 className="br-commitment-title">{faq.q}</h3>
                      <p className="br-commitment-body">{faq.a}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Related — the reciprocal links this repo has never had */}
          <section className="br-section">
            <div className="br-container">
              <p
                className="br-lead"
                style={{ textAlign: "center", maxWidth: 760, margin: "0 auto" }}
              >
                {`More about our work in ${entry.townDisplay}: `}
                <Link href={`/services/${entry.service}`}>
                  {`${serviceLabel} across Western North Carolina`}
                </Link>
                {siblings.map((sibling) => (
                  <span key={sibling.service}>
                    {", "}
                    <Link href={`/services/${sibling.service}/${sibling.town}`}>
                      {`${SERVICE_LABEL[sibling.service] ?? sibling.service} in ${sibling.townDisplay}`}
                    </Link>
                  </span>
                ))}
                {SERVICE_AREA_PAGES.has(entry.town) ? (
                  <>
                    {", "}
                    <Link href={`/service-areas/${entry.town}`}>
                      {`everything we build in ${entry.townDisplay}`}
                    </Link>
                  </>
                ) : null}
                {"."}
              </p>
            </div>
          </section>

          {/* CTA */}
          <div className="br-closing-sequence">
            <section className="br-section br-cta br-closing-cta">
              <div className="br-container">
                <h2 className="br-title br-title-center">
                  {`Planning a Project in ${entry.townDisplay}?`}
                </h2>
                <p className="br-lead br-cta-copy">
                  {"Tell us about the property and what you have in mind. We will tell you what it actually takes."}
                </p>
                <div className="br-cta-actions">
                  <Link href="/contact" className="br-button br-button-primary">
                    {"Start the Conversation →"}
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
