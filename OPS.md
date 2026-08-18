# Blue Ridge Homes Operations Guide

This document describes how to operate the Blue Ridge Homes website on the production VPS without affecting existing production apps.

## Related Docs

- Marketing platform — architecture, module status, data model, agent surface: `MARKETING_PLATFORM.md`

Note: `docs/OPS.md` is a **local-only untracked** earlier draft, scoped to website operations
only — it predates the marketing platform and lacks the Session Log and Horizon. It has never been
committed and never reaches the VPS. **This root `OPS.md` is the tracked source of truth; edit this
one.** Left in place deliberately as a website-only reference; it is not maintained.

`MEMORY.md` was archived to a pointer stub on 2026-07-22 — project state lives here (Session Log +
Horizon) and in `MARKETING_PLATFORM.md`.

The marketing platform runs inside this same app, service, and port, so it needs no operations of its own. Only the cross-cutting facts it depends on live here: environment keys, the schema convention, and the old marketing SPA artifact.

---

## Scope

This guide applies only to:

- Blue Ridge Homes repo: `/var/www/brhomes`
- Blue Ridge Homes app: `/var/www/brhomes/apps/web`
- Blue Ridge Homes local app port: `127.0.0.1:3001`
- Blue Ridge Homes systemd service: `brhomes-web`
- Blue Ridge Homes nginx site file: `/etc/nginx/sites-available/blueridgehomesnc.com`

This guide does not apply to:

- PerfectBike
- Ledger
- Any Docker containers unrelated to Blue Ridge Homes

---

## Safety Rules

Always follow these rules:

1. Do not modify PerfectBike or Ledger configs
2. Do not stop or restart Docker containers
3. Do not restart nginx without testing config first
4. Use port `3001` only for Blue Ridge Homes
5. Inspect before changing anything
6. Prefer `reload` over `restart` for nginx
7. Treat this VPS as production infrastructure

Before any nginx reload, always run:

    sudo nginx -t

If the test passes, use:

    sudo systemctl reload nginx

Do not use:

    sudo systemctl restart nginx

unless there is a very specific reason.

---

## Working Principles

How work gets done here, as distinct from the Safety Rules above (which are about not breaking
the box). These are about not breaking the work.

1. **No half-builds, no quick wins.** A module is not shipped until its stated function works
   end-to-end. We do not split a target to ship the easy half, defer the hard half, or leave a
   pipeline stubbed. Correct code and full functionality of the thing under work — or it is not
   done. When a target has a genuine architectural fork, decide the fork and build through it;
   do not ship around it.

2. **Diagnose before fixing.** Read the live state before changing it. This file has twice
   described infrastructure that had not existed for weeks (see the systemd unit block's history),
   and both times the stale premise produced confidently wrong conclusions downstream. Verify,
   then act.

3. **Never record what you have not verified.** If a value, shape, or config is inferred rather
   than observed, label it as inferred. A doc that quietly guesses is worse than one that admits
   a gap, because the next reader cannot tell the difference. Recollection is not verification.

4. **Deploy is `apps/web/deploy.sh`, always.** Never hand-roll the steps. See "Standard Update /
   Redeploy Procedure".

5. **Scope is measured against the real objective.** The objective is a Cowork-driven marketing
   platform that *produces* content, across all modules — Content, SEO, Social and the rest — not a
   polished manual admin. Before starting any slice, ask: does this move the agent closer to
   **producing**, or is it manual-admin polish? Admin fixes (unpublish, status codes, buttons) are
   worth building only when they **block** the agent pipeline. If they do not block it, **log them —
   do not build them.** Depth on one module at the expense of breadth toward "agent-driven" is the
   failure mode. The 2026-08-14 session spent roughly four hours closing a manual unpublish/publish
   loop that did not block Cowork; under this rule most of it would have been logged, not built.
   See Horizon → "North star" for what this rule is protecting.

6. **When a symptom survives two fixes, search before the third.** Two attempted fixes that do not
   resolve a symptom means the cause is not understood — stop inferring. Search the framework's
   documented behaviour; `web_search` is free, and thirty seconds beats an hour. Headers, logs and DB
   state describe **symptoms**; the framework's own docs describe **causes**. On 2026-08-14 a
   200-instead-of-404 was diagnosed five times from response headers and was wrong every time; the
   actual cause — a route-level `loading.tsx` flushing a 200 before the page ever ran — was named by
   a single search, once that search was finally run. **Search second, not sixth.**

7. **A verification must reach the bug.** Before running a check, confirm the state the bug requires
   actually exists: arm the condition, verify the arm, then test. A green (or clean) result against a
   state the bug cannot occupy proves nothing and costs a round. The same session repeatedly tested
   unpublish against rows that were already in the wrong state to exercise the fix.

---

## Deployment Layout

### Repo

    /var/www/brhomes

### App

    /var/www/brhomes/apps/web

### App bind address

    127.0.0.1:3001

### Service

    brhomes-web

### Nginx site

    /etc/nginx/sites-available/blueridgehomesnc.com
    /etc/nginx/sites-enabled/blueridgehomesnc.com

`brhomesnc.com` also has a site file, but it is now a **pure 301 redirect** to the primary domain
— it is not the app's server block. Inspect and edit `blueridgehomesnc.com`.

---

## Current Architecture

    Internet
       ↓
    DNS / Cloudflare
       ↓
    Nginx
       ↓
    blueridgehomesnc.com
       ↓
    proxy_pass -> 127.0.0.1:3001
       ↓
    Next.js app

Current behavior (live):

- App runs locally on `127.0.0.1:3001`, fronted by nginx
- Live in production at `https://blueridgehomesnc.com` (primary, TLS via certbot)
- `brhomesnc.com` / `www.brhomesnc.com` 301-redirect to the primary domain
- DNS and SSL are finalized — this is production, not staging

---

## Service Management

### Check status

    sudo systemctl status brhomes-web --no-pager -l

### Start service

    sudo systemctl start brhomes-web

### Stop service

    sudo systemctl stop brhomes-web

### Restart service

    sudo systemctl restart brhomes-web

### View logs

    sudo journalctl -u brhomes-web -n 100 --no-pager

### Follow logs live

    sudo journalctl -u brhomes-web -f

---

## Health Checks

### Confirm app is listening locally

    ss -tulpn | grep 3001

Expected result should show something like:

    127.0.0.1:3001

### Check local app response

    curl -I http://127.0.0.1:3001

Expected result:

    HTTP/1.1 200 OK

### Check nginx vhost locally with host header

    curl -I -H "Host: blueridgehomesnc.com" http://127.0.0.1

Note: use the primary host `blueridgehomesnc.com` to reach the app vhost — a request with
`Host: brhomesnc.com` returns a 301 to the primary domain, not the app's 200.

---

## Standard Update / Redeploy Procedure

There is **one deploy path**: `apps/web/deploy.sh`. Deploying is one command:

    cd /var/www/brhomes/apps/web
    ./deploy.sh
    curl -I http://127.0.0.1:3001

Do not deploy by running the individual steps by hand — the script owns them precisely so none
can be skipped.

### What this does

The script itself runs, in order:

- pulls the latest code — `git pull origin main`, before the service stop, so a failed pull
  aborts (`set -e`) while the site is still up
- installs dependencies — `npm install`
- stops `brhomes-web`, removes `.next`, and rebuilds
- copies `public/` and `.next/static` into `.next/standalone`, and relinks
  `public/optimized` — all load-bearing; the standalone bundle includes none of them
- starts `brhomes-web`

You then verify health with the `curl` above.

### Bootstrap — the first run after `deploy.sh` itself changes

The script pulls itself, so it cannot fetch its own update: a run started from the old script
pulls the new one but has already loaded the old one into memory. When `deploy.sh` has changed
upstream, bootstrap once by hand:

    cd /var/www/brhomes && git pull origin main && cd apps/web && ./deploy.sh

Every run after that is the short form above. This is only needed when the script itself changed.

### History

Until Jul 16 there were **two** deploy scripts. A root `/var/www/brhomes/deploy.sh` stopped the
app with `pkill -f next` and restarted it as a backgrounded `npm run start ... &` — which brought
the app up **outside** the `brhomes-web` cgroup, as a detached child of the SSH session: systemd
believed the service was stopped, the process died on disconnect, and it never came back on
reboot. That script is deleted. If you find a copy on the box, it is stale — remove it.

### What it does not do

- does not touch PerfectBike
- does not touch Ledger
- does not touch Docker
- does not reload nginx
- does not affect public DNS

---

## Initial Setup Reference

These are the key pieces that were created for Blue Ridge Homes.

### systemd service

File:

    /etc/systemd/system/brhomes-web.service

Current contents:

    [Unit]
    Description=Blue Ridge Homes Next.js App
    After=network.target

    [Service]
    Type=simple
    User=brian
    WorkingDirectory=/var/www/brhomes/apps/web/.next/standalone
    EnvironmentFile=/var/www/brhomes/apps/web/.env.local
    Environment=NODE_ENV=production
    Environment=HOSTNAME=127.0.0.1
    Environment=PORT=3001
    ExecStart=/usr/bin/node /var/www/brhomes/apps/web/.next/standalone/server.js
    Restart=always
    RestartSec=5

    [Install]
    WantedBy=multi-user.target

**The unit runs the standalone server, not `next start`.** This has been the live configuration
since ~Jul 7. `npm run start` (`next start`) is not part of the running system — `package.json`
still defines that script, but nothing invokes it in production.

Consequences that follow from this, and that the rest of this doc depends on:

- `WorkingDirectory` is the **standalone tree**, not the app root.
- Env comes from `EnvironmentFile`, not from Next's own `.env.local` discovery (see
  "Environment Variables").
- The standalone tree does **not** bundle `public/` or `.next/static`, so `deploy.sh` must copy
  them in. Those copies are load-bearing, not vestigial.

The `[Unit]`/`[Install]` sections and `User=` are reproduced from the original setup. The
`[Service]` fields above were verified live. As with the nginx snippet, inspect before editing:

    sudo systemctl cat brhomes-web

### nginx site

File:

    /etc/nginx/sites-available/brhomesnc.com

Current contents:

    server {
        listen 80;
        server_name brhomesnc.com www.brhomesnc.com;

        location / {
            proxy_pass http://127.0.0.1:3001;
            proxy_http_version 1.1;

            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";

            proxy_read_timeout 60s;
        }
    }

Important: the snippet above is the original pre-cutover config and has since diverged from what is live. The running config also contains the SSL server block added by certbot and the `location /marketing/*` blocks serving the old static SPA (see "VPS Artifacts — Pending Decommission"). Never edit from this snippet — inspect the live file first:

    sudo nginx -T | grep -n -A 30 -B 5 "brhomesnc.com"

---

## Environment Variables

The app reads configuration directly from `process.env` — there is no config module.

Values live in one file on the VPS:

    /var/www/brhomes/apps/web/.env.local

This file is gitignored and is **not** in the repo. The systemd unit loads it via
`EnvironmentFile=/var/www/brhomes/apps/web/.env.local`, so the values are injected into the
process environment from this source path — regardless of what the standalone tree contains. This
matters because the unit's `WorkingDirectory` is `.next/standalone`, so Next's own `.env.local`
discovery would look in the wrong place; `EnvironmentFile` is what actually supplies env.

That is why `deploy.sh` no longer copies `.env.local` into `.next/standalone/`. That copy was the
**one genuinely vestigial step** in the deploy and has been removed — `EnvironmentFile` supersedes
it. Do not reintroduce it.

