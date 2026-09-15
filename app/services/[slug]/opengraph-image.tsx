import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from "@/lib/og-card";
import { SERVICE_ENTRIES, serviceBySlug } from "@/lib/seo-pages";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "UFTECH.AI — enterprise AI service";

export function generateStaticParams() {
  return SERVICE_ENTRIES.map((e) => ({ slug: e.page.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = serviceBySlug(slug);
  return ogCard({ eyebrow: "AI service", title: entry?.page.h1 ?? "Enterprise AI" });
}
