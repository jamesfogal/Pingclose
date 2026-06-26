import type { PageSpeedResult } from '@/lib/agents/pagespeedAgent';
import type { TechStackResult } from '@/lib/htmlAudit';

export interface ScoredIssue { score: number; text: string; }

export function scoreAudit(speedResult: PageSpeedResult, techResult: TechStackResult): {
  topIssues: string[];
  topFixes: string[];
} {
  const scoredIssues: ScoredIssue[] = [];
  const issue = (score: number, text: string) => scoredIssues.push({ score, text });

  // 🔴 CRITICAL (9-10) — business-threatening
  if (!techResult.isHttps) issue(10, '🔴 No HTTPS — Google shows a security warning to every visitor and applies a ranking penalty');
  if (techResult.hostingVerdict === 'dead-zone') issue(10, `🔴 ${techResult.hosting} hosting detected — this host cannot achieve under 1 second load time regardless of what else is fixed`);
  if (!speedResult.passesOneSecond) issue(9, `🔴 Mobile score ${speedResult.mobileScore}/100 — failing Google's 1-second hurdle`);
  if (speedResult.lcp > 4000) issue(9, `🔴 LCP is ${(speedResult.lcp/1000).toFixed(1)}s — catastrophically slow, costing you Google rankings and visitors`);
  if (!techResult.hasGA4 && !techResult.hasGTM) issue(9, '🔴 No analytics installed — you cannot know which marketing is working, which pages convert, or where visitors drop off');
  if (speedResult.mobileDesktopGap >= 25) issue(9, `🔴 ${speedResult.mobileDesktopGap}-point gap between mobile and desktop — your real customers are getting a dramatically worse experience`);

  // 🟠 SERIOUS (7-8) — significant revenue impact
  if (techResult.hostingVerdict === 'speed-limiter') issue(8, `🟠 ${techResult.cms} platform detected — server-level speed optimizations are locked out`);
  if (speedResult.renderBlockingScripts > 0) issue(8, `🟠 ${speedResult.renderBlockingScripts} render-blocking scripts freezing page before any content loads — ~${Math.round(speedResult.renderBlockingDetails.reduce((s, r) => s + r.savingsMs, 0))}ms wasted`);
  if (!techResult.hasH1) issue(8, '🟠 No H1 tag found — primary keyword signal is completely missing from this page');
  if (!techResult.hasTitle) issue(8, '🟠 No title tag — critical SEO signal missing, Google will generate its own title');
  if (speedResult.ttfb > 800) issue(8, `🟠 Server response time ${speedResult.ttfb}ms — host is responding too slowly before a single byte loads`);
  if (speedResult.lcp > 2500 && speedResult.lcp <= 4000) issue(8, `🟠 LCP is ${(speedResult.lcp/1000).toFixed(1)}s — failing Google's Core Web Vitals threshold`);
  if (!techResult.hasFacebookPixel) issue(7, '🟠 No Facebook Pixel — Facebook and Instagram ad spend cannot be tracked or optimized');
  if (speedResult.unusedJsKb > 100) issue(7, `🟠 ${speedResult.unusedJsKb}KB of unused JavaScript loading on every visit — pure waste slowing every page load`);
  if (!techResult.hasMetaDescription) issue(7, '🟠 No meta description — Google pulls random text for your search result snippet');
  if (speedResult.hasRocketLoaderConflict) issue(7, '🟠 Cloudflare Rocket Loader conflict — adding load time instead of reducing it, should be disabled');
  if (speedResult.hasAutoPlayVideo) issue(7, '🟠 Autoplay video detected — significantly increases mobile data usage and delays page load');
  if (techResult.multipleH1s) issue(7, '🟠 Multiple H1 tags — confuses Google about which topic this page is targeting');

  // 🟡 MODERATE (5-6) — meaningful SEO and conversion impact
  if (speedResult.nonWebpImages > 0) issue(6, `🟡 ${speedResult.nonWebpImages} of ${speedResult.totalImages} images not WebP — estimated ${speedResult.estimatedWebPSavingKb}KB savings available`);
  if (!techResult.hasLocalBusinessSchema) issue(6, '🟡 No LocalBusiness schema — Google has reduced confidence in your local signals');
  if (!techResult.hasFAQSchema) issue(6, '🟡 No FAQ page with schema — missing free Google rich result opportunity your competitors may already have');
  if (!techResult.hasPricingSchema) issue(6, '🟡 No pricing page with schema — competitors with pricing schema rank higher for buying-intent searches');
  if (speedResult.unusedJsKb > 50 && speedResult.unusedJsKb <= 100) issue(6, `🟡 ${speedResult.unusedJsKb}KB unused JavaScript loading on every visit`);
  if (speedResult.unusedCssKb > 30) issue(5, `🟡 ${speedResult.unusedCssKb}KB unused CSS loading on every page`);
  if (speedResult.noBrowserCaching) issue(5, '🟡 No browser caching — repeat visitors re-download the same files on every single visit');
  if (speedResult.hasFontDisplayIssue) issue(5, '🟡 Font loading issue — text is invisible to visitors until fonts fully download');
  if (!techResult.hasCanonical) issue(5, '🟡 No canonical tag — risk of duplicate content issues hurting rankings');
  if (!techResult.hasSitemap) issue(5, '🟡 No XML sitemap — Google may not discover all your pages');
  if (speedResult.largestImageKb > 500) issue(5, `🟡 Largest image is ${speedResult.largestImageKb}KB — oversized images are the #1 cause of slow mobile loads`);
  if (speedResult.hasAboveFoldEmbed) issue(5, '🟡 Video embed above the fold — blocks page rendering until iframe fully loads');
  if (speedResult.ttfb > 600 && speedResult.ttfb <= 800) issue(5, `🟡 Server response time ${speedResult.ttfb}ms — slightly above the recommended 600ms threshold`);

  // 🟢 MINOR (3-4) — polish and optimization
  if (!speedResult.imagesLazyLoaded) issue(4, '🟢 Lazy loading not enabled — off-screen images load immediately, wasting bandwidth');
  if (speedResult.imagesMissingAltText > 0) issue(4, `🟢 ${speedResult.imagesMissingAltText} images missing alt text — hurting SEO and accessibility scores`);
  if (techResult.titleLength > 60) issue(4, `🟢 Title tag is ${techResult.titleLength} characters — Google truncates at 60, cutting off your message`);
  if (!techResult.hasReviewSchema) issue(3, '🟢 No review/rating schema — missing opportunity to show star ratings in search results');
  if (!techResult.hasTikTokPixel) issue(3, '🟢 No TikTok Pixel — TikTok ad conversions cannot be tracked');
  if (speedResult.hasGTMBloat) issue(3, '🟢 Google Tag Manager detected — verify all tags are active and necessary');

  // WordPress specifics
  techResult.wordpressPluginIssues.forEach(p => issue(6, `🟠 ${p}`));

  scoredIssues.sort((a, b) => b.score - a.score);

  return {
    topIssues: scoredIssues.map(i => `[${i.score}] ${i.text}`),
    topFixes: speedResult.opportunities.map(o => `${o.title}${o.savings ? ` — ${o.savings}` : ''}`)
  };
}
