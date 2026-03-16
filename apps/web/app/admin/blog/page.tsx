"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Post = {
  id: number;
  slug: string;
  title: string;
  date: string;
  published: number;
};

export default function AdminBlogList() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/blog")
      .then((r) => r.json())
      .then((d) => { setPosts(d.posts || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function togglePublished(slug: string, currentState: number) {
    await fetch(`/api/admin/blog/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: currentState ? false : true }),
    });
    setPosts((prev) =>
      prev.map((p) => (p.slug === slug ? { ...p, published: currentState ? 0 : 1 } : p))
    );
  }

  async function deletePost(slug: string) {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    await fetch(`/api/admin/blog/${slug}`, { method: "DELETE" });
    setPosts((prev) => prev.filter((p) => p.slug !== slug));
  }

  const containerStyle: React.CSSProperties = {
    maxWidth: 900, margin: "0 auto", padding: "40px 20px", fontFamily: "Inter, sans-serif",
  };
  const btnSmall: React.CSSProperties = {
    padding: "6px 14px", borderRadius: 4, border: "1px solid #d8cdc0",
    background: "none", cursor: "pointer", fontSize: 13, color: "#3d3228",
  };
  const btnPrimary: React.CSSProperties = {
    padding: "10px 20px", borderRadius: 4, border: "none",
    background: "#6b4226", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 500,
  };

  return (
    <div style={containerStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <a href="/admin" style={{ fontSize: 13, color: "#a89a8c", textDecoration: "none" }}>← Dashboard</a>
          <h1 style={{ margin: "8px 0 0", color: "#1e1812", fontSize: 24 }}>Blog Posts</h1>
        </div>
        <button style={btnPrimary} onClick={() => router.push("/admin/blog/new")}>+ New Post</button>
      </div>

      {loading ? (
        <p style={{ color: "#a89a8c" }}>Loading...</p>
      ) : posts.length === 0 ? (
        <p style={{ color: "#a89a8c" }}>No blog posts yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {posts.map((post) => (
            <div key={post.slug} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "16px 20px", background: "#fff", borderRadius: 8, border: "1px solid #d8cdc0",
            }}>
              <div>
                <h3 style={{ margin: "0 0 4px", color: "#1e1812", fontSize: 16 }}>{post.title}</h3>
                <span style={{ fontSize: 13, color: "#a89a8c" }}>
                  {post.date} &middot;{" "}
                  <span style={{ color: post.published ? "#27ae60" : "#e67e22" }}>
                    {post.published ? "Published" : "Draft"}
                  </span>
                </span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={btnSmall} onClick={() => togglePublished(post.slug, post.published)}>
                  {post.published ? "Unpublish" : "Publish"}
                </button>
                <button style={btnSmall} onClick={() => router.push(`/admin/blog/${post.slug}/edit`)}>Edit</button>
                <button style={{ ...btnSmall, color: "#c0392b", borderColor: "#e0c8c8" }} onClick={() => deletePost(post.slug)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
