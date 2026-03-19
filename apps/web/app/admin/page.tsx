"use client";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  const cardStyle: React.CSSProperties = {
    padding: 24, background: "#fff", borderRadius: 8,
    border: "1px solid #d8cdc0", cursor: "pointer",
    transition: "box-shadow 0.2s",
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px", fontFamily: "Inter, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <h1 style={{ margin: 0, color: "#1e1812", fontSize: 24 }}>Blue Ridge Homes Admin</h1>
        <button onClick={handleLogout} style={{ background: "none", border: "1px solid #d8cdc0", borderRadius: 4, padding: "8px 16px", cursor: "pointer", color: "#3d3228", fontSize: 13 }}>
          Log Out
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={cardStyle} onClick={() => router.push("/admin/blog")}>
          <h3 style={{ margin: "0 0 8px", color: "#1e1812" }}>Blog Posts</h3>
          <p style={{ margin: 0, color: "#a89a8c", fontSize: 14 }}>Create, edit, and manage blog posts</p>
        </div>
        <div style={cardStyle} onClick={() => router.push("/admin/submissions")}>
          <h3 style={{ margin: "0 0 8px", color: "#1e1812" }}>Contact Submissions</h3>
          <p style={{ margin: 0, color: "#a89a8c", fontSize: 14 }}>View messages from the contact form</p>
        </div>
        <div style={cardStyle} onClick={() => window.location.href = "/marketing/"}>
          <h3 style={{ margin: "0 0 8px", color: "#1e1812" }}>Marketing Platform</h3>
          <p style={{ margin: 0, color: "#a89a8c", fontSize: 14 }}>Marketing operations dashboard</p>
        </div>
        <div style={cardStyle} onClick={() => router.push("/admin/portfolio")}>
          <h3 style={{ margin: "0 0 8px", color: "#1e1812" }}>Portfolio</h3>
          <p style={{ margin: 0, color: "#a89a8c", fontSize: 14 }}>Add, edit, and manage portfolio projects</p>
        </div>
      </div>
    </div>
  );
}
