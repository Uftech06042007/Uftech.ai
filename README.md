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
| Site          | `NEXT_PUBLIC_SITE_URL`, `GOOGLE_SITE_VERIFICATION`                   |
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
  no trailing slash (for example `https://example.com`). Used for canonical
  URLs, Open Graph tags, JSON-LD, `robots.txt`, `llms.txt` and the sitemap. A
  trailing slash is stripped, but getting the host wrong points every canonical
  on the site at somewhere that does not exist.
- `GOOGLE_SITE_VERIFICATION` — optional. The token from the Search Console
  property, if verifying by meta tag rather than by DNS. Omit it and no tag is
  rendered.
- `RESEND_API_KEY` and `CONTACT_FROM_EMAIL` — a live [Resend](https://resend.com)
  key and a sender address on a domain verified there. The default sandbox
  sender does not deliver to arbitrary inboxes.
- `CONTACT_TO_EMAIL` — the inbox that should receive enquiries.
- `ANTHROPIC_API_KEY` — required for the assistant. Set `ANTHROPIC_BASE_URL`
  and `AI_MODEL` as well if you are using an Anthropic-compatible endpoint
  rather than Anthropic directly.
- `DATABASE_URL` — the production PostgreSQL connection string.

## Search

The site is built to be indexed, not just to look right. What that means in
practice, and where each part lives:

- **A page per offering.** Every service and product has its own URL under
  `/services/<slug>` and `/products/<slug>`, generated from `lib/seo-pages.ts`
  joined to `lib/data.ts`. The homepage still shows all of them, but a page
  that covers nine subjects ranks for none of them in particular — and the six
  service descriptions on the homepage only exist after a click, so they are
  not in the HTML a crawler reads at all.
- **One canonical per page**, set by `pageMetadata()` in `lib/seo.ts`. It is
  deliberately *not* set in the root layout: a canonical there is inherited by
  every child that does not override it, which would have the whole site
  declaring the homepage as its canonical.
- **Structured data** in `lib/schema.ts` — one `ProfessionalService` and one
  `WebSite` node for the site, emitted from the root layout, plus `Service`,
  `SoftwareApplication`, `FAQPage` and `BreadcrumbList` per page. Nodes
  reference the organisation by `@id` instead of repeating it, so a crawler
  resolves the site to a single entity.
- **`/sitemap.xml` and `/robots.txt`** are generated from the same arrays as
  the routes, so a new service cannot ship with a page and no sitemap entry.
- **`/llms.txt`** states in plain prose what the company does and which URL
  covers each part, for answer engines that do badly with a page whose
  substance is behind a click handler and a WebGL canvas.

`tests/seo.test.ts` covers the parts that fail silently: the sitemap matching
the routes, every offering having exactly one page, title and description
lengths, and the shape of the JSON-LD.

Two things are deliberately **not** in the code and have to be done once, by
hand, in the relevant console:

1. Verify the domain in Google Search Console and Bing Webmaster Tools, and
   submit `https://<host>/sitemap.xml` in both.
2. Claim and complete the Google Business Profile for the Bengaluru office.
   Name, address and phone must match `ORG` in `lib/seo.ts` character for
   character — inconsistent NAP is the usual reason a local listing fails to
   consolidate.

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
lib/                  data, SEO metadata and schema, assistant prompt, helpers
prisma/               schema and migrations
public/               images and video
tests/                Vitest suites
```
