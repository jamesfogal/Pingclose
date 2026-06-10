/**
 * Twilio SMS helper for PingClose
 * Sends the report link to the user's phone
 */

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pingclose.com';

function getTwilioConfig() {
  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from  = process.env.TWILIO_PHONE_NUMBER;
  if (!sid || !token || !from) throw new Error('Twilio env vars not configured');
  return { sid, token, from };
}

/** Normalize to E.164 — assumes US if no country code */
function toE164(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('1') && digits.length === 11) return `+${digits}`;
  if (digits.length === 10) return `+1${digits}`;
  return `+${digits}`;
}

export async function sendReportSms(
  toPhone: string,
  reportId: string,
  siteHostname: string,
  mobileScore: number,
  passesOneSecond: boolean
) {
  const { sid, token, from } = getTwilioConfig();
  const reportUrl = `${siteUrl}/report/${reportId}`;
  const verdict   = passesOneSecond ? '✅ Passes 1-second test' : '❌ Failing Google\'s 1-second hurdle';

  const body = [
    `Your PingClose report for ${siteHostname} is ready.`,
    `Mobile score: ${mobileScore}/100 — ${verdict}`,
    `View full report → ${reportUrl}`,
  ].join('\n');

  const params = new URLSearchParams({
    From: from,
    To:   toE164(toPhone),
    Body: body,
  });

  const resp = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type':  'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'),
      },
      body: params.toString(),
    }
  );

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Twilio SMS failed: ${err}`);
  }

  return await resp.json();
}
