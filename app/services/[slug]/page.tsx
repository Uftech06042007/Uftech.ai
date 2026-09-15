import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import JsonLd from "@/components/shared/JsonLd";
import { faqSchema, serviceSchema } from "@/lib/schema";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import { SERVICE_ENTRIES, serviceBySlug, servicePath } from "@/lib/seo-pages";

/**
 * One indexable URL per service.
 *
 * The homepage names all six and expands the detail in a client-side panel, so
 * that copy is never in the HTML a crawler receives — and a page covering six
 * subjects competes for none of them. These pages carry the long-form answer
 * for a single query each, and the homepage cards link down into them.
 */

type Params = { params: Promise<{ slug: string }> };

/* Prerendered at build time — six known slugs, no reason to render on demand. */
export function generateStaticParams() {
  return SERVICE_ENTRIES.map((e) => ({ slug: e.page.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const entry = serviceBySlug(slug);
  if (!entry) return {};

  return pageMetadata({
    title: entry.page.title,
    description: entry.page.description,
    path: servicePath(slug),
    // This route generates its own card (opengraph-image.tsx alongside this
    // file), named here because pageMetadata would otherwise fall back to the
    // site-wide one and every service would share a single preview.
    image: `${absoluteUrl(servicePath(slug))}/opengraph-image`,
  });
}

export default async function ServiceDetailPage({ params }: Params) {
  const { slug } = await params;
  const entry = serviceBySlug(slug);
  if (!entry) notFound();

  const { page, item } = entry;
  const path = servicePath(slug);
  const others = SERVICE_ENTRIES.filter((e) => e.page.slug !== slug);

  return (
    <>
      <Header />
      <Breadcrumbs
        crumbs={[
          { name: "Home", path: "/" },
          { name: "AI services", path: "/services" },
          { name: item.t, path },
        ]}
      />

      <section id="detail-hero">
        <div className="kicker">[ {item.k} ]</div>
        <h1>{page.h1}</h1>
        <p className="lede">{page.lede}</p>
        <div className="herobtns">
          <Link className="btn primary" href="/contact">
            Bring us a problem →
          </Link>
          <Link className="btn" href="/services">
            All AI services
          </Link>
        </div>
      </section>

      {/* The two measures from lib/data.ts, so the page states the same
          numbers as the card that links to it. */}
      <section>
        <div className="statband blueprint duo">
          <i className="corner tl" />
          <i className="corner tr" />
          <i className="corner bl" />
          <i className="corner br" />
          <div className="stat">
            <div className="n">{item.s1}</div>
            <div className="mono l">{item.s1l}</div>
          </div>
          <div className="stat">
            <div className="n">{item.s2}</div>
            <div className="mono l">{item.s2l}</div>
          </div>
        </div>
      </section>

      <section>
        <div className="sechead">
          <div>
            <div className="kicker">[ Overview ]</div>
            <h2>{item.t}</h2>
          </div>
        </div>
        <div className="prose">
          <p>{item.b}</p>
        </div>
        <h3 className="kicker" style={{ margin: "36px 0 18px" }}>
          [ What it includes ]
        </h3>
        <ul className="caps">
          {item.l.map((capability) => (
            <li key={capability}>
              <span className="d" aria-hidden="true">
                ◆
              </span>
              <span>{capability}</span>
            </li>
          ))}
        </ul>
      </section>

      {page.sections.map((s) => (
        <section key={s.t}>
          <div className="prose">
            <h2>{s.t}</h2>
            {s.p.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </section>
      ))}

      <section id="faq">
        <div className="sechead">
          <div>
            <div className="kicker">[ Questions we get asked ]</div>
            <h2>{item.t}, answered.</h2>
          </div>
        </div>
        <div className="faq">
          {page.faqs.map((f) => (
            <div key={f.q}>
              <h3>{f.q}</h3>
              <p>{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="other-services">
        <div className="sechead">
          <div>
            <div className="kicker">[ Also from us ]</div>
            <h2>Other AI services.</h2>
          </div>
        </div>
        <div className="relgrid">
          {others.map((o) => (
            <Link key={o.page.slug} className="blueprint relcard" href={servicePath(o.page.slug)}>
              <i className="corner tl" />
              <i className="corner tr" />
              <i className="corner bl" />
              <i className="corner br" />
              <div className="mono k">{o.item.k}</div>
              <h3>{o.item.t}</h3>
              <p>{o.page.lede}</p>
            </Link>
          ))}
        </div>
      </section>

      <Footer />

      <JsonLd data={serviceSchema(item, path)} />
      <JsonLd data={faqSchema(page.faqs)} />
    </>
  );
}
