import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { runPageSpeed } from '@/lib/pagespeed';
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

    const hostname = new URL(normalizedUrl).hostname;
    const baseUrl = new URL(normalizedUrl).origin;

    // Fire all 5 agents simultaneously — nothing waits for anything else
    const [speedResult, htmlResult, hostingResult, availabilityResult, sitemapResult] = await Promise.all([
      runPageSpeed(normalizedUrl),
      runHtmlAgent(normalizedUrl),
      runHostingAgent(hostname),
      runAvailabilityAgent(baseUrl),
      runSitemapAgent(baseUrl),
    ]);

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

    // Assemble backup detection (depends on hosting + cms, no extra network call)
    const { hasBackup, backupService, backupCoveredByHost, backupMessage } = detectBackup(
      finalHosting.hosting, htmlResult.cms, htmlResult.html
    );

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
      hasBackup,
      backupService,
      backupCoveredByHost,
      backupMessage,
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
        full_report: { speed: speedResult, tech: techResult, sitemap: sitemapResult }
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

// Backup detection — pure logic, no network calls
function detectBackup(hosting: string, cms: string, html: string) {
  let hasBackup = false;
  let backupService = '';
  let backupCoveredByHost = false;
  let backupMessage = '';

  if (hosting === 'WP Engine') {
    hasBackup = true; backupCoveredByHost = true;
    backupService = 'WP Engine Daily Backups';
    backupMessage = 'WP Engine automatically backs up your site daily and retains 40 days of backups.';
  } else if (hosting === 'Kinsta') {
    hasBackup = true; backupCoveredByHost = true;
    backupService = 'Kinsta Daily Backups';
    backupMessage = 'Kinsta automatically backs up your site daily and retains 14–30 days of backups.';
  } else if (cms === 'Wix') {
    hasBackup = true; backupCoveredByHost = true;
    backupService = 'Wix Automatic Backups';
    backupMessage = 'Wix automatically saves versions of your site that can be restored.';
  } else if (cms === 'Squarespace') {
    hasBackup = true; backupCoveredByHost = true;
    backupService = 'Squarespace Automatic Backups';
    backupMessage = 'Squarespace handles backups automatically on their infrastructure.';
  } else if (cms === 'Shopify') {
    hasBackup = true; backupCoveredByHost = true;
    backupService = 'Shopify Automatic Backups';
    backupMessage = 'Shopify maintains backups of your store data automatically.';
  }

  if (!hasBackup) {
    if (html.includes('updraftplus') || html.includes('updraft-plus')) {
      hasBackup = true; backupService = 'UpdraftPlus';
      backupMessage = 'UpdraftPlus backup plugin detected — automated backups are configured.';
    } else if (html.includes('jetpack-backup') || (html.includes('jetpack') && html.includes('backup'))) {
      hasBackup = true; backupService = 'Jetpack Backup';
      backupMessage = 'Jetpack Backup detected — real-time or daily backups are running.';
    } else if (html.includes('backupbuddy') || html.includes('backup-buddy')) {
      hasBackup = true; backupService = 'BackupBuddy';
      backupMessage = 'BackupBuddy detected — automated backups are configured.';
    } else if (html.includes('managewp') || html.includes('manage-wp')) {
      hasBackup = true; backupService = 'ManageWP Backups';
      backupMessage = 'ManageWP detected — includes automated backup management.';
    } else if (html.includes('vaultpress')) {
      hasBackup = true; backupService = 'VaultPress (Jetpack)';
      backupMessage = 'VaultPress backup service detected — real-time backups are active.';
    } else if (html.includes('duplicator')) {
      hasBackup = true; backupService = 'Duplicator';
      backupMessage = 'Duplicator plugin detected — manual or scheduled backups configured.';
    }
  }

  if (!hasBackup) {
    if (cms === 'WordPress') {
      backupMessage = 'Backup status unverifiable from outside — backup plugins run in the WordPress admin and leave no trace in public HTML. Confirm with your host or check your WP admin for UpdraftPlus, Jetpack Backup, or host-level snapshots.';
    } else if (cms !== 'Custom / Unknown') {
      backupMessage = 'Backup status unverifiable from outside. Confirm your hosting provider includes automated backups in your plan.';
    } else {
      backupMessage = 'Backup status unverifiable from outside. Contact your hosting provider to confirm automated backups are enabled.';
    }
  }

  return { hasBackup, backupService, backupCoveredByHost, backupMessage };
}