**The other standalone copies are load-bearing — do not remove them.** The standalone bundle does
not include `public/` or `.next/static`, and the server serves from its own tree, so `deploy.sh`
must copy both in. The `optimized` symlink is likewise required: it points the standalone tree's
`public/optimized` at the real uploads directory, so new uploads appear without a redeploy.

Key names in use (names only — never commit values):

    ADMIN_JWT_SECRET                 admin session JWT signing secret
    DATABASE_URL                     Postgres connection string (:5433)
    BLOG_AGENT_API_KEY               upload / images / blog-delete auth (see below)
    MARKETING_AGENT_API_KEY          marketing agent read + draft auth (see below)
    TURNSTILE_SECRET_KEY             Cloudflare Turnstile server-side verify
    NEXT_PUBLIC_TURNSTILE_SITE_KEY   Turnstile client site key (public)
    SMTP_HOST / SMTP_PORT            mail transport
    SMTP_USER / SMTP_PASS            mail credentials
    CONTACT_EMAIL                    contact-form notification recipient
    PUSHOVER_TOKEN / PUSHOVER_USER   Pushover push notifications (lib/notify.ts)
    ANTHROPIC_API_KEY                draft generation (lib/generateDraft.ts)
    PUBLISH_SCHEDULER_KEY            publish-scheduler auth (see below)
    PUBLIC_DIR                       public asset directory override — optional; both readers
                                     (api/admin/images, api/admin/upload) fall back to
                                     /var/www/brhomes/apps/web/public, and it is NOT set in the
                                     live .env.local, so the fallback is what runs

`BLOG_AGENT_API_KEY` — **the name is now misleading, and this is the widest credential in the file.**
It gates **no blog writes.** Since `566dd15` (2026-07-22) `POST /api/blog` and `PUT /api/blog/[slug]`
return **410 Gone**. What the key actually opens today is `app/api/admin/upload`,
`app/api/admin/images`, and the retained **`DELETE /api/blog/[slug]`**.

- **Blast radius:** one credential covers image upload, image listing, **and deleting a live post.**
  And because **no delete path anywhere calls `revalidatePath`**, a deletion through that door leaves
  `/blog` serving a ghost post until the next deploy — see Horizon → "Blog SSG delete gap".
- **It still uses the weaker `===` comparison,** not the constant-time helper: a module-local
  `checkApiKey` in `app/api/blog/[slug]/route.ts` compares it with `===`. (Its twin in
  `app/api/blog/route.ts` went away with the 410 — see Horizon → "`checkApiKey` name shadowing".)
- **Renaming/splitting it is a Horizon item.** The name promises a capability it no longer has, which
  is exactly how a credential gets over-shared.

`MARKETING_AGENT_API_KEY` — marketing agent auth, consumed by `apps/web/lib/agentAuth.ts` through
`checkMarketingApiKey` and wired to **three** endpoints: `POST /api/agent/content` (file a draft,
added 2026-07-17) plus, since `703eaa6` (2026-07-22), the two read doors `GET /api/agent/posts` and
`GET /api/agent/queue`. See "Agent Read Surface". **Write it unquoted.** Unlike `SMTP_PASS`, which the code defensively strips surrounding quotes from, this key is compared byte-for-byte as-is — surrounding quotes become part of the key and auth will fail.

`PUBLISH_SCHEDULER_KEY` — added 2026-07-22 for the publish scheduler. Consumed by **both**
`app/api/internal/publish-due/route.ts` (the door) and `instrumentation.ts` (the tick) — same
process, same `EnvironmentFile`, so one value serves both. **Write it unquoted**, same reason as
above. **If it is missing the scheduler 401s itself forever and publishes nothing, silently** —
which is why `instrumentation.ts` logs a warning at registration when it is unset. Blast radius if
leaked: an attacker can publish already-approved posts early and force `/blog` cache invalidation.
No data loss. Note the route is reachable from the public internet through nginx's catch-all
`location /`; there is no loopback-only option without editing nginx, so the key is the only control.

After changing `.env.local`, restart the service to pick it up:

    sudo systemctl restart brhomes-web

---

## Repo Conventions

### Line endings — code and docs alike are `i/lf w/crlf`

Every tracked text file here carries the same EOL attributes: **LF in the index, CRLF in the working
tree.** `core.autocrlf` is `true` and there is no `.gitattributes` anywhere in the repo, so git does
the normalization. Verify per file rather than assuming:

    git ls-files --eol <path>

**This applies to code, not only to docs.** Several 2026-08-14 build prompts asserted that code files
were `w/lf` while docs were `w/crlf`; that distinction does not exist in this repo. A tool that
rewrites a file with LF endings in the working tree makes the whole file show as modified.

### `npm run build` is NOT a valid local gate

`next build` cannot pass on a dev machine. `/portfolio/[slug]` (and `/blog/[slug]`) call
`generateStaticParams()`, which queries Postgres **at build time**, and the database is reachable only
from the VPS. It fails identically at every recent commit — as `ECONNREFUSED`, or as
`SASL: ... client password must be a string` when `DATABASE_URL` is present but empty. **Either
failure is environmental, not a regression, and not a signal.**

The real offline gate is:

    cd apps/web
    npx tsc --noEmit      # must exit 0
    npm test              # vitest; no DB harness, so no DB needed

Do not spend a round "fixing" a local build failure. Full detail in `MARKETING_PLATFORM.md` §7.

### Database schema

`apps/web/db/schema/*.sql` is the checked-in schema convention, introduced with the marketing platform's `approval_queue` table. It is the first version-controlled schema in this repo — every table before it was created ad-hoc directly on the VPS and exists only implicitly in query strings.

There is **no migration runner**. These files are the record of intent, not executable migrations. Applying them is a manual, deliberate step:

    psql -p 5433 -d <db> -f /var/www/brhomes/apps/web/db/schema/<file>.sql

Deploys never run DDL. Adding a table means committing the `.sql` file and applying it by hand.

#### Adding a COLUMN takes two forms — read this before touching `db/schema/`

The files are full `CREATE TABLE IF NOT EXISTS` **snapshots**. Against a table that already exists,
that guard skips the **entire statement** — so **adding a column only to the `CREATE` block is a
silent no-op**. The column lives in git and never in the database, and the failure does not surface
until a deploy later, as a query error against a column that was "added" weeks ago.

Every new column therefore needs **both**:

1. the entry in the `CREATE` block — keeps the snapshot an honest description of the live table; and
2. an idempotent `ALTER TABLE <t> ADD COLUMN IF NOT EXISTS <col> <type>;` appended below it — this
   is the statement that actually runs.

`publish_at` set this precedent (2026-07-22); there was no prior column addition to copy.

**Ordering: apply the DDL BEFORE the deploy that ships code reading the column.** A nullable column
is backward-compatible, so old code ignores it and applying early is always safe. The reverse order
gives you a live app querying a column that does not exist.

---

## Timezones

Operationally load-bearing since the publish scheduler landed.

- **The VPS system zone is `Etc/UTC`.** `TZ` is set **nowhere** — not in the `brhomes-web` unit, not
  in `.env.local` — so the Node process inherits UTC. Postgres `SHOW timezone` is also `Etc/UTC`.
- **The business operates in `America/New_York`.** These are not the same, and the gap is four or
  five hours depending on DST.
- **Standing rule:** naive NY wall-clock strings travel on the wire (`"2026-08-05T06:00"`); **all
  zone conversion happens in SQL** via `AT TIME ZONE 'America/New_York'`. `America/New_York` must
  not appear in client code. This is what makes scheduling correct from a laptop in any timezone —
  you schedule in *business* time, not browser time. See `apps/web/lib/publishAt.ts`.
- **⚠ Do NOT set `TZ=America/New_York` on the unit.** It is a plausible reflex once you start
  thinking in NY time for scheduling, and it would shift every public blog date one day early. The
  date-rendering fix below defuses the symptom; the reflex is still wrong.

### Scheduling a post by hand requires a zone-named literal

A bare literal is UTC, not Eastern: `'2026-08-05 06:00'` is 2am NY — four hours early, silently.

    UPDATE blog_posts
       SET published = false,
           publish_at = TIMESTAMP '2026-08-05 06:00' AT TIME ZONE 'America/New_York'
     WHERE slug = 'your-slug';

Verify what you actually stored before walking away:

    SELECT slug, publish_at, publish_at AT TIME ZONE 'America/New_York' AS ny
      FROM blog_posts WHERE slug = 'your-slug';

---

## Background Processing

`apps/web/instrumentation.ts` is the **first server-side background timer in this codebase** — until
2026-07-22 the app was request-driven only, and `MARKETING_PLATFORM.md` §7's "ordinary routes" framing
was the whole truth. It no longer is.

Shape, and why each part is deliberate:

- **60s `setInterval`**, registered by Next's `register()` hook at server start.
- **Guarded on `process.env.NEXT_RUNTIME === "nodejs"`** — instrumentation also executes in the build
  worker and the edge runtime, neither of which should start a timer.
- **Module-scope `isRunning` flag**, so a slow tick cannot stack fetches. Reset in a `finally`.
- **No eager first call.** At boot the HTTP server may not be listening yet; the first natural tick
  at +60s sidesteps the race. Do not "improve" this by firing immediately.
- **Whole body try/caught.** An unhandled rejection here would take the server down — a live outage
  caused by the scheduler is far worse than a late post. During `next build` there is no server on
  3001, so the fetch throws and is swallowed: fail-safe by design.
- **It does not touch the database.** It self-`fetch`es `POST 127.0.0.1:${PORT}/api/internal/publish-due`
  so the flip and the `revalidatePath` calls run inside a **real request context** —
  `revalidatePath` outside a request scope is unproven in this setup and is being routed around
  deliberately.

Single-process standalone means exactly one timer; there is no duplicate-fire risk from workers.

**Idle-liveness heartbeat** (added `59d768e`, 2026-07-23). Every **60th idle tick** — roughly hourly
— the timer logs a line:

    [scheduler] heartbeat — idle, 60 ticks, uptime 60m

**Idle-only and throttled on purpose.** A per-tick log would write 1440 entries a day and bury
journald; the publish path already logs its own line per post.

What the three signals prove, and what they do not:

- `registered — polling …` at boot → the `register()` hook ran. Says **nothing** about whether the
  timer is still alive afterwards.
- `tick published N post(s)` → the loop is alive **and** something was due.
- `heartbeat — idle` → the loop is alive **with nothing due.** This is the one that closed the real
  blind spot: before it, a loop that died after boot with an empty schedule looked **identical** to a
  healthy idle one — silence either way.

**Health check** — this is the go/no-go signal after any deploy:

    journalctl -u brhomes-web | grep -i scheduler

A `[scheduler] registered — polling …` line at boot means the hook ran. Its absence means nothing is
scheduled and nothing will publish. To confirm the loop is still alive since a given time:

    journalctl -u brhomes-web -q --since "2026-07-23 10:00" | grep 'scheduler]'

**Confirmed live 2026-07-23 11:00:20 UTC** — `[scheduler] heartbeat — idle, 60 ticks, uptime 60m`,
same PID as the boot line.

---

## VPS Artifacts — Pending Decommission

### Old marketing SPA

