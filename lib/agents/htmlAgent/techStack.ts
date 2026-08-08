export interface TechStackDetection {
  cms: string;
  pageBuilder: string;
  cdn: string;
  ecommerce: string;
  httpVersion: string;
  signals: string[];
}

export function detectTechStack(html: string, headers: Record<string, string>, alpnProtocol: string | null): TechStackDetection {
  const signals: string[] = [];

  // CMS
  let cms = 'Custom / Unknown';
  if (html.includes('/wp-content/') || html.includes('/wp-includes/')) { cms = 'WordPress'; signals.push('WordPress detected'); }
  else if (html.includes('wix.com') || html.includes('_wix_')) { cms = 'Wix'; signals.push('Wix detected'); }
  else if (html.includes('squarespace.com') || html.includes('squarespace-cdn')) { cms = 'Squarespace'; signals.push('Squarespace detected'); }
  else if (html.includes('shopify') || html.includes('myshopify')) { cms = 'Shopify'; signals.push('Shopify detected'); }
  else if (html.includes('webflow.com') || html.includes('data-wf-')) { cms = 'Webflow'; signals.push('Webflow detected'); }
  else if (html.includes('__NEXT_DATA__')) { cms = 'Next.js (Custom)'; signals.push('Next.js detected'); }
  else if (html.includes('gatsby')) { cms = 'Gatsby (Custom)'; signals.push('Gatsby detected'); }

  // Page Builder
  let pageBuilder = 'None detected';
  if (html.includes('elementor')) { pageBuilder = 'Elementor'; signals.push('Elementor page builder'); }
  else if (html.includes('divi')) { pageBuilder = 'Divi'; signals.push('Divi page builder'); }
  else if (html.includes('beaver-builder') || html.includes('fl-builder')) { pageBuilder = 'Beaver Builder'; }
  else if (html.includes('bricks-')) { pageBuilder = 'Bricks Builder'; }
  else if (html.includes('wp-block-')) { pageBuilder = 'Gutenberg'; }

  // CDN
  let cdn = 'None detected';
  const server = headers['server'] || '';
  const via = headers['via'] || '';
  const cfRay = headers['cf-ray'] || '';
  if (cfRay || server.includes('cloudflare')) { cdn = 'Cloudflare'; signals.push('Cloudflare CDN'); }
  else if (via.includes('CloudFront') || html.includes('cloudfront.net')) { cdn = 'AWS CloudFront'; }
  else if (html.includes('fastly.net')) { cdn = 'Fastly'; }
  else if (html.includes('bunnycdn') || html.includes('b-cdn.net')) { cdn = 'BunnyCDN'; }

  // E-commerce
  let ecommerce = 'None detected';
  if (cms === 'Shopify') { ecommerce = 'Shopify'; }
  else if (html.includes('woocommerce') || html.includes('wc-')) { ecommerce = 'WooCommerce'; }
  else if (html.includes('bigcommerce')) { ecommerce = 'BigCommerce'; }

  // HTTP version — real ALPN result from the TLS handshake, not a guess.
  // HTTP/3 (QUIC/UDP) can't be seen by a TCP ALPN probe, so Alt-Svc is the
  // only client-visible signal for it and stays valid as a check.
  let httpVersion = 'Unknown';
  if (alpnProtocol === 'h2') { httpVersion = 'HTTP/2'; }
  else if (alpnProtocol === 'http/1.1') { httpVersion = 'HTTP/1.1'; }
  if (headers['alt-svc']?.includes('h3')) { httpVersion = 'HTTP/3'; }

  return { cms, pageBuilder, cdn, ecommerce, httpVersion, signals };
}
