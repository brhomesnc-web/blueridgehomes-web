import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import BlogMarkdown from "@/components/BlogMarkdown";
import { getPostBySlug, getAllSlugs } from "@/lib/blog";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

// Dynamic, not ISR, and deliberately so: this is the only blog route that calls
// notFound(). Under `export const revalidate` Next caches the 404 CONTENT but
// not the 404 STATUS — the not-found body renders while the response is still
// served as 200 with x-nextjs-cache: HIT. Verified on this deployment against a
// row confirmed published = false: the regenerated artifact contained the
// not-found markup and the origin still answered 200. A human saw the 404 page;
// crawlers and every status-code consumer saw a live post.
//
// force-dynamic costs a function invocation per request and buys a status code
// that is true, which is the right trade for the one route whose status has to
// be. /blog and /sitemap.xml keep revalidate = 60 (fc5ea9c) — they list
// published posts, never call notFound(), and their caching is worth keeping.
//
// Do NOT add a revalidate export back here or "optimize" this to static. The two
// are contradictory, and it silently reintroduces the 200-status bug: the DB
// write, the revalidatePath call and the rendered body would all still look
// correct. generateStaticParams below is left alone — under force-dynamic it
// simply stops prerendering, and removing it is a separate decision.
export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      images: post.featuredImage ? [{ url: post.featuredImage }] : [],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: {
      "@type": "Organization",
      name: "Blue Ridge Homes",
      url: "https://blueridgehomesnc.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Blue Ridge Homes",
    },
    image: post.featuredImage
      ? `https://blueridgehomesnc.com${post.featuredImage}`
      : undefined,
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero image */}
      {post.featuredImage && (
        <div className="br-blog-hero">
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            priority
            sizes="100vw"
            style={{ objectFit: "cover" }}
          />
          <div className="br-blog-hero-overlay" />
        </div>
      )}

      <article className="br-section" style={{ paddingTop: 48 }}>
        <div className="br-blog-article">
          {/* Back link */}
          <Link
            href="/blog"
            style={{
              color: "var(--br-body)",
              fontSize: "0.9rem",
              display: "inline-block",
              marginBottom: 24,
              textDecoration: "none",
            }}
          >
            ← Back to Blog
          </Link>

          {/* Meta */}
          <time className="br-blog-date" style={{ display: "block", marginBottom: 8 }}>
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              // date is a bare YYYY-MM-DD, which parses as UTC midnight.
              timeZone: "UTC",
            })}
          </time>
          <h1
            className="font-serif"
            style={{
              fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
              fontWeight: 600,
              color: "var(--br-heading)",
              lineHeight: 1.25,
              marginBottom: 32,
            }}
          >
            {post.title}
          </h1>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 32 }}>
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--br-body)",
                    border: "1px solid var(--br-line)",
                    borderRadius: 4,
                    padding: "3px 10px",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="br-blog-prose">
            <BlogMarkdown>{post.content}</BlogMarkdown>
          </div>

          {/* CTA */}
          <div
            style={{
              marginTop: 56,
              padding: "32px 0",
              borderTop: "1px solid var(--br-line)",
              textAlign: "center",
            }}
          >
            <p
              className="font-serif"
              style={{
                fontSize: "1.4rem",
                color: "var(--br-heading)",
                marginBottom: 16,
              }}
            >
              Ready to start your project?
            </p>
            <Link
              href="/contact"
              style={{
                display: "inline-block",
                padding: "12px 32px",
                backgroundColor: "var(--br-accent, #6b4226)",
                color: "#fff",
                borderRadius: 4,
                textDecoration: "none",
                fontSize: "0.95rem",
                fontWeight: 500,
              }}
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
