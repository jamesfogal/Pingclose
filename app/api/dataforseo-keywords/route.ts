import { NextRequest, NextResponse } from 'next/server';
import { getKeywordsForSite } from '@/lib/agents/dataforSEOAgent/keywordsForSite';
import { getLocalSerp } from '@/lib/agents/dataforSEOAgent/localSerp';

export const maxDuration = 90;

export async function POST(req: NextRequest) {
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
