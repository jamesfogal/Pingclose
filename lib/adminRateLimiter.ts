import { timingSafeEqual as nodeTimingSafeEqual } from 'crypto';
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

function timingSafeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  // Compare against a same-length buffer first so a length mismatch doesn't
  // short-circuit before nodeTimingSafeEqual, keeping the check constant-time.
  if (bufA.length !== bufB.length) return nodeTimingSafeEqual(bufA, bufA) && false;
  return nodeTimingSafeEqual(bufA, bufB);
}

export function getClientIp(req: { headers: { get(name: string): string | null } }): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || '0.0.0.0';
}

/**
 * Single gate for every admin-authenticated route. All routes that check
 * ADMIN_PASSWORD must call this instead of comparing the header/body value
 * themselves — a bare `=== process.env.ADMIN_PASSWORD` check has no rate
 * limit, letting the password be brute-forced against that route directly.
 */
export async function verifyAdminAuth(ip: string, providedPassword: string | null | undefined): Promise<{ ok: boolean; limited: boolean }> {
  const { limited } = await checkAdminLoginRateLimit(ip);
  if (limited) return { ok: false, limited: true };

  const correct = process.env.ADMIN_PASSWORD;
  const ok = !!correct && !!providedPassword && timingSafeCompare(providedPassword, correct);
  if (!ok) await recordAdminLoginAttempt(ip);
  return { ok, limited: false };
}
