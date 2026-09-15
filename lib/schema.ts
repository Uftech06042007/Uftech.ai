import { ABOUT_STATS, INDUSTRIES, type ProductItem, type ServiceItem } from "@/lib/data";
import { absoluteUrl, ORG, SITE_NAME, SITE_URL } from "@/lib/seo";

/**
 * Schema.org JSON-LD, built from lib/data.ts and lib/seo.ts for the same reason
 * the chatbot prompt is: the structured data a crawler reads and the copy a
 * visitor reads must describe the same company. A page that claims six services
 * in markup and five in JSON-LD is a mismatch search engines discount.
 *
 * Every node carries a stable `@id` so nodes can reference each other instead
 * of repeating themselves — one Organization, linked from every page, is what
 * lets a crawler consolidate the site into a single entity.
 */

/* Stable identifiers. Fragments, not real URLs — they name nodes, not pages. */
export const ORG_ID = `${SITE_URL}/#organization`;
export const SITE_ID = `${SITE_URL}/#website`;

type Json = Record<string, unknown>;

export function organizationSchema(): Json {
  return {
    "@type": "ProfessionalService",
    "@id": ORG_ID,
    name: ORG.name,
    legalName: ORG.legalName,
    url: SITE_URL,
    logo: { "@type": "ImageObject", url: absoluteUrl("/images/uft-logo.png") },
    image: absoluteUrl("/opengraph-image"),
    description:
      "Enterprise AI company building custom AI agents, copilots, GenAI and RAG systems, intelligent automation and MLOps for organisations in BFSI, healthcare, manufacturing and more.",
    foundingDate: ORG.foundingYear,
    email: ORG.email,
    telephone: ORG.phones[0],
    address: {
      "@type": "PostalAddress",
      addressLocality: ORG.addressLocality,
      addressRegion: ORG.addressRegion,
      addressCountry: ORG.addressCountry,
    },
    areaServed: ORG.areasServed.map((name) => ({ "@type": "Country", name })),
    knowsAbout: INDUSTRIES,
    numberOfEmployees: {
      "@type": "QuantitativeValue",
      value: Number(ABOUT_STATS[0].n.replace(/\D/g, "")) || undefined,
    },
    hasCredential: {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "certification",
      name: "ISO 9001:2015",
    },
    contactPoint: ORG.phones.map((telephone) => ({
      "@type": "ContactPoint",
      telephone,
      email: ORG.email,
      contactType: "sales",
      areaServed: ORG.addressCountry,
      availableLanguage: ["English"],
    })),
    sameAs: [...ORG.sameAs],
  };
}

export function websiteSchema(): Json {
  return {
    "@type": "WebSite",
    "@id": SITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    publisher: { "@id": ORG_ID },
    inLanguage: "en",
  };
}

/** The site-wide graph, emitted once in the root layout. */
export function siteGraph(): Json {
  return { "@context": "https://schema.org", "@graph": [organizationSchema(), websiteSchema()] };
}

export interface Crumb {
  name: string;
  path: string;
}

export function breadcrumbSchema(crumbs: Crumb[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

export function serviceSchema(s: ServiceItem, path: string): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${absoluteUrl(path)}#service`,
    name: s.t,
    serviceType: s.t,
    description: s.b,
    url: absoluteUrl(path),
    provider: { "@id": ORG_ID },
    areaServed: ORG.areasServed.map((name) => ({ "@type": "Country", name })),
    audience: { "@type": "BusinessAudience", name: "Enterprises" },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `${s.t} capabilities`,
      itemListElement: s.l.map((capability) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: capability },
      })),
    },
  };
}

export function productSchema(p: ProductItem, path: string): Json {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${absoluteUrl(path)}#product`,
    name: p.t,
    description: p.short,
    url: absoluteUrl(path),
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    featureList: p.feats.map((f) => `${f.t} — ${f.d}`),
    keywords: p.chips.join(", "),
    publisher: { "@id": ORG_ID },
    // No `offers` node: pricing is quoted per engagement, and inventing a
    // price here would be a commercial claim the site does not make anywhere.
  };
}

export interface Faq {
  q: string;
  a: string;
}

export function faqSchema(faqs: readonly Faq[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/** Hub pages: tells a crawler the set is a set, and in what order. */
export function itemListSchema(name: string, items: { name: string; path: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      url: absoluteUrl(it.path),
    })),
  };
}
