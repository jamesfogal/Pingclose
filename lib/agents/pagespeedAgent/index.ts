import { fetchPageSpeed } from './fetchPageSpeed';
import { parsePageSpeed } from './parsePageSpeed';
import type { PageSpeedAgentResponse } from './types';

export type { PageSpeedResult, PageSpeedAgentResponse, PageSpeedStatus, ImageDetail, VideoDetail } from './types';
export { buildFallbackResult } from './fallbackResult';

async function attemptOnce(url: string, apiKey: string): Promise<PageSpeedAgentResponse> {
  const fetched = await fetchPageSpeed(url, apiKey);
  if (!fetched.ok) {
    return { ok: false, error: fetched.error, quotaExceeded: fetched.quotaExceeded, status: fetched.status, retryCount: fetched.retryCount };
  }

  try {
    const data = parsePageSpeed(fetched.mobile, fetched.desktop);
    return { ok: true, data, retryCount: fetched.retryCount };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'PageSpeed parse failed', quotaExceeded: false, retryCount: fetched.retryCount };
  }
}

// Google's own response time is variable enough (observed 21s-70s even on
// eventual success, from real production data) that a single attempt isn't
// reliable enough for a report a customer is paying for. Firing two fully
// independent attempts at once and taking whichever succeeds first roughly
// squares the failure rate (each attempt fails independently ~3% of the
// time historically, so both failing together is far rarer) and typically
// improves speed too, since we take the faster of two variable-latency
// results instead of always waiting on one. Costs 2x PageSpeed API calls
// per audit — accepted tradeoff (2026-08-02, Jim: "The pursuit of
// perfection is worth it") given this report is what closes the sale.
function raceForFirstSuccess(attempts: Promise<PageSpeedAgentResponse>[]): Promise<PageSpeedAgentResponse> {
  const startedAt = Date.now();
  return new Promise((resolve) => {
    let remaining = attempts.length;
    let firstFailure: PageSpeedAgentResponse | null = null;
    let settled = 0;
    for (const attempt of attempts) {
      attempt.then((result) => {
        settled++;
        console.log(`PAGESPEED_RACE: attempt #${settled} settled at ${Date.now() - startedAt}ms, ok=${result.ok}`);
        if (result.ok) {
          console.log(`PAGESPEED_RACE: winner is attempt #${settled}`);
          resolve(result);
          return;
        }
        remaining--;
        if (!firstFailure) firstFailure = result;
        if (remaining === 0) {
          console.log(`PAGESPEED_RACE: both attempts failed after ${Date.now() - startedAt}ms`);
          resolve(firstFailure!);
        }
      });
    }
  });
}

/**
 * Standalone, reusable Google PageSpeed Agent.
 * Used by PingClose, LocalSEOAEOPro, AIOS, and any future app.
 * Never throws — always resolves to a tagged PageSpeedAgentResponse.
 * Races two independent attempts internally; only fails if both do.
 */
export async function runPageSpeedAgent(url: string): Promise<PageSpeedAgentResponse> {
  const apiKey = process.env.PAGESPEED_API_KEY;
  if (!apiKey) {
    return { ok: false, error: 'PAGESPEED_API_KEY not configured', quotaExceeded: false, retryCount: 0 };
  }

  return raceForFirstSuccess([attemptOnce(url, apiKey), attemptOnce(url, apiKey)]);
}
