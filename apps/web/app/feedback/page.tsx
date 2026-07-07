import type { Metadata } from "next";
import Script from "next/script";
import FeedbackForm from "./FeedbackForm";

export const metadata: Metadata = {
  title: "Share Your Feedback | Blue Ridge Homes",
  robots: {
    index: false,
    follow: false,
  },
};

type SearchParams = Promise<{
  rating?: string;
  name?: string;
  email?: string;
}>;

export default async function FeedbackPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const parsedRating = params.rating ? parseInt(params.rating, 10) : undefined;
  const rating =
    parsedRating && parsedRating >= 1 && parsedRating <= 5
      ? parsedRating
      : undefined;
  const name = params.name || "";
  const email = params.email || "";

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
      />
      <main className="br-page">
      <div className="br-shell br-marble">
        <div className="br-content">
          <div className="br-section">
            <div className="br-container br-container--narrow">
              <h1 className="br-title">Share Your Feedback</h1>
              <p className="br-lead">
                Brian reads every response personally and will follow up with
                you directly. Your honest feedback helps us improve.
              </p>

              <FeedbackForm
                prefillRating={rating}
                prefillName={name}
                prefillEmail={email}
              />
            </div>
          </div>
        </div>
      </div>
      </main>
    </>
  );
}
