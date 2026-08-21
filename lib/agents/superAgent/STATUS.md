# superAgent build — status as of 2026-08-10, daytime session

Branch: `superagent-build` (not merged, not pushed). Source spec:
`G:\My Drive\pingclose-superagent-build-prompt.md` — already fully read
and acted on; does not need to be re-provided to continue this work.

## Built and fully verified (real, tested end-to-end against live pingclose.com)
- `lib/agents/superAgent/CLAUDE.md` — scoped directives (deliberately
  does not include the original doc's "don't ask permission" language)
- `.claude/agents/*.md` — all 6 subagent definitions + `coordinator.md`.
  **Note:** these are accurate specs but have never been run as actual
  Claude Code subagents — tonight's pipeline was verified via the plain
  scripts below, run directly, not via Agent-tool delegation.
- `scripts/renderSnapshot.mjs` — **tested, works**. Captures a real
  snapshot, rewrites root-relative asset URLs to the browser's *resolved*
  origin (handles redirects like apex -> www correctly, fixed today).
- `scripts/criticalCss.mjs` — **tested, works**. Inlines applied CSS
  rules into the snapshot's `<head>`.
- `scripts/visualDiffQa.mjs` — **tested, works**. Real run against
  pingclose.com: **0.00% pixel mismatch, 0 console errors, PASS.**
  Screenshots + diff image saved under `runs/<timestamp>/`.
- `scripts/runPipeline.mjs` — **tested, works end-to-end**:
  render-snapshot -> critical-css -> visual-diff-qa, real PASS result,
  correctly reports `deployEligible: true` while still requiring a
  separate human approval before any deploy call.
- `scripts/pagespeedVerify.mjs` — **tested, works**. Real PageSpeed API
  call against pingclose.com: mobile 99, desktop 100, LCP 1995ms/471ms.
- `.claude/settings.json` — Bash allowlist, confirmed active as of this
  session (no more permission prompts for build commands; deploy
  commands remain explicitly denied).
- `.gitignore` updated to exclude `snapshots/` and `runs/` (regenerable
  artifacts, not source).
- Pre-commit checks passed: `npx tsc --noEmit` clean, `npm run build`
  succeeds (22 pages generated, no errors).
- Security audit: no hardcoded secrets in any file touched (grepped for
  key/secret/token/password — all references are `process.env.*` var
  names, no literal values). `npm audit` shows 6 pre-existing high-
  severity findings, traced via `npm ls` to `next`, `eslint`, and
  `@tailwindcss/postcss`'s own transitive deps (brace-expansion,
  js-yaml, nanoid, postcss, sharp, and next itself) — confirmed NONE
  come from playwright/pixelmatch/pngjs added tonight. Pre-existing
  project-wide issue, out of scope for this build, worth a separate look
  (particularly `next` itself having high-severity SSRF/DoS findings).

## Bugs found and fixed today (real debugging, not guesses)
1. CLI-entrypoint detection (`import.meta.url` vs `process.argv[1]`)
   failed silently on Windows path formats — fixed with
   `path.resolve(fileURLToPath(...))` comparison.
2. Root-relative asset URLs (`/_next/static/...`) didn't resolve when
   the candidate snapshot was opened via `file://` — added URL rewriting
   in render-snapshot.
3. That rewrite initially used the *input* URL's origin
   (`pingclose.com`), but the site 308-redirects apex -> `www`, so
   assets pointed at the wrong host's redirect chain and hit CORS
   failures. Fixed to use the browser's resolved `page.url()` origin
   instead — confirmed via `curl` that only the `www` host serves
   `Access-Control-Allow-Origin: *` on the font assets.
4. The CSS `url(...)` rewrite regex didn't handle quoted URLs
   (`url("/path")`, only bare `url(/path)`) — fixed the regex.

## Real gaps — still not solved
1. **edge-deploy-agent has zero implementation.** No CDN account, no
   credentials, nothing to push to yet.
2. **Architecture decision unmade**: the original spec assumes
   Cloudflare Worker/KV in front of origin, but pingclose.com is hosted
   on Vercel (confirmed via the connected Vercel MCP). Need to decide:
   Vercel Edge Config/Middleware vs. a Cloudflare-in-front-of-Vercel
   proxy layer vs. something else, before edge-deploy-agent can be
   designed at all. **This is the biggest open decision blocking the
   rest of the build.**
3. **render-snapshot captures the whole page DOM**, not just the
   above-fold shell (nav/hero) the spec calls for. Works today because
   pingclose.com's above-fold and full-page content happen to coincide
   in this test; won't hold up on a longer page without real above-fold
   isolation logic (matching DOM elements to viewport bounding boxes).
4. **critical-css inlines every captured rule**, not a true
   above-fold-only rule set — same root cause as #3.
5. **Never tested against a WordPress site.** The spec requires parity
   between WordPress and plain-HTML sites; only pingclose.com (Next.js)
   has been tested.
6. **change-detection-agent is spec-only** — no real polling/cron
   implementation, no state store for last-known content hashes.
7. No unit tests anywhere in `lib/agents/superAgent/`.
8. **Subagent definitions never exercised as actual subagents** — see
   note above. If genuine multi-agent delegation (vs. direct scripts) is
   the goal, that path is unproven.
9. Nothing committed to git yet as of writing this file — pending
   explicit go-ahead this session.

## Rules that stay in force regardless of session
- No `edge-deploy-agent` execution without showing the human exactly
  what would be pushed and getting an explicit yes, every time.
- No `git push`, `vercel deploy`, or `netlify deploy` ever, without the
  standard pre-deploy diff review.
- Root-level `C:\Projects\pingclose\CLAUDE.md` rules (security audit
  before commit, never guess, etc.) apply to this folder too.
