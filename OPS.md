# Blue Ridge Homes Operations Guide

This document describes how to operate the Blue Ridge Homes website on the production VPS without affecting existing production apps.

## Related Docs

- Marketing platform — architecture, module status, data model, agent surface: `MARKETING_PLATFORM.md`

Note: `docs/OPS.md` is a **local-only untracked shadow** of this file — it has never been
committed and never reaches the VPS. **This root `OPS.md` is the tracked source of truth; edit
this one.** Resolve the duplicate (promote `docs/OPS.md` by committing it as canonical, or delete
it) — decision pending.

The marketing platform runs inside this same app, service, and port, so it needs no operations of its own. Only the cross-cutting facts it depends on live here: environment keys, the schema convention, and the old marketing SPA artifact.

---

## Scope

This guide applies only to:

- Blue Ridge Homes repo: `/var/www/brhomes`
- Blue Ridge Homes app: `/var/www/brhomes/apps/web`
- Blue Ridge Homes local app port: `127.0.0.1:3001`
- Blue Ridge Homes systemd service: `brhomes-web`
- Blue Ridge Homes nginx site file: `/etc/nginx/sites-available/brhomesnc.com`

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

    /etc/nginx/sites-available/brhomesnc.com
    /etc/nginx/sites-enabled/brhomesnc.com

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
    BLOG_AGENT_API_KEY               blog agent write auth
    MARKETING_AGENT_API_KEY          marketing agent write auth (see below)
    TURNSTILE_SECRET_KEY             Cloudflare Turnstile server-side verify
    NEXT_PUBLIC_TURNSTILE_SITE_KEY   Turnstile client site key (public)
    SMTP_HOST / SMTP_PORT            mail transport
    SMTP_USER / SMTP_PASS            mail credentials
    CONTACT_EMAIL                    contact-form notification recipient
    PUBLIC_DIR                       public asset directory override

`MARKETING_AGENT_API_KEY` — marketing agent auth, consumed by `apps/web/lib/agentAuth.ts`. Add it to `.env.local` when the first agent producer lands; nothing reads it before then. **Write it unquoted.** Unlike `SMTP_PASS`, which the code defensively strips surrounding quotes from, this key is compared byte-for-byte as-is — surrounding quotes become part of the key and auth will fail.

After changing `.env.local`, restart the service to pick it up:

    sudo systemctl restart brhomes-web

---

## Repo Conventions

### Database schema

`apps/web/db/schema/*.sql` is the checked-in schema convention, introduced with the marketing platform's `approval_queue` table. It is the first version-controlled schema in this repo — every table before it was created ad-hoc directly on the VPS and exists only implicitly in query strings.

There is **no migration runner**. These files are the record of intent, not executable migrations. Applying them is a manual, deliberate step:

    psql -p 5433 -d <db> -f /var/www/brhomes/apps/web/db/schema/<file>.sql

Deploys never run DDL. Adding a table means committing the `.sql` file and applying it by hand.

---

## VPS Artifacts — Pending Decommission

### Old marketing SPA

