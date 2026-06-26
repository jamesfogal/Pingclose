export interface LawFaqResult {
  isLawFirm: boolean;
  qaContentCount: number;
  faqSchemaCount: number;
  visibleFaqSchemaCount: number;
  hiddenFaqSchemaCount: number;
  properUseCount: number;
  missedOpportunityCount: number;
}

const LAW_FIRM_PATTERN = /\b(attorneys?|lawyers?|law firm|law office|law offices|law group|esq\.?)\b/i;

function detectLawFirm(text: string): boolean {
  return LAW_FIRM_PATTERN.test(text);
}

function countQuestionHeadings(html: string): number {
  const matches = html.match(/<h[2-6][^>]*>([^<]*\?)\s*<\/h[2-6]>/gi) || [];
  return matches.length;
}

function getFaqSchemaBlocks(html: string): string[] {
  const schemaBlocks = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
  return schemaBlocks.filter(block => /"@type"\s*:\s*"FAQPage"/i.test(block));
}

function getQuestionNames(faqBlocks: string[]): string[] {
  return faqBlocks.flatMap(block => [...block.matchAll(/"@type"\s*:\s*"Question"\s*,\s*"name"\s*:\s*"([^"]+)"/gi)].map(m => m[1]));
}

// Google requires FAQ rich-result content to actually be visible on the page — schema
// with no matching visible text is hidden markup, not a real Q&A section, and risks the
// rich result being suppressed (or worse, a manual action for spammy structured data).
function getVisibleText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .toLowerCase();
}

// FAQPage/Question schema only — whether the business itself carries Attorney/LegalService
// schema is tracked separately by lawyerSchemaAgent.ts, not duplicated here.
export function analyzeLawFaqSchema(html: string, titleTag: string, h1Text: string): LawFaqResult {
  const isLawFirm = detectLawFirm(`${titleTag} ${h1Text}`) || detectLawFirm(html.slice(0, 20000));

  if (!isLawFirm) {
    return {
      isLawFirm: false, qaContentCount: 0, faqSchemaCount: 0,
      visibleFaqSchemaCount: 0, hiddenFaqSchemaCount: 0, properUseCount: 0, missedOpportunityCount: 0,
    };
  }

  const qaContentCount = countQuestionHeadings(html);
  const faqBlocks = getFaqSchemaBlocks(html);
  const questionNames = getQuestionNames(faqBlocks);
  const faqSchemaCount = questionNames.length;

  const visibleText = getVisibleText(html);
  const visibleFaqSchemaCount = questionNames.filter(name => visibleText.includes(name.toLowerCase().trim())).length;
  const hiddenFaqSchemaCount = faqSchemaCount - visibleFaqSchemaCount;

  const properUseCount = visibleFaqSchemaCount;
  const missedOpportunityCount = Math.max(0, qaContentCount - visibleFaqSchemaCount);

  return {
    isLawFirm, qaContentCount, faqSchemaCount,
    visibleFaqSchemaCount, hiddenFaqSchemaCount, properUseCount, missedOpportunityCount,
  };
}
