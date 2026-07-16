import { supabase } from '@/lib/supabase';
import { sendLimitNotification } from '@/lib/email';

const VIP_EMAILS = ['jim@pingclose.com', 'james.fogal@gmail.com', 'james.fogal@citywidealarms.com'];

export function isVIP(email: string): boolean {
  return VIP_EMAILS.includes(email.toLowerCase());
}

export async function checkRateLimit(email: string): Promise<{ limited: boolean }> {
  if (isVIP(email)) return { limited: false };

  try {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count, error } = await supabase
      .from('pingclose_audits')
      .select('*', { count: 'exact', head: true })
      .eq('email', email)
      .gte('created_at', yesterday);

    if (error) {
      console.error('RATE_LIMIT_SUPABASE_ERROR:', JSON.stringify(error));
      return { limited: false };
    }

    if (count && count >= 5) {
      try { await sendLimitNotification(email, count + 1); } catch { /* non-blocking */ }
      return { limited: true };
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    console.error('RATE_LIMIT_FAIL:', msg);
    return { limited: false };
  }

  return { limited: false };
}

// Guards /api/audit/fast, which has no email/account to key off of. It's
// always fired alongside /api/audit for the same visitor action, and that
// route already logs ip_address on every row — so this reuses that history
// instead of adding a new table just for this. Looser than the 5/email/day
// limit on the full audit since one IP can be a shared office/cafe network.
const IP_MAX_ATTEMPTS = 10;

export async function checkIpRateLimit(ip: string): Promise<{ limited: boolean }> {
  try {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count, error } = await supabase
      .from('pingclose_audits')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', ip)
      .gte('created_at', yesterday);

    if (error) {
      console.error('IP_RATE_LIMIT_SUPABASE_ERROR:', JSON.stringify(error));
      return { limited: false };
    }

    return { limited: !!count && count >= IP_MAX_ATTEMPTS };
  } catch (err) {
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    console.error('IP_RATE_LIMIT_FAIL:', msg);
    return { limited: false };
  }
}

export async function checkAgencySignal(ip: string, auditId: string): Promise<boolean> {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from('pingclose_audits')
    .select('*', { count: 'exact', head: true })
    .eq('ip_address', ip)
    .gte('created_at', yesterday);

  if (count && count >= 3) {
    await supabase.from('pingclose_audits').update({ agency_signal: true }).eq('id', auditId);
    return true;
  }
  return false;
}
