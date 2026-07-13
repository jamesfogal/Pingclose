import type { LocalSerpResult, LocalCompetitor } from './types';
import { dataforSeoPost } from './auth';

const NATIONAL_BRANDS = [
  'youtube.com', 'facebook.com', 'instagram.com', 'twitter.com', 'linkedin.com',
  'yelp.com', 'yellowpages.com', 'bbb.org', 'angi.com', 'thumbtack.com',
  'homeadvisor.com', 'homedepot.com', 'lowes.com', 'amazon.com', 'wikipedia.org',
  'reddit.com', 'tripadvisor.com', 'google.com',
];

function extractDomain(url: string): string {
  try { return new URL(url).hostname.replace('www.', ''); } catch { return url; }
}

function isNational(domain: string): boolean {
  return NATIONAL_BRANDS.some(b => domain.includes(b));
}

const RANK_CTR: Record<number, number> = { 1: 0.28, 2: 0.15, 3: 0.11, 4: 0.08, 5: 0.06, 6: 0.04, 7: 0.03, 8: 0.02, 9: 0.02, 10: 0.02 };

export async function getLocalSerp(
  keyword: string,
  location: string,
  customerDomain: string,
): Promise<LocalSerpResult> {
  const cleanCustomer = customerDomain.replace('www.', '');

  const serpJson = await dataforSeoPost(
    '/v3/serp/google/organic/live/advanced',
    [{ keyword, location_name: location, language_name: 'English', device: 'desktop', os: 'windows', depth: 20 }],
  ) as Record<string, unknown>;

  const serpItems: Record<string, unknown>[] = (serpJson as any)?.tasks?.[0]?.result?.[0]?.items ?? [];
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

  const topCompetitorDomain = localCompetitors[0]?.domain ?? null;
  if (topCompetitorDomain) {
    const metricsJson = await dataforSeoPost(
      '/v3/dataforseo_labs/google/domain_rank_overview/live',
      [{ target: topCompetitorDomain, location_name: 'United States', language_name: 'English' }],
    ) as Record<string, unknown>;

    const item = (metricsJson as any)?.tasks?.[0]?.result?.[0]?.items?.[0] ?? {};
    localCompetitors[0].monthlyClicks = Math.round(Number(item.metrics?.organic?.etv ?? 0));
  }

  const topClicks = localCompetitors[0]?.monthlyClicks ?? 0;
  const customerCtr = customerRank ? (RANK_CTR[customerRank] ?? 0.01) : 0;
  const topCtr = localCompetitors[0] ? (RANK_CTR[localCompetitors[0].rank] ?? 0.01) : 0.28;
  const customerMonthlyClicks = topClicks > 0 && topCtr > 0
    ? Math.round(topClicks * (customerCtr / topCtr))
    : 0;

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
