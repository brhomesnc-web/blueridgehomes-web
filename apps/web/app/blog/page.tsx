import Link from "next/link";
import Image from "next/image";
import { getAllPosts } from "@/lib/blog";

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <main>
      {/* Hero */}
      <section className="br-section" style={{ paddingTop: "60px", paddingBottom: "40px" }}>
        <div className="br-container" style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <h1
            className="font-serif"
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 600,
              color: "var(--br-heading)",
              marginBottom: 12,
            }}
          >
            Insights &amp; Guidance
          </h1>
          <p style={{ color: "var(--br-body)", fontSize: "1.1rem", maxWidth: 600, margin: "0 auto" }}>
            Practical advice on building, remodeling, and living in Western North Carolina &mdash; from a
            builder who&apos;s been doing it for over 20 years.
          </p>
        </div>
      </section>

      {/* Post Grid */}
      <section className="br-section" style={{ paddingTop: 0 }}>
        <div
          className="br-container"
          style={{
            maxWidth: 1000,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 440px), 1fr))",
            gap: 32,
          }}
        >
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="br-blog-card"
            >
              {post.featuredImage && (
                <div className="br-blog-card-image">
                  <Image
                    src={post.featuredImage}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 480px"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              )}
              <div className="br-blog-card-body">
                <time className="br-blog-date">
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
                <h2 className="br-blog-card-title">{post.title}</h2>
                <p className="br-blog-card-desc">{post.description}</p>
                <span className="br-blog-read-more">Read more \u2192</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
