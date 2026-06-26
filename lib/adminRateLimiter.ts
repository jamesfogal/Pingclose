import { supabase } from '@/lib/supabase';

const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;

export async function checkAdminLoginRateLimit(ip: string): Promise<{ limited: boolean }> {
  try {
    const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString();
    const { count, error } = await supabase
      .from('pingclose_admin_login_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', ip)
      .gte('created_at', windowStart);

    if (error) {
      console.error('ADMIN_RATE_LIMIT_SUPABASE_ERROR:', JSON.stringify(error));
      return { limited: false };
    }

    return { limited: !!count && count >= MAX_ATTEMPTS };
  } catch (err) {
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    console.error('ADMIN_RATE_LIMIT_FAIL:', msg);
    return { limited: false };
  }
}

export async function recordAdminLoginAttempt(ip: string): Promise<void> {
  try {
    await supabase.from('pingclose_admin_login_attempts').insert({ ip_address: ip });
  } catch (err) {
    console.error('ADMIN_RATE_LIMIT_RECORD_FAIL:', err instanceof Error ? err.message : JSON.stringify(err));
  }
}
