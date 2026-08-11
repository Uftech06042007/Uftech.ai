import { PRODUCTS, SERVICES } from "@/lib/data";

export default function StatBand() {
  return (
    <div className="statband blueprint">
      <i className="corner tl" />
      <i className="corner tr" />
      <i className="corner bl" />
      <i className="corner br" />
      <div className="stat">
        <div className="n">
          500<span>+</span>
        </div>
        <div className="mono l">Global AI professionals</div>
      </div>
      <div className="stat">
        <div className="n">8</div>
        <div className="mono l">Industries served</div>
      </div>
      <div className="stat">
        <div className="n">{PRODUCTS.length}</div>
        <div className="mono l">Enterprise AI products</div>
      </div>
      <div className="stat">
        <div className="n">{SERVICES.length}</div>
        <div className="mono l">AI solution areas</div>
      </div>
    </div>
  );
}
