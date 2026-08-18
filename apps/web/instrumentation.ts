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

// Idle-liveness heartbeat. Boot logs `registered` and each publish logs a line,
// but a loop that dies after boot with nothing scheduled would look identical to a
// healthy idle one. So every HEARTBEAT_EVERY-th idle tick logs proof-of-life —
// ~hourly at a 60s tick, not the 1440 lines/day a per-tick log would write.
let ticks = 0;
const HEARTBEAT_EVERY = 60;
const startedAt = Date.now();

// The analytics ingest's clock. Hourly, NOT daily — see the block at the bottom
// of register() for why a 24h interval would be the wrong shape here.
const INGEST_TICK_MS = 60 * 60_000;

// The ingest's own stacking guard, separate from isRunning so a slow ingest can
// never delay a publish. Two Google round-trips plus a 7-day upsert can outlive
// a tick when the API is slow.
let ingestRunning = false;

export async function register() {
  // MANDATORY: instrumentation also executes in the build worker and in the edge
  // runtime, neither of which should start a timer. Without this the build would
  // register a scheduler that outlives nothing and logs errors into the build.
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  if (!process.env.PUBLISH_SCHEDULER_KEY) {
    // Fails closed and silently otherwise: the route 401s every tick and no
    // scheduled post ever publishes, with nothing in the log to say why.
    console.warn(
      "[scheduler] PUBLISH_SCHEDULER_KEY unset — publish scheduler AND analytics " +
        "ingest will 401: nothing publishes and no analytics are ingested"
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
      ticks += 1;
      // The route already logs a line per post; this only fires on non-zero, so
      // an idle scheduler stays quiet instead of writing 1440 lines a day.
      if (body.published) {
        console.log(`[scheduler] tick published ${body.published} post(s)`);
      } else if (ticks % HEARTBEAT_EVERY === 0) {
        const uptimeMin = Math.round((Date.now() - startedAt) / 60_000);
        console.log(
          `[scheduler] heartbeat — idle, ${ticks} ticks, uptime ${uptimeMin}m`
        );
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

  // ── Analytics ingest ──────────────────────────────────────────────────────
  // A SECOND timer rather than work folded into the one above. The publish
  // scheduler must stay at 60s to publish to the minute, and the ingest has no
  // business making two Google round-trips 1440 times a day.
  //
  // Hourly, NOT a naked 24h interval. setInterval has no calendar semantics and
  // its clock restarts from zero on every deploy — on a unit that gets deployed
  // most days, a 24h timer would fire approximately never. So the tick is hourly
  // and cheap, and the route no-ops unless max(ingested_at) is older than ~20h.
  // The durable last-run marker therefore lives IN THE TABLES, not in this
  // process's memory, and survives the restart that resets this clock.
  //
  // Same key as the publish door on purpose: both are the same trust boundary
  // (this timer), and a second key is a second thing to forget to set.
  const ingestUrl = `http://127.0.0.1:${process.env.PORT || 3001}/api/internal/ingest-analytics`;
  console.log(
    `[ingest] registered — polling ${ingestUrl} every ${INGEST_TICK_MS / 60_000}m`
  );

  // No eager first call, for the same reason as the publish tick: at boot the
  // HTTP server may not be listening yet. One hour late on first ingest is
  // irrelevant to data that lags 2-3 days anyway.
  setInterval(async () => {
    if (ingestRunning) return;
    ingestRunning = true;
    try {
      const res = await fetch(ingestUrl, {
        method: "POST",
        headers: { "x-api-key": process.env.PUBLISH_SCHEDULER_KEY || "" },
      });

      if (!res.ok) {
        console.error(`[ingest] tick failed: ${res.status} ${res.statusText}`);
        return;
      }

      const body = (await res.json()) as {
        skipped?: boolean;
        ga4Rows?: number;
        gscRows?: number;
      };
      // A skipped tick is the norm — 23 of every 24 — and stays silent. The
      // route logs the real run itself, so this only marks that the timer saw it.
      if (!body.skipped) {
        console.log(
          `[ingest] tick ingested — ga4 ${body.ga4Rows ?? 0} row(s), gsc ${body.gscRows ?? 0} row(s)`
        );
      }
    } catch (err) {
      // Same fail-safe posture as the publish tick: an unhandled rejection here
      // would take the server down, and stale analytics is never worth an
      // outage. During `next build` there is no server on 3001, so the fetch
      // throws and lands here by design.
      console.error(
        "[ingest] tick error:",
        err instanceof Error ? err.message : err
      );
    } finally {
      ingestRunning = false;
    }
  }, INGEST_TICK_MS);
}
