"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AgentStatusChip from "./_components/AgentStatusChip";

// First real admin sidebar nav (none existed before — recon §2). Scoped to the
// /admin/marketing subtree only; other admin pages are untouched (SiteShell
// already strips public chrome under /admin). Inherits the middleware.ts gate.

type NavItem = { label: string; href: string; icon: string; badge?: "pending" };

const NAV: NavItem[] = [
  { label: "Overview", href: "/admin/marketing", icon: "grid" },
  { label: "Approvals", href: "/admin/marketing/queue", icon: "check", badge: "pending" },
  { label: "Leads", href: "/admin/marketing/leads", icon: "users" },
  { label: "Content", href: "/admin/marketing/content", icon: "doc" },
  { label: "Social", href: "/admin/marketing/social", icon: "share" },
  { label: "Ads", href: "/admin/marketing/ads", icon: "target" },
  { label: "Email", href: "/admin/marketing/email", icon: "mail" },
  { label: "Reviews", href: "/admin/marketing/reviews", icon: "star" },
  { label: "Analytics", href: "/admin/marketing/analytics", icon: "chart" },
  { label: "Market Data", href: "/admin/marketing/market-data", icon: "globe" },
  { label: "Assets", href: "/admin/marketing/assets", icon: "image" },
];

// Minimal feather-style stroke icons.
const PATHS: Record<string, React.ReactNode> = {
  grid: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></>,
  check: <><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></>,
  users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /></>,
  doc: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M8 13h8M8 17h8" /></>,
  share: <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" /></>,
  target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
  mail: <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 6l-10 7L2 6" /></>,
  star: <><path d="M12 2l3 6.5 7 .9-5 4.8 1.3 7L12 18l-6.3 3.2L7 14.2 2 9.4l7-.9z" /></>,
  chart: <><path d="M3 3v18h18" /><path d="M7 15l4-5 3 3 4-6" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" /></>,
  image: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></>,
};

function Icon({ name }: { name: string }) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      {PATHS[name]}
    </svg>
  );
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<number | null>(null);

  // Pending-approvals badge count. Tolerates the approval_queue table not yet
  // existing on the VPS (API returns 0 in that case).
  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const res = await fetch("/api/admin/marketing/queue?count=1");
        if (res.ok && alive) {
          const d = await res.json();
          setPending(d?.counts?.pending ?? 0);
        }
      } catch {
        /* ignore */
      }
    }
    load();
    const t = setInterval(load, 30000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [pathname]);

  function isActive(href: string) {
    if (href === "/admin/marketing") return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="px-4 pb-4 pt-5">
        <Link
          href="/admin"
          className="text-[12px] font-medium text-[var(--br-text-soft)] transition-colors hover:text-[var(--br-text)]"
        >
          ← Dashboard
        </Link>
        <div className="mt-2 font-serif text-[22px] leading-none text-[var(--br-text)]">
          Marketing
        </div>
        <div className="mt-1 text-[11px] uppercase tracking-[0.12em] text-[var(--br-text-muted)]">
          Blue Ridge Homes
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2.5">
        {NAV.map((item) => {
          const active = isActive(item.href);
          const showBadge = item.badge === "pending" && pending != null && pending > 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={
                "mb-0.5 flex items-center gap-2.5 rounded-md px-3 py-2 text-[13.5px] font-medium transition-colors " +
                (active
                  ? "bg-[var(--br-text)] text-white"
                  : "text-[var(--br-text-mid)] hover:bg-white/70")
              }
            >
              <span className={active ? "text-[var(--br-gold-light)]" : "text-[var(--br-text-soft)]"}>
                <Icon name={item.icon} />
              </span>
              <span className="flex-1">{item.label}</span>
              {showBadge ? (
                <span className="inline-flex min-w-[20px] items-center justify-center rounded-full bg-[var(--br-gold)] px-1.5 text-[11px] font-bold text-white">
                  {pending}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* Footer: agent status + kill-switch */}
      <div className="p-3">
        <AgentStatusChip />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen md:flex">
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-[var(--br-line)] bg-[var(--br-cream)] px-4 py-3 md:hidden">
        <button
          aria-label="Toggle navigation"
          onClick={() => setOpen((o) => !o)}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--br-line)] bg-white"
        >
          <span className="block h-[2px] w-4 bg-[var(--br-text)] shadow-[0_5px_0_var(--br-text),0_-5px_0_var(--br-text)]" />
        </button>
        <span className="font-serif text-lg text-[var(--br-text)]">Marketing</span>
        <span className="w-9" />
      </div>

      {/* Sidebar — desktop sticky, mobile slide-over */}
      <aside className="sticky top-0 hidden h-screen w-[236px] shrink-0 border-r border-[var(--br-line)] bg-[var(--br-cream)] md:block">
        {sidebar}
      </aside>

      {open ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-[236px] border-r border-[var(--br-line)] bg-[var(--br-cream)] shadow-xl">
            {sidebar}
          </aside>
        </div>
      ) : null}

      {/* Main */}
      <main className="min-w-0 flex-1 px-5 py-6 md:px-8 md:py-8">{children}</main>
    </div>
  );
}
