import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Markdown from "react-markdown";
import { getPostBySlug, getAllSlugs } from "@/lib/blog";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
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
  const post = getPostBySlug(slug);
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
      url: "https://www.brhomesnc.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Blue Ridge Homes",
    },
    image: post.featuredImage
      ? `https://www.brhomesnc.com${post.featuredImage}`
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
            \u2190 Back to Blog
          </Link>

          {/* Meta */}
          <time className="br-blog-date" style={{ display: "block", marginBottom: 8 }}>
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
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
            <Markdown>{post.content}</Markdown>
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
