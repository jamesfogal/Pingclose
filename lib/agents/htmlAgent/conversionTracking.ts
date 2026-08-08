export interface ConversionTracking {
  hasGA4: boolean;
  hasGTM: boolean;
  hasFacebookPixel: boolean;
  hasTikTokPixel: boolean;
  hasCallTracking: boolean;
}

export function detectConversionTracking(html: string): ConversionTracking {
  const hasGA4 = html.includes('gtag') || html.includes('G-') || html.includes('google-analytics.com/g/');
  const hasGTM = html.includes('googletagmanager.com') || html.includes('GTM-');
  const hasFacebookPixel = html.includes('connect.facebook.net') || html.includes('fbq(') || html.includes('facebook.com/tr');
  const hasTikTokPixel = html.includes('analytics.tiktok.com') || html.includes('ttq.');
  const hasCallTracking = html.includes('callrail.com') || html.includes('calltracking') || html.includes('callfire.com') || html.includes('ctm.js') || html.includes('whatconverts') || html.includes('calltrackingmetrics');

  return { hasGA4, hasGTM, hasFacebookPixel, hasTikTokPixel, hasCallTracking };
}
