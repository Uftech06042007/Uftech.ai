"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { FEATURED_SERVICES, SERVICES, SHORT, type FeaturedService, type ServiceItem } from "@/lib/data";
import FieldLayer from "@/components/shared/FieldLayer";
import CardVideo from "@/components/shared/CardVideo";
import { servicePath, slugForKey } from "@/lib/seo-pages";

const CardScene = dynamic(() => import("@/components/three/CardScene"), { ssr: false });

// A real screen-capture, when we have one, beats the generated 3D scene.
function ServiceVisual({ s }: { s: ServiceItem }) {
  return s.video ? <CardVideo src={s.video} zoom={s.videoZoom} /> : <CardScene kind={s.visual} />;
}

// The two named tools above the cards. Both leave the site, so both are links
// — unlike the six service cards below, which expand a detail panel in place.
function FeaturedCard({ f }: { f: FeaturedService }) {
  return (
    <a
      className="blueprint slaunch"
      href={f.href}
      target="_blank"
      rel="noopener noreferrer"
    >
      <i className="corner tl" />
      <i className="corner tr" />
      <i className="corner bl" />
      <i className="corner br" />
      <div className="mono sbadge">{f.badge}</div>
      <h4>{f.t}</h4>
      <p>{f.b}</p>
      <span className="scta mono">{f.cta} &#8599;</span>
    </a>
  );
}

export default function Services() {
  const [sel, setSel] = useState(-1);
  const sectionRef = useRef<HTMLElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  const pick = (i: number) => {
    const prev = sel;
    const next = i === -1 ? -1 : sel === i ? -1 : i;
    setSel(next);
    if (next === -1 && prev !== -1) {
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (next !== -1) {
      requestAnimationFrame(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  };

  const detailSlug = sel >= 0 ? slugForKey(SERVICES[sel].k) : undefined;

  return (
    <section id="services" ref={sectionRef}>
      <FieldLayer />
      <div className="sechead">
        <div>
          <div className="kicker">[ Services ]</div>
          <h2>AI services we deliver.</h2>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link className="btn sm" href="/services">
            All AI services
          </Link>
          <a
            className="btn sm accent"
            href="https://uftech.com/services"
            target="_blank"
            rel="noopener noreferrer"
          >
            Other services ↗
          </a>
        </div>
      </div>

      <div className="slaunchrow">
        {FEATURED_SERVICES.map((f) => (
          <FeaturedCard key={f.t} f={f} />
        ))}
      </div>

      <div className="scards">
        {SERVICES.map((c, i) => (
          <div key={c.k} className="blueprint scard" onClick={() => pick(i)}>
            <i className="corner tl" />
            <i className="corner tr" />
            <i className="corner bl" />
            <i className="corner br" />
            <div className="mono k">{c.k}</div>
            <h4>{c.t}</h4>
            <p>{SHORT[i]}</p>
          </div>
        ))}
      </div>
      {sel >= 0 && (
        <div className="blueprint sdetail pop" ref={detailRef}>
          <i className="corner tl" style={{ color: "var(--acc)" }} />
          <i className="corner tr" style={{ color: "var(--acc)" }} />
          <i className="corner bl" style={{ color: "var(--acc)" }} />
          <i className="corner br" style={{ color: "var(--acc)" }} />
          <button className="btn sm close" onClick={() => pick(-1)}>
            Close ✕
          </button>
          <div className="img artimg">
            <ServiceVisual s={SERVICES[sel]} />
          </div>
          <div className="body">
            <div className="mono k">{SERVICES[sel].k}</div>
            <h3>{SERVICES[sel].t}</h3>
            <p>{SERVICES[sel].b}</p>
            <div className="list">
              {SERVICES[sel].l.map((x) => (
                <div key={x}>
                  <span className="d">◆</span>
                  <span>{x}</span>
                </div>
              ))}
            </div>
            <div className="stats">
              <div>
                <div className="n">{SERVICES[sel].s1}</div>
                <div className="mono l">{SERVICES[sel].s1l}</div>
              </div>
              <div>
                <div className="n">{SERVICES[sel].s2}</div>
                <div className="mono l">{SERVICES[sel].s2l}</div>
              </div>
            </div>
            {/* This panel is the only place the six services' detail copy
                appears, and it is rendered client-side on click — so none of it
                reaches a crawler. The page behind this link is where that copy
                lives in the HTML, and this is the route to it from here. */}
            {detailSlug && (
              <Link className="btn sm accent sdetail-more" href={servicePath(detailSlug)}>
                Full details on {SERVICES[sel].t} →
              </Link>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
