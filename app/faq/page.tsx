import type { Metadata } from "next";
import FaqClient from "./FaqClient";

export const metadata: Metadata = {
  title: "Website Speed FAQ — Common Questions About Page Load Time",
  description: "Answers to the most common questions about website speed, Core Web Vitals, above-the-fold load time, and what a 1-second load time means for your local business.",
  alternates: { canonical: "https://pingclose.com/faq" },
  openGraph: {
    title: "Website Speed FAQ | PingClose",
    description: "Common questions about website speed, Core Web Vitals, and what a 1-second load time means for your local business.",
    url: "https://pingclose.com/faq",
  },
};

export default function Page() {
  return <FaqClient />;
}
