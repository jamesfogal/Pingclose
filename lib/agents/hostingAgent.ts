import { promises as dns } from 'dns';

export interface HostingAgentResult {
  hosting: string;
  hostingVerdict: 'dead-zone' | 'speed-limiter' | 'acceptable' | 'race-ready' | 'unknown';
  hostingVerdictLabel: string;
  hostingVerdictMessage: string;
}

function mapIspToHostName(isp: string, org: string): string {
  const raw = (isp + ' ' + org).toLowerCase();
  if (raw.includes('godaddy'))                            return 'GoDaddy';
  if (raw.includes('bluehost'))                           return 'Bluehost';
  if (raw.includes('hostgator'))                          return 'HostGator';
  if (raw.includes('dreamhost'))                          return 'DreamHost';
  if (raw.includes('siteground'))                         return 'SiteGround';
  if (raw.includes('wpengine') || raw.includes('wp engine')) return 'WP Engine';
  if (raw.includes('kinsta'))                             return 'Kinsta';
  if (raw.includes('liquid web'))                         return 'Liquid Web';
  if (raw.includes('flywheel'))                           return 'Flywheel';
  if (raw.includes('cloudways'))                          return 'Cloudways';
  if (raw.includes('digitalocean'))                       return 'DigitalOcean';
  if (raw.includes('linode') || raw.includes('akamai'))  return 'Linode / Akamai';
  if (raw.includes('amazon') || raw.includes(' aws'))    return 'Amazon AWS';
  if (raw.includes('google'))                             return 'Google Cloud';
  if (raw.includes('microsoft') || raw.includes('azure')) return 'Microsoft Azure';
  if (raw.includes('vercel'))                             return 'Vercel';
  if (raw.includes('netlify'))                            return 'Netlify';
  if (raw.includes('cloudflare'))                         return 'Cloudflare';
  if (raw.includes('ionos') || raw.includes('1&1'))      return 'IONOS';
  if (raw.includes('network solutions'))                  return 'Network Solutions';
  if (raw.includes('inmotion'))                           return 'InMotion Hosting';
  if (raw.includes('a2 hosting') || raw.includes('a2hosting')) return 'A2 Hosting';
  if (raw.includes('hostinger'))                          return 'Hostinger';
  if (raw.includes('namecheap'))                          return 'Namecheap';
  if (raw.includes('fastly'))                             return 'Fastly';
  if (raw.includes('rackspace'))                          return 'Rackspace';
  if (raw.includes('wpx'))                                return 'WPX Hosting';
  if (raw.includes('pressable'))                          return 'Pressable';
  if (raw.includes('nexcess'))                            return 'Nexcess';
  if (raw.includes('hostwinds'))                          return 'Hostwinds';
  if (raw.includes('web.com'))                            return 'Web.com';
  if (raw.includes('register.com'))                       return 'Register.com';
  if (raw.includes('pair networks'))                      return 'pair Networks';
  if (raw.includes('media temple'))                       return 'Media Temple';
  return isp || org || 'Unknown';
}

function getHostingVerdict(hosting: string, cms: string): { verdict: HostingAgentResult['hostingVerdict']; label: string; message: string } {
  const h = hosting.toLowerCase();
  const c = cms.toLowerCase();

  if (h.includes('godaddy') || h.includes('bluehost') || h.includes('hostgator') ||
      h.includes('network solutions') || h.includes('1&1') || h.includes('ionos') ||
      h.includes('ipage') || h.includes('namecheap') || h.includes('hostinger') ||
      h.includes('register.com') || h.includes('web.com') || h.includes('pair networks') ||
      h.includes('arvixe') || h.includes('site5')) {
    return { verdict: 'dead-zone', label: '☠️ Dead Zone', message: `${hosting} shared hosting is one of the leading causes of slow local business websites. Your server response time alone adds 800–1,200ms before a single image or script loads. No plugin or image compression can fix a slow foundation. The host itself is the problem.` };
  }
  if (c.includes('wix') || c.includes('squarespace') || c.includes('weebly')) {
    return { verdict: 'speed-limiter', label: '⚠️ Speed Limiter', message: `${cms} controls your hosting environment. You are locked out of the server-level optimizations that matter most. Under 1 second is not achievable on this platform regardless of what else you fix.` };
  }
  if (h.includes('siteground') || h.includes('cloudways') || h.includes('flywheel') ||
      h.includes('dreamhost') || h.includes('inmotion') || h.includes('a2 hosting') ||
      h.includes('a2hosting') || h.includes('media temple') || h.includes('hostwinds')) {
    return { verdict: 'acceptable', label: '🟡 Acceptable', message: `${hosting} is a decent foundation. Significant optimization is still needed to hit under 1 second — but the host itself won't hold you back.` };
  }
  if (h.includes('wp engine') || h.includes('wpengine') || h.includes('kinsta') ||
      h.includes('vercel') || h.includes('netlify') || h.includes('cloudflare') ||
      h.includes('liquid web') || h.includes('nexcess') || h.includes('wpx') ||
      h.includes('pressable') || h.includes('digitalocean') || h.includes('linode') ||
      h.includes('akamai') || h.includes('amazon aws') || h.includes('google cloud') ||
      h.includes('microsoft azure') || h.includes('rackspace') || h.includes('fastly')) {
    return { verdict: 'race-ready', label: '✅ Race Ready', message: `${hosting} is a solid foundation. Speed under 1 second is achievable with the right setup and optimization.` };
  }
  return {
    verdict: 'unknown',
    label: '❓ Unknown Host',
    message: hosting !== 'Unknown'
      ? `Your site is hosted on ${hosting}. We don't have benchmark data for this provider yet — your server response time will tell us more.`
      : 'We could not identify your hosting provider. Your server response time will tell us more about the foundation quality.'
  };
}

export function computeHostingVerdict(hosting: string, cms: string): Pick<HostingAgentResult, 'hostingVerdict' | 'hostingVerdictLabel' | 'hostingVerdictMessage'> {
  const v = getHostingVerdict(hosting, cms);
  return { hostingVerdict: v.verdict, hostingVerdictLabel: v.label, hostingVerdictMessage: v.message };
}

// Agent: resolve hostname → IP → ASN → clean provider name + verdict
export async function runHostingAgent(hostname: string, headers: Record<string, string> = {}, cms = ''): Promise<HostingAgentResult> {
  let hosting = 'Unknown';
  try {
    const { address } = await dns.lookup(hostname, { family: 4 });
    const res = await fetch(`http://ip-api.com/json/${address}?fields=isp,org,as`, {
      signal: AbortSignal.timeout(4000)
    });
    if (res.ok) {
      const data = await res.json() as { isp?: string; org?: string };
      hosting = mapIspToHostName(data.isp || '', data.org || '');
    }
  } catch { /* fall through to Unknown */ }

  // Header signals override ASN for hosts that explicitly advertise themselves
  if (headers['x-powered-by']?.includes('WP Engine')) hosting = 'WP Engine';
  else if (headers['x-kinsta-cache']) hosting = 'Kinsta';
  else if (headers['x-vercel-id']) hosting = 'Vercel';
  else if (headers['x-netlify']) hosting = 'Netlify';

  const verdict = getHostingVerdict(hosting, cms);
  return { hosting, hostingVerdict: verdict.verdict, hostingVerdictLabel: verdict.label, hostingVerdictMessage: verdict.message };
}
