"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/lib/ThemeContext";

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const [hidden, setHidden] = useState(false);
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

  return (
    <header className={`nav${hidden ? " nav-hidden" : ""}`}>
      <Link href="/" className="brandlink" aria-label="UFTECH.AI home">
        <div className="brand">
          <div className="brandmark">UFT</div>
          <div>
            <div className="brandname">UFTECH.AI</div>
            <div className="mono brandtag">Applied AI division</div>
          </div>
        </div>
      </Link>
      <nav className="links">
        <Link href="/#products">Products</Link>
        <Link href="/#services">Services</Link>
        <Link href="/#approach">Approach</Link>
        <Link href="/#industries">Industries</Link>
        <Link href="/about">About</Link>
        <Link href="/contact">Contact</Link>
      </nav>
      <div className="navright">
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
    </header>
  );
}
