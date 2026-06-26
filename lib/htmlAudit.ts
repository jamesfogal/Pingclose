// TechStackResult is the unified shape assembled in app/api/audit/route.ts
// from the individual agents in lib/agents/.
// This file is kept as the canonical interface definition.

export interface TechStackResult {
  cms: string;
  hosting: string;
  hostingVerdict: 'dead-zone' | 'speed-limiter' | 'acceptable' | 'race-ready' | 'unknown';
  hostingVerdictLabel: string;
  hostingVerdictMessage: string;
  cdn: string;
  httpVersion: string;
  pageBuilder: string;
  ecommerce: string;
  hasWordPress: boolean;
  serverIp: string;
  signals: string[];

  // SEO Fundamentals
  hasTitle: boolean;
  titleTag: string;
  titleLength: number;
  hasMetaDescription: boolean;
  metaDescription: string;
  metaDescriptionLength: number;
  hasH1: boolean;
  h1Text: string;
  multipleH1s: boolean;
  hasCanonical: boolean;
  hasRobotsTxt: boolean;
  hasSitemap: boolean;
  isHttps: boolean;
  primaryKeyword: string;

  // Schema
  hasFAQSchema: boolean;
  hasPricingSchema: boolean;
  hasLocalBusinessSchema: boolean;
  hasReviewSchema: boolean;

  // Conversion tracking
  hasGA4: boolean;
  hasGTM: boolean;
  hasFacebookPixel: boolean;
  hasTikTokPixel: boolean;
  hasCallTracking: boolean;

  // Images / video
  imagesWithoutAlt: string[];
  hasAutoPlayVideo: boolean;
  videoHasPoster: boolean;

  // WordPress
  wordpressPluginIssues: string[];
}
