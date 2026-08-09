import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const maxDuration = 90;
import { runPageSpeedAgent, buildFallbackResult } from '@/lib/agents/pagespeedAgent';
import { runPreflightCheck } from '@/lib/agents/pagespeedAgent/preflightCheck';
import { scoreAudit } from '@/lib/auditScorer';
import { deliverReport } from '@/lib/reportDelivery';
import { sendPageSpeedFailureAlert } from '@/lib/email';
import { assertPublicHostname } from '@/lib/ssrfGuard';
import { isVIP } from '@/lib/rateLimiter';
import type { TechStackResult } from '@/lib/htmlAudit';

export async function POST(req: NextRequest) {
  const { reportId, deliveryEmail = false, agencySignal = false } = await req.json();

  if (!reportId) {
    return NextResponse.json({ error: 'reportId required' }, { status: 400 });
  }

  // Fetch existing row to retrieve techResult stored in full_report, plus the
  // real email/phone/url on file — never trust delivery contact info OR the
  // target URL from the request body, since this route has no auth and
  // anyone who knows a reportId could otherwise redirect report emails to an
  // address they choose, or overwrite a real report's scores with results
  // for an unrelated URL of their choosing.
  const { data: existing, error: fetchError } = await supabase
    .from('pingclose_audits')
    .select('url, full_report, email, phone, ip_address, pagespeed_status, pagespeed_started_at, pagespeed_completed_at, manual_retry_count')
    .eq('id', reportId)
    .single();

  if (fetchError || !existing) {
    console.error('PAGESPEED_AGENT: fetch failed', fetchError?.message);
    return NextResponse.json({ error: 'row not found' }, { status: 404 });
  }

  const url = existing.url as string;

  try {
    await assertPublicHostname(new URL(url).hostname);
  } catch {
    return NextResponse.json({ error: 'Site could not be reached.' }, { status: 422 });
  }

  console.log('PAGESPEED_AGENT: starting for', reportId, url);

  // A resolved status already on the row (not 'pending') means this call is a
  // manual retry, not the original automatic run fired by /api/audit's after().
  const isManualRetry = !!existing.pagespeed_status && existing.pagespeed_status !== 'pending';

  // Guard against spamming this route directly — the customer-facing "Retry
  // Speed Check" button only disables itself client-side while in flight, so
  // enforce it here too using timestamps already on the row. Blocks two
  // cases: a run already in progress, and retrying again too soon after one
  // just finished.
  const now = Date.now();
  const startedAtMs   = existing.pagespeed_started_at   ? new Date(existing.pagespeed_started_at as string).getTime()   : 0;
  const completedAtMs = existing.pagespeed_completed_at ? new Date(existing.pagespeed_completed_at as string).getTime() : 0;

  if (startedAtMs && startedAtMs > completedAtMs && now - startedAtMs < 90_000) {
    return NextResponse.json({ error: 'A speed check is already running for this report. Please wait.' }, { status: 429 });
  }
  if (completedAtMs && now - completedAtMs < 30_000) {
    return NextResponse.json({ error: 'Please wait a moment before retrying again.' }, { status: 429 });
  }

  const email = existing.email as string | null;
  const phone = existing.phone as string | null;
  const ipAddress = existing.ip_address as string | null;
  const techResult = (existing.full_report as Record<string, unknown>)?.tech as TechStackResult;

  // Daily retry cap for manual retries only — 5 total retries or 3 distinct
  // websites retried in a rolling 24h window, whichever hits first. Jim (VIP
  // emails) is exempt. Keyed by email when known, IP for phone-only leads.
  if (isManualRetry && !(email && isVIP(email))) {
    const identityKey = email?.toLowerCase() || ipAddress;
    if (identityKey) {
      // Filtered by pagespeed_completed_at (updates on every retry, not just
      // the original run) so a retry on an old report still counts — created_at
      // would only catch reports submitted in the last 24h, missing retries
      // on anything older.
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: recent } = email
        ? await supabase.from('pingclose_audits').select('id, manual_retry_count').eq('email', identityKey).gte('pagespeed_completed_at', since)
        : await supabase.from('pingclose_audits').select('id, manual_retry_count').eq('ip_address', identityKey).gte('pagespeed_completed_at', since);

      if (recent) {
        const totalRetries = recent.reduce((sum, r) => sum + (r.manual_retry_count || 0), 0);
        const distinctSitesRetried = recent.filter(r => (r.manual_retry_count || 0) > 0).length;
        if (totalRetries >= 5 || distinctSitesRetried >= 3) {
          return NextResponse.json({ error: "You've reached today's retry limit. Please try again tomorrow, or contact us if this keeps happening." }, { status: 429 });
        }
      }
    }
  }

  // Atomic claim, not just the timestamp checks above. This route is public
  // and unauthenticated (called via a plain fetch from /api/audit's after(),
  // no internal secret) — the checks above read the row, then decide, then
  // write, which leaves a window where concurrent requests can all read
  // "not in flight" before any of them commits their claim. Since #48 races
  // two independent PageSpeed attempts (4 Google API calls per invocation
  // now, not 2), that race is real money: N concurrent requests against one
  // freshly-submitted reportId, fired before /api/audit's own automatic
  // call ever sets pagespeed_started_at, would all pass every guard above.
  // Postgres serializes concurrent UPDATEs to the same row — only the
  // request whose expected-current-value still matches after the row lock
  // is granted actually updates anything, so exactly one wins regardless of
  // how many requests arrive at once.
  const claimQuery = supabase.from('pingclose_audits').update({ pagespeed_started_at: new Date().toISOString() }).eq('id', reportId);
  const { data: claimed, error: claimError } = await (
    existing.pagespeed_started_at
      ? claimQuery.eq('pagespeed_started_at', existing.pagespeed_started_at as string)
      : claimQuery.is('pagespeed_started_at', null)
  ).select('id');

  if (claimError || !claimed || claimed.length === 0) {
    return NextResponse.json({ error: 'A speed check is already running for this report, or was just retried. Please wait a moment.' }, { status: 429 });
  }

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

  // Only a manual retry that actually resolves (ok or error) consumes the
  // customer's daily quota — a timeout isn't their fault, so it's free.
  const newManualRetryCount = isManualRetry && pagespeedStatus !== 'timeout'
    ? (existing.manual_retry_count || 0) + 1
    : (existing.manual_retry_count || 0);

  const { error: updateError } = await supabase
    .from('pingclose_audits')
    .update({
      pagespeed_status:        pagespeedStatus,
      pagespeed_completed_at:  completedAt,
      pagespeed_duration_ms:   durationMs,
      pagespeed_error_reason:  pagespeedErrorReason,
      pagespeed_retry_count:   agentResult.retryCount,
      manual_retry_count:      newManualRetryCount,
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
      images_lazy_loaded: techResult?.imagesLazyLoaded ?? false,
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

  // Alert Jim immediately when PageSpeed genuinely failed to produce a score —
  // the routine lead-notification email below only ever says "calculating",
  // it never distinguishes a real failure from one still in progress.
  if (pagespeedStatus === 'timeout' || pagespeedStatus === 'error') {
    try {
      await sendPageSpeedFailureAlert({ reportId, url, status: pagespeedStatus, reason: pagespeedErrorReason });
    } catch (alertErr) {
      console.error('PAGESPEED_AGENT: failure alert email failed', alertErr);
    }
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
