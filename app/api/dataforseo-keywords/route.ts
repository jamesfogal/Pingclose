import { NextRequest, NextResponse } from 'next/server';
import { getKeywordsForSite } from '@/lib/agents/dataforSEOAgent/keywordsForSite';
import { getLocalSerp } from '@/lib/agents/dataforSEOAgent/localSerp';
import { timingSafeCompare } from '@/lib/adminRateLimiter';

export const maxDuration = 90;

// Server-to-server only (PC-SEC7) — every call costs money against the
// DataForSEO API. This route has no customer-facing caller today; it's
// meant to be invoked by other server code (e.g. the report page, once
// PC-C5 wires it in), never by a visitor's browser directly.
export async function POST(req: NextRequest) {
  const internalSecret = process.env.INTERNAL_API_SECRET;
  const providedSecret  = req.headers.get('x-internal-secret');
  if (!internalSecret || !providedSecret || !timingSafeCompare(providedSecret, internalSecret)) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const { domain, keyword, location, customerDomain } = await req.json();

  // Mode 1 — keywords for site (H1 research)
  if (domain) {
    const t0 = Date.now();
    const keywords = await getKeywordsForSite(domain, 15);
    const durationMs = Date.now() - t0;
    console.log(`DATAFORSEO: keywordsForSite domain=${domain} durationMs=${durationMs}`);
    return NextResponse.json({ keywords, durationMs });
  }

  // Mode 2 — local SERP + competitor click comparison
  if (keyword && location && customerDomain) {
    const t0 = Date.now();
    const result = await getLocalSerp(keyword, location, customerDomain);
    const durationMs = Date.now() - t0;
    console.log(`DATAFORSEO: localSerp keyword=${keyword} location=${location} durationMs=${durationMs}`);
    return NextResponse.json({ ...result, durationMs });
  }

  return NextResponse.json({ error: 'Provide domain OR keyword+location+customerDomain' }, { status: 400 });
}
