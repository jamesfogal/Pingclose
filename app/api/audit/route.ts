import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { runPageSpeed } from '@/lib/pagespeed';
import { detectTechStack } from '@/lib/htmlAudit';
import { checkRateLimit, checkAgencySignal } from '@/lib/rateLimiter';
import { scoreAudit } from '@/lib/auditScorer';
import { deliverReport } from '@/lib/reportDelivery';

export async function POST(req: NextRequest) {
  try {
    const { url, email, phone, deliverySms = false, deliveryEmail = true } = await req.json();

    if (!url || (!email && !phone)) {
      return NextResponse.json({ error: 'URL and at least one delivery method are required' }, { status: 400 });
    }

    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || '0.0.0.0';

    const { limited } = await checkRateLimit(email);
    if (limited) {
      return NextResponse.json({ limit: true, message: "You've run 5 free audits today. Come back tomorrow for more!" });
    }

    const [speedResult, techResult] = await Promise.all([
      runPageSpeed(normalizedUrl),
      detectTechStack(normalizedUrl)
    ]);

    // Enrich video details
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

    const { topIssues, topFixes } = scoreAudit(speedResult, techResult);

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
        full_report: { speed: speedResult, tech: techResult }
      })
      .select('id')
      .single();

    if (error) throw error;

    const agencySignal = await checkAgencySignal(ip, audit.id);

    await deliverReport({
      reportId: audit.id,
      normalizedUrl,
      email: email || null,
      phone: phone || null,
      deliveryEmail,
      deliverySms,
      agencySignal,
      speedResult,
      techResult
    });

    return NextResponse.json({ success: true, reportId: audit.id });

  } catch (err) {
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    console.error('AUDIT_FAIL:', msg);
    return NextResponse.json({ error: 'Audit failed. Please try again.' }, { status: 500 });
  }
}
