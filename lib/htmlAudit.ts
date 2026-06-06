export interface TechStackResult {
  cms: string;
  hosting: string;
  cdn: string;
  httpVersion: string;
  pageBuilder: string;
  ecommerce: string;
  hasWordPress: boolean;
  signals: string[];
}

export async function detectTechStack(url: string): Promise<TechStackResult> {
  let html = '';
  let headers: Record<string, string> = {};

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PingClose/1.0)' },
      signal: AbortSignal.timeout(10000)
    });

    html = await res.text();
    res.headers.forEach((value, key) => { headers[key.toLowerCase()] = value; });
  } catch {
    return {
      cms: 'Unknown',
      hosting: 'Unknown',
      cdn: 'Unknown',
      httpVersion: 'Unknown',
      pageBuilder: 'None detected',
      ecommerce: 'None detected',
      hasWordPress: false,
      signals: ['Could not fetch page for tech analysis']
    };
  }

  const signals: string[] = [];

  // CMS Detection
  let cms = 'Custom / Unknown';
  if (html.includes('/wp-content/') || html.includes('/wp-includes/')) { cms = 'WordPress'; signals.push('WordPress detected'); }
  else if (html.includes('wix.com') || html.includes('_wix_')) { cms = 'Wix'; signals.push('Wix detected'); }
  else if (html.includes('squarespace.com') || html.includes('squarespace-cdn')) { cms = 'Squarespace'; signals.push('Squarespace detected'); }
  else if (html.includes('shopify') || html.includes('myshopify')) { cms = 'Shopify'; signals.push('Shopify detected'); }
  else if (html.includes('webflow.com') || html.includes('data-wf-')) { cms = 'Webflow'; signals.push('Webflow detected'); }
  else if (html.includes('next') || html.includes('__NEXT_DATA__')) { cms = 'Next.js (Custom)'; signals.push('Next.js detected'); }
  else if (html.includes('gatsby')) { cms = 'Gatsby (Custom)'; signals.push('Gatsby detected'); }

  // Page Builder Detection
  let pageBuilder = 'None detected';
  if (html.includes('elementor')) { pageBuilder = 'Elementor'; signals.push('Elementor page builder'); }
  else if (html.includes('divi')) { pageBuilder = 'Divi'; signals.push('Divi page builder'); }
  else if (html.includes('beaver-builder') || html.includes('fl-builder')) { pageBuilder = 'Beaver Builder'; signals.push('Beaver Builder detected'); }
  else if (html.includes('wp-block-')) { pageBuilder = 'Gutenberg'; }

  // CDN Detection
  let cdn = 'None detected';
  const server = headers['server'] || '';
  const via = headers['via'] || '';
  const cfRay = headers['cf-ray'] || '';
  if (cfRay || server.includes('cloudflare')) { cdn = 'Cloudflare'; signals.push('Cloudflare CDN'); }
  else if (via.includes('CloudFront') || html.includes('cloudfront.net')) { cdn = 'AWS CloudFront'; signals.push('AWS CloudFront CDN'); }
  else if (html.includes('fastly.net')) { cdn = 'Fastly'; signals.push('Fastly CDN'); }
  else if (html.includes('bunnycdn') || html.includes('b-cdn.net')) { cdn = 'BunnyCDN'; signals.push('BunnyCDN detected'); }

  // Hosting Detection
  let hosting = 'Unknown';
  if (headers['x-powered-by']?.includes('WP Engine') || html.includes('wpengine')) { hosting = 'WP Engine'; }
  else if (headers['x-kinsta-cache'] || html.includes('kinsta')) { hosting = 'Kinsta'; }
  else if (server.includes('siteground') || html.includes('siteground')) { hosting = 'SiteGround'; }
  else if (html.includes('godaddy') || headers['x-gd-domain']) { hosting = 'GoDaddy'; }
  else if (server.includes('vercel') || headers['x-vercel-id']) { hosting = 'Vercel'; }
  else if (headers['x-netlify'] || server.includes('netlify')) { hosting = 'Netlify'; }
  else if (html.includes('bluehost')) { hosting = 'Bluehost'; }
  else if (html.includes('hostgator')) { hosting = 'HostGator'; }
  else if (cdn === 'Cloudflare') { hosting = 'Unknown (behind Cloudflare)'; }

  // E-commerce
  let ecommerce = 'None detected';
  if (cms === 'Shopify') { ecommerce = 'Shopify'; }
  else if (html.includes('woocommerce') || html.includes('wc-')) { ecommerce = 'WooCommerce'; }
  else if (html.includes('bigcommerce')) { ecommerce = 'BigCommerce'; }

  // HTTP version (approximation from headers)
  let httpVersion = 'HTTP/1.1';
  if (headers['alt-svc']?.includes('h3') || headers['alt-svc']?.includes('h2')) { httpVersion = 'HTTP/2 or HTTP/3'; }

  return {
    cms,
    hosting,
    cdn,
    httpVersion,
    pageBuilder,
    ecommerce,
    hasWordPress: cms === 'WordPress',
    signals
  };
}
