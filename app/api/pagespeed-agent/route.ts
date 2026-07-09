import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const maxDuration = 90;
import { runPageSpeedAgent, buildFallbackResult } from '@/lib/agents/pagespeedAgent';
import { runPreflightCheck } from '@/lib/agents/pagespeedAgent/preflightCheck';
import { scoreAudit } from '@/lib/auditScorer';
import { deliverReport } from '@/lib/reportDelivery';
import type { TechStackResult } from '@/lib/htmlAudit';

export async function POST(req: NextRequest) {
  const { reportId, url, deliveryEmail = false, agencySignal = false, email = null, phone = null } = await req.json();

  if (!reportId || !url) {
    return NextResponse.json({ error: 'reportId and url required' }, { status: 400 });
  }

  console.log('PAGESPEED_AGENT: starting for', reportId, url);

  // Fetch existing row to retrieve techResult stored in full_report
  const { data: existing, error: fetchError } = await supabase
    .from('pingclose_audits')
    .select('full_report')
    .eq('id', reportId)
    .single();

  if (fetchError || !existing) {
    console.error('PAGESPEED_AGENT: fetch failed', fetchError?.message);
    return NextResponse.json({ error: 'row not found' }, { status: 404 });
  }

  const techResult = (existing.full_report as Record<string, unknown>)?.tech as TechStackResult;

  // Pre-flight: DNS, HTTP status, redirects, TTFB, Cloudflare — before calling Google
  const preflight = await runPreflightCheck(url);
  console.log(
    'PAGESPEED_AGENT: preflight',
    preflight.diagnosticReason ?? 'OK',
    `dns=${preflight.dnsLookupMs}ms ttfb=${preflight.ttfbMs}ms status=${preflight.finalResponseStatus} cf=${preflight.cloudflareDetected} redirects=${preflight.redirectCount}`,
  );

  // Record start time and preflight results before the PageSpeed API call
  const startedAt = new Date().toISOString();
  const startMs   = Date.now();

  await supabase
    .from('pingclose_audits')
    .update({
      pagespeed_started_at:            startedAt,
      pagespeed_timeout_seconds:       75,
      preflight_final_url:             preflight.finalUrl,
      preflight_dns_status:            preflight.dnsStatus,
      preflight_dns_lookup_ms:         preflight.dnsLookupMs,
      preflight_http_status:           preflight.httpStatus,
      preflight_https_status:          preflight.httpsStatus,
      preflight_redirect_count:        preflight.redirectCount,
      preflight_final_response_status: preflight.finalResponseStatus,
      preflight_ttfb_ms:               preflight.ttfbMs,
      preflight_cloudflare_detected:   preflight.cloudflareDetected,
      preflight_blocked_or_challenged: preflight.blockedOrChallenged,
      preflight_diagnostic_reason:     preflight.diagnosticReason,
    })
    .eq('id', reportId);

  console.log('PAGESPEED_AGENT: started_at written', startedAt);

  // Run PageSpeed — never throws, has internal 75s AbortController timeout
  const agentResult = await runPageSpeedAgent(url);

  let speedResult;
  let pagespeedStatus: 'ok' | 'timeout' | 'error';
  let pagespeedErrorReason: string | null = null;

  if (agentResult.ok) {
    speedResult = agentResult.data;
    pagespeedStatus = 'ok';
  } else {
    console.error('PAGESPEED_AGENT: failed —', agentResult.error);
    const isTimeout = /timed out/i.test(agentResult.error);
    pagespeedStatus = isTimeout ? 'timeout' : 'error';

    // Enrich error reason: preflight tells us whether this was the website, Google, or unknown
    if (preflight.diagnosticReason) {
      pagespeedErrorReason = preflight.diagnosticReason;
    } else if (isTimeout) {
      // Preflight was clean — Google's API itself was slow, not the website
      pagespeedErrorReason = 'GOOGLE_API_TIMEOUT';
    } else {
      pagespeedErrorReason = agentResult.error.slice(0, 500);
    }

    speedResult = buildFallbackResult(isTimeout ? 'TIMEOUT' : 'ERROR');
  }

  // Enrich video details and image alt text using techResult (mirrors audit/route.ts logic)
  if (techResult && speedResult.videoDetails.length > 0) {
    speedResult.hasAutoPlayVideo = techResult.hasAutoPlayVideo;
    speedResult.videoDetails = speedResult.videoDetails.map(v => ({
      ...v,
      isAutoPlay: techResult.hasAutoPlayVideo,
      hasPoster: techResult.videoHasPoster,
    }));
  }
  if (techResult) {
    speedResult.nonWebpImageList = speedResult.nonWebpImageList.map(img => ({
      ...img,
      hasAltText: !techResult.imagesWithoutAlt.some(u => u.includes(img.url)),
    }));
  }

  // Re-score with real speed data
  const { topIssues, topFixes } = techResult
    ? scoreAudit(speedResult, techResult)
    : { topIssues: [], topFixes: [] };

  // Merge updated speed into existing full_report (preserve tech, sitemap, lawFaq, etc.)
  const updatedFullReport = {
    ...(existing.full_report as Record<string, unknown>),
    speed: speedResult,
  };

  const completedAt  = new Date().toISOString();
  const durationMs   = Date.now() - startMs;

  const { error: updateError } = await supabase
    .from('pingclose_audits')
    .update({
      pagespeed_status:        pagespeedStatus,
      pagespeed_completed_at:  completedAt,
      pagespeed_duration_ms:   durationMs,
      pagespeed_error_reason:  pagespeedErrorReason,
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
      images_lazy_loaded: speedResult.imagesLazyLoaded,
      images_webp: speedResult.imagesWebP,
      largest_image_kb: speedResult.largestImageKb,
      render_blocking_scripts: speedResult.renderBlockingScripts,
      top_issues: topIssues.slice(0, 15),
      top_fixes: topFixes,
      full_report: updatedFullReport,
    })
    .eq('id', reportId);

  if (updateError) {
    console.error('PAGESPEED_AGENT: update failed', updateError.message);
    return NextResponse.json({ error: 'update failed', detail: updateError.message }, { status: 500 });
  }

  // Send report + lead emails now that real scores exist
  try {
    await deliverReport({
      reportId,
      normalizedUrl: url,
      email,
      phone,
      deliveryEmail,
      agencySignal,
      speedResult,
      techResult,
    });
  } catch (mailErr) {
    console.error('PAGESPEED_AGENT: email delivery failed', mailErr);
  }

  console.log('PAGESPEED_AGENT: done', reportId, 'status=', pagespeedStatus, 'duration_ms=', durationMs);
  return NextResponse.json({ ok: true, reportId, pagespeedStatus, durationMs });
}
