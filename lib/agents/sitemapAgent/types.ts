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
