# Blue Ridge Homes — Marketing Platform

This document is the source of truth for the Blue Ridge Homes marketing platform: its
architecture, module-by-module build status, data model, and the agent-facing surface.

For site/VPS operations (deploy, nginx, systemd, env, rollback) see `OPS.md`.

---

## 1. Overview

The marketing platform is a custom marketing operations system built **inside the existing
Next.js app**, served at `/admin/marketing`. It runs on a three-layer model: the **platform**
holds the data, surfaces, and controls; a **Claude Cowork agent** proposes actions against it;
and a **human approval** step gates anything consequential before it takes effect. High-stakes
actions require sign-off; low-stakes actions auto-approve and are recorded for the audit trail.
The platform is an extension of the site's existing admin — it reuses the site's auth, database
layer, and brand system rather than standing anything up alongside them.

### The Cowork boundary — Cowork must never own the publish moment

Cowork's scheduled recurring tasks only run **while the machine is awake and the Claude Desktop app
is open**; a run scheduled while the box is off is skipped, not queued for later. A post due at 6am
Tuesday therefore cannot depend on it. That splits the work along a determinism line:

- **The VPS owns publishing** — always-on, must-fire, deterministic, no LLM anywhere in the path.
  This is the scheduler (`instrumentation.ts` → `/api/internal/publish-due`).
- **Cowork owns the upstream creative end** — draft generation, research, competitor/SEO passes,
  batching drafts into the queue via `POST /api/agent/content`. Non-deterministic, best-effort,
  human-in-the-loop at approve. **A missed Cowork run costs nothing** — the queue just doesn't grow
  that day.
- **Cowork must never hold the only copy of a scheduled date.** `publish_at` lands in Postgres at
  approve time; Cowork's job ends at "the draft is in the queue".

**How Cowork actually connects** (established 2026-07-23, unknown when the boundary above was
written): **direct HTTPS calls to the key-gated `/api/agent/*` endpoints** from the Cowork sandbox —
no MCP server, no OAuth, no custom connector. MCP was ruled out because the custom-connector dialog
exposes only OAuth client ID/secret with no request-headers option, so the `static_headers` beta that
would carry `x-api-key` is unavailable on this account; it stays an upgrade path, not a prerequisite.
**The sandbox's filtering proxy must be allowed to reach the site** — a blocked request surfaces as
`curl: (56) CONNECT tunnel failed` and HTTP `000`, which is an egress block, **not** an outage.
Operational detail, key location, the egress fix and the security posture live in `OPS.md` →
"Cowork Integration".

**This is NOT the old `/marketing/` static SPA.** That is a separate, pre-existing artifact
served directly by nginx from `/var/www/brhomes-marketing/`, superseded by this platform and
pending decommission. See `OPS.md` → "VPS Artifacts — Pending Decommission". Nothing in this
platform references, imports from, or integrates with it.

---

## 2. Architecture & Conventions

Everything lives inside `apps/web`. No new service, no new port, no nginx changes.

