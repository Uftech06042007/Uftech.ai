import { beforeEach, describe, expect, it, vi } from "vitest";

import { PRODUCTS, SERVICES } from "@/lib/data";
import {
  PRODUCT_ENTRIES,
  PRODUCT_PAGES,
  SERVICE_ENTRIES,
  SERVICE_PAGES,
  productBySlug,
  serviceBySlug,
} from "@/lib/seo-pages";

/**
 * The SEO surface fails quietly by nature: a missing canonical, a slug that no
 * longer resolves or a sitemap that has fallen behind the routes costs
 * rankings for weeks before anyone notices, because nothing errors. These
 * assert the parts that have to stay in step with each other.
 */

describe("service and product pages", () => {
  it("covers every service and product in lib/data.ts exactly once", () => {
    // A new service added to lib/data.ts with no page here would appear on the
    // homepage, in the chatbot and nowhere a search engine can index it.
    expect(SERVICE_ENTRIES).toHaveLength(SERVICES.length);
    expect(PRODUCT_ENTRIES).toHaveLength(PRODUCTS.length);
    expect(new Set(SERVICE_PAGES.map((p) => p.key)).size).toBe(SERVICES.length);
    expect(new Set(PRODUCT_PAGES.map((p) => p.key)).size).toBe(PRODUCTS.length);
  });

  it("gives every page a unique, URL-safe slug", () => {
    const slugs = [...SERVICE_PAGES, ...PRODUCT_PAGES].map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  });

  it("resolves a page by its slug and nothing by an unknown one", () => {
    expect(serviceBySlug("custom-ai-agents")?.item.t).toBe("Custom AI Agents");
    expect(serviceBySlug("not-a-service")).toBeUndefined();
    expect(productBySlug("ai-finance-bot")?.item.t).toBe("AI Finance Bot");
    expect(productBySlug("not-a-product")).toBeUndefined();
  });

  it("keeps titles and descriptions inside what a result page will show", () => {
    // The layout appends " | UFTECH.AI" (12 chars) to every one of these, and
    // Google truncates around 60. Descriptions get rewritten above ~160.
    for (const page of [...SERVICE_PAGES, ...PRODUCT_PAGES]) {
      expect(page.title.length + " | UFTECH.AI".length, page.slug).toBeLessThanOrEqual(65);
      expect(page.description.length, page.slug).toBeGreaterThan(70);
      expect(page.description.length, page.slug).toBeLessThanOrEqual(185);
    }
  });

  it("gives every page enough body copy to be worth indexing", () => {
    // A page with a heading and two sentences is a thin page, and thin pages
    // do not rank however good the markup around them is.
    for (const page of [...SERVICE_PAGES, ...PRODUCT_PAGES]) {
      const words = [...page.sections.flatMap((s) => s.p), ...page.faqs.map((f) => f.a)]
        .join(" ")
        .split(/\s+/).length;
      expect(words, page.slug).toBeGreaterThan(400);
      expect(page.faqs.length, page.slug).toBeGreaterThanOrEqual(3);
    }
  });
});

