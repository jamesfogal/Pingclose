import { NextRequest, NextResponse } from 'next/server';
import { getKeywordsForSite } from '@/lib/agents/dataforSEOAgent/keywordsForSite';
import { getLocalSerp } from '@/lib/agents/dataforSEOAgent/localSerp';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const { domain, keyword, location, customerDomain } = await req.json();

  // Mode 1 — keywords for site (H1 research)
  if (domain) {
    const keywords = await getKeywordsForSite(domain, 15);
    return NextResponse.json({ keywords });
  }

  // Mode 2 — local SERP + competitor click comparison
  if (keyword && location && customerDomain) {
    const result = await getLocalSerp(keyword, location, customerDomain);
    return NextResponse.json(result);
  }

  return NextResponse.json({ error: 'Provide domain OR keyword+location+customerDomain' }, { status: 400 });
}
