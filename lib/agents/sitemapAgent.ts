export interface SitemapAgentResult {
  pageCount: number;
  landingPageCount: number;
  cityPageCount: number;
  landingPageUrls: string[];
  cityPageUrls: string[];
  hasSitemapIndex: boolean;
}

const STATE_CODES = new Set([
  'al','ak','az','ar','ca','co','ct','de','fl','ga','hi','id','il','in','ia',
  'ks','ky','la','me','md','ma','mi','mn','ms','mo','mt','ne','nv','nh','nj',
  'nm','ny','nc','nd','oh','ok','or','pa','ri','sc','sd','tn','tx','ut','vt',
  'va','wa','wv','wi','wy'
]);

const STATE_NAMES = [
  'alabama','alaska','arizona','arkansas','california','colorado','connecticut',
  'delaware','florida','georgia','hawaii','idaho','illinois','indiana','iowa',
  'kansas','kentucky','louisiana','maine','maryland','massachusetts','michigan',
  'minnesota','mississippi','missouri','montana','nebraska','nevada',
  'new-hampshire','new-jersey','new-mexico','new-york','north-carolina',
  'north-dakota','ohio','oklahoma','oregon','pennsylvania','rhode-island',
  'south-carolina','south-dakota','tennessee','texas','utah','vermont',
  'virginia','washington','west-virginia','wisconsin','wyoming'
];

function isLandingPage(path: string): boolean {
  const p = path.toLowerCase();
  return (
    /\/lp[/-]/.test(p) ||
    /\/landing[/-]/.test(p) ||
    /\/offer[/-]/.test(p) ||
    /\/promo[/-]/.test(p) ||
    /\/campaign[/-]/.test(p) ||
    /\/free-quote/.test(p) ||
    /\/get-started/.test(p) ||
    /\/sign-up/.test(p) ||
    /\/free-trial/.test(p)
  );
}

function isCityPage(path: string): boolean {
  const p = path.toLowerCase();
  const segments = p.split('/').filter(Boolean);
  const last = segments[segments.length - 1] || '';

  // Explicit location directory patterns
  if (/\/(location|locations|city|cities|service-area|service-areas|area|areas|region|regions)\//.test(p)) return true;

  // URL segment IS a state code (e.g. /plumber/mo/ or /mo/plumber/)
  if (segments.some(s => STATE_CODES.has(s))) return true;

  // URL contains a full state name slug
  if (STATE_NAMES.some(state => p.includes(`/${state}/`) || p.includes(`-${state}`))) return true;

  // Trailing state code suffix: /plumber-st-louis-mo or /st-louis-mo-plumber
  const twoLetterSuffix = last.match(/-([a-z]{2})$/);
  if (twoLetterSuffix && STATE_CODES.has(twoLetterSuffix[1])) return true;

  // Pattern: word-city-st or city-st-word (three+ segment slug with state code)
  const parts = last.split('-');
  if (parts.length >= 3 && STATE_CODES.has(parts[parts.length - 1])) return true;

  return false;
}

async function fetchSitemapUrls(sitemapUrl: string): Promise<string[]> {
  const res = await fetch(sitemapUrl, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return [];
  const xml = await res.text();
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map(m => m[1]);
}

// Agent: parse sitemap to count pages, landing pages, and city/location pages
export async function runSitemapAgent(baseUrl: string): Promise<SitemapAgentResult> {
  const empty: SitemapAgentResult = {
    pageCount: 0, landingPageCount: 0, cityPageCount: 0,
    landingPageUrls: [], cityPageUrls: [], hasSitemapIndex: false
  };

  try {
    const res = await fetch(`${baseUrl}/sitemap.xml`, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return empty;

    const xml = await res.text();
    const hasSitemapIndex = xml.includes('<sitemapindex');

    let allUrls: string[] = [];

    if (hasSitemapIndex) {
      // Sitemap index — fetch child sitemaps in parallel (cap at 6)
      const childUrls = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)]
        .map(m => m[1])
        .filter(u => u.endsWith('.xml'))
        .slice(0, 6);

      const results = await Promise.allSettled(childUrls.map(fetchSitemapUrls));
      allUrls = results
        .filter((r): r is PromiseFulfilledResult<string[]> => r.status === 'fulfilled')
        .flatMap(r => r.value);
    } else {
      allUrls = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map(m => m[1]);
    }

    const pageCount = allUrls.length;

    const landingPageUrls = allUrls
      .filter(u => { try { return isLandingPage(new URL(u).pathname); } catch { return false; } })
      .slice(0, 20);

    const cityPageUrls = allUrls
      .filter(u => { try { return isCityPage(new URL(u).pathname); } catch { return false; } })
      .slice(0, 50);

    return {
      pageCount,
      landingPageCount: landingPageUrls.length,
      cityPageCount: cityPageUrls.length,
      landingPageUrls,
      cityPageUrls,
      hasSitemapIndex,
    };
  } catch {
    return empty;
  }
}