describe("sitemap and robots", () => {
  const SITE = "https://uftech.ai";

  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", SITE);
  });

  it("lists every route the site actually serves", async () => {
    const { default: sitemap } = await import("@/app/sitemap");
    const urls = sitemap().map((e) => e.url);

    const expected = [
      "/",
      "/services",
      "/products",
      "/about",
      "/contact",
      ...SERVICE_PAGES.map((p) => `/services/${p.slug}`),
      ...PRODUCT_PAGES.map((p) => `/products/${p.slug}`),
    ].map((path) => (path === "/" ? SITE : `${SITE}${path}`));

    expect(urls.sort()).toEqual(expected.sort());
  });

  it("emits absolute URLs with no trailing slash and no duplicates", async () => {
    const { default: sitemap } = await import("@/app/sitemap");
    const urls = sitemap().map((e) => e.url);

    expect(new Set(urls).size).toBe(urls.length);
    for (const url of urls) {
      expect(url.startsWith("https://")).toBe(true);
      // Including the homepage, which is the bare origin: "https://uftech.ai"
      // and "https://uftech.ai/" would be two entries for one page.
      expect(url.endsWith("/"), url).toBe(false);
    }
  });

  it("keeps crawlers out of /api and points them at the sitemap", async () => {
    const { default: robots } = await import("@/app/robots");
    const result = robots();

    // /api/chat costs a model call per request and is rate-limited per
    // visitor; a crawler walking it spends real money for no index value.
    expect(result.rules).toMatchObject({ disallow: ["/api/"] });
    expect(result.sitemap).toBe(`${SITE}/sitemap.xml`);
  });

  it("strips a trailing slash from NEXT_PUBLIC_SITE_URL", async () => {
    // A misconfigured deploy setting "https://uftech.ai/" would otherwise
    // produce "https://uftech.ai//services" throughout the sitemap.
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://uftech.ai/");
    const { SITE_URL, absoluteUrl } = await import("@/lib/seo");

    expect(SITE_URL).toBe(SITE);
    expect(absoluteUrl("/services")).toBe(`${SITE}/services`);
  });
});

describe("structured data", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://uftech.ai");
  });

  it("describes the organisation once, with a stable @id", async () => {
    const { siteGraph, ORG_ID } = await import("@/lib/schema");
    const graph = siteGraph()["@graph"] as Record<string, unknown>[];

    const org = graph.find((n) => n["@id"] === ORG_ID);
    expect(org).toBeDefined();
    expect(org?.name).toBe("UFTECH.AI");
    expect(org?.sameAs).toContain("https://www.linkedin.com/company/uftjobs/");
    // The WebSite node must point at the organisation by reference rather than
    // restating it — two Organization descriptions is two entities.
    const site = graph.find((n) => n["@type"] === "WebSite");
    expect(site?.publisher).toEqual({ "@id": ORG_ID });
  });

  it("marks up each service and product against its own URL", async () => {
    const { productSchema, serviceSchema, ORG_ID } = await import("@/lib/schema");

    const svc = serviceSchema(SERVICE_ENTRIES[0].item, "/services/custom-ai-agents");
    expect(svc.url).toBe("https://uftech.ai/services/custom-ai-agents");
    expect(svc.provider).toEqual({ "@id": ORG_ID });

    const prod = productSchema(PRODUCT_ENTRIES[0].item, "/products/ai-talent-crm");
    expect(prod["@type"]).toBe("SoftwareApplication");
    // No `offers`: the site publishes no pricing, and markup claiming a price
    // it does not show is a structured-data violation as well as a lie.
    expect(prod).not.toHaveProperty("offers");
  });

  it("turns the on-page FAQs into FAQPage markup, answers included", async () => {
    const { faqSchema } = await import("@/lib/schema");
    const faqs = SERVICE_PAGES[0].faqs;
    const schema = faqSchema(faqs) as { mainEntity: { name: string; acceptedAnswer: unknown }[] };

    expect(schema.mainEntity).toHaveLength(faqs.length);
    expect(schema.mainEntity[0].name).toBe(faqs[0].q);
    expect(schema.mainEntity[0].acceptedAnswer).toEqual({
      "@type": "Answer",
      text: faqs[0].a,
    });
  });

  it("numbers breadcrumb positions from one and resolves them absolutely", async () => {
    const { breadcrumbSchema } = await import("@/lib/schema");
    const schema = breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "AI services", path: "/services" },
    ]) as { itemListElement: { position: number; item: string }[] };

    expect(schema.itemListElement[0]).toMatchObject({ position: 1, item: "https://uftech.ai" });
    expect(schema.itemListElement[1]).toMatchObject({
      position: 2,
      item: "https://uftech.ai/services",
    });
  });
});
