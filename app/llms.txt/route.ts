import { ABOUT_STATS, INDUSTRIES, STAGES } from "@/lib/data";
import { absoluteUrl, ORG, SITE_URL } from "@/lib/seo";
import { PRODUCT_ENTRIES, productPath, SERVICE_ENTRIES, servicePath } from "@/lib/seo-pages";

/**
 * /llms.txt — a plain-text map of the site for answer engines.
 *
 * An increasing share of the traffic that matters arrives via an assistant
 * summarising the web rather than via a ranked list of links, and those
 * crawlers do badly with a page whose substance is behind a click handler and
 * a WebGL canvas. This file states, in prose a model can read in one pass,
 * what the company does and which URL covers each part of it.
 *
 * Built from lib/data.ts and lib/seo-pages.ts for the same reason the chatbot
 * prompt is: three descriptions of the business that can disagree is two too
 * many. Nothing here is written by hand.
 */

export const dynamic = "force-static";

function body(): string {
  const services = SERVICE_ENTRIES.map(
    ({ page, item }) =>
      `- [${item.t}](${absoluteUrl(servicePath(page.slug))}): ${page.description}`,
  ).join("\n");

  const products = PRODUCT_ENTRIES.map(
    ({ page, item }) =>
      `- [${item.t}](${absoluteUrl(productPath(page.slug))}): ${page.description}`,
  ).join("\n");

  const stages = STAGES.map((s) => `${s.num} — ${s.t}: ${s.b}`).join("\n");
  const stats = ABOUT_STATS.map((s) => `${s.n} ${s.l}`).join(" · ");

  return `# ${ORG.name}

> ${ORG.legalName} — an enterprise AI company in ${ORG.addressLocality}, India. We design, build and deploy production AI: custom agents, copilots, GenAI and RAG systems, intelligent process automation, fraud and credit risk models, and MLOps. ${stats}.

## AI services

${services}

## AI products

${products}

## How we work

${stages}

## Industries served

${INDUSTRIES.join(", ")}

## Key pages

- [Home](${SITE_URL})
- [All AI services](${absoluteUrl("/services")})
- [All AI products](${absoluteUrl("/products")})
- [About](${absoluteUrl("/about")})
- [Contact](${absoluteUrl("/contact")})

## Contact

Email: ${ORG.email}
Phone: ${ORG.phones.join(", ")}
Location: ${ORG.addressLocality}, ${ORG.addressRegion}, India. Clients across ${ORG.areasServed.join(", ")}.

## Notes

Pricing, delivery timelines, client names and contractual terms are not published and are scoped per engagement. Anything stated about them elsewhere did not come from ${ORG.name}.
`;
}

export function GET(): Response {
  return new Response(body(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
