export interface SeoFundamentals {
  hasTitle: boolean;
  titleTag: string;
  titleLength: number;
  hasMetaDescription: boolean;
  metaDescription: string;
  metaDescriptionLength: number;
  hasH1: boolean;
  h1Text: string;
  multipleH1s: boolean;
  hasCanonical: boolean;
  primaryKeyword: string;
  hasFAQSchema: boolean;
  hasPricingSchema: boolean;
  hasLocalBusinessSchema: boolean;
  hasReviewSchema: boolean;
}

export function detectSeoFundamentals(html: string): SeoFundamentals {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const hasTitle = !!titleMatch;
  const titleTag = titleMatch?.[1]?.trim() || '';
  const titleLength = titleTag.length;

  const metaDescMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
  const hasMetaDescription = !!metaDescMatch;
  const metaDescription = metaDescMatch?.[1]?.trim() || '';
  const metaDescriptionLength = metaDescription.length;

  const h1Matches = html.match(/<h1[^>]*>[\s\S]*?<\/h1>/gi) || [];
  const hasH1 = h1Matches.length > 0;
  const h1Text = h1Matches[0]?.replace(/<[^>]+>/g, '').trim() || '';
  const multipleH1s = h1Matches.length > 1;

  const hasCanonical = html.includes('rel="canonical"') || html.includes("rel='canonical'");

  let primaryKeyword = '';
  if (titleTag) { primaryKeyword = titleTag.split(/[|\-–—]/)[0].trim(); }
  else if (h1Text) { primaryKeyword = h1Text; }

  const schemaBlocks = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
  const schemaText = schemaBlocks.join(' ').toLowerCase();
  const hasFAQSchema = schemaText.includes('"faqpage"') || schemaText.includes('"question"');
  const hasPricingSchema = schemaText.includes('"pricespecification"') || schemaText.includes('"offer"');
  const hasLocalBusinessSchema = schemaText.includes('"localbusiness"') || schemaText.includes('"organization"');
  const hasReviewSchema = schemaText.includes('"review"') || schemaText.includes('"aggregaterating"');

  return {
    hasTitle, titleTag, titleLength,
    hasMetaDescription, metaDescription, metaDescriptionLength,
    hasH1, h1Text, multipleH1s, hasCanonical, primaryKeyword,
    hasFAQSchema, hasPricingSchema, hasLocalBusinessSchema, hasReviewSchema,
  };
}
