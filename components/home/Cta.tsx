import Link from "next/link";

export default function Cta() {
  return (
    <section className="cta" id="cta">
      <div className="ctawrap">
        <div>
          <div className="kicker">[ Next ]</div>
          <h2>Have a number you need moved? Let&apos;s read the brief.</h2>
          <p>A senior AI lead replies within one business day — not a sales sequence.</p>
        </div>
        <div className="ctabtns">
          <Link className="btn primary" href="/contact">
            Start a conversation →
          </Link>
        </div>
      </div>
    </section>
  );
}
