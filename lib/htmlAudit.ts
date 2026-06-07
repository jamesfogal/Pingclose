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

  // Schema detection
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

  // Uptime monitoring
  hasUptimeMonitoring: boolean;
  uptimeService: string;

  // Backup detection
  hasBackup: boolean;
  backupService: string;
  backupCoveredByHost: boolean;
  backupMessage: string;

  // Image alt text (enriched)
  imagesWithoutAlt: string[];

  // Video details (enriched from HTML)
  hasAutoPlayVideo: boolean;
  videoHasPoster: boolean;

  // WordPress specifics
  wordpressPluginIssues: string[];
}

// Hosting verdict lookup
function getHostingVerdict(hosting: string, cms: string): {
  verdict: 'dead-zone' | 'speed-limiter' | 'acceptable' | 'race-ready' | 'unknown';
  label: string;
  message: string;
} {
  const h = hosting.toLowerCase();
  const c = cms.toLowerCase();

  if (h.includes('godaddy') || h.includes('bluehost') || h.includes('hostgator') ||
      h.includes('network solutions') || h.includes('1&1') || h.includes('ionos') ||
      h.includes('ipage') || h.includes('dreamhost')) {
    return {
      verdict: 'dead-zone',
      label: '☠️ Dead Zone',
      message: `${hosting} shared hosting is one of the leading causes of slow local business websites. Your server response time alone adds 800–1,200ms before a single image or script loads. No plugin or image compression can fix a slow foundation. The host itself is the problem.`
    };
  }
  if (c.includes('wix') || c.includes('squarespace') || c.includes('weebly')) {
    return {
      verdict: 'speed-limiter',
      label: '⚠️ Speed Limiter',
      message: `${cms} controls your hosting environment. You are locked out of the server-level optimizations that matter most. Under 1 second is not achievable on this platform regardless of what else you fix.`
    };
  }
  if (h.includes('siteground') || h.includes('cloudways') || h.includes('flywheel')) {
    return {
      verdict: 'acceptable',
      label: '🟡 Acceptable',
      message: `${hosting} is a decent foundation. Significant optimization is still needed to hit under 1 second — but the host itself won't hold you back.`
    };
  }
  if (h.includes('wp engine') || h.includes('wpengine') || h.includes('kinsta') ||
      h.includes('vercel') || h.includes('netlify') || h.includes('cloudflare')) {
    return {
      verdict: 'race-ready',
      label: '✅ Race Ready',
      message: `${hosting} is a solid foundation. Speed under 1 second is achievable with the right setup and optimization.`
    };
  }
  return {
    verdict: 'unknown',
    label: '❓ Unknown Host',
    message: 'We could not identify your hosting provider. Your server response time will tell us more about the foundation quality.'
  };
}

