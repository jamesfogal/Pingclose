import { supabase } from '@/lib/supabase';
import { sendLimitNotification } from '@/lib/email';

const VIP_EMAILS = ['jim@pingclose.com', 'james.fogal@gmail.com', 'james.fogal@citywidealarms.com'];

export function isVIP(email: string): boolean {
  return VIP_EMAILS.includes(email.toLowerCase());
}

export async function checkRateLimit(email: string): Promise<{ limited: boolean; reason?: 'limit' | 'error' }> {
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
      // Fail-closed (Jim's decision, PC-SEC9): /api/audit needs Supabase to
      // save the row anyway, so this costs almost nothing in practice, and
      // it closes the gap where a transient error on just this check let
      // audits through uncounted.
      return { limited: true, reason: 'error' };
    }

    if (count && count >= 5) {
      try { await sendLimitNotification(email, count + 1); } catch { /* non-blocking */ }
      return { limited: true, reason: 'limit' };
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    console.error('RATE_LIMIT_FAIL:', msg);
    return { limited: true, reason: 'error' };
  }

  return { limited: false };
}

// Guards /api/audit/fast, which has no email/account to key off of. It's
// always fired alongside /api/audit for the same visitor action, and that
// route already logs ip_address on every row — so this reuses that history
// instead of adding a new table just for this. Looser than the 5/email/day
// limit on the full audit since one IP can be a shared office/cafe network.
const IP_MAX_ATTEMPTS = 10;

// failClosed defaults to false (the original /api/audit/fast behavior,
// PC-SEC9: that route has no other Supabase dependency, so failing open on
// a transient error doesn't cost anything). Pass failClosed: true from a
// caller that inserts into Supabase regardless of this check's outcome
// (e.g. /api/audit for a phone-only submission, PC-SEC11) — same
// reasoning PC-SEC9 already used to make the email-based limiter fail
// closed: the row gets written either way, so a transient error here
// shouldn't let an unlimited number of audits through uncounted.
export async function checkIpRateLimit(ip: string, options?: { failClosed?: boolean }): Promise<{ limited: boolean; reason?: 'limit' | 'error' }> {
  const failClosed = options?.failClosed ?? false;
  try {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count, error } = await supabase
      .from('pingclose_audits')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', ip)
      .gte('created_at', yesterday);

    if (error) {
      console.error('IP_RATE_LIMIT_SUPABASE_ERROR:', JSON.stringify(error));
      return failClosed ? { limited: true, reason: 'error' } : { limited: false };
    }

    return { limited: !!count && count >= IP_MAX_ATTEMPTS, reason: 'limit' };
  } catch (err) {
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    console.error('IP_RATE_LIMIT_FAIL:', msg);
    return failClosed ? { limited: true, reason: 'error' } : { limited: false };
  }
}

// Guards /api/send-code (PC-SEC12) — that route had zero rate limiting,
// email or IP. Two separate caps: a tight per-email limit stops harassing
// one inbox with repeated code emails; a looser per-IP limit stops cycling
// through many different target addresses from one source. Both fail-closed
// on a Supabase error, matching PC-SEC9's reasoning — this route can't send
// a code without writing to email_verifications anyway, so failing closed
// costs almost nothing extra.
const EMAIL_CODE_MAX_PER_HOUR = 3;
const IP_CODE_MAX_PER_DAY     = 15;

export async function checkEmailCodeRateLimit(email: string): Promise<{ limited: boolean }> {
  if (isVIP(email)) return { limited: false };

  try {
    const windowStart = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count, error } = await supabase
      .from('email_verifications')
      .select('*', { count: 'exact', head: true })
      .eq('email', email.toLowerCase())
      .gte('created_at', windowStart);

    if (error) {
      console.error('EMAIL_CODE_RATE_LIMIT_SUPABASE_ERROR:', JSON.stringify(error));
      return { limited: true };
    }

    return { limited: !!count && count >= EMAIL_CODE_MAX_PER_HOUR };
  } catch (err) {
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    console.error('EMAIL_CODE_RATE_LIMIT_FAIL:', msg);
    return { limited: true };
  }
}

export async function checkIpCodeRateLimit(ip: string): Promise<{ limited: boolean }> {
  try {
    const windowStart = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count, error } = await supabase
      .from('email_verifications')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', ip)
      .gte('created_at', windowStart);

    if (error) {
      console.error('IP_CODE_RATE_LIMIT_SUPABASE_ERROR:', JSON.stringify(error));
      return { limited: true };
    }

    return { limited: !!count && count >= IP_CODE_MAX_PER_DAY };
  } catch (err) {
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    console.error('IP_CODE_RATE_LIMIT_FAIL:', msg);
    return { limited: true };
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
