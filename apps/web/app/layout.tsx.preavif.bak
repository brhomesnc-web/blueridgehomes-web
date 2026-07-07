import type { Metadata } from "next";
import Script from "next/script";
import { Cormorant_Garamond, Inter } from "next/font/google";
import SiteShell from "@/components/site/SiteShell";
import "./globals.css";

const GA_MEASUREMENT_ID = "G-5J428WDEE8";

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
    default: "Blue Ridge Homes | Custom Home Builder in Asheville, NC",
    template: "%s | Blue Ridge Homes",
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
  metadataBase: new URL("https://blueridgehomesnc.com"),
  alternates: {
    canonical: "./",
  },
  openGraph: {
    title: "Blue Ridge Homes | Custom Home Builder in Asheville, NC",
    description:
      "Modern Mountain Living, Built with Integrity. Custom homes and remodels in Western North Carolina.",
    type: "website",
    images: ["/optimized/dividers/divider-blueridge-sunset.jpg"],
    locale: "en_US",
    siteName: "Blue Ridge Homes",
  },
  robots: { index: true, follow: true },
  other: {
    "geo.region": "US-NC",
    "geo.placename": "Asheville",
  },
};

const businessJsonLd = {
  "@context": "https://schema.org",
  "@type": ["HomeBuilder", "GeneralContractor"],
  name: "Blue Ridge Homes",
  url: "https://blueridgehomesnc.com",
  telephone: "+1-828-712-2867",
  email: "brhomesnc@gmail.com",
  description:
    "Custom home builder, remodeling contractor, and licensed general contractor serving Asheville and Western North Carolina. Over 30 years of construction experience.",
  image: "https://blueridgehomesnc.com/brand/logo-clean.png",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Asheville",
    addressRegion: "NC",
    postalCode: "28804",
    addressCountry: "US",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 35.5951,
    longitude: -82.5515,
  },
  areaServed: [
    { "@type": "AdministrativeArea", name: "Buncombe County, NC" },
    { "@type": "AdministrativeArea", name: "Henderson County, NC" },
    { "@type": "AdministrativeArea", name: "Haywood County, NC" },
    { "@type": "City", name: "Asheville, NC" },
    { "@type": "City", name: "Weaverville, NC" },
    { "@type": "City", name: "Hendersonville, NC" },
    { "@type": "City", name: "Black Mountain, NC" },
    { "@type": "City", name: "Mills River, NC" },
    { "@type": "City", name: "Brevard, NC" },
  ],
  foundingDate: "2004",
  priceRange: "$$",
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "08:00",
    closes: "17:00",
  },
  hasCredential: {
    "@type": "EducationalOccupationalCredential",
    credentialCategory: "license",
    name: "NC General Contractor License #56328",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Services",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Custom Homes",
          url: "https://blueridgehomesnc.com/services/custom-homes",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Remodeling",
          url: "https://blueridgehomesnc.com/services/remodeling",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Home Additions",
          url: "https://blueridgehomesnc.com/services/additions",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "ICF Construction",
          url: "https://blueridgehomesnc.com/services/icf-construction",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Construction Consulting",
          url: "https://blueridgehomesnc.com/services/consulting",
        },
      },
    ],
  },
  sameAs: [],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${cormorantGaramond.variable} ${inter.variable} font-sans antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(businessJsonLd) }}
        />
        <SiteShell>{children}</SiteShell>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
      </body>
    </html>
  );
}
