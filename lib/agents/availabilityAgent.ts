export interface AvailabilityAgentResult {
  hasRobotsTxt: boolean;
  hasSitemap: boolean;
}

// Agent: check robots.txt and sitemap.xml simultaneously
export async function runAvailabilityAgent(baseUrl: string): Promise<AvailabilityAgentResult> {
  const [robotsRes, sitemapRes] = await Promise.allSettled([
    fetch(`${baseUrl}/robots.txt`, { signal: AbortSignal.timeout(5000) }),
    fetch(`${baseUrl}/sitemap.xml`, { signal: AbortSignal.timeout(5000) })
  ]);
  return {
    hasRobotsTxt: robotsRes.status === 'fulfilled' && robotsRes.value.ok,
    hasSitemap: sitemapRes.status === 'fulfilled' && sitemapRes.value.ok,
  };
}
