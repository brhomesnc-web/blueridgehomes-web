"use client";
import ImagePicker from "@/components/admin/ImagePicker";
import { normalizeTags } from "@/lib/tags";
import BlogMarkdownEditor from "@/components/BlogMarkdownEditor";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";

type Post = {
  slug: string;
  title: string;
  date: string;
  description: string;
  content: string;
  featured_image: string;
  tags: string[] | string | null;
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
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [inlineImage, setInlineImage] = useState("");
  const [showInlinePicker, setShowInlinePicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
          // tags is jsonb, which pg hands back ALREADY PARSED. The old
          // JSON.parse(p.tags) threw on the array, fell into a catch that set
          // tags to "", and the next Save wrote that empty list back — the read
          // threw, the write lost the data. normalizeTags handles both shapes.
          setTags(normalizeTags(p.tags).join(", "));
        }
        setLoading(false);
      });
  }, [slug]);

  function insertImageAtCursor(path: string) {
    const ta = textareaRef.current;
    if (!ta) {
      setContent((prev) => prev + `\n![image description](${path})\n`);
      return;
    }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const tag = `![image description](${path})`;
    const before = content.slice(0, start);
    const after = content.slice(end);
    const newContent = before + tag + after;
    setContent(newContent);
    requestAnimationFrame(() => {
      ta.focus();
      const pos = start + tag.length;
      ta.setSelectionRange(pos, pos);
    });
  }

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
  const toolbarBtn: React.CSSProperties = {
    padding: "6px 14px", borderRadius: 4, border: "1px solid #d8cdc0",
    background: "#fff", cursor: "pointer", fontSize: 13, color: "#3d3228",
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Content (Markdown)</label>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" style={toolbarBtn} onClick={() => setShowInlinePicker(true)}>
                Insert Image
              </button>
              <button type="button" style={{ ...toolbarBtn, background: showPreview ? "#6b4226" : "#fff", color: showPreview ? "#fff" : "#3d3228" }} onClick={() => setShowPreview(!showPreview)}>
                {showPreview ? "Hide Preview" : "Preview"}
              </button>
            </div>
          </div>
          <textarea ref={textareaRef} style={{ ...inputStyle, minHeight: 400, fontFamily: "monospace", lineHeight: 1.6 }} value={content} onChange={(e) => setContent(e.target.value)} />
          {showInlinePicker && (
            <div style={{ marginTop: 8, padding: 12, border: "1px solid #d8cdc0", borderRadius: 4, background: "#faf7f4" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#3d3228" }}>Pick an image to insert</span>
                <button type="button" onClick={() => { setShowInlinePicker(false); setInlineImage(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#999", fontSize: 16 }}>×</button>
              </div>
              <ImagePicker value={inlineImage} onChange={(path) => {
                setInlineImage(path);
                insertImageAtCursor(path);
                setShowInlinePicker(false);
                setInlineImage("");
              }} />
            </div>
          )}
          {showPreview && (
            <div style={{ marginTop: 12, padding: "20px 24px", border: "1px solid #d8cdc0", borderRadius: 4, background: "#fff", minHeight: 200 }}>
              <div style={{ fontSize: 11, color: "#a89a8c", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Preview</div>
              <div className="br-blog-prose" style={{ fontSize: 15, lineHeight: 1.8, color: "#1e1812" }}>
                {content ? <BlogMarkdownEditor content={content} onChange={setContent} slug={slug} /> : <p style={{ color: "#a89a8c", fontStyle: "italic" }}>Start typing to see preview...</p>}
              </div>
            </div>
          )}
        </div>
        {/* No Published checkbox. It read `p.published === 1` against a pg
            boolean, so it rendered unchecked for every post including live ones,
            and saving then sent published:false through a valid PUT — opening a
            live post here and clicking Save unpublished it. Visibility is the
            marketing admin's job now; this PUT preserves the column. */}
        {error && <p style={{ color: "#c0392b", fontSize: 14, marginBottom: 12 }}>{error}</p>}
        <div style={{ display: "flex", gap: 12 }}>
          <button type="submit" style={btnPrimary} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
          <a href={`/blog/${slug}`} target="_blank" style={{ ...btnPrimary, background: "none", color: "#6b4226", border: "1px solid #6b4226", textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Preview</a>
        </div>
      </form>
    </div>
  );
}