A static marketing dashboard predating the current platform is **still live** on this VPS:

    Files    /var/www/brhomes-marketing/
    Nginx    location /marketing/*  — 13 blocks in the brhomesnc.com site file
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
- **Separate machine credentials:** the key-gated agent door (`/api/agent/content`,
  `MARKETING_AGENT_API_KEY`) and the upload key (`BLOG_AGENT_API_KEY`) are non-session
  credentials for external/automated callers, outside this cookie boundary.

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
than rediscovered mid-incident. Neither has an owner or a date.

### middleware → proxy convention

Next 16.1 deprecates the `middleware.ts` convention; the build emits the warning. The `/admin`
session gate lives there (`middleware.ts`, matcher `["/admin/:path*"]`). Migration is its own
recon-and-build item — not yet scheduled. Note the gate is narrower than it looks: it matches
`/admin/*` pages only, never `/api/admin/*`, which is why every admin API route calls
`getSession()` itself.

### Blog SSG delete gap

`/blog/[slug]` is statically generated via `generateStaticParams()`. Deleting a `blog_posts` row
does **not** invalidate the prerendered page — it keeps serving a 200 with stale content until the
next deploy or a revalidation. Pre-existing property of the blog, surfaced during Content
smoke-test cleanup; not introduced by the Content module. Not yet addressed.

The same staleness applies to edits, not just deletes: `PUT /api/blog/[slug]` updates the row, and
the prerendered page keeps serving the old copy. Anything that needs to disappear or change
promptly currently needs a deploy.

### Redundant slug index

`idx_blog_posts_slug` duplicates the index the `blog_posts_slug_key` UNIQUE constraint already
provides — extra write cost on every insert/update, no benefit. Safe one-line `DROP INDEX`, but
it is a live-DB change, so its own deliberate action, not a docs edit.

### blog_posts.content has no NOT NULL

`content` is `text DEFAULT ''` — the table would accept a null-content post. Nothing does today:
`validateContentDraft` requires non-empty content, and `POST /api/blog` requires it too. So this
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

### Next slice — scheduled publishing + revalidation + truncation guard

The next build is one slice combining three items:

- **SSG `revalidatePath` fix.** `/blog` and `/blog/[slug]` are SSG with zero `revalidatePath` (see
  "Blog SSG delete gap" above), so an approved post does not appear live until the next deploy. Fix:
  call `revalidatePath('/blog')` + `revalidatePath('/blog/' + slug)` **post-COMMIT** in the approve
  branch of `app/api/admin/marketing/queue/[id]/route.ts`, when `status === 'approved'`.
  **Confirmed live 2026-07-21:** approving wrote the row (`blog_posts`, `published = t`) but the SSG
  pages did not update until a redeploy. This is observed behaviour now, not a prediction.
- **Scheduler (`publish_at`).** Timed publishing. There is **no scheduling column today** —
  `blog_posts` has `published bool` plus a **text** `date`, so this needs a real column (and a
  mechanism to publish at a set time), not just a query change.
- **`max_tokens` truncation guard.** `generateDraft.ts` should throw when the model's
  `stop_reason === 'max_tokens'`, so a truncated draft is rejected rather than queued half-written.

**Standing note until revalidation lands: an approved post requires a `./deploy.sh` before it is
visible on the live site.** Approving alone is not publishing, in practice.

### Deferred — migrating the blog-admin editors to TipTap

`app/admin/blog/[slug]/edit` and `app/admin/blog/new` deliberately stay on `BlogMarkdownEditor`
(string-world) via the refactored shared components. They are only migrated once the rich editor has
proven itself on the marketing content editor. Not scheduled.

### Still open, unscheduled

- **Privacy-policy page** — not built.
- **Credential rotations** — 5 outstanding; urgency downgraded per operator assessment (repo
  private + admin behind the auth boundary above). The burned TOTP seed / admin password / Gmail
  app-password specifics and the filter-repo purge remain recorded under "Repo Hygiene".
- **Managed, DB-backed editorial calendar** — supersedes the static `lib/contentCalendar.ts` seed.
- **External Cowork agent → `/api/agent/content`** — the key-gated door for an outside agent to file
  drafts into the approval queue.
- **nginx `client_max_body_size`** — full-resolution phone photos (8 MB+) are rejected by **nginx**
  with `413 Content Too Large` before the request ever reaches the app; small/optimized images upload
  fine. The upload route itself is not at fault. Fix is an nginx config raise (~`20M`) in the
  brhomes server block plus a reload — **Brian applies nginx changes himself** per the Safety Rules
  and the Nginx Safety Procedure; it is deliberately not scripted. Workaround today: resize before
  uploading.
- **Client-side 413 handling** — on a 413 the ImagePicker sits on "Uploading…" indefinitely instead
  of surfacing the error. Small local fix, low priority, but it makes the nginx limit above look like
  a hang rather than a rejection.
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

## Nginx Safety Procedure

Before reloading nginx:

### 1. Inspect the Blue Ridge Homes config

    sudo sed -n '1,220p' /etc/nginx/sites-available/brhomesnc.com

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
