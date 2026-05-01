import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectBySlug, getPublishedProjects } from "@/lib/portfolio";
import ProjectGallery from "./ProjectGallery";

type Params = { slug: string };

export async function generateStaticParams() {
  const projects = await getPublishedProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<Params> }
): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) {
    return { title: "Project Not Found" };
  }

  const city = project.location.split(",")[0].trim();
  const title = `${project.title} in ${city}`;
  const description = project.description
    ? project.description.slice(0, 155)
    : `${project.type} project by Blue Ridge Homes in ${project.location}.`;

  return {
    title,
    description,
    alternates: { canonical: `/portfolio/${slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      images: project.cover ? [{ url: project.cover }] : [],
    },
  };
}

export default async function ProjectPage(
  { params }: { params: Promise<Params> }
) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <main className="br-page">
      <div className="br-shell br-marble">
        <div className="br-content">

          {/* Header */}
          <section className="br-section" style={{ paddingBottom: 0 }}>
            <div className="br-container">
              <Link href="/portfolio" className="br-project-back">{"← Back to Portfolio"}</Link>
              <h1 className="br-title" style={{ marginBottom: 4 }}>{project.title}</h1>
              <p className="br-project-meta">{project.location} &middot; {project.type}</p>
              <p className="br-project-desc" style={{ marginTop: 12 }}>{project.description}</p>
            </div>
          </section>

          {/* Gallery Viewer */}
          <section className="br-section">
            <div className="br-container">
              <ProjectGallery title={project.title} images={project.images} />
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
