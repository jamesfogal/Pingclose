import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { writeFile, readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const RUNS_DIR = path.join(ROOT, 'runs');
const VIEWPORT = { width: 1280, height: 800 };

// Above pixel-mismatch % is a FAIL. 5% is intentionally strict for an
// above-fold shell that should look near-identical to the live page.
const FAIL_THRESHOLD_PCT = 5;

async function screenshotUrl(browser, url, { errorsOut }) {
  const context = await browser.newContext({ viewport: VIEWPORT });
  const page = await context.newPage();
  page.on('pageerror', (err) => errorsOut.push(`pageerror: ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errorsOut.push(`console.error: ${msg.text()}`);
  });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  const linkCount = await page.locator('a[href]').count();
  const buffer = await page.screenshot({ type: 'png' });
  await context.close();
  return { buffer, linkCount };
}

export async function visualDiffQa(candidateSnapshotPath, liveUrl) {
  const candidateUrl = `file://${candidateSnapshotPath.replace(/\\/g, '/')}`;
  const browser = await chromium.launch();

  const candidateErrors = [];
  const liveErrors = [];

  try {
    const [candidate, live] = await Promise.all([
      screenshotUrl(browser, candidateUrl, { errorsOut: candidateErrors }),
      screenshotUrl(browser, liveUrl, { errorsOut: liveErrors }),
    ]);

    const candidatePng = PNG.sync.read(candidate.buffer);
    const livePng = PNG.sync.read(live.buffer);

    const width = Math.min(candidatePng.width, livePng.width);
    const height = Math.min(candidatePng.height, livePng.height);
    const diffPng = new PNG({ width, height });

    const mismatchedPixels = pixelmatch(
      candidatePng.data,
      livePng.data,
      diffPng.data,
      width,
      height,
      { threshold: 0.1 }
    );
    const mismatchPct = (mismatchedPixels / (width * height)) * 100;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const runDir = path.join(RUNS_DIR, timestamp);
    await mkdir(runDir, { recursive: true });
    const diffPath = path.join(runDir, 'diff.png');
    await writeFile(diffPath, PNG.sync.write(diffPng));
    await writeFile(path.join(runDir, 'candidate.png'), candidate.buffer);
    await writeFile(path.join(runDir, 'live.png'), live.buffer);

    const functionalIssues = [];
    if (candidate.linkCount === 0) functionalIssues.push('candidate has zero <a href> links');
    if (candidateErrors.length > 0) functionalIssues.push(`candidate console/page errors: ${candidateErrors.join('; ')}`);

    const pass = mismatchPct <= FAIL_THRESHOLD_PCT && functionalIssues.length === 0;

    const reasonParts = [
      `pixel mismatch: ${mismatchPct.toFixed(2)}% (threshold ${FAIL_THRESHOLD_PCT}%)`,
      `candidate links: ${candidate.linkCount}, live links: ${live.linkCount}`,
    ];
    if (functionalIssues.length > 0) reasonParts.push(`functional issues: ${functionalIssues.join('; ')}`);

    const result = {
      verdict: pass ? 'PASS' : 'FAIL',
      mismatchPct: Number(mismatchPct.toFixed(2)),
      diffImagePath: diffPath,
      reason: reasonParts.join(' | '),
    };
    await writeFile(path.join(runDir, 'result.json'), JSON.stringify(result, null, 2));
    return result;
  } finally {
    await browser.close();
  }
}

if (path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1] ?? '')) {
  const [candidateSnapshotPath, liveUrl] = process.argv.slice(2);
  if (!candidateSnapshotPath || !liveUrl) {
    console.error('Usage: node visualDiffQa.mjs <candidateSnapshotPath> <liveUrl>');
    process.exit(1);
  }
  const result = await visualDiffQa(path.resolve(candidateSnapshotPath), liveUrl);
  console.log(JSON.stringify(result, null, 2));
}
