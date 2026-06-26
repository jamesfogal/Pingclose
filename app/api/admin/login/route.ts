import { NextRequest, NextResponse } from 'next/server';
import { checkAdminLoginRateLimit, recordAdminLoginAttempt } from '@/lib/adminRateLimiter';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || '0.0.0.0';

  const { limited } = await checkAdminLoginRateLimit(ip);
  if (limited) {
    return NextResponse.json({ ok: false, error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 });
  }

  const { password } = await req.json();
  const correct = process.env.ADMIN_PASSWORD;

  if (!correct || password !== correct) {
    await recordAdminLoginAttempt(ip);
    return NextResponse.json({ ok: false, error: 'Invalid password' }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
