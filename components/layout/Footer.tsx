import Link from "next/link";

export default function Footer() {
  return (
    <footer>
      <div className="fcols">
        <div className="fcol fabout">
          <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 16 }}>
            <div className="brandmark" style={{ width: 28, height: 28 }}>
              UFT
            </div>
            <span style={{ font: "600 16px var(--font-barlow-condensed),'Barlow Condensed',sans-serif", letterSpacing: ".1em" }}>
              UFTECH.AI
            </span>
          </div>
          <p>
            Unitforce Technologies — custom AI agents, copilots, GenAI, automation and enterprise
            products, serving clients across India, Europe, the US and the Middle East.
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <a
              className="mono"
              href="https://www.linkedin.com/company/uftjobs/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 11, padding: "6px 9px", border: "1px solid var(--line)", color: "var(--ink2)" }}
            >
              in
            </a>
            <a
              className="mono"
              href="https://x.com/uftec"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 11, padding: "6px 9px", border: "1px solid var(--line)", color: "var(--ink2)" }}
            >
              X
            </a>
            <a
              className="mono"
              href="https://www.facebook.com/uftjobs"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 11, padding: "6px 9px", border: "1px solid var(--line)", color: "var(--ink2)" }}
            >
              f
            </a>
          </div>
        </div>
        <div className="fcol">
          <h5>AI PRODUCTS</h5>
          <div className="flinks">
            <Link href="/#products">AI Talent &amp; CRM</Link>
            <Link href="/#products">AI HRMS</Link>
          </div>
          <h5 style={{ marginTop: 20 }}>AI SERVICES</h5>
          <div className="flinks">
            <Link href="/#services">Custom AI agents</Link>
            <Link href="/#services">GenAI &amp; RAG systems</Link>
            <Link href="/#services">AI copilots</Link>
            <Link href="/#services">Enterprise automation</Link>
            <Link href="/#services">Risk &amp; fraud intelligence</Link>
            <Link href="/#services">Model deployment &amp; MLOps</Link>
          </div>
        </div>
        <div className="fcol">
          <h5>INDUSTRIES</h5>
          <div className="flinks">
            <Link href="/#industries">BFSI</Link>
            <Link href="/#industries">Healthcare</Link>
            <Link href="/#industries">Manufacturing</Link>
            <Link href="/#industries">FMCG</Link>
            <Link href="/#industries">Pharmacy</Link>
            <Link href="/#industries">Education</Link>
          </div>
        </div>
        <div className="fcol">
          <h5>COMPANY</h5>
          <div className="flinks">
            <Link href="/about">About</Link>
            <Link href="/#approach">Approach</Link>
            <Link href="/#products">Products</Link>
            <Link href="/#services">Services</Link>
            <Link href="/contact">Contact</Link>
            <a href="https://uftech.com/" target="_blank" rel="noopener noreferrer">
              uftech.com ↗
            </a>
          </div>
        </div>
        <div className="fcol">
          <h5>GET IN TOUCH</h5>
          <div className="flinks">
            <a href="mailto:info@uftech.com">info@uftech.com</a>
            <a href="tel:+918951390893">+91 8951 390 893</a>
            <a href="tel:+918951003881">+91 8951 003 881</a>
            <span style={{ color: "var(--ink3)", fontSize: 14, lineHeight: 1.6 }}>
              Bengaluru · India
              <br />
              USA · Europe · Middle East
            </span>
          </div>
        </div>
      </div>
      <div className="fbase">
        <span className="mono">© 2026 Unitforce Technologies · All rights reserved</span>
        <span className="mono">Bridging business &amp; technology</span>
      </div>
    </footer>
  );
}
