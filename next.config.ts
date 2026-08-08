import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Eliminates the render-blocking CSS <link> request Lighthouse flagged
  // (~150ms LCP cost) — styles arrive with the HTML instead of a second
  // network round-trip. Right fit here: Tailwind output stays small, and
  // PingClose's homepage is a cold-traffic landing page where first-visit
  // LCP matters more than returning-visitor CSS caching.
  experimental: {
    inlineCss: true,
  },
};

export default nextConfig;
