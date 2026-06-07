import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { runPageSpeed } from '@/lib/pagespeed';
import { detectTechStack } from '@/lib/htmlAudit';
import { sendReportEmail, sendLeadNotification } from '@/lib/email';

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

    // Duplicate check — same email + domain in last 24 hours
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

    // Enrich video details from htmlAudit
    if (speedResult.videoDetails.length > 0) {
      speedResult.hasAutoPlayVideo = techResult.hasAutoPlayVideo;
      speedResult.videoDetails = speedResult.videoDetails.map(v => ({
        ...v,
        isAutoPlay: techResult.hasAutoPlayVideo,
        hasPoster: techResult.videoHasPoster
      }));
    }

    // Enrich image alt text from htmlAudit
    speedResult.nonWebpImageList = speedResult.nonWebpImageList.map(img => ({
      ...img,
      hasAltText: !techResult.imagesWithoutAlt.some(u => u.includes(img.url))
    }));

    // ── Build comprehensive top issues list ──────────────────────
    const topIssues: string[] = [];

    // Speed issues
    if (!speedResult.passesOneSecond) topIssues.push(`Mobile score ${speedResult.mobileScore}/100 — failing Google's 1-second hurdle`);
    if (speedResult.lcp > 4000) topIssues.push(`LCP is ${(speedResult.lcp/1000).toFixed(1)}s — catastrophically slow (should be under 2.5s)`);
    else if (speedResult.lcp > 2500) topIssues.push(`LCP is ${(speedResult.lcp/1000).toFixed(1)}s — failing Google's Core Web Vitals threshold`);
    if (speedResult.ttfb > 800) topIssues.push(`Server response time is ${speedResult.ttfb}ms — host is too slow`);
    else if (speedResult.ttfb > 600) topIssues.push(`Server response time is ${speedResult.ttfb}ms — should be under 600ms`);
    if (speedResult.renderBlockingScripts > 0) topIssues.push(`${speedResult.renderBlockingScripts} render-blocking scripts delaying page load by ~${Math.round(speedResult.renderBlockingDetails.reduce((s, r) => s + r.savingsMs, 0))}ms`);
    if (speedResult.unusedJsKb > 50) topIssues.push(`${speedResult.unusedJsKb}KB of unused JavaScript loading on every visit`);
    if (speedResult.unusedCssKb > 30) topIssues.push(`${speedResult.unusedCssKb}KB of unused CSS loading on every visit`);
    if (speedResult.noBrowserCaching) topIssues.push('No browser caching — visitors re-download the same files on every visit');
    if (speedResult.hasFontDisplayIssue) topIssues.push('Fonts blocking render — missing font-display: swap causing text to be invisible during load');

    // Image issues
    if (speedResult.nonWebpImages > 0) topIssues.push(`${speedResult.nonWebpImages} of ${speedResult.totalImages} images not converted to WebP — estimated ${speedResult.estimatedWebPSavingKb}KB savings`);
    if (!speedResult.imagesLazyLoaded) topIssues.push('Off-screen images loading immediately — lazy loading not enabled');
    if (speedResult.imagesMissingAltText > 0) topIssues.push(`${speedResult.imagesMissingAltText} images missing alt text — hurting SEO and accessibility`);
    if (speedResult.largestImageKb > 500) topIssues.push(`Largest image is ${speedResult.largestImageKb}KB — oversized images are the #1 cause of slow mobile load times`);

    // Video issues
    if (speedResult.hasAutoPlayVideo) topIssues.push('Autoplay video detected — significantly increases mobile data usage and slows page load');
    if (speedResult.hasAboveFoldEmbed) topIssues.push('Video embed above the fold — YouTube/Vimeo iframes block page rendering until fully loaded');

    // Tech/hosting issues
    if (techResult.hostingVerdict === 'dead-zone') topIssues.push(`${techResult.hosting} hosting detected — this host cannot achieve under 1 second load time`);
    if (techResult.hostingVerdict === 'speed-limiter') topIssues.push(`${techResult.cms} platform detected — server-level speed optimizations are not available`);
    if (speedResult.hasRocketLoaderConflict) topIssues.push('Cloudflare Rocket Loader detected — often conflicts with WordPress and adds load time');
    if (speedResult.hasGTMBloat) topIssues.push('Google Tag Manager detected — verify all tags are necessary; unused tags waste load time');

    // SEO issues
    if (!techResult.hasTitle) topIssues.push('No title tag found — critical SEO issue');
    else if (techResult.titleLength > 60) topIssues.push(`Title tag is ${techResult.titleLength} characters — Google truncates at 60`);
    if (!techResult.hasMetaDescription) topIssues.push('No meta description — Google will pull random text for search results');
    if (!techResult.hasH1) topIssues.push('No H1 tag found — primary keyword signal is missing');
    if (techResult.multipleH1s) topIssues.push('Multiple H1 tags found — confuses search engines about page topic');
    if (!techResult.hasCanonical) topIssues.push('No canonical tag — risk of duplicate content issues');
    if (!techResult.hasSitemap) topIssues.push('No XML sitemap found — Google may not find all your pages');
    if (!techResult.isHttps) topIssues.push('Site not using HTTPS — security warning shown to visitors; Google ranking penalty');

    // Schema issues
    if (!techResult.hasFAQSchema) topIssues.push('No FAQ page with schema — missing free Google rich result opportunity');
    if (!techResult.hasPricingSchema) topIssues.push('No pricing page with schema — competitors with pricing pages rank higher');
    if (!techResult.hasLocalBusinessSchema) topIssues.push('No LocalBusiness schema — Google has less confidence in your local signals');

    // Conversion tracking
    if (!techResult.hasGA4 && !techResult.hasGTM) topIssues.push('No analytics detected — impossible to know which marketing channels are generating leads');
    if (!techResult.hasFacebookPixel) topIssues.push('No Facebook Pixel — Facebook and Instagram ads cannot track conversions');

    // Uptime
    if (!techResult.hasUptimeMonitoring) topIssues.push('No uptime monitoring detected — your site could be down right now and you would not know');

    // WordPress specifics
    topIssues.push(...techResult.wordpressPluginIssues);

    // Mobile gap
    if (speedResult.mobileDesktopGap >= 25) topIssues.push(`${speedResult.mobileDesktopGap}-point gap between mobile and desktop — your real customers are getting a dramatically worse experience`);

    // Top fixes (from opportunities)
    const topFixes = speedResult.opportunities.map(o => `${o.title}${o.savings ? ` — ${o.savings}` : ''}`);

    // ── Save to Supabase ─────────────────────────────────────────
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
        top_issues: topIssues.slice(0, 15),
        top_fixes: topFixes,
        full_report: {
          speed: speedResult,
          tech: techResult
        }
      })
      .select('id')
      .single();

    if (error) throw error;

    // ── Agency signal check ──────────────────────────────────────
    let agencySignal = false;
    const { count: ipCount } = await supabase
      .from('pingclose_audits')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', ip)
      .gte('created_at', yesterday);

    if (ipCount && ipCount >= 3) {
      agencySignal = true;
      await supabase
        .from('pingclose_audits')
        .update({ agency_signal: true })
        .eq('id', audit.id);
    }

    // ── Send emails in parallel ──────────────────────────────────
    await Promise.all([
      sendReportEmail(email, audit.id, normalizedUrl, speedResult.mobileScore, speedResult.passesOneSecond),
      sendLeadNotification({
        reportId: audit.id,
        url: normalizedUrl,
        email,
        mobileScore: speedResult.mobileScore,
        desktopScore: speedResult.desktopScore,
        passesOneSecond: speedResult.passesOneSecond,
        cms: techResult.cms,
        hosting: techResult.hosting,
        hostingVerdictLabel: techResult.hostingVerdictLabel,
        agencySignal,
        primaryKeyword: techResult.primaryKeyword
      })
    ]);

    return NextResponse.json({ success: true, reportId: audit.id });

  } catch (err) {
    console.error('Audit error:', err);
    return NextResponse.json({ error: 'Audit failed. Please try again.' }, { status: 500 });
  }
}
