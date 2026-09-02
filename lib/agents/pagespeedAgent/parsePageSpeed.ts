import type { PageSpeedResult, ImageDetail, VideoDetail } from './types';

// Lighthouse migrated many audits to new "-insight" IDs at some point (the
// old flat IDs return nothing, silently, in current API responses — this
// was discovered 2026-08-08 after 8 checks had been defaulting to false
// "all clear" results on every audit). Every ID this file reads from
// `audits` is checked here so a *future* Lighthouse rename shows up as a
// loud warning instead of another silent months-long lie.
const EXPECTED_AUDIT_KEYS = [
  'server-response-time', 'largest-contentful-paint', 'first-contentful-paint',
  'cumulative-layout-shift', 'total-blocking-time', 'total-byte-weight', 'network-requests',
  'render-blocking-insight', 'unused-javascript', 'unused-css-rules',
  'cache-insight', 'font-display-insight', 'image-delivery-insight',
];

export function parsePageSpeed(mobile: Record<string, unknown>, desktop: Record<string, unknown>): PageSpeedResult {
  const lhr = (mobile as { lighthouseResult?: Record<string, unknown> }).lighthouseResult;
  const audits = (lhr?.audits as Record<string, { numericValue?: number; details?: { items?: Array<Record<string, unknown>> }; title?: string; displayValue?: string }>) || {};
  const categories = (lhr?.categories as Record<string, { score?: number }>) || {};

  for (const key of EXPECTED_AUDIT_KEYS) {
    if (audits[key] === undefined) {
      console.warn(`PAGESPEED_PARSE_WARNING: expected audit "${key}" missing from Lighthouse response — Google likely renamed/removed it again. This check is silently defaulting instead of measuring anything real.`);
    }
  }

  // Real-user field data (CrUX — actual visitors on actual devices), not a
  // lab simulation. Was already being fetched (Google includes it in every
  // runPagespeed response) but only INP was ever read from it — the real
  // LCP/FCP/CLS sat unused in the same object. Only present for origins
  // with enough Chrome-user traffic to qualify; hasFieldData tells callers
  // whether to trust these or fall back to lab-only numbers.
  const crux = ((mobile as { loadingExperience?: { metrics?: Record<string, { percentile?: number }> } }).loadingExperience?.metrics) || {};
  const hasFieldData = Object.keys(crux).length > 0;
  const fieldLcp = crux['LARGEST_CONTENTFUL_PAINT_MS']?.percentile || 0;
  const fieldFcp = crux['FIRST_CONTENTFUL_PAINT_MS']?.percentile || 0;
  const fieldCls = (crux['CUMULATIVE_LAYOUT_SHIFT_SCORE']?.percentile || 0) / 100; // API returns this one as an integer percentile (e.g. 5 = 0.05), unlike the ms-based metrics

  const desktopLhr = (desktop as { lighthouseResult?: { categories?: Record<string, { score?: number }> } }).lighthouseResult;

  const mobileScore = Math.round((categories?.performance?.score || 0) * 100);
  const desktopScore = Math.round((desktopLhr?.categories?.performance?.score || 0) * 100);
  const mobileDesktopGap = desktopScore - mobileScore;

  const ttfb = audits['server-response-time']?.numericValue || 0;
  const lcp = audits['largest-contentful-paint']?.numericValue || 0;
  const fcp = audits['first-contentful-paint']?.numericValue || 0;
  const cls = audits['cumulative-layout-shift']?.numericValue || 0;
  const tbt = audits['total-blocking-time']?.numericValue || 0;
  const inp = crux['INTERACTION_TO_NEXT_PAINT']?.percentile || 0;

  const totalPageSize = audits['total-byte-weight']?.numericValue || 0;
  const totalRequests = audits['network-requests']?.details?.items?.length || 0;

  // True "under 1 second": LCP < 1000ms (metrics are in milliseconds)
  const passesOneSecond = lcp > 0 && lcp < 1000;

  // Google merged the old uses-webp-images/uses-optimized-images audits into
  // one general "image-delivery-insight" — it flags oversized, uncompressed,
  // AND wrong-format images together with a free-text reason per image, not
  // a clean isWebP boolean. Verified against a real site's live response
  // (2026-08-08): the flagged reason was oversized dimensions, not format —
  // so this is now reported as general image-delivery savings, not a
  // WebP-specific claim, to avoid asserting something the data can't back up.
  const imageDeliveryItems = audits['image-delivery-insight']?.details?.items || [];
  const allNetworkItems: Array<Record<string, unknown>> = audits['network-requests']?.details?.items || [];

  const allImageItems = allNetworkItems.filter(
    i => typeof i.url === 'string' && /\.(jpg|jpeg|png|gif|bmp|webp|avif|svg)/i.test(i.url as string)
  );

  const nonWebpImageList: ImageDetail[] = imageDeliveryItems.map((item: Record<string, unknown>) => {
    const imgUrl = (item.url as string) || '';
    const ext = imgUrl.split('.').pop()?.split('?')[0]?.toUpperCase() || 'IMG';
    const sizeKb = Math.round(Number(item.totalBytes || 0) / 1024);
    const wastedKb = Math.round(Number(item.wastedBytes || 0) / 1024);
    return { url: imgUrl, format: ext, sizeKb, estimatedWebPSavingKb: wastedKb, hasAltText: true };
  });

  const totalImages = allImageItems.length;
  const nonWebpImages = nonWebpImageList.length;
  const webpImages = totalImages - nonWebpImages;
  const estimatedWebPSavingKb = nonWebpImageList.reduce((sum, i) => sum + i.estimatedWebPSavingKb, 0);
  const imagesWebP = nonWebpImages === 0;
  // Lazy-loading detection moved to lib/agents/htmlAgent/imageVideoAudit.ts,
  // which checks the real HTML for loading="lazy" — offscreen-images (the
  // old Lighthouse audit this used to read) has no replacement, so this file
  // no longer computes it at all rather than guess at a value with nothing
  // real behind it.

  const largestImageKb = Math.round(
    Math.max(0, ...allImageItems.map(i => Number(i.transferSize) || 0)) / 1024
  );

  const rbItems = audits['render-blocking-insight']?.details?.items || [];
  const renderBlockingScripts = rbItems.length;
  const renderBlockingDetails = rbItems.map((item: Record<string, unknown>) => ({
    url: String(item.url || ''),
    savingsMs: Math.round(Number(item.wastedMs || 0)),
  }));

  const unusedJsItems = audits['unused-javascript']?.details?.items || [];
  const unusedJsKb = Math.round(
    unusedJsItems.reduce((sum: number, i: Record<string, unknown>) => sum + Number(i.wastedBytes || 0), 0) / 1024
  );
  const unusedCssItems = audits['unused-css-rules']?.details?.items || [];
  const unusedCssKb = Math.round(
    unusedCssItems.reduce((sum: number, i: Record<string, unknown>) => sum + Number(i.wastedBytes || 0), 0) / 1024
  );

  // cache-insight's items are already the flagged problem resources (not a
  // raw resource dump like the old audit), so any item present is real —
  // no arbitrary ">3" threshold needed anymore.
  const cachingItems = audits['cache-insight']?.details?.items || [];
  const noBrowserCaching = cachingItems.length > 0;
  const fontItems: Array<Record<string, unknown>> = audits['font-display-insight']?.details?.items || [];
  const hasFontDisplayIssue = fontItems.length > 0;

  const scriptUrls = allNetworkItems
    .filter(i => typeof i.url === 'string' && (i.url as string).includes('.js'))
    .map(i => i.url as string);
  const hasGTMBloat = scriptUrls.some(u => u.includes('googletagmanager.com'));
  const hasRocketLoaderConflict = scriptUrls.some(u => u.includes('rocket-loader'));

  const videoUrls = allNetworkItems.filter(
    i => typeof i.url === 'string' && /\.(mp4|webm|ogg|mov)/i.test(i.url as string)
  );
  const embedUrls = allNetworkItems.filter(
    i => typeof i.url === 'string' && ((i.url as string).includes('youtube.com') || (i.url as string).includes('vimeo.com') || (i.url as string).includes('youtu.be'))
  );

  const videoDetails: VideoDetail[] = [
    ...videoUrls.map((i): VideoDetail => {
      const vUrl = i.url as string;
      const ext = vUrl.split('.').pop()?.split('?')[0]?.toUpperCase() || 'VIDEO';
      return { url: vUrl, format: ext, isAutoPlay: false, hasPoster: false, isLazyLoaded: false, isEmbed: false, embedType: '' };
    }),
    ...embedUrls.map((i): VideoDetail => {
      const vUrl = i.url as string;
      const embedType = vUrl.includes('youtube') || vUrl.includes('youtu.be') ? 'YouTube' : 'Vimeo';
      return { url: vUrl, format: 'EMBED', isAutoPlay: false, hasPoster: false, isLazyLoaded: false, isEmbed: true, embedType };
    }),
  ];

  let gapExplanation = '';
  if (mobileDesktopGap >= 30) {
    gapExplanation = `Your desktop score is ${mobileDesktopGap} points higher than mobile. This massive gap is almost always caused by large images that a desktop connection hides but a mobile 4G connection exposes, plus render-blocking scripts that fire before your page loads. Desktop browsers are faster and more forgiving — your real customers on mobile are getting the worst version of your site.`;
  } else if (mobileDesktopGap >= 15) {
    gapExplanation = `Your desktop score is ${mobileDesktopGap} points higher than mobile. This gap typically means your images aren't optimized for smaller screens and you have scripts loading before your content. Mobile users on 4G see a significantly slower experience.`;
  } else if (mobileDesktopGap >= 5) {
    gapExplanation = `Your desktop and mobile scores are reasonably close, with desktop ${mobileDesktopGap} points ahead. Some further image optimization and lazy loading would close this gap.`;
  } else {
    gapExplanation = `Your mobile and desktop scores are well-matched — good sign that your site is consistently optimized across devices.`;
  }

  // uses-text-compression and offscreen-images have no replacement audit at
  // all in current Lighthouse responses (verified 2026-08-08) — omitted
  // rather than left silently referencing a dead key.
  const opportunities = [
    audits['image-delivery-insight'],
    audits['render-blocking-insight'],
    audits['unused-javascript'],
    audits['unused-css-rules'],
    audits['cache-insight'],
    audits['font-display-insight'],
  ]
    .filter((a): a is { numericValue?: number; title?: string; displayValue?: string } => !!a && (a.numericValue || 0) > 200)
    .map(a => ({ title: a.title || '', savings: a.displayValue || '', savingsMs: Math.round(a.numericValue || 0) }))
    .sort((a, b) => (b.savingsMs || 0) - (a.savingsMs || 0))
    .slice(0, 8);

  // image-alt is an accessibility-category audit, and this request only ever
  // asks for category=performance (fetchPageSpeed.ts sends no category
  // param, which defaults to performance-only) — this key is never present
  // in the response, not renamed, a genuinely separate gap from the
  // insight-ID migration fixed above. Known open issue, not fixed here.
  const altItems = audits['image-alt']?.details?.items || [];
  const imagesMissingAltText = altItems.length;

  return {
    pageSpeedStatus: 'OK',
    mobileScore, desktopScore, mobileDesktopGap, gapExplanation,
    ttfb: Math.round(ttfb), lcp: Math.round(lcp), fcp: Math.round(fcp),
    cls: Math.round(cls * 1000) / 1000, inp: Math.round(inp), tbt: Math.round(tbt),
    hasFieldData, fieldLcp: Math.round(fieldLcp), fieldFcp: Math.round(fieldFcp),
    fieldCls: Math.round(fieldCls * 1000) / 1000,
    totalPageSize: Math.round(totalPageSize / 1024), totalRequests, passesOneSecond,
    imagesWebP, largestImageKb, totalImages, webpImages, nonWebpImages,
    nonWebpImageList, estimatedWebPSavingKb, imagesMissingAltText,
    totalVideos: videoDetails.length, videoDetails,
    hasAutoPlayVideo: false, hasAboveFoldEmbed: embedUrls.length > 0,
    renderBlockingScripts, renderBlockingDetails, unusedJsKb, unusedCssKb,
    noBrowserCaching, hasFontDisplayIssue, hasGTMBloat, hasRocketLoaderConflict,
    opportunities, raw: mobile,
  };
}
