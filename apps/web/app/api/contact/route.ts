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
    const pass = (process.env.SMTP_PASS || "").replace(/^["']|["']$/g, "").trim();
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
