import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SNAPSHOT_DIR = path.join(ROOT, 'snapshots');

// Above-the-fold viewport used for both the snapshot and later QA diffing.
const VIEWPORT = { width: 1280, height: 800 };

// The snapshot is a static file served from a different location than the
// origin (eventually the edge, tonight the local filesystem for QA). Any
// root-relative asset reference ("/_next/static/...") needs to be rewritten
// to an absolute origin URL, or it 404s/CORS-fails wherever the shell ends
// up being served from. This does not affect protocol-relative ("//") or
// already-absolute (http/https/data) URLs.
function rewriteRootRelativeUrls(text, origin) {
  let out = text.replace(/(href|src)="\/(?!\/)/gi, `$1="${origin}/`);
  out = out.replace(/srcset="([^"]*)"/gi, (_match, value) => {
    const rewritten = value
      .split(',')
      .map((part) => {
        const trimmed = part.trim();
        return trimmed.startsWith('/') && !trimmed.startsWith('//') ? origin + trimmed : trimmed;
      })
      .join(', ');
    return `srcset="${rewritten}"`;
  });
  out = out.replace(/url\((["']?)\/(?!\/)/g, `url($1${origin}/`);
  return out;
}

export async function renderSnapshot(targetUrl) {
  const url = new URL(targetUrl);
  const site = url.hostname;
  const page404Fallback = url.pathname === '/' ? 'home' : url.pathname.replace(/^\/|\/$/g, '').replace(/\//g, '-') || 'home';

  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({ viewport: VIEWPORT });
    const page = await context.newPage();
    await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });

    // Use the browser's resolved URL, not the input URL — sites commonly
    // 308-redirect (e.g. apex -> www), and root-relative asset paths must
    // resolve against wherever the page actually ended up, or cross-origin
    // requests (fonts especially) hit CORS/redirect failures.
    const resolvedOrigin = new URL(page.url()).origin;

    // Capture the rendered DOM as-is (full page markup, not just above-fold —
    // above-fold isolation happens in critical-css based on applied rules).
    const rawHtml = await page.content();
    const html = rewriteRootRelativeUrls(rawHtml, resolvedOrigin);

    // Applied CSS rules actually used to paint the current viewport.
    const rawAppliedCss = await page.evaluate(() => {
      const rules = [];
      for (const sheet of Array.from(document.styleSheets)) {
        let cssRules;
        try {
          cssRules = sheet.cssRules;
        } catch {
          continue; // cross-origin sheet, can't introspect
        }
        for (const rule of Array.from(cssRules || [])) {
          rules.push(rule.cssText);
        }
      }
      return rules;
    });
    const appliedCss = rawAppliedCss.map((rule) => rewriteRootRelativeUrls(rule, resolvedOrigin));

    const siteDir = path.join(SNAPSHOT_DIR, site);
    await mkdir(siteDir, { recursive: true });
    const snapshotPath = path.join(siteDir, `${page404Fallback}.html`);
    await writeFile(snapshotPath, html, 'utf-8');

    const cssPath = path.join(siteDir, `${page404Fallback}.applied-css.json`);
    await writeFile(cssPath, JSON.stringify(appliedCss, null, 2), 'utf-8');

    await context.close();
    return { snapshotPath, cssPath, appliedCssRuleCount: appliedCss.length };
  } finally {
    await browser.close();
  }
}

if (path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1] ?? '')) {
  const target = process.argv[2];
  if (!target) {
    console.error('Usage: node renderSnapshot.mjs <url>');
    process.exit(1);
  }
  const result = await renderSnapshot(target);
  console.log(JSON.stringify(result, null, 2));
}
