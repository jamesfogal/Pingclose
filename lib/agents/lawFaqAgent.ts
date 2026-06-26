export interface LawFaqResult {
  isLawFirm: boolean;
  qaContentCount: number;
  faqSchemaCount: number;
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

function countFaqSchemaQuestions(html: string): number {
  const schemaBlocks = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
  let count = 0;
  for (const block of schemaBlocks) {
    if (!/"@type"\s*:\s*"FAQPage"/i.test(block)) continue;
    count += (block.match(/"@type"\s*:\s*"Question"/gi) || []).length;
  }
  return count;
}

// Law firms answering legal questions on their site should mark each one up with
// FAQPage/Question schema to qualify for Google's FAQ rich results — every other
// industry is exempt from this check, so it's gated on law-firm detection first.
export function analyzeLawFaqSchema(html: string, titleTag: string, h1Text: string): LawFaqResult {
  const isLawFirm = detectLawFirm(`${titleTag} ${h1Text}`) || detectLawFirm(html.slice(0, 20000));

  if (!isLawFirm) {
    return { isLawFirm: false, qaContentCount: 0, faqSchemaCount: 0, properUseCount: 0, missedOpportunityCount: 0 };
  }

  const qaContentCount = countQuestionHeadings(html);
  const faqSchemaCount = countFaqSchemaQuestions(html);
  const properUseCount = faqSchemaCount;
  const missedOpportunityCount = Math.max(0, qaContentCount - faqSchemaCount);

  return { isLawFirm, qaContentCount, faqSchemaCount, properUseCount, missedOpportunityCount };
}
