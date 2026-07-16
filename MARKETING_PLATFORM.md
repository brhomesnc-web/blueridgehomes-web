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

Future agent-write endpoints use `lib/agentAuth.ts` → `checkMarketingApiKey(request)`:

- Reads `MARKETING_AGENT_API_KEY` from the environment.
- Dual-header, same convention as the existing blog agent key: `x-api-key: <key>` **or**
  `Authorization: Bearer <key>`.
- Constant-time comparison via `crypto.timingSafeEqual` (the blog seed used `===`).
- **Not wired to any endpoint yet** — it is the door, waiting on producers.

### Database

Access is **only** via `lib/db.ts` `query()` with `$1`/`$2` parameters. No ORM, no raw pool use.
Conventions follow the existing tables: snake_case columns, `serial` primary keys, timestamptz
`created_at`, text status enums, JSONB written as `$n::jsonb` with `JSON.stringify`.

New tables are documented as **checked-in SQL under `db/schema/`** and applied **manually** on
the VPS Postgres (`:5433`). There is no migration runner in this repo — `db/schema/*.sql` is the
record of intent, not an executable migration. See `OPS.md` → "Repo Conventions".

### UI

- Tailwind v4 utilities (CSS-first; configured via `@tailwindcss/postcss` + `@theme inline` in
  `app/globals.css` — there is no `tailwind.config.js`).
- Brand CSS-var palette: `--br-gold`, `--br-cream`, `--br-text`, `--br-line`, etc.
- Fonts already wired via `next/font`: `font-serif` (Cormorant Garamond), `font-sans` (Inter).
- **Recharts `^3.9.2`** for charts — the only dependency this platform added.
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
| Content | `/admin/marketing/content` | Placeholder — "Not built yet". |
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

**No producers write to this table yet.** The API supports listing by status and PATCHing a
status; the enqueue side arrives with the agent modules.

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
3. **Real functionality behind the 8 placeholders** — Content, Social, Ads, Email, Reviews,
   Analytics, Market Data, Assets.
4. **Replace the agent-status stub** with a real status store the agent heartbeats into (current
   state is an in-memory module variable that resets on server restart, and Pause only flips that
   flag — it does not yet stop anything real).
5. **Analytics ingest** — real data behind the Overview KPIs and charts, replacing the
   representative series. Only leads-this-month is real today.

---

## 6. Manual VPS Steps Outstanding

Both are done by hand on the VPS, deliberately, outside any build or deploy:

- [ ] **(a) Apply the approval_queue schema** to Postgres on `:5433`:

        psql -p 5433 -d <db> -f /var/www/brhomes/apps/web/db/schema/approval_queue.sql

  Until applied, the Approvals view renders empty with an in-UI notice. Nothing else breaks.
  The database is clean — there are no stale marketing tables from the old SPA to drop first.

- [ ] **(b) Add `MARKETING_AGENT_API_KEY`** to `/var/www/brhomes/apps/web/.env.local` when the
  first agent producer lands. Not needed before then — nothing reads it yet. Value must be
  **unquoted** (see `OPS.md` → "Environment Variables").

When these flip to done, tick them here — that is the only doc follow-up a deploy requires.

---

## 7. Deploy Notes

The platform ships as **ordinary routes in the existing Next app**. There are:

- **No nginx changes** — it is served through the existing `proxy_pass` to `127.0.0.1:3001`.
- **No systemd changes** — same `brhomes-web` service, same port.
- **No new service, no new port.**

Deploy is the standard procedure — see `OPS.md` → "Standard Update / Redeploy Procedure".
The only build-relevant change is the added `recharts` dependency, which `npm ci` picks up from
the committed `package-lock.json`.

**Local builds do not complete, and that is expected.** `next build` compiles and typechecks
cleanly, then fails at `Collecting page data` with `ECONNREFUSED` on `/portfolio/[slug]`. That
route (and `/blog/[slug]`) call `generateStaticParams()`, which queries Postgres **at build
time** — and the database is only reachable from the VPS. This is a pre-existing build-time DB
dependency, unrelated to the marketing platform: no marketing page uses `generateStaticParams`,
and the Overview server page is `force-dynamic`. The full build completes on the VPS, where
`DATABASE_URL` resolves.

To verify marketing changes locally without a database:

    npx tsc --noEmit        # typecheck — should exit 0
    npx next build          # expect "Compiled successfully", then the known portfolio failure
