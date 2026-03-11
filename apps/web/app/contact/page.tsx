"use client";

import { useState } from "react";
import Link from "next/link";

type FormState = "idle" | "submitting" | "success" | "error";

export default function ContactPage() {
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

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
            <div className="br-section-large" style={{ textAlign: "center" }}>
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
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="br-page">
      <div className="br-shell br-marble">
        <div className="br-content">
          <div className="br-section">
            <div className="br-container" style={{ maxWidth: 640 }}>
              <h1 className="br-title">Get in Touch</h1>
              <p className="br-lead">
                Ready to start your project? Fill out the form below and
                we&apos;ll get back to you within one business day.
              </p>

              <div style={{ marginTop: 12, marginBottom: 32 }}>
                <p style={{ fontSize: "0.95rem", color: "var(--br-text-soft)", margin: "6px 0" }}>
                  Phone: <a href="tel:18287122867" style={{ color: "var(--br-text-mid)", fontWeight: 500 }}>(828) 712-2867</a>
                </p>
                <p style={{ fontSize: "0.95rem", color: "var(--br-text-soft)", margin: "6px 0" }}>
                  Email: <a href="mailto:info@brhomesnc.com" style={{ color: "var(--br-text-mid)", fontWeight: 500 }}>info@brhomesnc.com</a>
                </p>
              </div>

              {state === "error" && errorMsg && (
                <div style={{
                  padding: "12px 16px",
                  marginBottom: 20,
                  background: "rgba(180, 60, 60, 0.08)",
                  border: "1px solid rgba(180, 60, 60, 0.2)",
                  borderRadius: 2,
                  color: "#8b3030",
                  fontSize: "0.9rem",
                }}>
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="br-form-group">
                  <label className="br-form-label" htmlFor="name">Name *</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="br-form-input"
                    placeholder="Your full name"
                  />
                </div>

                <div className="br-form-group">
                  <label className="br-form-label" htmlFor="email">Email *</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="br-form-input"
                    placeholder="your@email.com"
                  />
                </div>

                <div className="br-form-group">
                  <label className="br-form-label" htmlFor="phone">Phone</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className="br-form-input"
                    placeholder="(828) 555-0000"
                  />
                  <p className="br-form-helper">Best number to reach you</p>
                </div>

                <div className="br-form-group">
                  <label className="br-form-label" htmlFor="projectType">Project Type *</label>
                  <select
                    id="projectType"
                    name="projectType"
                    required
                    className="br-form-select"
                    defaultValue=""
                  >
                    <option value="" disabled>Select a project type</option>
                    <option value="Custom Home">Custom Home</option>
                    <option value="Home Remodel">Home Remodel</option>
                    <option value="ICF Construction">ICF Construction</option>
                  </select>
                </div>

                <div className="br-form-group">
                  <label className="br-form-label" htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    className="br-form-textarea"
                    placeholder="Tell us about your project..."
                  />
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

              <div style={{ marginTop: 24 }}>
                <Link href="/" style={{ fontSize: "0.9rem", fontWeight: 500, color: "var(--br-text-mid)" }}>
                  &larr; Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
