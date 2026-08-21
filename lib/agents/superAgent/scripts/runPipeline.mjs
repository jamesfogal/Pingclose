import { appendFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderSnapshot } from './renderSnapshot.mjs';
import { inlineCriticalCss } from './criticalCss.mjs';
import { visualDiffQa } from './visualDiffQa.mjs';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const LOG_PATH = path.join(ROOT, 'runs', 'log.jsonl');

async function logRun(entry) {
  await mkdir(path.dirname(LOG_PATH), { recursive: true });
  await appendFile(LOG_PATH, JSON.stringify({ timestamp: new Date().toISOString(), ...entry }) + '\n');
}

/**
 * Runs render-snapshot -> critical-css -> visual-diff-qa for one URL.
 * Stops here on FAIL or on PASS — edge-deploy-agent is intentionally NOT
 * called from this coordinator. Per the repo's no-exceptions deploy rule,
 * an actual deploy requires a separate, explicit, in-the-moment human
 * approval of the specific PASS result before anything is pushed live.
 */
export async function runPipeline(targetUrl) {
  const site = new URL(targetUrl).hostname;

  let snapshot;
  try {
    snapshot = await renderSnapshot(targetUrl);
  } catch (err) {
    await logRun({ site, step: 'render-snapshot', status: 'error', error: String(err) });
    throw err;
  }

  try {
    await inlineCriticalCss(snapshot.snapshotPath, snapshot.cssPath);
  } catch (err) {
    await logRun({ site, step: 'critical-css', status: 'error', error: String(err) });
    throw err;
  }

  const qa = await visualDiffQa(snapshot.snapshotPath, targetUrl);
  await logRun({
    site,
    step: 'visual-diff-qa',
    status: qa.verdict,
    mismatchPct: qa.mismatchPct,
    reason: qa.reason,
    diffImagePath: qa.diffImagePath,
  });

  if (qa.verdict === 'FAIL') {
    return { ...qa, deployEligible: false, note: 'QA FAIL — blocked before edge-deploy, surfaced for human review.' };
  }

  return { ...qa, deployEligible: true, note: 'QA PASS — edge-deploy still requires explicit human approval of this specific result before it runs.' };
}

if (path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1] ?? '')) {
  const targetUrl = process.argv[2];
  if (!targetUrl) {
    console.error('Usage: node runPipeline.mjs <url>');
    process.exit(1);
  }
  const result = await runPipeline(targetUrl);
  console.log(JSON.stringify(result, null, 2));
}
