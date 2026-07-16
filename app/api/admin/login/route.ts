import { NextRequest, NextResponse } from 'next/server';
import { getClientIp, verifyAdminAuth } from '@/lib/adminRateLimiter';

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { password } = await req.json();
  const { ok, limited } = await verifyAdminAuth(ip, password);

  if (limited) {
    return NextResponse.json({ ok: false, error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 });
  }
  if (!ok) {
    return NextResponse.json({ ok: false, error: 'Invalid password' }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
