"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/check").then((r) => r.json()).then((d) => {
      if (!d.setupComplete) router.push("/admin/setup");
      else if (d.authenticated) router.push("/admin");
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, totpCode }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    router.push("/admin");
  }

  const boxStyle: React.CSSProperties = {
    maxWidth: 400, margin: "100px auto", padding: 32,
    background: "#fff", borderRadius: 8, boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    fontFamily: "Inter, sans-serif",
  };
  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 12px", border: "1px solid #d8cdc0",
    borderRadius: 4, fontSize: 14, marginBottom: 12, boxSizing: "border-box",
  };
  const btnStyle: React.CSSProperties = {
    width: "100%", padding: "12px", background: "#6b4226", color: "#fff",
    border: "none", borderRadius: 4, fontSize: 15, fontWeight: 500, cursor: "pointer",
  };

  return (
    <div style={boxStyle}>
      <h2 style={{ margin: "0 0 8px", color: "#1e1812" }}>Admin Login</h2>
      <p style={{ color: "#a89a8c", fontSize: 14, marginBottom: 24 }}>Blue Ridge Homes</p>
      <form onSubmit={handleSubmit}>
        <label style={{ fontSize: 13, color: "#3d3228", display: "block", marginBottom: 4 }}>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
        <label style={{ fontSize: 13, color: "#3d3228", display: "block", marginBottom: 4 }}>Authenticator Code</label>
        <input type="text" value={totpCode} onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))} style={inputStyle} placeholder="6-digit code" maxLength={6} autoComplete="off" />
        {error && <p style={{ color: "#c0392b", fontSize: 13, marginBottom: 12 }}>{error}</p>}
        <button type="submit" style={btnStyle} disabled={loading}>{loading ? "Logging in..." : "Log In"}</button>
      </form>
    </div>
  );
}
