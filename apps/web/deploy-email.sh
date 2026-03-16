#!/bin/bash
set -e
cd /var/www/brhomes/apps/web

echo "=== 1. Update .env.local with Gmail app password ==="
python3 << 'PYFIX'
import os

env_path = ".env.local"
with open(env_path, "r") as f:
    content = f.read()

old = "SMTP_PASS=your-app-password-here"
new = "SMTP_PASS=rpfu ilmg mlkh uumd"

assert old in content, f"Expected to find placeholder SMTP_PASS in .env.local"
content = content.replace(old, new)

with open(env_path, "w") as f:
    f.write(content)

print("Updated SMTP_PASS in .env.local")
PYFIX

echo "=== 2. Upgrade contact form notification email ==="
cat > app/api/contact/route.ts << 'CONTACTROUTE'
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import getDb from "@/lib/db";

function notificationHtml(name: string, email: string, phone: string, projectType: string, message: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4eee7;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4eee7;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <tr><td style="background:#1e1812;padding:24px 32px;">
          <h1 style="margin:0;color:#c9a96e;font-size:20px;font-weight:600;font-family:Georgia,serif;letter-spacing:0.02em;">
            Blue Ridge Homes
          </h1>
          <p style="margin:4px 0 0;color:#a89a8c;font-size:13px;font-family:Arial,sans-serif;">New Contact Form Submission</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:28px 32px;">
          <h2 style="margin:0 0 20px;color:#1e1812;font-size:18px;font-family:Georgia,serif;">
            ${name} sent a message
          </h2>
          
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #e8e0d6;width:120px;vertical-align:top;">
                <span style="font-size:12px;color:#a89a8c;text-transform:uppercase;letter-spacing:0.05em;font-family:Arial,sans-serif;">Name</span>
              </td>
              <td style="padding:10px 0;border-bottom:1px solid #e8e0d6;color:#1e1812;font-size:15px;font-family:Arial,sans-serif;">
                ${name}
              </td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #e8e0d6;vertical-align:top;">
                <span style="font-size:12px;color:#a89a8c;text-transform:uppercase;letter-spacing:0.05em;font-family:Arial,sans-serif;">Email</span>
              </td>
              <td style="padding:10px 0;border-bottom:1px solid #e8e0d6;color:#1e1812;font-size:15px;font-family:Arial,sans-serif;">
                <a href="mailto:${email}" style="color:#6b4226;text-decoration:none;">${email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #e8e0d6;vertical-align:top;">
                <span style="font-size:12px;color:#a89a8c;text-transform:uppercase;letter-spacing:0.05em;font-family:Arial,sans-serif;">Phone</span>
              </td>
              <td style="padding:10px 0;border-bottom:1px solid #e8e0d6;color:#1e1812;font-size:15px;font-family:Arial,sans-serif;">
                ${phone || "Not provided"}
              </td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #e8e0d6;vertical-align:top;">
                <span style="font-size:12px;color:#a89a8c;text-transform:uppercase;letter-spacing:0.05em;font-family:Arial,sans-serif;">Project Type</span>
              </td>
              <td style="padding:10px 0;border-bottom:1px solid #e8e0d6;color:#1e1812;font-size:15px;font-family:Arial,sans-serif;">
                ${projectType}
              </td>
            </tr>
          </table>

          <div style="background:#faf7f4;border-left:3px solid #c9a96e;padding:16px 20px;border-radius:0 4px 4px 0;margin-bottom:20px;">
            <p style="margin:0 0 6px;font-size:12px;color:#a89a8c;text-transform:uppercase;letter-spacing:0.05em;font-family:Arial,sans-serif;">Message</p>
            <p style="margin:0;color:#1e1812;font-size:15px;line-height:1.7;font-family:Arial,sans-serif;white-space:pre-wrap;">${message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
          </div>

          <table cellpadding="0" cellspacing="0" style="margin-top:8px;">
            <tr>
              <td style="background:#6b4226;border-radius:4px;padding:0;">
                <a href="mailto:${email}" style="display:inline-block;padding:12px 24px;color:#ffffff;text-decoration:none;font-size:14px;font-family:Arial,sans-serif;font-weight:600;">
                  Reply to ${name}
                </a>
              </td>
              <td style="padding-left:12px;">
                <a href="https://brhomesnc.com/admin/submissions" style="display:inline-block;padding:12px 24px;color:#6b4226;text-decoration:none;font-size:14px;font-family:Arial,sans-serif;border:1px solid #d8cdc0;border-radius:4px;">
                  View in Admin
                </a>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#faf7f4;padding:16px 32px;border-top:1px solid #e8e0d6;">
          <p style="margin:0;font-size:12px;color:#a89a8c;font-family:Arial,sans-serif;">
            This message was sent from the contact form at brhomesnc.com<br>
            You can reply directly to this email to respond to ${name}.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function POST(request: Request) {
  let body: Record<string, string>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { name, email, phone, projectType, message } = body;
  if (!name || !email || !projectType || !message) {
    return NextResponse.json(
      { error: "Name, email, project type, and message are required." },
      { status: 400 }
    );
  }
  // Store in database
  try {
    const db = getDb();
    db.prepare(
      "INSERT INTO submissions (name, email, phone, project_type, message) VALUES (?, ?, ?, ?, ?)"
    ).run(name, email, phone || "", projectType, message);
  } catch (err) {
    console.error("Database error:", err);
    return NextResponse.json(
      { error: "Failed to save submission." },
      { status: 500 }
    );
  }
  // Send email notification
  try {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const contactEmail = process.env.CONTACT_EMAIL;
    if (host && user && pass && pass !== "placeholder" && contactEmail) {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      await transporter.sendMail({
        from: `"Blue Ridge Homes Website" <${user}>`,
        to: contactEmail,
        replyTo: `"${name}" <${email}>`,
        subject: `New Inquiry: ${name} — ${projectType}`,
        text: [
          `New contact form submission from brhomesnc.com`,
          ``,
          `Name: ${name}`,
          `Email: ${email}`,
          `Phone: ${phone || "Not provided"}`,
          `Project Type: ${projectType}`,
          ``,
          `Message:`,
          message,
          ``,
          `---`,
          `Reply directly to this email to respond to ${name}.`,
          `Or manage in admin: https://brhomesnc.com/admin/submissions`,
        ].join("\n"),
        html: notificationHtml(name, email, phone || "", projectType, message),
      });
    }
  } catch (err) {
    console.error("Email send error:", err);
  }
  return NextResponse.json({ success: true });
}
CONTACTROUTE

echo "=== 3. Upgrade admin reply email template ==="
cat > "app/api/admin/submissions/[id]/reply/route.ts" << 'REPLYROUTE'
import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { getSession } from "@/lib/auth";
import nodemailer from "nodemailer";

function replyHtml(customerName: string, replyText: string): string {
  const escapedReply = replyText.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4eee7;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4eee7;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <tr><td style="background:#1e1812;padding:24px 32px;">
          <h1 style="margin:0;color:#c9a96e;font-size:20px;font-weight:600;font-family:Georgia,serif;letter-spacing:0.02em;">
            Blue Ridge Homes
          </h1>
          <p style="margin:4px 0 0;color:#a89a8c;font-size:13px;font-family:Arial,sans-serif;">Custom Homes &amp; Remodeling · Asheville, NC</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:28px 32px;">
          <p style="margin:0 0 6px;color:#a89a8c;font-size:14px;font-family:Arial,sans-serif;">Hi ${customerName},</p>
          <p style="margin:0 0 24px;color:#1e1812;font-size:15px;line-height:1.7;font-family:Arial,sans-serif;">
            Thank you for reaching out to Blue Ridge Homes. Here's a response to your inquiry:
          </p>
          
          <div style="background:#faf7f4;border-left:3px solid #c9a96e;padding:16px 20px;border-radius:0 4px 4px 0;margin-bottom:24px;">
            <p style="margin:0;color:#1e1812;font-size:15px;line-height:1.7;font-family:Arial,sans-serif;">${escapedReply}</p>
          </div>

          <p style="margin:0;color:#1e1812;font-size:15px;line-height:1.7;font-family:Arial,sans-serif;">
            Feel free to reply to this email or call us anytime if you have questions.
          </p>
        </td></tr>

        <!-- Signature -->
        <tr><td style="padding:0 32px 28px;">
          <table cellpadding="0" cellspacing="0" style="border-top:1px solid #e8e0d6;padding-top:20px;width:100%;">
            <tr>
              <td style="vertical-align:top;">
                <p style="margin:0;color:#1e1812;font-size:15px;font-weight:600;font-family:Arial,sans-serif;">Brian</p>
                <p style="margin:2px 0 0;color:#a89a8c;font-size:13px;font-family:Arial,sans-serif;">Blue Ridge Homes</p>
                <p style="margin:8px 0 0;font-size:13px;font-family:Arial,sans-serif;">
                  <a href="tel:8287122867" style="color:#6b4226;text-decoration:none;">(828) 712-2867</a>
                  &nbsp;&middot;&nbsp;
                  <a href="https://brhomesnc.com" style="color:#6b4226;text-decoration:none;">brhomesnc.com</a>
                </p>
                <p style="margin:4px 0 0;color:#a89a8c;font-size:12px;font-family:Arial,sans-serif;">
                  NC License #56328 · Asheville, NC
                </p>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#faf7f4;padding:16px 32px;border-top:1px solid #e8e0d6;">
          <p style="margin:0;font-size:12px;color:#a89a8c;font-family:Arial,sans-serif;text-align:center;">
            Blue Ridge Homes · Custom Homes &amp; Remodeling<br>
            Serving Buncombe, Henderson &amp; Haywood Counties
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

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

  // Send email
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
        replyTo: "brhomesnc@gmail.com",
        subject: `Re: Your inquiry to Blue Ridge Homes`,
        text: `Hi ${submission.name},\n\nThank you for reaching out to Blue Ridge Homes.\n\n${reply_text}\n\nFeel free to reply to this email or call us anytime.\n\n--\nBrian\nBlue Ridge Homes\n(828) 712-2867\nbrhomesnc.com\nNC License #56328`,
        html: replyHtml(submission.name as string, reply_text),
      });
      emailSent = true;
    } catch (err) {
      console.error("Email send failed:", err);
    }
  }
  return NextResponse.json({ success: true, emailSent });
}
REPLYROUTE

echo "=== 4. Build & deploy ==="
./deploy.sh

echo ""
echo "=== DONE ==="
echo "SMTP configured with Gmail app password"
echo "Inbound notifications: new submissions email you with reply-to set to customer"
echo "Outbound replies: branded HTML emails from admin panel"
