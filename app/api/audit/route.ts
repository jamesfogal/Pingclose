import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { runPageSpeed } from '@/lib/pagespeed';
import { detectTechStack } from '@/lib/htmlAudit';
import { sendReportEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { url, email } = await req.json();

    if (!url || !email) {
      return NextResponse.json({ error: 'URL and email are required' }, { status: 400 });
    }

    // Normalize URL
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;

    // Get IP for soft flagging
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ||
                req.headers.get('x-real-ip') ||
                '0.0.0.0';

    // Check for duplicate submission (same email + same domain in last 24 hours)
    const domain = new URL(normalizedUrl).hostname;
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: existing } = await supabase
      .from('pingclose_audits')
      .select('id')
      .eq('email', email)
      .ilike('url', `%${domain}%`)
      .gte('created_at', yesterday)
      .single();

    if (existing) {
      return NextResponse.json({
        duplicate: true,
        message: "Your report is already on its way — check your inbox."
      });
    }

    // Run PageSpeed and tech stack detection in parallel
    const [speedResult, techResult] = await Promise.all([
      runPageSpeed(normalizedUrl),
      detectTechStack(normalizedUrl)
    ]);

    // Build top issues list
    const topIssues = [];
    if (!speedResult.passesOneSecond) topIssues.push(`Mobile score ${speedResult.mobileScore}/100 — failing Google's 1-second hurdle`);
    if (speedResult.lcp > 2500) topIssues.push(`LCP is ${(speedResult.lcp/1000).toFixed(1)}s — should be under 2.5s`);
    if (speedResult.renderBlockingScripts > 0) topIssues.push(`${speedResult.renderBlockingScripts} render-blocking scripts slowing page load`);
    if (!speedResult.imagesWebP) topIssues.push('Images not converted to WebP — missing easy speed gains');
    if (!speedResult.imagesLazyLoaded) topIssues.push('Off-screen images loading immediately — lazy loading not enabled');
    if (speedResult.ttfb > 600) topIssues.push(`TTFB is ${speedResult.ttfb}ms — server is responding too slowly`);

    const topFixes = speedResult.opportunities.map(o => `${o.title} — ${o.savings}`);

    // Save to Supabase
    const { data: audit, error } = await supabase
      .from('pingclose_audits')
      .insert({
        url: normalizedUrl,
        email,
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
        top_issues: topIssues,
        top_fixes: topFixes,
        full_report: {
          speed: speedResult,
          tech: techResult
        }
      })
      .select('id')
      .single();

    if (error) throw error;

    // Check for agency signal (3+ different domains from same IP in 24 hours)
    const { count: ipCount } = await supabase
      .from('pingclose_audits')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', ip)
      .gte('created_at', yesterday);

    if (ipCount && ipCount >= 3) {
      await supabase
        .from('pingclose_audits')
        .update({ agency_signal: true })
        .eq('id', audit.id);
    }

    // Send report email
    await sendReportEmail(email, audit.id, normalizedUrl, speedResult.mobileScore, speedResult.passesOneSecond);

    return NextResponse.json({ success: true, reportId: audit.id });

  } catch (err) {
    console.error('Audit error:', err);
    return NextResponse.json({ error: 'Audit failed. Please try again.' }, { status: 500 });
  }
}
