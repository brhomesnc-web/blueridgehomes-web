"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminSetup() {
  const router = useRouter();
  const [step, setStep] = useState<"check" | "password" | "qr" | "verify" | "done">("check");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/check").then((r) => r.json()).then((d) => {
      if (d.setupComplete) {
        router.push("/admin/login");
      } else {
        setStep("password");
      }
    });
  }, [router]);

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    setLoading(true);
    const res = await fetch("/api/admin/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step: "password", password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    setQrDataUrl(data.qrDataUrl);
    setSecret(data.secret);
    setStep("qr");
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/admin/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step: "verify", totpCode }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    setStep("done");
  }

  const boxStyle: React.CSSProperties = {
    maxWidth: 440, margin: "80px auto", padding: 32,
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

  if (step === "check") return <div style={boxStyle}><p>Checking...</p></div>;

  if (step === "done") return (
    <div style={boxStyle}>
      <h2 style={{ margin: "0 0 12px", color: "#1e1812" }}>Setup Complete</h2>
      <p style={{ color: "#3d3228" }}>Your admin account is ready.</p>
      <button style={btnStyle} onClick={() => router.push("/admin/login")}>Go to Login</button>
    </div>
  );

  return (
    <div style={boxStyle}>
      <h2 style={{ margin: "0 0 8px", color: "#1e1812" }}>Admin Setup</h2>
      <p style={{ color: "#a89a8c", fontSize: 14, marginBottom: 24 }}>One-time setup for Blue Ridge Homes admin.</p>

      {step === "password" && (
        <form onSubmit={handlePasswordSubmit}>
          <label style={{ fontSize: 13, color: "#3d3228", display: "block", marginBottom: 4 }}>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} placeholder="Minimum 8 characters" />
          <label style={{ fontSize: 13, color: "#3d3228", display: "block", marginBottom: 4 }}>Confirm Password</label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={inputStyle} />
          {error && <p style={{ color: "#c0392b", fontSize: 13, marginBottom: 12 }}>{error}</p>}
          <button type="submit" style={btnStyle} disabled={loading}>{loading ? "Setting up..." : "Continue"}</button>
        </form>
      )}

      {step === "qr" && (
        <form onSubmit={handleVerify}>
          <p style={{ color: "#3d3228", fontSize: 14, marginBottom: 16 }}>Scan this QR code with Google Authenticator:</p>
          {qrDataUrl && <img src={qrDataUrl} alt="TOTP QR Code" style={{ display: "block", margin: "0 auto 16px", width: 200, height: 200 }} />}
          <p style={{ fontSize: 12, color: "#a89a8c", marginBottom: 16, wordBreak: "break-all" }}>Manual key: {secret}</p>
          <label style={{ fontSize: 13, color: "#3d3228", display: "block", marginBottom: 4 }}>Enter 6-digit code to verify</label>
          <input type="text" value={totpCode} onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))} style={inputStyle} placeholder="000000" maxLength={6} autoComplete="off" />
          {error && <p style={{ color: "#c0392b", fontSize: 13, marginBottom: 12 }}>{error}</p>}
          <button type="submit" style={btnStyle} disabled={loading || totpCode.length !== 6}>{loading ? "Verifying..." : "Verify & Complete Setup"}</button>
        </form>
      )}
    </div>
  );
}
