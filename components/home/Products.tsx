"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { PRODUCTS, type ProductItem } from "@/lib/data";
import { productPath, slugForKey } from "@/lib/seo-pages";
import FieldLayer from "@/components/shared/FieldLayer";
import CardVideo from "@/components/shared/CardVideo";
import CardEmbed from "@/components/shared/CardEmbed";

const CardScene = dynamic(() => import("@/components/three/CardScene"), { ssr: false });

// The live product beats a recording of it, and a recording beats the
// generated 3D scene.
function ProductVisual({ p }: { p: ProductItem }) {
  if (p.demo) return <CardEmbed src={p.demo} title={`${p.t} — product reel`} />;
  return p.video ? <CardVideo src={p.video} /> : <CardScene kind={p.visual} />;
}

function Corners() {
  return (
    <>
      <i className="corner tl" style={{ color: "var(--acc)" }} />
      <i className="corner tr" style={{ color: "var(--acc)" }} />
      <i className="corner bl" style={{ color: "var(--acc)" }} />
      <i className="corner br" style={{ color: "var(--acc)" }} />
    </>
  );
}

/** The wide card: visual on one side, the whole story on the other. */
function ProductPanel({ p }: { p: ProductItem }) {
  const slug = slugForKey(p.k);

  return (
    <>
      <div className="psplit-visual">
        <ProductVisual p={p} />
      </div>
      <div className="psplit-body">
        <div className="mono tag">{p.tag}</div>
        <h4>{p.t}</h4>
        <p>{p.short}</p>
        <div className="pcard-feats">
          {p.feats.map((f) => (
            <div key={f.t} className="pcard-feat">
              <span className="fdot" />
              <b>{f.t}</b>&nbsp;- {f.d}
            </div>
          ))}
        </div>
        <div className="psplit-stats">
          <div>
            <div className="n">{p.s1}</div>
            <div className="l">{p.s1l}</div>
          </div>
          <div>
            <div className="n">{p.s2}</div>
            <div className="l">{p.s2l}</div>
          </div>
        </div>
        {/* The card is the summary; the page is the subject. Without this link
            the only route to /products/* was the footer, and a visitor reading
            about a product had nowhere deeper to go. */}
        {slug && (
          <Link className="btn sm accent pcard-more" href={productPath(slug)}>
            More on {p.t} →
          </Link>
        )}
      </div>
    </>
  );
}

export default function Products() {
  return (
    <section id="products">
      <FieldLayer />
      <div className="sechead">
        <div>
          <div className="kicker">[ Products ]</div>
          <h2>Our AI product suite.</h2>
          <p className="sub">
            Not software you rent. Products you own, built to run on your own infrastructure.
          </p>
        </div>
      </div>

      <div className="pfull">
        {PRODUCTS.map((p, i) => (
          // The visual alternates sides down the column: odd rows put it on
          // the right, so the eye zig-zags instead of running down one edge.
          <article
            key={p.k}
            className={`blueprint pcard psplit${i % 2 ? " flip" : ""}${p.demo ? " pdemo" : ""}`}
          >
            <Corners />
            <ProductPanel p={p} />
          </article>
        ))}
      </div>
    </section>
  );
}
