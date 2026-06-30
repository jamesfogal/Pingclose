import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { runPageSpeedAgent, buildFallbackResult } from '@/lib/agents/pagespeedAgent';
import { scoreAudit } from '@/lib/auditScorer';
import type { TechStackResult } from '@/lib/htmlAudit';

export async function POST(req: NextRequest) {
  const { reportId, url } = await req.json();

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

  // Run PageSpeed — never throws, has internal 50s AbortController timeout
  const agentResult = await runPageSpeedAgent(url);

  let speedResult;
  let pagespeedStatus: 'ok' | 'timeout' | 'error';

  if (agentResult.ok) {
    speedResult = agentResult.data;
    pagespeedStatus = 'ok';
  } else {
    console.error('PAGESPEED_AGENT: failed —', agentResult.error);
    const isTimeout = /timed out/i.test(agentResult.error);
    pagespeedStatus = isTimeout ? 'timeout' : 'error';
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

  const { error: updateError } = await supabase
    .from('pingclose_audits')
    .update({
      pagespeed_status: pagespeedStatus,
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

  console.log('PAGESPEED_AGENT: done', reportId, 'status=', pagespeedStatus);
  return NextResponse.json({ ok: true, reportId, pagespeedStatus });
}
