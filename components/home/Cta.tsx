export default function Cta() {
  return (
    <section className="cta" id="cta">
      <div className="ctawrap">
        <div>
          <div className="kicker">[ Next ]</div>
          <h2>Have a number you need moved? Let&apos;s read the brief.</h2>
          <p>A senior AI lead replies within one business day — not a sales sequence.</p>
        </div>
        <div style={{ display: "flex", gap: 12, flex: "none", flexWrap: "wrap" }}>
          <a className="btn primary" href="/contact">
            Start a conversation →
          </a>
        </div>
      </div>
    </section>
  );
}
