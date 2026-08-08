import { fetchSitemapXml, countImageTags } from './fetchSitemap';
import { isLandingPage, isCityPage, isEventPage, isArchivePage, isBlogPost } from './urlClassifier';
import type { SitemapAgentResult } from './types';

export type { SitemapAgentResult } from './types';

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
