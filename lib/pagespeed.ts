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

export interface PageSpeedResult {
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

  // Image audit
  imagesLazyLoaded: boolean;
  imagesWebP: boolean;
  largestImageKb: number;
  totalImages: number;
  webpImages: number;
  nonWebpImages: number;
  nonWebpImageList: ImageDetail[];
  estimatedWebPSavingKb: number;
  imagesMissingAltText: number;

  // Video audit
  totalVideos: number;
  videoDetails: VideoDetail[];
  hasAutoPlayVideo: boolean;
  hasAboveFoldEmbed: boolean;

  // Script issues
  renderBlockingScripts: number;
  renderBlockingDetails: Array<{ url: string; savingsMs: number }>;
  unusedJsKb: number;
  unusedCssKb: number;
  noBrowserCaching: boolean;
  hasFontDisplayIssue: boolean;
  hasGTMBloat: boolean;
  hasRocketLoaderConflict: boolean;

  // Opportunities
  opportunities: Array<{ title: string; savings: string; savingsMs?: number }>;

  // Mobile vs Desktop gap
  mobileDesktopGap: number;
  gapExplanation: string;

  raw: Record<string, unknown>;
}

export async function runPageSpeed(url: string): Promise<PageSpeedResult> {
  try {
  const apiKey = process.env.PAGESPEED_API_KEY;
  const endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed`;

  const [mobileRes, desktopRes] = await Promise.all([
    fetch(`${endpoint}?url=${encodeURIComponent(url)}&strategy=mobile&key=${apiKey}`),
    fetch(`${endpoint}?url=${encodeURIComponent(url)}&strategy=desktop&key=${apiKey}`)
  ]);

  const [mobile, desktop] = await Promise.all([mobileRes.json(), desktopRes.json()]);

  const lhr = mobile.lighthouseResult;
  const audits = lhr?.audits || {};
  const categories = lhr?.categories || {};

  // Chrome UX Report field data (real user measurements, not lab simulation)
  const crux = mobile.loadingExperience?.metrics || {};

  const mobileScore = Math.round((categories?.performance?.score || 0) * 100);
  const desktopScore = Math.round(((desktop.lighthouseResult?.categories?.performance?.score) || 0) * 100);
  const mobileDesktopGap = desktopScore - mobileScore;

  const ttfb = audits['server-response-time']?.numericValue || 0;
  const lcp = audits['largest-contentful-paint']?.numericValue || 0;
  const fcp = audits['first-contentful-paint']?.numericValue || 0;
  const cls = audits['cumulative-layout-shift']?.numericValue || 0;
  const tbt = audits['total-blocking-time']?.numericValue || 0;
  // INP requires real user interaction — pull from Chrome UX Report field data (75th percentile)
  const inp = crux['INTERACTION_TO_NEXT_PAINT']?.percentile || 0;

  const totalPageSize = audits['total-byte-weight']?.numericValue || 0;
  const totalRequests = audits['network-requests']?.details?.items?.length || 0;

  const passesOneSecond = lcp < 2500 && fcp < 1800 && mobileScore >= 50;

  // ── Image Analysis ──────────────────────────────────────────────
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
    return {
      url: imgUrl,
      format: ext,
      sizeKb,
      estimatedWebPSavingKb: wastedKb,
      hasAltText: true // will be enriched by htmlAudit
    };
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

  // ── Render-Blocking ─────────────────────────────────────────────
  const rbItems = audits['render-blocking-resources']?.details?.items || [];
  const renderBlockingScripts = rbItems.length;
  const renderBlockingDetails = rbItems.map((item: Record<string, unknown>) => ({
    url: String(item.url || ''),
    savingsMs: Math.round(Number(item.wastedMs || 0))
  }));

  // ── Unused JS / CSS ─────────────────────────────────────────────
  const unusedJsItems = audits['unused-javascript']?.details?.items || [];
  const unusedJsKb = Math.round(
    unusedJsItems.reduce((sum: number, i: Record<string, unknown>) => sum + Number(i.wastedBytes || 0), 0) / 1024
  );
  const unusedCssItems = audits['unused-css-rules']?.details?.items || [];
  const unusedCssKb = Math.round(
    unusedCssItems.reduce((sum: number, i: Record<string, unknown>) => sum + Number(i.wastedBytes || 0), 0) / 1024
  );

  // ── Caching / Font ──────────────────────────────────────────────
  const cachingItems = audits['uses-long-cache-ttl']?.details?.items || [];
  const noBrowserCaching = cachingItems.length > 3;
  const fontItems: Array<Record<string, unknown>> = audits['font-display']?.details?.items || [];
  const hasFontDisplayIssue = fontItems.length > 0;

  // ── GTM / Rocket Loader detection (via network requests) ────────
  const scriptUrls = allNetworkItems
    .filter(i => typeof i.url === 'string' && (i.url as string).includes('.js'))
    .map(i => i.url as string);
  const hasGTMBloat = scriptUrls.some(u => u.includes('googletagmanager.com'));
  const hasRocketLoaderConflict = scriptUrls.some(u => u.includes('rocket-loader'));

  // ── Video Detection (from network requests) ─────────────────────
  const videoUrls = allNetworkItems.filter(
    i => typeof i.url === 'string' && /\.(mp4|webm|ogg|mov)/i.test(i.url as string)
  );
  const embedUrls = allNetworkItems.filter(
    i => typeof i.url === 'string' && (
      (i.url as string).includes('youtube.com') ||
      (i.url as string).includes('vimeo.com') ||
      (i.url as string).includes('youtu.be')
    )
  );

  const videoDetails: VideoDetail[] = [
    ...videoUrls.map((i): VideoDetail => {
      const vUrl = i.url as string;
      const ext = vUrl.split('.').pop()?.split('?')[0]?.toUpperCase() || 'VIDEO';
      return {
        url: vUrl,
        format: ext,
        isAutoPlay: false,
        hasPoster: false,
        isLazyLoaded: false,
        isEmbed: false,
        embedType: ''
      };
    }),
    ...embedUrls.map((i): VideoDetail => {
      const vUrl = i.url as string;
      const embedType = vUrl.includes('youtube') || vUrl.includes('youtu.be') ? 'YouTube' : 'Vimeo';
      return {
        url: vUrl,
        format: 'EMBED',
        isAutoPlay: false,
        hasPoster: false,
        isLazyLoaded: false,
        isEmbed: true,
        embedType
      };
    })
  ];

  const hasAutoPlayVideo = false; // enriched by htmlAudit
  const hasAboveFoldEmbed = embedUrls.length > 0;

  // ── Mobile vs Desktop Gap Explanation ───────────────────────────
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

  // ── Opportunities ───────────────────────────────────────────────
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
    .filter(a => a && (a.numericValue || 0) > 200)
    .map(a => ({
      title: a.title,
      savings: a.displayValue || '',
      savingsMs: Math.round(a.numericValue || 0)
    }))
    .sort((a, b) => (b.savingsMs || 0) - (a.savingsMs || 0))
    .slice(0, 8);

  // ── Missing alt text count ───────────────────────────────────────
  const altItems = audits['image-alt']?.details?.items || [];
  const imagesMissingAltText = altItems.length;

  return {
    mobileScore,
    desktopScore,
    mobileDesktopGap,
    gapExplanation,
    ttfb: Math.round(ttfb),
    lcp: Math.round(lcp),
    fcp: Math.round(fcp),
    cls: Math.round(cls * 1000) / 1000,
    inp: Math.round(inp),
    tbt: Math.round(tbt),
    totalPageSize: Math.round(totalPageSize / 1024),
    totalRequests,
    passesOneSecond,
    imagesLazyLoaded,
    imagesWebP,
    largestImageKb,
    totalImages,
    webpImages,
    nonWebpImages,
    nonWebpImageList,
    estimatedWebPSavingKb,
    imagesMissingAltText,
    totalVideos: videoDetails.length,
    videoDetails,
    hasAutoPlayVideo,
    hasAboveFoldEmbed,
    renderBlockingScripts,
    renderBlockingDetails,
    unusedJsKb,
    unusedCssKb,
    noBrowserCaching,
    hasFontDisplayIssue,
    hasGTMBloat,
    hasRocketLoaderConflict,
    opportunities,
    raw: mobile
  };
  } catch (err) {
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    console.error('AGENT_FAIL: PageSpeed —', msg);
    throw err;
  }
}
