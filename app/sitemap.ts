import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://pingclose.com",         lastModified: new Date(), changeFrequency: "weekly",  priority: 1.0 },
    { url: "https://pingclose.com/faq",     lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: "https://pingclose.com/pricing", lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  ];
}
