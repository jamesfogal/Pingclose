import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

function auth(req: NextRequest) {
  return req.headers.get('x-admin-password') === process.env.ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
