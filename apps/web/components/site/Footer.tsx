import Link from "next/link";

export default function Footer() {
  return (
    <footer className="br-footer">
      <div className="br-footer-inner">
        <div className="br-footer-brand">Blue Ridge Homes</div>

        <div className="br-footer-grid">
          <div className="br-footer-col">
            <p className="br-footer-heading">Services</p>
            <nav className="br-footer-nav">
              <Link href="/services/custom-homes">Custom Homes</Link>
              <Link href="/services/remodeling">Remodeling</Link>
              <Link href="/services/additions">Additions</Link>
              <Link href="/services/icf-construction">ICF Construction</Link>
              <Link href="/services/consulting">Consulting</Link>
            </nav>
          </div>

          <div className="br-footer-col">
            <p className="br-footer-heading">Company</p>
            <nav className="br-footer-nav">
              <Link href="/about">About</Link>
              <Link href="/portfolio">Portfolio</Link>
              <Link href="/contact">Contact</Link>
            </nav>
          </div>

          <div className="br-footer-col">
            <p className="br-footer-heading">Contact</p>
            <address className="br-footer-address">
              <a href="tel:18287122867">(828) 712-2867</a>
              <a href="mailto:brhomesnc@gmail.com">brhomesnc@gmail.com</a>
              <span>Asheville, NC</span>
              <span>NC License #56328</span>
            </address>
          </div>

          <div className="br-footer-col">
            <p className="br-footer-heading">Service Area</p>
            <div className="br-footer-areas">
              <span>Buncombe County</span>
              <span>Henderson County</span>
              <span>Haywood County</span>
            </div>
            <nav className="br-footer-nav" style={{ marginTop: 8 }}>
              <Link href="/service-areas/weaverville">Weaverville</Link>
              <Link href="/service-areas/hendersonville">Hendersonville</Link>
              <Link href="/service-areas/black-mountain">Black Mountain</Link>
              <Link href="/service-areas/mills-river">Mills River</Link>
              <Link href="/service-areas/brevard">Brevard</Link>
            </nav>
          </div>
        </div>

        <div className="br-footer-meta">
          &copy; {new Date().getFullYear()} Blue Ridge Homes &middot; Asheville, NC &middot; NC General Contractor License #56328
        </div>
      </div>
    </footer>
  );
}
