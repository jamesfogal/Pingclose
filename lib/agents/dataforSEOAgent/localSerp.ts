import type { LocalSerpResult, LocalCompetitor } from './types';

// National brands to skip — we only want local competitors
const NATIONAL_BRANDS = ['adt.com', 'ring.com', 'vivint.com', 'brinks.com', 'simplisafe.com',
  'youtube.com', 'facebook.com', 'yelp.com', 'yellowpages.com', 'bbb.org', 'angi.com',
  'thumbtack.com', 'homeadvisor.com', 'homedepot.com', 'lowes.com', 'amazon.com'];

function getAuth(): string {
  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;
  if (!login || !password) throw new Error('DataForSEO credentials not configured');
  return 'Basic ' + Buffer.from(`${login}:${password}`).toString('base64');
}

function extractDomain(url: string): string {
  try { return new URL(url).hostname.replace('www.', ''); } catch { return url; }
}

function isNational(domain: string): boolean {
  return NATIONAL_BRANDS.some(b => domain.includes(b));
}

export async function getLocalSerp(
  keyword: string,
  location: string,
  customerDomain: string,
): Promise<LocalSerpResult> {
  const auth = getAuth();
  const cleanCustomer = customerDomain.replace('www.', '');

  // Call 1 — get local SERP
  const serpRes = await fetch('https://api.dataforseo.com/v3/serp/google/organic/live/advanced', {
    method: 'POST',
    headers: { 'Authorization': auth, 'Content-Type': 'application/json' },
    body: JSON.stringify([{
      keyword,
      location_name: location,
      language_name: 'English',
      device: 'desktop',
      os: 'windows',
      depth: 20,
    }]),
  });

  if (!serpRes.ok) throw new Error(`DataForSEO SERP API error: ${serpRes.status}`);
  const serpJson = await serpRes.json();
  const serpItems: Record<string, unknown>[] = serpJson?.tasks?.[0]?.result?.[0]?.items ?? [];

  const organicItems = serpItems.filter(i => i.type === 'organic');

  const localCompetitors: LocalCompetitor[] = [];
  let customerRank: number | null = null;

  organicItems.forEach((item, idx) => {
    const domain = extractDomain(String(item.url ?? ''));
    const rank = idx + 1;
    if (domain.includes(cleanCustomer)) customerRank = rank;
    if (!isNational(domain) && !domain.includes(cleanCustomer)) {
      localCompetitors.push({ rank, domain, title: String(item.title ?? ''), monthlyClicks: 0 });
    }
  });

  // Call 2 — get monthly clicks for #1 local competitor
  const topCompetitorDomain = localCompetitors[0]?.domain ?? null;
  if (topCompetitorDomain) {
    const metricsRes = await fetch('https://api.dataforseo.com/v3/dataforseo_labs/google/domain_rank_overview/live', {
      method: 'POST',
      headers: { 'Authorization': auth, 'Content-Type': 'application/json' },
      body: JSON.stringify([{
        target: topCompetitorDomain,
        location_name: 'United States',
        language_name: 'English',
      }]),
    });

    if (metricsRes.ok) {
      const metricsJson = await metricsRes.json();
      const metrics = metricsJson?.tasks?.[0]?.result?.[0] ?? {};
      localCompetitors[0].monthlyClicks = Number(metrics.metrics?.organic?.etv ?? 0);
    }
  }

  // Estimate customer monthly clicks based on rank
  const rankClickShare: Record<number, number> = { 1: 0.28, 2: 0.15, 3: 0.11, 4: 0.08, 5: 0.06 };
  const topClicks = localCompetitors[0]?.monthlyClicks ?? 0;
  const customerClickShare = customerRank ? (rankClickShare[customerRank] ?? 0.02) : 0.01;
  const customerMonthlyClicks = Math.round(topClicks * (customerClickShare / 0.28));

  return {
    keyword,
    location,
    customerDomain: cleanCustomer,
    customerRank,
    customerMonthlyClicks,
    topCompetitor: localCompetitors[0] ?? null,
    allCompetitors: localCompetitors.slice(0, 13),
  };
}
