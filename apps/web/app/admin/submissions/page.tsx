"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Submission = {
  id: number;
  name: string;
  email: string;
  phone: string;
  project_type: string;
  message: string;
  created_at: string;
  status: string;
  replied_at: string | null;
};
type Counts = { all: number; new: number; read: number; replied: number; archived: number };

export default function AdminSubmissions() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [counts, setCounts] = useState<Counts>({ all: 0, new: 0, read: 0, replied: 0, archived: 0 });
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  function load(status: string) {
    setLoading(true);
    fetch(`/api/admin/submissions?status=${status}`)
      .then((r) => r.json())
      .then((d) => {
        setSubmissions(d.submissions || []);
        setCounts(d.counts || { all: 0, new: 0, read: 0, replied: 0, archived: 0 });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => { load(filter); }, [filter]);

  async function handleDelete(id: number, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Delete this submission permanently?")) return;
    await fetch(`/api/admin/submissions/${id}`, { method: "DELETE" });
    load(filter);
  }

  async function handleArchive(id: number, e: React.MouseEvent) {
    e.stopPropagation();
    await fetch(`/api/admin/submissions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "archived" }),
    });
    load(filter);
  }

  const container: React.CSSProperties = {
    maxWidth: 900, margin: "0 auto", padding: "40px 20px", fontFamily: "Inter, sans-serif",
  };
  const btnSmall: React.CSSProperties = {
    padding: "6px 14px", borderRadius: 4, border: "1px solid #d8cdc0",
    background: "none", cursor: "pointer", fontSize: 13, color: "#3d3228",
  };
  const statusColors: Record<string, string> = {
    new: "#2980b9", read: "#e67e22", replied: "#27ae60", archived: "#95a5a6",
  };
  const filterBtn = (key: string, label: string): React.CSSProperties => ({
    padding: "6px 14px", borderRadius: 4, border: "1px solid #d8cdc0",
    background: filter === key ? "#6b4226" : "none",
    color: filter === key ? "#fff" : "#3d3228",
    cursor: "pointer", fontSize: 13, fontWeight: filter === key ? 600 : 400,
  });

  function timeAgo(dateStr: string) {
    const now = new Date();
    const d = new Date(dateStr + "Z");
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return d.toLocaleDateString();
  }

  return (
    <div style={container}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <a href="/admin" style={{ fontSize: 13, color: "#a89a8c", textDecoration: "none" }}>← Dashboard</a>
          <h1 style={{ margin: "8px 0 0", color: "#1e1812", fontSize: 24 }}>
            Contact Submissions
            {counts.new > 0 && (
              <span style={{ marginLeft: 10, fontSize: 14, background: "#2980b9", color: "#fff", borderRadius: 12, padding: "2px 10px", fontWeight: 500 }}>
                {counts.new} new
              </span>
            )}
          </h1>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {(["all", "new", "read", "replied", "archived"] as const).map((key) => (
          <button key={key} style={filterBtn(key, key)} onClick={() => setFilter(key)}>
            {key.charAt(0).toUpperCase() + key.slice(1)} ({counts[key]})
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: "#a89a8c" }}>Loading...</p>
      ) : submissions.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", color: "#a89a8c", background: "#fff", borderRadius: 8, border: "1px solid #d8cdc0" }}>
          {filter === "all" ? "No submissions yet." : `No ${filter} submissions.`}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {submissions.map((s) => (
            <div
              key={s.id}
              onClick={() => router.push(`/admin/submissions/${s.id}`)}
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "16px 20px", background: s.status === "new" ? "#fdf8f3" : "#fff",
                borderRadius: 8, border: `1px solid ${s.status === "new" ? "#c9a96e" : "#d8cdc0"}`,
                cursor: "pointer", transition: "box-shadow 0.2s",
                borderLeft: `4px solid ${statusColors[s.status] || "#d8cdc0"}`,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <h3 style={{ margin: 0, color: "#1e1812", fontSize: 15, fontWeight: s.status === "new" ? 700 : 500 }}>{s.name}</h3>
                  <span style={{ fontSize: 12, color: statusColors[s.status], fontWeight: 600, textTransform: "uppercase" }}>{s.status}</span>
                </div>
                <p style={{ margin: "2px 0", fontSize: 13, color: "#a89a8c" }}>
                  {s.project_type} &middot; {s.email} {s.phone ? `· ${s.phone}` : ""}
                </p>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b5e52", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 500 }}>
                  {s.message}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: 16, flexShrink: 0 }}>
                <span style={{ fontSize: 12, color: "#a89a8c", whiteSpace: "nowrap" }}>{timeAgo(s.created_at)}</span>
                {s.status !== "archived" && (
                  <button style={btnSmall} onClick={(e) => handleArchive(s.id, e)}>Archive</button>
                )}
                <button style={{ ...btnSmall, color: "#c0392b", borderColor: "#e0c8c8" }} onClick={(e) => handleDelete(s.id, e)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
