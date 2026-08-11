"use client";

import dynamic from "next/dynamic";
import { PRODUCTS, type ProductItem } from "@/lib/data";
import FieldLayer from "@/components/shared/FieldLayer";
import CardVideo from "@/components/shared/CardVideo";

const CardScene = dynamic(() => import("@/components/three/CardScene"), { ssr: false });

// A real screen-capture, when we have one, beats the generated 3D scene.
function ProductVisual({ p }: { p: ProductItem }) {
  return p.video ? <CardVideo src={p.video} /> : <CardScene kind={p.visual} />;
}

export default function Products() {
  return (
    <section id="products">
      <FieldLayer />
      <div className="sechead">
        <div>
          <div className="kicker">[ Products ]</div>
          <h2>Our AI product suite.</h2>
          <p className="sub">Not software you rent. Products you own, built to run on your own infrastructure.</p>
        </div>
      </div>

      <div className="pcards">
        {PRODUCTS.map((p) => (
          <div key={p.k} className="blueprint pcard">
            <i className="corner tl" style={{ color: "var(--acc)" }} />
            <i className="corner tr" style={{ color: "var(--acc)" }} />
            <i className="corner bl" style={{ color: "var(--acc)" }} />
            <i className="corner br" style={{ color: "var(--acc)" }} />
            <div className="mono tag">{p.tag}</div>
            <h4>{p.t}</h4>
            <p>{p.short}</p>
            <div className="pcard-visual">
              <ProductVisual p={p} />
            </div>
            <div className="pcard-feats">
              {p.feats.map((f) => (
                <div key={f.t} className="pcard-feat">
                  <span className="fdot" />
                  <b>{f.t}</b>&nbsp;- {f.d}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
