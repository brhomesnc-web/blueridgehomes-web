import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { query } from "@/lib/db";

export async function POST(request: Request) {
  let body: Record<string, string>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Field names copied literally from FeedbackForm.tsx's `data` object.
  const { name, email, phone, projectType, rating, message, turnstileToken } =
    body;

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Name, email, and feedback are required." },
      { status: 400 }
    );
  }

  // Verify Cloudflare Turnstile token
  // (siteverify block copied verbatim from contact/route.ts, but reading
  // `turnstileToken` — the field the client sends — not `cfTurnstileToken`.)
  if (!turnstileToken) {
    return NextResponse.json(
      { error: "Verification failed. Please try again." },
      { status: 400 }
    );
  }
  try {
    const turnstileRes = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: process.env.TURNSTILE_SECRET_KEY,
          response: turnstileToken,
        }),
      }
    );
    const turnstileData = await turnstileRes.json();
    if (!turnstileData.success) {
      return NextResponse.json(
        { error: "Verification failed. Please try again." },
        { status: 400 }
      );
    }
  } catch (err) {
    console.error("Turnstile verification error:", err);
    return NextResponse.json(
      { error: "Verification failed. Please try again." },
      { status: 400 }
    );
  }

  // Rating guard — same range check app/feedback/page.tsx uses for the URL
  // param: parseInt, keep only 1-5, otherwise null.
  const parsedRating = parseInt(String(rating), 10);
  const ratingValue =
    parsedRating >= 1 && parsedRating <= 5 ? parsedRating : null;

  // Store in database (Postgres query() — same pattern as contact/route.ts).
  // feedback_submissions already exists in Postgres; just insert.
  // phone / project_type / rating are nullable per the table DDL.
  try {
    await query(
      "INSERT INTO feedback_submissions (name, email, phone, project_type, rating, message) VALUES ($1, $2, $3, $4, $5, $6)",
      [name, email, phone || null, projectType || null, ratingValue, message]
    );
  } catch (err) {
    console.error("Database error:", err);
    return NextResponse.json(
      { error: "Failed to save feedback." },
      { status: 500 }
    );
  }

  // Send email notification (same Gmail SMTP pattern as contact/route.ts).
  try {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = (process.env.SMTP_PASS || "")
      .replace(/^["']|["']$/g, "")
      .trim();

    if (host && user && pass && pass !== "placeholder") {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });

      const subject = ratingValue
        ? `Private Feedback (${ratingValue} stars) — ${name}`
        : `Private Feedback — ${name}`;

      await transporter.sendMail({
        from: `"Blue Ridge Homes Website" <${user}>`,
        to: "brhomesnc@gmail.com",
        replyTo: `"${name}" <${email}>`,
        subject,
        text: [
          `New private feedback submission from blueridgehomesnc.com`,
          ``,
          `Name: ${name}`,
          `Email: ${email}`,
          `Phone: ${phone || "Not provided"}`,
          `Project Type: ${projectType || "Not provided"}`,
          `Rating: ${ratingValue !== null ? `${ratingValue} stars` : "Not provided"}`,
          ``,
          `Feedback:`,
          message,
        ].join("\n"),
      });
    }
  } catch (err) {
    // Log but don't fail — the feedback was saved.
    console.error("Email send error:", err);
  }

  return NextResponse.json({ success: true });
}
