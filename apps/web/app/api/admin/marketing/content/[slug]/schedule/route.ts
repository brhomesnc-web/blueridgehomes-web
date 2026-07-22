import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { parsePublishAtLocal } from "@/lib/publishAt";

/**
 * Schedule management for a post that is already in blog_posts but not yet live.
 *
 * Session-gated, not key-gated: this is an admin surface like the queue routes,
 * not an agent door. (agentAuth/checkApiKey is for the /api/agent/* family.)
 *
 * Every action guards on `published = false`. Moving an ALREADY-LIVE post is
 * deliberately out of scope: there is no unpublish path anywhere in the admin,
 * and there could not be a safe one without a revalidation story — a post
 * removed from the DB keeps serving from the static cache until something
 * invalidates /blog. Zero rows affected therefore means "already live" and
 * returns 409 rather than silently doing nothing.
 */

type Action = "reschedule" | "publish_now" | "cancel";
const ACTIONS: Action[] = ["reschedule", "publish_now", "cancel"];

const ALREADY_LIVE = {
  error: "That post is already live — its schedule can no longer be changed.",
  code: "already_published",
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;

  let body: { action?: string; publish_at?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!ACTIONS.includes(body.action as Action)) {
    return NextResponse.json(
      { error: `action must be one of ${ACTIONS.join(", ")}` },
      { status: 400 }
    );
  }
  const action = body.action as Action;

  try {
    if (action === "reschedule") {
      const parsed = parsePublishAtLocal(body.publish_at);
      if (!parsed.ok) {
        return NextResponse.json({ error: parsed.error }, { status: 400 });
      }
      if (parsed.value === null) {
        return NextResponse.json(
          { error: "reschedule requires a publish_at — use cancel to clear it" },
          { status: 400 }
        );
      }

      // date tracks publish_at, so a rescheduled post never displays the date it
      // was originally drafted for. The string is already NY-local, so its date
      // portion IS the NY date — no conversion needed here. The scheduler
      // re-derives the identical value at flip time.
      const { rowCount } = await query(
        `UPDATE blog_posts
            SET publish_at = $2::timestamp AT TIME ZONE 'America/New_York',
                date = to_char($2::timestamp, 'YYYY-MM-DD')
          WHERE slug = $1 AND published = false`,
        [slug, parsed.value]
      );
      if (!rowCount) {
        return NextResponse.json(ALREADY_LIVE, { status: 409 });
      }
      // Nothing on /blog changed — an unpublished post is not on the page.
      return NextResponse.json({ ok: true, action, publish_at: parsed.value });
    }

    if (action === "publish_now") {
      const { rows } = await query<{ slug: string }>(
        `UPDATE blog_posts
            SET published = true,
                publish_at = now(),
                date = to_char(now() AT TIME ZONE 'America/New_York', 'YYYY-MM-DD')
          WHERE slug = $1 AND published = false
        RETURNING slug`,
        [slug]
      );
      if (rows.length === 0) {
        return NextResponse.json(ALREADY_LIVE, { status: 409 });
      }

      // The one action here that changes what the public site serves.
      revalidatePath("/blog");
      revalidatePath(`/blog/${rows[0].slug}`);
      return NextResponse.json({ ok: true, action, published: true });
    }

    // cancel — back to an ordinary unpublished draft. Clearing publish_at is
    // what stops the tick from ever picking it up.
    const { rowCount } = await query(
      `UPDATE blog_posts
          SET publish_at = NULL
        WHERE slug = $1 AND published = false`,
      [slug]
    );
    if (!rowCount) {
      return NextResponse.json(ALREADY_LIVE, { status: 409 });
    }
    return NextResponse.json({ ok: true, action });
  } catch (err) {
    console.error("Schedule update failed:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "Could not update the schedule." },
      { status: 500 }
    );
  }
}
