import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import JsonLd from "@/components/shared/JsonLd";
import { itemListSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";
import { PRODUCT_ENTRIES, productPath } from "@/lib/seo-pages";

/**
 * Hub for the three products. Same reasoning as the services hub: descriptive
 * links to every product page from one place, and somewhere for a visitor who
 * landed on one product to find the rest.
 */

export const metadata: Metadata = pageMetadata({
  title: "AI Products — Talent, HRMS & Finance Automation",
  description:
    "Three AI products built by UFTECH.AI: AI Talent & CRM for hiring and pipeline, AI HRMS & Compliance for the employee lifecycle and statutory filing, and an AI Finance Bot for Procure-to-Pay.",
  path: "/products",
});

export default function ProductsIndexPage() {
  return (
    <>
      <Header />
      <Breadcrumbs
        crumbs={[
          { name: "Home", path: "/" },
          { name: "AI products", path: "/products" },
        ]}
      />

      <section id="detail-hero">
        <div className="kicker">[ Products ]</div>
        <h1>Our AI product suite.</h1>
        <p className="lede">
          Three products we build and run ourselves, each aimed at a function where the manual
          version of the job is well understood and expensive.
        </p>
        <div className="herobtns">
          <Link className="btn primary" href="/contact">
            Book a walkthrough →
          </Link>
          <Link className="btn" href="/services">
            See the services
          </Link>
        </div>
      </section>

      <section id="products-list">
        <div className="sechead">
          <div>
            <div className="kicker">[ What we ship ]</div>
            <h2>Built, deployed and supported by us.</h2>
          </div>
        </div>
        <div className="relgrid">
          {PRODUCT_ENTRIES.map(({ page, item }) => (
            <Link key={page.slug} className="blueprint relcard" href={productPath(page.slug)}>
              <i className="corner tl" />
              <i className="corner tr" />
              <i className="corner bl" />
              <i className="corner br" />
              <div className="mono k">{item.tag}</div>
              <h3>{item.t}</h3>
              <p>{page.lede}</p>
              <span className="mono more">Read more ↗</span>
            </Link>
          ))}
        </div>
      </section>

      <section id="ownership">
        <div className="sechead">
          <div>
            <div className="kicker">[ Ownership ]</div>
            <h2>Not a subscription. Yours.</h2>
            <p className="sub">
              Each product is deployed into infrastructure you control and shaped to how your
              organisation actually works, rather than rented back to you a seat at a time.
            </p>
          </div>
        </div>
      </section>

      <Footer />

      <JsonLd
        data={itemListSchema(
          "AI products",
          PRODUCT_ENTRIES.map(({ page, item }) => ({
            name: item.t,
            path: productPath(page.slug),
          })),
        )}
      />
    </>
  );
}
