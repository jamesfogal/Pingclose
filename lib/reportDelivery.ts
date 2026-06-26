import { sendReportEmail, sendLeadNotification } from '@/lib/email';
import type { PageSpeedResult } from '@/lib/agents/pagespeedAgent';
import type { TechStackResult } from '@/lib/htmlAudit';

interface DeliveryOptions {
  reportId: string;
  normalizedUrl: string;
  email: string | null;
  phone: string | null;
  deliveryEmail: boolean;
  agencySignal: boolean;
  speedResult: PageSpeedResult;
  techResult: TechStackResult;
}

export async function deliverReport(opts: DeliveryOptions): Promise<void> {
  const { reportId, normalizedUrl, email, deliveryEmail, agencySignal, speedResult, techResult } = opts;
  const tasks: Promise<unknown>[] = [];

  if (deliveryEmail && email) {
    console.log(`EMAIL: sending to=${email} from=${process.env.RESEND_FROM_EMAIL} keySet=${!!process.env.RESEND_API_KEY}`);
    tasks.push(sendReportEmail(email, reportId, normalizedUrl, speedResult.mobileScore, speedResult.passesOneSecond));
  }
  tasks.push(sendLeadNotification({
    reportId,
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
  }));

  const results = await Promise.allSettled(tasks);
  results.forEach((r, i) => {
    if (r.status === 'rejected') console.error(`DELIVERY FAILED [${i}]:`, r.reason);
    else console.log(`DELIVERY OK [${i}]`);
  });
}
