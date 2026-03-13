import "../blog.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Expert insights on custom home building, remodeling, and construction in Western North Carolina from Blue Ridge Homes.",
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