### Location

    Pages   apps/web/app/admin/marketing/*
    APIs    apps/web/app/api/admin/marketing/*
    Shared  apps/web/app/admin/marketing/_components/   (underscore = not routable)
    Schema  apps/web/db/schema/*.sql
    Agent   apps/web/lib/agentAuth.ts

### Auth

The platform **inherits the existing gate for free**. `apps/web/middleware.ts` already matches
`/admin/:path*`, so every `/admin/marketing/*` page is session-gated with no new auth code.
Session is a JWT in the `brh_admin_session` cookie, signed with `ADMIN_JWT_SECRET` (see
`lib/auth.ts`). Auth was extended, never replaced.

Defense in depth: **every marketing API route also calls `getSession()`** and returns 401 if
absent — matching the convention of every other admin API in the app. Middleware alone is not
treated as sufficient.

Key-gated (non-session) endpoints use `lib/agentAuth.ts`:

- `checkApiKey(request, expected)` holds the comparison; `checkMarketingApiKey(request)` is a thin
  wrapper that supplies `MARKETING_AGENT_API_KEY`. Callers of the wrapper were unchanged by the
  generalization.
- Dual-header, same convention as the existing blog agent key: `x-api-key: <key>` **or**
  `Authorization: Bearer <key>`.
- Constant-time comparison via `crypto.timingSafeEqual` (the blog seed used `===`).
- **Closed when unset**: an empty expected value returns `false`, so a route is shut until its key
  exists rather than open by default.
- **Four consumers today** (verified by grep 2026-07-23): `POST /api/agent/content`,
  `GET /api/agent/posts` and `GET /api/agent/queue` — all three `MARKETING_AGENT_API_KEY` via
  `checkMarketingApiKey` — plus `POST /api/internal/publish-due` (`PUBLISH_SCHEDULER_KEY`, passed to
  `checkApiKey` directly).
- **Not a consumer, despite the identical name:** `app/api/blog/[slug]/route.ts` defines its own
  module-local `checkApiKey` (`===` against `BLOG_AGENT_API_KEY`) gating the retained `DELETE` verb.
  See `OPS.md` → Horizon → "`checkApiKey` name shadowing".

### Database

Access is **only** via `lib/db.ts` `query()` with `$1`/`$2` parameters. No ORM, no raw pool use.
Conventions follow the existing tables: snake_case columns, `serial` primary keys, timestamptz
`created_at`, text status enums, JSONB written as `$n::jsonb` with `JSON.stringify`.

**Exception (Content module).** `lib/queueExecutor.ts`'s approve-and-publish runs inside
`lib/db.ts` `withTransaction()`, which uses `pool.connect()` to pin one client for
`BEGIN`/`COMMIT`/`ROLLBACK`. This is the one place raw-pool access is sanctioned: the status flip
and the `blog_posts` INSERT must not half-commit, and `query()` cannot express that because each
call may draw a different client from the pool. All other access stays `query()`-only — reach for
`withTransaction` only when two writes must both land or both not.

New tables are documented as **checked-in SQL under `db/schema/`** and applied **manually** on
the VPS Postgres (`:5433`). There is no migration runner in this repo — `db/schema/*.sql` is the
record of intent, not an executable migration. See `OPS.md` → "Repo Conventions".

**Adding a COLUMN needs two forms, and this is a trap.** The files are full
`CREATE TABLE IF NOT EXISTS` snapshots, so against an existing table the guard skips the whole
statement — **a column added only to the `CREATE` block is a silent no-op** that lives in git and
never in the database. Write both: the `CREATE` entry (keeping the snapshot honest) **and** an
idempotent `ALTER TABLE … ADD COLUMN IF NOT EXISTS` below it. Apply the DDL **before** the deploy
that ships code reading the column. `publish_at` set this precedent 2026-07-22.

### Background processing

The platform now runs **one server-side background timer** — `apps/web/instrumentation.ts`, a 60s
tick that drives the publish scheduler. It is the first in the codebase and the only thing here that
is not request-driven. Full shape, guards, and the health check live in `OPS.md` →
"Background Processing"; note it deliberately does **no** database work of its own, self-`fetch`ing
an internal route so the work lands in a real request context.

### Blog route caching — three settings that only make sense together

Settled across three commits on 2026-08-14 (`fc5ea9c`, `87d12e7`, `d62d8d4`) while making
**unpublish** actually remove a post from the site. **Read these as one connected set, not three
independent settings** — each is non-obvious alone, and each is load-bearing. Every one of them is
pinned by a test in `apps/web/tests/unpublish.test.ts`.

The problem they solve: `/blog`, `/blog/<slug>` and `/sitemap.xml` are all gated on
`published`, and all three are prerendered. **Correct revalidation IS the removal** — there is no
delete step. So the caching configuration is not a performance choice here; it is the takedown
mechanism.

**1. `/blog` and `/sitemap.xml` are `export const revalidate = 60`** (`fc5ea9c`).

They list published posts and **never call `notFound()`**, so they need an ISR surface for
`revalidatePath` to invalidate against — but not per-request dynamism. This is the important part:
**`revalidatePath` on a route prerendered with NO revalidate export is a silent no-op.** There is
nothing to regenerate, the call returns cleanly, reports no error, and the static artifact keeps
serving. That was the original unpublish bug — the `revalidatePath` calls were all present and all
doing nothing.

**2. `/blog/[slug]` is `export const dynamic = "force-dynamic"`, and must carry NO revalidate**
(`87d12e7`).

It is the **only** blog route that calls `notFound()`, and that changes everything. Under ISR, Next
caches the 404 *content* but not the 404 *status*: the not-found body renders while the response is
still served as **200**. force-dynamic computes the status per request, so an unpublished post's URL
returns a true 404. The absence of a `revalidate` export here is therefore asserted by test, not
merely left unwritten — the two settings contradict each other.

**Trade, stated plainly:** a DB query per request instead of a static artifact. Negligible at current
traffic, but it is a real load-profile change and the one cost in this set.

**3. `app/blog` has NO `loading.tsx`** (`d62d8d4`, a deletion).

A route-level `loading.tsx` wraps the **whole segment** in a Suspense boundary and streams its
fallback *before* the page component runs. Once any HTML is flushed the status is locked at 200, so
`notFound()` can render the 404 body but can no longer set the 404 status — **and no route config can
override this, because the flush happens a layer above the page.** This is why force-dynamic alone did
not fix it.

> **⚠ Re-adding a segment loading boundary under `app/blog` silently reintroduces the 200-status
> bug.** It will look like a harmless loading-state improvement. `tests/unpublish.test.ts` asserts the
> file's absence for exactly this reason.

`/portfolio/[slug]` has the same latent shape today — a segment `loading.tsx` above a page that calls
`notFound()`. Unaddressed by design; see `OPS.md` → Horizon.

### UI

- Tailwind v4 utilities (CSS-first; configured via `@tailwindcss/postcss` + `@theme inline` in
  `app/globals.css` — there is no `tailwind.config.js`).
- Brand CSS-var palette: `--br-gold`, `--br-cream`, `--br-text`, `--br-line`, etc.
- Fonts already wired via `next/font`: `font-serif` (Cormorant Garamond), `font-sans` (Inter).
- **Recharts `^3.9.2`** for charts — verified against `package.json` 2026-07-22. TipTap added
  5 more dependencies later (see §7), so this is no longer the only one.
- Shared primitives in `_components/`: `ui.tsx` (Card, KpiCard, StakesTag, ModuleTag, StatusTag,
  EmptyState, NotBuiltYet, Spinner), `palette.ts` (hex values for Recharts, mirrored from the CSS
  vars), `DateRangeSelector.tsx`, `AgentStatusChip.tsx`, `OverviewClient.tsx`.
- No second component kit. The rest of the admin uses inline styles; this surface deliberately
  does not, and that boundary stops at `/admin/marketing`.

---

## 3. Module Status

| Module | Route | Status |
| --- | --- | --- |
| Overview | `/admin/marketing` | **Built.** Exactly one real metric: qualified-leads-this-month, from `submissions`. All other KPIs and all 6 charts are representative data. |
| Approvals (queue) | `/admin/marketing/queue` | **Built.** Requires `db/schema/approval_queue.sql` applied on the VPS to activate. Until then it degrades to an empty queue with an in-UI notice (no 500). |
| Leads | `/admin/marketing/leads` | **Built.** READ-THROUGH of `submissions` + `feedback_submissions`. No leads table, no writes anywhere. |
| Agent-status chip + kill-switch | sidebar footer | **Built, wired to a STUB source** (`/api/admin/marketing/agent-status`, in-memory state). There is no real agent yet; Pause flips a stub flag. |
| Date-range selector | Overview header | **Built.** Slices representative data (7 / 30 / 90 / This month / custom). Shape is production-ready for real queries. |
| Content | `/admin/marketing/content` | **Built.** Full loop: human compose form + agent producer (`POST /api/agent/content` via `checkMarketingApiKey` — first wiring of `lib/agentAuth.ts`) enqueue `publish_post` drafts into `approval_queue`; review drawer shows full payload; Approve runs status-flip + `blog_posts` INSERT in one transaction (`lib/queueExecutor.ts`), rejecting/re-opening are side-effect-free. Slug conflict → 409, tx rolls back, nothing publishes. **Scheduling (2026-07-22):** approve accepts an optional top-level `publish_at`; the executor computes `published`, `date` and `publish_at` from it; approve revalidates `/blog` only when something actually publishes; scheduled posts flip live on the 60s tick. Posts tab is a `blog_posts` inventory with a three-state pill (Live / Scheduled / Draft) plus reschedule, publish-now and cancel via `PATCH /api/admin/marketing/content/[slug]/schedule`. **Unpublish + the full draft lifecycle (2026-08-14):** a fourth `unpublish` action soft-hides a live post — `published = false` and `publish_at` NULLed in the *same* statement, because the 60s tick is a catch-up query (`publish_at <= now()`) and would otherwise republish it within a minute. Revalidation now fires on every mutation path, including `/sitemap.xml`; correct revalidation IS the removal, so see §2 → "Blog route caching" for the three route settings that had to land before it worked. Draft cards carry **`Publish now`** (one-click, no confirm) and **`Schedule →`**, routing through the existing `publish_now` / `reschedule` actions — both guard only on `published = false`, which a draft satisfies, so that fix was **UI-only**. Four origins produce a draft: queue-approve-with-a-schedule (leaves `publish_at` **set**), `unpublish`, `cancel`, and `POST /api/admin/blog` (all three leave it **NULL**); all four now have a forward path. |
| Social | `/admin/marketing/social` | Placeholder — "Not built yet". |
| Ads | `/admin/marketing/ads` | Placeholder — "Not built yet". |
| Email | `/admin/marketing/email` | Placeholder — "Not built yet". |
| Reviews | `/admin/marketing/reviews` | Placeholder — "Not built yet". |
| Analytics | `/admin/marketing/analytics` | Placeholder — "Not built yet". |
| Market Data | `/admin/marketing/market-data` | Placeholder — "Not built yet". |
| Assets | `/admin/marketing/assets` | Placeholder — "Not built yet". |

Every nav item has a home; the eight placeholders render a branded slot so the shell is complete
and no link dead-ends.

---

## 4. Data Model

### `approval_queue` (new — the only table this platform adds)

Source of truth: `apps/web/db/schema/approval_queue.sql`.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `serial` | primary key |
| `created_at` | `timestamptz` | NOT NULL, default `now()` |
| `module` | `text` | NOT NULL — e.g. `Content`, `Social`, `Ads`, `Email`, `Reviews` |
| `action` | `text` | NOT NULL — machine action key, e.g. `publish_post` |
| `stakes` | `text` | NOT NULL, default `'medium'`, CHECK in (`high`, `medium`, `low`) |
| `title` | `text` | NOT NULL — human-facing headline |
| `preview` | `text` | nullable — human-facing summary |
| `payload` | `jsonb` | NOT NULL, default `'{}'::jsonb` |
| `status` | `text` | NOT NULL, default `'pending'`, CHECK in (`pending`, `approved`, `rejected`, `auto_approved`) |
| `reviewed_at` | `timestamptz` | nullable — set on approve/reject, cleared on re-open |
| `reviewer` | `text` | nullable — currently always `admin` (single admin identity) |

Index: `approval_queue_status_created_idx` on `(status, created_at DESC)` — the queue is read
almost exclusively by status, newest-first.

**The Content producer writes to this table today.** `POST /api/agent/content` (key-gated) and the
admin compose form both enqueue `pending` rows through `enqueueContentDraft`; reads go through
`listQueue()`. Producers for the other seven modules are still pending.

### `blog_posts` (pre-existing — the platform now owns columns on it)

Not a table this platform created, but no longer only a write target either: the Content module owns
`publish_at`, and the scheduler writes `published` and `date`. Source of truth for the shape is
`apps/web/db/schema/blog_posts.sql` (a snapshot reconciled against live `\d blog_posts`).

| Column | Type | Notes |
| --- | --- | --- |
| `slug` | `text` | NOT NULL, UNIQUE (`blog_posts_slug_key`) — the executor's `ON CONFLICT (slug)` target and the `/blog/[slug]` route key |
| `published` | `boolean` | default `false` — **the source of truth.** Every *public* read in `lib/blog.ts` (`getAllPosts`, `getPostBySlug`, `getAllSlugs`) gates on `published = TRUE`; `listAllPosts()` in that same file deliberately does **not** — it backs the admin inventory and `GET /api/agent/posts` |
| `date` | `text` | NOT NULL, **`YYYY-MM-DD`** — display date AND sort key. `idx_blog_posts_published (published, date DESC)` sorts it **lexicographically**, so any other format silently corrupts ordering |
| `publish_at` | `timestamptz` | nullable — **an instruction, not a state.** NULL = not scheduled. The tick flips `published` once `publish_at <= now()` and re-derives `date` from it |

The `published` / `publish_at` split is deliberate: deriving `published` from `publish_at` would have
rewritten every read query for no gain, and the catch-up property (a missed tick publishes late
rather than never) falls out of the predicate for free.

**The publish-gate invariant, stated precisely.** **Three** code paths can set `published = true`,
and only one of them can do it to a post the queue has not already approved:

1. **`executeApprovedAction`** (`lib/queueExecutor.ts`), reached only by approving a queue row. This
   is the gate — the `BLOG_AGENT_API_KEY` write doors returned **410 Gone** in `566dd15` (2026-07-22),
   and the session-gated admin CRUD stopped accepting `published` at all on 2026-08-14 (`0a9cf6e`),
   400-ing on a body that carries the key.
2. **The 60s scheduler tick** (`/api/internal/publish-due`), flipping rows that path 1 created with a
   `publish_at`, once they come due.
3. **`publish_now`** on the schedule route, flipping one of those rows on demand.

Paths 2 and 3 act **only on rows path 1 inserted**, which is what keeps the approval queue the real
gate. This entry previously read "nothing can set `published = true` except `executeApprovedAction`",
which has been wrong since the scheduler shipped 2026-07-22. The inverse, `published = false`, is set
by `unpublish` and is likewise not reachable without a session (2026-08-14).

**And `/api/blog` is still not "closed":** a key-gated `DELETE /api/blog/[slug]` survives, can remove
a live post, and — because no delete path revalidates — leaves a stale prerendered page behind. See
`OPS.md` → Horizon → "Blog SSG delete gap".

### Leads — read-through, no table

Leads are a **read-through** of two existing tables, unioned with a `source` field
(`contact` | `feedback`). Nothing is written. `app/contact/page.tsx` and `api/contact` are
untouched.

    submissions           → source 'contact'   (has a status column)
    feedback_submissions  → source 'feedback'  (no status column; 'new' is injected)

Stage mapping from the existing `submissions.status`:

    new       → New
    read      → Contacted
    replied   → Qualified
    archived  → Lost
    (feedback rows always land in New)

**`Quoted` and `Won` render as empty `v2` columns** — there is no data behind them and none is
invented. AI fit-scoring is likewise absent. Both arrive with the v2 enrichment layer, which
gets its own table.

---

## 5. Deferred / v2 Backlog

Explicitly out of scope for slice 1, in rough dependency order:

1. **Leads enrichment table (v2)** — the real sales pipeline: full stage set including Quoted/Won,
   AI fit score, nurture history. This is the layer that turns the read-through board into a
   working pipeline. Its own table; leads stay read-through until it lands.
2. **Agent producers** — the modules that write proposed actions into `approval_queue`. These are
   what make the queue non-empty and what first consume `lib/agentAuth.ts`.
   **Content: DONE** — `POST /api/agent/content` is the first consumer of `lib/agentAuth.ts`, and
   the pattern the rest follow: validate → enqueue pending → human approves → `queueExecutor`
   dispatches the effect. Producers for the remaining 7 modules are still pending; each needs its
   own `(module, action)` case registered in `lib/queueExecutor.ts`.
3. **Real functionality behind the 8 placeholders** — Content, Social, Ads, Email, Reviews,
   Analytics, Market Data, Assets.
4. **Replace the agent-status stub** with a real status store the agent heartbeats into (current
   state is an in-memory module variable that resets on server restart, and Pause only flips that
   flag — it does not yet stop anything real).
5. **Analytics ingest** — real data behind the Overview KPIs and charts, replacing the
   representative series. Only leads-this-month is real today.
6. **Social publishing on publish — designed, not built.** Recorded because the decisions are
   non-obvious and would otherwise be redone from scratch:
   - **Same determinism split as the Cowork boundary in §1:** dispatch must fire at publish time, so
     it belongs on the **VPS**. Caption *composition* is LLM work that belongs **upstream at draft
     time** — generated with the post and reviewed in the same approve step, never inside the
     must-fire path.
   - **A social send failing must never roll back the publish.** The site is the asset; social is
     amplification. This is the single most important constraint in the design.
   - **Shape:** an outbox table, one row per (post × channel) carrying status / attempts /
     last_error, dispatched **outside** the publish transaction, retried on the tick the scheduler
     already runs, with a Pushover alert on terminal failure (`PUSHOVER_TOKEN` / `PUSHOVER_USER` are
     already wired).
   - **Hangs off the flip** in `app/api/internal/publish-due/route.ts` — that is where outbox rows
     get written.
   - **Sequencing:** (1) scheduler ✅ shipped 2026-07-22, (2) outbox + **one** channel proven end to
     end, (3) further channels as per-channel adapters.
   - **Blocked on:** which channels are actually live, and whether a Meta Business account exists
     with Instagram linked to the Facebook Page — a hard prerequisite for programmatic IG posting.
     Every channel needs its own OAuth app, review process, and token-refresh lifecycle; expired page
     tokens mean silently missed posts.

---

## 6. Manual VPS Steps Outstanding

Both are done by hand on the VPS, deliberately, outside any build or deploy:

- [x] **(a) Apply the approval_queue schema** to Postgres on `:5433` — **done 2026-07-17**:

        psql -p 5433 -d <db> -f /var/www/brhomes/apps/web/db/schema/approval_queue.sql

  Until applied, the Approvals view renders empty with an in-UI notice. Nothing else breaks.
  The database is clean — there are no stale marketing tables from the old SPA to drop first.

- [x] **(b) Add `MARKETING_AGENT_API_KEY`** to `/var/www/brhomes/apps/web/.env.local` —
  **done 2026-07-17**, added unquoted with the Content producer. Value must be **unquoted**
  (see `OPS.md` → "Environment Variables"); `checkMarketingApiKey` compares byte-for-byte and
  surrounding quotes would become part of the key.

- [x] **(c) Publish scheduler prerequisites** — **both done 2026-07-22**, both applied
  **before** the deploy that shipped the code reading them:

        # 1. the key, appended to .env.local unquoted
        PUBLISH_SCHEDULER_KEY=<openssl rand -hex 32>

        # 2. the column
        ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS publish_at timestamptz;

  **The ordering is the rule, not a coincidence:** DDL and env first, deploy second. A nullable
  column is backward-compatible so early application is safe, whereas the reverse order gives you a
  live app querying a column that does not exist. Note the `ALTER` was required *in addition to* the
  `CREATE` block edit — see §2 → Database.

When these flip to done, tick them here — that is the only doc follow-up a deploy requires.

---

## 7. Deploy Notes

The platform ships as **ordinary routes in the existing Next app**, plus — since 2026-07-22 —
**one background timer** (`instrumentation.ts`; see §2 → Background processing). There are:

- **No nginx changes** — it is served through the existing `proxy_pass` to `127.0.0.1:3001`.
- **No systemd changes** — same `brhomes-web` service, same port. That service runs the
  **standalone** server (`node .next/standalone/server.js`), not `next start`; these routes ship
  inside the standalone bundle like any other page and need nothing unit-specific.
- **No new service, no new port.**

Deploy is one command — `cd /var/www/brhomes/apps/web && ./deploy.sh`. That script is the only
deploy path and owns the pull, install, build, standalone asset copies, and restart. See
`OPS.md` → "Standard Update / Redeploy Procedure", including the bootstrap note for when
`deploy.sh` itself changes.

Build-relevant dependency changes to date: `recharts` (this platform), and **5 TipTap packages**
added later for the WYSIWYG editor (`@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`,
`@tiptap/markdown`, `@tiptap/extension-image`, all 3.28.x). The script's `npm install` picks all of
them up from the committed `package-lock.json`. No dependency was added for the scheduler — it is
`setInterval` and `fetch`.

**Local builds do not complete, and that is expected.** `next build` compiles and typechecks
cleanly, then fails at `Collecting page data` with `ECONNREFUSED` on `/portfolio/[slug]`. That
route (and `/blog/[slug]`) call `generateStaticParams()`, which queries Postgres **at build
time** — and the database is only reachable from the VPS. This is a pre-existing build-time DB
dependency, unrelated to the marketing platform: no marketing page uses `generateStaticParams`,
and the Overview server page is `force-dynamic`. The full build completes on the VPS, where
`DATABASE_URL` resolves.

**So `npm run build` is not a valid local gate** — it fails identically at every recent commit, and a
failure there is environmental, not a regression. (`SASL: ... client password must be a string` is the
same thing wearing a different hat: `DATABASE_URL` present but empty.) Do not spend a round on it.

To verify marketing changes locally without a database:

    cd apps/web
    npx tsc --noEmit        # typecheck — the real gate; must exit 0
    npm test                # vitest; no DB harness, so no DB needed
    npx next build          # optional: expect "Compiled successfully", then the portfolio failure
