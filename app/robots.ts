import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Nothing under /api is a page. Crawling it wastes crawl budget on
      // endpoints that answer 405 to a GET, and /api/chat in particular is
      // rate-limited per visitor — a crawler hammering it would be spending
      // a real budget on model calls.
      disallow: ["/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    // Names the origin these rules belong to when the file is reachable on
    // more than one host (a preview deployment, a CDN alias).
    host: SITE_URL,
  };
}
