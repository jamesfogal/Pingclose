// Only external API surface for this agent: Google PageSpeed Insights v5 (mobile + desktop = 2 calls)
const ENDPOINT = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
const TIMEOUT_MS = 75_000;
// Retry gets a much shorter budget than the first attempt: it only ever
// fires for a fast HTTP error response (see fetchStrategy below — a real
// timeout never retries), and Google's transient errors clear within a few
// seconds when they clear at all. Giving the retry another full 75s risked
// preflight(10s) + first-attempt(~fast fail) + retry(75s) landing at or past
// this route's 90s Vercel maxDuration, which kills the function outright
// instead of returning the graceful timeout/error response.
const RETRY_TIMEOUT_MS = 20_000;

interface RawFetchResult {
  ok: boolean;
  status: number;
  json: Record<string, unknown> | null;
  quotaExceeded: boolean;
  error?: string;
  retried: boolean;
}

async function fetchStrategyOnce(url: string, strategy: 'mobile' | 'desktop', apiKey: string, timeoutMs: number = TIMEOUT_MS): Promise<RawFetchResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(
      `${ENDPOINT}?url=${encodeURIComponent(url)}&strategy=${strategy}&key=${apiKey}`,
      { signal: controller.signal }
    );
    const json = await res.json().catch(() => null);

    if (!res.ok) {
      const message = (json as { error?: { message?: string } } | null)?.error?.message || `HTTP ${res.status}`;
      const quotaExceeded = res.status === 429 || /quota/i.test(message);
      return { ok: false, status: res.status, json: null, quotaExceeded, error: message, retried: false };
    }

    return { ok: true, status: res.status, json: json as Record<string, unknown>, quotaExceeded: false, retried: false };
  } catch (err) {
    const timedOut = err instanceof Error && err.name === 'AbortError';
    return {
      ok: false,
      status: 0,
      json: null,
      quotaExceeded: false,
      error: timedOut ? `PageSpeed request timed out after ${timeoutMs}ms` : (err instanceof Error ? err.message : String(err)),
      retried: false,
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
  const retried = await fetchStrategyOnce(url, strategy, apiKey, RETRY_TIMEOUT_MS);
  return { ...retried, retried: true };
}

export async function fetchPageSpeed(url: string, apiKey: string): Promise<
  | { ok: true; mobile: Record<string, unknown>; desktop: Record<string, unknown>; retryCount: number }
  | { ok: false; error: string; quotaExceeded: boolean; status?: number; retryCount: number }
> {
  const [mobile, desktop] = await Promise.all([
    fetchStrategy(url, 'mobile', apiKey),
    fetchStrategy(url, 'desktop', apiKey),
  ]);

  const retryCount = (mobile.retried ? 1 : 0) + (desktop.retried ? 1 : 0);

  if (!mobile.ok) return { ok: false, error: mobile.error || 'Mobile PageSpeed request failed', quotaExceeded: mobile.quotaExceeded, status: mobile.status, retryCount };
  if (!desktop.ok) return { ok: false, error: desktop.error || 'Desktop PageSpeed request failed', quotaExceeded: desktop.quotaExceeded, status: desktop.status, retryCount };

  return { ok: true, mobile: mobile.json!, desktop: desktop.json!, retryCount };
}
