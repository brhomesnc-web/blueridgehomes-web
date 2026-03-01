import type { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
  maxWidthClass?: string;
};

export default function PageShell({
  children,
  maxWidthClass = "max-w-6xl",
}: PageShellProps) {
  return (
    <main className="min-h-screen bg-[#F3EFE7] text-[#1D232A]">
      <section className={`mx-auto ${maxWidthClass} px-6 py-16`}>{children}</section>
    </main>
  );
}
