import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import JsonLd from "@/components/shared/JsonLd";
import { faqSchema, productSchema } from "@/lib/schema";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import { PRODUCT_ENTRIES, productBySlug, productPath } from "@/lib/seo-pages";

/**
 * One indexable URL per product. Unlike the services, the homepage does render
 * product copy server-side — but all three share a single page, so a search for
 * any one of them competes against the other two on the same URL. These pages
 * give each product its own title, its own H1 and its own SoftwareApplication
 * markup.
 */

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return PRODUCT_ENTRIES.map((e) => ({ slug: e.page.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const entry = productBySlug(slug);
  if (!entry) return {};

  return pageMetadata({
    title: entry.page.title,
    description: entry.page.description,
    path: productPath(slug),
    // This route generates its own card (opengraph-image.tsx alongside this
    // file), named here because pageMetadata would otherwise fall back to the
    // site-wide one and every product would share a single preview.
    image: `${absoluteUrl(productPath(slug))}/opengraph-image`,
  });
}

export default async function ProductDetailPage({ params }: Params) {
  const { slug } = await params;
  const entry = productBySlug(slug);
  if (!entry) notFound();

  const { page, item } = entry;
  const path = productPath(slug);
  const others = PRODUCT_ENTRIES.filter((e) => e.page.slug !== slug);

  return (
    <>
      <Header />
      <Breadcrumbs
        crumbs={[
          { name: "Home", path: "/" },
          { name: "AI products", path: "/products" },
          { name: item.t, path },
        ]}
      />

      <section id="detail-hero">
        <div className="kicker">[ {item.tag} ]</div>
        <h1>{page.h1}</h1>
        <p className="lede">{page.lede}</p>
        <div className="herobtns">
          <Link className="btn primary" href="/contact">
            Book a walkthrough →
          </Link>
          <Link className="btn" href="/products">
            All AI products
          </Link>
        </div>
      </section>

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
          <p>{item.short}</p>
        </div>
        <div className="chips" style={{ marginTop: 28 }}>
          {item.chips.map((c) => (
            <span className="chip" key={c}>
              {c}
            </span>
          ))}
        </div>
      </section>

      <section id="features">
        <div className="sechead">
          <div>
            <div className="kicker">[ What it does ]</div>
            <h2>Inside {item.t}.</h2>
          </div>
        </div>
        <div className="infogrid">
          {item.feats.map((f) => (
            <div key={f.t} className="blueprint infocard">
              <i className="corner tl" />
              <i className="corner tr" />
              <i className="corner bl" />
              <i className="corner br" />
              <h3>{f.t}</h3>
              <p>{f.d}</p>
            </div>
          ))}
        </div>
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

      <section id="other-products">
        <div className="sechead">
          <div>
            <div className="kicker">[ Also from us ]</div>
            <h2>Other AI products.</h2>
          </div>
        </div>
        <div className="relgrid">
          {others.map((o) => (
            <Link key={o.page.slug} className="blueprint relcard" href={productPath(o.page.slug)}>
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

      <JsonLd data={productSchema(item, path)} />
      <JsonLd data={faqSchema(page.faqs)} />
    </>
  );
}
