"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

type FormState = "idle" | "submitting" | "success" | "error";

interface FeedbackFormProps {
  prefillRating?: number;
  prefillName?: string;
  prefillEmail?: string;
}

export default function FeedbackForm({
  prefillRating,
  prefillName,
  prefillEmail,
}: FeedbackFormProps) {
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("submitting");
    setErrorMsg("");

    const form = e.currentTarget;

    const turnstileToken = (
      form.elements.namedItem("cf-turnstile-response") as HTMLInputElement
    )?.value;

    if (!turnstileToken) {
      setState("error");
      setErrorMsg("Please complete the verification challenge.");
      return;
    }

    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value.trim(),
      email: (
        form.elements.namedItem("email") as HTMLInputElement
      ).value.trim(),
      phone: (
        form.elements.namedItem("phone") as HTMLInputElement
      ).value.trim(),
      projectType: (
        form.elements.namedItem("projectType") as HTMLSelectElement
      ).value,
      rating: parseInt(
        (form.elements.namedItem("rating") as HTMLSelectElement).value,
        10
      ),
      message: (
        form.elements.namedItem("message") as HTMLTextAreaElement
      ).value.trim(),
      turnstileToken,
    };

    if (
      !data.name ||
      !data.email ||
      !data.projectType ||
      !data.rating ||
      !data.message
    ) {
      setState("error");
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    try {
      const res = await fetch("/api/feedback", {
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
      <div className="br-section-large br-text-center">
        <h2 className="br-title">Thank You</h2>
        <p className="br-lead">
          We appreciate you taking the time to share your feedback. Brian will
          review your comments and follow up with you personally.
        </p>
        <div className="br-back-link-wrap">
          <Link href="/" className="br-button br-button-primary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="br-form-wrap">
      {state === "error" && errorMsg && (
        <div className="br-form-error">{errorMsg}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="br-form-group">
          <label className="br-form-label" htmlFor="name">
            Name *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="br-form-input"
            placeholder="Your full name"
            defaultValue={prefillName}
          />
        </div>

        <div className="br-form-group">
          <label className="br-form-label" htmlFor="email">
            Email *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="br-form-input"
            placeholder="your@email.com"
            defaultValue={prefillEmail}
          />
        </div>

        <div className="br-form-group">
          <label className="br-form-label" htmlFor="phone">
            Phone
          </label>
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
          <label className="br-form-label" htmlFor="projectType">
            Project Type *
          </label>
          <select
            id="projectType"
            name="projectType"
            required
            className="br-form-select"
            defaultValue=""
          >
            <option value="" disabled>
              Select a project type
            </option>
            <option value="Custom Home">Custom Home</option>
            <option value="Home Remodel">Home Remodel</option>
            <option value="Home Addition">Home Addition</option>
            <option value="ICF Construction">ICF Construction</option>
            <option value="Consulting / Structural Repairs">
              Consulting / Structural Repairs
            </option>
          </select>
        </div>

        <div className="br-form-group">
          <label className="br-form-label" htmlFor="rating">
            Rating *
          </label>
          <select
            id="rating"
            name="rating"
            required
            className="br-form-select"
            defaultValue={prefillRating?.toString() || ""}
          >
            <option value="" disabled>
              How would you rate your experience?
            </option>
            <option value="1">1 - Poor</option>
            <option value="2">2 - Fair</option>
            <option value="3">3 - Average</option>
            <option value="4">4 - Good</option>
            <option value="5">5 - Excellent</option>
          </select>
        </div>

        <div className="br-form-group">
          <label className="br-form-label" htmlFor="message">
            Your Feedback *
          </label>
          <textarea
            id="message"
            name="message"
            required
            className="br-form-textarea"
            placeholder="Tell us about your experience..."
          />
        </div>

        <div className="br-form-group">
          <div
            className="cf-turnstile"
            data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
          />
        </div>

        <button
          type="submit"
          className="br-button br-button-primary br-button--full"
          disabled={state === "submitting"}
        >
          {state === "submitting" ? "Sending..." : "Submit Feedback"}
        </button>
      </form>

      <Link href="/" className="br-back-link">
        &larr; Back to Home
      </Link>
    </div>
  );
}
