export interface LawyerSchemaResult {
  isLawFirm: boolean;
  opportunityCount: number;
  usedCount: number;
  pagesChecked: number;
}

const LAWYER_SCHEMA_PATTERN = /"@type"\s*:\s*"(attorney|legalservice)"/i;
const PRACTICE_AREA_PATTERN = /\/(practice-areas?|services?|areas-of-practice|legal-services)\//i;

function hasLawyerSchema(html: string): boolean {
  return LAWYER_SCHEMA_PATTERN.test(html);
}

async function fetchHtml(url: string): Promise<string> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return '';
    return res.text();
  } catch {
    return '';
  }
}

// Distinct from FAQ/Question schema — Attorney/LegalService is the schema type that
// identifies a business as a law firm to Google. Every practice-area/service page is
// a real opportunity for it (each describes a distinct legal service offered), plus
// the homepage representing the firm itself.
export async function analyzeLawyerSchema(
  homepageHtml: string,
  isLawFirm: boolean,
  sitemapUrls: string[]
): Promise<LawyerSchemaResult> {
  if (!isLawFirm) {
    return { isLawFirm: false, opportunityCount: 0, usedCount: 0, pagesChecked: 0 };
  }

  const practiceAreaUrls = sitemapUrls
    .filter(u => { try { return PRACTICE_AREA_PATTERN.test(new URL(u).pathname); } catch { return false; } })
    .slice(0, 10);

  const opportunityCount = 1 + practiceAreaUrls.length;

  let usedCount = hasLawyerSchema(homepageHtml) ? 1 : 0;

  const pageHtmls = await Promise.all(practiceAreaUrls.map(fetchHtml));
  for (const html of pageHtmls) {
    if (html && hasLawyerSchema(html)) usedCount++;
  }

  return { isLawFirm, opportunityCount, usedCount, pagesChecked: 1 + practiceAreaUrls.length };
}
