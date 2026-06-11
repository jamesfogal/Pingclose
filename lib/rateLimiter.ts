import { supabase } from '@/lib/supabase';
import { sendLimitNotification } from '@/lib/email';

const VIP_EMAILS = ['jim@pingclose.com', 'james.fogal@gmail.com', 'james.fogal@citywidealarms.com'];

export function isVIP(email: string): boolean {
  return VIP_EMAILS.includes(email.toLowerCase());
}

export async function checkRateLimit(email: string): Promise<{ limited: boolean }> {
  if (isVIP(email)) return { limited: false };

  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from('pingclose_audits')
    .select('*', { count: 'exact', head: true })
    .eq('email', email)
    .gte('created_at', yesterday);

  if (count && count >= 5) {
    try { await sendLimitNotification(email, count + 1); } catch { /* non-blocking */ }
    return { limited: true };
  }

  return { limited: false };
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
