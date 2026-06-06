export interface PageSpeedResult {
  mobileScore: number;
  desktopScore: number;
  ttfb: number;
  lcp: number;
  fcp: number;
  cls: number;
  inp: number;
  totalPageSize: number;
  totalRequests: number;
  passesOneSecond: boolean;
  imagesLazyLoaded: boolean;
  imagesWebP: boolean;
  largestImageKb: number;
  renderBlockingScripts: number;
  opportunities: Array<{ title: string; savings: string }>;
  raw: Record<string, unknown>;
}

export async function runPageSpeed(url: string): Promise<PageSpeedResult> {
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

  const mobileScore = Math.round((categories?.performance?.score || 0) * 100);
  const desktopScore = Math.round(((desktop.lighthouseResult?.categories?.performance?.score) || 0) * 100);

  const ttfb = audits['server-response-time']?.numericValue || 0;
  const lcp = audits['largest-contentful-paint']?.numericValue || 0;
  const fcp = audits['first-contentful-paint']?.numericValue || 0;
  const cls = audits['cumulative-layout-shift']?.numericValue || 0;
  const inp = audits['interaction-to-next-paint']?.numericValue || 0;

  const totalPageSize = audits['total-byte-weight']?.numericValue || 0;
  const totalRequests = audits['network-requests']?.details?.items?.length || 0;

  // Pass if LCP under 2500ms and FCP under 1800ms and mobile score >= 50
  const passesOneSecond = lcp < 2500 && fcp < 1800 && mobileScore >= 50;

  // Image analysis
  const imageItems = audits['uses-optimized-images']?.details?.items || [];
  const webpItems = audits['uses-webp-images']?.details?.items || [];
  const lazyItems = audits['offscreen-images']?.details?.items || [];

  const imagesWebP = webpItems.length === 0;
  const imagesLazyLoaded = lazyItems.length === 0;

  const allImages = audits['network-requests']?.details?.items?.filter(
    (i: Record<string, unknown>) => typeof i.url === 'string' && /\.(jpg|jpeg|png|gif|webp|avif)/i.test(i.url as string)
  ) || [];
  const largestImageKb = Math.round(
    Math.max(0, ...allImages.map((i: Record<string, unknown>) => Number(i.transferSize) || 0)) / 1024
  );

  const renderBlockingScripts = (audits['render-blocking-resources']?.details?.items || []).length;

  // Top opportunities
  const opportunities = [
    audits['uses-optimized-images'],
    audits['uses-webp-images'],
    audits['render-blocking-resources'],
    audits['unused-javascript'],
    audits['unused-css-rules'],
    audits['uses-text-compression'],
    audits['offscreen-images'],
  ]
    .filter(a => a && a.details?.type === 'opportunity' && (a.numericValue || 0) > 500)
    .map(a => ({
      title: a.title,
      savings: a.displayValue || ''
    }))
    .slice(0, 5);

  return {
    mobileScore,
    desktopScore,
    ttfb: Math.round(ttfb),
    lcp: Math.round(lcp),
    fcp: Math.round(fcp),
    cls: Math.round(cls * 1000) / 1000,
    inp: Math.round(inp),
    totalPageSize: Math.round(totalPageSize / 1024),
    totalRequests,
    passesOneSecond,
    imagesLazyLoaded,
    imagesWebP,
    largestImageKb,
    renderBlockingScripts,
    opportunities,
    raw: mobile
  };
}
