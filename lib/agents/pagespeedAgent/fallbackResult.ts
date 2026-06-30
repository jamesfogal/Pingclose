import type { PageSpeedResult, PageSpeedStatus } from './types';

// Used when PageSpeed times out or errors — lets the audit continue with every
// other agent's data intact instead of aborting the whole request.
export function buildFallbackResult(status: Exclude<PageSpeedStatus, 'OK'>): PageSpeedResult {
  return {
    pageSpeedStatus: status,
    mobileScore: 0,
    desktopScore: 0,
    ttfb: 0,
    lcp: 0,
    fcp: 0,
    cls: 0,
    inp: 0,
    tbt: 0,
    totalPageSize: 0,
    totalRequests: 0,
    passesOneSecond: false,
    imagesLazyLoaded: false,
    imagesWebP: false,
    largestImageKb: 0,
    totalImages: 0,
    webpImages: 0,
    nonWebpImages: 0,
    nonWebpImageList: [],
    estimatedWebPSavingKb: 0,
    imagesMissingAltText: 0,
    totalVideos: 0,
    videoDetails: [],
    hasAutoPlayVideo: false,
    hasAboveFoldEmbed: false,
    renderBlockingScripts: 0,
    renderBlockingDetails: [],
    unusedJsKb: 0,
    unusedCssKb: 0,
    noBrowserCaching: false,
    hasFontDisplayIssue: false,
    hasGTMBloat: false,
    hasRocketLoaderConflict: false,
    opportunities: [],
    mobileDesktopGap: 0,
    gapExplanation: status === 'PENDING'
      ? 'PageSpeed analysis is running in the background — scores will appear shortly.'
      : status === 'TIMEOUT'
      ? 'PageSpeed analysis timed out — the site may be slow to respond. Other audit data is still accurate.'
      : 'PageSpeed analysis failed — other audit data is still accurate.',
    raw: {},
  };
}
