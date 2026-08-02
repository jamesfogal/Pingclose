import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getClientIp, verifyAdminAuth } from '@/lib/adminRateLimiter';

async function auth(req: NextRequest): Promise<{ ok: boolean; limited: boolean }> {
  return verifyAdminAuth(getClientIp(req), req.headers.get('x-admin-password'), req.headers.get('x-admin-totp'));
}

// PC-SEC8 — never return a secret-looking config value in full, even to an
// authenticated admin. Masked values are for display only, and are never
// meant to be a valid re-postable value (see app/setup/page.tsx, which never
// pre-fills its input with a GET response — only a freshly typed key is saved).
function maskSecret(value: string): string {
  if (value.length <= 10) return '••••••••';
  return `${value.slice(0, 6)}••••••••${value.slice(-4)}`;
}

export async function GET(req: NextRequest) {
  const { ok, limited } = await auth(req);
  if (limited) return NextResponse.json({ error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 });
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data } = await supabase
    .from('platform_config')
    .select('key, value');

  const config: Record<string, string> = {};
  (data || []).forEach((row: { key: string; value: string }) => {
    config[row.key] = /key|secret|password|token/i.test(row.key) ? maskSecret(row.value) : row.value;
  });

  return NextResponse.json(config);
}

export async function POST(req: NextRequest) {
  const { ok, limited } = await auth(req);
  if (limited) return NextResponse.json({ error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 });
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { resend_api_key } = await req.json();

  if (!resend_api_key?.startsWith('re_')) {
    return NextResponse.json({ error: 'Invalid key — must start with re_' }, { status: 400 });
  }

  const { error } = await supabase
    .from('platform_config')
    .upsert({ key: 'resend_api_key', value: resend_api_key, updated_at: new Date().toISOString() });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
