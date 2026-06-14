import { NextRequest, NextResponse } from 'next/server';
import { runHtmlAgent } from '@/lib/agents/htmlAgent';
import { runHostingAgent, computeHostingVerdict } from '@/lib/agents/hostingAgent';
import { runAvailabilityAgent } from '@/lib/agents/availabilityAgent';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 });

    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
    const hostname = new URL(normalizedUrl).hostname;
    const baseUrl = new URL(normalizedUrl).origin;

    const [htmlResult, hostingResult, availabilityResult] = await Promise.all([
      runHtmlAgent(normalizedUrl),
      runHostingAgent(hostname),
      runAvailabilityAgent(baseUrl),
    ]);

    // Header-based hosting override (same logic as full audit)
    const h = htmlResult.headers;
    let resolvedHosting = hostingResult.hosting;
    if (h['x-powered-by']?.includes('WP Engine')) resolvedHosting = 'WP Engine';
    else if (h['x-kinsta-cache']) resolvedHosting = 'Kinsta';
    else if (h['x-vercel-id']) resolvedHosting = 'Vercel';
    else if (h['x-netlify']) resolvedHosting = 'Netlify';

    const finalHosting = resolvedHosting !== hostingResult.hosting
      ? { hosting: resolvedHosting, ...computeHostingVerdict(resolvedHosting, htmlResult.cms) }
      : hostingResult;

    return NextResponse.json({
      cms:                     htmlResult.cms,
      pageBuilder:             htmlResult.pageBuilder,
      ecommerce:               htmlResult.ecommerce,
      cdn:                     htmlResult.cdn,
      httpVersion:             htmlResult.httpVersion,
      isHttps:                 htmlResult.isHttps,
      hosting:                 finalHosting.hosting,
      hostingVerdict:          finalHosting.hostingVerdict,
      hostingVerdictLabel:     finalHosting.hostingVerdictLabel,
      hostingVerdictMessage:   finalHosting.hostingVerdictMessage,
      hasTitle:                htmlResult.hasTitle,
      titleTag:                htmlResult.titleTag,
      titleLength:             htmlResult.titleLength,
      hasMetaDescription:      htmlResult.hasMetaDescription,
      metaDescription:         htmlResult.metaDescription,
      metaDescriptionLength:   htmlResult.metaDescriptionLength,
      hasH1:                   htmlResult.hasH1,
      h1Text:                  htmlResult.h1Text,
      multipleH1s:             htmlResult.multipleH1s,
      hasCanonical:            htmlResult.hasCanonical,
      hasRobotsTxt:            availabilityResult.hasRobotsTxt,
      hasSitemap:              availabilityResult.hasSitemap,
      primaryKeyword:          htmlResult.primaryKeyword,
      hasFAQSchema:            htmlResult.hasFAQSchema,
      hasPricingSchema:        htmlResult.hasPricingSchema,
      hasLocalBusinessSchema:  htmlResult.hasLocalBusinessSchema,
      hasReviewSchema:         htmlResult.hasReviewSchema,
      hasGA4:                  htmlResult.hasGA4,
      hasGTM:                  htmlResult.hasGTM,
      hasFacebookPixel:        htmlResult.hasFacebookPixel,
      hasTikTokPixel:          htmlResult.hasTikTokPixel,
      hasCallTracking:         htmlResult.hasCallTracking,
      imagesWithoutAlt:        htmlResult.imagesWithoutAlt,
      wordpressPluginIssues:   htmlResult.wordpressPluginIssues,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('FAST_AUDIT_FAIL:', msg);
    return NextResponse.json({ error: 'Fast scan failed' }, { status: 500 });
  }
}
