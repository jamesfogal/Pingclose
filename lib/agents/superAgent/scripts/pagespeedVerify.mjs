import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const RUNS_DIR = path.join(ROOT, 'runs');
const ENDPOINT = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
const TIMEOUT_MS = 75_000;

/**
 * Standalone PageSpeed fetch for the superAgent pipeline. Mirrors
 * lib/agents/pagespeedAgent/fetchPageSpeed.ts's single-strategy call
 * (kept separate, not imported, since that file is TS and this script
 * runs as plain Node ESM without a TS loader).
 */
async function fetchOneStrategy(url, strategy, apiKey) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(
      `${ENDPOINT}?url=${encodeURIComponent(url)}&strategy=${strategy}&key=${apiKey}`,
      { signal: controller.signal }
    );
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      const message = json?.error?.message || `HTTP ${res.status}`;
      throw new Error(`PageSpeed ${strategy} request failed: ${message}`);
    }
    const score = json?.lighthouseResult?.categories?.performance?.score;
    const lcp = json?.lighthouseResult?.audits?.['largest-contentful-paint']?.numericValue;
    return {
      score: score != null ? Math.round(score * 100) : null,
      lcpMs: lcp != null ? Math.round(lcp) : null,
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function pagespeedVerify(targetUrl, label = 'after') {
  const apiKey = process.env.PAGESPEED_API_KEY;
  if (!apiKey) {
    throw new Error('PAGESPEED_API_KEY not configured — cannot run pagespeed-verify-agent');
  }

  const [mobile, desktop] = await Promise.all([
    fetchOneStrategy(targetUrl, 'mobile', apiKey),
    fetchOneStrategy(targetUrl, 'desktop', apiKey),
  ]);

  const result = { url: targetUrl, label, timestamp: new Date().toISOString(), mobile, desktop };

  await mkdir(RUNS_DIR, { recursive: true });
  const outPath = path.join(RUNS_DIR, `pagespeed-${label}-${Date.now()}.json`);
  await writeFile(outPath, JSON.stringify(result, null, 2));

  return { ...result, outPath };
}

if (path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1] ?? '')) {
  const [targetUrl, label] = process.argv.slice(2);
  if (!targetUrl) {
    console.error('Usage: node pagespeedVerify.mjs <url> [label]');
    process.exit(1);
  }
  const result = await pagespeedVerify(targetUrl, label);
  console.log(JSON.stringify(result, null, 2));
}
