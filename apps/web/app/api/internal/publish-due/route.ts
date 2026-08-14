import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { query } from "@/lib/db";
import { checkApiKey } from "@/lib/agentAuth";

/**
 * The publish scheduler's business end.
 *
 * instrumentation.ts ticks every 60s and POSTs here; this handler does the flip
 * AND the revalidation. The split matters: revalidatePath() is only proven to
 * work inside a real request context, and a post that publishes but stays
 * invisible is exactly the trap the on-demand-revalidation slice closed. So the
 * timer never touches the database — it just knocks on this door.
 *
 * POST only. A GET scanner gets a 405 for free, and POST is never cached.
 *
 * Reachable from the public internet: nginx's catch-all `location /` proxies
 * every /api/* path to 3001 and there is no loopback-only option without editing
 * nginx. Hence the key check happens BEFORE any DB work — an unauthorized
 * request must not cost a round-trip. Blast radius if the key ever leaked is
 * "already-approved posts publish early", not data loss.
 */

type FlippedRow = {
  slug: string;
  date: string;
  publish_at_ny: string;
};

export async function POST(request: Request) {
  if (!checkApiKey(request, process.env.PUBLISH_SCHEDULER_KEY || "")) {
    return NextResponse.json({ error: "Invalid or missing API key" }, { status: 401 });
  }

  let rows: FlippedRow[];
  try {
    // One statement, so it is atomic without a transaction. `date` derives from
    // publish_at rather than now() — a tick that runs late (server was down,
    // deploy in progress) still stamps the date the post was scheduled for.
    // It must stay YYYY-MM-DD: idx_blog_posts_published (published, date DESC)
    // sorts it lexicographically, so any other format silently breaks ordering.
    //
    // Idempotent by construction: published = false in the predicate means a
    // second overlapping call matches zero rows. Double-firing cannot
    // double-publish, so the tick needs no distributed lock.
    ({ rows } = await query<FlippedRow>(
      `UPDATE blog_posts
          SET published = true,
              date = to_char(publish_at AT TIME ZONE 'America/New_York', 'YYYY-MM-DD')
        WHERE published = false
          AND publish_at IS NOT NULL
          AND publish_at <= now()
      RETURNING slug,
                date,
                to_char(publish_at AT TIME ZONE 'America/New_York', 'YYYY-MM-DD HH24:MI')
                  AS publish_at_ny`
    ));
  } catch (err) {
    // Most likely: column "publish_at" does not exist — the ALTER in
    // db/schema/blog_posts.sql has not been applied to this database yet.
    console.error("[scheduler] flip query failed:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "Publish scheduler is not available yet." },
      { status: 503 }
    );
  }

  // The common case, every tick, all day. Nothing due means nothing to
  // invalidate — revalidating here would churn the cache for no reason.
  if (rows.length === 0) {
    return NextResponse.json({ published: 0, slugs: [] });
  }

  revalidatePath("/blog");
  // /sitemap.xml is the third published-gated surface — app/sitemap.ts builds it
  // from getAllSlugs(), which filters on published = TRUE.
  revalidatePath("/sitemap.xml");
  for (const row of rows) {
    revalidatePath(`/blog/${row.slug}`);
    // The only visibility into an unattended process. journalctl -u brhomes-web
    // is where this gets read when a post doesn't show up when expected.
    console.log(
      `[scheduler] published ${row.slug} — date=${row.date} scheduled=${row.publish_at_ny} America/New_York`
    );
  }

  return NextResponse.json({
    published: rows.length,
    slugs: rows.map((row) => row.slug),
  });
}