export async function detectTechStack(url: string): Promise<TechStackResult> {
  let html = '';
  let headers: Record<string, string> = {};
  let serverIp = '';

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PingClose/1.0; +https://pingclose.com)' },
      signal: AbortSignal.timeout(12000)
    });

    html = await res.text();
    res.headers.forEach((value, key) => { headers[key.toLowerCase()] = value; });
    serverIp = headers['x-real-ip'] || headers['x-forwarded-for']?.split(',')[0] || '';
  } catch {
    return {
      cms: 'Unknown', hosting: 'Unknown', hostingVerdict: 'unknown',
      hostingVerdictLabel: '❓ Unknown', hostingVerdictMessage: 'Could not fetch page.',
      cdn: 'Unknown', httpVersion: 'Unknown', pageBuilder: 'None detected',
      ecommerce: 'None detected', hasWordPress: false, serverIp: '',
      signals: ['Could not fetch page for tech analysis'],
      hasTitle: false, titleTag: '', titleLength: 0,
      hasMetaDescription: false, metaDescription: '', metaDescriptionLength: 0,
      hasH1: false, h1Text: '', multipleH1s: false,
      hasCanonical: false, hasRobotsTxt: false, hasSitemap: false,
      isHttps: url.startsWith('https'), primaryKeyword: '',
      hasFAQSchema: false, hasPricingSchema: false, hasLocalBusinessSchema: false, hasReviewSchema: false,
      hasGA4: false, hasGTM: false, hasFacebookPixel: false, hasTikTokPixel: false, hasCallTracking: false,
      hasUptimeMonitoring: false, uptimeService: '',
      hasBackup: false, backupService: '', backupCoveredByHost: false, backupMessage: 'Could not fetch page to check backup status.',
      imagesWithoutAlt: [], hasAutoPlayVideo: false, videoHasPoster: false,
      wordpressPluginIssues: []
    };
  }

  const signals: string[] = [];

  // ── CMS Detection ────────────────────────────────────────────────
  let cms = 'Custom / Unknown';
  if (html.includes('/wp-content/') || html.includes('/wp-includes/')) { cms = 'WordPress'; signals.push('WordPress detected'); }
  else if (html.includes('wix.com') || html.includes('_wix_')) { cms = 'Wix'; signals.push('Wix detected'); }
  else if (html.includes('squarespace.com') || html.includes('squarespace-cdn')) { cms = 'Squarespace'; signals.push('Squarespace detected'); }
  else if (html.includes('shopify') || html.includes('myshopify')) { cms = 'Shopify'; signals.push('Shopify detected'); }
  else if (html.includes('webflow.com') || html.includes('data-wf-')) { cms = 'Webflow'; signals.push('Webflow detected'); }
  else if (html.includes('__NEXT_DATA__')) { cms = 'Next.js (Custom)'; signals.push('Next.js detected'); }
  else if (html.includes('gatsby')) { cms = 'Gatsby (Custom)'; signals.push('Gatsby detected'); }

  // ── Page Builder ─────────────────────────────────────────────────
  let pageBuilder = 'None detected';
  if (html.includes('elementor')) { pageBuilder = 'Elementor'; signals.push('Elementor page builder'); }
  else if (html.includes('divi')) { pageBuilder = 'Divi'; signals.push('Divi page builder'); }
  else if (html.includes('beaver-builder') || html.includes('fl-builder')) { pageBuilder = 'Beaver Builder'; }
  else if (html.includes('bricks-')) { pageBuilder = 'Bricks Builder'; }
  else if (html.includes('wp-block-')) { pageBuilder = 'Gutenberg'; }

  // ── CDN ──────────────────────────────────────────────────────────
  let cdn = 'None detected';
  const server = headers['server'] || '';
  const via = headers['via'] || '';
  const cfRay = headers['cf-ray'] || '';
  if (cfRay || server.includes('cloudflare')) { cdn = 'Cloudflare'; signals.push('Cloudflare CDN'); }
  else if (via.includes('CloudFront') || html.includes('cloudfront.net')) { cdn = 'AWS CloudFront'; }
  else if (html.includes('fastly.net')) { cdn = 'Fastly'; }
  else if (html.includes('bunnycdn') || html.includes('b-cdn.net')) { cdn = 'BunnyCDN'; }

  // ── Hosting ──────────────────────────────────────────────────────
  let hosting = 'Unknown';
  if (headers['x-powered-by']?.includes('WP Engine') || html.includes('wpengine')) { hosting = 'WP Engine'; }
  else if (headers['x-kinsta-cache'] || html.includes('kinsta')) { hosting = 'Kinsta'; }
  else if (server.includes('siteground') || html.includes('siteground')) { hosting = 'SiteGround'; }
  else if (html.includes('godaddy') || headers['x-gd-domain']) { hosting = 'GoDaddy'; }
  else if (server.includes('vercel') || headers['x-vercel-id']) { hosting = 'Vercel'; }
  else if (headers['x-netlify'] || server.includes('netlify')) { hosting = 'Netlify'; }
  else if (html.includes('bluehost')) { hosting = 'Bluehost'; }
  else if (html.includes('hostgator')) { hosting = 'HostGator'; }
  else if (cdn === 'Cloudflare') { hosting = 'Unknown (behind Cloudflare)'; }

  // ── Hosting Verdict ──────────────────────────────────────────────
  const hostingVerdictData = getHostingVerdict(hosting, cms);

  // ── E-commerce ───────────────────────────────────────────────────
  let ecommerce = 'None detected';
  if (cms === 'Shopify') { ecommerce = 'Shopify'; }
  else if (html.includes('woocommerce') || html.includes('wc-')) { ecommerce = 'WooCommerce'; }
  else if (html.includes('bigcommerce')) { ecommerce = 'BigCommerce'; }

  // ── HTTP Version ─────────────────────────────────────────────────
  let httpVersion = 'HTTP/1.1';
  if (headers['alt-svc']?.includes('h3')) { httpVersion = 'HTTP/3'; }
  else if (headers['alt-svc']?.includes('h2')) { httpVersion = 'HTTP/2'; }

  // ── HTTPS ────────────────────────────────────────────────────────
  const isHttps = url.startsWith('https');

  // ── SEO Fundamentals ─────────────────────────────────────────────
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

  // ── Primary Keyword Extraction ────────────────────────────────────
  // Pull from title first, then H1, clean it up
  let primaryKeyword = '';
  if (titleTag) {
    // Remove brand name (usually after | or - or —)
    const cleaned = titleTag.split(/[|\-–—]/)[0].trim();
    primaryKeyword = cleaned;
  } else if (h1Text) {
    primaryKeyword = h1Text;
  }

  // ── Robots.txt / Sitemap ──────────────────────────────────────────
  const baseUrl = new URL(url).origin;
  const [robotsRes, sitemapRes] = await Promise.allSettled([
    fetch(`${baseUrl}/robots.txt`, { signal: AbortSignal.timeout(5000) }),
    fetch(`${baseUrl}/sitemap.xml`, { signal: AbortSignal.timeout(5000) })
  ]);
  const hasRobotsTxt = robotsRes.status === 'fulfilled' && robotsRes.value.ok;
  const hasSitemap = sitemapRes.status === 'fulfilled' && sitemapRes.value.ok;

  // ── Schema Detection ─────────────────────────────────────────────
  const schemaBlocks = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
  const schemaText = schemaBlocks.join(' ').toLowerCase();
  const hasFAQSchema = schemaText.includes('"faqpage"') || schemaText.includes('"question"');
  const hasPricingSchema = schemaText.includes('"pricespecification"') || schemaText.includes('"offer"');
  const hasLocalBusinessSchema = schemaText.includes('"localbusiness"') || schemaText.includes('"organization"');
  const hasReviewSchema = schemaText.includes('"review"') || schemaText.includes('"aggregaterating"');

  // ── Conversion Tracking ──────────────────────────────────────────
  const hasGA4 = html.includes('gtag') || html.includes('G-') || html.includes('google-analytics.com/g/');
  const hasGTM = html.includes('googletagmanager.com') || html.includes('GTM-');
  const hasFacebookPixel = html.includes('connect.facebook.net') || html.includes('fbq(') || html.includes('facebook.com/tr');
  const hasTikTokPixel = html.includes('analytics.tiktok.com') || html.includes('ttq.');
  const hasCallTracking = html.includes('callrail.com') || html.includes('calltracking') || html.includes('callfire.com');

  // ── Uptime Monitoring ────────────────────────────────────────────
  // External pingers (UptimeRobot, Pingdom, StatusCake) are NOT detectable
  // from page HTML — they monitor from outside. We only detect page-injected agents.
  let hasUptimeMonitoring = false;
  let uptimeService = '';
  if (html.includes('datadoghq.com')) { hasUptimeMonitoring = true; uptimeService = 'Datadog'; }
  else if (html.includes('newrelic.com') || html.includes('nr-data.net')) { hasUptimeMonitoring = true; uptimeService = 'New Relic'; }
  else if (html.includes('managewp') || html.includes('manage-wp')) { hasUptimeMonitoring = true; uptimeService = 'ManageWP'; }

  // ── Backup Detection ─────────────────────────────────────────────
  let hasBackup = false;
  let backupService = '';
  let backupCoveredByHost = false;
  let backupMessage = '';

  if (hosting === 'WP Engine') {
    hasBackup = true; backupCoveredByHost = true;
    backupService = 'WP Engine Daily Backups';
    backupMessage = 'WP Engine automatically backs up your site daily and retains 40 days of backups.';
  } else if (hosting === 'Kinsta') {
    hasBackup = true; backupCoveredByHost = true;
    backupService = 'Kinsta Daily Backups';
    backupMessage = 'Kinsta automatically backs up your site daily and retains 14-30 days of backups.';
  } else if (cms === 'Wix') {
    hasBackup = true; backupCoveredByHost = true;
    backupService = 'Wix Automatic Backups';
    backupMessage = 'Wix automatically saves versions of your site that can be restored.';
  } else if (cms === 'Squarespace') {
    hasBackup = true; backupCoveredByHost = true;
    backupService = 'Squarespace Automatic Backups';
    backupMessage = 'Squarespace handles backups automatically on their infrastructure.';
  } else if (cms === 'Shopify') {
    hasBackup = true; backupCoveredByHost = true;
    backupService = 'Shopify Automatic Backups';
    backupMessage = 'Shopify maintains backups of your store data automatically.';
  }

  if (!hasBackup) {
    if (html.includes('updraftplus') || html.includes('updraft-plus')) {
      hasBackup = true; backupService = 'UpdraftPlus';
      backupMessage = 'UpdraftPlus backup plugin detected — automated backups are configured.';
    } else if (html.includes('jetpack-backup') || (html.includes('jetpack') && html.includes('backup'))) {
      hasBackup = true; backupService = 'Jetpack Backup';
      backupMessage = 'Jetpack Backup detected — real-time or daily backups are running.';
    } else if (html.includes('backupbuddy') || html.includes('backup-buddy')) {
      hasBackup = true; backupService = 'BackupBuddy';
      backupMessage = 'BackupBuddy detected — automated backups are configured.';
    } else if (html.includes('managewp') || html.includes('manage-wp')) {
      hasBackup = true; backupService = 'ManageWP Backups';
      backupMessage = 'ManageWP detected — includes automated backup management.';
    } else if (html.includes('vaultpress')) {
      hasBackup = true; backupService = 'VaultPress (Jetpack)';
      backupMessage = 'VaultPress backup service detected — real-time backups are active.';
    } else if (html.includes('duplicator')) {
      hasBackup = true; backupService = 'Duplicator';
      backupMessage = 'Duplicator plugin detected — manual or scheduled backups configured.';
    }
  }

  if (!hasBackup) {
    if (cms === 'WordPress') {
      backupMessage = 'No backup software detected on your WordPress site. If your site is hacked, your host has a server failure, or a bad plugin update corrupts your database — full restoration may be impossible. Everything you have built could be gone permanently.';
    } else if (cms !== 'Custom / Unknown') {
      backupMessage = 'No backup solution detected. Verify your hosting provider includes automated backups.';
    } else {
      backupMessage = 'Could not determine backup status. Contact your hosting provider to confirm automated backups are enabled.';
    }
  }

  // ── Images without alt text ──────────────────────────────────────
  const imgTags = html.match(/<img[^>]+>/gi) || [];
  const imagesWithoutAlt = imgTags
    .filter(tag => !tag.includes('alt=') || tag.includes('alt=""') || tag.includes("alt=''"))
    .map(tag => {
      const srcMatch = tag.match(/src=["']([^"']+)["']/i);
      return srcMatch?.[1] || '';
    })
    .filter(Boolean)
    .slice(0, 10);

  // ── Video (autoplay / poster from HTML) ──────────────────────────
  const videoTags = html.match(/<video[^>]*>/gi) || [];
  const hasAutoPlayVideo = videoTags.some(t => t.includes('autoplay'));
  const videoHasPoster = videoTags.some(t => t.includes('poster='));

  // ── WordPress-Specific Issues ────────────────────────────────────
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
    cms,
    hosting,
    hostingVerdict: hostingVerdictData.verdict,
    hostingVerdictLabel: hostingVerdictData.label,
    hostingVerdictMessage: hostingVerdictData.message,
    cdn,
    httpVersion,
    pageBuilder,
    ecommerce,
    hasWordPress: cms === 'WordPress',
    serverIp,
    signals,
    hasTitle,
    titleTag,
    titleLength,
    hasMetaDescription,
    metaDescription,
    metaDescriptionLength,
    hasH1,
    h1Text,
    multipleH1s,
    hasCanonical,
    hasRobotsTxt,
    hasSitemap,
    isHttps,
    primaryKeyword,
    hasFAQSchema,
    hasPricingSchema,
    hasLocalBusinessSchema,
    hasReviewSchema,
    hasGA4,
    hasGTM,
    hasFacebookPixel,
    hasTikTokPixel,
    hasCallTracking,
    hasUptimeMonitoring,
    uptimeService,
    hasBackup,
    backupService,
    backupCoveredByHost,
    backupMessage,
    imagesWithoutAlt,
    hasAutoPlayVideo,
    videoHasPoster,
    wordpressPluginIssues
  };
}
