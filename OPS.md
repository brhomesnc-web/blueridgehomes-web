# Blue Ridge Homes Operations Guide

This document describes how to operate the Blue Ridge Homes website on the production VPS without affecting existing production apps.

## Related Docs

- Marketing platform — architecture, module status, data model, agent surface: `MARKETING_PLATFORM.md`

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
    brhomesnc.com
       ↓
    proxy_pass -> 127.0.0.1:3001
       ↓
    Next.js app

Current staging behavior:

- App is running locally on `127.0.0.1:3001`
- Public DNS is not yet pointed to this server
- Public launch is not complete until DNS and SSL are finalized

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

    curl -I -H "Host: brhomesnc.com" http://127.0.0.1

Note: this may behave differently until final HTTPS config and DNS cutover are complete.

---

## Standard Update / Redeploy Procedure

Run these commands when deploying a new version of the Blue Ridge Homes app:

    cd /var/www/brhomes
    git pull

    cd /var/www/brhomes/apps/web
    npm ci
    npm run build

    sudo systemctl restart brhomes-web
    curl -I http://127.0.0.1:3001

### What this does

- pulls the latest code
- installs locked dependencies
- builds the Next.js app
- restarts only the Blue Ridge Homes service
- verifies the app is healthy locally

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
    WorkingDirectory=/var/www/brhomes/apps/web
    Environment=NODE_ENV=production
    ExecStart=/usr/bin/npm run start -- --hostname 127.0.0.1 --port 3001
    Restart=always
    RestartSec=5

    [Install]
    WantedBy=multi-user.target

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

This file is gitignored and is **not** in the repo. It is loaded automatically by Next.js from the service's `WorkingDirectory`. Note the systemd unit has **no `EnvironmentFile=`** — it sets only `NODE_ENV`; everything else comes from `.env.local`. `deploy.sh` also copies this file into `.next/standalone/`, which is vestigial under the current unit (it runs `npm run start`, not the standalone server).

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

### 1. Check logs

    sudo journalctl -u brhomes-web -n 200 --no-pager

### 2. Roll back code to prior known-good commit

    cd /var/www/brhomes
    git log --oneline -n 10
    git checkout <known-good-commit>

### 3. Rebuild

    cd /var/www/brhomes/apps/web
    npm ci
    npm run build

### 4. Restart only Blue Ridge Homes

    sudo systemctl restart brhomes-web
    curl -I http://127.0.0.1:3001

Do not change PerfectBike or Ledger during a Blue Ridge Homes rollback.

---

## Launch-Day Cutover Checklist

Only do this when the site is approved and ready to go live.

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

Blue Ridge Homes is deployed in staging on this VPS as:

- repo: `/var/www/brhomes`
- app: `/var/www/brhomes/apps/web`
- service: `brhomes-web`
- bind: `127.0.0.1:3001`

It is isolated from PerfectBike and Ledger.

Until DNS and SSL are finalized, treat it as staged but not live.
