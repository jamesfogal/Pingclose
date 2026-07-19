// Only external API surface for this agent: Google PageSpeed Insights v5 (mobile + desktop = 2 calls)
const ENDPOINT = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
const TIMEOUT_MS = 75_000;

interface RawFetchResult {
  ok: boolean;
  status: number;
  json: Record<string, unknown> | null;
  quotaExceeded: boolean;
  error?: string;
}

async function fetchStrategyOnce(url: string, strategy: 'mobile' | 'desktop', apiKey: string): Promise<RawFetchResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(
      `${ENDPOINT}?url=${encodeURIComponent(url)}&strategy=${strategy}&key=${apiKey}`,
      { signal: controller.signal }
    );
    const json = await res.json().catch(() => null);

    if (!res.ok) {
      const message = (json as { error?: { message?: string } } | null)?.error?.message || `HTTP ${res.status}`;
      const quotaExceeded = res.status === 429 || /quota/i.test(message);
      return { ok: false, status: res.status, json: null, quotaExceeded, error: message };
    }

    return { ok: true, status: res.status, json: json as Record<string, unknown>, quotaExceeded: false };
  } catch (err) {
    const timedOut = err instanceof Error && err.name === 'AbortError';
    return {
      ok: false,
      status: 0,
      json: null,
      quotaExceeded: false,
      error: timedOut ? `PageSpeed request timed out after ${TIMEOUT_MS}ms` : (err instanceof Error ? err.message : String(err)),
    };
  } finally {
    clearTimeout(timer);
  }
}

// Google's PageSpeed API occasionally returns a generic "Lighthouse returned
// error: Something went wrong" for reasons on Google's end, unrelated to the
// site being tested — confirmed by the same URL succeeding moments before
// and after such a failure. Retrying once clears most of these. Not worth
// retrying a quota error (will just fail again) or a timeout (already waited
// the full 75s once).
async function fetchStrategy(url: string, strategy: 'mobile' | 'desktop', apiKey: string): Promise<RawFetchResult> {
  const first = await fetchStrategyOnce(url, strategy, apiKey);
  if (first.ok || first.quotaExceeded || first.status === 0) return first;

  console.warn(`PAGESPEED_RETRY: ${strategy} failed (${first.error}), retrying once`);
  return fetchStrategyOnce(url, strategy, apiKey);
}

export async function fetchPageSpeed(url: string, apiKey: string): Promise<
  | { ok: true; mobile: Record<string, unknown>; desktop: Record<string, unknown> }
  | { ok: false; error: string; quotaExceeded: boolean; status?: number }
> {
  const [mobile, desktop] = await Promise.all([
    fetchStrategy(url, 'mobile', apiKey),
    fetchStrategy(url, 'desktop', apiKey),
  ]);

  if (!mobile.ok) return { ok: false, error: mobile.error || 'Mobile PageSpeed request failed', quotaExceeded: mobile.quotaExceeded, status: mobile.status };
  if (!desktop.ok) return { ok: false, error: desktop.error || 'Desktop PageSpeed request failed', quotaExceeded: desktop.quotaExceeded, status: desktop.status };

  return { ok: true, mobile: mobile.json!, desktop: desktop.json! };
}
