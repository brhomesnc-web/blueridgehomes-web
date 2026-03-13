import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Blue Ridge Homes | Start Your Project in Asheville, NC",
  description:
    "Contact Blue Ridge Homes to start your custom home, remodel, or addition in Asheville and Western NC. Call (828) 712-2867 or fill out our contact form.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
