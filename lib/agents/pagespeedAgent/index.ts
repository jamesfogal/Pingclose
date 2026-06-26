import { fetchPageSpeed } from './fetchPageSpeed';
import { parsePageSpeed } from './parsePageSpeed';
import type { PageSpeedAgentResponse } from './types';

export type { PageSpeedResult, PageSpeedAgentResponse, PageSpeedStatus, ImageDetail, VideoDetail } from './types';
export { buildFallbackResult } from './fallbackResult';

/**
 * Standalone, reusable Google PageSpeed Agent.
 * Used by PingClose, LocalSEOAEOPro, AIOS, and any future app.
 * Never throws — always resolves to a tagged PageSpeedAgentResponse.
 */
export async function runPageSpeedAgent(url: string): Promise<PageSpeedAgentResponse> {
  const apiKey = process.env.PAGESPEED_API_KEY;
  if (!apiKey) {
    return { ok: false, error: 'PAGESPEED_API_KEY not configured', quotaExceeded: false };
  }

  const fetched = await fetchPageSpeed(url, apiKey);
  if (!fetched.ok) {
    return { ok: false, error: fetched.error, quotaExceeded: fetched.quotaExceeded, status: fetched.status };
  }

  try {
    const data = parsePageSpeed(fetched.mobile, fetched.desktop);
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'PageSpeed parse failed', quotaExceeded: false };
  }
}
