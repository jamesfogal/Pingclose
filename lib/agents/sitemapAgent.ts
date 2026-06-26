export interface SitemapAgentResult {
  pageCount: number;
  landingPageCount: number;
  cityPageCount: number;
  eventPageCount: number;
  archivePageCount: number;
  blogPostCount: number;
  standardPageCount: number;
  landingPageUrls: string[];
  cityPageUrls: string[];
  blogPostUrls: string[];
  hasSitemapIndex: boolean;
  hasImageSitemap: boolean;
  imageCount: number;
  allUrls: string[];
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

function isEventPage(path: string): boolean {
  return /\/events?\//.test(path.toLowerCase());
}

function isArchivePage(path: string): boolean {
  return /\/(category|tag)\//.test(path.toLowerCase());
}

const UTILITY_SLUGS = new Set([
  'about', 'about-us', 'contact', 'contact-us', 'privacy-policy', 'privacy',
  'terms', 'terms-and-conditions', 'terms-of-service', 'testimonials', 'faq', 'faqs',
  'blog', 'services', 'service', 'pricing', 'careers', 'jobs', 'job-openings',
  'team', 'our-team', 'staff', 'free-consultation', 'consultation', 'legal-seminars',
  'seminars', 'practice-areas', 'locations', 'reviews', 'gallery', 'portfolio',
  'thank-you', 'sitemap',
]);

// Best-effort heuristic: a real content slug that isn't a known utility/nav page,
// landing page, city page, event, or taxonomy archive is treated as a blog/article post.
// This will misclassify unusual site structures — it's a v1 approximation, not exact.
function isBlogPost(path: string): boolean {
  const p = path.toLowerCase();
  const segments = p.split('/').filter(Boolean);
  if (segments.length === 0 || segments.length > 2) return false;
  const last = segments[segments.length - 1];
  if (UTILITY_SLUGS.has(last)) return false;
  if (segments[0] === 'practice-areas') return false;
  return true;
}

function countImageTags(xml: string): number {
  return [...xml.matchAll(/<image:image>/g)].length;
}

async function fetchSitemapXml(sitemapUrl: string): Promise<string> {
  const res = await fetch(sitemapUrl, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return '';
  return res.text();
}

// Agent: parse sitemap to count pages, landing pages, and city/location pages
export async function runSitemapAgent(baseUrl: string): Promise<SitemapAgentResult> {
  const empty: SitemapAgentResult = {
    pageCount: 0, landingPageCount: 0, cityPageCount: 0, eventPageCount: 0,
    archivePageCount: 0, blogPostCount: 0, standardPageCount: 0,
    landingPageUrls: [], cityPageUrls: [], blogPostUrls: [], hasSitemapIndex: false,
    hasImageSitemap: false, imageCount: 0, allUrls: [],
  };

  try {
    const xml = await fetchSitemapXml(`${baseUrl}/sitemap.xml`);
    if (!xml) return empty;

    const hasSitemapIndex = xml.includes('<sitemapindex');

    let allUrls: string[] = [];
    let imageCount = countImageTags(xml);

    if (hasSitemapIndex) {
      // Sitemap index — fetch child sitemaps in parallel (cap at 6)
      const childUrls = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)]
        .map(m => m[1])
        .filter(u => u.endsWith('.xml'))
        .slice(0, 6);

      const results = await Promise.allSettled(childUrls.map(fetchSitemapXml));
      const childXmls = results
        .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
        .map(r => r.value);

      allUrls = childXmls.flatMap(childXml => [...childXml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map(m => m[1]));
      imageCount += childXmls.reduce((sum, childXml) => sum + countImageTags(childXml), 0);
    } else {
      allUrls = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map(m => m[1]);
    }

    const pageCount = allUrls.length;

    const pathOf = (u: string): string | null => { try { return new URL(u).pathname; } catch { return null; } };

    const allLandingUrls = allUrls.filter(u => isLandingPage(pathOf(u) || ''));
    const allCityUrls = allUrls.filter(u => isCityPage(pathOf(u) || ''));
    const allEventUrls = allUrls.filter(u => isEventPage(pathOf(u) || ''));
    const allArchiveUrls = allUrls.filter(u => isArchivePage(pathOf(u) || ''));
    const allBlogUrls = allUrls.filter(u => {
      const p = pathOf(u);
      if (!p || isLandingPage(p) || isCityPage(p) || isEventPage(p) || isArchivePage(p)) return false;
      return isBlogPost(p);
    });

    const landingPageUrls = allLandingUrls.slice(0, 20);
    const cityPageUrls = allCityUrls.slice(0, 50);
    const blogPostUrls = allBlogUrls.slice(0, 20);

    const standardPageCount = pageCount - allLandingUrls.length - allCityUrls.length
      - allEventUrls.length - allArchiveUrls.length - allBlogUrls.length;

    return {
      pageCount,
      landingPageCount: allLandingUrls.length,
      cityPageCount: allCityUrls.length,
      eventPageCount: allEventUrls.length,
      archivePageCount: allArchiveUrls.length,
      blogPostCount: allBlogUrls.length,
      standardPageCount,
      landingPageUrls,
      cityPageUrls,
      blogPostUrls,
      hasSitemapIndex,
      hasImageSitemap: imageCount > 0,
      imageCount,
      allUrls,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : JSON.stringify(err);
    console.error('AGENT_FAIL: SitemapAgent —', msg);
    return empty;
  }
}
