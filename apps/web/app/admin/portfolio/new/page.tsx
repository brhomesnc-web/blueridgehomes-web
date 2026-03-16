"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import PortfolioForm from "@/components/admin/PortfolioForm";

export default function NewProjectPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(data: Record<string, unknown>) {
    setSaving(true);
    setError("");
    const r = await fetch("/api/admin/portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const d = await r.json();
    if (d.success) {
      router.push("/admin/portfolio");
    } else {
      setError(d.error || "Failed to create project");
    }
    setSaving(false);
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px", fontFamily: "Inter, sans-serif" }}>
      <a href="/admin/portfolio" style={{ fontSize: 13, color: "#a89a8c", textDecoration: "none" }}>{"\u2190 Portfolio"}</a>
      <h1 style={{ margin: "8px 0 24px", color: "#1e1812", fontSize: 24 }}>New Project</h1>
      {error && <div style={{ padding: "10px 14px", borderRadius: 4, background: "#fce4e4", color: "#c0392b", fontSize: 13, marginBottom: 16 }}>{error}</div>}
      <PortfolioForm onSave={handleSave} saving={saving} />
    </div>
  );
}
