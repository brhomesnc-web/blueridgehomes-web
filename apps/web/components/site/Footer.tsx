export default function Footer() {
  return (
    <footer className="br-footer">
      <div className="br-footer-inner">
        <div className="br-footer-brand">Blue Ridge Homes</div>
        <div className="br-footer-meta">
          &copy; {new Date().getFullYear()} Blue Ridge Homes &middot; Asheville, NC
        </div>
      </div>
    </footer>
  );
}
