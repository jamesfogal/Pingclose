import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';

function auth(req: NextRequest) {
  return req.headers.get('x-admin-password') === process.env.ADMIN_PASSWORD;
}

export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Get key from Supabase
  const { data } = await supabase
    .from('platform_config')
    .select('value')
    .eq('key', 'resend_api_key')
    .single();

  const apiKey = data?.value;

  if (!apiKey?.startsWith('re_')) {
    return NextResponse.json({ error: 'No valid Resend API key saved yet' }, { status: 400 });
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: 'PingClose <jim@pingclose.com>',
      to: 'james.fogal@gmail.com',
      subject: '✅ PingClose Email Test — It Works!',
      html: `
        <div style="background:#0B0E16;color:#F1F5F9;padding:40px;font-family:system-ui,sans-serif;max-width:500px;margin:0 auto;border-radius:12px;">
          <div style="font-size:28px;font-weight:800;color:#10D9A0;margin-bottom:16px;">PingClose</div>
          <div style="font-size:20px;font-weight:700;margin-bottom:12px;">✅ Email is working!</div>
          <div style="font-size:16px;color:#94A3B8;">Your Resend API key is configured correctly. Lead notification emails and report emails will now deliver successfully.</div>
        </div>
      `,
    });
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
