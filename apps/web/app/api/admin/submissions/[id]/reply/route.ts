import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
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
                  <a href="https://blueridgehomesnc.com" style="color:#6b4226;text-decoration:none;">blueridgehomesnc.com</a>
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
  const { rows } = await query("SELECT * FROM submissions WHERE id = $1", [id]);
  if (rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const submission = rows[0];

  // Save reply to DB
  await query("UPDATE submissions SET reply_text = $1, replied_at = NOW(), status = 'replied' WHERE id = $2", [reply_text, id]);

  // Send email
  let emailSent = false;
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = (process.env.SMTP_PASS || "").replace(/^["']|["']$/g, "").trim();
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
        text: `Hi ${submission.name},\n\nThank you for reaching out to Blue Ridge Homes.\n\n${reply_text}\n\nFeel free to reply to this email or call us anytime.\n\n--\nBrian\nBlue Ridge Homes\n(828) 712-2867\nblueridgehomesnc.com\nNC License #56328`,
        html: replyHtml(submission.name as string, reply_text),
      });
      emailSent = true;
    } catch (err) {
      console.error("Email send failed:", err);
    }
  }
  return NextResponse.json({ success: true, emailSent });
}
