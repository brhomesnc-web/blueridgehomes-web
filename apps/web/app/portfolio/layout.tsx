import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Portfolio",
    template: "%s | Blue Ridge Homes",
  },
  description:
    "Browse completed projects by Blue Ridge Homes — custom homes, whole home remodels, and additions across Asheville, Weaverville, and Western North Carolina.",
};

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
