import type { ReactNode } from "react";

type PageWrapperProps = {
  children: ReactNode;
  className?: string;
};

export default function PageWrapper({ children, className }: PageWrapperProps) {
  return <main className={`mx-auto max-w-6xl px-6 py-16 ${className ?? ""}`}>{children}</main>;
}
