"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/lib/ThemeContext";

interface NavLink {
  href: string;
  label: string;
  /* Off-site. Rendered as a plain anchor with the same trailing arrow the
     header already uses for uftech.com, so it is clear the link leaves. */
  external?: boolean;
}

const NAV_LINKS: NavLink[] = [
  { href: "/#products", label: "Products" },
  { href: "/#services", label: "Services" },
  { href: "/#approach", label: "Approach" },
  { href: "/#industries", label: "Industries" },
  { href: "/about", label: "About" },
  // Hiring runs on the group's own site rather than here.
  { href: "https://uftech.in/", label: "Careers", external: true },
  { href: "/contact", label: "Contact" },
];

// One renderer for both the desktop bar and the mobile dropdown, so a link
// added to NAV_LINKS can never appear in one and not the other.
function NavItem({ link }: { link: NavLink }) {
  return link.external ? (
    <a href={link.href} target="_blank" rel="noopener noreferrer">
      {link.label} &#8599;
    </a>
  ) : (
    <Link href={link.href}>{link.label}</Link>
  );
}

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > lastY.current && y > 120);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The dropdown only exists below the header's 1200px breakpoint — if the
  // viewport grows past it (e.g. rotating a tablet) while open, close it so it
  // can't linger behind the now-visible desktop nav. Keep this in step with
  // the matching media query in globals.css.
  useEffect(() => {
    if (!menuOpen) return;
    const onResize = () => {
      if (window.innerWidth >= 1200) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [menuOpen]);

  return (
    <header className={`nav${hidden ? " nav-hidden" : ""}`}>
      <Link
        href="/"
        className="brandlink"
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
      <nav className="links">
        {NAV_LINKS.map((l) => (
          <NavItem key={l.href} link={l} />
        ))}
      </nav>
      <div className="navright">
        <div className="navright-items">
          <a className="ext" href="https://uftech.com/" target="_blank" rel="noopener noreferrer">
            uftech.com ↗
          </a>
          <button className="btn sm" onClick={toggleTheme}>
            {theme === "day" ? "Night ☾" : "Day ☼"}
          </button>
          <Link className="btn primary" href="/contact">
            Talk to us
          </Link>
        </div>
        <button
          type="button"
          className={`navburger${menuOpen ? " active" : ""}`}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
      {menuOpen && (
        <nav className="navmobile" onClick={() => setMenuOpen(false)}>
          {NAV_LINKS.map((l) => (
            <NavItem key={l.href} link={l} />
          ))}
          <a href="https://uftech.com/" target="_blank" rel="noopener noreferrer">
            uftech.com ↗
          </a>
          <div className="navmobile-actions">
            <button className="btn sm" onClick={toggleTheme}>
              {theme === "day" ? "Night ☾" : "Day ☼"}
            </button>
            <Link className="btn primary" href="/contact">
              Talk to us
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
