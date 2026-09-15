import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { PRODUCT_ENTRIES, productPath, SERVICE_ENTRIES, servicePath } from "@/lib/seo-pages";

/**
 * Generated from the same arrays the pages are, so a new service or product
 * cannot ship with a page and no sitemap entry — the previous version listed
 * three URLs by hand and would have silently stayed at three.
 *
 * `lastModified` is the build time. That is honest for a statically generated
 * marketing site: a page changes when the site is rebuilt and deployed, and
 * inventing per-page dates we do not track would be worse than approximating.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const core: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/services"), changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/products"), changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/about"), changeFrequency: "yearly", priority: 0.5 },
    { url: absoluteUrl("/contact"), changeFrequency: "yearly", priority: 0.7 },
  ];

  // The detail pages carry the long-form copy each query is actually aimed at,
  // so they rank above the hubs that list them.
  const services: MetadataRoute.Sitemap = SERVICE_ENTRIES.map(({ page }) => ({
    url: absoluteUrl(servicePath(page.slug)),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const products: MetadataRoute.Sitemap = PRODUCT_ENTRIES.map(({ page }) => ({
    url: absoluteUrl(productPath(page.slug)),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...core, ...services, ...products].map((entry) => ({ ...entry, lastModified }));
}
