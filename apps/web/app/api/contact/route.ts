import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import getDb from "@/lib/db";

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

    if (host && user && pass && contactEmail) {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });

      await transporter.sendMail({
        from: `"Blue Ridge Homes Website" <${user}>`,
        to: contactEmail,
        subject: `New Contact: ${name} — ${projectType}`,
        text: [
          `Name: ${name}`,
          `Email: ${email}`,
          `Phone: ${phone || "Not provided"}`,
          `Project Type: ${projectType}`,
          ``,
          `Message:`,
          message,
        ].join("\n"),
        html: `
          <h2>New Contact Form Submission</h2>
          <table style="border-collapse:collapse;">
            <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Name</td><td>${name}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Email</td><td><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Phone</td><td>${phone || "Not provided"}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Project Type</td><td>${projectType}</td></tr>
          </table>
          <h3>Message</h3>
          <p>${message.replace(/\n/g, "<br>")}</p>
        `,
      });
    }
  } catch (err) {
    // Log but don't fail — the submission was saved
    console.error("Email send error:", err);
  }

  return NextResponse.json({ success: true });
}
