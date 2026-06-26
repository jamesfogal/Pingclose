import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { runPageSpeedAgent, buildFallbackResult } from '@/lib/agents/pagespeedAgent';
import { runHtmlAgent } from '@/lib/agents/htmlAgent';
import { runHostingAgent, computeHostingVerdict } from '@/lib/agents/hostingAgent';
import { runAvailabilityAgent } from '@/lib/agents/availabilityAgent';
import { runSitemapAgent } from '@/lib/agents/sitemapAgent';
import { checkRateLimit, checkAgencySignal } from '@/lib/rateLimiter';
import { scoreAudit } from '@/lib/auditScorer';
import { deliverReport } from '@/lib/reportDelivery';
import type { TechStackResult } from '@/lib/htmlAudit';

export async function POST(req: NextRequest) {
  try {
    const { url, email, phone, deliveryEmail = true } = await req.json();

    if (!url || (!email && !phone)) {
      return NextResponse.json({ error: 'URL and at least one delivery method are required' }, { status: 400 });
    }

    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || '0.0.0.0';

    console.log('STEP1: checkRateLimit');
    const { limited } = await checkRateLimit(email);
    if (limited) {
      return NextResponse.json({ limit: true, message: "You've run 5 free audits today. Come back tomorrow for more!" });
    }

    const hostname = new URL(normalizedUrl).hostname;
    const baseUrl = new URL(normalizedUrl).origin;

    console.log('STEP2: firing agents');
    const [speedAgentResult, htmlResult, hostingResult, availabilityResult, sitemapResult] = await Promise.all([
      runPageSpeedAgent(normalizedUrl),
      runHtmlAgent(normalizedUrl).catch(e => { throw new Error('HTML_FAIL: ' + e.message); }),
      runHostingAgent(hostname).catch(e => { throw new Error('HOSTING_FAIL: ' + e.message); }),
      runAvailabilityAgent(baseUrl).catch(e => { throw new Error('AVAILABILITY_FAIL: ' + e.message); }),
      runSitemapAgent(baseUrl).catch(e => { throw new Error('SITEMAP_FAIL: ' + e.message); }),
    ]);
    console.log('STEP3: agents done');

    let speedResult;
    if (!speedAgentResult.ok) {
      console.error('AGENT_FAIL: PageSpeedAgent —', speedAgentResult.error, 'quotaExceeded:', speedAgentResult.quotaExceeded);
      const isTimeout = /timed out/i.test(speedAgentResult.error);
      speedResult = buildFallbackResult(isTimeout ? 'TIMEOUT' : 'ERROR');
    } else {
      speedResult = speedAgentResult.data;
    }

    // Apply header-based overrides to the hosting result (no extra network call)
    // Headers come from htmlAgent, hosting name from hostingAgent — merged here
    let resolvedHosting = hostingResult.hosting;
    const h = htmlResult.headers;
    if (h['x-powered-by']?.includes('WP Engine')) resolvedHosting = 'WP Engine';
    else if (h['x-kinsta-cache']) resolvedHosting = 'Kinsta';
    else if (h['x-vercel-id']) resolvedHosting = 'Vercel';
    else if (h['x-netlify']) resolvedHosting = 'Netlify';

    // Re-derive verdict only if header override changed the hosting name (pure logic, no network)
    const finalHosting = resolvedHosting !== hostingResult.hosting
      ? { hosting: resolvedHosting, ...computeHostingVerdict(resolvedHosting, htmlResult.cms) }
      : hostingResult;

    // Build the unified TechStackResult
    const techResult: TechStackResult = {
      cms: htmlResult.cms,
      hosting: finalHosting.hosting,
      hostingVerdict: finalHosting.hostingVerdict,
      hostingVerdictLabel: finalHosting.hostingVerdictLabel,
      hostingVerdictMessage: finalHosting.hostingVerdictMessage,
      cdn: htmlResult.cdn,
      httpVersion: htmlResult.httpVersion,
      pageBuilder: htmlResult.pageBuilder,
      ecommerce: htmlResult.ecommerce,
      hasWordPress: htmlResult.cms === 'WordPress',
      serverIp: htmlResult.serverIp,
      signals: htmlResult.signals,
      hasTitle: htmlResult.hasTitle,
      titleTag: htmlResult.titleTag,
      titleLength: htmlResult.titleLength,
      hasMetaDescription: htmlResult.hasMetaDescription,
      metaDescription: htmlResult.metaDescription,
      metaDescriptionLength: htmlResult.metaDescriptionLength,
      hasH1: htmlResult.hasH1,
      h1Text: htmlResult.h1Text,
      multipleH1s: htmlResult.multipleH1s,
      hasCanonical: htmlResult.hasCanonical,
      hasRobotsTxt: availabilityResult.hasRobotsTxt,
      hasSitemap: availabilityResult.hasSitemap,
      isHttps: htmlResult.isHttps,
      primaryKeyword: htmlResult.primaryKeyword,
      hasFAQSchema: htmlResult.hasFAQSchema,
      hasPricingSchema: htmlResult.hasPricingSchema,
      hasLocalBusinessSchema: htmlResult.hasLocalBusinessSchema,
      hasReviewSchema: htmlResult.hasReviewSchema,
      hasGA4: htmlResult.hasGA4,
      hasGTM: htmlResult.hasGTM,
      hasFacebookPixel: htmlResult.hasFacebookPixel,
      hasTikTokPixel: htmlResult.hasTikTokPixel,
      hasCallTracking: htmlResult.hasCallTracking,
      hasUptimeMonitoring: htmlResult.hasUptimeMonitoring,
      uptimeService: htmlResult.uptimeService,
      hasBackup: false,
      backupService: '',
      backupCoveredByHost: false,
      backupMessage: '',
      imagesWithoutAlt: htmlResult.imagesWithoutAlt,
      hasAutoPlayVideo: htmlResult.hasAutoPlayVideo,
      videoHasPoster: htmlResult.videoHasPoster,
      wordpressPluginIssues: htmlResult.wordpressPluginIssues,
    };

    // Enrich video details with autoplay/poster from HTML agent
    if (speedResult.videoDetails.length > 0) {
      speedResult.hasAutoPlayVideo = techResult.hasAutoPlayVideo;
      speedResult.videoDetails = speedResult.videoDetails.map(v => ({
        ...v,
        isAutoPlay: techResult.hasAutoPlayVideo,
        hasPoster: techResult.videoHasPoster
      }));
    }

    // Enrich image alt text
    speedResult.nonWebpImageList = speedResult.nonWebpImageList.map(img => ({
      ...img,
      hasAltText: !techResult.imagesWithoutAlt.some(u => u.includes(img.url))
    }));

    console.log('STEP: scoreAudit starting');
    const { topIssues, topFixes } = scoreAudit(speedResult, techResult);
    console.log('STEP: scoreAudit done, supabase insert starting');

    const { data: audit, error } = await supabase
      .from('pingclose_audits')
      .insert({
        url: normalizedUrl,
        email: email || null,
        phone: phone || null,
        ip_address: ip,
        mobile_score: speedResult.mobileScore,
        desktop_score: speedResult.desktopScore,
        ttfb: speedResult.ttfb,
        lcp: speedResult.lcp,
        fcp: speedResult.fcp,
        cls: speedResult.cls,
        inp: speedResult.inp,
        total_page_size: speedResult.totalPageSize,
        total_requests: speedResult.totalRequests,
        passes_one_second: speedResult.passesOneSecond,
        cms: techResult.cms,
        hosting: techResult.hosting,
        cdn: techResult.cdn,
        http_version: techResult.httpVersion,
        images_lazy_loaded: speedResult.imagesLazyLoaded,
        images_webp: speedResult.imagesWebP,
        largest_image_kb: speedResult.largestImageKb,
        render_blocking_scripts: speedResult.renderBlockingScripts,
        top_issues: topIssues.slice(0, 15),
        top_fixes: topFixes,
        full_report: { speed: speedResult, tech: techResult, sitemap: sitemapResult }
      })
      .select('id')
      .single();

    if (error) {
      console.error('SUPABASE_INSERT_ERROR:', JSON.stringify({ message: error.message, details: error.details, hint: error.hint, code: error.code }));
    }

    const reportId = audit?.id || null;

    if (reportId) {
      const agencySignal = await checkAgencySignal(ip, reportId);
      await deliverReport({
        reportId,
        normalizedUrl,
        email: email || null,
        phone: phone || null,
        deliveryEmail,
        agencySignal,
        speedResult,
        techResult
      });
    }

    return NextResponse.json({
      success: true,
      reportId,
      mobileScore:     speedResult.mobileScore,
      desktopScore:    speedResult.desktopScore,
      ttfb:            speedResult.ttfb,
      lcp:             speedResult.lcp,
      fcp:             speedResult.fcp,
      cls:             speedResult.cls,
      inp:             speedResult.inp,
      passesOneSecond: speedResult.passesOneSecond,
      pageSpeedStatus: speedResult.pageSpeedStatus,
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message + '\n' + err.stack : JSON.stringify(err);
    console.error('AUDIT_FAIL_FULL:', msg);
    return NextResponse.json({ error: 'Audit failed. Please try again.' }, { status: 500 });
  }
}

