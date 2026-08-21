import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Inlines the applied CSS rules captured by render-snapshot into the
 * snapshot's <head> as a <style> tag, so the critical path never blocks
 * on an external stylesheet request.
 *
 * KNOWN LIMITATION: render-snapshot currently captures every CSSOM rule
 * from every same-origin stylesheet that was loaded, not just the rules
 * that paint the above-fold viewport. True above-fold isolation would
 * need to cross-reference matched rules against elements' bounding boxes
 * (getComputedStyle + getBoundingClientRect) within the viewport, which
 * isn't implemented yet. On a simple single-bundle site this still works
 * (there's only one stylesheet to inline), but it will NOT correctly
 * trim CSS on a page with a large separate below-fold stylesheet.
 */
export async function inlineCriticalCss(snapshotPath, cssPath) {
  const html = await readFile(snapshotPath, 'utf-8');
  const rules = JSON.parse(await readFile(cssPath, 'utf-8'));

  if (rules.length === 0) {
    throw new Error(`No applied CSS rules found at ${cssPath} — nothing to inline`);
  }

  const styleTag = `<style data-critical-css="true">${rules.join('\n')}</style>`;

  if (!html.includes('</head>')) {
    throw new Error(`Snapshot at ${snapshotPath} has no </head> tag to inline into`);
  }
  const updated = html.replace('</head>', `${styleTag}</head>`);

  await writeFile(snapshotPath, updated, 'utf-8');
  return { snapshotPath, inlinedRuleCount: rules.length, inlinedBytes: styleTag.length };
}

if (path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1] ?? '')) {
  const [snapshotPath, cssPath] = process.argv.slice(2);
  if (!snapshotPath || !cssPath) {
    console.error('Usage: node criticalCss.mjs <snapshotPath> <cssPath>');
    process.exit(1);
  }
  const result = await inlineCriticalCss(snapshotPath, cssPath);
  console.log(JSON.stringify(result, null, 2));
}