A static marketing dashboard predating the current platform is **still live** on this VPS:

    Files    /var/www/brhomes-marketing/
    Nginx    location /marketing/*  — 13 blocks in the blueridgehomesnc.com site file
    Auth     .htpasswd-marketing (HTTP basic auth)
    Since    ~Apr 28

Status: **superseded** by the marketing platform at `/admin/marketing` (see `MARKETING_PLATFORM.md`), **pending decommission**.

Notes before tearing it down:

- Nothing in the app links to it any more. The admin dashboard card labeled "Marketing Platform" now routes to `/admin/marketing`; it previously pointed at `/marketing/`.
- The database is clean — this SPA left no stale tables behind, so decommissioning is an nginx + filesystem job only.
- Teardown is done by hand and is separate from any build or deploy. It means removing the 13 `location /marketing/*` blocks, then `sudo nginx -t` before any reload (see "Nginx Safety Procedure"), and removing `/var/www/brhomes-marketing/` and `.htpasswd-marketing`.
- Until this is done, `/marketing/` and `/admin/marketing` both resolve to different systems. Do not confuse them.

---

## Admin Auth Boundary

Every `/admin/*` page and every `/api/admin/*` route sits behind one session gate — the auth
boundary for all marketing, content, and blog admin surfaces and their write APIs.

- **Mechanism:** password (bcrypt) + TOTP 2FA (otplib) → a signed JWT session cookie
  `brh_admin_session` (jose, HS256, `ADMIN_JWT_SECRET`). This is **not** OAuth — the "Google
  Authenticator" QR at `/admin/setup` is only the TOTP enrollment app, not a Google sign-in.
- **Enforcement is two-layered:** `middleware.ts` (matcher `["/admin/:path*"]`) gates `/admin/*`
  **pages**; it does **not** match `/api/admin/*`, so every admin API route calls `getSession()`
  itself (see Horizon → "middleware → proxy convention").
- **Separate machine credentials:** the key-gated agent doors (`/api/agent/content`,
  `/api/agent/posts`, `/api/agent/queue` — all `MARKETING_AGENT_API_KEY`) and the
  upload/images/blog-delete key (`BLOG_AGENT_API_KEY`) are non-session credentials for
  external/automated callers, outside this cookie boundary. See "Agent Read Surface" below.

---

## Agent Read Surface

Two key-gated, **read-only** endpoints let an external agent (today: Claude Cowork) see platform
state. Both authenticate with `MARKETING_AGENT_API_KEY` through `checkMarketingApiKey`
(`lib/agentAuth.ts`), dual-header: `x-api-key: <key>` **or** `Authorization: Bearer <key>`.
Shipped `703eaa6`, 2026-07-22.

| Endpoint | Method | Returns |
| --- | --- | --- |
| `/api/agent/posts` | GET | `{ ok: true, posts: [...] }` — **every** post, drafts and scheduled included, carrying `published`, `publish_at` and a preformatted `publish_at_ny` |
| `/api/agent/queue` | GET | `{ ok: true, items: [...] }` — approval-queue rows, newest first; optional `?status=pending\|approved\|rejected\|auto_approved` |

Auth failure on either is **401** `{"error":"Invalid or missing API key"}`. A database error degrades
to **503**, never a 500 with a stack trace.

**These are read-only by design.** Approve, publish, schedule, unpublish and delete are deliberately
**not** exposed. The only agent *write* door is `POST /api/agent/content`, which can do exactly one
thing: file a `pending` row into `approval_queue`. Human approval remains the gate.

Smoke test — read the key from `.env.local`, never paste it:

    export KEY=$(grep -m1 '^MARKETING_AGENT_API_KEY=' /var/www/brhomes/apps/web/.env.local | cut -d= -f2- | tr -d '\r')
    curl -s -H "x-api-key: $KEY" https://blueridgehomesnc.com/api/agent/posts
    curl -s -H "x-api-key: $KEY" "https://blueridgehomesnc.com/api/agent/queue?status=pending"
    curl -s -o /dev/null -w '%{http_code}\n' -H "x-api-key: WRONG" https://blueridgehomesnc.com/api/agent/posts   # expect 401

### ⚠ The nginx namespace trap — why these live under `/api/agent/*`

**This is the highest-value operational fact on this page for anyone adding an API route.**

The site file contains a **regex** `location` that captures 13 top-level `/api/<name>` paths and
proxies them to the **legacy port-3002 SPA**, not to the Next app on 3001:

    location ~ ^/api/(leads|scoring-config|campaigns|content|sync|reviews|analytics|seo|kpis|emails|onboarding|exports|oauth)

**Regex locations take precedence over the prefix `location /`.** So a new route at `/api/leads`,
`/api/content`, `/api/reviews`, `/api/analytics`, `/api/seo`, `/api/kpis`, `/api/emails`,
`/api/campaigns`, `/api/sync`, `/api/scoring-config`, `/api/onboarding`, `/api/exports` or
`/api/oauth` would typecheck, deploy, work perfectly on localhost, and then **404 into the legacy app
in production** — with nothing in the repo to explain why.

`agent` is not in that list, so `/api/agent/*` reaches the Next app. **Put new agent endpoints
there.** Nested paths are safe as well: the regex anchors at `^/api/` followed immediately by one of
the 13 names, so `/api/agent/content` never matches even though `content` is on the list.

Verify the current list before trusting this one — read-only, **Brian applies nginx changes himself**:

    ssh brian@168.231.71.124 'grep -n "location" /etc/nginx/sites-available/blueridgehomesnc.com'

Confirmed against the live site file 2026-07-23. Retiring the old SPA (see "VPS Artifacts — Pending
Decommission") would free these names — it is squatting on the most natural API namespace this
platform has.

---

## Cowork Integration

How the external agent actually reaches the platform. Established 2026-07-23.

**Mechanism: direct HTTPS calls to the key-gated `/api/agent/*` endpoints from the Cowork sandbox.**
No MCP server, no OAuth, no custom connector, nothing new running on the VPS.

**Why not MCP.** The Add-custom-connector dialog exposes only OAuth Client ID / Client Secret — there
is no request-headers option — so `static_headers` (the beta that would let a remote connector send
`x-api-key`) is unavailable on this account. A request was sent to `mcp-review@anthropic.com` on
2026-07-23; no reply as of this writing. **MCP is an upgrade path, not a prerequisite** — the read and
write doors work today over plain HTTPS.

### ⚠ Egress — the failure signature you will otherwise misdiagnose

The Cowork sandbox routes outbound traffic through a **filtering proxy**. With a restrictive
allowlist, every request to `blueridgehomesnc.com` fails like this:

    curl: (56) CONNECT tunnel failed, response 403
    %{http_code} → 000

**A `000` status with curl exit 56 is a sandbox egress block, not a server fault.** The site is fine;
the request never left the sandbox. Do not go digging through systemd, nginx or the app for it.

Fix: **Settings → Capabilities → Code execution → Domain allowlist → All domains.**

### Credential mechanism — and why this entry is no longer a path

**This entry has been wrong twice, in two different ways, because it recorded a PATH.** A path is not
the unit of truth here. The question is not where a file sits on some disk, it is *what reads it,
from where, at run time* — and every time that changed, a correct-looking path silently became a
lie. The mechanism is what survives.

**The working mechanism (2026-08-18).** The API key is attached as a **file on the Cowork project**
"New BRHOMESNC Website". A **cloud-executing scheduled task** in that project reads it when it fires.
The value is `MARKETING_AGENT_API_KEY`. **Never commit the value.**

**Both folder-based mechanisms are structurally dead** — not misconfigured, and not fixable by
trying harder:

| Mechanism | Why it cannot work |
| --- | --- |
| Session-scoped grant (`remoteSessionFolderGrants`) | Cannot be pre-registered for a session that does not exist yet. A scheduled task creates its session when it fires, so there is nothing to grant against beforehand. |
| A scheduled task's working-folder field | Setting it **forces the task to run locally** — per Anthropic's docs a task requiring local files runs only locally. That reintroduces the machine dependency the schedule exists to remove. |

Anthropic's documentation states scheduled tasks work with connectors and with files saved to the
Claude account, and cannot be tied to a folder on a computer.
[Anthropic docs + Cowork UI, read 2026-08-18 — NOT verifiable from this repo.]

**The superseded answer, kept so it is not re-proposed:** a dedicated single-file folder at
`C:\Users\wncre\ClaudeShare\`, granted to Cowork rather than Desktop or Downloads (granting
either would expose everything in them). It is still correct for an **interactive** session. A
scheduled cloud task never sees it — which is the whole reason the project-file mechanism exists.

### Security posture

**"All domains" lets any code Cowork runs reach anywhere on the internet.** That is a real widening,
accepted knowingly rather than by default. Narrowing to package managers plus
`blueridgehomesnc.com` is **untested** and is a Horizon item; note that Anthropic's own guidance
favours the narrower setting, and that several public bug reports describe additional-domain entries
being ignored — so narrowing may simply not work.

### What Cowork can and cannot do

| Can | Cannot |
| --- | --- |
| Read posts (`GET /api/agent/posts`) | Approve anything |
| Read the queue (`GET /api/agent/queue`) | Publish, or set `published = true` |
| File drafts (`POST /api/agent/content`) | Schedule, unpublish, or delete |

Everything it files lands as a **`pending`** row, and **the approval queue remains the human gate**
for putting *new* content on the site.

**It is not, however, the only path to `published = true`.** There are three, and there have been
since the scheduler landed 2026-07-22 — the sentence above previously claimed otherwise and was
wrong. `executeApprovedAction` (approve) is the only one that can publish a post the queue has not
already approved; the other two act on rows that INSERT created — the 60s tick
(`/api/internal/publish-due`) flipping scheduled rows as they come due, and the schedule route's
`publish_now` flipping one on demand. Since 2026-08-14 that same route also carries `unpublish`,
which sets `published = false`. `lib/queueExecutor.ts`'s docblock enumerates all three. **None of
this widens what Cowork can do** — the table above is unchanged and still exact.

---

## Repo Hygiene — Exposed Material in Git History

### Dead SQLite artifact: `data/submissions.db`

A pre-Postgres SQLite database was tracked in this repo. It is **dead code**: `lib/db.ts` is
Postgres-only (`pg` Pool on `DATABASE_URL`), `better-sqlite3` is not a dependency, and no
`.ts`/`.tsx` imports it. The only references left are the one-shot `apps/web/deploy-*.sh`
migration scripts, which are historical.

**Untracked Jul 16 (commit `a3e94d4`)** — `git rm --cached` plus gitignore rules `data/*.db`,
`*.sqlite`, `*.sqlite3`. This was an **index-only** removal:

- The file remains on local disk and **remains in git history**.
- The VPS copy is deleted by the next `git pull` — intended, as it removes a copy of customer
  PII from a public-facing server.

### What that blob contains

More than PII. Verified this session by reading field lengths and populated state only:

- `submissions` — 5 rows of real customer inquiries (names, emails, phones, messages),
  2026-03-14 → 2026-03-19.
- `admin_config` — a bcrypt `password_hash` **and a plaintext `totp_secret`**.

**The TOTP seed is confirmed live**: its prefix matches the seed in the live Postgres
`admin_config` (verified Jul 16 by comparing a 4-char prefix, not the value). A TOTP seed is a
shared secret, not a hash — anyone with this blob can generate valid `/admin` 2FA codes
indefinitely. Paired with the offline-crackable bcrypt hash, that is a credible path to full
admin access. The seed value is deliberately **not** recorded here.

### Data-loss risk — 3 inquiries exist only outside live Postgres

Live Postgres holds **only 2 of the blob's 5** submission rows. Three real customer inquiries
(2026-03-14 after 01:27 → 2026-03-19) exist **only** in git history and in a local backup at
`C:\Users\wncre\brhomes-backups\submissions.db.2026-07-16.bak` on the maintainer's machine.

**This constrains the purge ordering:** the filter-repo pass destroys the history copy, so the
recover-or-drop decision on those 3 rows must be made **before** the purge, not after. Do not
delete the local backup until then — it is currently the only non-history copy.

### Outstanding owner-actions (NOT done — pending)

These are deliberate operator actions. Nothing in a deploy performs them.

- [ ] **(a) Rotate the admin TOTP seed and admin password.** Burned and confirmed live. Requires
      re-enrolling the authenticator. **Rotation is what revokes — the purge does not.** Anyone
      who already cloned the repo has this material regardless of what happens to history.
- [ ] **(b) Rotate the Gmail app password** hardcoded at `apps/web/deploy-email.sh:14`, committed
      in plaintext since `01e0acb`. Same reasoning: rotate now, independent of the purge.
- [ ] **(c) filter-repo purge** of both the `submissions.db` blob and the Gmail password blob —
      **one deliberate pass**, its own session. History surgery is done once.

      Mandatory tail: the rewrite requires a force push, which leaves the VPS on divergent
      history. Its `git pull origin main` will then fail — and because `deploy.sh` runs the pull
      under `set -e`, the deploy aborts at that step (safely, before the service stop). Re-sync
      the box before the next deploy:

          cd /var/www/brhomes
          git fetch origin && git reset --hard origin/main

      `.env.local` is gitignored and `reset --hard` does not touch untracked files, so env and
      uploads survive.

---

## Session Log — Shipped

### 2026-08-14 — Unpublish, the 404-status chain, and a forward path for drafts

Five commits on `main` (`0a9cf6e`, `fc5ea9c`, `87d12e7`, `d62d8d4`, `4c961c2`), pushed the same day.
**Not yet deployed at time of writing** — the owner deploys.

The through-line: a live post could not be taken down from the admin. Closing that turned out to
require fixing how three blog routes cache, because *removing* a post is entirely a
cache-invalidation problem — the DB write was the easy half, exactly as the Horizon predicted.

**Scope note, recorded deliberately.** Roughly four hours went into a manual unpublish/publish loop
that **did not block the Cowork pipeline**. Working Principle 5 was written out of this session; under
it most of this entry would have been logged rather than built. The work is good and is kept — the
prioritisation is the lesson.

#### `0a9cf6e` — the unpublish action, and revalidation on every mutation path

A fourth action on `PATCH /api/admin/marketing/content/[slug]/schedule`: `unpublish`, guarded on
`published = true` (inverting the other three) with its own **409 `not_published`** constant. Sets
`published = false` and NULLs `publish_at` in one statement — see Horizon → "No unpublish path —
RESOLVED" for why that is not optional. `revalidatePath` was added to every path that changes what a
reader sees, and `/sitemap.xml` was added as the third surface everywhere it was missing.

Also in this commit, and the reason A1 exists: **`published` is now rejected rather than ignored** by
`POST /api/admin/blog` and `PUT /api/admin/blog/[slug]`, with 400 `published_not_accepted`. The PUT
previously *wrote* the column, so opening a live post in the legacy editor and clicking Save
unpublished it silently and without revalidating. It now preserves the column. A silent ignore was
rejected as the fix: a caller that believes that route controls visibility should be told, loudly.

226 tests added in `tests/unpublish.test.ts` — structural assertions read from source text, because
`lib/db.ts` builds a pg Pool at module scope and there is no live-Postgres harness. Mocking the DB
would only prove the mock agrees with the test.

#### `fc5ea9c`, `87d12e7`, `d62d8d4` — three commits to make one URL return 404

The unpublish landed and the URL kept serving **200**. Three settings had to be right at once; each
was diagnosed and fixed in turn. **The full reasoning lives in `MARKETING_PLATFORM.md` §2 → "Blog
route caching — three settings that only make sense together"** — it is written there because it
reads as arbitrary without the why, and the next reader will meet the settings before the story.

- `fc5ea9c` gave the published-gated routes an **ISR `revalidate` surface**. `revalidatePath` on a
  route prerendered with no revalidate export is a **silent no-op** — that was the original bug, and
  it is why every `revalidatePath` call added in `0a9cf6e` did nothing on `/blog` and `/sitemap.xml`.
- `87d12e7` made `/blog/[slug]` **`force-dynamic`** instead. Under ISR, Next caches the 404
  *content* but not the 404 *status*: the not-found body renders while the response is still 200.
- `d62d8d4` **deleted `app/blog/loading.tsx`**. A route-level loading file wraps the whole segment in
  Suspense and streams its fallback *before* the page component runs; once any HTML is flushed the
  status is locked at 200, and **no route config can override that**. This is why force-dynamic alone
  did not fix it.

**Working Principle 6 came out of this.** The 200 was diagnosed five times from response headers and
was wrong each time. One search of the framework's documented behaviour named the loading-boundary
cause immediately, once that search was finally run — after the fifth wrong inference, not before the
first.

#### `4c961c2` — draft cards get `Publish now` and `Schedule →`

Unpublishing produced a **draft with no forward path**: the card offered only `Edit →` and a
`Not public` label. One expression caused it — the `Schedule →` trigger was gated
`!post.published && post.publish_at`, and a draft fails the second clause.

**UI-only, and provably so.** `publish_now` and `reschedule` both guard on
`WHERE slug = $1 AND published = false` and **neither reads `publish_at`**, so both would have
accepted a draft all along. The recon established this from the SQL before any code was written; the
new `tests/draftPublishPath.test.ts` pins both WHERE clauses cross-file, because a `publish_at` clause
added to either would break the path again from the server side with nothing in `page.tsx` to show it.

The gate widened to `!post.published`, and a one-click `Publish now` was added on drafts only.
One-click is deliberate and matches the manage modal's own `Publish now`: publishing is reversible
from the Live card it produces, so the two-click confirm stays reserved for `Unpublish`.

**Four ways a draft comes into being, and all four now have a forward path:** queue-approve-with-a-
schedule (leaves `publish_at` **set**), `unpublish`, `cancel`, and `POST /api/admin/blog` (all three
leave it **NULL**). Only the first satisfied the old gate — which is why the dead end stayed invisible
to anyone exercising that one flow.

#### Not verified in production

Every check this session was local (`npx tsc --noEmit`, `vitest`). **Nothing was deployed**, so the
404 chain and the publish/unpublish round trip are proven by construction and by structural tests, not
by a live request. The curl checks belong to the next deploy.

### 2026-07-23 — Agent read surface, publish-bypass removal, and Cowork integration

Three commits on `main` (`566dd15`, `703eaa6`, `59d768e`), deployed and verified in production the
same day. The through-line: the platform gained a **read** surface for an external agent, and the one
door that could bypass the approval queue was shut.

#### `566dd15` — the publish bypass is closed

`POST /api/blog` and `PUT /api/blog/[slug]` — both gated by `BLOG_AGENT_API_KEY` with `===` — wrote
`published` straight into `blog_posts`, bypassing the approval queue entirely. Both now return
**410 Gone**. **Net effect: `executeApprovedAction` is the only code path that can set
`published = true` on a post the queue has not already approved.**

> **Correction, 2026-08-14.** As originally written this read "the only code path that can set
> `published = true`", full stop. That was already wrong when written: the 60s scheduler tick shipped
> the previous day (`c00c205`, 2026-07-22) and `publish_now` shipped with it (`52a49bc`), and both set
> the column. They act only on rows the executor inserted, which is why the *gate* claim holds and the
> *only path* claim does not. See §4 of `MARKETING_PLATFORM.md` for all three paths.

**410, not a silent reroute into the queue.** A surviving external caller fails **loudly and
findably** in the logs rather than having its writes quietly redirected. The loud failure is the
point; a silent behaviour change would hide the caller we were trying to find.

**`DELETE /api/blog/[slug]` was deliberately retained.** The session-gated admin delete at
`app/api/admin/blog/[slug]` does **not** call `revalidatePath`, so removing the key-gated verb would
have taken a delete path away without putting a working one in its place. It carries a
`TODO(bypass-removal)` and should go once admin delete revalidates. **So "the approval queue is the
only publish gate" is exact, but "`/api/blog` is closed" is not** — the DELETE verb survives and can
still remove a live post.

**Evidence gathered before removing anything:** nginx access logs back to Jul 9 (plain + rotated)
showed **zero** POST/PUT/DELETE to `/api/blog`, and no caller existed in the repo or anywhere on the
VPS filesystem.

#### `703eaa6` — read surface, shared list helpers, and the `date` hard-block

Two new key-gated, **read-only** endpoints, both via `checkMarketingApiKey`:

    GET /api/agent/posts   → { ok, posts }   every post, drafts and scheduled included
    GET /api/agent/queue   → { ok, items }   approval queue, optional ?status=

**Approve, publish, schedule, unpublish and delete are deliberately not exposed.** Read is cheap and
safe; the single write door (`POST /api/agent/content`) funnels through the approval queue. They live
under `/api/agent/*` for a hard operational reason — see "Agent Read Surface" for the nginx regex that
steals 13 top-level `/api/<name>` paths to the legacy SPA.

The SQL was extracted into shared library functions so the admin and agent surfaces cannot drift:

- **`listQueue()`** in `lib/approvalQueue.ts` — replaced inline SQL in the admin queue route and
  killed a duplicated column literal. The route's private `STATUSES` folded into a shared
  `QUEUE_STATUSES` / `QueueStatus`.
- **`listAllPosts()`** in `lib/blog.ts` — **must not reuse `toPost()`.** That mapper is the *public*
  one and hard-drops `published`, `publish_at`, `created_at`, `updated_at`; reusing it would
  typecheck cleanly and **silently strip the exact fields the function exists to expose.** It has its
  own row type and its own mapper, and keeps snake_case keys so the admin content route's response
  stays byte-identical.
- Both admin routes were repointed with **response shapes unchanged** — explicit `limit: 200` / `1000`
  preserve their prior ceilings.

**The `date` hard-block lives in the shared `validateContentDraft`,** not in the route — so the agent
door, the admin door **and** the executor's re-validation all inherit it. **One validation path, no
wrapper duplication.** `blog_posts.date` is `text` sorted lexicographically by
`idx_blog_posts_published (published, date DESC)`, so anything but zero-padded `YYYY-MM-DD` mis-sorts
forever. `"July 22, 2026"` is now a 400.

It returns the **house-style human message** — `{"error":"date must be YYYY-MM-DD (e.g. 2026-08-05)"}`
— rather than a machine code. That was a deliberate, accepted divergence from the build spec: every
sibling error from that validator is a human sentence, and forking the contract for one field would
have changed error rendering for every caller of it.

12 tests added (date guard + the constant-time key gate); both targets are pure and DB-free.

#### `59d768e` — scheduler idle-liveness heartbeat

Boot already logged `registered` and each publish logged its own line. The blind spot was a loop that
**dies after boot with nothing scheduled** — indistinguishable from healthy idle, because both are
silent. Every 60th idle tick (~hourly) now logs proof-of-life. **Idle-only and throttled on purpose:**
a per-tick log would write 1440 lines a day and bury journald.

**Confirmed live 2026-07-23 11:00:20 UTC** — `[scheduler] heartbeat — idle, 60 ticks, uptime 60m`,
same PID as the boot line.

#### Production verification, 2026-07-23

All against `blueridgehomesnc.com`:

    GET  /api/agent/posts                 → 200, 3 posts with published/publish_at
    GET  /api/agent/queue?status=pending  → 200
    GET  /api/agent/posts   (wrong key)   → 401 {"error":"Invalid or missing API key"}
    POST /api/blog                        → 410
    POST /api/agent/content  bad date     → 400 {"error":"date must be YYYY-MM-DD (e.g. 2026-08-05)"}
    POST /api/agent/content  valid draft  → 201, queue row id 5, pending, stakes high, reviewer NULL

**Nothing reached the public site.** The test draft stayed `pending`, and `/api/agent/posts` still
returned the same three published slugs.

#### Cowork integration — direct HTTPS, no MCP

Recorded in full under "Cowork Integration". Short version: Cowork calls the key-gated
`/api/agent/*` endpoints over plain HTTPS from its sandbox. **MCP was ruled out, not deferred by
preference** — the custom-connector dialog exposes only OAuth client ID/secret with no
request-headers option, so the `static_headers` beta that would carry `x-api-key` is unavailable on
this account. The non-obvious operational fact is egress: the sandbox proxies outbound traffic, and a
blocked request surfaces as `curl: (56) CONNECT tunnel failed` with HTTP `000` — **an egress block,
not an outage.**

### 2026-07-22 — Revalidation, publish scheduler, and the scheduling workflow

Four slices, all on `main` and all deployed (VPS HEAD `52a49bc`, rebuilt 10:09 UTC).

#### `ca46860` — SSG revalidation on approve

**The first on-demand revalidation in this codebase.** Post-commit in
`app/api/admin/marketing/queue/[id]/route.ts`, gated on `item.status === "approved"` — PATCH also
handles save-draft, reject and re-open, none of which publish anything. Seam: `ExecuteResult`'s
success variant widened to carry the slug and `RETURNING id` became `RETURNING id, slug`, so the
route revalidates the **exact inserted (trimmed) slug** the DB holds rather than re-deriving it from
`payload`. **Verified live** — an approved post appeared at `/blog` with no deploy.

#### `f055c09` — Edit link on post cards

`/admin/marketing/content` cards gained `Edit →` beside `View →`, targeting `/admin/blog/[slug]/edit`.

Two facts worth keeping:

- **Internal admin nav is plain `<a>` by house convention** — 7 files use `<a href="/admin/…">`;
  exactly one (`admin/marketing/layout.tsx`) uses `next/link`. Match the neighbours.
- **Two different editors, easily confused:** `/admin/blog/[slug]/edit` edits a published
  `blog_posts` row; `/admin/marketing/content/[id]/edit` edits a **queue item**. Linking a published
  post at the latter would be wrong.

#### `c00c205` — publish scheduler mechanism

`publish_at timestamptz NULL` added to `blog_posts`. **`published bool` remains the source of
truth** and the scheduler flips it, so no read query changed (`lib/blog.ts` still gates on
`published = TRUE`). Deriving `published` from `publish_at` instead would have rewritten every read
for no gain.

Design properties — **recorded so nobody "fixes" them**:

- **Idempotency is free.** `WHERE published = false` means an overlapping tick matches zero rows.
  Double-firing cannot double-publish, so the tick needs no lock.
- **`date` derives from `publish_at`, not `now()`** — a late catch-up tick still stamps the date the
  post was scheduled for, not the recovery date.
- **`date` must stay `YYYY-MM-DD`.** `idx_blog_posts_published (published, date DESC)` sorts it
  **lexicographically**; any other format silently corrupts ordering.
- **A missed tick publishes late, never never** — the predicate is a catch-up (`publish_at <= now()`),
  not an exact match.

Also shipped: `lib/agentAuth.ts` generalized to `checkApiKey(request, expected)` with
`checkMarketingApiKey` as a thin wrapper (every existing caller unchanged), and the date-rendering
fix below.

**Verified in production:** a post with `publish_at` 09:30:58Z flipped unattended, with the browser
closed, and stamped `date = 2026-07-22` — the correct NY-local date.

#### `52a49bc` — scheduling workflow in the admin

Schedule / reschedule / publish-now / cancel, all from the UI. Deployed; the browser acceptance pass
was not reported back, so treat the UI as shipped-but-unwitnessed.

- **`lib/publishAt.ts`** holds the wire contract in one place — `PUBLISH_AT_PATTERN`,
  `parsePublishAtLocal()`, `nowInNewYorkLocal()` — imported by two server routes and two client pages.
- `ExecuteResult` → `{ ok, slug, published }`, so **approve revalidates only when something actually
  went live**. A scheduled approve publishes nothing and revalidating would be wasted work.
- New `PATCH /api/admin/marketing/content/[slug]/schedule`, three actions, all guarded on
  `published = false`, **409 `already_published`** on zero rows, `revalidatePath` only on `publish_now`.
- **`publish_at` rides top-level in the approve body**, never inside `payload` —
  `validateContentDraft` builds from a 7-field whitelist and silently drops unknown keys.
- **`publish_at_ny` is returned preformatted** in `datetime-local` shape, so one field serves both
  the display and the input prefill with **zero client-side zone math**.
- Posts tab now has a three-state pill (Live / Scheduled / Draft) and three explicit count buckets;
  the old `drafts = total - live` subtraction filed every scheduled post under "drafts".

#### Date rendering — `timeAgo(iso, dateOnly)`

`blog_posts.date` is a bare `YYYY-MM-DD`, which `new Date()` parses as **UTC midnight**; a
`toLocaleDateString()` with no explicit zone then renders it a day early in any behind-UTC browser.
Live symptom: `2026-03-10` displayed as `3/9/2026` on the admin Content card. Fixed with
`timeZone: "UTC"` at the three post-date sites (`app/blog/page.tsx`, `app/blog/[slug]/page.tsx`,
`admin/marketing/content/page.tsx`).

**Why `timeAgo` took a `dateOnly` parameter instead of a blanket pin:** it has three callers, and the
other two pass `created_at` timestamptz values that *should* render in the viewer's zone. Pinning
unconditionally would have introduced the same off-by-one in the opposite direction — a queue item
created at 9pm ET showing tomorrow's date. **Bare date strings pin UTC; real timestamps stay
viewer-local. Do not "simplify" this back to one behaviour.**

Note the two public blog pages were correct only **by accident of the box being UTC** — see
"Timezones" above for why that makes `TZ=America/New_York` actively dangerous.

---

### 2026-07-21 — WYSIWYG (TipTap) editor for the marketing content editor

Shipped to `main` (`3db9b24`, merged `4dc5819`; lockfile `a76def8`), plus two standalone fixes
below. **Markdown remains the single source of truth** — the editor is a view layer that
round-trips to a markdown string, so the generator, the live blog page, the media bake, and the
approve-time backstop all still read that same string and were not changed.

- **Dependencies (5), all 3.28.x:** `@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`,
  `@tiptap/markdown`, `@tiptap/extension-image`. **`@tiptap/extension-image` is load-bearing —
  do not remove it.** StarterKit v3 ships no Image node, and without it `![](path)` is destroyed on
  the first markdown round-trip: baked charts and filled photos would vanish silently and slip past
  the approve backstop (which only looks for surviving fences).
- `lib/richEditorExtensions.ts` — the single shared extension list, consumed by both
  `BlogEditorRich` and the round-trip regression test, so the guard cannot drift from production.
- `components/BlogEditorRich.tsx` — the TipTap editor (`"use client"`, `immediatelyRender:false`),
  brand toolbar, `.br-blog-prose` content area, and an echo guard so its own emit is not fed back as
  an external change. Wired into the marketing content editor behind a **Rich⇄Source toggle** over
  the same `content` markdown-string state; Save is unchanged.
- `components/editor/MediaBlockView.tsx` — CodeBlock node-view branching on `node.attrs.language`
  (chart → `ChartPreview`, photo → `PhotoSlot`, else a normal `<pre>`). The JSON body is the code
  block's **text**, so CodeBlock keeps owning markdown serialization (fences proven byte-identical
  on round-trip). The node-view maps its callbacks to ProseMirror transactions; a hidden
  `NodeViewContent` supplies the required contentDOM; the visible UI subtree is
  `contentEditable={false}` so the cursor can never enter the React chrome.
- **Component refactor:** `ChartPreview`/`PhotoSlot` moved to `components/media/` and refactored to
  pure **spec-in/spec-out** (`onSpecChange` / `onReplaceWithImage` / `onRemove`) — no longer coupled
  to the whole markdown string plus a fence ordinal. `BlogMarkdownEditor` (string-world, still used
  by the two blog-admin editors) keeps its public API and owns the adapters onto `replaceFence`.
  Both renderers now drive the same components.
- **Round-trip regression test** — `tests/richRoundTrip.test.ts` (vitest + happy-dom, 6 tests):
  every generator construct, plus images and chart/photo fences, survives round-trip byte-identical
  (modulo the CommonMark `\[` escape and a trailing newline). Proven non-vacuous — removing the
  Image extension makes it fail. **It guards SERIALIZATION only**: it never mounts a node-view, so a
  green run means "serialization still fine", not "editing works". The browser pass is the real check.
- **NaN-bake gap closed** — `chartHasInvalidNumber` now blocks Bake alongside `[VERIFY:]`, with the
  offending cells highlighted (see Horizon → "Chart bake: NaN cells", now resolved).
- **Verified in production:** the editor mounts under React 19.2; chart/photo render as interactive
  node-views; the editing corruption is fixed; **bake → Save → reload → the baked chart PNG survives
  to disk** (`optimized/blog-charts/`); photo upload + fill works; approve → publish writes
  `blog_posts` (`published = t`) with the baked media in `content`.

#### Standalone fixes shipped alongside

- **ImagePicker Browse crash (`5db6f1c`)** — `/api/admin/images` returns `folders` as an **object**
  (`{ blog: [...] }`), but `ImagePicker` stored it into a `string[]` and mapped it →
  `TypeError: s.map is not a function`, which white-screened the whole admin tree on Browse.
  **Pre-existing from `d1a4eaf`**, latent until Browse was clicked with a populated `optimized/`;
  unrelated to the WYSIWYG work. Fix: `setFolders(Object.keys(d.folders || {}))` at both set-sites,
  plus `Array.isArray` guards on `images` and at the render site. The API route was left unchanged —
  the object shape is fine, the component was wrong.
- **Node-view editing corruption (`e3f8d71`)** — the chart/photo node-view had no
  `contentEditable={false}` on its visible UI, so ProseMirror mapped DOM positions inside the React
  chrome back to document offsets: keystrokes landed reversed/misplaced and prose bled into the
  chart pill (the "55…" leak was this bug, not a separate cosmetic). Separately, `writeBody` called
  `.focus()` on every keystroke, causing the "only one character" behaviour. Fix:
  `contentEditable={false}` on the visible subtree in both branches, `.focus()` dropped from
  `writeBody`, plus a hardening guard against empty text nodes (latent, not a live bug — labelled as
  such). No schema or serialization change, so the round-trip test stayed valid throughout.
  Storage was verified clean before the fix: draft #4 at 7984 chars, clean prose, both fence bodies
  still valid JSON — the corruption never reached `content`.

---

### 2026-07-20 — Media-slot + chart-spec system

Shipped to `main` (`7c8d68d`), 9 files, tsc clean, server import graph verified recharts-free.

- `lib/mediaBlocks.ts` — pure-TS, recharts-free seam (`ChartSpec`/`PhotoSpec`, `listMediaFences`,
  `replaceFence`, `hasUnresolvedMedia`, `chartHasVerify`, `serializeChart`); the only place fence
  parsing lives; imported by the server page, the editor, and the API route.
- `components/BlogMarkdown.tsx` (server, no recharts in its import graph — the live page renders
  baked `![](path)` only; unresolved fences degrade to a "media pending" note) vs
  `components/BlogMarkdownEditor.tsx` (`"use client"`, the sole recharts importer). recharts
  isolation is by **module boundary**, not `next/dynamic` (repo has none). Both `<Markdown>`-based;
  swapped into all 4 markdown sites (live blog page + 3 admin editors).
- Chart bake: recharts SVG (explicit width/height/xmlns, generic system font) → canvas → PNG →
  `/api/admin/upload` folder `blog-charts`, explicit unique filename `chart-<slug>-<index>-<ts>.png`
  → `replaceFence` → `![title](path)`. Bake disabled while any `[VERIFY:]` remains (honesty rule at
  bake). Photo slots carry writer `intent`; fill via ImagePicker or drop.
- Approve enforcement, two layers: the editor blocks approve while `hasUnresolvedMedia` or the hero
  is unset; a **server backstop in the `status:'approved'` branch of
  `app/api/admin/marketing/queue/[id]/route.ts`** → 400 "Resolve all media blocks before
  publishing." Deliberately **not** in `validateContentDraft` (which runs at enqueue, where
  chart/photo blocks are the generator's legitimate output).
- `lib/contentBrief.ts` teaches the `chart`/`photo` grammar + honesty rule (unknown figures →
  `"[VERIFY: …]"`, never fabricated).
- Featured image: honest "No hero set — required before publishing" state; the old fake
  `/optimized/project/image.jpg` fallback is treated as unset. Chart cells store raw strings so
  decimals/partial entry survive the content round-trip; `toNum` coerces only for the chart.

Prior slices this producer loop was built on (not re-detailed here): draft-created push
(`enqueueContentDraft` chokepoint), in-platform generator (Anthropic forced tool-use), editorial-
calendar presets, the dedicated editor (save / approve-with-edits), and the `.br-blog-prose`
typography pass.

---

## Horizon — Known, Not Scheduled

Real issues, deliberately not being fixed right now. Recorded so they are found on purpose rather
than rediscovered mid-incident. None of these has an owner or a date.

### ⭐ North star — served for the first time on 2026-08-18

**The objective is a Cowork-driven marketing platform that produces content across all modules.**

**Both halves are now proven.** For four sessions this entry recorded a working pipe with nothing
going through it. That is no longer the state:

- **The pipe** — key-gated HTTPS direct from the Cowork sandbox, no MCP. Proven **2026-07-23**.
- **The producer** — a **cloud** scheduled task, reading a credential attached to the Cowork project,
  generating a draft and filing it unattended. Proven **2026-08-18**.

**The first unattended sandbox-origin POST landed 2026-08-18:** `approval_queue` row **6**, status
`pending`, generated and filed by a cloud scheduled task with **no human anywhere in the credential
path**. That is the entire loop closing — a machine nobody prompted, using a credential nobody
handed it, putting a reviewable draft in front of a person.
[Operator-reported / VPS-verified 2026-08-18. **The row id and timestamp are UNVERIFIED from this
repo** — the queue lives in Postgres on the VPS. Operator to confirm with
`SELECT id, created_at, status, module, action FROM approval_queue ORDER BY id DESC LIMIT 5;` and
correct this entry if row 6 is not the one.]

**What this does not yet mean.** One row is not a cadence, and the credential mechanism it depends on
is a project-attached file — see "Cowork Integration" → "Credential mechanism" for why both folder
approaches are dead and why the connector route (request headers, now a documented beta) is the
strictly better end state, since the credential would live server-side and never enter the sandbox at
all.

**What is now ahead**, in the order the evidence argues for it: the **service × location** slice —
the first-ingest baseline shows location intent already outranking service intent two-to-four-fold
(see `MARKETING_PLATFORM.md` §4 → "Baseline"), so this is indicated by measurement rather than
preference. SEO, Social, and the remaining modules follow. This is still the item Working Principle 5
exists to protect; everything below it in this Horizon remains subordinate to it.

### middleware → proxy convention

Next 16.1 deprecates the `middleware.ts` convention; the build emits the warning. The `/admin`
session gate lives there (`middleware.ts`, matcher `["/admin/:path*"]`). Migration is its own
recon-and-build item — not yet scheduled. Note the gate is narrower than it looks: it matches
`/admin/*` pages only, never `/api/admin/*`, which is why every admin API route calls
`getSession()` itself.

### Blog SSG delete gap — HALF RESOLVED 2026-07-22, and worse than first recorded

On-demand revalidation now exists, but **only on the publish paths**: approve (`ca46860`) and the
scheduler's `publish_now`. **Deleting or editing a row still leaves a stale prerendered page.**
`revalidatePath` appears in exactly two files, both of which run when something goes *live*; nothing
runs when something goes away or changes.

**This is no longer theoretical.** During the 2026-07-22 scheduler verification the
`scheduler-smoke-test` row was published by the tick as designed, and a bare `DELETE` did **not**
remove it from `/blog` — the page kept serving 200 with the deleted post until a `./deploy.sh`.

**Worse than first recorded, and now load-bearing.** `DELETE /api/blog/[slug]` was **retained** in
`566dd15` *specifically because* the session-gated admin delete does not revalidate — the bypass
removal could not take the verb away without leaving no working delete behind it. State of play:

- **No delete path anywhere calls `revalidatePath`** — not the key-gated one, not the admin one.
  Still true.
- ~~**Nothing can set `published = false` at all.**~~ **False as of 2026-08-14** (`0a9cf6e`): the
  schedule route's `unpublish` action sets it, and revalidates all three published-gated surfaces.
  See "No unpublish path — RESOLVED" below.
- So **hiding a live post no longer needs a deploy** — unpublish is the supported takedown and the
  URL starts answering 404 on its own. **Hard-deleting one still does**, because `DELETE` leaves the
  prerendered page serving until a rebuild. Unpublish is a soft-hide, not a delete.

The same staleness applies to edits: the session-gated `PUT /api/admin/blog/[slug]` updates the row
and the prerendered page keeps serving the old copy. (The key-gated `PUT /api/blog/[slug]` is a 410
stub as of `566dd15` and no longer edits anything.) **Anything that needs to disappear or change
promptly still needs a deploy**, or a `revalidatePath` call added to the delete/update routes — which
is the obvious fix and is not done.

**This rises in priority as Cowork increases draft volume.** The first approved post containing a
wrong claim will need to come down fast, and today that means a deploy.

### Redundant slug index

`idx_blog_posts_slug` duplicates the index the `blog_posts_slug_key` UNIQUE constraint already
provides — extra write cost on every insert/update, no benefit. Safe one-line `DROP INDEX`, but
it is a live-DB change, so its own deliberate action, not a docs edit.

### blog_posts.content has no NOT NULL

`content` is `text DEFAULT ''` — the table would accept a null-content post. Nothing does today:
`validateContentDraft` requires non-empty content, and it is now the only way in — the old
`POST /api/blog` is a 410 stub. So this
is a latent gap, not a live bug — the enforcement is real but lives entirely in application code,
and a future writer that bypasses both doors would find no floor under it. Low priority.

### Chart bake: NaN cells slip past both media gates — RESOLVED 2026-07-21

The bake used to gate only on `[VERIFY:]` placeholders. A stray non-`[VERIFY:]` non-numeric cell (a
typo, or a blanked field) coerced to `NaN`; recharts rendered it as a gap and the baked PNG shipped a
missing bar/point. Because baking replaces the ` ```chart ` fence with an `![](…)` image, no fence
remained — so it passed both the editor's `hasUnresolvedMedia` gate and the server backstop.

**Closed** by `chartHasInvalidNumber` in `lib/mediaBlocks.ts`, which now blocks Bake alongside
`chartHasVerify`, with the offending cells highlighted in the grid. See the 2026-07-21 Session Log
entry. Kept here rather than deleted because the failure mode — a defect that survives *because* the
gate's own predicate stops matching after the transform — is worth recognising again elsewhere.

### `max_tokens` truncation guard

`generateDraft.ts` should throw when the model's `stop_reason === 'max_tokens'`, so a truncated draft
is rejected rather than queued half-written. Still not built.

This is the last surviving item of the three-part "scheduled publishing + revalidation + truncation
guard" slice. The other two shipped 2026-07-22 — **SSG `revalidatePath`** (`ca46860`) and the
**scheduler / `publish_at`** (`c00c205`, workflow in `52a49bc`); both are in the Session Log above.

### Deferred — migrating the blog-admin editors to TipTap

`app/admin/blog/[slug]/edit` and `app/admin/blog/new` deliberately stay on `BlogMarkdownEditor`
(string-world) via the refactored shared components. They are only migrated once the rich editor has
proven itself on the marketing content editor. Not scheduled.

### No unpublish path — RESOLVED 2026-08-14

**Closed by `0a9cf6e`.** A session-gated `unpublish` action on
`PATCH /api/admin/marketing/content/[slug]/schedule` sets `published = false` **and** NULLs
`publish_at` in the *same* statement, guarded on `published = true`, returning **409 `not_published`**
on zero rows. It is exposed in the marketing admin on every live post's card as a two-click inline
confirm. The prediction recorded here while it was open — "the revalidation half is the hard half" —
was correct, and took three further commits to settle (see `MARKETING_PLATFORM.md` §2 → "Blog route
caching").

Two properties, **recorded so nobody "simplifies" them**:

- **Both column writes must land in ONE statement.** The 60s tick matches
  `published = false AND publish_at IS NOT NULL AND publish_at <= now()` — a *catch-up* predicate. A
  row left holding a past `publish_at` (which is exactly what `publish_now` leaves behind) satisfies
  all three conjuncts, so it would be **republished inside a minute**, with its own revalidation.
  Nulling `publish_at` in the same UPDATE is what makes an unpublish stick. `cancel` clears it for the
  same reason. `tests/unpublish.test.ts` pins the single-statement shape.
- **Correct revalidation IS the removal.** `/blog`, `/blog/<slug>` and `/sitemap.xml` are all gated on
  `published`, so revalidating those three is what makes the URL start answering 404 — the
  `/blog/<slug>` re-render calls `getPostBySlug`, gets null, and `notFound()` fires.

### Marketing-admin findings logged 2026-08-14, deliberately not fixed

Found during the unpublish/publish recon. Recorded so they are not rediscovered from scratch. None is
scheduled and none blocks the Cowork pipeline — which, per Working Principle 5, is exactly why they
are logged rather than built.

- **A1 — `/admin/blog/new` 400s on every submit.** The legacy form always sends `published` in its
  POST body (it still renders a "Publish immediately" checkbox), and `POST /api/admin/blog` now
  **rejects any body carrying that key** — `hasOwnProperty`, not a truthiness test — with 400
  `published_not_accepted`. The route was hardened in `0a9cf6e` and this caller was left behind, so
  the legacy "new post" form cannot currently create anything, draft or otherwise. Decide whether to
  fix the caller or retire the legacy blog admin; the tests assert the route's half only.
- **A3 — no past-time guard on the manage-schedule modal.** The review drawer and
  `content/[id]/edit` both refuse a past datetime by comparing against `nowInNewYorkLocal()`;
  `manageSchedule` checks only that *a* value is present. A past datetime there publishes on the next
  tick (≤60s) with no warning. The server accepts past times **by design** (see `lib/publishAt.ts` —
  "the client warns; the server accepts"), so the client is where the warning belongs, and two of the
  three clients have it.
- **A5 — the Posts-tab `Edit →` ejects to the legacy admin.** It targets `/admin/blog/[slug]/edit`
  (inline-styled, not the marketing Tailwind surface) and redirects to `/admin/blog` on save,
  stranding the user outside `/admin/marketing`. Note the near-identical `Edit draft →` in the review
  drawer goes to `/admin/marketing/content/[id]/edit` and edits a **queue item**, not a post —
  same-looking label, different subsystem. Already flagged in the 2026-07-22 log; the eject is the
  part still outstanding.
- **A6 — the Content page's blue explainer banner is already incomplete.** It tells the reader that
  approving "is what puts a post on the site". `publish_now` is a second, non-queue path, and has
  been since 2026-07-22. See the three-paths correction under "What Cowork can and cannot do".
- **A scheduled post going live does not refresh an open admin tab.** When the 60s tick flips a post,
  an admin tab left open still shows the `Scheduled` pill until the user acts. It reads as a failed
  publish and is not one — nothing polls or revalidates that client surface.

### `/portfolio/[slug]` has the same latent 200-on-404 shape

`apps/web/app/portfolio/loading.tsx` exists and sits above a page that calls `notFound()` — both
verified 2026-08-14. That is precisely the arrangement `d62d8d4` had to remove from `app/blog`: the
segment loading boundary streams a fallback, HTML flushes, the status locks at **200**, and
`notFound()` can then render the 404 body but never set the 404 status.

**Unaddressed by design** — no portfolio URL needs to 404 today. Recorded so that if one ever does,
the cause is already named and the fix is known (delete the segment `loading.tsx`). Do **not** fix it
speculatively: the loading boundary is doing real work on a gallery-heavy page, and removing it costs
a visible loading state to close a hole nothing is falling through.

### `ON CONFLICT (slug) DO NOTHING` errors rather than updates

Re-approving an already-published slug matches zero rows → `ok:false` → `ExecuteError` → rollback.
Correct and safe today: the `rows.length === 0` guard fires before `rows[0]`, so nothing
double-publishes and the queue row stays pending and retryable.

**Scheduling makes this materially easier to hit** — "schedule it, then change my mind and
re-approve" is a natural gesture that now lands on a hard error. If edit-then-republish is wanted,
that is a `DO UPDATE` decision, not a bug fix.

### Three approve entry points, no shared code path

`content/page.tsx` (review drawer), `content/[id]/edit/page.tsx` (full editor), and
`queue/page.tsx` (inline row action) each approve independently. Two send `{ status }`, one sends
`{ payload, status }`; there is **no shared hook or component** and the error handling differs in all
three.

**Absent `publish_at` means publish-now specifically so the un-updated door keeps working** — the
queue page stays publish-now-only by design, not by oversight. Any future change to approve semantics
has to consider all three, or two of them will silently keep the old behaviour.

### `checkApiKey` name shadowing

**Halved by `566dd15`, not gone.** `app/api/blog/[slug]/route.ts` still defines a **module-local**
`checkApiKey(request)` comparing `BLOG_AGENT_API_KEY` with `===`, importing nothing from
`lib/agentAuth.ts` — it gates the retained `DELETE` verb. Its twin in `app/api/blog/route.ts`
disappeared when `POST` became a 410 stub. Now that a constant-time (`timingSafeEqual`) helper exists
under the same name, the survivor is both a readability trap and a minor timing-safety
inconsistency. Folding it onto the shared helper — or removing the verb outright once admin delete
revalidates — is a clean small follow-up.

### ⚠ Tooling hazard — `.bak` is not a scratch extension in this repo

Two **tracked** files, `apps/web/app/globals.css.preavif.bak` and
`apps/web/app/layout.tsx.preavif.bak`, were caught by a `find -name "*.bak" -delete` cleanup glob
during the 2026-07-22 session. Restored with `git checkout --` before the commit; no harm done.

Record the hazard rather than the incident: **`.bak` is a real, tracked extension here.** Scope
cleanup globs to the specific files created, and read `git status` before every commit — the
deletions were visible there and that is what caught them.

### `BLOG_AGENT_API_KEY` rename / split

The name describes a capability it no longer has. It gates **no blog writes** — since `566dd15` it
opens `app/api/admin/upload`, `app/api/admin/images`, and the retained `DELETE /api/blog/[slug]`
(see "Environment Variables"). One credential therefore covers image upload, image listing **and
deleting a live post**, and that delete leaves a ghost page behind. Suggested shape: a dedicated
upload/images key, and retire the blog-delete door once admin delete revalidates. Not scheduled.

### Dedicated Cowork key

`MARKETING_AGENT_API_KEY` currently gates **both** the read doors and the draft-filing door, and a
plaintext copy now lives in `C:\Users\wncre\ClaudeShare\` on Brian's machine for Cowork to read.
A separate key per consumer would be independently rotatable — revoking Cowork's access would not
also break everything else authenticating with that value. See "Cowork Integration".

### Narrow the Cowork domain allowlist

Cowork currently runs with **Domain allowlist → All domains**, which lets any code it executes reach
anywhere on the internet. Narrowing to package managers plus `blueridgehomesnc.com` is untested:
Anthropic's guidance favours the narrower setting, but public bug reports describe additional-domain
entries being ignored. See "Cowork Integration".

### Still open, unscheduled

- **Privacy-policy page** — not built.
- **Credential rotations** — 5 outstanding; urgency downgraded per operator assessment (repo
  private + admin behind the auth boundary above). The burned TOTP seed / admin password / Gmail
  app-password specifics and the filter-repo purge remain recorded under "Repo Hygiene".
- **Managed, DB-backed editorial calendar** — supersedes the static `lib/contentCalendar.ts` seed.
- ~~**External Cowork agent → `/api/agent/content`**~~ — **DONE 2026-07-23.** Cowork files drafts
  through the key-gated door and reads state through `/api/agent/{posts,queue}`. See
  "Cowork Integration".
- ~~**nginx `client_max_body_size`**~~ — **RESOLVED 2026-08-18**, raised to **`25M`**
  [VPS-verified], not the `~20M` originally proposed here. Full-resolution phone photos were being
  rejected by nginx with `413 Content Too Large` before the request reached the app; the upload route
  was never at fault. See Troubleshooting → "Image pipeline".
- **Client-side upload error surfacing** — still open, and the mechanism is now known rather than
  guessed: `handleUpload` in `ImagePicker.tsx` has no `try`/`catch` and calls `await res.json()`
  unconditionally, so nginx's **HTML** 413 body makes `res.json()` throw *before*
  `setUploading(false)` runs — a permanent "Uploading…" spinner from an unhandled rejection. There is
  no `res.ok` check either, so a well-formed JSON error also fails silently. Small local fix.
- **HEIC conversion on upload ingest** — iPhone uploads arrive as HEIC and render in no browser but
  Safari. The upload route writes bytes verbatim with no format check, and the picker's
  `accept="image/*"` includes HEIC on iOS. Convert on ingest, or reject with a real message.
- **Structural tests for the analytics slice** — it shipped with none; see "Testing — what the
  existing harness can and cannot catch" for the specific rule that would have caught the bug that
  slipped.
- **Overview KPI honesty pass** — now urgent rather than cosmetic, because Analytics ships measured
  numbers one nav item away from Overview's invented ones, under identical `KpiCard` chrome.
  **Website Visitors** is derivable today from `analytics_daily.sessions` and should be wired.
  **Blended CPL**, **Marketing ROI** and **Lead → Contract** need spend and contract data that
  nothing ingests, so those should go **visibly empty**, not stay plausible. **Google Review Avg**
  pairs with the GBP reviews work.
- **Connector upgrade path for the Cowork credential** — **Request headers** in *Add custom
  connector* is now a documented beta. That is strictly better than a project-attached file: the
  credential would live **server-side and never enter the sandbox at all**. The 2026-07-23 note
  recording this as unavailable is superseded.
  [Anthropic docs, read 2026-08-18 — NOT verifiable from this repo.]
- **Service-account key rotation** — `GOOGLE_SERVICE_ACCOUNT_KEY` has no rotation procedure and no
  expiry. It joins the existing rotation backlog above.
- **Untyped `/api/admin/*` fetch boundary** — admin fetches use `r.json()`, which is `any`, so
  object-vs-array shape mismatches are invisible to `tsc`. That is exactly how the ImagePicker
  crash (`5db6f1c`) stayed hidden until runtime. Worth a scoped audit — grep admin fetch sites for
  the `d.<field> || []` pattern and compare each against its route's actual return shape — then type
  the responses. Not done.
- **Featured-image placeholder text** — the content editor's hero input still shows the stale
  `/optimized/project/image.jpg` as its *placeholder*. The value itself is correctly treated as unset
  (the red "No hero" banner works), so this is cosmetic only. Outstanding.
- **npm audit — 7 high / 9 total**, from the TipTap dependency tree. Untouched and parked. Do **not**
  run `npm audit fix --force` mid-slice: it resolves by upgrading across majors and would rewrite the
  editor's dependency graph without the round-trip test having been re-proven against it.

Standing caution: any VPS-side edit made outside git is lost when `deploy.sh` re-syncs the box to
`origin/main`. Commit changes to the repo, or they vanish on the next deploy.

---

## Testing — what the existing harness can and cannot catch

The suite is `vitest run` over `apps/web/tests/`, four files as of 2026-08-18. **Every assertion in
it reads source TEXT.** There is no DOM harness for the admin client components, no fetch mock, and
**no harness anywhere that executes SQL**. That is a deliberate limit, but it has to be stated
plainly or the green run means more than it should.

**The analytics slice (2026-08-18) shipped with no tests at all.** Every prior slice shipped
structural tests; this one did not. Recorded as a gap, not excused.

**The bug that slipped, and the honest reason a test would not have caught it.** The ingest route
bound its staleness threshold as:

    ($1 || ' hours')::interval

node-postgres sends bind parameters with **no type OIDs**, so both operands of `||` were `unknown`
and Postgres raises `operator is not unique: unknown || unknown`. It reached the route's own catch
and surfaced as a **503 "not available yet"** — byte-identical to the unapplied-DDL response. See
Troubleshooting → "A 503 that means the opposite of what it says".

**A behaviour test would not have found this**, and claiming otherwise would be the same false
comfort the bug itself produced: nothing in this repo runs SQL, so no test here can observe Postgres
refusing to resolve an operator. The catchable rule is **structural**, and it is worth writing as one:

> **Every bind parameter in a SQL string carries an explicit cast** — `$1::int`, `$1::text` — or is
> consumed by an operator whose other operand is already typed. A bare `$1` beside an untyped literal
> is a latent `operator is not unique`.

That is greppable and would have failed on the line above. **This is a rule, not claimed coverage:**
no test currently enforces it. Writing one that does is the Horizon item.

---

## Nginx Safety Procedure

Before reloading nginx:

### 1. Inspect the Blue Ridge Homes config

    sudo sed -n '1,220p' /etc/nginx/sites-available/blueridgehomesnc.com

### 2. Validate nginx config

    sudo nginx -t

### 3. Reload only if validation passes

    sudo systemctl reload nginx

### 4. Verify nginx is still healthy

    sudo systemctl status nginx --no-pager -l | sed -n '1,20p'

---

## Troubleshooting

### App not starting

Check service status:

    sudo systemctl status brhomes-web --no-pager -l

Check logs:

    sudo journalctl -u brhomes-web -n 200 --no-pager

Common causes:

- build not completed
- missing dependencies
- bad code pushed to repo
- port conflict on `3001`

### Port 3001 not listening

Check:

    ss -tulpn | grep 3001

If nothing appears, restart the service:

    sudo systemctl restart brhomes-web
    sudo systemctl status brhomes-web --no-pager -l

### Build fails

Run manually in app directory:

    cd /var/www/brhomes/apps/web
    npm ci
    npm run build

Resolve code/build issue before restarting the service.

### A 503 that means the opposite of what it says

`/api/internal/ingest-analytics` answers **503 "not available yet"** from a single
`catch` around its staleness query. Two unrelated faults land there and produce a
byte-identical response:

1. the DDL genuinely has not been applied (`42P01 undefined_table`); and
2. the query itself is malformed, on a database where both tables already exist.

The analytics slice was written with exactly that second fault latent. The
staleness threshold was bound as `($1 || ' hours')::interval`; node-postgres sends
bind parameters with no type OIDs, so both operands of `||` were `unknown` and
Postgres raises `operator is not unique: unknown || unknown`. Corrected to
`($1::int * interval '1 hour')`, which needs no inference.

Worth a named entry because of how it would have failed: every tick would have
reported "not available yet" against a correctly migrated database, forever — and
the obvious operator response, re-applying `db/schema/*.sql`, would have confirmed
the tables were already present without changing the symptom at all. Two
instruments agreeing with each other rather than with reality.

**The rule this earns.** A catch-all that collapses many causes into one
operator-facing message must still tell them apart. That route now selects the
"tables are not present" wording only on `42P01`, says merely "not available yet"
for anything else, and logs the driver's own message either way. So when a degrade
path answers 503, read the journal before touching the schema:

    sudo journalctl -u brhomes-web -n 200 --no-pager | grep '\[ingest\]'

#### Two more instances of the same shape, both found 2026-08-18

The pattern generalises past that one route: **a check that cannot distinguish the states it is being
trusted to distinguish.** Two live examples, kept because both cost real time.

**1. A presence check standing in for a correctness check.**

    grep -c -E '^(GA4_PROPERTY_ID|GSC_SITE_URL|GOOGLE_SERVICE_ACCOUNT_KEY)=' .env.local   # → 3

This returned **3**, and one of the three values was **empty**. `grep -c` counts lines matching a
NAME; it says nothing whatever about the value after the `=`. The check confirmed exactly the thing
that was not in doubt. **Use a length check:**

    awk -F= '/^(GA4_PROPERTY_ID|GSC_SITE_URL|GOOGLE_SERVICE_ACCOUNT_KEY)=/ {print $1, length($2)}' .env.local

Any line reporting `0` is present-and-empty — which fails at run time exactly like absent, but passes
every check written to look for the name.

**2. A diagnostic artifact mistaken for the fault.** A `curl` against `/_next/image` returned **400**
on a file known to be good, and that 400 was read as an app fault. It was not: the 400 was an
artifact of how the probe was constructed. **The real signal was the optimizer's own `received null`**
in the journal. When a probe and a log disagree, the log is describing the system and the probe is
describing the probe.

**The rule, stated once:** before trusting a green check, ask what a *failing* system would return
from that same check. If the answer is "the same thing", the check is decorative.

### Image pipeline — HEIC, upload size, and one thing that is NOT diagnosed

**HEIC.** iPhone uploads arrive as **HEIC**, which renders in **no browser but Safari**. Nothing in
this repo converts them: `app/api/admin/upload/route.ts` sanitises the filename and writes the bytes
**verbatim** with `fs.writeFileSync` — there is no format check, no transcode, and despite the
`optimized/` path nothing optimises. `ImagePicker.tsx` sets `accept="image/*"` on the file input,
which on iOS **includes** HEIC. So a HEIC upload succeeds, is stored, and is then invisible to most
visitors. Conversion-on-ingest is a Horizon item.

**Upload size.** nginx `client_max_body_size` was raised to **25M** [VPS-verified 2026-08-18] after
full-resolution phone photos were rejected with `413 Content Too Large` **before the request reached
the app**. This supersedes the `~20M` figure previously proposed under Horizon → "Still open".

**The 413 hid behind a UI defect** — worth reading, because the symptom named the wrong layer.
`handleUpload` in `ImagePicker.tsx` has **no `try`/`catch`** and calls `await res.json()`
unconditionally. nginx's 413 body is **HTML**, so `res.json()` **throws** — and it throws *before*
`setUploading(false)` on the next line. The result is an unhandled rejection in an async event
handler and a permanent **"Uploading…"** spinner. There is also no `res.ok` check at all, so even a
well-formed JSON error would fall through `if (data.path)` and do nothing, silently. The rejection
looked exactly like a hang. Fix is client-side and small; it is a Horizon item.

**`location /optimized/` and `received null` — SUSPECTED, NOT DIAGNOSED.** nginx carries an
`alias` block for `/optimized/`. Newly added files have been observed producing `received null` from
the Next image optimizer. **These two facts have not been shown to be cause and effect** and are
recorded here only so the next person does not rediscover the coincidence and assume it. Note the
deploy already symlinks `.next/standalone/public/optimized` at the real `public/optimized`, so
"the file is not visible to the server" is a hypothesis to test, not an explanation to repeat. Do
not write this up as a cause until someone actually traces it.

### Nginx test fails

Do not reload nginx.

Instead inspect the failing config:

    sudo nginx -t
    sudo nginx -T | grep -n -A 20 -B 20 "brhomesnc.com"

### Public domain still points elsewhere

Check DNS:

    dig +short brhomesnc.com A
    dig +short www.brhomesnc.com A

If results do not show this VPS public IP, public traffic is not yet on this server.

---

## Rollback Procedure

If a new deploy breaks Blue Ridge Homes:

**Do not roll back with `git checkout <commit>`.** It leaves the box on a detached HEAD, and
`deploy.sh` opens with `git pull origin main` under `set -e` — so the next deploy aborts at the
pull, for a reason that looks unrelated to the rollback that caused it. **Roll back by moving
`main` itself, then deploy normally.**

### 1. Check logs

    sudo journalctl -u brhomes-web -n 200 --no-pager

### 2. Move `main` back, on the box

    cd /var/www/brhomes
    git log --oneline -n 10

**This procedure assumes the VPS has PUSH access to origin, not just pull. That has NOT been
verified** — read-only deploy keys are common. Check once, on a calm day, before you need it:

    git push --dry-run origin main

If the box cannot push, do **not** use this procedure mid-incident. Instead: revert on your local
machine, push from there, and let the box take the corrected history:

    # on the box, after you have pushed the revert from your machine
    cd /var/www/brhomes
    git pull origin main            # or: git fetch origin && git reset --hard origin/main

Default — revert forward:

    git revert --no-edit <bad-commit>
    git push origin main

Only if the bad commit was never pulled or cloned anywhere else:

    git reset --hard <known-good-commit>
    git push --force-with-lease origin main

`git revert` is the default because it is forward-only and cannot make the box and origin
diverge. `git reset --hard` is cleaner history but rewrites it, which means a force push and the
same divergence problem documented in the filter-repo purge tail — fine when the box and origin
are the only two copies, wrong the moment they are not. When unsure, revert.

### 3. Redeploy through the one path

    cd /var/www/brhomes/apps/web
    ./deploy.sh
    curl -I http://127.0.0.1:3001

Do not hand-roll `npm ci && npm run build && systemctl restart` — that skips the standalone asset
copies (see "Standard Update / Redeploy Procedure").

Do not change PerfectBike or Ledger during a Blue Ridge Homes rollback.

---

## Launch-Day Cutover Checklist

**Historical — the cutover is complete; the site is live at `https://blueridgehomesnc.com`.**
Kept as reference for the procedure that was run. Do not re-run against the live site.

### Phase 1 - Pre-cutover verification

#### Confirm service health

    sudo systemctl status brhomes-web --no-pager -l
    curl -I http://127.0.0.1:3001

#### Confirm nginx config is valid

    sudo nginx -t

#### Confirm app repo is up to date and built

    cd /var/www/brhomes
    git pull
    cd /var/www/brhomes/apps/web
    npm ci
    npm run build
    sudo systemctl restart brhomes-web
    curl -I http://127.0.0.1:3001

---

### Phase 2 - DNS cutover

Update DNS so:

- `brhomesnc.com` points to this VPS public IP
- `www.brhomesnc.com` points to this VPS public IP, or is a CNAME to `brhomesnc.com`

Verify:

    dig +short brhomesnc.com A
    dig +short www.brhomesnc.com A

Do not continue until DNS is correct.

---

### Phase 3 - SSL certificate issuance

After DNS points here, issue certs for:

- `brhomesnc.com`
- `www.brhomesnc.com`

Typical certbot command pattern:

    sudo certbot --nginx -d brhomesnc.com -d www.brhomesnc.com

Important: inspect whatever certbot wants to change before accepting changes.

If needed, prefer creating a dedicated HTTPS server block for Blue Ridge Homes rather than editing unrelated sites.

---

### Phase 4 - Post-cert inspection

Inspect resulting Blue Ridge Homes nginx config:

    sudo nginx -T | grep -n -A 30 -B 20 "brhomesnc.com"

Validate nginx:

    sudo nginx -t

Reload nginx:

    sudo systemctl reload nginx

---

### Phase 5 - Public verification

Check:

    curl -I http://brhomesnc.com
    curl -I https://brhomesnc.com
    curl -I https://www.brhomesnc.com

Also test in a browser:

- home page
- portfolio page
- contact page
- mobile view
- any forms or outbound email links

---

## Inspect-First Commands

Use these before making changes if anything is unclear:

### Ports

    ss -tulpn | grep LISTEN

### Docker containers

    docker ps --format "table {{.Names}}\t{{.Ports}}\t{{.Status}}"

### Enabled nginx sites

    sudo ls -la /etc/nginx/sites-enabled

### Full nginx config

    sudo nginx -T

### Blue Ridge Homes service

    sudo systemctl status brhomes-web --no-pager -l

---

## Do Not Touch List

Unless explicitly required and verified safe, do not modify:

- `/etc/nginx/sites-available/perfectbike`
- `/etc/nginx/sites-available/perfectbike.app`
- `/etc/nginx/sites-available/app.perfectbike.app`
- `/etc/nginx/sites-available/api.perfectbike.app`
- `/etc/nginx/sites-available/operator.ledgerapp.dev`
- Docker containers for Ledger
- Docker containers for PerfectBike
- existing ports `3000`, `8080`, `8000`, `5432`

---

## Summary

Blue Ridge Homes is deployed on this VPS as:

- repo: `/var/www/brhomes`
- app: `/var/www/brhomes/apps/web`
- service: `brhomes-web`
- bind: `127.0.0.1:3001`

It is isolated from PerfectBike and Ledger.

It is live in production at `https://blueridgehomesnc.com`; `brhomesnc.com` 301-redirects to it.
