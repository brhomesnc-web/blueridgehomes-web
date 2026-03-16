"use client";
import ImagePicker from "@/components/admin/ImagePicker";
import Markdown from "react-markdown";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function AdminBlogNew() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [tags, setTags] = useState("");
  const [published, setPublished] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [inlineImage, setInlineImage] = useState("");
  const [showInlinePicker, setShowInlinePicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function generateSlug(t: string) {
    return t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  function handleTitleChange(val: string) {
    setTitle(val);
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(val));
    }
  }

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
    const res = await fetch("/api/admin/blog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug, title, date, description, content, featuredImage,
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
  const toolbarBtn: React.CSSProperties = {
    padding: "6px 14px", borderRadius: 4, border: "1px solid #d8cdc0",
    background: "#fff", cursor: "pointer", fontSize: 13, color: "#3d3228",
  };

  return (
    <div style={containerStyle}>
      <a href="/admin/blog" style={{ fontSize: 13, color: "#a89a8c", textDecoration: "none" }}>← Blog Posts</a>
      <h1 style={{ margin: "8px 0 24px", color: "#1e1812", fontSize: 24 }}>New Post</h1>

      <form onSubmit={handleSubmit}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Title</label>
          <input style={inputStyle} value={title} onChange={(e) => handleTitleChange(e.target.value)} required />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Slug</label>
          <input style={inputStyle} value={slug} onChange={(e) => setSlug(e.target.value)} required />
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
          <input style={inputStyle} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description for search results" />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Tags (comma-separated)</label>
          <input style={inputStyle} value={tags} onChange={(e) => setTags(e.target.value)} placeholder="custom homes, asheville, cost guide" />
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
                {content ? <Markdown>{content}</Markdown> : <p style={{ color: "#a89a8c", fontStyle: "italic" }}>Start typing to see preview...</p>}
              </div>
            </div>
          )}
        </div>
        <div style={{ ...fieldStyle, display: "flex", alignItems: "center", gap: 8 }}>
          <input type="checkbox" id="published" checked={published} onChange={(e) => setPublished(e.target.checked)} />
          <label htmlFor="published" style={{ fontSize: 14, color: "#3d3228" }}>Publish immediately</label>
        </div>
        {error && <p style={{ color: "#c0392b", fontSize: 14, marginBottom: 12 }}>{error}</p>}
        <button type="submit" style={btnPrimary} disabled={saving}>{saving ? "Saving..." : "Create Post"}</button>
      </form>
    </div>
  );
}
