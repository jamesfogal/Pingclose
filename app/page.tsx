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

export default function Page() {
  return <HomeClient />;
}
