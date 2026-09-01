"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/lib/ThemeContext";

const NAV_LINKS = [
  { href: "/#products", label: "Products" },
  { href: "/#services", label: "Services" },
  { href: "/#approach", label: "Approach" },
  { href: "/#industries", label: "Industries" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

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

  // The dropdown only exists below the 1000px breakpoint — if the viewport
  // grows past it (e.g. rotating a tablet) while open, close it so it can't
  // linger behind the now-visible desktop nav.
  useEffect(() => {
    if (!menuOpen) return;
    const onResize = () => {
      if (window.innerWidth >= 1000) setMenuOpen(false);
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
          <Link key={l.href} href={l.href}>
            {l.label}
          </Link>
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
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
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
