import type { KeywordResult } from './types';

function getAuth(): string {
  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;
  if (!login || !password) throw new Error('DataForSEO credentials not configured');
  return 'Basic ' + Buffer.from(`${login}:${password}`).toString('base64');
}

export async function getKeywordsForSite(domain: string, limit = 10): Promise<KeywordResult[]> {
  const res = await fetch('https://api.dataforseo.com/v3/dataforseo_labs/google/keywords_for_site/live', {
    method: 'POST',
    headers: { 'Authorization': getAuth(), 'Content-Type': 'application/json' },
    body: JSON.stringify([{
      target: domain,
      language_name: 'English',
      location_name: 'United States',
      limit,
      order_by: ['keyword_data.keyword_info.monthly_searches,desc'],
    }]),
  });

  if (!res.ok) throw new Error(`DataForSEO keywords API error: ${res.status}`);

  const json = await res.json();
  const items = json?.tasks?.[0]?.result?.[0]?.items ?? [];

  return items.map((item: Record<string, unknown>) => {
    const kd = item.keyword_data as Record<string, unknown> ?? {};
    const ki = kd.keyword_info as Record<string, unknown> ?? {};
    return {
      keyword: String(item.keyword ?? ''),
      monthlySearches: Number(ki.monthly_searches ?? 0),
      competition: Number(ki.competition ?? 0),
      cpc: Number(ki.cpc ?? 0),
    };
  });
}
