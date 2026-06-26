export interface ImageDetail {
  url: string;
  format: string;
  sizeKb: number;
  estimatedWebPSavingKb: number;
  hasAltText: boolean;
}

export interface VideoDetail {
  url: string;
  format: string;
  isAutoPlay: boolean;
  hasPoster: boolean;
  isLazyLoaded: boolean;
  isEmbed: boolean;
  embedType: string;
}

export type PageSpeedStatus = 'OK' | 'TIMEOUT' | 'ERROR';

export interface PageSpeedResult {
  pageSpeedStatus: PageSpeedStatus;
  mobileScore: number;
  desktopScore: number;
  ttfb: number;
  lcp: number;
  fcp: number;
  cls: number;
  inp: number;
  tbt: number;
  totalPageSize: number;
  totalRequests: number;
  passesOneSecond: boolean;

  imagesLazyLoaded: boolean;
  imagesWebP: boolean;
  largestImageKb: number;
  totalImages: number;
  webpImages: number;
  nonWebpImages: number;
  nonWebpImageList: ImageDetail[];
  estimatedWebPSavingKb: number;
  imagesMissingAltText: number;

  totalVideos: number;
  videoDetails: VideoDetail[];
  hasAutoPlayVideo: boolean;
  hasAboveFoldEmbed: boolean;

  renderBlockingScripts: number;
  renderBlockingDetails: Array<{ url: string; savingsMs: number }>;
  unusedJsKb: number;
  unusedCssKb: number;
  noBrowserCaching: boolean;
  hasFontDisplayIssue: boolean;
  hasGTMBloat: boolean;
  hasRocketLoaderConflict: boolean;

  opportunities: Array<{ title: string; savings: string; savingsMs?: number }>;

  mobileDesktopGap: number;
  gapExplanation: string;

  raw: Record<string, unknown>;
}

// Standardized response envelope — every caller checks `.ok` first, never throws past this boundary
export type PageSpeedAgentResponse =
  | { ok: true; data: PageSpeedResult }
  | { ok: false; error: string; quotaExceeded: boolean; status?: number };
