import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('email_verifications')
      .select('id, code, attempts, expires_at')
      .eq('email', email.toLowerCase())
      .eq('verified', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ error: 'No verification code found. Please request a new one.' }, { status: 400 });
    }

    // Check expiry
    if (new Date(data.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Your code has expired. Please request a new one.' }, { status: 400 });
    }

    // Check attempts
    if (data.attempts >= 3) {
      return NextResponse.json({ error: 'Too many attempts. Please request a new code.' }, { status: 400 });
    }

    // Wrong code — increment attempts
    if (data.code !== code.trim()) {
      await supabase.from('email_verifications').update({ attempts: data.attempts + 1 }).eq('id', data.id);
      const left = 2 - data.attempts;
      return NextResponse.json({ error: `Invalid code. ${left} attempt${left === 1 ? '' : 's'} remaining.` }, { status: 400 });
    }

    // Correct — mark verified
    await supabase.from('email_verifications').update({ verified: true }).eq('id', data.id);

    return NextResponse.json({ verified: true });

  } catch (err) {
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    console.error('VERIFY_CODE_FAIL:', msg);
    return NextResponse.json({ error: 'Verification failed. Please try again.' }, { status: 500 });
  }
}
