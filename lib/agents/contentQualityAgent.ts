export interface ContentQualityResult {
  pagesSampled: number;
  avgWordCount: number;
  avgInternalLinks: number;
  recommendedLinksPerPost: number;
  qaPageCount: number;
}

const WORDS_PER_LINK = 150;
const SAMPLE_CAP = 12;

async function fetchHtml(url: string): Promise<string> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return '';
    return res.text();
  } catch {
    return '';
  }
}

const CONTENT_START_PATTERN = /class=["'][^"']*\b(entry-content|post-content|article-content|single-content|cz_post_content|theme-post-content)\b[^"']*["']/i;
const CONTENT_END_PATTERN = /class=["'][^"']*\b(related-post|related_post|cz_related_post|next_prev_post|next-prev-post|cz_next_prev|sidebar|comments-area|comment-respond|you-may-also-like|popular-post|recent-post)/i;

// Most page builders (Elementor, Divi, etc.) don't use semantic <header>/<nav>/<aside>
// tags, so generic tag-stripping leaves "related posts" and "next/prev post" link
// blocks in place — those repeat on every page and aren't real contextual links the
// author placed. Slicing from the known content-container class to the next known
// "related/sidebar" marker isolates the actual article body on most WordPress themes.
function extractBody(html: string): string {
  const stripped = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ');

  const startMatch = CONTENT_START_PATTERN.exec(stripped);
  if (!startMatch) {
    return stripped
      .replace(/<header[\s\S]*?<\/header>/gi, ' ')
      .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
      .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
      .replace(/<aside[\s\S]*?<\/aside>/gi, ' ');
  }

  const contentStart = stripped.indexOf('>', startMatch.index) + 1;
  const endMatch = CONTENT_END_PATTERN.exec(stripped.slice(contentStart));
  const contentEnd = endMatch ? contentStart + endMatch.index : stripped.length;

  return stripped.slice(contentStart, contentEnd);
}

function countWords(bodyHtml: string): number {
  const text = bodyHtml.replace(/<[^>]+>/g, ' ').trim();
  return text ? text.split(/\s+/).length : 0;
}

function countInternalLinks(bodyHtml: string, hostname: string, pagePath: string): number {
  const hrefs = [...bodyHtml.matchAll(/href=["']([^"']+)["']/gi)].map(m => m[1]);
  let count = 0;
  for (const href of hrefs) {
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) continue;
    try {
      const u = href.startsWith('/') ? new URL(href, `https://${hostname}`) : new URL(href);
      if (u.hostname !== hostname) continue;
      if (u.pathname === '/' || u.pathname === pagePath) continue;
      if (/\/(category|tag)\//.test(u.pathname)) continue;
      count++;
    } catch {
      continue;
    }
  }
  return count;
}

function hasQAContent(bodyHtml: string): boolean {
  const questionHeadings = bodyHtml.match(/<h[2-6][^>]*>([^<]*\?)\s*<\/h[2-6]>/gi) || [];
  const hasFaqSchema = /"@type"\s*:\s*"FAQPage"/i.test(bodyHtml);
  return questionHeadings.length > 0 || hasFaqSchema;
}

// Samples up to SAMPLE_CAP blog posts and measures real on-page SEO signals —
// internal linking and Q&A content — that pure HTML/schema checks can't see.
export async function analyzeContentQuality(blogPostUrls: string[], hostname: string): Promise<ContentQualityResult> {
  const sample = blogPostUrls.slice(0, SAMPLE_CAP);
  if (sample.length === 0) {
    return { pagesSampled: 0, avgWordCount: 0, avgInternalLinks: 0, recommendedLinksPerPost: 0, qaPageCount: 0 };
  }

  const htmls = await Promise.all(sample.map(fetchHtml));

  let totalWords = 0;
  let totalLinks = 0;
  let qaPageCount = 0;
  let pagesSampled = 0;

  htmls.forEach((html, i) => {
    if (!html) return;
    pagesSampled++;
    const body = extractBody(html);
    const pagePath = (() => { try { return new URL(sample[i]).pathname; } catch { return ''; } })();
    totalWords += countWords(body);
    totalLinks += countInternalLinks(body, hostname, pagePath);
    if (hasQAContent(body)) qaPageCount++;
  });

  if (pagesSampled === 0) {
    return { pagesSampled: 0, avgWordCount: 0, avgInternalLinks: 0, recommendedLinksPerPost: 0, qaPageCount: 0 };
  }

  const avgWordCount = Math.round(totalWords / pagesSampled);
  const avgInternalLinks = Math.round((totalLinks / pagesSampled) * 10) / 10;
  const recommendedLinksPerPost = Math.max(2, Math.round(avgWordCount / WORDS_PER_LINK));

  return { pagesSampled, avgWordCount, avgInternalLinks, recommendedLinksPerPost, qaPageCount };
}
