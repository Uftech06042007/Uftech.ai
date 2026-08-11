# UFTECH.AI

Marketing site — Next.js 16 (App Router), React 19, TypeScript.

## Requirements

- Node.js 20.9 or later
- npm

## Local development

```bash
npm install
cp .env.example .env.local   # optional — defaults to http://localhost:3000
npm run dev
```

Open http://localhost:3000.

## Environment variables

| Variable               | Purpose                                                          | Default                 |
| ----------------------- | ----------------------------------------------------------------- | ------------------------ |
| `NEXT_PUBLIC_SITE_URL` | Base URL used for Open Graph tags, `sitemap.xml` and `robots.txt` | `http://localhost:3000` |

Set it to the real production URL before deploying.

## Production build (bare metal / VM)

```bash
npm ci
NEXT_PUBLIC_SITE_URL=https://your-domain.example npm run build
npm start
```

`npm run typecheck` and `npm run lint` are available to run as separate CI gates before `build`.

## Production build (Docker)

The image uses Next's [standalone output](https://nextjs.org/docs/app/api-reference/config/next-config-js/output) — a self-contained server with only the runtime dependencies it needs, no full `node_modules` copy in the final layer.

```bash
docker build \
  --build-arg NEXT_PUBLIC_SITE_URL=https://your-domain.example \
  -t uftech-ai .

docker run -p 3000:3000 uftech-ai
```

## Deploying on Vercel

This is a stock Next.js App Router project, so it deploys to [Vercel](https://vercel.com) with no extra configuration — connect the repo, set `NEXT_PUBLIC_SITE_URL` in the project's environment variables, and deploy. Any other Node-capable host works the same way via the Docker image above.
