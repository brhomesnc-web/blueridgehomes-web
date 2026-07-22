/**
 * The publish_at wire contract — one definition, three consumers.
 *
 * The client sends a NAIVE wall-clock string ("2026-08-05T06:00") which is
 * America/New_York time BY CONSTRUCTION. It is never a UTC instant, never an
 * ISO string with an offset, and never epoch millis. The server converts with
 * `$n::timestamp AT TIME ZONE 'America/New_York'` and Postgres owns the zone
 * math from there.
 *
 * Why the zone lives in SQL and not in the browser: the business publishes on
 * Eastern time regardless of where the laptop doing the approving happens to
 * be. Converting client-side would make a post scheduled from a different
 * timezone land at the wrong hour, and it would scatter America/New_York
 * across client code where nobody can audit it. Do not "fix" this by reaching
 * for toISOString(), getTimezoneOffset(), or a date library.
 */

// datetime-local's own output format. Seconds and zone suffixes are rejected:
// anything looser reaches $n::timestamp and throws a raw Postgres error inside
// a transaction, which surfaces to the admin as an opaque 500.
export const PUBLISH_AT_PATTERN = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}$/;

export type PublishAtResult =
  | { ok: true; value: string | null }
  | { ok: false; error: string };

/**
 * Absent / null / "" all mean "publish now" — that default is what lets the
 * approve entry points that never send publish_at keep working unchanged.
 *
 * Past datetimes are deliberately ACCEPTED. The scheduler's predicate is
 * `publish_at <= now()`, so a past value publishes on the next tick (≤60s) —
 * "publish now, slightly late". Rejecting would turn a few seconds of clock
 * skew into a hard error. The client warns; the server accepts.
 */
export function parsePublishAtLocal(input: unknown): PublishAtResult {
  if (input === undefined || input === null || input === "") {
    return { ok: true, value: null };
  }
  if (typeof input !== "string" || !PUBLISH_AT_PATTERN.test(input)) {
    return {
      ok: false,
      error:
        "publish_at must be a local date and time like 2026-08-05T06:00 (America/New_York)",
    };
  }
  // Postgres accepts both separators; normalizing keeps the stored/echoed form
  // consistent with what psql users type by hand.
  return { ok: true, value: input.replace("T", " ") };
}

/**
 * "Now" as a naive New York wall-clock string, in the same shape the input
 * emits — so a past-date check is a plain string comparison (the format sorts
 * lexicographically) with no Date parsing on either side.
 *
 * This is the ONE narrow client-side exception to the zone rule above, and it
 * is only ever used for a warning. It never produces a value that crosses the
 * wire. Note what it deliberately is NOT: toISOString().slice(0, 10), which is
 * the UTC date and already reports tomorrow after 8pm Eastern.
 */
export function nowInNewYorkLocal(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}
