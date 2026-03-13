"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

type FormState = "idle" | "submitting" | "success" | "error";

export default function ContactPage() {
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const timestampRef = useRef("");

  useEffect(() => {
    timestampRef.current = Date.now().toString();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("submitting");
    setErrorMsg("");

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value.trim(),
      email: (form.elements.namedItem("email") as HTMLInputElement).value.trim(),
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value.trim(),
      projectType: (form.elements.namedItem("projectType") as HTMLSelectElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value.trim(),
      website: (form.elements.namedItem("website") as HTMLInputElement).value,
      _t: timestampRef.current,
    };

    if (!data.name || !data.email || !data.projectType || !data.message) {
      setState("error");
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Something went wrong.");
      }

      setState("success");
    } catch (err) {
      setState("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (state === "success") {
    return (
      <main className="br-page">
        <div className="br-shell br-marble">
          <div className="br-content">
            <section className="br-section" style={{ textAlign: "center", paddingTop: 80, paddingBottom: 80 }}>
              <div className="br-container">
                <h1 className="br-title">Thank You</h1>
                <p className="br-lead" style={{ maxWidth: 520, margin: "18px auto 0" }}>
                  We received your message and will be in touch shortly. We
                  typically respond within one business day.
                </p>
                <div style={{ marginTop: 32 }}>
                  <Link href="/" className="br-button br-button-primary">
                    Back to Home
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="br-page">
      <div className="br-shell br-marble">
        <div className="br-content">

          {/* Hero */}
          <section className="br-hero-wrap">
            <div className="br-hero-full">
              <div className="br-hero-media">
                <div className="br-hero-image-wrap">
                  <Image
                    src="/optimized/dividers/divider-turtleback-falls.jpg"
                    alt="Western North Carolina waterfall"
                    fill
                    priority
                    className="br-hero-image"
                    sizes="(max-width: 768px) 100vw, 100vw"
                  />
                </div>
              </div>
              <div className="br-hero-overlay-gradient" />
              <div className="br-hero-copy">
                <h1 className="br-hero-title">Start the Conversation</h1>
                <p className="br-hero-subtitle">
                  {"Tell us about your project and we\u2019ll take it from there."}
                </p>
              </div>
            </div>
          </section>

          {/* Two-column: Form + Contact Info */}
          <section className="br-section">
            <div className="br-container">
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 360px",
                gap: 48,
                alignItems: "start",
              }}>

                {/* Form */}
                <div>
                  <h2 className="br-title" style={{ marginBottom: 8 }}>Get in Touch</h2>
                  <p className="br-lead" style={{ marginBottom: 28 }}>
                    Fill out the form below and we will get back to you within one business day.
                  </p>

                  {state === "error" && errorMsg && (
                    <div style={{
                      padding: "12px 16px",
                      marginBottom: 20,
                      background: "rgba(180, 60, 60, 0.08)",
                      border: "1px solid rgba(180, 60, 60, 0.2)",
                      color: "#8b3030",
                      fontSize: "0.9rem",
                    }}>
                      {errorMsg}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    {/* Honeypot — hidden from humans */}
                    <div style={{ position: "absolute", left: "-9999px" }} aria-hidden="true">
                      <input type="text" name="website" tabIndex={-1} autoComplete="off" />
                    </div>

                    <div className="br-form-group">
                      <label className="br-form-label" htmlFor="name">Name *</label>
                      <input id="name" name="name" type="text" required className="br-form-input" placeholder="Your full name" />
                    </div>

                    <div className="br-form-group">
                      <label className="br-form-label" htmlFor="email">Email *</label>
                      <input id="email" name="email" type="email" required className="br-form-input" placeholder="your@email.com" />
                    </div>

                    <div className="br-form-group">
                      <label className="br-form-label" htmlFor="phone">Phone</label>
                      <input id="phone" name="phone" type="tel" className="br-form-input" placeholder="(828) 555-0000" />
                      <p className="br-form-helper">Best number to reach you</p>
                    </div>

                    <div className="br-form-group">
                      <label className="br-form-label" htmlFor="projectType">Project Type *</label>
                      <select id="projectType" name="projectType" required className="br-form-select" defaultValue="">
                        <option value="" disabled>Select a project type</option>
                        <option value="Custom Home">Custom Home</option>
                        <option value="Home Remodel">Home Remodel</option>
                        <option value="ICF Construction">ICF Construction</option>
                        <option value="Addition">Addition</option>
                        <option value="Consulting">Consulting</option>
                      </select>
                    </div>

                    <div className="br-form-group">
                      <label className="br-form-label" htmlFor="message">Message *</label>
                      <textarea id="message" name="message" required className="br-form-textarea" placeholder="Tell us about your project, your property, your timeline..." />
                    </div>

                    <button
                      type="submit"
                      className="br-button br-button-primary"
                      disabled={state === "submitting"}
                      style={{ marginTop: 8, width: "100%" }}
                    >
                      {state === "submitting" ? "Sending..." : "Send Message"}
                    </button>
                  </form>
                </div>

                {/* Contact Info Sidebar */}
                <div style={{
                  background: "var(--br-stone)",
                  padding: "32px 28px",
                  borderTop: "3px solid var(--br-gold)",
                }}>
                  <h3 style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "1.3rem",
                    fontWeight: 600,
                    color: "var(--br-text)",
                    marginBottom: 24,
                  }}>
                    Contact Information
                  </h3>

                  <div style={{ marginBottom: 24 }}>
                    <p style={{ fontSize: "0.8rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--br-text-soft)", marginBottom: 4 }}>Phone</p>
                    <a href="tel:18287122867" style={{ fontSize: "1.1rem", fontWeight: 500, color: "var(--br-text)", textDecoration: "none" }}>(828) 712-2867</a>
                  </div>

                  <div style={{ marginBottom: 24 }}>
                    <p style={{ fontSize: "0.8rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--br-text-soft)", marginBottom: 4 }}>Email</p>
                    <a href="mailto:brhomesnc@gmail.com" style={{ fontSize: "1rem", fontWeight: 500, color: "var(--br-text)", textDecoration: "none" }}>brhomesnc@gmail.com</a>
                  </div>

                  <div style={{ marginBottom: 24 }}>
                    <p style={{ fontSize: "0.8rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--br-text-soft)", marginBottom: 4 }}>License</p>
                    <p style={{ fontSize: "1rem", color: "var(--br-text)" }}>NC General Contractor #56328</p>
                  </div>

                  <div style={{
                    borderTop: "1px solid var(--br-line)",
                    paddingTop: 20,
                    marginTop: 8,
                  }}>
                    <p style={{ fontSize: "0.8rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--br-text-soft)", marginBottom: 8 }}>Service Area</p>
                    <p style={{ fontSize: "0.95rem", color: "var(--br-text-mid)", lineHeight: 1.6 }}>
                      Asheville &amp; Buncombe County<br />
                      Henderson County<br />
                      Haywood County
                    </p>
                  </div>

                  <div style={{
                    borderTop: "1px solid var(--br-line)",
                    paddingTop: 20,
                    marginTop: 20,
                  }}>
                    <p style={{ fontSize: "0.8rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--br-text-soft)", marginBottom: 8 }}>Response Time</p>
                    <p style={{ fontSize: "0.95rem", color: "var(--br-text-mid)", lineHeight: 1.6 }}>
                      We typically respond within one business day.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* CTA */}
          <div className="br-closing-sequence">
            <section className="br-section br-cta br-closing-cta">
              <div className="br-container">
                <h2 className="br-title br-title-center">
                  Prefer to Talk?
                </h2>
                <p className="br-lead br-cta-copy">
                  {"Give us a call any time. We are happy to discuss your project over the phone."}
                </p>
                <div className="br-cta-actions">
                  <a href="tel:18287122867" className="br-button br-button-primary">
                    Call (828) 712-2867
                  </a>
                </div>
              </div>
            </section>
          </div>

        </div>
      </div>
    </main>
  );
}
