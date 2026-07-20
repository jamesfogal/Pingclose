import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getClientIp, verifyAdminAuth } from '@/lib/adminRateLimiter';

async function auth(req: NextRequest): Promise<{ ok: boolean; limited: boolean }> {
  return verifyAdminAuth(getClientIp(req), req.headers.get('x-admin-password'), req.headers.get('x-admin-totp'));
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
    config[row.key] = row.value;
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
