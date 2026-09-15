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
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

Most of the site runs with `.env.local` left empty: `NEXT_PUBLIC_SITE_URL`
falls back to `http://localhost:3000`, and a missing `RESEND_API_KEY` or
`DATABASE_URL` degrades that one feature rather than breaking the page. The
site assistant needs `ANTHROPIC_API_KEY` to respond at all.

## Scripts

| Command             | Purpose                                        |
| ------------------- | ---------------------------------------------- |
| `npm run dev`       | Development server                             |
| `npm run build`     | Production build (runs `prisma generate` first) |
| `npm start`         | Serve a production build                       |
| `npm run lint`      | ESLint                                         |
| `npm run typecheck` | TypeScript, no emit                            |
| `npm test`          | Vitest, single run                             |
| `npm run test:watch`| Vitest, watch mode                             |

`lint` and `typecheck` are suitable as CI gates ahead of `build`.

The Prisma client is generated into `generated/prisma`, which is not committed —
it is rebuilt on install and on every build.

## Environment variables

`.env.example` lists every variable with its default. Local development uses a
single `.env.local`, which is gitignored and should never be committed.

| Area          | Variables                                                            |
| ------------- | -------------------------------------------------------------------- |
| Site          | `NEXT_PUBLIC_SITE_URL`                                               |
| Lead delivery | `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL`           |
| Assistant     | `ANTHROPIC_API_KEY`, `ANTHROPIC_BASE_URL`, `AI_MODEL`, `AI_MODEL_FAST` |
| Rate limiting | `CHAT_RATE_LIMIT_*`, `CHAT_CONVERTED_RATE_LIMIT_*`                   |
| Database      | `DATABASE_URL`                                                       |

`NEXT_PUBLIC_SITE_URL`, `RESEND_API_KEY`, `CONTACT_TO_EMAIL`,
`ANTHROPIC_API_KEY` and `DATABASE_URL` are required when `NODE_ENV=production`;
the server will not start without them. Outside production a missing variable
only logs a warning.

Rate limiting is enabled by default in production and disabled in development.
The defaults are sensible for a marketing site; the `*_ENABLED`, `*_MAX` and
`*_WINDOW_MS` variables exist to override them per environment.

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

The Prisma models are created in the default `public` schema, so
`DATABASE_URL` should point at a database dedicated to this site.

Apply the schema to a new database:

```bash
npx prisma migrate deploy
```

If the target database already contains these tables, record the
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

Provide the production environment variables however the platform expects them.
`.env` and `.env.local` are for local development and are not intended to hold
production secrets.

## Deploying to Vercel

**Project settings.** Framework preset **Next.js**; the default build command
and output settings are correct. Node.js 20.x or later.

**Environment variables.** Add each variable above under
**Project → Settings → Environment Variables** for the Production environment,
and for Preview if preview deployments should work. Two things to know:

- `NEXT_PUBLIC_SITE_URL` is read at build time. It is inlined into the client
  bundle and baked into the prerendered `robots.txt`, `sitemap.xml` and Open
  Graph tags, so changing it requires a new build, not a restart.
- `NODE_ENV` is set by Vercel and should not be set manually.
- A missing required variable does not fail the build; it surfaces at runtime.
  Load the deployed site before considering a deploy finished.

For preview deployments, point `DATABASE_URL` at a non-production database if
preview traffic should not write real records.

**Region.** The API routes query PostgreSQL on most requests, so choose the
function region closest to the database under **Project → Settings → Functions**.

**Custom domain.** Add the domain under **Project → Settings → Domains**. Vercel
displays the exact DNS records to create; use those values, as they change over
time. At the registrar or DNS host this is typically an `A` record on the apex
and a `CNAME` on `www`. Remove any default parking or forwarding records for
those names first, as they will conflict. Leave `MX` records untouched if the
domain also carries email. Certificates are issued automatically once the
records resolve.

**After the first deploy.** Check that:

- the site loads (a 500 on every page indicates a missing required variable —
  the name appears in the function logs);
- `/robots.txt` and `/sitemap.xml` show the real domain rather than `localhost`;
- a contact form submission is delivered by email and stored;
- the assistant replies to a message.

## Project structure

```
app/                  routes, API handlers, global styles
components/           UI, grouped by page and by shared use
lib/                  data, assistant prompt and client, lead handling, helpers
prisma/               schema and migrations
public/               images and video
tests/                Vitest suites
```

## Performance

The homepage leads with a full-bleed autoplaying video, and that video is the
largest thing on screen — which makes it the Largest Contentful Paint element.
Measured on a throttled mobile profile, LCP was 5.7s, effectively all of it
spent waiting for enough of a 2.7MB MP4 to decode one frame.

The video stays. Three changes took LCP to 3.4s without touching it:

- **A poster.** `public/images/hero-poster.webp` is a 13KB still of the opening
  frame. A `<video>` with no poster reports LCP on its first decoded frame; with
  one, the poster is the candidate, so LCP no longer depends on the MP4 at all.
- **Deferred loading.** The hero video has no `src` until the browser goes idle
  (`CardVideo`, `deferred` prop), so 2.7MB of decoration stops competing with
  the CSS, fonts and scripts that decide first paint. It also stays on the
  poster permanently under `prefers-reduced-motion` or `Save-Data`.
- **Genuinely lazy reels.** `loading="lazy"` was not enough — Chrome's lazy
  threshold scales with connection speed, and all three product reels were
  fetched within 300ms. `CardEmbed` now mounts its iframe from an
  IntersectionObserver instead.

Separately, `uft-logo-dark.png` was a 785x318 export weighing 150KB for an
element rendered 42px tall; it is now 350x142 and 50KB, matching the scale of
its light-mode counterpart.

LCP is now pinned to first contentful paint — the video is no longer the
bottleneck, and further gains have to come from the render-blocking chain and
the ~1.1s of style and layout work, not from the media.
