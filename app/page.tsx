import type { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "PingClose — Free Website Speed Test for Local Businesses",
  description: "Find out if your website loads in under 1 second. PingClose checks 74 signals and tells you exactly what's slowing you down — free, no account required.",
  alternates: { canonical: "https://pingclose.com" },
  openGraph: {
    title: "PingClose — Free Website Speed Test for Local Businesses",
    description: "Find out if your website loads in under 1 second. Free, no account required.",
    url: "https://pingclose.com",
  },
};

const schemaWebSite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "PingClose",
  "url": "https://pingclose.com",
};

const schemaApp = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "PingClose — Free Website Speed Test",
  "description": "Free above-the-fold website speed test for local businesses. Checks 74 performance signals including Core Web Vitals, LCP, CLS, INP, and TTFB. No account required.",
  "url": "https://pingclose.com",
  "applicationCategory": "WebApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "featureList": [
    "Above-the-fold load time measurement",
    "Core Web Vitals — LCP, CLS, INP",
    "Time to First Byte (TTFB)",
    "Mobile performance score",
    "Render-blocking script detection",
    "Pass/fail vs. 1-second benchmark"
  ]
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaWebSite) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaApp) }} />
      <HomeClient />
    </>
  );
}
