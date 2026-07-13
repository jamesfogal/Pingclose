import type { KeywordResult } from './types';
import { dataforSeoPost } from './auth';

export async function getKeywordsForSite(domain: string, limit = 10): Promise<KeywordResult[]> {
  const json = await dataforSeoPost(
    '/v3/dataforseo_labs/google/keywords_for_site/live',
    [{ target: domain, language_name: 'English', location_name: 'United States', limit: limit + 10 }],
  ) as Record<string, unknown>;

  const items: Record<string, unknown>[] = (json as any)?.tasks?.[0]?.result?.[0]?.items ?? [];

  return items.map((item) => {
    const ki = item.keyword_info as Record<string, unknown> ?? {};
    return {
      keyword: String(item.keyword ?? ''),
      monthlySearches: Number(ki.search_volume ?? 0),
      competition: Number(ki.competition ?? 0),
      cpc: Number(ki.cpc ?? 0),
    };
  })
  .sort((a: KeywordResult, b: KeywordResult) => b.monthlySearches - a.monthlySearches)
  .slice(0, limit);
}
