export interface HtmlAgentResult {
  html: string;
  headers: Record<string, string>;
  cms: string;
  cdn: string;
  httpVersion: string;
  pageBuilder: string;
  ecommerce: string;
  serverIp: string;
  signals: string[];
  isHttps: boolean;

  // SEO
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
