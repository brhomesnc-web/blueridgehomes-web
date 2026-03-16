"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import PortfolioForm from "@/components/admin/PortfolioForm";

export default function EditProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [project, setProject] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/portfolio/${slug}`)
      .then((r) => r.json())
      .then((d) => { setProject(d.project || null); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  async function handleSave(data: Record<string, unknown>) {
    setSaving(true);
    setError("");
    const r = await fetch(`/api/admin/portfolio/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const d = await r.json();
    if (d.success) {
      router.push("/admin/portfolio");
    } else {
      setError(d.error || "Failed to update project");
    }
    setSaving(false);
  }

  if (loading) return <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px", fontFamily: "Inter, sans-serif" }}><p style={{ color: "#a89a8c" }}>Loading...</p></div>;
  if (!project) return <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px", fontFamily: "Inter, sans-serif" }}><p style={{ color: "#c0392b" }}>Project not found.</p></div>;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px", fontFamily: "Inter, sans-serif" }}>
      <a href="/admin/portfolio" style={{ fontSize: 13, color: "#a89a8c", textDecoration: "none" }}>{"\u2190 Portfolio"}</a>
      <h1 style={{ margin: "8px 0 24px", color: "#1e1812", fontSize: 24 }}>Edit: {project.title as string}</h1>
      {error && <div style={{ padding: "10px 14px", borderRadius: 4, background: "#fce4e4", color: "#c0392b", fontSize: 13, marginBottom: 16 }}>{error}</div>}
      <PortfolioForm project={project} onSave={handleSave} saving={saving} />
    </div>
  );
}
