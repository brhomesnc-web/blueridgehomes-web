/**
 * The publish scheduler's clock — the first server-side background timer in this
 * codebase.
 *
 * Next calls register() once per server process at startup. The standalone unit
 * is single-process (systemd brhomes-web, one `node server.js`), so there is
 * exactly one timer and no duplicate-fire risk from workers.
 *
 * The tick deliberately does NO work itself: it POSTs to /api/internal/publish-due
 * and that route handler does the DB flip and the revalidatePath calls inside a
 * real request context. revalidatePath outside a request scope is unproven here,
 * and a post that publishes but stays invisible is the exact failure this whole
 * feature exists to prevent.
 */

const TICK_MS = 60_000;

// Guards against a slow tick stacking on the next one. Module scope is fine:
// single process, single timer.
let isRunning = false;

export async function register() {
  // MANDATORY: instrumentation also executes in the build worker and in the edge
  // runtime, neither of which should start a timer. Without this the build would
  // register a scheduler that outlives nothing and logs errors into the build.
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  if (!process.env.PUBLISH_SCHEDULER_KEY) {
    // Fails closed and silently otherwise: the route 401s every tick and no
    // scheduled post ever publishes, with nothing in the log to say why.
    console.warn(
      "[scheduler] PUBLISH_SCHEDULER_KEY unset — publish scheduler will 401 and publish nothing"
    );
  }

  const url = `http://127.0.0.1:${process.env.PORT || 3001}/api/internal/publish-due`;
  console.log(`[scheduler] registered — polling ${url} every ${TICK_MS / 1000}s`);

  // No immediate first call on purpose. At boot the HTTP server may not be
  // listening yet; waiting for the first natural tick at +60s sidesteps that
  // race entirely. A post is at most one minute late, which is the whole
  // tolerance budget for a feature that schedules to the minute. Do not
  // "improve" this by firing eagerly.
  setInterval(async () => {
    if (isRunning) return;
    isRunning = true;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "x-api-key": process.env.PUBLISH_SCHEDULER_KEY || "" },
      });

      if (!res.ok) {
        console.error(`[scheduler] tick failed: ${res.status} ${res.statusText}`);
        return;
      }

      const body = (await res.json()) as { published?: number };
      // The route already logs a line per post; this only fires on non-zero, so
      // an idle scheduler stays silent instead of writing 1440 lines a day.
      if (body.published) {
        console.log(`[scheduler] tick published ${body.published} post(s)`);
      }
    } catch (err) {
      // Swallow after logging. An unhandled rejection here would take the server
      // down — a live outage caused by the scheduler is far worse than a late
      // post. During `next build` there is no server on 3001, so the fetch
      // throws and lands here: fail-safe by design.
      console.error(
        "[scheduler] tick error:",
        err instanceof Error ? err.message : err
      );
    } finally {
      isRunning = false;
    }
  }, TICK_MS);
}
