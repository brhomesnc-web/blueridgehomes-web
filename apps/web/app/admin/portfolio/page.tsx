"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Project = {
  id: number;
  slug: string;
  title: string;
  location: string;
  tag: string;
  published: number;
  sort_order: number;
};

export default function AdminPortfolioList() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/portfolio")
      .then((r) => r.json())
      .then((d) => { setProjects(d.projects || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function togglePublished(slug: string, current: number) {
    await fetch(`/api/admin/portfolio/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !current }),
    });
    setProjects((prev) => prev.map((p) => (p.slug === slug ? { ...p, published: current ? 0 : 1 } : p)));
  }

  async function deleteProject(slug: string) {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    await fetch(`/api/admin/portfolio/${slug}`, { method: "DELETE" });
    setProjects((prev) => prev.filter((p) => p.slug !== slug));
  }

  async function moveProject(slug: string, direction: "up" | "down") {
    const idx = projects.findIndex((p) => p.slug === slug);
    if (idx < 0) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= projects.length) return;
    const a = projects[idx];
    const b = projects[swapIdx];
    await Promise.all([
      fetch(`/api/admin/portfolio/${a.slug}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sort_order: b.sort_order }) }),
      fetch(`/api/admin/portfolio/${b.slug}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sort_order: a.sort_order }) }),
    ]);
    const updated = [...projects];
    updated[idx] = { ...b, sort_order: a.sort_order };
    updated[swapIdx] = { ...a, sort_order: b.sort_order };
    updated.sort((x, y) => x.sort_order - y.sort_order);
    setProjects(updated);
  }

  const container: React.CSSProperties = { maxWidth: 900, margin: "0 auto", padding: "40px 20px", fontFamily: "Inter, sans-serif" };
  const btnSmall: React.CSSProperties = { padding: "6px 14px", borderRadius: 4, border: "1px solid #d8cdc0", background: "none", cursor: "pointer", fontSize: 13, color: "#3d3228" };
  const btnPrimary: React.CSSProperties = { padding: "10px 20px", borderRadius: 4, border: "none", background: "#6b4226", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 500 };
  const tagColors: Record<string, string> = { custom: "#27ae60", remodel: "#2980b9", addition: "#e67e22" };

  return (
    <div style={container}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <a href="/admin" style={{ fontSize: 13, color: "#a89a8c", textDecoration: "none" }}>{"\u2190 Dashboard"}</a>
          <h1 style={{ margin: "8px 0 0", color: "#1e1812", fontSize: 24 }}>Portfolio Projects</h1>
        </div>
        <button style={btnPrimary} onClick={() => router.push("/admin/portfolio/new")}>+ New Project</button>
      </div>

      {loading ? (
        <p style={{ color: "#a89a8c" }}>Loading...</p>
      ) : projects.length === 0 ? (
        <p style={{ color: "#a89a8c" }}>No portfolio projects yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {projects.map((p, idx) => (
            <div key={p.slug} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "14px 20px", background: "#fff", borderRadius: 8, border: "1px solid #d8cdc0",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <button onClick={() => moveProject(p.slug, "up")} disabled={idx === 0} style={{ ...btnSmall, padding: "2px 8px", opacity: idx === 0 ? 0.3 : 1 }}>{"\u25B2"}</button>
                  <button onClick={() => moveProject(p.slug, "down")} disabled={idx === projects.length - 1} style={{ ...btnSmall, padding: "2px 8px", opacity: idx === projects.length - 1 ? 0.3 : 1 }}>{"\u25BC"}</button>
                </div>
                <div>
                  <h3 style={{ margin: "0 0 4px", color: "#1e1812", fontSize: 15 }}>{p.title}</h3>
                  <span style={{ fontSize: 13, color: "#a89a8c" }}>
                    {p.location} &middot;{" "}
                    <span style={{ color: tagColors[p.tag] || "#a89a8c", fontWeight: 600 }}>{p.tag}</span> &middot;{" "}
                    <span style={{ color: p.published ? "#27ae60" : "#e67e22" }}>{p.published ? "Published" : "Draft"}</span>
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={btnSmall} onClick={() => togglePublished(p.slug, p.published)}>
                  {p.published ? "Unpublish" : "Publish"}
                </button>
                <button style={btnSmall} onClick={() => router.push(`/admin/portfolio/${p.slug}/edit`)}>Edit</button>
                <button style={{ ...btnSmall, color: "#c0392b", borderColor: "#e0c8c8" }} onClick={() => deleteProject(p.slug)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
