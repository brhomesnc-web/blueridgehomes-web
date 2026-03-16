"use client";
import { useState, useEffect, use } from "react";
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
  reply_text: string | null;
};

export default function SubmissionDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [replyResult, setReplyResult] = useState<{ success: boolean; emailSent: boolean } | null>(null);

  useEffect(() => {
    fetch(`/api/admin/submissions/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setSubmission(d.submission || null);
        if (d.submission?.reply_text) setReplyText(d.submission.reply_text);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  async function handleReply() {
    if (!replyText.trim()) return;
    setSending(true);
    setReplyResult(null);
    try {
      const r = await fetch(`/api/admin/submissions/${id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply_text: replyText }),
      });
      const d = await r.json();
      setReplyResult(d);
      if (d.success && submission) {
        setSubmission({ ...submission, status: "replied", replied_at: new Date().toISOString(), reply_text: replyText });
      }
    } catch {
      setReplyResult({ success: false, emailSent: false });
    }
    setSending(false);
  }

  async function handleDelete() {
    if (!confirm("Delete this submission permanently?")) return;
    await fetch(`/api/admin/submissions/${id}`, { method: "DELETE" });
    router.push("/admin/submissions");
  }

  async function handleStatusChange(status: string) {
    await fetch(`/api/admin/submissions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (submission) setSubmission({ ...submission, status });
  }

  const container: React.CSSProperties = {
    maxWidth: 700, margin: "0 auto", padding: "40px 20px", fontFamily: "Inter, sans-serif",
  };
  const card: React.CSSProperties = {
    background: "#fff", borderRadius: 8, border: "1px solid #d8cdc0", padding: 24, marginBottom: 20,
  };
  const label: React.CSSProperties = {
    fontSize: 12, color: "#a89a8c", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4, fontWeight: 600,
  };
  const value: React.CSSProperties = {
    fontSize: 15, color: "#1e1812", marginBottom: 16,
  };
  const btnSmall: React.CSSProperties = {
    padding: "6px 14px", borderRadius: 4, border: "1px solid #d8cdc0",
    background: "none", cursor: "pointer", fontSize: 13, color: "#3d3228",
  };
  const btnPrimary: React.CSSProperties = {
    padding: "10px 20px", borderRadius: 4, border: "none",
    background: "#6b4226", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 500,
  };
  const statusColors: Record<string, string> = {
    new: "#2980b9", read: "#e67e22", replied: "#27ae60", archived: "#95a5a6",
  };

  if (loading) return <div style={container}><p style={{ color: "#a89a8c" }}>Loading...</p></div>;
  if (!submission) return <div style={container}><p style={{ color: "#c0392b" }}>Submission not found.</p></div>;

  return (
    <div style={container}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <a href="/admin/submissions" style={{ fontSize: 13, color: "#a89a8c", textDecoration: "none" }}>← All Submissions</a>
          <h1 style={{ margin: "8px 0 0", color: "#1e1812", fontSize: 24 }}>
            {submission.name}
            <span style={{ marginLeft: 10, fontSize: 13, color: statusColors[submission.status], fontWeight: 600, textTransform: "uppercase" }}>
              {submission.status}
            </span>
          </h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {submission.status !== "archived" && (
            <button style={btnSmall} onClick={() => handleStatusChange("archived")}>Archive</button>
          )}
          {submission.status === "archived" && (
            <button style={btnSmall} onClick={() => handleStatusChange("read")}>Unarchive</button>
          )}
          <button style={{ ...btnSmall, color: "#c0392b", borderColor: "#e0c8c8" }} onClick={handleDelete}>Delete</button>
        </div>
      </div>

      {/* Contact info */}
      <div style={card}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <div style={label}>Email</div>
            <div style={value}><a href={`mailto:${submission.email}`} style={{ color: "#6b4226" }}>{submission.email}</a></div>
          </div>
          <div>
            <div style={label}>Phone</div>
            <div style={value}>
              {submission.phone ? <a href={`tel:${submission.phone}`} style={{ color: "#6b4226" }}>{submission.phone}</a> : <span style={{ color: "#a89a8c" }}>—</span>}
            </div>
          </div>
          <div>
            <div style={label}>Project Type</div>
            <div style={value}>{submission.project_type}</div>
          </div>
          <div>
            <div style={label}>Submitted</div>
            <div style={value}>{new Date(submission.created_at.trim().replace(" ", "T") + "Z").toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Message */}
      <div style={card}>
        <div style={label}>Message</div>
        <div style={{ fontSize: 15, color: "#1e1812", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{submission.message}</div>
      </div>

      {/* Previous reply */}
      {submission.replied_at && submission.reply_text && (
        <div style={{ ...card, borderColor: "#b8d4b8", background: "#f8fcf8" }}>
          <div style={{ ...label, color: "#27ae60" }}>
            Reply sent {new Date(submission.replied_at.trim().replace(" ", "T") + "Z").toLocaleString()}
          </div>
          <div style={{ fontSize: 14, color: "#1e1812", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{submission.reply_text}</div>
        </div>
      )}

      {/* Reply form */}
      <div style={card}>
        <div style={label}>{submission.reply_text ? "Update Reply" : "Reply"}</div>
        <textarea
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder={`Write your reply to ${submission.name}...`}
          style={{
            width: "100%", minHeight: 140, padding: 12, borderRadius: 4, border: "1px solid #d8cdc0",
            fontSize: 14, fontFamily: "Inter, sans-serif", lineHeight: 1.6, resize: "vertical",
            color: "#1e1812", background: "#fdfcfb", boxSizing: "border-box",
          }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
          <span style={{ fontSize: 12, color: "#a89a8c" }}>
            Reply will be emailed to {submission.email} (if SMTP is configured)
          </span>
          <button style={{ ...btnPrimary, opacity: sending ? 0.6 : 1 }} onClick={handleReply} disabled={sending}>
            {sending ? "Sending..." : submission.reply_text ? "Update & Resend" : "Send Reply"}
          </button>
        </div>
        {replyResult && (
          <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 4, fontSize: 13,
            background: replyResult.success ? "#eaf5ea" : "#fce4e4",
            color: replyResult.success ? "#27ae60" : "#c0392b",
          }}>
            {replyResult.success
              ? replyResult.emailSent
                ? "Reply saved and email sent successfully."
                : "Reply saved. Email not sent (SMTP not configured)."
              : "Failed to save reply. Please try again."}
          </div>
        )}
      </div>
    </div>
  );
}
