"use client";
import ImagePicker from "@/components/admin/ImagePicker";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

type Post = {
  slug: string;
  title: string;
  date: string;
  description: string;
  content: string;
  featured_image: string;
  tags: string;
  published: number;
};

export default function AdminBlogEdit() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [tags, setTags] = useState("");
  const [published, setPublished] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/blog/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.post) {
          const p = d.post as Post;
          setTitle(p.title);
          setDate(p.date);
          setDescription(p.description);
          setContent(p.content);
          setFeaturedImage(p.featured_image);
          try { setTags(JSON.parse(p.tags).join(", ")); } catch { setTags(""); }
          setPublished(p.published === 1);
        }
        setLoading(false);
      });
  }, [slug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const res = await fetch(`/api/admin/blog/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title, date, description, content, featuredImage,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        published,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error); return; }
    router.push("/admin/blog");
  }

  const containerStyle: React.CSSProperties = {
    maxWidth: 800, margin: "0 auto", padding: "40px 20px", fontFamily: "Inter, sans-serif",
  };
  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 12px", border: "1px solid #d8cdc0",
    borderRadius: 4, fontSize: 14, boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 13, color: "#3d3228", display: "block", marginBottom: 4, fontWeight: 500,
  };
  const fieldStyle: React.CSSProperties = { marginBottom: 16 };
  const btnPrimary: React.CSSProperties = {
    padding: "12px 24px", borderRadius: 4, border: "none",
    background: "#6b4226", color: "#fff", cursor: "pointer", fontSize: 15, fontWeight: 500,
  };

  if (loading) return <div style={containerStyle}><p>Loading...</p></div>;

  return (
    <div style={containerStyle}>
      <a href="/admin/blog" style={{ fontSize: 13, color: "#a89a8c", textDecoration: "none" }}>← Blog Posts</a>
      <h1 style={{ margin: "8px 0 24px", color: "#1e1812", fontSize: 24 }}>Edit Post</h1>

      <form onSubmit={handleSubmit}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Title</label>
          <input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div style={fieldStyle}>
          <label style={{ ...labelStyle, color: "#a89a8c" }}>Slug: {slug}</label>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, ...fieldStyle }}>
          <div>
            <label style={labelStyle}>Date</label>
            <input type="date" style={inputStyle} value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div>
            <label style={labelStyle}>Featured Image Path</label>
            <ImagePicker value={featuredImage} onChange={setFeaturedImage} />
          </div>
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Description (SEO)</label>
          <input style={inputStyle} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Tags (comma-separated)</label>
          <input style={inputStyle} value={tags} onChange={(e) => setTags(e.target.value)} />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Content (Markdown)</label>
          <textarea style={{ ...inputStyle, minHeight: 400, fontFamily: "monospace", lineHeight: 1.6 }} value={content} onChange={(e) => setContent(e.target.value)} />
        </div>
        <div style={{ ...fieldStyle, display: "flex", alignItems: "center", gap: 8 }}>
          <input type="checkbox" id="published" checked={published} onChange={(e) => setPublished(e.target.checked)} />
          <label htmlFor="published" style={{ fontSize: 14, color: "#3d3228" }}>Published</label>
        </div>
        {error && <p style={{ color: "#c0392b", fontSize: 14, marginBottom: 12 }}>{error}</p>}
        <div style={{ display: "flex", gap: 12 }}>
          <button type="submit" style={btnPrimary} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
          <a href={`/blog/${slug}`} target="_blank" style={{ ...btnPrimary, background: "none", color: "#6b4226", border: "1px solid #6b4226", textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Preview</a>
        </div>
      </form>
    </div>
  );
}
