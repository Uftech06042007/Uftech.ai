# UFTECH.AI

Marketing site for UFTECH.AI (Unitforce Technologies) — Next.js 16 (App Router),
React 19, TypeScript.

- Marketing pages: home, about, contact
- Contact form with email delivery and lead storage
- A site assistant that answers questions about the company and can capture
  enquiries conversationally

## Requirements

- Node.js 20.9 or later
- npm
- PostgreSQL (for lead storage)

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in the values you need — see below
npm run dev
```

Open http://localhost:3000.

The site, contact form and lead storage all work with `.env.local` empty —
`NEXT_PUBLIC_SITE_URL` falls back to `http://localhost:3000`, and a missing
`RESEND_API_KEY` or `DATABASE_URL` just degrades that one feature gracefully
(see the per-variable notes in `.env.example`). Only the chatbot needs real
values (`ANTHROPIC_API_KEY` at minimum) to do anything.

## Environment variables

`.env.example` is the authoritative list, with defaults and notes inline.
Local development uses a single `.env.local` file (gitignored, never
committed) — see [Next.js's env docs](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
if you're curious about the fuller `.env`/`.env.local`/`.env.<NODE_ENV>` load
order Next.js supports; this project doesn't use the others. Summary by area:

| Area                | Variables                                                                                                                             |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Site                | `NEXT_PUBLIC_SITE_URL`                                                                                                                  |
| Lead delivery       | `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL`                                                                              |
| Chatbot             | `ANTHROPIC_API_KEY`, `ANTHROPIC_BASE_URL`, `AI_MODEL`, `AI_MODEL_FAST`                                                                  |
| Rate limiting       | `CHAT_RATE_LIMIT_ENABLED`, `CHAT_RATE_LIMIT_MAX`, `CHAT_RATE_LIMIT_WINDOW_MS`, `CHAT_CONVERTED_RATE_LIMIT_ENABLED`, `CHAT_CONVERTED_RATE_LIMIT_BURST_MAX`, `CHAT_CONVERTED_RATE_LIMIT_BURST_WINDOW_MS`, `CHAT_CONVERTED_RATE_LIMIT_MAX`, `CHAT_CONVERTED_RATE_LIMIT_WINDOW_MS` |
| Database            | `DATABASE_URL`                                                                                                                          |

`NEXT_PUBLIC_SITE_URL`, `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `ANTHROPIC_API_KEY`
and `DATABASE_URL` are checked at server startup (`instrumentation.ts` →
`lib/env.ts`) whenever `NODE_ENV=production` — if any is missing, the server
refuses to start rather than come up half-broken. Outside production, a
missing variable only logs a warning, since local dev intentionally runs with
partial config (see the "works with `.env.local` empty" note above).

### Before deploying to production

Set these in the hosting platform's environment configuration (not in a
committed file):

- `NEXT_PUBLIC_SITE_URL` — the real domain, not `localhost`.
- `RESEND_API_KEY` and `CONTACT_FROM_EMAIL` — a live key and a sender on a
  domain verified in Resend; the sandbox fallback won't deliver to real inboxes.
- `CONTACT_TO_EMAIL` — the team inbox, not a personal address used for testing.
- `ANTHROPIC_API_KEY` (and `ANTHROPIC_BASE_URL`/`AI_MODEL` if not using
  Anthropic directly) — required for the chatbot to respond at all.
- `DATABASE_URL` — the production Postgres instance.
- Rate limiting (`CHAT_RATE_LIMIT_*`, `CHAT_CONVERTED_RATE_LIMIT_*`) is **on
  by default once `NODE_ENV=production`** (set automatically by `next
  build`/`next start` — never set it yourself). Defaults: 30 req/min general
  limit for everyone; for visitors who already have a lead on file, an
  additional 3 req/min burst cap and 10 req/hour sustained cap on top of that.
  Only add these vars if those numbers don't fit.

### Values to set for a production deployment

Set these in the hosting platform's environment configuration, never in a
committed file.

- `NEXT_PUBLIC_SITE_URL` — the canonical origin, including the scheme and with
  no trailing slash (for example `https://example.com`). Used for Open Graph
  tags, `robots.txt` and the sitemap.
- `RESEND_API_KEY` and `CONTACT_FROM_EMAIL` — a live [Resend](https://resend.com)
  key and a sender address on a domain verified there. The default sandbox
  sender does not deliver to arbitrary inboxes.
- `CONTACT_TO_EMAIL` — the inbox that should receive enquiries.
- `ANTHROPIC_API_KEY` — required for the assistant. Set `ANTHROPIC_BASE_URL`
  and `AI_MODEL` as well if you are using an Anthropic-compatible endpoint
  rather than Anthropic directly.
- `DATABASE_URL` — the production PostgreSQL connection string.

## Database

The Prisma models live in a dedicated `marketing` PostgreSQL schema, so the
connection string can point at a database that hosts other schemas as well.

Apply the schema to a new database:

```bash
npx prisma migrate deploy
```

If the target database already contains the `marketing` tables, record the
baseline as applied instead — `migrate deploy` will otherwise fail trying to
create tables that exist:

```bash
npx prisma migrate resolve --applied 0_init
```

Migrations are not run during the build. Apply them as an explicit step against
a known connection string.

## Production build

```bash
npm ci
npm run build
npm start
```

Set the production environment variables above however your platform expects
(exported in the shell, a process manager's env config, etc.) — `.env`/`.env.local`
are for local development only and are not meant to hold production secrets.

`npm run typecheck` and `npm run lint` are available to run as separate CI gates before `build`.

`npm run build` runs `prisma generate` first, so a clean checkout builds without
a separate generate step. The generated client lives in `generated/prisma` and
is deliberately **not** committed — it is rebuilt on every install and build.

## Database schema

The Prisma models live in their own `marketing` Postgres schema, so the
connection string may point at a database shared with other applications —
nothing outside that schema is created or touched.

`prisma/migrations/0_init` is the baseline migration. Apply it to a fresh
database with:

```bash
npx prisma migrate deploy
```

If the target database **already has** the `marketing` tables (they were
created with `prisma db push` before migrations existed), don't run the
migration — mark it as already applied instead, or `migrate deploy` will fail
trying to create tables that exist:

```bash
npx prisma migrate resolve --applied 0_init
```

Migrations are **not** run automatically during the build. The database is
shared, so schema changes are a deliberate, human-run step against a known
connection string rather than something a deploy does on its way past.

## Deploying on Vercel

### 1. The repository

Vercel deploys from a Git repository it can read. If the source of truth is a
private repo and the deployment is driven from a separate public mirror, push
this codebase to that public repo and connect Vercel to it. Before you do,
confirm the mirror is safe to publish:

- No `.env` or `.env.local` in the tree or in the history — both are gitignored,
  and `git log --all --diff-filter=A --name-only | grep -i '\.env'` should show
  nothing but `.env.example`.
- Every secret lives in Vercel's environment configuration, never in a
  committed file.

Bear in mind that a public mirror publishes the full commit history, not just
the current files, and that anything published there is effectively permanent.

### 2. Project settings

Framework preset **Next.js**; the default build command (`npm run build`) and
output settings are correct as-is. Node.js 20.x or later (`package.json`
`engines` already requires it).

### 3. Environment variables

Set every variable from ["Before deploying to production"](#before-deploying-to-production)
in **Project → Settings → Environment Variables**, for the Production
environment (and Preview, if preview deployments should work). Note that:

- `NEXT_PUBLIC_SITE_URL` is **read at build time**, not at request time. It is
  inlined into the client bundle *and* baked into the prerendered
  `robots.txt`, `sitemap.xml` and Open Graph tags. Setting it after a build has
  no effect — those files keep whatever host the build saw. Set it first, then
  redeploy; restarting is not enough.
- `NODE_ENV` is set by Vercel — never set it yourself.
- A missing required variable makes `instrumentation.ts` throw on startup. Note
  that the **build still succeeds** — the failure shows up at runtime, as every
  request returning a 500. That is intended (better wholly down than quietly
  half-broken), but it does mean a green deployment is not proof the
  environment is complete. Load the site before calling a deploy done.

For preview deployments, point `DATABASE_URL` at a non-production database if
you don't want preview traffic writing real leads.

### 4. Region

Functions default to Vercel's `iad1` (US East). The API routes talk to Postgres
on nearly every request, so the region that matters is the one closest to the
**database**, not to the visitor. If the database is not in US East, set the
function region to match it in **Project → Settings → Functions**.

### 5. Custom domain (DNS at BigRock)

Add the domain in **Project → Settings → Domains**. Vercel then shows the exact
records to create — use those values rather than any written down here, as they
change. In BigRock's DNS management for the domain, expect to add:

- an **A record** on the apex (`@`) pointing at the address Vercel shows, and
- a **CNAME** on `www` pointing at the target Vercel shows.

Delete BigRock's default parking/forwarding records for `@` and `www` first, or
they will conflict. DNS changes can take a few hours to propagate; Vercel issues
the TLS certificate automatically once it can see the records.

If the domain also carries email (MX records), leave those untouched — only the
`@` A record and the `www` CNAME change.

### 6. After the first deploy

- The site loads at all (a 500 on every page means a required environment
  variable is missing — check the function logs for the name).
- `https://<domain>/robots.txt` and `/sitemap.xml` should show the real domain,
  not `localhost` — if they don't, `NEXT_PUBLIC_SITE_URL` was missing or wrong
  *at build time*, and a redeploy is needed after fixing it.
- Submit the contact form once and confirm the lead both arrives by email and
  lands in the `marketing.Lead` table.
- Send the chatbot a message and confirm it replies.

### Known limitation on serverless

`lib/rate-limit.ts` keeps its sliding windows in memory, so on Vercel each
function instance limits independently and the effective ceiling is higher than
the configured numbers suggest. It is a courtesy guard against a single visitor
hammering the chat, not a defence against a distributed one. Moving it to a
shared store (Vercel KV / Redis) is the fix if that ever matters.
