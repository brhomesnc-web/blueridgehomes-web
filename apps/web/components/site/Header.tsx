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
          <Link href="/services/custom-homes">Custom Homes</Link>
          <Link href="/services/remodeling">Remodels</Link>
          <Link href="/portfolio">Portfolio</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact Us</Link>
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
            <Link href="/services/custom-homes" onClick={() => setMenuOpen(false)}>Custom Homes</Link>
            <Link href="/services/remodeling" onClick={() => setMenuOpen(false)}>Remodels</Link>
            <Link href="/portfolio" onClick={() => setMenuOpen(false)}>Portfolio</Link>
            <Link href="/blog" onClick={() => setMenuOpen(false)}>Blog</Link>
            <Link href="/about" onClick={() => setMenuOpen(false)}>About</Link>
            <Link href="/contact" onClick={() => setMenuOpen(false)} className="br-mobile-cta">
              Contact Us
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
