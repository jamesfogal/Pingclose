import { fetchPage } from './fetchPage';
import { detectTechStack } from './techStack';
import { detectSeoFundamentals } from './seoFundamentals';
import { detectConversionTracking } from './conversionTracking';
import { auditImagesAndVideo } from './imageVideoAudit';
import { detectWordPressIssues } from './wordpressIssues';
import type { HtmlAgentResult } from './types';

export type { HtmlAgentResult } from './types';

// Agent: fetch the page, then run each detector against the same HTML —
// each detector is single-purpose and independently testable (see the
// other files in this directory) rather than one large mixed-concern file.
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
    imagesWithoutAlt: [], hasAutoPlayVideo: false, videoHasPoster: false, imagesLazyLoaded: false,
    wordpressPluginIssues: [],
  };

  const fetched = await fetchPage(url);
  if (!fetched) return EMPTY;
  const { html, headers, alpnProtocol } = fetched;

  const tech = detectTechStack(html, headers, alpnProtocol);
  const seo = detectSeoFundamentals(html);
  const tracking = detectConversionTracking(html);
  const imageVideo = auditImagesAndVideo(html);
  const wordpressPluginIssues = detectWordPressIssues(html, tech.cms, tech.pageBuilder, tracking.hasGA4, tracking.hasGTM);

  const serverIp = headers['x-real-ip'] || headers['x-forwarded-for']?.split(',')[0] || '';
  const isHttps = url.startsWith('https');

  return {
    html, headers,
    cms: tech.cms, cdn: tech.cdn, httpVersion: tech.httpVersion, pageBuilder: tech.pageBuilder, ecommerce: tech.ecommerce,
    serverIp, signals: tech.signals, isHttps,
    ...seo,
    ...tracking,
    ...imageVideo,
    wordpressPluginIssues,
  };
}
