import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';

export async function POST(req: NextRequest) {
  try {
    const { email, url } = await req.json();

    if (!email || !url) {
      return NextResponse.json({ error: 'Email and URL are required.' }, { status: 400 });
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    // Basic URL format check
    const urlRegex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/;
    if (!urlRegex.test(url)) {
      return NextResponse.json({ error: 'Please enter a valid website address.' }, { status: 400 });
    }

    // Check if URL is actually reachable
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(normalizedUrl, { method: 'HEAD', signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok && res.status >= 500) {
        return NextResponse.json({ error: "We couldn't reach that website. Please check the URL and try again." }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: "We couldn't reach that website. Please check the URL and try again." }, { status: 400 });
    }

    // Check if already verified — skip code step
    const { data: existing } = await supabase
      .from('email_verifications')
      .select('verified')
      .eq('email', email.toLowerCase())
      .eq('verified', true)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ alreadyVerified: true });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Store code — delete any previous unverified codes for this email first
    await supabase.from('email_verifications').delete().eq('email', email.toLowerCase()).eq('verified', false);
    await supabase.from('email_verifications').insert({ email: email.toLowerCase(), code, expires_at: expiresAt });

    // Send code via Resend
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) throw new Error('RESEND_API_KEY not set');
    const resend = new Resend(resendKey);

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'jim@pingclose.com',
      to: email,
      subject: 'Your PingClose verification code',
      html: `
        <div style="background:#0B0E16;padding:48px 32px;font-family:system-ui,sans-serif;text-align:center;">
          <div style="font-size:32px;font-weight:800;color:#10D9A0;margin-bottom:8px;letter-spacing:-1px;">
            Ping<span style="color:#F1F5F9">Close</span>
          </div>
          <p style="color:#94A3B8;font-size:16px;margin:0 0 40px;">Confirm your email to run your free audit</p>
          <div style="background:#0D1528;border:1px solid #1E3050;border-radius:16px;padding:40px 32px;display:inline-block;min-width:280px;">
            <p style="color:#64748B;font-size:14px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 16px;">Your verification code</p>
            <div style="font-size:64px;font-weight:800;color:#F1F5F9;letter-spacing:16px;font-variant-numeric:tabular-nums;margin-bottom:24px;">
              ${code}
            </div>
            <p style="color:#475569;font-size:14px;margin:0;">Valid for 10 minutes &nbsp;·&nbsp; 3 attempts max</p>
          </div>
          <p style="color:#374151;font-size:14px;margin:32px 0 0;">If you didn't request this, ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json({ sent: true });

  } catch (err) {
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    console.error('SEND_CODE_FAIL:', msg);
    return NextResponse.json({ error: 'Failed to send code. Please try again.' }, { status: 500 });
  }
}
