import type { PageSpeedResult, ImageDetail, VideoDetail } from './types';

export function parsePageSpeed(mobile: Record<string, unknown>, desktop: Record<string, unknown>): PageSpeedResult {
  const lhr = (mobile as { lighthouseResult?: Record<string, unknown> }).lighthouseResult;
  const audits = (lhr?.audits as Record<string, { numericValue?: number; details?: { items?: Array<Record<string, unknown>> }; title?: string; displayValue?: string }>) || {};
  const categories = (lhr?.categories as Record<string, { score?: number }>) || {};

  const crux = ((mobile as { loadingExperience?: { metrics?: Record<string, { percentile?: number }> } }).loadingExperience?.metrics) || {};

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

  // Above-the-fold size: bytes for every resource that finished loading before
  // first paint — a standard proxy for what actually renders above the fold.
  const networkItemsForAtf: Array<Record<string, unknown>> = audits['network-requests']?.details?.items || [];
  const aboveFoldSize = networkItemsForAtf
    .filter(i => Number(i.endTime ?? i.startTime ?? Infinity) <= fcp)
    .reduce((sum, i) => sum + (Number(i.transferSize) || 0), 0);
  const belowFoldSize = Math.max(0, totalPageSize - aboveFoldSize);

  const passesOneSecond = ttfb <= 6 && fcp < 30 && lcp <= 99;

  const webpAuditItems = audits['uses-webp-images']?.details?.items || [];
  const lazyItems = audits['offscreen-images']?.details?.items || [];
  const allNetworkItems: Array<Record<string, unknown>> = audits['network-requests']?.details?.items || [];

  const allImageItems = allNetworkItems.filter(
    i => typeof i.url === 'string' && /\.(jpg|jpeg|png|gif|bmp|webp|avif|svg)/i.test(i.url as string)
  );

  const nonWebpImageList: ImageDetail[] = webpAuditItems.map((item: Record<string, unknown>) => {
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
  const imagesLazyLoaded = lazyItems.length === 0;

  const largestImageKb = Math.round(
    Math.max(0, ...allImageItems.map(i => Number(i.transferSize) || 0)) / 1024
  );

  const rbItems = audits['render-blocking-resources']?.details?.items || [];
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

  const cachingItems = audits['uses-long-cache-ttl']?.details?.items || [];
  const noBrowserCaching = cachingItems.length > 3;
  const fontItems: Array<Record<string, unknown>> = audits['font-display']?.details?.items || [];
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

  const opportunities = [
    audits['uses-optimized-images'],
    audits['uses-webp-images'],
    audits['render-blocking-resources'],
    audits['unused-javascript'],
    audits['unused-css-rules'],
    audits['uses-text-compression'],
    audits['offscreen-images'],
    audits['uses-long-cache-ttl'],
    audits['font-display'],
  ]
    .filter((a): a is { numericValue?: number; title?: string; displayValue?: string } => !!a && (a.numericValue || 0) > 200)
    .map(a => ({ title: a.title || '', savings: a.displayValue || '', savingsMs: Math.round(a.numericValue || 0) }))
    .sort((a, b) => (b.savingsMs || 0) - (a.savingsMs || 0))
    .slice(0, 8);

  const altItems = audits['image-alt']?.details?.items || [];
  const imagesMissingAltText = altItems.length;

  return {
    pageSpeedStatus: 'OK',
    mobileScore, desktopScore, mobileDesktopGap, gapExplanation,
    ttfb: Math.round(ttfb), lcp: Math.round(lcp), fcp: Math.round(fcp),
    cls: Math.round(cls * 1000) / 1000, inp: Math.round(inp), tbt: Math.round(tbt),
    totalPageSize: Math.round(totalPageSize / 1024), totalRequests, passesOneSecond,
    aboveFoldSizeKb: Math.round(aboveFoldSize / 1024),
    belowFoldSizeKb: Math.round(belowFoldSize / 1024),
    imagesLazyLoaded, imagesWebP, largestImageKb, totalImages, webpImages, nonWebpImages,
    nonWebpImageList, estimatedWebPSavingKb, imagesMissingAltText,
    totalVideos: videoDetails.length, videoDetails,
    hasAutoPlayVideo: false, hasAboveFoldEmbed: embedUrls.length > 0,
    renderBlockingScripts, renderBlockingDetails, unusedJsKb, unusedCssKb,
    noBrowserCaching, hasFontDisplayIssue, hasGTMBloat, hasRocketLoaderConflict,
    opportunities, raw: mobile,
  };
}
