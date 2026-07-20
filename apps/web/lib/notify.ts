/**
 * Fire-and-forget push notification.
 *
 * Called from the draft-created chokepoint (lib/approvalQueue.ts) to ping Brian's
 * phone the moment a Content draft lands in the queue. It is deliberately
 * fail-open: a bad key, network blip, timeout, or provider outage must NEVER
 * break or delay draft creation. Nothing here throws to the caller and nothing
 * is awaited by it.
 *
 * The actual HTTP send lives in one place (sendPush) so swapping Pushover for
 * ntfy later is a small, contained change.
 */

const REVIEW_URL = "https://blueridgehomesnc.com/admin/marketing/content";
const PUSH_TIMEOUT_MS = 5000;

export type DraftNotice = { title: string; module: string; stakes: string };

// Fire-and-forget: does not return the promise, swallows everything.
export function notifyDraftCreated(notice: DraftNotice): void {
  void sendPush(notice).catch((e) => console.error("[notify] push failed:", e));
}

async function sendPush(notice: DraftNotice): Promise<void> {
  const token = process.env.PUSHOVER_TOKEN;
  const user = process.env.PUSHOVER_USER;
  if (!token || !user) {
    console.warn("[notify] PUSHOVER_TOKEN/PUSHOVER_USER not set — skipping push");
    return;
  }

  const body = new URLSearchParams({
    token,
    user,
    title: "New Content draft to review",
    message: `"${notice.title}" is ready (${notice.stakes} stakes)`,
    url: REVIEW_URL,
    url_title: "Open review queue",
  });

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), PUSH_TIMEOUT_MS);
  try {
    const res = await fetch("https://api.pushover.net/1/messages.json", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: ctrl.signal,
    });
    if (!res.ok) {
      console.error("[notify] pushover HTTP", res.status, await res.text());
    }
  } finally {
    clearTimeout(t);
  }
}
