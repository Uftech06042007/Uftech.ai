import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import JsonLd from "@/components/shared/JsonLd";
import { INDUSTRIES, STAGES } from "@/lib/data";
import { itemListSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";
import { SERVICE_ENTRIES, servicePath } from "@/lib/seo-pages";

/**
 * The hub the six service pages hang off. It exists for two reasons: a visitor
 * arriving on one service page needs somewhere to see the full range, and a
 * crawler needs a single page that links to all six with descriptive anchor
 * text — which the homepage's click-to-expand cards cannot provide.
 */

export const metadata: Metadata = pageMetadata({
  title: "AI Services — Agents, Copilots, RAG & Automation",
  description:
    "Enterprise AI services from UFTECH.AI: custom AI agents, GenAI and RAG systems, AI copilots, intelligent process automation, fraud and credit risk models, and MLOps.",
  path: "/services",
});

export default function ServicesIndexPage() {
  return (
    <>
      <Header />
      <Breadcrumbs
        crumbs={[
          { name: "Home", path: "/" },
          { name: "AI services", path: "/services" },
        ]}
      />

      <section id="detail-hero">
        <div className="kicker">[ Services ]</div>
        <h1>Enterprise AI services.</h1>
        <p className="lede">
          Six things we build, all of them meant to reach production. Every one starts with a real
          workflow and a number you want moved, not a technology you have been told to adopt.
        </p>
        <div className="herobtns">
          <Link className="btn primary" href="/contact">
            Bring us a problem →
          </Link>
          <Link className="btn" href="/products">
            See the products
          </Link>
        </div>
      </section>

      <section id="services-list">
        <div className="sechead">
          <div>
            <div className="kicker">[ What we build ]</div>
            <h2>AI services we deliver.</h2>
          </div>
        </div>
        <div className="scards">
          {SERVICE_ENTRIES.map(({ page, item }) => (
            <Link key={page.slug} className="blueprint scard" href={servicePath(page.slug)}>
              <i className="corner tl" />
              <i className="corner tr" />
              <i className="corner bl" />
              <i className="corner br" />
              <div className="mono k">{item.k}</div>
              <h3>{item.t}</h3>
              <p>{page.lede}</p>
              <span className="mono more">Read more ↗</span>
            </Link>
          ))}
        </div>
      </section>

      <section id="how">
        <div className="sechead">
          <div>
            <div className="kicker">[ How we work ]</div>
            <h2>Five stages, in order.</h2>
            <p className="sub">
              The same sequence whichever service you engage us for — so you always know which
              stage you are in and what the next one has to prove.
            </p>
          </div>
        </div>
        <div className="infogrid flow">
          {STAGES.map((s) => (
            <div key={s.num} className="blueprint infocard">
              <i className="corner tl" />
              <i className="corner tr" />
              <i className="corner bl" />
              <i className="corner br" />
              <div className="mono k">{s.num}</div>
              <h3>{s.t}</h3>
              <p>{s.b}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="industries-served">
        <div className="sechead">
          <div>
            <div className="kicker">[ Industries ]</div>
            <h2>Sectors where our AI already runs.</h2>
          </div>
        </div>
        <div className="chips">
          {INDUSTRIES.map((i) => (
            <span className="chip" key={i}>
              {i}
            </span>
          ))}
        </div>
      </section>

      <Footer />

      <JsonLd
        data={itemListSchema(
          "Enterprise AI services",
          SERVICE_ENTRIES.map(({ page, item }) => ({
            name: item.t,
            path: servicePath(page.slug),
          })),
        )}
      />
    </>
  );
}
