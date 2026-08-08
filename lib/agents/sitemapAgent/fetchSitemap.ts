export function countImageTags(xml: string): number {
  return [...xml.matchAll(/<image:image>/g)].length;
}

export async function fetchSitemapXml(sitemapUrl: string): Promise<string> {
  const res = await fetch(sitemapUrl, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return '';
  return res.text();
}
