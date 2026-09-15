import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from "@/lib/og-card";
import { PRODUCT_ENTRIES, productBySlug } from "@/lib/seo-pages";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "UFTECH.AI — enterprise AI product";

export function generateStaticParams() {
  return PRODUCT_ENTRIES.map((e) => ({ slug: e.page.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = productBySlug(slug);
  return ogCard({ eyebrow: "AI product", title: entry?.page.h1 ?? "Enterprise AI" });
}
