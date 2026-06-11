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

  // Uptime
  hasUptimeMonitoring: boolean;
  uptimeService: string;

  // Images / video
  imagesWithoutAlt: string[];
  hasAutoPlayVideo: boolean;
  videoHasPoster: boolean;

  // WordPress
  wordpressPluginIssues: string[];
}

// Agent: fetch the page and parse everything extractable from HTML + response headers
export async function runHtmlAgent(url: string): Promise<HtmlAgentResult> {
  const EMPTY: HtmlAgentResult = {
    html: '', headers: {},
    cms: 'Unknown', cdn: 'Unknown', httpVersion: 'Unknown',
    pageBuilder: 'None detected', ecommerce: 'None detected',
    serverIp: '', signals: ['Could not fetch page for tech analysis'],
    isHttps: url.startsWith('https'),
    hasTitle: false, titleTag: '', titleLength: 0,
    hasMetaDescription: false, metaDescription: '', metaDescriptionLength: 0,
    hasH1: false, h1Text: '', multipleH1s: false,
    hasCanonical: false, primaryKeyword: '',
    hasFAQSchema: false, hasPricingSchema: false, hasLocalBusinessSchema: false, hasReviewSchema: false,
    hasGA4: false, hasGTM: false, hasFacebookPixel: false, hasTikTokPixel: false, hasCallTracking: false,
    hasUptimeMonitoring: false, uptimeService: '',
    imagesWithoutAlt: [], hasAutoPlayVideo: false, videoHasPoster: false,
    wordpressPluginIssues: [],
  };

  let html = '';
  let headers: Record<string, string> = {};

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PingClose/1.0; +https://pingclose.com)' },
      signal: AbortSignal.timeout(12000)
    });
    html = await res.text();
    res.headers.forEach((value, key) => { headers[key.toLowerCase()] = value; });
  } catch {
    return EMPTY;
  }

  const signals: string[] = [];

  // CMS
  let cms = 'Custom / Unknown';
  if (html.includes('/wp-content/') || html.includes('/wp-includes/')) { cms = 'WordPress'; signals.push('WordPress detected'); }
  else if (html.includes('wix.com') || html.includes('_wix_')) { cms = 'Wix'; signals.push('Wix detected'); }
  else if (html.includes('squarespace.com') || html.includes('squarespace-cdn')) { cms = 'Squarespace'; signals.push('Squarespace detected'); }
  else if (html.includes('shopify') || html.includes('myshopify')) { cms = 'Shopify'; signals.push('Shopify detected'); }
  else if (html.includes('webflow.com') || html.includes('data-wf-')) { cms = 'Webflow'; signals.push('Webflow detected'); }
  else if (html.includes('__NEXT_DATA__')) { cms = 'Next.js (Custom)'; signals.push('Next.js detected'); }
  else if (html.includes('gatsby')) { cms = 'Gatsby (Custom)'; signals.push('Gatsby detected'); }

  // Page Builder
  let pageBuilder = 'None detected';
  if (html.includes('elementor')) { pageBuilder = 'Elementor'; signals.push('Elementor page builder'); }
  else if (html.includes('divi')) { pageBuilder = 'Divi'; signals.push('Divi page builder'); }
  else if (html.includes('beaver-builder') || html.includes('fl-builder')) { pageBuilder = 'Beaver Builder'; }
  else if (html.includes('bricks-')) { pageBuilder = 'Bricks Builder'; }
  else if (html.includes('wp-block-')) { pageBuilder = 'Gutenberg'; }

  // CDN
  let cdn = 'None detected';
  const server = headers['server'] || '';
  const via = headers['via'] || '';
  const cfRay = headers['cf-ray'] || '';
  if (cfRay || server.includes('cloudflare')) { cdn = 'Cloudflare'; signals.push('Cloudflare CDN'); }
  else if (via.includes('CloudFront') || html.includes('cloudfront.net')) { cdn = 'AWS CloudFront'; }
  else if (html.includes('fastly.net')) { cdn = 'Fastly'; }
  else if (html.includes('bunnycdn') || html.includes('b-cdn.net')) { cdn = 'BunnyCDN'; }

  // E-commerce
  let ecommerce = 'None detected';
  if (cms === 'Shopify') { ecommerce = 'Shopify'; }
  else if (html.includes('woocommerce') || html.includes('wc-')) { ecommerce = 'WooCommerce'; }
  else if (html.includes('bigcommerce')) { ecommerce = 'BigCommerce'; }

  // HTTP version
  let httpVersion = 'HTTP/1.1';
  if (headers['alt-svc']?.includes('h3')) { httpVersion = 'HTTP/3'; }
  else if (headers['alt-svc']?.includes('h2')) { httpVersion = 'HTTP/2'; }

  const serverIp = headers['x-real-ip'] || headers['x-forwarded-for']?.split(',')[0] || '';
  const isHttps = url.startsWith('https');

  // SEO fundamentals
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const hasTitle = !!titleMatch;
  const titleTag = titleMatch?.[1]?.trim() || '';
  const titleLength = titleTag.length;

  const metaDescMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
  const hasMetaDescription = !!metaDescMatch;
  const metaDescription = metaDescMatch?.[1]?.trim() || '';
  const metaDescriptionLength = metaDescription.length;

  const h1Matches = html.match(/<h1[^>]*>([^<]+)<\/h1>/gi) || [];
  const hasH1 = h1Matches.length > 0;
  const h1Text = h1Matches[0]?.replace(/<[^>]+>/g, '').trim() || '';
  const multipleH1s = h1Matches.length > 1;

  const hasCanonical = html.includes('rel="canonical"') || html.includes("rel='canonical'");

  let primaryKeyword = '';
  if (titleTag) { primaryKeyword = titleTag.split(/[|\-–—]/)[0].trim(); }
  else if (h1Text) { primaryKeyword = h1Text; }

  // Schema
  const schemaBlocks = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
  const schemaText = schemaBlocks.join(' ').toLowerCase();
  const hasFAQSchema = schemaText.includes('"faqpage"') || schemaText.includes('"question"');
  const hasPricingSchema = schemaText.includes('"pricespecification"') || schemaText.includes('"offer"');
  const hasLocalBusinessSchema = schemaText.includes('"localbusiness"') || schemaText.includes('"organization"');
  const hasReviewSchema = schemaText.includes('"review"') || schemaText.includes('"aggregaterating"');

  // Conversion tracking
  const hasGA4 = html.includes('gtag') || html.includes('G-') || html.includes('google-analytics.com/g/');
  const hasGTM = html.includes('googletagmanager.com') || html.includes('GTM-');
  const hasFacebookPixel = html.includes('connect.facebook.net') || html.includes('fbq(') || html.includes('facebook.com/tr');
  const hasTikTokPixel = html.includes('analytics.tiktok.com') || html.includes('ttq.');
  const hasCallTracking = html.includes('callrail.com') || html.includes('calltracking') || html.includes('callfire.com') || html.includes('ctm.js') || html.includes('whatconverts') || html.includes('calltrackingmetrics');

  // Uptime
  let hasUptimeMonitoring = false;
  let uptimeService = '';
  if (html.includes('datadoghq.com')) { hasUptimeMonitoring = true; uptimeService = 'Datadog'; }
  else if (html.includes('newrelic.com') || html.includes('nr-data.net')) { hasUptimeMonitoring = true; uptimeService = 'New Relic'; }
  else if (html.includes('managewp') || html.includes('manage-wp')) { hasUptimeMonitoring = true; uptimeService = 'ManageWP'; }

  // Images without alt text
  const imgTags = html.match(/<img[^>]+>/gi) || [];
  const imagesWithoutAlt = imgTags
    .filter(tag => !tag.includes('alt=') || tag.includes('alt=""') || tag.includes("alt=''"))
    .map(tag => { const m = tag.match(/src=["']([^"']+)["']/i); return m?.[1] || ''; })
    .filter(Boolean)
    .slice(0, 10);

  // Video
  const videoTags = html.match(/<video[^>]*>/gi) || [];
  const hasAutoPlayVideo = videoTags.some(t => t.includes('autoplay'));
  const videoHasPoster = videoTags.some(t => t.includes('poster='));

  // WordPress issues
  const wordpressPluginIssues: string[] = [];
  if (cms === 'WordPress') {
    if (html.includes('rocket-loader')) wordpressPluginIssues.push('Cloudflare Rocket Loader detected — often conflicts with WordPress and adds load time instead of reducing it');
    if (html.includes('revslider') || html.includes('revolution-slider')) wordpressPluginIssues.push('Revolution Slider detected — heavy plugin known to significantly slow page load');
    if (html.includes('visual-composer') || html.includes('vc_row')) wordpressPluginIssues.push('Visual Composer / WPBakery detected — generates bloated HTML that slows rendering');
    if (pageBuilder === 'Elementor') wordpressPluginIssues.push('Elementor detected — loads significant CSS/JS overhead; needs aggressive optimization');
    if (html.includes('jquery')) wordpressPluginIssues.push('jQuery loaded — adds ~30KB; modern WordPress sites can eliminate this dependency');
    if (!hasGA4 && !hasGTM) wordpressPluginIssues.push('No analytics detected — no way to track which pages are converting visitors');
  }

  return {
    html, headers, cms, cdn, httpVersion, pageBuilder, ecommerce, serverIp, signals, isHttps,
    hasTitle, titleTag, titleLength,
    hasMetaDescription, metaDescription, metaDescriptionLength,
    hasH1, h1Text, multipleH1s, hasCanonical, primaryKeyword,
    hasFAQSchema, hasPricingSchema, hasLocalBusinessSchema, hasReviewSchema,
    hasGA4, hasGTM, hasFacebookPixel, hasTikTokPixel, hasCallTracking,
    hasUptimeMonitoring, uptimeService,
    imagesWithoutAlt, hasAutoPlayVideo, videoHasPoster,
    wordpressPluginIssues,
  };
}
