"use client";

import Link from "next/link";
import { useTheme } from "@/lib/ThemeContext";
import {
  PRODUCT_ENTRIES,
  productPath,
  SERVICE_ENTRIES,
  servicePath,
} from "@/lib/seo-pages";

const LINKEDIN_PATH =
  "M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.61 0 4.28 2.38 4.28 5.47v6.27zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45z";
const X_PATH =
  "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z";
const FACEBOOK_PATH =
  "M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.892h-2.33v6.987C18.343 21.128 22 16.991 22 12z";

export default function Footer() {
  const { theme } = useTheme();

  return (
    <footer>
      <div className="fcols">
        <div className="fcol fabout">
          <Link
            href="/"
            className="brandlink fbrand"
            aria-label="UFTECH.AI home"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- the source
                artwork must render pixel-exact, with no resize/format pass */}
            <img
              src={theme === "day" ? "/images/uft-logo.png" : "/images/uft-logo-dark.png"}
              alt="UFT — Unitforce Technologies Consulting Pvt Ltd"
              className="brandlogo"
            />
            <div className="brandtext">
              <div>Unitforce Technologies</div>
              <div>Consulting Pvt Ltd</div>
            </div>
          </Link>
          <p>
            Unitforce Technologies — custom AI agents, copilots, GenAI, automation and enterprise
            products, serving clients across India, Europe, the US and the Middle East.
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <a
              className="fsocial"
              href="https://www.linkedin.com/company/uftjobs/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="UFTECH.AI on LinkedIn"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d={LINKEDIN_PATH} />
              </svg>
            </a>
            <a
              className="fsocial"
              href="https://x.com/uftec"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="UFTECH.AI on X"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d={X_PATH} />
              </svg>
            </a>
            <a
              className="fsocial"
              href="https://www.facebook.com/uftjobs"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="UFTECH.AI on Facebook"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d={FACEBOOK_PATH} />
              </svg>
            </a>
          </div>
        </div>
        {/* Every product and service points at its own page rather than at a
            homepage anchor. Three reasons: the anchor was the same URL nine
            times over, so it passed no signal about any individual offering;
            the footer is on every page, which makes each detail page one hop
            from anywhere; and the link text now matches the page it opens.
            Generated from lib/seo-pages.ts so the list cannot fall behind. */}
        <div className="fcol">
          <h5>AI PRODUCTS</h5>
          <div className="flinks">
            {PRODUCT_ENTRIES.map(({ page, item }) => (
              <Link key={page.slug} href={productPath(page.slug)}>
                {item.t}
              </Link>
            ))}
          </div>
          <h5 style={{ marginTop: 20 }}>AI SERVICES</h5>
          <div className="flinks">
            {SERVICE_ENTRIES.map(({ page, item }) => (
              <Link key={page.slug} href={servicePath(page.slug)}>
                {item.t}
              </Link>
            ))}
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
            <Link href="/products">Products</Link>
            <Link href="/services">Services</Link>
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
