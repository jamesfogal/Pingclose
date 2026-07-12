import { Resend } from 'resend';
import { supabase } from '@/lib/supabase';
import { cleanSecret } from '@/lib/cleanSecret';

async function getResend(): Promise<Resend> {
  // Try Supabase config first (set via /setup page)
  const { data } = await supabase
    .from('platform_config')
    .select('value')
    .eq('key', 'resend_api_key')
    .single();

  const key = cleanSecret(data?.value || process.env.RESEND_API_KEY);
  if (!key || !key.startsWith('re_')) throw new Error('No valid Resend API key configured. Visit /setup to add your key.');
  return new Resend(key);
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pingclose.com';
const fromEmail = process.env.RESEND_FROM_EMAIL || 'jim@pingclose.com';
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || 'jim@pingclose.com';

// ── Client Report Email ───────────────────────────────────────────
export async function sendReportEmail(
  toEmail: string,
  reportId: string,
  url: string,
  mobileScore: number,
  passesOneSecond: boolean,
  speedPending = false,
  lcp = 0
) {
  const tier = lcp > 0 && lcp < 1000 ? 'superstar' : lcp > 0 && lcp <= 2500 ? 'pass' : 'fail';
  const reportUrl = `${siteUrl}/report/${reportId}`;
  const scoreColor = mobileScore >= 70 ? '#10D9A0' : mobileScore >= 50 ? '#FBBF24' : '#F87171';
  const verdict = tier === 'superstar'
    ? '⭐ Under 1 second — the gold standard. Sites this fast convert up to 3–5× higher than slow sites.'
    : tier === 'pass'
    ? '✅ Passes Google\'s 2.5-second test — but 1 second is the gold standard. Bounce probability jumps 32% as load goes from 1s to 3s.'
    : '❌ Failing Google\'s speed test — 53% of mobile visitors abandon pages that take over 3 seconds.';
  const verdictSources = tier === 'superstar'
    ? 'Sources: <a href="https://www.thinkwithgoogle.com/marketing-strategies/app-and-mobile/mobile-page-speed-new-industry-benchmarks/" style="color:#64748B;">Google</a> · <a href="https://www.portent.com/blog/analytics/research-site-speed-hurting-everyones-revenue.htm" style="color:#64748B;">Portent</a>'
    : 'Source: <a href="https://www.thinkwithgoogle.com/marketing-strategies/app-and-mobile/mobile-page-speed-new-industry-benchmarks/" style="color:#64748B;">Google research</a>';

  const hostname = (() => { try { return new URL(url.startsWith('http') ? url : `https://${url}`).hostname; } catch { return url; } })();

  const resend = await getResend();
  await resend.emails.send({
    from: `PingClose <${fromEmail}>`,
    to: toEmail,
    subject: `Your site audit is ready — ${hostname}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
        <body style="margin:0;padding:0;background:#0B0E16;font-family:system-ui,-apple-system,sans-serif;">
          <div style="max-width:600px;margin:0 auto;padding:40px 24px;">

            <div style="text-align:center;margin-bottom:32px;">
              <div style="font-size:28px;font-weight:800;color:#10D9A0;letter-spacing:-1px;">PingClose</div>
              <div style="font-size:14px;color:#64748B;margin-top:4px;">Website Speed & SEO Audit</div>
            </div>

            <div style="background:#111827;border:1px solid #1F2937;border-radius:12px;padding:28px;margin-bottom:24px;text-align:center;">
              <div style="font-size:14px;color:#64748B;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.06em;">Mobile Performance Score</div>
              ${speedPending
                ? `<div style="font-size:36px;font-weight:800;color:#64748B;line-height:1;">Calculating…</div>
              <div style="font-size:16px;color:#64748B;margin-top:8px;">Speed score ready in under 60 seconds — refresh your report</div>`
                : `<div style="font-size:72px;font-weight:800;color:${scoreColor};line-height:1;">${mobileScore}</div>
              <div style="font-size:16px;color:#94A3B8;margin-top:8px;">${verdict}</div>
              <div style="font-size:12px;color:#64748B;margin-top:6px;">${verdictSources}</div>`
              }
              <div style="font-size:14px;color:#475569;margin-top:6px;">${hostname}</div>
            </div>

            <div style="text-align:center;margin-bottom:32px;">
              <a href="${reportUrl}" style="display:inline-block;background:#10D9A0;color:#0B0E16;font-size:16px;font-weight:700;padding:14px 32px;border-radius:8px;text-decoration:none;">
                View Your Full Report →
              </a>
              <div style="font-size:13px;color:#475569;margin-top:10px;">Your report is permanently saved at this link</div>
            </div>

            <div style="background:#111827;border:1px solid #1F2937;border-radius:12px;padding:24px;margin-bottom:24px;">
              <div style="font-size:13px;font-weight:700;color:#64748B;letter-spacing:0.08em;margin-bottom:14px;text-transform:uppercase;">Your Full Report Includes</div>
              ${[
                'Mobile & desktop speed scores',
                'Core Web Vitals — LCP, FCP, TTFB, CLS breakdown',
                'Every image checked — WebP status & savings estimate',
                'Hosting verdict — is your host holding you back?',
                'Google ranking for your primary keyword',
                'Conversion tracking — GA4, Facebook Pixel, TikTok Pixel',
                'What it would take to fix every issue found'
              ].map(item => `
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
                  <span style="color:#10D9A0;font-size:16px;flex-shrink:0;">✓</span>
                  <span style="font-size:16px;color:#94A3B8;">${item}</span>
                </div>
              `).join('')}
            </div>

            <div style="background:#0D1528;border:1px solid #1E3050;border-radius:12px;padding:24px;margin-bottom:24px;">
              <div style="font-size:17px;color:#F1F5F9;line-height:1.6;margin-bottom:16px;">
                We know exactly what it takes to get your site under 1 second. We've done it for dozens of local businesses in St. Louis.
              </div>
              <div style="font-size:16px;color:#10D9A0;font-weight:600;">Jim Fogal · (314) 517-2533</div>
              <div style="font-size:15px;color:#64748B;margin-top:4px;">Local SEO & Web Performance · St. Louis, MO</div>
            </div>

            <div style="text-align:center;font-size:14px;color:#374151;">
              You received this because you submitted ${hostname} to PingClose.com<br>
              <a href="${siteUrl}" style="color:#475569;">pingclose.com</a>
            </div>

          </div>
        </body>
      </html>
    `
  });
}

// ── Limit Hit Notification ───────────────────────────────────────
export async function sendLimitNotification(email: string, attemptNumber: number) {
  const resend = await getResend();
  await resend.emails.send({
    from: `PingClose Leads <${fromEmail}>`,
    to: NOTIFY_EMAIL,
    subject: `🔥 Rate Limit Hit — ${email} ran ${attemptNumber} audits today`,
    html: `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"></head>
        <body style="margin:0;padding:0;background:#0B0E16;font-family:system-ui,sans-serif;">
          <div style="max-width:500px;margin:0 auto;padding:40px 24px;">
            <div style="font-size:24px;font-weight:800;color:#10D9A0;margin-bottom:8px;">PingClose</div>
            <div style="font-size:14px;color:#64748B;margin-bottom:32px;">Rate Limit Alert</div>
            <div style="background:#0D1528;border:1px solid #F8717140;border-radius:12px;padding:24px;margin-bottom:24px;">
              <div style="font-size:18px;font-weight:700;color:#F87171;margin-bottom:16px;">🔥 Heavy User Alert</div>
              <div style="font-size:16px;color:#94A3B8;margin-bottom:8px;">
                <strong style="color:#F1F5F9;">${email}</strong> just attempted audit #${attemptNumber} today.
              </div>
              <div style="font-size:15px;color:#64748B;">
                They hit the 5/day limit. This could be an agency auditing client sites or a very motivated prospect.
              </div>
            </div>
            <div style="background:#111827;border:1px solid #1F2937;border-radius:12px;padding:20px;text-align:center;">
              <div style="font-size:16px;color:#F1F5F9;font-weight:600;margin-bottom:8px;">This person is HOT — reach out now</div>
              <div style="font-size:14px;color:#64748B;">Anyone running 5+ audits in a day is serious about their SEO.</div>
            </div>
          </div>
        </body>
      </html>
    `,
  });
}

// ── Jim's Lead Notification Email ────────────────────────────────
export async function sendLeadNotification(params: {
  reportId: string;
  url: string;
  email: string | null | undefined;
  phone: string | null | undefined;
  mobileScore: number;
  desktopScore: number;
  passesOneSecond: boolean;
  lcp?: number;
  cms: string;
  hosting: string;
  hostingVerdictLabel: string;
  agencySignal: boolean;
  primaryKeyword: string;
  speedPending?: boolean;
}) {
  const {
    reportId, url, email, phone, mobileScore, desktopScore,
    passesOneSecond, lcp = 0, cms, hosting, hostingVerdictLabel,
    agencySignal, primaryKeyword, speedPending = false
  } = params;

  const reportUrl = `${siteUrl}/report/${reportId}`;
  const adminUrl = `${siteUrl}/admin`;
  const hostname = (() => { try { return new URL(url.startsWith('http') ? url : `https://${url}`).hostname; } catch { return url; } })();

  const scoreColor = mobileScore >= 70 ? '#10D9A0' : mobileScore >= 50 ? '#FBBF24' : '#F87171';
  const tier = lcp > 0 && lcp < 1000 ? 'superstar' : lcp > 0 && lcp <= 2500 ? 'pass' : 'fail';
  const verdictBg = speedPending ? '#1E305015' : tier === 'superstar' ? '#10D9A015' : tier === 'pass' ? '#FBBF2415' : '#F8717115';
  const verdictBorder = speedPending ? '#1E305040' : tier === 'superstar' ? '#10D9A040' : tier === 'pass' ? '#FBBF2440' : '#F8717140';
  const verdictText = speedPending ? '⏳ Speed score calculating — check back shortly' : tier === 'superstar' ? '⭐ Under 1 second — the gold standard' : tier === 'pass' ? '✅ Passes 2.5s test — NOT the 1s gold standard (upsell speed)' : '❌ FAILING Google\'s 2.5-second test';
  const urgency = speedPending ? '📋 New audit submitted — speed score calculating' : tier === 'fail' ? '🔥 HOT LEAD — Site is failing. Call them now.' : tier === 'pass' ? '🟡 WARM LEAD — Passing, but not under 1 second.' : '📋 New audit submitted.';

  const resend = await getResend();
  await resend.emails.send({
    from: `PingClose Leads <${fromEmail}>`,
    to: NOTIFY_EMAIL,
    subject: `${agencySignal ? '🕵️ AGENCY — ' : ''}🚨 New Lead — ${hostname} — Score: ${speedPending ? 'Calculating…' : mobileScore}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
        <body style="margin:0;padding:0;background:#0B0E16;font-family:system-ui,-apple-system,sans-serif;">
          <div style="max-width:600px;margin:0 auto;padding:32px 24px;">

            <div style="text-align:center;margin-bottom:24px;">
              <div style="font-size:24px;font-weight:800;color:#10D9A0;">PingClose</div>
              <div style="font-size:14px;color:#64748B;">New Lead Alert</div>
            </div>

            <!-- Urgency Banner -->
            <div style="background:${verdictBg};border:1px solid ${verdictBorder};border-radius:10px;padding:18px 20px;margin-bottom:20px;text-align:center;">
              <div style="font-size:18px;font-weight:700;color:${tier === 'superstar' ? '#10D9A0' : tier === 'pass' ? '#FBBF24' : '#F87171'};">${urgency}</div>
              <div style="font-size:16px;color:#94A3B8;margin-top:6px;">${verdictText}</div>
            </div>

            <!-- Lead Details -->
            <div style="background:#0D1528;border:1px solid #1E3050;border-radius:10px;padding:24px;margin-bottom:20px;">
              <div style="font-size:13px;font-weight:700;color:#64748B;letter-spacing:0.08em;margin-bottom:16px;text-transform:uppercase;">Lead Details</div>

              <table style="width:100%;border-collapse:collapse;">
                ${[
                  ['🌐 Domain', hostname],
                  ['📧 Email', email],
                  ['📞 Phone', phone ? `<a href="tel:${phone}" style="color:#10D9A0;font-weight:700;font-size:18px;">${phone}</a>` : 'Not provided'],
                  ['📱 Mobile Score', speedPending ? `<span style="color:#64748B;font-weight:700;font-size:16px;">⏳ Calculating…</span>` : `<span style="color:${scoreColor};font-weight:700;font-size:18px;">${mobileScore}/100</span>`],
                  ['🖥️ Desktop Score', speedPending ? `<span style="color:#64748B;">⏳ Calculating…</span>` : `${desktopScore}/100`],
                  ['🔧 CMS', cms || 'Unknown'],
                  ['🏠 Hosting', `${hosting} — ${hostingVerdictLabel}`],
                  ['🔍 Primary Keyword', primaryKeyword || 'Not detected'],
                  ['🕵️ Agency Signal', agencySignal ? '⚠️ YES — may be auditing for a client' : 'No'],
                ].map(([label, value]) => `
                  <tr>
                    <td style="font-size:14px;color:#64748B;padding:8px 0;border-bottom:1px solid #1E3050;width:40%;">${label}</td>
                    <td style="font-size:16px;color:#F1F5F9;padding:8px 0;border-bottom:1px solid #1E3050;">${value}</td>
                  </tr>
                `).join('')}
              </table>
            </div>

            <!-- CTAs -->
            <div style="display:flex;gap:12px;margin-bottom:24px;text-align:center;">
              <a href="${reportUrl}" style="display:inline-block;background:#10D9A0;color:#0B0E16;font-size:16px;font-weight:700;padding:12px 24px;border-radius:8px;text-decoration:none;margin-right:12px;">
                View Full Report →
              </a>
              <a href="${adminUrl}" style="display:inline-block;background:#1E3050;color:#94A3B8;font-size:16px;font-weight:600;padding:12px 24px;border-radius:8px;text-decoration:none;">
                Open Admin →
              </a>
            </div>

            <!-- Call to action -->
            <div style="background:#111827;border:1px solid #1F2937;border-radius:10px;padding:20px;text-align:center;">
              <div style="font-size:17px;color:#F1F5F9;font-weight:600;margin-bottom:8px;">Ready to hear that phone ring?</div>
              <div style="font-size:15px;color:#64748B;">Call them while they're still looking at their report.</div>
              <a href="tel:+13145172533" style="display:inline-block;margin-top:12px;font-size:16px;color:#10D9A0;font-weight:700;text-decoration:none;">
                📞 (314) 517-2533 — Jim Fogal
              </a>
            </div>

          </div>
        </body>
      </html>
    `
  });
}
