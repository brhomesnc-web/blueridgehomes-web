"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="br-header">
      <div className="br-container br-header-inner">
        <Link href="/" className="br-logo" aria-label="Blue Ridge Homes home">
          <Image
            src="/brand/logo-clean.png"
            alt="Blue Ridge Homes"
            width={292}
            height={88}
            className="br-logo-img"
            sizes="(max-width: 900px) 182px, 292px"
            priority
          />
        </Link>

        <nav className="br-nav" aria-label="Primary">
          <Link href="/services">Custom Homes</Link>
          <Link href="/services">Remodeling</Link>
          <Link href="/portfolio">Portfolio</Link>
        </nav>

        <Link href="/contact" className="br-header-cta">
          Start the Conversation
        </Link>

        <button
          className="br-menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          <span className={`br-menu-icon ${menuOpen ? "br-menu-icon-open" : ""}`} />
        </button>
      </div>

      {menuOpen && (
        <div className="br-mobile-menu">
          <nav className="br-mobile-nav">
            <Link href="/services" onClick={() => setMenuOpen(false)}>Custom Homes</Link>
            <Link href="/services" onClick={() => setMenuOpen(false)}>Remodeling</Link>
            <Link href="/portfolio" onClick={() => setMenuOpen(false)}>Portfolio</Link>
            <Link href="/contact" onClick={() => setMenuOpen(false)} className="br-mobile-cta">
              Start the Conversation
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
