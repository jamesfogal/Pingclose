import { lookup } from 'dns/promises';

export interface PreflightResult {
  finalUrl: string | null;
  dnsStatus: 'ok' | 'error';
  dnsLookupMs: number;
  httpStatus: number | null;
  httpsStatus: number | null;
  redirectCount: number;
  finalResponseStatus: number | null;
  ttfbMs: number | null;
  cloudflareDetected: boolean;
  blockedOrChallenged: boolean;
  diagnosticReason: string | null;
}

const PREFLIGHT_TIMEOUT_MS = 10_000;
const MAX_REDIRECTS = 8;

async function checkDns(hostname: string): Promise<{ ok: boolean; ms: number }> {
  const t = Date.now();
  try {
    await lookup(hostname);
    return { ok: true, ms: Date.now() - t };
  } catch {
    return { ok: false, ms: Date.now() - t };
  }
}

function deriveDiagnosticReason(p: {
  finalResponseStatus: number | null;
  cloudflareDetected: boolean;
  blockedOrChallenged: boolean;
  redirectCount: number;
  ttfbMs: number | null;
}): string | null {
  if (p.finalResponseStatus === 403) return p.cloudflareDetected ? 'CLOUDFLARE_BLOCKED_403' : 'SITE_BLOCKED_403';
  if (p.finalResponseStatus === 429) return 'SITE_RATE_LIMITED_429';
  if (p.finalResponseStatus === 503) return p.cloudflareDetected ? 'CLOUDFLARE_503' : 'SITE_UNAVAILABLE_503';
  if (p.blockedOrChallenged && p.cloudflareDetected) return 'CLOUDFLARE_CHALLENGE';
  if (p.redirectCount > 5) return 'EXCESSIVE_REDIRECTS';
  if (p.ttfbMs !== null && p.ttfbMs > 5000) return 'VERY_SLOW_SERVER';
  if (p.ttfbMs !== null && p.ttfbMs > 2000) return 'SLOW_SERVER';
  return null;
}

export async function runPreflightCheck(url: string): Promise<PreflightResult> {
  let hostname: string;
  try {
    hostname = new URL(url).hostname;
  } catch {
    return {
      finalUrl: null, dnsStatus: 'error', dnsLookupMs: 0,
      httpStatus: null, httpsStatus: null, redirectCount: 0,
      finalResponseStatus: null, ttfbMs: null,
      cloudflareDetected: false, blockedOrChallenged: false,
      diagnosticReason: 'INVALID_URL',
    };
  }

  const dns = await checkDns(hostname);
  if (!dns.ok) {
    return {
      finalUrl: null, dnsStatus: 'error', dnsLookupMs: dns.ms,
      httpStatus: null, httpsStatus: null, redirectCount: 0,
      finalResponseStatus: null, ttfbMs: null,
      cloudflareDetected: false, blockedOrChallenged: false,
      diagnosticReason: 'DNS_FAIL',
    };
  }

  let current = url;
  let redirectCount = 0;
  let httpStatus: number | null = null;
  let httpsStatus: number | null = null;
  let finalResponseStatus: number | null = null;
  let ttfbMs: number | null = null;
  let cloudflareDetected = false;
  let blockedOrChallenged = false;

  while (redirectCount <= MAX_REDIRECTS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PREFLIGHT_TIMEOUT_MS);
    const t = Date.now();

    try {
      const res = await fetch(current, {
        method: 'HEAD',
        redirect: 'manual',
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' },
      });
      clearTimeout(timer);
      ttfbMs = Date.now() - t;

      if (current.startsWith('https://')) httpsStatus = res.status;
      else httpStatus = res.status;

      const cfRay = res.headers.get('cf-ray');
      const server = res.headers.get('server') || '';
      if (cfRay || /cloudflare/i.test(server)) cloudflareDetected = true;

      if (res.status >= 300 && res.status < 400) {
        const loc = res.headers.get('location');
        if (!loc) { finalResponseStatus = res.status; break; }
        current = loc.startsWith('http') ? loc : new URL(loc, current).href;
        redirectCount++;
        continue;
      }

      finalResponseStatus = res.status;
      blockedOrChallenged = res.status === 403 || res.status === 429 || res.status === 503;
      break;
    } catch {
      clearTimeout(timer);
      break;
    }
  }

  const diagnosticReason = deriveDiagnosticReason({
    finalResponseStatus, cloudflareDetected, blockedOrChallenged, redirectCount, ttfbMs,
  });

  return {
    finalUrl: current,
    dnsStatus: 'ok',
    dnsLookupMs: dns.ms,
    httpStatus,
    httpsStatus,
    redirectCount,
    finalResponseStatus,
    ttfbMs,
    cloudflareDetected,
    blockedOrChallenged,
    diagnosticReason,
  };
}
