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

const UTILITY_SLUGS = new Set([
  'about', 'about-us', 'contact', 'contact-us', 'privacy-policy', 'privacy',
  'terms', 'terms-and-conditions', 'terms-of-service', 'testimonials', 'faq', 'faqs',
  'blog', 'services', 'service', 'pricing', 'careers', 'jobs', 'job-openings',
  'team', 'our-team', 'staff', 'free-consultation', 'consultation', 'legal-seminars',
  'seminars', 'practice-areas', 'locations', 'reviews', 'gallery', 'portfolio',
  'thank-you', 'sitemap',
]);

export function isLandingPage(path: string): boolean {
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

export function isCityPage(path: string): boolean {
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

export function isEventPage(path: string): boolean {
  return /\/events?\//.test(path.toLowerCase());
}

export function isArchivePage(path: string): boolean {
  return /\/(category|tag)\//.test(path.toLowerCase());
}

// Best-effort heuristic: a real content slug that isn't a known utility/nav page,
// landing page, city page, event, or taxonomy archive is treated as a blog/article post.
// This will misclassify unusual site structures — it's a v1 approximation, not exact.
export function isBlogPost(path: string): boolean {
  const p = path.toLowerCase();
  const segments = p.split('/').filter(Boolean);
  if (segments.length === 0 || segments.length > 2) return false;
  const last = segments[segments.length - 1];
  if (UTILITY_SLUGS.has(last)) return false;
  if (segments[0] === 'practice-areas') return false;
  return true;
}
