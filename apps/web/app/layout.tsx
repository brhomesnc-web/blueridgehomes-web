import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import Footer from "@/components/site/Footer";
import Header from "@/components/site/Header";
import "./globals.css";

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Blue Ridge Homes | Custom Home Builder & Remodeling in Asheville, NC",
    template: "%s | Blue Ridge Homes - Asheville, NC",
  },
  description:
    "Blue Ridge Homes is Asheville's premier custom home builder and remodeling contractor. 30+ years of experience building custom homes in Western North Carolina. NC License #56328.",
  keywords: [
    "custom home builder Asheville NC",
    "home remodeling Western North Carolina",
    "luxury home builder Blue Ridge Mountains",
    "residential general contractor Asheville",
    "custom homes WNC",
    "Asheville home builder",
    "Western NC contractor",
  ],
  openGraph: {
    title: "Blue Ridge Homes | Custom Home Builder in Asheville, NC",
    description:
      "Modern Mountain Living, Built with Integrity. Custom homes and remodels in Western North Carolina.",
    type: "website",
    locale: "en_US",
    siteName: "Blue Ridge Homes",
  },
  robots: { index: true, follow: true },
  other: {
    "geo.region": "US-NC",
    "geo.placename": "Asheville",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${cormorantGaramond.variable} ${inter.variable} font-sans antialiased`}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
