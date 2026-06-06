import { Resend } from 'resend';

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY not set');
  return new Resend(key);
}
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pingclose.com';
const fromEmail = process.env.RESEND_FROM_EMAIL || 'reports@pingclose.com';

export async function sendReportEmail(
  toEmail: string,
  reportId: string,
  url: string,
  mobileScore: number,
  passesOneSecond: boolean
) {
  const reportUrl = `${siteUrl}/report/${reportId}`;
  const scoreColor = mobileScore >= 70 ? '#10D9A0' : mobileScore >= 50 ? '#FBBF24' : '#F87171';
  const verdict = passesOneSecond
    ? '✅ Your site passes the 1-second test'
    : '❌ Your site is failing Google\'s first hurdle';

  const resend = getResend();
  await resend.emails.send({
    from: `PingClose <${fromEmail}>`,
    to: toEmail,
    subject: `Your site audit is ready — ${new URL(url.startsWith('http') ? url : `https://${url}`).hostname}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
        <body style="margin:0;padding:0;background:#0B0E16;font-family:system-ui,-apple-system,sans-serif;">
          <div style="max-width:600px;margin:0 auto;padding:40px 24px;">

            <!-- Header -->
            <div style="text-align:center;margin-bottom:32px;">
              <div style="font-size:28px;font-weight:800;color:#10D9A0;letter-spacing:-1px;">PingClose</div>
              <div style="font-size:13px;color:#64748B;margin-top:4px;">Website Speed & SEO Audit</div>
            </div>

            <!-- Score card -->
            <div style="background:#111827;border:1px solid #1F2937;border-radius:12px;padding:28px;margin-bottom:24px;text-align:center;">
              <div style="font-size:13px;color:#64748B;margin-bottom:8px;">MOBILE PERFORMANCE SCORE</div>
              <div style="font-size:72px;font-weight:800;color:${scoreColor};line-height:1;">${mobileScore}</div>
              <div style="font-size:13px;color:#94A3B8;margin-top:8px;">${verdict}</div>
              <div style="font-size:12px;color:#475569;margin-top:6px;">${url}</div>
            </div>

            <!-- CTA -->
            <div style="text-align:center;margin-bottom:32px;">
              <a href="${reportUrl}" style="display:inline-block;background:#10D9A0;color:#0B0E16;font-size:15px;font-weight:700;padding:14px 32px;border-radius:8px;text-decoration:none;">
                View Full Report →
              </a>
              <div style="font-size:11px;color:#475569;margin-top:10px;">Your report is permanently saved at this link</div>
            </div>

            <!-- What's in the report -->
            <div style="background:#111827;border:1px solid #1F2937;border-radius:12px;padding:24px;margin-bottom:24px;">
              <div style="font-size:12px;font-weight:700;color:#64748B;letter-spacing:0.08em;margin-bottom:14px;">YOUR FULL REPORT INCLUDES</div>
              ${[
                'Mobile & desktop speed scores',
                'TTFB, LCP, FCP, CLS breakdown',
                'Hosting & tech stack identified',
                'Image optimization analysis',
                'Top 3 fixes to pass the 1-second test',
                'What it would take to fix each issue'
              ].map(item => `
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                  <span style="color:#10D9A0;font-size:14px;">✓</span>
                  <span style="font-size:13px;color:#94A3B8;">${item}</span>
                </div>
              `).join('')}
            </div>

            <!-- Closing hook -->
            <div style="background:#0D1528;border:1px solid #1E3050;border-radius:12px;padding:24px;margin-bottom:24px;">
              <div style="font-size:14px;color:#F1F5F9;line-height:1.6;margin-bottom:16px;">
                We know exactly what it takes to get your site under 1 second. We've done it for dozens of local businesses. Want us to take a look?
              </div>
              <div style="font-size:13px;color:#10D9A0;font-weight:600;">Jim Fogal · St. Louis, MO</div>
              <div style="font-size:12px;color:#475569;margin-top:4px;">Local SEO & Web Performance Specialist</div>
            </div>

            <!-- Footer -->
            <div style="text-align:center;font-size:11px;color:#374151;">
              You received this because you submitted ${url} to PingClose.com<br>
              <a href="${siteUrl}" style="color:#475569;">pingclose.com</a>
            </div>

          </div>
        </body>
      </html>
    `
  });
}
