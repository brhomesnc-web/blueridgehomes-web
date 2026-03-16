#!/bin/bash
set -e
cd /var/www/brhomes/apps/web

echo "=== 1. Migrate DB: add status/reply columns ==="
node -e "
const db = require('better-sqlite3')('/var/www/brhomes/data/submissions.db');
const cols = db.prepare(\"PRAGMA table_info(submissions)\").all().map(c => c.name);
if (!cols.includes('status')) {
  db.exec(\"ALTER TABLE submissions ADD COLUMN status TEXT DEFAULT 'new'\");
  console.log('Added status column');
} else { console.log('status column exists'); }
if (!cols.includes('replied_at')) {
  db.exec('ALTER TABLE submissions ADD COLUMN replied_at TEXT');
  console.log('Added replied_at column');
} else { console.log('replied_at column exists'); }
if (!cols.includes('reply_text')) {
  db.exec('ALTER TABLE submissions ADD COLUMN reply_text TEXT');
  console.log('Added reply_text column');
} else { console.log('reply_text column exists'); }
console.log('Migration complete');
"

echo "=== 2. Create API routes ==="

# --- GET/DELETE list route ---
mkdir -p app/api/admin/submissions
cat > app/api/admin/submissions/route.ts << 'ROUTE1'
import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const db = getDb();
  let query = "SELECT id, name, email, phone, project_type, message, created_at, read, status, replied_at FROM submissions";
  const params: string[] = [];
  if (status && status !== "all") {
    query += " WHERE status = ?";
    params.push(status);
  }
  query += " ORDER BY created_at DESC";
  const submissions = db.prepare(query).all(...params);
  const counts = {
    all: db.prepare("SELECT COUNT(*) as c FROM submissions").get() as { c: number },
    new: db.prepare("SELECT COUNT(*) as c FROM submissions WHERE status = 'new'").get() as { c: number },
    read: db.prepare("SELECT COUNT(*) as c FROM submissions WHERE status = 'read'").get() as { c: number },
    replied: db.prepare("SELECT COUNT(*) as c FROM submissions WHERE status = 'replied'").get() as { c: number },
    archived: db.prepare("SELECT COUNT(*) as c FROM submissions WHERE status = 'archived'").get() as { c: number },
  };
  return NextResponse.json({
    submissions,
    counts: { all: counts.all.c, new: counts.new.c, read: counts.read.c, replied: counts.replied.c, archived: counts.archived.c },
  });
}
ROUTE1

# --- Single submission: GET, PUT, DELETE ---
mkdir -p "app/api/admin/submissions/[id]"
cat > "app/api/admin/submissions/[id]/route.ts" << 'ROUTE2'
import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const db = getDb();
  const submission = db.prepare("SELECT * FROM submissions WHERE id = ?").get(id);
  if (!submission) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  // Mark as read if new
  if ((submission as Record<string,unknown>).status === "new") {
    db.prepare("UPDATE submissions SET status = 'read', read = 1 WHERE id = ?").run(id);
  }
  return NextResponse.json({ submission });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json();
  const db = getDb();
  const submission = db.prepare("SELECT * FROM submissions WHERE id = ?").get(id);
  if (!submission) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (body.status) {
    db.prepare("UPDATE submissions SET status = ? WHERE id = ?").run(body.status, id);
  }
  if (body.reply_text !== undefined) {
    db.prepare("UPDATE submissions SET reply_text = ?, replied_at = datetime('now'), status = 'replied' WHERE id = ?").run(body.reply_text, id);
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const db = getDb();
  db.prepare("DELETE FROM submissions WHERE id = ?").run(id);
  return NextResponse.json({ success: true });
}
ROUTE2

# --- Reply + send email route ---
mkdir -p "app/api/admin/submissions/[id]/reply"
cat > "app/api/admin/submissions/[id]/reply/route.ts" << 'ROUTE3'
import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { getSession } from "@/lib/auth";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json();
  const { reply_text } = body;
  if (!reply_text?.trim()) {
    return NextResponse.json({ error: "Reply text is required" }, { status: 400 });
  }
  const db = getDb();
  const submission = db.prepare("SELECT * FROM submissions WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  if (!submission) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Save reply to DB
  db.prepare("UPDATE submissions SET reply_text = ?, replied_at = datetime('now'), status = 'replied' WHERE id = ?").run(reply_text, id);

  // Attempt to send email if SMTP is configured
  let emailSent = false;
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  if (smtpHost && smtpUser && smtpPass && smtpPass !== "placeholder") {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: (process.env.SMTP_PORT === "465"),
        auth: { user: smtpUser, pass: smtpPass },
      });
      await transporter.sendMail({
        from: `"Blue Ridge Homes" <${smtpUser}>`,
        to: submission.email as string,
        subject: `Re: Your inquiry to Blue Ridge Homes`,
        text: reply_text + "\n\n--\nBrian\nBlue Ridge Homes\n(828) 712-2867\nbrhomesnc.com",
        replyTo: "brhomesnc@gmail.com",
      });
      emailSent = true;
    } catch (err) {
      console.error("Email send failed:", err);
    }
  }
  return NextResponse.json({ success: true, emailSent });
}
ROUTE3

echo "=== 3. Create admin submissions pages ==="

# --- List page ---
mkdir -p app/admin/submissions
cat > app/admin/submissions/page.tsx << 'PAGE1'
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
PAGE1

# --- Detail / Reply page ---
mkdir -p "app/admin/submissions/[id]"
cat > "app/admin/submissions/[id]/page.tsx" << 'PAGE2'
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
            <div style={value}>{new Date(submission.created_at + "Z").toLocaleString()}</div>
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
            Reply sent {new Date(submission.replied_at + "Z").toLocaleString()}
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
PAGE2

echo "=== 4. Check nodemailer ==="
if ! node -e "require('nodemailer')" 2>/dev/null; then
  echo "Installing nodemailer..."
  npm install nodemailer @types/nodemailer
else
  echo "nodemailer already installed"
fi

echo "=== 5. Build & deploy ==="
./deploy.sh

echo ""
echo "=== DONE ==="
echo "Admin submissions page: https://brhomesnc.com/admin/submissions"
