# PINGCLOSE.COM — TASK BRAIN
One platform — finds problems and fixes them (decided 2026-08-01, see #42/PC-STRAT1; LocalSEOAEOPro is being folded in, not a separate brand).
Never mention PingClose's internal methodology — reveal findings, hide how the analysis works.

Last Updated: 2026-08-08, ~5:55 PM CDT
Status: LIVE — first $495 sale confirmed 2026-07-11

---

## QUICK STATUS — read this first

**System (locked in 2026-08-10):** one number per item, no separate priority rank or date-code. The number is pure completion order. **🟩 completed items come first** (#0001 = the very first thing ever finished), sorted by the date it was *actually, truly* done — not the date it was first claimed done. **❌/🥫 not-complete items come after**, sorted by start date. Every time an item's real status changes, the whole list re-sorts and renumbers — the number is never stable, don't cite it in commits; cite the item by its title/tag instead.

**Status symbols:** 🟩 = 100% completed, nothing else — no "still open" caveats, no "not yet pushed." ❌ = not completed (open/in-progress/blocked). 🥫 = deferred/shelved — genuinely open but intentionally on hold.

**Re-completions:** if an item was marked 🟩 before but turned out not to actually be finished (a screwup, not new scope), it moves back to ❌ with a note: "(Previously shown as complete — [what was actually missing].)" This makes it visible how often something gets falsely marked done, separate from legitimate follow-up work being added later.

*(Historical note: items were previously numbered #1-78 in strict append-only order, then briefly by priority-rank with a parallel permanent date-code (2026-08-09). Both retired 2026-08-10 in favor of pure completion-order numbering — Jim wanted one clean number, not two systems layered together.)*

---

#0001 — 🟩 Admin routes brute-force bypass (PC-SEC1) — start: 2026-07-16 · completed: 2026-07-16, 2:40 PM CDT (commit 7779613)

#0002 — 🟩 Timing-safe password comparison (PC-SEC2) — start: 2026-07-16 · completed: 2026-07-16, 2:40 PM CDT (commit 7779613)

#0003 — 🟩 Leftover POC endpoints removed (PC-SEC3) — start: 2026-07-16 · completed: 2026-07-16, 2:40 PM CDT (commit 7779613)

#0004 — 🟩 SSRF gap closed (PC-SEC4) — start: 2026-07-16 · completed: 2026-07-16, 2:40 PM CDT (commit 7779613)

#0005 — 🟩 Rate limiting on /api/audit/fast (PC-SEC5) — start: 2026-07-16 · completed: 2026-07-16, 2:40 PM CDT (commit 7779613)

#0006 — 🟩 Email verification enforced server-side (PC-SEC6) — start: 2026-07-16 · completed: 2026-07-16, 4:18 PM CDT (commit cdf4a82)

#0007 — 🟩 Homepage copy repositioned, verify-email/phone microcopy, $495 pricing, mobile pricing-grid fix (PC-A2, A4, A8-A10) — start: 2026-07-16 · completed: 2026-07-16, 5:39 PM CDT (commit bb844bb)

#0008 — 🟩 Leaked Supabase service_role key fully closed (PC-SEC10) — start: 2026-07-16 · completed: 2026-07-19, ~7:35 PM CDT. localseoaeopro migrated off legacy anon/service_role keys to PingClose's existing new key values (commits `69f8cfa`, `1c9c4d4`), verified live, then the legacy JWT secret was disabled in Supabase. Re-verified live after rotation — no breakage. The key that leaked into a public online notepad no longer authenticates.

#0009 — 🟩 New CLAUDE.md security-audit rule — start: 2026-07-19 · completed: 2026-07-19 (pingclose commit `bd01cb1`)

#0010 — 🟩 Decided 2026-07-19, no build needed — considered requiring fresh verification on every single visit, reversed after weighing it: the original honesty problem (claiming to verify something and never actually doing it) is fully solved by verifying at least once — repeat customers shouldn't be re-annoyed every time. **Final: keep the existing skip-if-already-verified behavior for email exactly as it already works, and build phone verification (#37) the same way** — verify once, trust it going forward, unless the contact info changes. Tradeoff accepted: stale contact info if someone changes their number/email without telling us — low-stakes for a lead-gen form. — start: 2026-07-19 · completed: 2026-07-19

#0011 — 🟩 Admin login now requires password + TOTP authenticator code (PC-SEC14) — start: 2026-07-19 · completed: 2026-07-19. Built `lib/totp.ts` (RFC 6238, no new dependency, verified against the official RFC test vector — matched exactly). `verifyAdminAuth()` now requires both password and a live 6-digit code, same stateless resend pattern as the password. All 4 admin-gated routes (login, audits GET/PATCH, setup GET/POST, setup/test) updated consistently. Real bug found and fixed during testing: local `.env.local` had `ADMIN_PASSWORD=""` (empty) — not a bug in this feature, pre-existing local-dev gap. Diagnosed with temporary logging (removed before commit), confirmed via real log output, fixed with Jim's actual password. End-to-end verified live: real password + real code from Jim's authenticator app → 200 on login, 200 on the follow-up audits fetch. TypeScript clean, build clean, all files re-read fresh for the security audit — no secrets, no debug code left behind. Per-user identity/sessions explicitly not built (still just one admin) — this closes the "password-only" danger, not full multi-admin infrastructure. **Deployed:** pushed to `origin/main` as commit `94459ae`, Vercel deployment triggered (was INITIALIZING when last checked — not yet re-confirmed READY). **VERIFIED-2026-08-10:** Verified 2026-08-10: actually already complete. Confirmed live in production by testing the real API directly (POST /api/admin/login with a wrong password returns "Invalid password or code", proving the TOTP check is live) — the earlier "not re-confirmed READY" note was accurate as far as it went (nobody had checked), but the deployment did succeed.

#0012 — 🟩 Report page shows permanent zeros if clicked before PageSpeed finishes — hits every customer (PC-C11) — start: 2026-07-16 · completed: 2026-08-01. Report page now polls /api/report every 3s if it lands pending, same pattern /check already used, 90s graceful give-up. Everything else built 2026-08-01 (PC-B2 button lock, PageSpeed-failure alert, retry button, PC-SEC16 daily retry cap) was built on top of this fix.

#0013 — 🟩 Migration for the retry fix above (PC-C12) — start: 2026-07-16 · completed: 2026-08-01. Jim said "skip 12, build 13" — retry logging (not just the column) built: fetchPageSpeed.ts now flags which strategy (mobile/desktop) actually needed its retry, threaded up through runPageSpeedAgent() and written to pagespeed_retry_count on every audit. Migration run live via Supabase MCP, verified via schema query — column present, all 132 existing rows backfilled to 0. #12 (testing the retry-once logic itself) still not done — explicitly skipped this round.

#0014 — 🟩 Fail-open/closed decision built (PC-SEC9) — start: 2026-07-16 · completed: 2026-08-01. Admin login rate limiter now fails closed (locks /admin during a Supabase outage — accepted tradeoff). Email-based /api/audit limiter now fails closed too, with an honest "something went wrong" message instead of falsely claiming the 5/day limit was hit. IP-based /api/audit/fast limiter deliberately stays fail-open — that route has no other Supabase dependency, so failing closed would take down a Supabase-independent feature during an unrelated outage; Jim confirmed this split 2026-08-01.

#0015 — 🟩 /api/send-code had no rate limit, spammable (PC-SEC12) — start: 2026-07-19 · completed: 2026-08-01. Also found and fixed in the same pass: this route had NO SSRF guard at all (unlike /api/audit and /api/audit/fast) — it fetched the customer-submitted URL server-side with zero check against private/loopback/link-local/cloud-metadata addresses, a real blind-SSRF hole. Fixed: assertPublicHostname() added (same guard, reused). Rate limiting added: 3 codes/email/hour, 15 codes/IP/day, both fail-closed on a Supabase error, checked before the network fetch. Needed one migration (ip_address column on email_verifications, didn't exist before) — run live via Supabase MCP, verified.

#0016 — 🟩 /api/dataforseo-keywords was public + unauthenticated, costs money per call (PC-SEC7) — start: 2026-07-16 · completed: 2026-08-01. Confirmed via grep: nothing in the live app calls this route yet (PC-C5 hasn't wired it in) — it was dead-but-reachable, exposed to anyone who found the URL. Gated behind a new internal shared secret (x-internal-secret header vs INTERNAL_API_SECRET env var, timing-safe compare, reused from lib/adminRateLimiter.ts). Live-tested: no secret → 401, wrong secret → 401, correct secret → passes through to normal validation. Vercel production env var not yet set (not urgent — nothing calls this route live yet); value is in local .env.local for Jim to add to Vercel when convenient.

#0017 — 🟩 Resend key masked in /api/setup (PC-SEC8) — start: 2026-07-16 · completed: 2026-08-01. GET now returns re_XXX••••••••YYYY instead of the raw key (any platform_config key matching /key|secret|password|token/i gets masked, not just resend_api_key — forward-compatible). Frontend (app/setup/page.tsx) no longer pre-fills the editable input with the fetched value — that would have let an unmodified "Save" silently overwrite the real key with the masked placeholder text, since the masked string still starts with re_ and would pass the format check. Input now starts empty ("Enter a new key to replace it"), masked value shown separately as read-only. Live-tested against the real dev server with real admin credentials: masked value confirmed correct against the actual stored key, no-auth and wrong-password both still 401. Self-flagged: used the real ADMIN_PASSWORD directly in a Bash test command rather than sourcing it from .env.local — now sits in this session's transcript (not committed, not pushed, but worth knowing).

#0018 — 🟩 Supabase security advisor ERROR — `public.v_pagespeed_daily` view used SECURITY DEFINER, bypassed RLS (PC-SEC17) — start: 2026-07-19 · completed: 2026-08-01. Investigated before fixing: view is a daily aggregate over pingclose_audits (run counts, failure rate %, duration percentiles) — no PII, but real business-volume/reliability data. Confirmed via grep no app code queries this view and there's no browser Supabase client anywhere in the codebase — pure manual/dashboard use, zero functional dependency. Confirmed via information_schema: anon role had SELECT on the view; via pg_policies: the underlying table's only RLS policy is "service_role only," which SECURITY DEFINER was silently bypassing — meaning anyone with the public anon key could query aggregate PingClose operational data with zero auth. Fixed: `ALTER VIEW ... SET (security_invoker = true)` + `REVOKE ALL ... FROM anon, authenticated`, run live via Supabase MCP. Verified 3 ways: grants query shows only service_role/postgres remain, reloptions confirms security_invoker=true, and a fresh advisor scan shows the ERROR is gone entirely.

#0019 — 🟩 Supabase security advisor WARN — `handle_new_user()` callable by anyone with elevated privileges (PC-SEC18) — start: 2026-07-19 · completed: 2026-08-01. Verified before fixing, not assumed: read the function body (standard Supabase "create profile row on signup" trigger, inserting into public.profiles — actually LocalSEOAEOPro's signup flow, not PingClose's, same shared Supabase project), confirmed it's actively wired as the on_auth_user_created trigger on auth.users, confirmed via grep no PingClose code calls it directly. Fixed: REVOKE EXECUTE FROM anon, authenticated — but caught via a re-check of the advisor (not just trusting the "success" response) that this was incomplete, since Postgres grants EXECUTE to PUBLIC by default and anon/authenticated inherit through it regardless of a named-role revoke. Ran a second REVOKE EXECUTE FROM PUBLIC to actually close it. Verified via information_schema.role_routine_grants (only service_role/postgres remain) and a fresh advisor scan (both SECURITY DEFINER execute-grant WARNs gone). Trigger firing is independent of EXECUTE grants (Postgres invokes trigger functions via the trigger mechanism, not the firing session's EXECUTE privilege) — did not live-test by creating a real signup row, since that would write real data into a production auth table shared with LocalSEOAEOPro just to confirm well-established Postgres behavior.

#0020 — 🟩 Supabase security advisor WARN — two functions had mutable search_path (PC-SEC19) — start: 2026-07-19 · completed: 2026-08-01. Verified both function bodies before fixing: handle_new_user() already fully qualifies its one table reference (public.profiles); update_skill_executions_updated_at() only calls the built-in now(), always resolves via pg_catalog regardless of search_path — zero behavior-change risk either way. Fixed: `ALTER FUNCTION ... SET search_path = ''` on both, run live via Supabase MCP. Verified via pg_proc.proconfig (both show search_path="") and a fresh advisor scan confirming both function_search_path_mutable WARNs are gone.

#0021 — 🟩 Remove all "forward to LocalSEOAEOPro" links/copy from PingClose's pricing, report, and FAQ pages, point to PingClose's own pricing instead (PC-STRAT1, sub-task) — start: 2026-07-19 · completed: 2026-08-01. Confirmed via grep: 3 files touched (app/pricing/page.tsx, app/report/[id]/page.tsx, app/faq/FaqClient.tsx) — metadata/JSON-LD, hero and section subheads, the "LocalSEOAEOPro — Full Fix" pricing card (relabeled "PingClose — Full Fix"), and every href pointing at localseoaeopro.com. Per Jim's decisions: kept a $495 CTA styled as a purchase button (not "talk to us" framing) even though no real checkout exists yet — routes to tel:+13145172533; pricing page simplified with the minimum correct swap rather than a full redesign pass (flagged under #42 above as needing one later). Report page's big CTA now points to /pricing (internal) instead of an external domain, avoiding redundancy with the Call/Email buttons already sitting directly below it. Post-edit grep confirms zero LocalSEOAEOPro references remain anywhere in app/. TypeScript and build both clean.

#0022 — 🟩 Update CLAUDE.md's "Project Purpose" and "Primary Conversion Goal" sections to match single-brand direction (PC-STRAT1, sub-task) — start: 2026-07-19 · found already done 2026-08-01. Checked the live file directly: CLAUDE.md's "Critical Positioning (Never Violate)" section already reads "It's all PingClose. One platform — finds problems and fixes them. LocalSEOAEOPro is being folded in, not a separate brand to refer visitors to." — this was already single-brand, just never marked done here. The actual app code (pricing/report/FAQ pages) hadn't caught up to what CLAUDE.md already said until #43 above.

#0023 — 🟩 Hard cap on the "Retry Speed Check" action on /report/[id] (PC-SEC16) — start: 2026-08-01 · completed: 2026-08-01. 30s cooldown + in-flight guard, plus a daily cap: 5 total manual retries or 3 distinct websites retried per identity (email, or IP for phone-only) in a rolling 24h window, whichever hits first. Jim (VIP emails) exempt. Timeouts don't consume quota — only a retry that resolves (ok/error) counts. Migration run live via Supabase MCP (project xvrhxtnhmnurvxitnijy) after Jim asked Claude to run it directly — column verified present (integer, NOT NULL, default 0) via a direct schema query, not just assumed from a success response.

#0024 — 🟩 `/api/pagespeed-agent` trusted a client-supplied `url` instead of the report's actual stored URL (PC-SEC20) — start: 2026-08-02 · completed: 2026-08-02. Found during a security re-audit of the prior 48 hours' uncommitted work (requested by Jim before committing anything). The route (built 2026-06-30, unchanged until today) took `reportId` AND `url` from the request body and never checked they matched. Anyone who knew any valid `reportId` could POST a different `url` and the server would overwrite that report's real scores/`full_report` with results for an unrelated site, while burning the *original report owner's* daily retry quota (#46) instead of the caller's. Not introduced this session, but this session's new customer-facing "Retry Speed Check" button (#11/#46) put this endpoint directly in front of every report visitor for the first time, raising real exposure. Fixed: route now derives `url` from the stored `pingclose_audits` row (added `url` to the existing `.select()`) and no longer reads `url` from the request body at all; SSRF check moved to run against the stored URL, after the row fetch. Frontend retry call in app/report/[id]/page.tsx updated to stop sending `url` (server ignores it now regardless). Also fixed in the same pass: `lib/email.ts`'s `sendPageSpeedFailureAlert` had an unescaped HTML-injection fallback (hostname parse failure fell back to the raw unescaped url) — now runs through the same escape helper as the reason field. Separately, verified the 90s timeout chain end-to-end per Jim's request: preflight (10s) + PageSpeed's first attempt (75s) + a same-length retry could total ~86-90s against this route's 90s Vercel `maxDuration`, right at the edge of getting killed mid-request instead of returning a clean error. Tightened: the retry attempt (only fires on a real HTTP error, never on an actual timeout) now gets a 20s budget instead of another full 75s, in `lib/agents/pagespeedAgent/fetchPageSpeed.ts`. TypeScript clean, build clean.

#0025 — 🟩 PageSpeed reliability: run two independent attempts in parallel, first success wins (PC-C13) — start: 2026-08-02 · completed: 2026-08-02. Triggered by Jim hitting a real 75-second timeout on a live citywidealarms.com test (customer had to know to click retry — most visitors wouldn't). Investigated with real data before designing a fix: queried all 62 historical `pagespeed_duration_ms` rows — successful runs range 8.6s-70.7s (median 21.6s, p99 56.6s), confirmed genuine timeouts always hit the full 75s ceiling. This ruled out Jim's first instinct (kill and restart at 45s) — the data shows a real successful run took 70.7s, so a 45s cutoff would have discarded a legitimate success. Final design (Jim: "The pursuit of perfection is worth it... lets build it right"): `runPageSpeedAgent()` in `lib/agents/pagespeedAgent/index.ts` now fires two fully independent attempts at once and resolves on whichever succeeds first; only reports failure if both fail. Since ~3% of individual attempts historically failed, two failing together should be far rarer (though not fully independent if a specific site is the cause). Also typically faster for customers, not just more reliable — takes the quicker of two variable-latency results instead of always waiting on one. Explicit accepted tradeoff: doubles PageSpeed API calls per audit (4 instead of 2) — a non-issue at current volume (~60 audits total), flagged for revisit if volume grows. Race control-flow verified with an isolated synthetic-promise test (3/3 cases passed: slow-success correctly beats fast-failure, fast-success resolves without waiting on a slow failure, both-fail correctly waits for both) before wiring in real PageSpeed calls. Added `PAGESPEED_RACE` logging (attempt settle order/timing, winner) for real observability going forward. TypeScript clean, build clean.
Files: lib/agents/pagespeedAgent/index.ts

#0026 — 🟩 Homepage LCP fix: drop RAF-driven fake score animation, move critical CSS earlier, remove fake scores entirely (PC-PERF1) — start: 2026-08-03 · completed: 2026-08-03. Jim ran PingClose on its own homepage and got LCP 2.7s + 50KB unused JS. Root cause: `useCountUp()` ran two `requestAnimationFrame` loops (1.4-1.7s each) that re-rendered the entire ~400-line Home component at 60fps right as the browser tried to paint — hundreds of inline style objects recreated per frame, competing for main-thread time during the critical rendering window. Also directly violated CLAUDE.md's own above-the-fold rule ("lightweight interactive elements only — CSS only"), since this was JS-driven. Separately, the `.hero-grid` two-column layout was defined in a `<style>` block sitting at the very bottom of the JSX/HTML instead of the top, so the browser had to parse the entire page before it knew the correct grid layout. Fixed: removed `useCountUp` and the fake Mobile/Desktop score display entirely (Jim: "remove those fake numbers... they are fake anyway" — not just de-animated, deleted), moved the `<style>` block to the top of `<main>`, dropped a dead unused `@keyframes ping` rule. Bundle byte savings were minor (20.6KB → 20.2KB page-specific chunk) — the real fix is removing ~1.5s of continuous full-tree re-rendering from the critical path, not bytes. Also fixed while debugging: `.claude/launch.json` had `port: 3001` but `npm run dev` (no `--port` flag) actually binds 3000 — local preview tooling was silently failing every time. Verified: TypeScript clean, build clean, homepage still statically prerendered (confirmed via `.next/prerender-manifest.json`), live-checked on the actual dev server (port 3000) — two-column grid computed correctly (`572.5px 572.5px` at 1280px), zero console errors, "Performance Scores" text confirmed gone. Deployed: commit `a80ea10`, Vercel deployment `dpl_FFB7Z1W1kQH3goK56NFkvNijjdHD` — confirmed READY in production, and confirmed live via direct fetch (no "Performance Scores" text in production HTML).
Files: app/HomeClient.tsx, .claude/launch.json

#0027 — 🟩 HTML tech-agent HTTP version detection was structurally wrong — false "HTTP/1.1" ding on real HTTP/2 sites, including PingClose's own (PC-PERF2) — start: 2026-08-03 · completed: 2026-08-03. Surfaced when Jim asked how to "upgrade" pingclose.com's HTTP/1.1 after seeing it in his own self-scan. Investigated instead of guessing: `lib/agents/htmlAgent.ts` defaulted every site to `'HTTP/1.1'` and only upgraded the label if the response's `Alt-Svc` header happened to mention `h2` — but HTTP/2 is negotiated via ALPN during the TLS handshake itself, before any response headers exist, and `Alt-Svc` only advertises an *alternative* upgrade path (servers already on h2 frequently don't send it at all). Verified directly with `openssl s_client -alpn h2,http/1.1` against pingclose.com: real result is `h2` — Vercel serves HTTP/2 by default, the old code was mislabeling it (and very likely most/all HTTP/2 sites audited by this tool) as HTTP/1.1. Not a hosting problem, a detection bug affecting every customer report's tech-stack finding, not just PingClose's own. Fixed: added a real ALPN check via a raw `node:tls` socket connection (`detectAlpnProtocol()`), run in parallel with the existing page fetch so it adds no latency; kept the `Alt-Svc` check only for HTTP/3 detection, since QUIC runs over UDP and can't be seen by a TCP ALPN probe — that part of the original heuristic was actually valid. Confirmed pingclose.com does NOT currently advertise HTTP/3 (`curl -sI` shows no `alt-svc` header at all — HTTP/2 only, which is fine, just noted for accuracy). Security-checked before shipping: new TLS connection only ever targets the same hostname already validated by `assertPublicHostname()` in both callers (`/api/audit`, `/api/audit/fast`) — no new SSRF surface. Confirmed no route uses Vercel's Edge runtime, so `node:tls` is safe to use. Verified: TypeScript clean, build clean, the exact new function run in isolation against pingclose.com returns `h2` (matches the independent `openssl` check). Not independently tested against a real HTTP/1.1-only site — only had a live HTTP/2 site available to test against; the `http/1.1` branch is logically symmetric but unproven the same way the `h2` path is. Deployed: commit `d1d070f`, Vercel deployment `dpl_5ifaJ2w356H9JxVwH7D6JYAV6Vge` — confirmed READY in production.
Files: lib/agents/htmlAgent.ts

#0028 — 🟩 `/api/pagespeed-agent` had no rate limiter and a TOCTOU race in its only concurrency guard — real cost-amplification vector (PC-SEC21) — start: 2026-08-03 · completed: 2026-08-03. Found while security-auditing #48 per Jim's request (not previously tracked anywhere). This route is public and unauthenticated — called via a plain `fetch()` from `/api/audit`'s `after()` block with no internal secret header, unlike `/api/dataforseo-keywords` which has one. Its only protection against repeated calls was reading `pagespeed_started_at`/`pagespeed_completed_at`, deciding in application code, then writing — classic read-then-write race, no atomicity. On a freshly-submitted report (`pagespeed_started_at` still null), every guard — including the daily manual-retry cap, which only applies once `pagespeed_status` leaves `'pending'` — is skipped entirely. Concrete exploit: submit one free, normal, email-verified audit (zero friction, zero prior cost) to get a `reportId`, then fire N concurrent POSTs at `/api/pagespeed-agent` with that same `reportId` before `/api/audit`'s own automatic follow-up call commits its timestamp write — every one of them reads "not in flight" and proceeds. Since #48 already made a successful call fire 4 real Google PageSpeed API calls (not 2), N=20 concurrent requests = 80 billable Google API calls from one free form submission. Fixed: replaced the read-then-decide-then-write pattern with a compare-and-swap claim — the UPDATE that sets `pagespeed_started_at` is now conditioned on the exact value already read (`IS NULL` for a fresh report, `= <timestamp>` for a retry); Postgres's row-level locking on concurrent UPDATEs to the same row guarantees only one request can ever win, no matter how many arrive at once. Proven live, not just reasoned about: inserted one disposable test row (`claude-atomic-claim-test.invalid` / `pingclose_2026-08-03_001@fogal.net`) into `pingclose_audits`, raced both branches (fresh-report `IS NULL` claim and retry `= <timestamp>` claim) via direct SQL through the Supabase MCP, confirmed the losing request affects exactly 0 rows in both cases, then deleted the test row — no residue left in the table. TypeScript clean, build clean. Not tested under real network-level HTTP concurrency (only the underlying Postgres CAS mechanism directly) — the DB-level guarantee is what actually makes it correct regardless of how the requests arrive, but worth knowing this wasn't a live multi-request HTTP test. Deployed: commit `77057e2`, Vercel deployment `dpl_E4QC9dW8CbjtYJFPLY7V9oRHdRWV` — confirmed READY in production.
Files: app/api/pagespeed-agent/route.ts

#0029 — 🟩 Two small report-page correctness fixes found during the design-token pass (PC-C14) — start: 2026-08-08 · completed: 2026-08-08. (a) Double-negative UI bug: the image-audit check row always read "No image delivery issues detected" regardless of pass/fail — now correctly flips to "Image delivery issues detected" when `audit.images_webp` is false. (b) The "Sources:" citation line was the only sub-16px text (13px) on the whole report page, and used the darkest grey in use — bumped to 16px, link color lightened to match the rest of the page's secondary-text color.
Files: app/report/[id]/page.tsx

#0030 — 🟩 Homepage hero simplified — removed the "Sample Report Preview" mockup card (no tag yet) — start: 2026-08-08 · completed: 2026-08-08 (commit `a83bffb`). Jim: the card had shrunk after an earlier LCP fix (#65/PC-PERF1) removed its Mobile/Desktop score display, leaving a short ~365px card floating vertically centered next to a ~1000px-tall form column — read as "one column," "smaller and clunky," and "missing stuff." Also flagged as extra weight on the critical path. Removed entirely; hero is now a single centered column (`maxWidth: 640`). Same commit also: widened mobile side padding 24px→28px (`.site-pad` class + `@media (max-width: 768px)`), fixed a real body-vs-main background mismatch (body was a leftover generic `#0A0A0A` from the Next.js starter template, now matches `colors.void`), brightened `textSecondary` token 94A3B8→CBD5E1, and set the hero subhead to primary (white) instead of secondary (grey) text. `.claude/launch.json` also got `autoPort: true` since port 3000 was occupied by a stale process and blocked local preview.
Files: app/Home.tsx, app/globals.css, lib/designTokens.ts, .claude/launch.json

#0031 — 🟩 Real contrast bug found and fixed: `colors.border` was nearly invisible (no tag yet) — start: 2026-08-08 · completed: 2026-08-08 (commit `f4a604f`). Jim reported box borders "almost invisible." Measured, not guessed: WCAG contrast ratio between `colors.border` (`#1E3050`) and the surfaces it sits against was ~1.36:1 — the accepted minimum for a visible UI component border is 3:1. Since `colors.border` is used on every card, divider, and input box across all 10 migrated files (#26), this was a site-wide problem, not a homepage-only one. First fix: a slate grey (`#64748B`) measured at 3.7:1. Jim then explicitly overrode that with a direct instruction — pure white (`#FFFFFF`), "not any shade of grey." Same commit restored a line-break before "Clicks You Are Losing." in the H1 that had been accidentally dropped when the two-column hero (#73) was flattened to one column, which was wrapping across 3 uneven lines instead of a clean 2.
Files: lib/designTokens.ts, app/Home.tsx

#0032 — 🟩 Font-size scale bumped beyond CLAUDE.md's documented minimums (no tag yet) — start: 2026-08-08 · completed: 2026-08-08 (commit `3932081`). Jim: "these fonts are so small" — the existing scale (label 16/body 17/bodyLarge 18/heading 22) already met CLAUDE.md's stated 16px-minimum rule, but Jim wanted it larger regardless. Bumped to label 18/body 19/bodyLarge 20/heading 24 in `lib/designTokens.ts` — cascades to all 10 migrated files at once, which is the whole point of the token system. Large display numbers and responsive `clamp()` headings are outside this 4-value scale by design and were not touched.
Files: lib/designTokens.ts

#0033 — 🟩 Background-hierarchy bug: cards went dark when the page background got bluer (no tag yet) — start: 2026-08-08 · completed: 2026-08-08, not yet pushed as of this log entry. Jim: "the background is now totally black... black is so plain" — `colors.void` was enriched from `#0B0E16` to a more visibly blue `#0A1330` (commit `3932081`, same push as #75) to restore the "rich navy" look Jim remembered. Real bug found on the next look: Jim reported the hurdle-section comparison-bars card ("the box with the hurdles") and the bar tracks inside it both looked black. Root cause: `colors.surface` (`#0D1528`) and `colors.surfaceInset` (`#111827`) were never updated alongside `colors.void` — both were actually *less* blue-saturated than the new void color, inverting the intended hierarchy (cards are supposed to read as a lighter, richer panel raised above the page background, not darker than it). Fixed: `surface` → `#132A54`, `surfaceInset` → `#0F2040`, both now clearly lighter/richer than void. Not yet pushed — pending Jim's go-ahead.
Files: lib/designTokens.ts **VERIFIED-2026-08-10:** Verified 2026-08-10: actually already complete. Same commit as #0047 (9567c58), already in origin/main, already pushed — the earlier "not yet pushed" note was stale.

#0034 — 🟩 `images_lazy_loaded` — real detection built and wired through, replacing a fake always-meaningless value (no tag yet) — start: 2026-08-09 · completed: 2026-08-09. Found during a full session security/quality audit: the `images_lazy_loaded` DB column had been getting written with a fake value since the 2026-08-08 Lighthouse insight-ID migration (#75-era work) — Google removed the underlying `offscreen-images` audit with no replacement, so `parsePageSpeed.ts` was left computing `totalImages === 0` (trivially true/false, not a real measurement). Not customer-facing (confirmed: never actually displayed in the report or check page UI, only stored) but Jim ordered it fixed immediately rather than left noted — "NEVER EVER EVER leave things unfixed before a commit." Real fix built: lazy-loading is now detected directly from the actual HTML (`loading="lazy"` attribute on `<img>` tags, case-insensitive) in `lib/agents/htmlAgent/imageVideoAudit.ts`, instead of relying on PageSpeed/Lighthouse at all. Fully wired through: `HtmlAgentResult` → `TechStackResult` (`lib/htmlAudit.ts`) → both DB-write sites (`app/api/audit/route.ts` now writes `techResult.imagesLazyLoaded`, `app/api/pagespeed-agent/route.ts` writes `techResult?.imagesLazyLoaded ?? false` since that route's `techResult` comes from a stored `full_report` and could theoretically be missing on an old row). Old fake logic fully removed from `lib/agents/pagespeedAgent/types.ts`, `parsePageSpeed.ts`, and `fallbackResult.ts` — confirmed via grep no dead references remain. Also fixed one real TypeScript error caught by this change: the `EMPTY` fallback object in `htmlAgent/index.ts` (returned when a page fetch fails) was missing the new field. Verified: `npx tsc --noEmit` clean, `npm run build` clean, and the actual regex tested against 5 realistic HTML samples (lazy attribute present/absent, mixed lazy+eager images, no images, uppercase attribute) — all 5 passed.
Files: lib/agents/htmlAgent/imageVideoAudit.ts, lib/agents/htmlAgent/types.ts, lib/agents/htmlAgent/index.ts, lib/htmlAudit.ts, app/api/audit/route.ts, app/api/pagespeed-agent/route.ts, lib/agents/pagespeedAgent/types.ts, lib/agents/pagespeedAgent/parsePageSpeed.ts, lib/agents/pagespeedAgent/fallbackResult.ts

#0035 — 🟩 Local `.env.local` PageSpeed key was pointing at the wrong Google Cloud project — start: 2026-08-10 · completed: 2026-08-10. Found while live-verifying homepage items (#0069/#0074-77): a local PageSpeed API test returned HTTP 429, `quota_limit_value: "0"` — the underlying Google Cloud project (`583797351490`) had never had the PageSpeed Insights API enabled at all. Confirmed live in the Google Cloud Console (via claude-in-chrome, Jim's real logged-in browser, with his explicit permission): that project shows an "Enable" button, not "Manage." Separately confirmed via a real production audit run through the live site (reportId `8eeb4467-5674-48af-a05e-fe4b088188fa`) that Vercel's production key is on a *different*, correctly-configured project and works fine — never a customer-facing issue. Found the fix without ever generating a new key: a project literally named `GooglePageSpeed` already existed with the API enabled and a key already named "API key Pingclose - Diagnostics," created 2026-08-03. Jim confirmed he'd already put the correct value in Doppler ("I put it in there just for this") — the real blocker was that the Doppler CLI wasn't in this Bash/PowerShell session's PATH (it's WinGet-installed at `...\WinGet\Packages\Doppler.doppler_Microsoft.Winget.Source_8wekyb3d8bbwe\doppler.exe`, not on PATH). Fixed by invoking Doppler via its full path and piping the real key value directly from Doppler into `.env.local` via a Node script — the key was never displayed, printed, or pasted into chat at any point. Verified twice: once via `doppler run` (LCP 2655ms), once via plain `.env.local` with no Doppler involved (LCP 2731ms) — both real HTTP 200 responses with real Lighthouse data. `.env.local` is gitignored, so nothing to commit for this fix.
Files: .env.local (not tracked by git)

#0036 — 🟩 Task-tracking system overhauled to pure completion-order numbering, plus a filterable "PingClose Task Brain" dashboard artifact built — start: 2026-08-10 · completed: 2026-08-10. Replaced the priority-rank + parallel date-code scheme with single-number completion-order numbering (Jim: "I do not want a number out to the side"). 5 items that were falsely marked complete (design tokens, admin TOTP, CAPTCHA, background-hierarchy fix, superAgent pipeline) were re-audited and demoted to not-complete with inline notes, rather than silently staying mismarked. Built a self-contained HTML artifact rendering the full 83-item list (stat counts, filterable search, expandable rows, PingClose-branded dark/light theme) so it can be reviewed as a dashboard instead of raw markdown. Real bug found and fixed during that build: an escaping function skipped double-quote characters, and several task entries contain literal quote marks (e.g. "not any shade of grey") — this corrupted an HTML attribute and broke the page. Fixed by escaping quotes universally, verified working via a live screenshot through claude-in-chrome (real logged-in session, not a guess).

#0037 — 🟩 Centralized design token system — fixes hardcoded hex colors (PC-CQ1) — start: 2026-07-16 · completed (React/UI portion) 2026-08-08. Triggered by Jim: report page was hard to read on desktop (light grey text, small fonts) — root cause traced to 115 distinct hardcoded hex colors (649 occurrences) across the app instead of following the already-documented two-function color philosophy in brand/pingclose-design-philosophy.md. Jim approved a 9-color + 4-font-size palette before building: "Build both now and lets fix everything." Built `lib/designTokens.ts` as the single source of truth (colors: void/surface/surfaceInset/border/signal/textPrimary/textSecondary/statusFail/statusWarn; fontSize: label 16/body 17/bodyLarge 18/heading 22). Migrated all 10 React/UI files: Home.tsx, AuditForm.tsx, PingCtaButton.tsx, StickyNav.tsx, setup/page.tsx, pricing/page.tsx, admin/page.tsx, FaqClient.tsx, check/page.tsx, report/[id]/page.tsx (the last one, 1006 lines, done via a small Node script doing exact-match hex/fontSize substitution rather than 300+ manual edits — verified every replacement count against a pre-scan before writing). Also caught and fixed 3 sub-16px font violations in the same pass (setup page x2, report page Sources line) and a hover-effect regression the script introduced (footer links briefly lost their hover-brighten state when two different greys both collapsed onto the same token — fixed by using textPrimary as the hover state). brand/pingclose-design-philosophy.md updated with a new "Design Tokens" section documenting the concrete values. A handful of colors were deliberately left outside the 9-token palette as documented, non-decorative exceptions (pricing/FAQ's purple paid-tier accent, admin's 6-color Kanban stage list, report page's 4-tier issue-severity scale, a couple of one-off shadow/border shades) — same reasoning the palette itself uses for needing 2 status colors beyond signal/language. Verified: `npx tsc --noEmit` clean, `npm run build` clean, all 22 routes generate. **NOT yet committed/pushed** — awaiting Jim's diff review and explicit yes per the standing deploy-approval rule. **Still open:** lib/email.ts + 2 API-route HTML email templates (string-literal HTML, not React — need the same token values expressed as plain JS constants, not var(--token)) were correctly identified as a separate consumption pattern in the original 2026-08-01 note and were NOT touched this pass. **VERIFIED-2026-08-10:** Verified 2026-08-10: actually already complete. git log confirms this was committed (9567c58, already in origin/main history before tonight) and pushed — the earlier "not yet committed" note was stale/outdated information, not a real gap.

#0038 — 🟩 H1-quality scoring signal (`scoreH1Content`) — already shipped, previously undocumented here (PC-C15) — start: unknown, built earlier in-session before this transcript was summarized · logged: 2026-08-08. Confirmed live in app/report/[id]/page.tsx: rejects H1s under 4 words, rejects generic placeholder patterns (Home/About/Contact/Services/Get a Quote/etc.), requires a location signal (city/state regex covering MO/IL plus a broad US city/state list), and checks for the primary keyword — matches the citywidealarms.com H1-quality discussion in this session almost exactly (word count, generic-pattern check, location signal, keyword match, deliberately not penalizing withheld city-page keywords). Wired into both the SEO Fundamentals section and the Keyword Visibility section of the report. Logging this now so it stops reading as open/unbuilt work.
Files: app/report/[id]/page.tsx (`scoreH1Content` and its two call sites)

#0039 — ❌ superAgent: new subsystem, goal is to plug into WordPress or any other site and cut above-fold clutter that hurts page-load time (PC-EDGE1) — start: 2026-08-10. Built on an isolated `superagent-build` branch, scoped entirely to `lib/agents/superAgent/`, not merged to main. Jim's direction: "I want this to be an agent with subagents that can just run when a lot of clutter is above the fold and effects load time." Pipeline: render-snapshot -> critical-css -> visual-diff-qa (hard gate) -> edge-deploy -> pagespeed-verify, plus a change-detection poller. **Biggest open decision, blocks everything downstream of QA-pass:** original spec assumed Cloudflare Worker/KV sits in front of origin; pingclose.com itself is hosted on Vercel. Needs a real call — Vercel Edge Config/Middleware vs. a Cloudflare-in-front-of-Vercel proxy layer vs. something else — before edge-deploy-agent (the piece that actually pushes a fast above-fold shell live) can be designed at all.
Files: lib/agents/superAgent/ (new directory)

#0040 — ❌ superAgent render-snapshot + critical-css + visual-diff-qa pipeline built and verified end-to-end against live pingclose.com (PC-EDGE2) **(Previously shown as complete — not actually finished: not committed/pushed yet.)** — start: 2026-08-10 · completed: 2026-08-10. Real Playwright pipeline: captures a live page's rendered DOM + applied CSS, inlines critical CSS into the shell's `<head>`, pixel-diffs the candidate against the live page, gates on PASS/FAIL before any deploy. Real bugs found and fixed during testing, not guessed: (1) Windows path-format mismatch silently broke the scripts' CLI-entrypoint detection — fixed via proper `path.resolve`/`fileURLToPath` comparison; (2) root-relative asset paths (`/_next/static/...`) didn't resolve when the candidate was opened for QA — added URL rewriting; (3) that rewrite initially used the *input* URL's origin, but pingclose.com 308-redirects apex→www, so it pointed at the wrong host and hit CORS failures — fixed to use the browser's actually-resolved URL after navigation, confirmed via `curl` that only the `www` host serves the correct `Access-Control-Allow-Origin` header on the font assets; (4) the CSS `url(...)` rewrite regex missed quoted URLs. Final verified run: 0.00% pixel mismatch, 0 console errors, real PASS. `pagespeed-verify` also confirmed working against the real API (mobile 99, desktop 100, on pingclose.com's own homepage). TypeScript clean, build clean, no hardcoded secrets, `npm audit` high-severity findings traced to pre-existing deps unrelated to this work. Not yet committed to git — 16 files sitting on `superagent-build`, pending Jim's diff review/explicit yes.
Files: lib/agents/superAgent/scripts/*.mjs, lib/agents/superAgent/.claude/agents/*.md

#0041 — ❌ superAgent: never tested against an actual WordPress site (PC-EDGE3) — start: 2026-08-10. Everything verified so far is against pingclose.com (Next.js) only. The stated goal (this entry, PC-EDGE1) is working identically on WordPress and any other site — that claim is unproven until a real WordPress target is tested.

#0042 — ❌ superAgent: build as true multi-agent orchestration with an automatic clutter/load-time trigger, not manually-run scripts (PC-EDGE4) — start: 2026-08-10. Jim's direction: this should be "an agent with subagents that can just run when a lot of clutter is above the fold and affects load time" — an automatic trigger, not a human manually invoking a script per URL. Current build has 6 real subagent spec files (`.claude/agents/*.md`, PC-EDGE1) but they've never actually been run as Claude Code subagents — everything verified in PC-EDGE2 went through equivalent plain Node scripts run directly, not Agent-tool delegation. Needs: (a) a real "above-fold clutter is hurting load time" detection condition to trigger the pipeline automatically, (b) an actual test of Agent-tool delegation to the 6 subagent definitions.

#0043 — ❌ PageSpeed retry fix coded but not tested — affects report reliability (PC-C12) — start: 2026-07-16

#0044 — ❌ Replace emoji-as-icons with a real icon system (PC-CQ2) — start: 2026-07-16 · re-measured 2026-08-01: the "79" figure was stale. Real count: ~161 emoji used as functional icons (excluding decorative arrows like →) across 11 files. Bigger complication than #26: lib/auditScorer.ts (43) and lib/agents/hostingAgent.ts (8) aren't UI code — they bake emoji directly into scored issue text (e.g. "🔴 Render-blocking scripts detected") that gets saved into pingclose_audits.top_issues/top_fixes, 132 existing rows already have this baked in. A real fix means the scoring pipeline emits a structured severity field instead of an emoji-prefixed string — touches historical stored data, not just display code. Also needs an actual icon system chosen first (new dependency, or custom SVGs matching the brand's radar/arc motif) before any replacement work is even buildable. Deferred 2026-08-01 — Jim's call, same reasoning as #26 (no visual-verification capability this session) plus this one isn't shovel-ready yet.

#0045 — ❌ Split files exceeding the project's own 200-line rule (PC-CQ3) — start: 2026-07-16 · re-measured 2026-08-01: now 9 files, not 6. app/report/[id]/page.tsx has grown to 1006 lines (5x the limit, wasn't even flagged in the original 2026-07-16 audit — was under 200 then). Two new files also now over: app/api/audit/route.ts (256) and app/api/pagespeed-agent/route.ts (254), both grew from tonight's work. Full current list: report/[id]/page.tsx 1006, check/page.tsx 511, HomeClient.tsx 447, FaqClient.tsx 404, lib/email.ts 305, admin/page.tsx 300, pricing/page.tsx 276, api/audit/route.ts 256, api/pagespeed-agent/route.ts 254. Lower risk than #26/#27 (pure code organization, no color/data-model entanglement, TypeScript+build catch structural mistakes immediately) but still deferred 2026-08-01 — Jim's call given the hour and the report page's real size.

#0046 — ❌ Below-the-fold images / homepage visual anchor, no Canva look (PC-A11) — start: 2026-07-16

#0047 — ❌ FAQ page mobile-responsive bug check (PC-A12) — start: 2026-07-16

#0048 — ❌ Expand FAQ content — waiting on Jim to paste Pingdom reference material (PC-A13) — start: 2026-07-16

#0049 — ❌ Honest 90s countdown/lock on "View Full Report" button (PC-B2) — start: 2026-07-16

#0050 — ❌ Content-heavy early warning heuristic (PC-B3) — start: 2026-07-16

#0051 — ❌ Fix/disconnect the failing 21st-dev/magic connector (Claude Code app setting, not app code) — start: 2026-07-16

#0052 — ❌ Adaptive countdown based on lazy-load/WebP signals, gated on real data (PC-FUTURE-1) — start: 2026-07-16

#0053 — ❌ Merge localSEOAEOPro into PingClose as one unified app (PC-STRAT1) — start: 2026-07-16 · decision made 2026-08-01: Jim, mid-session, explicit and unprompted: "we are no longer going to be using local SEO Pro we're going to be rolling all of those functions into pingclose." This is the "dedicated planning session" decision point the item was waiting on — direction is now decided, not just planning. What's done: #43 below (references removed from live pages). What's NOT done: the actual functional merge — LSAP-1 through LSAP-6 (LocalSEOAEOPro's own task list: $495 landing page, secure WordPress credential submission, fix tracking checklist, City Page SuperAgent, 20-city package, legacy Supabase key migration) describe real features that lived on LocalSEOAEOPro.com and have no PingClose equivalent yet. PingClose still has no in-house $495 checkout — the report/pricing page CTAs now say "$495" and route to a phone call, not a working purchase flow. Needs its own follow-up pass to actually port LSAP-1..6 functionality in, not just remove the old brand's name. Also folded in from #24: LSAP's "Page Speed Intelligence" module fabricated fake speed data via an LLM instead of calling Google's real API — when that functionality gets ported into PingClose, use PingClose's own real, already-built PageSpeed agent (lib/agents/pagespeedAgent) from day one. Don't carry the fake-data bug forward into the merged product.

#0054 — ❌ Phone-only submissions to /api/audit skip verification entirely and crash with a 500 (PC-SEC11) — start: 2026-07-19. Root cause confirmed 2026-07-19 by direct reproduction (not just reading code): `checkRateLimit(undefined)` → `isVIP(undefined)` → `undefined.toLowerCase()` throws, caught by the outer try/catch, returns a generic 500. Fix is isolated and safe to ship any time, but Jim decided to hold it until phone verification (#37) is built rather than patch piecemeal.

#0055 — ❌ Audit MFA status on AWS/Supabase/Vercel/GitHub/Resend accounts (PC-SEC15) — start: 2026-07-19 · checked 2026-08-01, still open. Confirmed no MCP tool exposes account-level MFA status for any of the 5 providers — Claude cannot verify this the way it ran the Supabase migrations tonight. Direct links given to Jim for a manual check on his phone: Supabase (supabase.com/dashboard/account/security), Vercel (vercel.com/account/security), GitHub (github.com/settings/security), AWS IAM console, Resend dashboard settings. Stays open until Jim reports back.

#0056 — ❌ LSAP's "Page Speed Intelligence" module fabricates fake speed data via an LLM instead of calling Google's real API — start: 2026-07-19 · superseded 2026-08-01. No PingClose access to LSAP's actual codebase (confirmed: projects/localseoaeopro/ in this repo only has TASKS.md/SUMMARY.md, no app code — it's a separate repository). Given LocalSEOAEOPro is being retired (#42/PC-STRAT1, decided 2026-08-01), fixing a bug in a codebase headed for retirement isn't the priority. The actual lesson is folded into #42's notes: when Page Speed Intelligence functionality gets ported into PingClose, use PingClose's own real PageSpeed agent from day one — don't carry the fake-data bug forward.

#0057 — ❌ Sign up for OpenPhone/Quo, submit 10DLC business registration — Jim's own action (PC-E2) — start: 2026-07-19. Scheduled for the morning of 2026-07-20, checked 2026-08-01: still not done. Still the real bottleneck for #37 (10DLC carrier registration isn't instant) and everything downstream of it (PC-E2, PC-E4, PC-E5, PC-FUTURE-2).

#0058 — ❌ Verify OpenPhone/Quo's actual webhook/API capabilities before building against it — start: 2026-07-19

#0059 — ❌ Add SMS consent microcopy to the phone field on the homepage form — start: 2026-07-19

#0060 — ❌ Build phone verification (OTP send + confirm) on OpenPhone/Quo's API, mirroring email verification (PC-E4) — start: 2026-07-19. Discussed moving this into the #10 slot tonight (2026-07-19) — decided against it: numbering stays locked per the rule above, and the real blocker is #25 (account signup + 10DLC approval, not yet done), not the list order.

#0061 — ❌ Build event-forwarding into the existing notification pipeline (PC-E5) — start: 2026-07-19

#0062 — ❌ AWS 10DLC origination request — abandoned in favor of OpenPhone/Quo, no further action needed (PC-E2, closed) — start: 2026-07-19

#0063 — ❌ Future, gated on real call volume — AI voice/text agent via Retell AI, no Twilio dependency confirmed (PC-FUTURE-2) — start: 2026-07-19

#0064 — ❌ Add CAPTCHA to admin login (PC-SEC13) **(Previously shown as complete — not actually finished: no CAPTCHA was ever built, title task never completed.)** — start: 2026-07-19 · resolved: 2026-08-01, not built. The specific gap this was proposed to close (rate limiter fails open if Supabase is down) was fixed directly by #14/PC-SEC9 instead — admin login now fails closed. Combined with PC-SEC14 (password + live TOTP), brute force is already impractical. Jim: no preference when asked; Claude's call was to skip adding Cloudflare Turnstile as a new dependency for marginal benefit rather than build it reflexively. Revisit if Jim wants defense-in-depth later (e.g. to stop scripted requests before they even reach the password/TOTP check).

#0065 — ❌ GBP Superagent: vendor account setup — Google Places API + billing, Veriphone, Lob (PC-GBP-1) — start: 2026-08-03. Jim's own action, cannot be done by Claude. Blocks #52, #53, #56, #57.

#0066 — ❌ GBP Superagent: draft pingclose_gbp_audits migration, get Jim's separate explicit yes, run it (PC-GBP-2) — start: 2026-08-03. SQL already drafted and explained column-by-column in the 2026-08-03 session.

#0067 — ❌ GBP Superagent: NAP extraction from existing HTML scrape (PC-GBP-3) — start: 2026-08-03. No dependencies, safe to build first. Must ship with hardened JSON.parse (try/catch, size cap, explicit field picks, no object spreading).

#0068 — ❌ GBP Superagent: discovery agent — find candidate GBP listing, never auto-picks below confidence threshold (PC-GBP-4) — start: 2026-08-03. Depends on #49, #51.

#0069 — ❌ GBP Superagent: profile data agent — Places Details, field-masked for cost control (PC-GBP-5) — start: 2026-08-03. Depends on #49, #52.

#0070 — ❌ GBP Superagent: category alignment agent — the critical GBP-vs-website mismatch check, most important finding in the feature (PC-GBP-6) — start: 2026-08-03. Depends on #53.

#0071 — ❌ GBP Superagent: website/GBP consistency agent — NAP + schema diff (PC-GBP-7) — start: 2026-08-03. Depends on #51, #53.

#0072 — ❌ GBP Superagent: phone compliance agent — Veriphone line-type lookup (PC-GBP-8) — start: 2026-08-03. Depends on #49, #53. Correctly-hedged copy only — Google does not ban mobile/VoIP numbers, only premium-rate ones.

#0073 — ❌ GBP Superagent: address compliance agent — Lob, PO-Box/CMRA hard-fail + residential informational-only (PC-GBP-9) — start: 2026-08-03. Depends on #49, #53.

#0074 — ❌ GBP Superagent: competitor gap agent, reuses existing DataForSEO local-pack logic, no new API call (PC-GBP-10) — start: 2026-08-03. Depends on #53.

#0075 — ❌ GBP Superagent: findings normalizer/scoring, critical-mismatch cap so it can't be buried (PC-GBP-11) — start: 2026-08-03. Depends on #54-58.

#0076 — ❌ GBP Superagent: orchestrator + GBP-specific spend cap that applies even to VIP (PC-GBP-12) — start: 2026-08-03. Depends on #51-59.

#0077 — ❌ GBP Superagent: API route + wire into /api/audit's existing after() block (PC-GBP-13) — start: 2026-08-03. Depends on #60.

#0078 — ❌ GBP Superagent: report page section, category-mismatch warning pinned above the score (PC-GBP-14) — start: 2026-08-03. Depends on #50, #59.

#0079 — ❌ GBP Superagent: security hardening rollup — re-check every item before shipping (PC-GBP-15) — start: 2026-08-03. Cuts across #51, #60.

#0080 — ❌ GBP Superagent: Level 2 owner-authorized deep scan — future, do NOT start yet (PC-GBP-16) — start: 2026-08-03. Deferred until #49-63 are live and Jim explicitly opens this gate.
Files: lib/agents/gbpAgent/ (new directory, see SECTION I below for full detail on every item above)

#0081 — ❌ citywidealarms.com — real findings surfaced by PingClose's own tool, follow-up not yet actioned (client lead, not a code task) — start: 2026-08-08. Confirmed live via PingClose's own audit against a real client site, all with actual evidence, not assumptions:
  - **Caching**: real response headers pulled directly, not guessed. Homepage HTML: `Cache-Control: public, max-age=3600` (fine). But a real static image (the logo) showed contradictory headers — `expires: 2027` next to `x-litespeed-cache-control: no-cache` and Cloudflare `cf-cache-status: BYPASS`. Explanation, not sabotage: LiteSpeed Cache is installed and active but actively told not to cache; the image's `last-modified` is ~August 2025, right around when the site's HTML shows it moved to Bricks Builder — textbook pattern of someone disabling caching during a rebuild and never re-enabling it afterward.
  - **Fonts**: the actual body-text fonts (Manrope, Poppins, both Google Fonts) are already configured correctly with `font-display: swap`. The real problem is two *icon* fonts loaded from local theme files: Font Awesome 6 Brands uses `font-display: block` (blocks rendering of the icon until the font loads, instead of showing a fallback), and Themify Icons has no `font-display` set at all (browser default, which can also block). Narrower and more specific than "a font-loading issue" — it's icon fonts, not text fonts.
  - **H1**: weak/generic, see #77 for the full breakdown and the new detection capability that came out of discussing it. Actual current H1: "See Why We Are The #1 Top Rated Local Home Security Company In St. Louis, MO." Rewrite directions drafted and refined with Jim in that session (not yet decided/sent to the client): Claude's first suggestion — "St. Louis' Trusted Home Security & Alarm Experts"; Jim's counter-direction — "Your Home and Business Security System and Camera Company" (flagged as missing location entirely); refined together into two candidates that keep Jim's wording and add location back — "Your Home and Business Security System and Camera Company — Serving St. Louis" or "St. Louis' Home and Business Security System and Camera Company." None of these are finalized — Jim's call on which (if any) to actually propose to the client.
  All three are real findings from signals that already exist in the tool (validates #69/`scoreH1Content` plus the existing `speed.noBrowserCaching`/`speed.hasFontDisplayIssue` checks) — nothing to build here for citywidealarms.com specifically, this is a sales/follow-up opportunity. Needs Jim's call: track as a lead here, or handle it outside TASKS.md entirely.

#0082 — ❌ Doppler-stored PageSpeed API key may need rotation (no tag yet) — start: 2026-08-08 (incident itself happened earlier in-session, exact original date unconfirmed). A `doppler secrets set PAGESPEED_API_KEY '${PAGESPEED_GOOGLE_API_PINGCLOSE}'` command echoed the real, resolved key value into visible chat/tool output. Flagged immediately, severity assessed as low (key is scoped to Google's PageSpeed Insights API only, not a broader Google Cloud credential) — but rotation was never confirmed done or explicitly declined by Jim. Stays open until Jim decides.

#0083 — ❌ Stray untracked file at repo root: lighthouse_unused_js_check.json — start: 2026-08-08 (file predates this session, likely leftover from the earlier Lighthouse/unused-JS homepage investigation). Not committed, not referenced by any code — confirmed via `git status`. Needs a decision: delete, keep and add to .gitignore, or keep and commit. Separately, `check_contrast.mjs` (also untracked, from an in-session request Jim asked not to be built) — Jim confirmed 2026-08-08 it's not important either way, no action needed.

#0084 — ❌ H1 soft-quality detection + suggested rewrite — discussed at length, never scoped or built (no tag yet) — start: 2026-08-08. PingClose's existing `scoreH1Content` (#69) only checks mechanical signals: word count, generic-placeholder patterns, location presence, keyword presence. Using citywidealarms.com's real H1 as a live example — "See Why We Are The #1 Top Rated Local Home Security Company In St. Louis, MO" — Claude showed it PASSES every existing check yet is still weak, exposing a real gap between "has the right ingredients" and "is actually good." Three real problems identified that the current check cannot catch: (1) empty/unverifiable superlative claims ("#1 Top Rated") with no third-party backing next to them, (2) self-congratulatory/clickbait filler before any real value statement ("See Why We Are..."), (3) keyword cannibalization — the H1 was already spending the exact high-value commercial phrase ("Home Security Systems St. Louis, MO") that should be reserved for a dedicated future city page instead of the homepage. A real recommended-length range was also given: roughly 40-70 characters / 6-12 words. Claude asked "want me to scope what that would actually take to build?" — Jim said yes, wanted it done same day — but the conversation moved on to the citywidealarms.com caching/font-display investigation (folded into #70) instead, and this was never scoped or built. Needs: (a) actual scoping of what "detect empty superlative" and "detect filler" would require (likely simple regex/keyword-list heuristics rather than an LLM call, to stay consistent with the rest of the audit engine's approach), (b) a decision on whether to also generate a suggested replacement H1 for the customer, not just flag problems.
Files: app/report/[id]/page.tsx (`scoreH1Content` — would extend this or add a sibling function)

#0085 — ❌ Sitemap agent false negative — doesn't check robots.txt-declared sitemap path (PC-FIX-1) — start: 2026-08-11. Confirmed real bug via citywideheatingair.com audit, not a client-specific fluke: the report says "✗ XML Sitemap" but the site has a valid sitemap at the non-default path `/sitemaps.xml`, correctly declared via `Sitemap:` in `robots.txt`. `lib/agents/sitemapAgent` only ever tries the standard `/sitemap.xml` location. Fix: read `robots.txt`'s `Sitemap:` directive as a fallback before concluding no sitemap exists. Independent of the edge-deploy blocker below — pure audit-accuracy fix, no client access needed, safe to build and ship on its own.
Files: lib/agents/sitemapAgent/fetchSitemap.ts

#0086 — ❌ FAQ/Pricing page-existence detection — new report category, separate from schema-presence (PC-FIX-2) — start: 2026-08-11. `seoFundamentals.ts` only checks FAQ/Pricing schema on the single audited page (usually the homepage), so a site with a real FAQ page and correct schema elsewhere would still get reported as missing it — conflates "no page exists" with "page exists but has no schema," which are different problems needing different fixes (content vs. markup). Fix: cross-reference `sitemapAgent`'s existing `faq`/`faqs`/`pricing` slug classification (already in `urlClassifier.ts`) to answer "does a FAQ/Pricing page exist at all" as its own Yes/No finding, then only check *that* page's schema if it exists. No new external API calls — both agents already run in the same `/api/audit` call. Verified as a real gap on citywideheatingair.com (zero FAQ/pricing content sitewide, confirmed via full 13-page sitemap crawl), not a one-off.
Files: lib/agents/htmlAgent/seoFundamentals.ts, lib/agents/htmlAgent/index.ts, lib/agents/htmlAgent/types.ts, app/report/[id]/page.tsx (Schema Opportunities section)

#0087 — ❌ Site-fix agent: script-defer-agent — defer/async render-blocking CSS/JS via edge proxy (PC-FIX-3) — start: 2026-08-11. Surfaced from citywideheatingair.com audit: 17 render-blocking scripts/stylesheets, ~10.9s wasted, confirmed as the actual root cause of its 9.2s LCP (TTFB is 4ms — the entire delay sits between server response and first paint, not the server itself). No WordPress admin access needed — runs as a reverse-proxy edge layer in front of the client's origin, extending the existing superAgent pipeline (`lib/agents/superAgent/`) rather than a new build. **Blocked on #41/PC-EDGE3**: `edge-deploy-agent` has zero implementation and the CDN/reverse-proxy mechanism for getting in front of a client's own domain is undecided — that decision has to be made before this can ship to any real client site.

#0088 — ❌ Site-fix agent: unused-asset-agent — strip/defer unused CSS/JS via edge proxy (PC-FIX-4) — start: 2026-08-11. Addresses the "107KB unused JS / 16KB unused CSS" report finding, same site. Same access model and same #41/PC-EDGE3 blocker as PC-FIX-3.

#0089 — ❌ Site-fix agent: image-optimize-agent — in-process compression via edge proxy, zero new external API calls (PC-FIX-5) — start: 2026-08-11. Uses Sharp locally rather than a third-party compression API, keeping the file within the 2-external-API-call limit. Same #41/PC-EDGE3 blocker.

#0090 — ❌ Site-fix agent: schema-injector-agent — constrained to real page content only, never fabricates schema (PC-FIX-6) — start: 2026-08-11. Must never generate FAQPage/Review/Pricing schema for content that doesn't exist on the page — that's false structured data to Google and risks a penalty, and directly contradicts PingClose's own "reveal findings, don't fabricate" rule. Where the underlying content doesn't exist (e.g., citywideheatingair.com has none), this agent's job is to output a content-gap flag for a human, not auto-generate placeholder schema. Depends on #0086 (need the page-existence signal first to know whether there's real content to mark up).

#0091 — ❌ Site-fix agent: tracking-tag-agent — install Facebook/TikTok pixel tags via edge proxy, human-gated (PC-FIX-7) — start: 2026-08-11. Cannot be autonomous end-to-end: the agent can wire a pixel tag once given a real Pixel ID, but obtaining that ID from the client is a business/sales step, not something to guess or fabricate. Same #41/PC-EDGE3 blocker for the delivery mechanism.

#0092 — ❌ New product idea: PingClose's own AI-qualifying lead-intake form (no tag yet) — start: 2026-08-11. Raised while diagnosing citywideheatingair.com's dead Gravity Forms lead-capture form (#0087-#0091; full findings in projects/pingclose/clients/citywideheatingair.com/NOTES.md). Jim's frustration is broader than that one broken form — generic lead forms let low-quality/time-wasting submissions through with zero filtering. Idea: PingClose builds and hosts its own intake form that pre-screens/qualifies submissions (real inquiry vs. spam/tire-kicker, service type, urgency, in-service-area) before they reach the business owner, offered as a PingClose product a client could use to replace their existing form. NOT YET SCOPED. Explicitly flagged as a bigger commitment than a bug fix or the existing audit/fix product line: this would mean PingClose hosts and processes real customer PII (name, phone, email, service request) for every client using it — a real compliance/liability step up from "we audit your site and fix bugs," and deserves a deliberate decision, not something to back into while fixing an unrelated captcha bug. Sequencing: fix citywideheatingair.com's existing dead form first (#0087-#0091, the actual emergency) — this is a separate, later, bigger product decision.
Needs: product scoping (what "qualifying" actually filters on and how), a decision on PII handling/storage/compliance posture, hosting model (per-client embed vs. subdomain), and Jim's explicit go-ahead before any build starts.

#0093 — ❌ citywideheatingair.com — dead lead-capture form, fix NOW, top priority (client site, not a code task) — start: 2026-08-11. Confirmed via live test submission (2026-08-11, Jim's explicit permission, test data clearly marked): clicking Submit on the `/coupons/` "Request Your Service Call" form fires zero network requests and zero console output — the Cloudflare Turnstile widget never initializes (no iframe, no interactive challenge ever renders), so the submit handler silently no-ops. Real visitors get no success message, no error, nothing — every lead through that form is currently lost with no one aware. Same page also has a "Test Coupon — not valid, just for testing purposes" placeholder live in production. Full detail in projects/pingclose/clients/citywideheatingair.com/NOTES.md.
**This does NOT wait on #0087-#0091 (the site-fix-agent build) or the #41/PC-EDGE3 edge-deploy blocker** — it's a direct WordPress admin fix (Gravity Forms → Turnstile integration: check sitekey/secret pairing and the site key's registered domain in the Cloudflare Turnstile dashboard, and find what's appending `?ver=` onto the Cloudflare script enqueue) plus removing the placeholder coupon content. Only blocker: Jim getting WordPress login credentials (site is owned by Jim/PingClose, confirmed 2026-08-11). Do this the moment credentials exist, don't wait for any agent build.

#0094 — ❌ Review and decide on the superAgent build's uncommitted changes — needs its own dedicated session (no tag yet) — start: 2026-08-11. 16 files have been sitting uncommitted since an earlier superAgent build session, deliberately left alone during today's #0085-#0093 work rather than bundled in: `.gitignore` + `package.json`/`package-lock.json` (adds `playwright`, `pixelmatch`, `pngjs` as new dependencies), the untracked `lib/agents/superAgent/` folder (the whole edge-caching remediation pipeline), plus `.claude/settings.json` and `check_contrast.mjs` (untracked, low-stakes, already noted as not-important in #0083). This is a bigger decision than a task-list edit — new dependencies, a whole new agent subsystem — and its own STATUS.md says it was left uncommitted "pending explicit go-ahead this session," a go-ahead that never came. Real open gaps already documented there, not just a rubber-stamp: `edge-deploy-agent` has zero implementation, no CDN/reverse-proxy mechanism has been decided, and the pipeline has never been tested against an actual WordPress site (relevant now that #0087-#0091 specifically target WordPress clients like citywideheatingair.com).
Needs: a dedicated session to walk the diff file-by-file, decide what's real/keep vs. needs rework, then commit or discard pieces — not a tail-end add-on to unrelated work.
Files: lib/agents/superAgent/ (whole subsystem), package.json, package-lock.json, .gitignore, .claude/settings.json, check_contrast.mjs

## SECTION A — FRONT PAGE

### PC-A1 — Homepage design overhaul
Status: OPEN
Description: Redesign homepage layout. Desktop: two columns — left has H1 + form + trust signals, right has CSS diagnostic art / sample score widget. Mobile: full width, stacked, wider padding. Every line of content needs more substance. Cleaner typography hierarchy. Emil Kowalski motion standard: counter animations on stats, scroll-triggered reveals, hover micro-transitions. Matches Linear/Vercel aesthetic.
Files: app/HomeClient.tsx, app/page.tsx

---

### PC-A2 — New H1 — keyword-driven, search-intent first
Status: DONE (2026-07-16) — "Ping Your Website to See How Many Clicks You Are Losing." Repositions around clicks instead of raw speed. City-aware version (PC-A6) still open.
Commit: bb844bb
Files: app/HomeClient.tsx

---

### PC-A3 — CSS diagnostic art / above-fold visual anchor
Status: OPEN
Description: Replace empty right column with CSS-only animated diagnostic widget. Shows a fake-but-realistic audit running: score ticking up, checks appearing one by one (Speed ✓, Schema ✓, Mobile ✓). No images, no heavy JS. Pure CSS animation. Communicates "this tool is alive and smart" instantly.
Files: app/HomeClient.tsx

---

### PC-A4 — Phone field label fix
Status: DONE (2026-07-16) — "Get a call back within minutes" removed entirely. Email field now says "Verify your email so we can send you your report."; phone field now says "Verify your cell phone to receive your report as a link."
Commit: bb844bb
Files: app/HomeClient.tsx

---

### PC-A5 — IP geolocation city detection
Status: OPEN
Description: Detect visitor's city silently on homepage load using ipapi.co (free up to 1,000/day). Powers dynamic H1 and city confirmation widget.
Files: app/HomeClient.tsx

---

### PC-A6 — Dynamic H1 with visitor's city
Status: OPEN
Description: "See Why St. Louis Competitors Are Getting More Clicks Than You." Falls back to PC-A2 national H1 if city unknown.
Files: app/HomeClient.tsx
Dependencies: PC-A5

---

### PC-A7 — City confirmation widget
Status: OPEN
Description: "Are you a local business in St. Louis, MO? Yes / Not my city." Confirmed city powers DataForSEO competitor search on the report.
Files: app/HomeClient.tsx
Dependencies: PC-A5

---

### PC-A8 — "Click monitor" byline
Status: DONE (2026-07-16) — "We are a click monitor. The faster you are, the more clicks you receive." added below the logo.
Commit: bb844bb
Files: app/HomeClient.tsx

---

### PC-A9 — Direct $495 price on pricing page
Status: DONE (2026-07-16) — Pricing page now shows "$495 to correct your speed — additional fixes available à la carte" directly, instead of only linking out to LocalSEOAEOPro pricing. Specific à la carte prices still pending from Jim.
Commit: bb844bb
Files: app/pricing/page.tsx

---

### PC-A10 — Mobile grid bug on pricing page
Status: DONE (2026-07-16) — Both card-grid layouts on the pricing page had no responsive breakpoint at all, squeezing two cards into ~150-220px columns on a phone. Fixed with a shared `.responsive-grid-2col` class in globals.css (stacks to 1 column below 768px), reusable by other pages.
Commit: bb844bb
Files: app/globals.css, app/pricing/page.tsx

---

### PC-A11 — Below-the-fold images
Status: OPEN
Description: Jim wants images below the fold to "spruce up" the homepage. Per the site's own design rules, images must explain a real finding (diagnostic visual, comparison, scorecard) — not just decorate. No Canva ("has that Canva look"). Jim will browse 21st.dev for a pattern/design to point at; still needs final direction on what the image(s) should actually show.
Files: app/HomeClient.tsx

---

### PC-A12 — FAQ page: possible mobile-responsive bug
Status: OPEN
Description: Jim reported the FAQ page showed no questions when checked on mobile. Verified thoroughly at desktop viewport (4 different methods — page text, full accessibility tree, network/console logs) and could not reproduce; but given PC-A10 found a real, confirmed mobile-only bug on a similarly-structured page (pricing), FaqClient.tsx (404 lines) likely has an analogous unfixed responsive issue. Needs an actual mobile-viewport check, not assumed fine.
Files: app/faq/FaqClient.tsx

---

### PC-A13 — Expand and improve FAQ content
Status: OPEN — WAITING
Description: Jim wants more FAQ questions, answered better, informed by what competitor tools (Pingdom mentioned) cover. Direct research against Pingdom's marketing site was blocked (403s / redirected to a signup page, no accessible FAQ content found). Jim will paste in specific Pingdom reference content himself rather than have Claude scrape it. Waiting on that before expanding.
Files: app/faq/FaqClient.tsx

---

## SECTION B — CHECK PAGE

### PC-B1 — Check page content and design review
Status: OPEN
Description: Review current check page. Add: list of what is being checked (74 signals), estimated time remaining, trust signals. Ensure no blinking or layout shift while results load.
Files: app/check/page.tsx

---

### PC-B2 — Honest 90s countdown/lock on "View Full Report" button
Status: OPEN — designed, not built
Description: The "View Your Full Report" link is currently always clickable, even mid-scan — landing early on a report page that (see PC-C11) shows permanent zeros. Fix: lock the button behind an honest 90-second countdown (the real worst-case, including a PageSpeed retry) labeled clearly ("Analyzing your site — up to 90 seconds"). Unlocks immediately the moment PageSpeed actually finishes ("Click Here — We Got Done Early →"), or unlocks at 0 as a fallback. Explicitly NOT a shorter/adaptive countdown — Jim asked to hold that idea until validated against real completion-time data (see CARRY-FORWARD).
Files: app/check/page.tsx
Dependencies: PC-C11 (the report page needs to handle "still pending" gracefully either way)

---

### PC-B3 — Content-heavy early warning (images/video/WebP/TTFB)
Status: OPEN — designed, not built
Description: From the fast HTML scan (before PageSpeed runs): count total images, non-WebP images (by file extension), self-hosted (non-embedded, non-iframe) videos. Combined with TTFB, show an early warning if the page looks heavy/uncompressed, before PageSpeed even starts. Explicitly a heuristic/proxy, not a guarantee — a page could have many small WebP images and not get flagged, or vice versa.
Files: lib/agents/htmlAgent.ts, app/check/page.tsx

---

## SECTION C — CUSTOMER REPORT PAGE

### PC-C1 — Plain English report labels
Status: OPEN
Description: Rewrite every metric label. Each box: plain name (big) + technical acronym (small, dimmed) + one sentence on what it means for their business. Fix thresholds: Requests goes red at 80 not 50. Fix hardcoded "49 problems" to show actual count. Merge duplicate Schema sections into one. Build AFTER new report content sections are added so labels describe real data.
Files: app/report/[id]/page.tsx

---

### PC-C2 — Social Presence Agent + findings on report
Status: OPEN
Description: New agent scrapes customer homepage for social/directory profiles. Flags every missing or unoptimized presence as a finding. Checks: Google Business Profile, Facebook Business, Instagram Business, LinkedIn Company Page, TikTok Business, YouTube Channel, Pinterest, Yelp, BBB, Angi, Thumbtack, Apple Maps, Bing Places, Facebook Pixel, GA4, Google Search Console, Google Tag Manager, LocalBusiness schema sameAs links. Every missing one = a finding = another reason to buy the $495 fix.
Files: lib/agents/socialPresenceAgent (new), app/report/[id]/page.tsx

---

### PC-C3 — Location extraction from customer website
Status: OPEN
Description: During audit, scrape customer homepage and footer for city, state, address, phone area code. Feeds into Jim alert email and DataForSEO competitor lookup.
Files: lib/agents/htmlAgent (extend)

---

### PC-C4 — Nearest major city calculation
Status: OPEN
Description: "Chesterfield, MO — 19 miles west of St. Louis." Gives Jim instant geographic context before he dials. Shows on admin report.
Files: lib/ (new utility)
Dependencies: PC-C3

---

### PC-C5 — DataForSEO click comparison on report
Status: OPEN
Description: Wire the built DataForSEO agent into the report. Show: customer's primary keyword, their rank, #1 competitor domain, competitor monthly clicks vs customer monthly clicks. Gut punch number front and center. Show clicks TODAY clearly — the "after fix" projection comes in PC-C6.
Files: app/report/[id]/page.tsx
Dependencies: PC-C1, PC-C3
Agent: lib/agents/dataforSEOAgent — BUILT AND TESTED ✅

---

### PC-C6 — Report value close section
Status: OPEN
Description: Below the click gap show: (1) Projected clicks after fix — "At rank #1 you would receive an estimated X clicks/month." (2) Agency comparison — "Agencies charge $1,500 and take 6 weeks. We fix it in 72 hours for $495 — with a checklist of every item completed." (3) Speed-to-opportunity bridge — "At PingClose we can make your site faster — and faster sites get more clicks. But once you see your full results, you'll be shocked at what happens when you attack the open opportunities your competitors don't even know exist." (4) $495 CTA button. Build AFTER PC-C5 so real click numbers are available.
Files: app/report/[id]/page.tsx
Dependencies: PC-C5

---

### PC-C7 — Talk to a Person button
Status: OPEN
Description: Prominent button on report page. Shows Jim's number (314) 517-2533. Clicking it sends Jim an instant alert email with full customer context. Build with other report page items.
Files: app/report/[id]/page.tsx
Dependencies: PC-C6

---

### PC-C8 — Free city page offer on report
Status: OPEN
Description: When report shows zero city pages AND customer has bought the $495 fix: "Your competitor has 14 city pages. You have 0. We built you a free one for [city]. Click to see it."
Files: app/report/[id]/page.tsx
Dependencies: LSAP-3

---

### PC-C9 — Full competitive intelligence (top 13)
Status: OPEN
Description: Expand DataForSEO to show full top 13 local SERP, click distribution for all positions, silent PingClose audit on #1 competitor showing their weaknesses, comparison card, path to #1 in 90 days.
Dependencies: PC-C5

---

### PC-C10 — AI chat agent on report
Status: OPEN
Description: Knows the visitor's exact report data and competitor comparison. Answers questions in plain English. Has a hand-off button to Jim.
Dependencies: PC-C7

---

### PC-C11 — Report page shows permanent zeros if visited before PageSpeed finishes
Status: DONE — 2026-08-01
Description: /report/[id]/page.tsx fetched its data exactly once on load, with no polling. If a visitor landed there before PageSpeed completed (confirmed possible — the "View Full Report" link had no lock, see PC-B2), they saw frozen placeholder/zero scores forever unless they manually refreshed. Fixed: added a polling useEffect (same 3s pattern /check already used) that re-fetches /api/report while pagespeed_status is 'pending', replaces the placeholder audit data the moment it resolves, and gives up gracefully at 90s (30 polls) instead of spinning forever. This fix was the foundation the same-day PC-B2 (button lock), PageSpeed-failure alert email, retry button, and PC-SEC16 (daily retry cap) were all built on top of.
Files: app/report/[id]/page.tsx

---

### PC-C12 — pagespeed_retry_count column + retry logging
Status: PARTIALLY DONE — logging shipped 2026-08-01, retry-once logic itself still untested
Description: Google's PageSpeed API occasionally returns a generic transient error unrelated to the site being tested (confirmed: same URL failed once then succeeded twice more within an hour). A retry-once fix shipped earlier in lib/agents/pagespeedAgent/fetchPageSpeed.ts. Jim: "skip 12, go to 13 and build that" — 2026-08-01, meaning skip testing the retry-once logic itself, but build real logging (not just an empty column). Built: fetchStrategyOnce/fetchStrategy in fetchPageSpeed.ts now return a `retried` flag per strategy (mobile/desktop); fetchPageSpeed() sums them into `retryCount` (0-2); threaded through PageSpeedAgentResponse in types.ts and runPageSpeedAgent() in index.ts; app/api/pagespeed-agent/route.ts writes it to pagespeed_retry_count on every audit (not cumulative — one run's actual retry count). Migration run live:
  ALTER TABLE pingclose_audits ADD COLUMN pagespeed_retry_count integer NOT NULL DEFAULT 0;
Run via Supabase MCP against project xvrhxtnhmnurvxitnijy, verified via information_schema query and a full-table check (132/132 rows backfilled to 0). Still open: the retry-once logic itself has never been verified against a real forced Google-side failure — only the logging around it was built this round.
Files: lib/agents/pagespeedAgent/fetchPageSpeed.ts, lib/agents/pagespeedAgent/types.ts, lib/agents/pagespeedAgent/index.ts, app/api/pagespeed-agent/route.ts

---

## SECTION D — ADMIN REPORT PAGE

### PC-D1 — Admin timing panel
Status: OPEN
Description: Show all agent durations on Jim's admin view of every report: PageSpeed ms, DataForSEO ms, HTML agent ms, total audit ms. Tells Jim if the system is living on the edge of failure.
Files: app/report/[id]/page.tsx (admin view)

---

### PC-D2 — Nearest major city on admin report
Status: OPEN
Description: Show "Chesterfield, MO — 19 miles west of St. Louis" on Jim's copy so he has geographic context before dialing.
Dependencies: PC-C4

---

### PC-D3 — Remove PS API box from customer view
Status: OPEN
Description: The PageSpeed API status box is visible to customers. Move it to admin-only view.
Files: app/report/[id]/page.tsx

---

## SECTION E — ALERTS & NOTIFICATIONS

### PC-E1 — Jim alert email on FAIL audit ✅ DONE
Status: DONE
Files: lib/reportDelivery.ts, lib/email.ts
Commit: ad8b484

---

### PC-E2 — AWS SMS text to customer with report link
Status: OPEN — WAITING, discrepancy found
Description: Send customer a text with link to their report immediately after audit completes. Note on file said "awaiting AWS SMS Sandbox exit approval, submitted 2026-07-12, 24-48h turnaround" — but the live AWS account was checked directly on 2026-07-19 (console: SNS > Text messaging (SMS), and AWS End User Messaging > Phone numbers / Registrations) and shows: still in SMS Sandbox, 0 verified sandbox numbers, 0 phone numbers, 0 registrations. That 2026-07-12 submission does not appear to have gone through, or was lost/never saved. This task is now folded into the bigger PC-E4/PC-STRAT2 phone system decision rather than standing alone.
Dependencies: PC-E1

---

### PC-E4 — Mandatory dual verification (email AND phone)
Status: OPEN — decided 2026-07-19, not built. Re-confirmed still not built 2026-08-02: verified directly against current app/api/audit/route.ts — it only requires url + at least one of email/phone (not both), and only email is ever checked against a verified row; no phone_verifications table, no phone-verify route, no phone-related file anywhere in the repo (full-repo search, zero matches). A phone-only submission today gets a report with zero verification of anything.
Description: Jim's decision: both email and phone must be required fields and both must be actually verified (real code sent and confirmed) before an audit runs — "Required for security," and also for lead-quality/follow-up purposes ("know who is looking at someone's website"). Today only email is genuinely verified (send-code/verify-code); phone is just an unverified text field. Needs: a phone_verifications table (or equivalent) mirroring email_verifications, new send/verify routes using whichever SMS provider is chosen (see PC-STRAT2), rate limiting on those new routes, and a frontend change making phone a required field with its own code-entry step. Twilio is permanently excluded as a provider (Jim's standing rule, all projects). Migration SQL needs Jim's explicit sign-off per the project's migration rule before running.
**Microcopy decided 2026-08-02** (for the form, once both fields are required): "Both are required — we verify each one so your report goes to the right person, and only you." Leads with the actual reason (verification/right-person, not delivery redundancy) per Jim's preference after comparing two options.
Files: app/api/audit/route.ts, app/HomeClient.tsx, app/check/page.tsx, new send-phone-code/verify-phone-code routes, new migration
Dependencies: PC-STRAT2 (blocked on #25 — Jim's OpenPhone/Quo signup + 10DLC registration, still not done as of last check)

---

### PC-E5 — Event-forwarding from phone system into existing notification pipeline
Status: OPEN — not started
Description: Whichever provider is chosen (PC-STRAT2), incoming calls/texts/voicemail should be piped into PingClose's existing notification pipeline — a Resend email alert to Jim and/or a log entry in the admin panel — mirroring the audit-complete email Jim already relies on ("I love how I get a special email telling me someone took the pingclose test"). Needs the provider's webhook/API confirmed first (PC-STRAT2 sub-item).
Dependencies: PC-STRAT2

---

### PC-E3 — Google Contacts auto-create on FAIL audit
Status: OPEN
Description: Auto-create a Google Contact with: name, phone, domain, score, report link in Notes. Dedup by phone number. Skip Jim's own email.
Dependencies: PC-E1

---

## SECTION F — SECURITY (found + fixed 2026-07-16)

### PC-SEC1 — Admin routes brute-force bypass
Status: DONE — Four admin routes (/api/admin/login, /api/setup, /api/setup/test, /api/admin/audits) each checked the same password independently, but only the login route enforced the 5-attempts/15-min rate limiter. Consolidated into one shared verifyAdminAuth() helper so all four are protected.
Commit: 7779613
Files: lib/adminRateLimiter.ts, app/api/admin/login/route.ts, app/api/admin/audits/route.ts, app/api/setup/route.ts, app/api/setup/test/route.ts

---

### PC-SEC2 — Timing-safe password comparison
Status: DONE — Replaced `===` with crypto.timingSafeEqual as part of PC-SEC1's shared helper.
Commit: 7779613
Files: lib/adminRateLimiter.ts

---

### PC-SEC3 — Leftover POC endpoints removed
Status: DONE — /api/poc/agent and /api/poc/dispatcher were unauthenticated dev scaffolding for testing Next.js's after() mechanism, left live in production. Allowed anyone to insert/overwrite rows in pingclose_audits with no auth. Confirmed nothing else referenced them (grep) before deleting; confirmed gone via build route list (24 routes → 22).
Commit: 7779613
Files: app/api/poc/agent/route.ts (deleted), app/api/poc/dispatcher/route.ts (deleted)

---

### PC-SEC4 — SSRF gap in audit tool
Status: DONE — /api/audit and /api/audit/fast fetch a user-submitted URL server-side with no check that it doesn't resolve to a private/loopback/link-local/cloud-metadata address. Added lib/ssrfGuard.ts; tested live both directions (127.0.0.1 / localhost / 169.254.169.254 correctly rejected 422; a real public site still works).
Commit: 7779613
Files: lib/ssrfGuard.ts (new), app/api/audit/route.ts, app/api/audit/fast/route.ts

---

### PC-SEC5 — No rate limiting on /api/audit/fast
Status: DONE — Added IP-based limit (10/day), reusing ip_address already logged by /api/audit rather than a new table. Tested live: normal use still works, and the actual 429 trip was confirmed with synthetic test data (inserted + cleaned up).
Commit: 7779613
Files: lib/rateLimiter.ts, app/api/audit/fast/route.ts

---

### PC-SEC6 — Email verification never enforced server-side
Status: DONE — /api/audit trusted whatever email was in the request body; the 6-digit code UI was purely cosmetic since nothing server-side checked it. Now requires a verified row in email_verifications (VIP list exempted — see PC-TASK-003 note above). Tested live: unverified email blocked (403), VIP bypass still works, a real verified email still works.
Commit: cdf4a82
Files: app/api/audit/route.ts

---

### PC-SEC7 — /api/dataforseo-keywords public + unauthenticated
Status: DONE — 2026-08-01
Description: Route had no auth and no rate limit; every call costs money against the DataForSEO API. Confirmed via grep before fixing: no file in app/ or lib/ calls this route — PC-C5 (the report-page feature meant to use it) is still unbuilt, so this was purely exposed surface with zero legitimate traffic. Jim's decision: internal shared secret, since this is meant to be called server-to-server, never by a visitor's browser directly. Built: INTERNAL_API_SECRET env var (64-char random hex, generated via node crypto), checked against an x-internal-secret request header using the same timingSafeCompare already built for admin auth (exported from lib/adminRateLimiter.ts instead of duplicating it). Explicit fail-closed if the env var is ever unset — guards against an empty-string bypass. Live-tested against a real dev server: missing secret → 401, wrong secret → 401, correct secret → passes through to the route's normal validation (400 for missing domain/keyword params). Also backfilled ADMIN_TOTP_SECRET into .env.local.example, which was missing despite being a required env var.
Operational note: the Vercel production env var has NOT been set yet — not urgent, since nothing calls this route in production either. Needs to be added before PC-C5 ever wires this route into a live customer flow.
Files: app/api/dataforseo-keywords/route.ts, lib/adminRateLimiter.ts, .env.local, .env.local.example

---

### PC-SEC8 — Resend key returned in plaintext from /api/setup
Status: DONE — 2026-08-01
Description: /api/setup GET returned the raw Resend API key value once authenticated as admin. Low severity (admin-only), but decided to mask rather than leave it. Found during implementation: the frontend (app/setup/page.tsx) pre-filled its editable "key" input with the GET response and re-POSTed it unchanged on an unmodified "Save" click — naively masking the GET value would have let that flow silently overwrite the real key with masked placeholder text (which still starts with re_, so it would have passed the POST route's format check). Fixed both sides together: GET masks any platform_config value whose key matches /key|secret|password|token/i (first 6 + last 4 chars, not just resend_api_key — forward-compatible with future config entries); frontend input no longer pre-fills, starts empty with "Enter a new key to replace it," masked current value shown as separate read-only text, and re-fetches after a successful save so the display stays accurate. /api/setup/test unaffected — it already reads the key straight from the DB, never from the client. Live-tested against a real dev server with real admin credentials (masked value confirmed correct against the actual stored key; no-auth and wrong-password both still 401), not just build-checked.
Files: app/api/setup/route.ts, app/setup/page.tsx

---

### PC-SEC9 — Rate limiter fails open if Supabase is unreachable
Status: DONE — 2026-08-01
Description: If Supabase was down/misconfigured, the rate-limit checks used to fail open — allow the request through rather than blocking it. Confirmed this exact behavior firing in a local dev environment with placeholder credentials. Resolved per-route, not as one blanket rule, because the three limiters have different practical stakes:
  - checkAdminLoginRateLimit (lib/adminRateLimiter.ts) → fail-closed. Supabase being unreachable now locks Jim out of /admin too — an accepted tradeoff, since letting brute-force attempts go uncounted during an outage was judged worse.
  - checkRateLimit, email-based (lib/rateLimiter.ts, gates /api/audit) → fail-closed. Low practical cost since /api/audit needs Supabase anyway to save the row. app/api/audit/route.ts now distinguishes the two failure reasons: real limit hit still shows "You've run 5 free audits today," a Supabase error shows an honest "something went wrong" message instead of falsely claiming the daily limit was hit.
  - checkIpRateLimit (lib/rateLimiter.ts, gates /api/audit/fast) → deliberately stays fail-open. This route has no other Supabase dependency at all (pure HTML/hosting/availability scan) — fail-closed here would mean an unrelated Supabase outage takes down a feature that doesn't need Supabase to do its actual work. Jim confirmed this split explicitly rather than applying one rule everywhere.
Files: lib/adminRateLimiter.ts, lib/rateLimiter.ts, app/api/audit/route.ts

---

### PC-SEC11 — Phone-only submissions bypass verification and crash
Status: OPEN — real bug, root cause confirmed 2026-07-19 by direct reproduction
Description: /api/audit requires "at least one of email or phone" (line 22), but the email-verification check only runs `if (email && !isVIP(email))` — skipped entirely if only phone is provided. Immediately after, `checkRateLimit(email)` calls `isVIP(email)` which does `email.toLowerCase()` on a possibly-undefined value, throwing. The outer try/catch swallows it and returns a generic 500 "Audit failed." Confirmed by actually reproducing the exact TypeError (`Cannot read properties of undefined (reading 'toLowerCase')`), not just reading the code. Net effect today: phone-only submissions don't work at all (not a live exploit), but it's broken and needs a real fix — likely moot once PC-E4 (mandatory dual verification) ships, since email would become required either way. Fix is isolated and safe to ship any time; Jim decided to hold it until phone verification (#37/PC-E4) is built rather than patch piecemeal.
Files: app/api/audit/route.ts, lib/rateLimiter.ts

---

### PC-SEC12 — No rate limit on /api/send-code
Status: DONE — 2026-08-01, bundled with an SSRF fix found in the same file
Description: Unlike /api/audit and /api/audit/fast, the verification-code sender had no IP or email rate limit. Someone could repeatedly trigger code emails to the same or many addresses — costs Resend sends and could look like harassment to a real inbox. Fixed: checkEmailCodeRateLimit (3/email/hour) and checkIpCodeRateLimit (15/IP/day) added to lib/rateLimiter.ts, both checked before any network fetch, both fail-closed on a Supabase error (same PC-SEC9 reasoning — this route can't send a code without writing to email_verifications anyway).
Also found during this pass, not on the original list: this route fetched the customer-submitted URL server-side with NO SSRF guard at all — unlike /api/audit and /api/audit/fast, which both call assertPublicHostname(). A blind-SSRF hole (reachability of internal/private/cloud-metadata addresses leaked back via the response). Fixed by adding the same assertPublicHostname() guard, called before the fetch and unconditionally (not gated behind the rate limit, so it protects even a request that hasn't hit its rate cap yet).
Migration: `ALTER TABLE email_verifications ADD COLUMN ip_address text;` — didn't exist before (email_verifications had no IP column, unlike pingclose_audits). Run live via Supabase MCP against xvrhxtnhmnurvxitnijy, verified via information_schema query.
Files: app/api/send-code/route.ts, lib/rateLimiter.ts

---

### PC-SEC13 — Add CAPTCHA to admin login
Status: RESOLVED WITHOUT BUILDING — 2026-08-01
Description: Originally proposed because, if Supabase was down, the DB-based rate limiter on admin login failed open (the password check itself still worked, env-var based, not Supabase-dependent, but failed-attempt counting stopped). A CAPTCHA (Cloudflare Turnstile) would have blocked scripted brute-force attempts independent of Supabase's uptime. That exact gap was closed directly by #14/PC-SEC9 instead (admin login rate limiter now fails closed), and combined with PC-SEC14 (password + live TOTP required), brute force is already impractical without a CAPTCHA. Asked Jim whether to still build it as defense-in-depth; no preference given. Decided to skip adding a new external dependency (Cloudflare Turnstile — new env var, frontend widget, external call on every login) for marginal benefit on an already well-protected endpoint, per the project's own "don't change things just because they're possible" philosophy. Can revisit if Jim later wants to stop scripted requests before they even reach the password/TOTP check.
Files: none — no code changed

---

### PC-SEC14 — Admin login has no MFA, no session, no per-user identity
Status: OPEN — real gap, confirmed 2026-07-19
Description: Verified by reading app/admin/page.tsx and lib/adminRateLimiter.ts directly. Admin auth is a single shared password (ADMIN_PASSWORD env var) sent as an `x-admin-password` header on every request — not stored in localStorage (kept in React state only, so at least it's not persisted in plaintext on disk), but there is no second factor, no session/token system, and no concept of separate admin users. Anyone with the one password has full access, and if Jim ever brings on staff, there'd be no way to distinguish who took which action. Needs a decision on scope: add a second factor (TOTP/authenticator app) to the existing single-password model, or move to real per-user accounts with individual credentials.
Files: app/admin/page.tsx, lib/adminRateLimiter.ts, app/api/admin/login/route.ts

---

### PC-SEC15 — Audit MFA on actual cloud provider accounts
Status: OPEN — requires manual check, cannot be automated
Description: Separate from PingClose's own admin login (PC-SEC14), this is about whether Jim's actual AWS, Supabase, Vercel, GitHub, and Resend accounts themselves have MFA enabled. Particularly relevant for Supabase given the service_role key leak this session (PC-SEC10) — key rotation alone doesn't close the risk if the Supabase account login itself has no second factor. This is an account-settings check, not a code change — needs to be walked through in each provider's dashboard.
Checked 2026-08-01: searched available MCP tools for anything exposing account-level MFA/2FA status on any of the 5 providers (Supabase, Vercel, GitHub, AWS, Resend) — none exists. Unlike the Supabase schema migrations run directly tonight, this cannot be checked or fixed from this session; it requires Jim to log into each dashboard himself. Direct links provided:
  - Supabase: supabase.com/dashboard/account/security
  - Vercel: vercel.com/account/security
  - GitHub: github.com/settings/security
  - AWS: IAM console → user → Security credentials → Assigned MFA device (also worth checking whether root account credentials are in use anywhere, since root MFA matters even more than an IAM user's)
  - Resend: Dashboard → Settings → Account/Security
Stays open until Jim reports back on what he finds.
Files: none (account settings, not code)

---

### PC-SEC16 — Hard cap on the PageSpeed retry action
Status: DONE — code and migration both live 2026-08-01
Description: The PC-C11/PC-B2 work (report page polling, check-page button lock, PageSpeed-failure alert email) added a "Retry Speed Check" button on /report/[id] for when pagespeed_status is timeout/error. It POSTs directly to /api/pagespeed-agent, which has no auth — a pre-existing gap (the route was always callable by anyone who knew a reportId) that's now more exposed since it's a documented, expected client action instead of an obscure one. Each click costs 2 real Google PageSpeed API calls. Full fix built 2026-08-01, Jim's spec: 5 total manual retries or 3 distinct websites retried per identity (email, IP fallback for phone-only leads) in a rolling 24h window, whichever hits first; Jim (VIP emails) exempt entirely; a retry that times out again doesn't consume quota, only one that resolves (ok/error) does. Layered under the same-day 30s cooldown + in-flight guard (pagespeed_started_at/pagespeed_completed_at).
Migration: `ALTER TABLE pingclose_audits ADD COLUMN manual_retry_count integer NOT NULL DEFAULT 0;` — run live against project xvrhxtnhmnurvxitnijy via the Supabase MCP connector after Jim asked Claude to run it directly (Jim was on his phone, remote). Column verified present afterward via a direct information_schema query (integer, NOT NULL, default 0), not just assumed from the apply_migration success response. Note for next session: code SELECTs manual_retry_count on every /api/pagespeed-agent call including the original automatic run, so this column is now a hard dependency of the whole PageSpeed pipeline, not just the retry feature.
Files: app/api/pagespeed-agent/route.ts, app/report/[id]/page.tsx

---

### PC-SEC10 — Leaked service_role key rotation
Status: OPEN — further along, not fully closed
Description: The Supabase service_role key was accidentally pasted into a public online notepad site while troubleshooting local dev credentials. Progress: new dedicated secret key ("pingclose", sb_secret_...) created in Supabase, wired into local .env.local, Vercel's Production SUPABASE_SERVICE_ROLE_KEY updated via CLI, production redeployed, and confirmed live via a real end-to-end test — the live site now runs entirely on the new key.
Remaining blocker: the OLD leaked key is still technically valid and hasn't been revoked. Investigated disabling it via Supabase's "Disable JWT-based API keys" (Settings → API Keys → Legacy tab) — but that action disables the legacy `anon` and `service_role` keys TOGETHER (they're JWTs signed by the same underlying secret, so one can't be revoked without the other). Confirmed via grep that `localseoaeopro` — a separate app sharing this same Supabase project — has a real, live browser-facing Supabase client (lib/supabase/client.ts, createBrowserClient) actively using the legacy NEXT_PUBLIC_SUPABASE_ANON_KEY. Disabling the legacy pair now would break that other live site. Fully closing this requires localseoaeopro to first migrate its browser client to the new publishable-key system (same migration pingclose already did) — a change to a different project, needs its own decision, not something to do unilaterally from pingclose.
Files: (Supabase dashboard + Vercel dashboard, not code; localseoaeopro/lib/supabase/client.ts if that migration is undertaken)

---

## SECTION G — CODE QUALITY (found 2026-07-16, not started)

### PC-CQ1 — No centralized design tokens
Status: MOSTLY DONE — React/UI portion completed 2026-08-08 (see #26 for full detail), email templates still open
Description: No shared CSS variables/Tailwind theme despite Tailwind being a dependency. Every file reinvented its own button/input styles inline. Built 2026-08-08, triggered by a real readability complaint (light grey text, small fonts on the report page) rather than the earlier deferred cosmetic concern: `lib/designTokens.ts` (9 colors + 4 font sizes, Jim-approved) now the single source of truth, migrated into all 10 React/UI files. Verified: tsc clean, build clean. NOT yet committed — awaiting Jim's approval. Still open, exactly as originally scoped: lib/email.ts plus 2 API routes are HTML email templates in string literals, not React components — CSS custom properties don't have reliable cross-email-client support, so a correct fix needs the same color values expressed as plain JS constants for those, not var(--token) the way the React pages used.
Files: 10 React/UI files done (see #26); lib/email.ts + 2 API routes still open

---

### PC-CQ2 — Emoji used as functional icons
Status: OPEN — deferred 2026-08-01, real scope measured
Description: Emoji characters (📱🖥️⚡🔴🟠🟡✓❌🏆 etc.) used as the icon system instead of the radar/arc motif established in the brand doc. Directly contradicts the brand's own "no decoration unearned by function" rule. Re-measured 2026-08-01 (old 79 estimate was stale): ~161 functional-icon emoji across 11 files. Bigger than a display swap: lib/auditScorer.ts (43 occurrences) and lib/agents/hostingAgent.ts (8) bake emoji directly into scored issue text that's saved into pingclose_audits.top_issues/top_fixes — 132 existing rows already have it baked in. A real fix changes the scoring pipeline to emit a structured severity field instead of an emoji-prefixed string, touching historical stored data, not just presentation. Also needs an icon system chosen first (new dependency vs. custom SVGs matching the brand's radar/arc motif) before replacement work is buildable. Deferred — no visual-verification capability this session, plus not yet shovel-ready pending the icon-system decision.
Files: app-wide (11 files, 2 of them scoring logic not UI — see above)

---

### PC-CQ3 — Files exceeding the project's own 200-line rule
Status: OPEN — deferred 2026-08-01, real scope measured
Description: Re-measured 2026-08-01 — 9 files now exceed CLAUDE.md's 200-line rule, not the original 6. app/report/[id]/page.tsx has grown to 1006 lines (wasn't even on the original list — was under 200 on 2026-07-16) via organic report-section growth plus tonight's polling/retry additions. Two more crossed the line from tonight's work specifically: app/api/audit/route.ts (256) and app/api/pagespeed-agent/route.ts (254). Full current list: report/[id]/page.tsx 1006, check/page.tsx 511, HomeClient.tsx 447, FaqClient.tsx 404, lib/email.ts 305, admin/page.tsx 300, pricing/page.tsx 276, api/audit/route.ts 256, api/pagespeed-agent/route.ts 254. Assessed as lower-risk than PC-CQ1/CQ2 (pure code organization, no color/data-model entanglement, TypeScript+build catch structural mistakes immediately) but still deferred — Jim's call given the hour.
Files: see above

---

## SECTION H — STRATEGIC DECISIONS (not started, needs its own planning session)

### PC-STRAT1 — Merge localSEOAEOPro into PingClose
Status: DECISION MADE 2026-08-01 — direction is decided, functional merge still open
Description: Jim's idea (2026-07-16): roll localSEOAEOPro into PingClose as one unified app instead of two separate products. Timing argument in favor: neither site is indexed by Google yet, so there's no SEO/domain equity at risk by merging now vs. later. Originally gated behind "do not start implementing without a dedicated planning session" — CLAUDE.md's positioning rules would need to change first.
2026-08-01: Jim gave the decision directly, mid-session, unprompted — "we are no longer going to be using local SEO Pro we're going to be rolling all of those functions into pingclose." Checked CLAUDE.md's actual live content at that point: the "Critical Positioning" section already read single-brand ("It's all PingClose... LocalSEOAEOPro is being folded in, not a separate brand") — it had apparently already been updated at some point without TASKS.md tracking it (see #44). This file's own header (top of file) still said the old two-brand "Finds problems. Never fixes them." line — fixed same session.
Done same session: #43 (all LocalSEOAEOPro references/links removed from pricing, report, FAQ pages) and #44 (confirmed CLAUDE.md already matched).
Still open, not attempted: the actual functional merge. localseoaeopro is a meaningfully bigger, more complex app (real user auth, admin systems, its own skills/middleware) than pingclose's current lead-gen funnel — porting LSAP-1 through LSAP-6 (WordPress credential submission, fix tracking, City Page SuperAgent, etc.) into PingClose is a real build-out, not done tonight. PingClose's pricing/report pages now say "$495" and route to a phone call — there is still no in-house checkout or fix-delivery mechanism.

---

### PC-STRAT2 — Phone/SMS/voice provider decision
Status: OPEN — big open decision, "a lot to talk about" per Jim (2026-07-19)
Description: Two paths under discussion for PingClose's phone-verification + two-way SMS + (eventually) voice calling needs:
  1. **AWS** (SNS/End User Messaging for SMS, Amazon Connect for voice) — raw infrastructure, full control, but voice requires a separate, meaningfully bigger AWS service (Connect) with real setup work; no polished app for Jim to use day-to-day.
  2. **OpenPhone / Quo** (rebranded from OpenPhone) — an out-of-box business phone app (calls, texts, voicemail transcription) Jim can use directly on his phone, with an API/webhooks to pipe events into PingClose. Pricing confirmed 2026-07-19: Starter $15/user/mo, Business $23/user/mo, Scale $35/user/mo (all billed annually; ~20-30% more monthly). Still requires the same 10DLC/TCR business registration as AWS ($19.50 one-time + $1.50-3/mo campaign fee) — does NOT skip the carrier approval wait.
  Not yet done: confirming OpenPhone/Quo's actual webhook/API capabilities (only pricing has been verified so far, not integration depth). Twilio and toll-free numbers are both permanently excluded (Jim's standing rules). Jim wants two-way SMS (visitors can reply) — one-way was ruled insufficient.
Dependencies: none — blocks PC-E4, PC-E5, PC-FUTURE-2

---

### PC-FUTURE-2 — Voice calling setup
Status: OPEN — explicitly deferred, future task
Description: Actual voice calling (people calling the business number and it ringing/routing somewhere) is out of scope for the current phone-verification work. If AWS is chosen, this means standing up Amazon Connect (a separate, bigger product). If OpenPhone/Quo is chosen, voice may already be included in the app. Real design questions deferred: does a call ring Jim's cell, go to voicemail, need an auto-attendant/IVR? Do not start until PC-STRAT2 is decided and Jim is ready to spec this out.
Dependencies: PC-STRAT2

---

## SECTION I — GBP SUPERAGENT (Google Business Profile) — planned 2026-08-03, not started

Context: a bad Google Business Profile undercuts an otherwise-good website — Jim wants a combined GBP + website audit built as a superagent living inside PingClose (not a separate product), per `GBPAgent_PingClose_Master_Build_Prompt_2026-08-03.md`. Scope is Stage 1 only (Level 1 public scan, no OAuth) — Level 2 (owner-authorized deep scan, performance metrics, review management) is explicitly deferred, see PC-GBP-16. Every task below is tagged **PC-GBP** so this thread can be picked back up from any session, in order.

Vendor decisions made 2026-08-03 (real pricing checked, not guessed):
  - GBP discovery/profile data → Google Places API (Jim's choice over reusing the existing DataForSEO account)
  - Phone line-type check → Veriphone (1,000 lookups/month free tier)
  - Address compliance check (PO Box/CMRA + residential/commercial) → Lob (300 US verifications/month free tier; confirmed via their docs to return both `cmra` and `rdi` fields in one call — beat Smarty, which needed a $50/mo minimum for the same coverage)
  - Twilio is not and will never be under consideration (Jim's standing rule, all projects)

Important correction baked into the design: Google's own documented Business Profile policy does **not** ban mobile/VoIP phone numbers — it bans premium-rate numbers and prefers (not requires) a local line over a central call-center number. PC-GBP-8 must reflect that: "this appears to be a mobile line" is diagnostic context, not a violation claim.

---

### PC-GBP-1 — Vendor account setup (Jim's own action)
Status: OPEN — blocks PC-GBP-4, 5, 8, 9
Description: Claude cannot create accounts or enter payment details. Jim needs to: (1) create a Google Cloud project, enable the Places API, set up billing, generate an API key restricted to server IP + Places API only; (2) create a Veriphone account, grab the API key; (3) create a Lob account, grab the API key, and confirm in their live dashboard/sandbox that a real US verification response actually includes `cmra` and `rdi` on the free tier (not gated to a paid plan). Keys go in `.env.local` as `GOOGLE_PLACES_API_KEY`, `VERIPHONE_API_KEY`, `LOB_API_KEY`.
Files: .env.local, .env.local.example

---

### PC-GBP-2 — Migration: pingclose_gbp_audits table
Status: OPEN — SQL drafted and explained column-by-column in-session 2026-08-03; needs Jim's separate explicit written yes before it runs, per the project's migration rule (not bundled into approving the design itself)
Description: New table keyed by `audit_id` referencing `pingclose_audits(id)`, rather than widening the existing 50+-column table further. Holds discovery result, profile snapshot, compliance verdicts, findings, and cost/provenance tracking. Reproduce the exact SQL from the 2026-08-03 session when ready to run — don't re-draft from scratch.
Files: new migration (no migrations folder exists yet — run once via Supabase MCP, same pattern as every other migration in this file)

---

### PC-GBP-3 — NAP extraction from existing HTML scrape
Status: OPEN — no dependencies, safe to build first
Description: `htmlAgent.ts` already fetches the page and sets `hasLocalBusinessSchema` as a boolean only — it never parses the actual JSON-LD fields. New file parses `<script type="application/ld+json">` blocks already present in the HTML htmlAgent already fetched (no new network call) for name/telephone/address/url, falling back to footer-text regex scanning when no schema exists. Labels the result `schema` / `footer-text` / `none` per the build prompt's "label every field" rule.
Security requirement (found in the 2026-08-03 design review, must be built in from the start, not bolted on after): every `JSON.parse` call wrapped in try/catch matching the existing `AGENT_FAIL:` pattern; input size capped before parsing; only known string fields picked by explicit property access — never spread the parsed object onto anything (prototype-pollution risk from untrusted third-party HTML).
Files: lib/agents/gbpAgent/extractNap.ts (new), lib/agents/gbpAgent/types.ts (new)

---

### PC-GBP-4 — Discovery agent (find the candidate GBP listing)
Status: OPEN — depends on PC-GBP-1 (Places key), PC-GBP-3 (NAP input)
Description: Google Places Find Place, scored by name/domain/address match. Never auto-selects below the confidence threshold — returns `needsConfirmation: true` and the candidate list instead of guessing, per the build prompt's explicit requirement.
Files: lib/agents/gbpAgent/discover.ts (new)

---

### PC-GBP-5 — Profile data agent
Status: OPEN — depends on PC-GBP-1, PC-GBP-4
Description: Google Places Details, field-masked to only what's needed (name, address, phone, types, hours, status, rating, review count, Maps URL) to control cost. Every field labeled public/unavailable.
Files: lib/agents/gbpAgent/profileData.ts (new)

---

### PC-GBP-6 — Category alignment agent (the "CategoryKiller" check)
Status: OPEN — depends on PC-GBP-5, reuses techResult (title/H1/meta/schema) already computed by htmlAgent
Description: Compares GBP primary/additional category against what the website actually emphasizes. Produces one of 8 outcome codes from the build prompt (CATEGORY_ALIGNED, PRIMARY_CATEGORY_MISMATCH, etc.) with severity. This is the single most important finding in the whole feature — a confirmed mismatch must be pinned above the aggregate score in the UI (see PC-GBP-14), never buried.
Files: lib/agents/gbpAgent/categoryAlignment.ts (new)

---

### PC-GBP-7 — Website/GBP consistency agent
Status: OPEN — depends on PC-GBP-3, PC-GBP-5
Description: NAP + schema consistency between GBP and the website. Distinguishes harmless formatting differences from real contradictions. Explicitly does NOT flag a missing public address as a defect for a legitimate service-area business.
Files: lib/agents/gbpAgent/consistency.ts (new)

---

### PC-GBP-8 — Phone compliance agent
Status: OPEN — depends on PC-GBP-1 (Veriphone key), PC-GBP-5 (GBP phone number)
Description: Veriphone line-type lookup (mobile/landline/VoIP/toll-free/premium). Premium-rate = hard fail per Google's actual documented policy. Everything else reported as diagnostic context with correctly hedged language — see the correction note at the top of this section. Do not ship copy claiming Google bans mobile/cell numbers; it doesn't.
Files: lib/agents/gbpAgent/phoneCompliance.ts (new)

---

### PC-GBP-9 — Address compliance agent
Status: OPEN — depends on PC-GBP-1 (Lob key + free-tier field confirmation), PC-GBP-5 (GBP address)
Description: Lob verification, reads `cmra` (PO Box/mailbox rental → hard fail, Google explicitly disallows) and `rdi` (residential → informational only, never an accusation; owner-staffed home addresses are allowed and PingClose has no way to verify staffing publicly).
Files: lib/agents/gbpAgent/addressCompliance.ts (new)

---

### PC-GBP-10 — Competitor gap agent
Status: OPEN — depends on PC-GBP-5
Description: Reuses the existing DataForSEO local-pack logic (lib/agents/dataforSEOAgent/localSerp.ts, already built for PC-C5/C9) — no new external call. Keyword/location inputs derived from techResult.primaryKeyword and the city/state parsed from the GBP profile's own address, so no new intake-form fields are needed.
Files: lib/agents/gbpAgent/competitorGap.ts (new)

---

### PC-GBP-11 — Findings normalizer / scoring
Status: OPEN — depends on PC-GBP-6 through PC-GBP-10
Description: Normalizes every check into a flat GbpFinding[] array (same spirit as the existing lib/auditScorer.ts issue list). Applies the critical-mismatch cap so a category mismatch can't be hidden under a good aggregate score. Dedupes overlapping findings; category-alignment findings take precedence.
Files: lib/agents/gbpAgent/scoreAndReport.ts (new)

---

### PC-GBP-12 — Orchestrator + GBP-specific spend cap
Status: OPEN — depends on all of the above
Description: Sequences discovery → profile → checks → scoring. Never throws on partial failure (matches every existing agent's AGENT_FAIL: catch-and-return-default pattern).
Security requirement (found in the 2026-08-03 design review, must ship with this file, not after): a GBP-specific daily call/dollar cap, enforced fail-closed, that applies **even to VIP emails** — unlike lib/rateLimiter.ts's isVIP() bypass, which is fine for the existing free-tier PageSpeed audits but would allow unbounded spend across 4 paid GBP APIs per audit if inherited as-is.
Files: lib/agents/gbpAgent/orchestrator.ts (new)

---

### PC-GBP-13 — API route + wiring into /api/audit
Status: OPEN — depends on PC-GBP-12
Description: New app/api/gbp-agent/route.ts, same shape as the existing pagespeed-agent route. Wired into app/api/audit/route.ts's existing after() block (~5 line addition), same pattern already used for pagespeed-agent.
Files: app/api/gbp-agent/route.ts (new), app/api/audit/route.ts

---

### PC-GBP-14 — Report page section
Status: OPEN — depends on PC-GBP-2, PC-GBP-11
Description: New app/report/[id]/GbpSection.tsx (kept as its own file rather than growing the already-1006-line report page further, see PC-CQ3). Shows: profile found/confirm-needed banner, category-mismatch warning pinned above the score, phone/address compliance rows, competitor gap, evidence expanders. Data fetched server-side the same way the rest of the report page already reads pingclose_audits — never via a client-side Supabase call, to match the new table's service-role-only RLS policy.
Files: app/report/[id]/GbpSection.tsx (new), app/report/[id]/page.tsx

---

### PC-GBP-15 — Security hardening checklist (rollup, don't lose these)
Status: OPEN — tracked here so these don't get dropped once individual files are built
Description: Findings from the 2026-08-03 design-stage security review, each owned by a task above but listed together as a re-check before this ships:
  - GBP-specific spend cap applies even to VIP (PC-GBP-12)
  - JSON-LD parsing hardened: try/catch, size cap, explicit field picks, no object spreading (PC-GBP-3)
  - All 3 new API keys run through lib/cleanSecret.ts on read, same as existing keys
  - Google Places calls never log the full request URL (key is a `?key=` query param) — path only
  - All 3 new vendor calls are server-side only, never reachable from the browser
  - pingclose_gbp_audits RLS policy matches pingclose_audits (service-role only), and the report page reads it server-side, never via client-side anon key
Files: cuts across PC-GBP-3, PC-GBP-12, plus lib/cleanSecret.ts usage in the new agent files

---

### PC-GBP-16 — Level 2: owner-authorized deep scan (future, not Stage 1)
Status: OPEN — explicitly deferred, separate future approval gate
Description: OAuth-based connected scan — performance metrics, search-keyword impressions, authorized review-management data. Do not start until Stage 1 (PC-GBP-1 through PC-GBP-15) is live and Jim explicitly wants to open this gate. Needs its own OAuth consent/disconnect/token-revocation flow and encrypted refresh-token storage before any of it is safe to build.
Dependencies: PC-GBP-1 through PC-GBP-15

---

## CARRY-FORWARD OPEN ITEMS

- **SELF-HEALING** — All agents must be self-healing. DataForSEO: DONE ✅. PageSpeed: retry-once logic shipped 2026-07-16 (see PC-C12), coded but not tested. Still needed: HTML, Hosting, Preflight, Resend.
- **OPEN-1** — PageSpeed API auto-retry on 429/error. Superseded by PC-C12 (2026-07-16) — retry-once shipped for generic transient errors specifically; 429/quota errors are deliberately NOT retried (would just fail again immediately). Target <0.1% audit failure rate still not measured.
- **OPEN-3** — Daily synthetic-user monitor. Site was broken for a week and nobody knew.
- **OPEN-4** — passes_one_second DB backfill. All rows before 2026-07-09 have wrong values.
- **PC-TASK-003** — Remove VIP_EMAILS hardcoded list from send-code/route.ts. NOTE (2026-07-16): this same list is now also reused via `isVIP()` in lib/rateLimiter.ts for the email-verification enforcement fix (PC-SEC6) — removing it needs to account for both call sites, not just send-code.
- **PC-FUTURE-1** — Adaptive countdown on the report-wait screen: if the fast scan shows lazy-loading + all-WebP images, show a shorter estimate than the honest 90s default (PC-B2). Explicitly NOT to be built until validated against real completion-time data across hundreds of real audits — Jim: a wrong early prediction risks losing a real customer. Do not implement without that data and without Jim's explicit go-ahead.
- **PC-CONNECTOR-1** — Not a pingclose bug: the "Could not connect to MCP server @21st-dev/magic" banner is a global Claude Code app-level connector setting, not configured anywhere in this project. Fix lives in Jim's Claude Code app settings, not this codebase.

---

## COMPLETED

| Task | Description | Commit | Date |
|------|-------------|--------|------|
| PC-C001 | Fix check page blinking | 5b49c0a | 2026-07-03 |
| PC-C002 | Fix pagespeed-agent Vercel 90s timeout | b61e313, e825fdd | 2026-07-03 |
| PC-C003 | Add 90s hard stop to PageSpeed polling | ed18a07 | 2026-07-03 |
| PC-C004 | Redesign report page — Linear/Vercel aesthetic | 35459df | 2026-07-03 |
| PC-C005 | Create Master Brain system | — | 2026-07-04 |
| PC-C006 | Fix RESEND_API_KEY BOM — lib/cleanSecret.ts | 3851b1f | 2026-07-07 |
| PC-C007 | Fix broken builds — commit preflightCheck.ts | 5f97274 | 2026-07-07 |
| PC-C008 | Fix emails showing fake 0/100 scores | 29faf32–31576b4 | 2026-07-08 |
| PC-C009 | Fix speed thresholds — SUPERSTAR/PASS/FAIL | 034784b–eb8d824 | 2026-07-09 |
| PC-C010 | Sync local repo with GitHub | — | 2026-07-12 |
| PC-C011 | DataForSEO agent — keywords + local SERP + self-healing retry | — | 2026-07-12 |
| PC-C012 | Phone number field on signup form | 2ad395b | 2026-07-12 |
| PC-C013 | Jim alert email with clickable phone | ad8b484 | 2026-07-12 |
| PC-SEC1–5 | Admin auth rate-limit bypass, SSRF gap, POC route removal, /api/audit/fast rate limit | 7779613 | 2026-07-16 |
| PC-SEC6 | Email verification enforced server-side in /api/audit | cdf4a82 | 2026-07-16 |
| PC-A2, A4, A8–A10 | New H1, phone/email field copy, click-monitor byline, $495 pricing, mobile pricing-grid fix | bb844bb | 2026-07-16 |
