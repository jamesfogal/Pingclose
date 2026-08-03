# PINGCLOSE.COM — TASK BRAIN
One platform — finds problems and fixes them (decided 2026-08-01, see #42/PC-STRAT1; LocalSEOAEOPro is being folded in, not a separate brand).
Never mention PingClose's internal methodology — reveal findings, hide how the analysis works.

Last Updated: 2026-08-03
Status: LIVE — first $495 sale confirmed 2026-07-11

---

## QUICK STATUS — read this first

**Simple rules (locked in 2026-07-19, not changing again):** one flat list, #1 to #64, top to bottom. Every item keeps its number forever — nothing moves, nothing gets reordered, nothing gets reshuffled when something new comes in or something completes. ❌ = critical, marked in place wherever it sits. 🟩 = done, checked in place. Every item shows a **start date** (when found) and, once closed, a **completed date**. Work top to bottom.

**Status as of 2026-08-02, ~5:45 PM CDT:** #1-9, #11, #13-17, #19-23, #43-48 are 🟩 done. #10 intentionally paused (holding for #37). #12 (untested retry logic) and #18 (manual MFA check, waiting on Jim) still open. #24 superseded, #42 partially decided. #25/#26/#27/#28 and #29-41 remain open — #26/#27/#28 explicitly deferred by Jim 2026-08-01, not stalled. **New this update:** #48 (PageSpeed dual-attempt racing) shipped and live-verified. A "see both results" migration was proposed to Jim (4 new nullable columns on pingclose_audits) but is NOT yet approved or built — see PC-C13 notes. Phone verification (#37/PC-E4) re-confirmed still fully unbuilt, blocked on #25. **2026-08-03: GBPAgent superagent (Google Business Profile + website combined audit) designed and added to the main list as #49-64 (tags PC-GBP-1 through PC-GBP-16, full detail in SECTION I). Nothing built yet — #49 (vendor accounts) and #50 (migration approval) are the first blockers, work top to bottom from there same as the rest of the list.**

---

1. 🟩❌ Admin routes brute-force bypass (PC-SEC1) — start: 2026-07-16 · completed: 2026-07-16, 2:40 PM CDT (commit 7779613)
2. 🟩❌ Timing-safe password comparison (PC-SEC2) — start: 2026-07-16 · completed: 2026-07-16, 2:40 PM CDT (commit 7779613)
3. 🟩❌ Leftover POC endpoints removed (PC-SEC3) — start: 2026-07-16 · completed: 2026-07-16, 2:40 PM CDT (commit 7779613)
4. 🟩❌ SSRF gap closed (PC-SEC4) — start: 2026-07-16 · completed: 2026-07-16, 2:40 PM CDT (commit 7779613)
5. 🟩❌ Rate limiting on /api/audit/fast (PC-SEC5) — start: 2026-07-16 · completed: 2026-07-16, 2:40 PM CDT (commit 7779613)
6. 🟩❌ Email verification enforced server-side (PC-SEC6) — start: 2026-07-16 · completed: 2026-07-16, 4:18 PM CDT (commit cdf4a82)
7. 🟩 Homepage copy repositioned, verify-email/phone microcopy, $495 pricing, mobile pricing-grid fix (PC-A2, A4, A8-A10) — start: 2026-07-16 · completed: 2026-07-16, 5:39 PM CDT (commit bb844bb)
8. 🟩❌ Leaked Supabase service_role key fully closed (PC-SEC10) — start: 2026-07-16 · completed: 2026-07-19, ~7:35 PM CDT. localseoaeopro migrated off legacy anon/service_role keys to PingClose's existing new key values (commits `69f8cfa`, `1c9c4d4`), verified live, then the legacy JWT secret was disabled in Supabase. Re-verified live after rotation — no breakage. The key that leaked into a public online notepad no longer authenticates.
9. ❌🟩 Admin login now requires password + TOTP authenticator code (PC-SEC14) — start: 2026-07-19 · completed: 2026-07-19. Built `lib/totp.ts` (RFC 6238, no new dependency, verified against the official RFC test vector — matched exactly). `verifyAdminAuth()` now requires both password and a live 6-digit code, same stateless resend pattern as the password. All 4 admin-gated routes (login, audits GET/PATCH, setup GET/POST, setup/test) updated consistently. Real bug found and fixed during testing: local `.env.local` had `ADMIN_PASSWORD=""` (empty) — not a bug in this feature, pre-existing local-dev gap. Diagnosed with temporary logging (removed before commit), confirmed via real log output, fixed with Jim's actual password. End-to-end verified live: real password + real code from Jim's authenticator app → 200 on login, 200 on the follow-up audits fetch. TypeScript clean, build clean, all files re-read fresh for the security audit — no secrets, no debug code left behind. Per-user identity/sessions explicitly not built (still just one admin) — this closes the "password-only" danger, not full multi-admin infrastructure. **Deployed:** pushed to `origin/main` as commit `94459ae`, Vercel deployment triggered (was INITIALIZING when last checked — not yet re-confirmed READY).
10. ❌🥫 Phone-only submissions to /api/audit skip verification entirely and crash with a 500 (PC-SEC11) — start: 2026-07-19. Root cause confirmed 2026-07-19 by direct reproduction (not just reading code): `checkRateLimit(undefined)` → `isVIP(undefined)` → `undefined.toLowerCase()` throws, caught by the outer try/catch, returns a generic 500. Fix is isolated and safe to ship any time, but Jim decided to hold it until phone verification (#37) is built rather than patch piecemeal.
11. ❌🟩 Report page shows permanent zeros if clicked before PageSpeed finishes — hits every customer (PC-C11) — start: 2026-07-16 · completed: 2026-08-01. Report page now polls /api/report every 3s if it lands pending, same pattern /check already used, 90s graceful give-up. Everything else built 2026-08-01 (PC-B2 button lock, PageSpeed-failure alert, retry button, PC-SEC16 daily retry cap) was built on top of this fix.
12. ❌🥫 PageSpeed retry fix coded but not tested — affects report reliability (PC-C12) — start: 2026-07-16
13. ❌🟩 Migration for the retry fix above (PC-C12) — start: 2026-07-16 · completed: 2026-08-01. Jim said "skip 12, build 13" — retry logging (not just the column) built: fetchPageSpeed.ts now flags which strategy (mobile/desktop) actually needed its retry, threaded up through runPageSpeedAgent() and written to pagespeed_retry_count on every audit. Migration run live via Supabase MCP, verified via schema query — column present, all 132 existing rows backfilled to 0. #12 (testing the retry-once logic itself) still not done — explicitly skipped this round.
14. ❌🟩 Fail-open/closed decision built (PC-SEC9) — start: 2026-07-16 · completed: 2026-08-01. Admin login rate limiter now fails closed (locks /admin during a Supabase outage — accepted tradeoff). Email-based /api/audit limiter now fails closed too, with an honest "something went wrong" message instead of falsely claiming the 5/day limit was hit. IP-based /api/audit/fast limiter deliberately stays fail-open — that route has no other Supabase dependency, so failing closed would take down a Supabase-independent feature during an unrelated outage; Jim confirmed this split 2026-08-01.
15. ❌🟩 /api/send-code had no rate limit, spammable (PC-SEC12) — start: 2026-07-19 · completed: 2026-08-01. Also found and fixed in the same pass: this route had NO SSRF guard at all (unlike /api/audit and /api/audit/fast) — it fetched the customer-submitted URL server-side with zero check against private/loopback/link-local/cloud-metadata addresses, a real blind-SSRF hole. Fixed: assertPublicHostname() added (same guard, reused). Rate limiting added: 3 codes/email/hour, 15 codes/IP/day, both fail-closed on a Supabase error, checked before the network fetch. Needed one migration (ip_address column on email_verifications, didn't exist before) — run live via Supabase MCP, verified.
16. ❌🟩 /api/dataforseo-keywords was public + unauthenticated, costs money per call (PC-SEC7) — start: 2026-07-16 · completed: 2026-08-01. Confirmed via grep: nothing in the live app calls this route yet (PC-C5 hasn't wired it in) — it was dead-but-reachable, exposed to anyone who found the URL. Gated behind a new internal shared secret (x-internal-secret header vs INTERNAL_API_SECRET env var, timing-safe compare, reused from lib/adminRateLimiter.ts). Live-tested: no secret → 401, wrong secret → 401, correct secret → passes through to normal validation. Vercel production env var not yet set (not urgent — nothing calls this route live yet); value is in local .env.local for Jim to add to Vercel when convenient.
17. ❌🟩 Add CAPTCHA to admin login (PC-SEC13) — start: 2026-07-19 · resolved: 2026-08-01, not built. The specific gap this was proposed to close (rate limiter fails open if Supabase is down) was fixed directly by #14/PC-SEC9 instead — admin login now fails closed. Combined with PC-SEC14 (password + live TOTP), brute force is already impractical. Jim: no preference when asked; Claude's call was to skip adding Cloudflare Turnstile as a new dependency for marginal benefit rather than build it reflexively. Revisit if Jim wants defense-in-depth later (e.g. to stop scripted requests before they even reach the password/TOTP check).
18. ❌⬜ Audit MFA status on AWS/Supabase/Vercel/GitHub/Resend accounts (PC-SEC15) — start: 2026-07-19 · checked 2026-08-01, still open. Confirmed no MCP tool exposes account-level MFA status for any of the 5 providers — Claude cannot verify this the way it ran the Supabase migrations tonight. Direct links given to Jim for a manual check on his phone: Supabase (supabase.com/dashboard/account/security), Vercel (vercel.com/account/security), GitHub (github.com/settings/security), AWS IAM console, Resend dashboard settings. Stays open until Jim reports back.
19. ❌🟩 Resend key masked in /api/setup (PC-SEC8) — start: 2026-07-16 · completed: 2026-08-01. GET now returns re_XXX••••••••YYYY instead of the raw key (any platform_config key matching /key|secret|password|token/i gets masked, not just resend_api_key — forward-compatible). Frontend (app/setup/page.tsx) no longer pre-fills the editable input with the fetched value — that would have let an unmodified "Save" silently overwrite the real key with the masked placeholder text, since the masked string still starts with re_ and would pass the format check. Input now starts empty ("Enter a new key to replace it"), masked value shown separately as read-only. Live-tested against the real dev server with real admin credentials: masked value confirmed correct against the actual stored key, no-auth and wrong-password both still 401. Self-flagged: used the real ADMIN_PASSWORD directly in a Bash test command rather than sourcing it from .env.local — now sits in this session's transcript (not committed, not pushed, but worth knowing).
20. ❌🟩 New CLAUDE.md security-audit rule — start: 2026-07-19 · completed: 2026-07-19 (pingclose commit `bd01cb1`)
21. ❌🟩 Supabase security advisor ERROR — `public.v_pagespeed_daily` view used SECURITY DEFINER, bypassed RLS (PC-SEC17) — start: 2026-07-19 · completed: 2026-08-01. Investigated before fixing: view is a daily aggregate over pingclose_audits (run counts, failure rate %, duration percentiles) — no PII, but real business-volume/reliability data. Confirmed via grep no app code queries this view and there's no browser Supabase client anywhere in the codebase — pure manual/dashboard use, zero functional dependency. Confirmed via information_schema: anon role had SELECT on the view; via pg_policies: the underlying table's only RLS policy is "service_role only," which SECURITY DEFINER was silently bypassing — meaning anyone with the public anon key could query aggregate PingClose operational data with zero auth. Fixed: `ALTER VIEW ... SET (security_invoker = true)` + `REVOKE ALL ... FROM anon, authenticated`, run live via Supabase MCP. Verified 3 ways: grants query shows only service_role/postgres remain, reloptions confirms security_invoker=true, and a fresh advisor scan shows the ERROR is gone entirely.
22. ❌🟩 Supabase security advisor WARN — `handle_new_user()` callable by anyone with elevated privileges (PC-SEC18) — start: 2026-07-19 · completed: 2026-08-01. Verified before fixing, not assumed: read the function body (standard Supabase "create profile row on signup" trigger, inserting into public.profiles — actually LocalSEOAEOPro's signup flow, not PingClose's, same shared Supabase project), confirmed it's actively wired as the on_auth_user_created trigger on auth.users, confirmed via grep no PingClose code calls it directly. Fixed: REVOKE EXECUTE FROM anon, authenticated — but caught via a re-check of the advisor (not just trusting the "success" response) that this was incomplete, since Postgres grants EXECUTE to PUBLIC by default and anon/authenticated inherit through it regardless of a named-role revoke. Ran a second REVOKE EXECUTE FROM PUBLIC to actually close it. Verified via information_schema.role_routine_grants (only service_role/postgres remain) and a fresh advisor scan (both SECURITY DEFINER execute-grant WARNs gone). Trigger firing is independent of EXECUTE grants (Postgres invokes trigger functions via the trigger mechanism, not the firing session's EXECUTE privilege) — did not live-test by creating a real signup row, since that would write real data into a production auth table shared with LocalSEOAEOPro just to confirm well-established Postgres behavior.
23. ❌🟩 Supabase security advisor WARN — two functions had mutable search_path (PC-SEC19) — start: 2026-07-19 · completed: 2026-08-01. Verified both function bodies before fixing: handle_new_user() already fully qualifies its one table reference (public.profiles); update_skill_executions_updated_at() only calls the built-in now(), always resolves via pg_catalog regardless of search_path — zero behavior-change risk either way. Fixed: `ALTER FUNCTION ... SET search_path = ''` on both, run live via Supabase MCP. Verified via pg_proc.proconfig (both show search_path="") and a fresh advisor scan confirming both function_search_path_mutable WARNs are gone.
24. ❌🥫 LSAP's "Page Speed Intelligence" module fabricates fake speed data via an LLM instead of calling Google's real API — start: 2026-07-19 · superseded 2026-08-01. No PingClose access to LSAP's actual codebase (confirmed: projects/localseoaeopro/ in this repo only has TASKS.md/SUMMARY.md, no app code — it's a separate repository). Given LocalSEOAEOPro is being retired (#42/PC-STRAT1, decided 2026-08-01), fixing a bug in a codebase headed for retirement isn't the priority. The actual lesson is folded into #42's notes: when Page Speed Intelligence functionality gets ported into PingClose, use PingClose's own real PageSpeed agent from day one — don't carry the fake-data bug forward.
25. ⬜ Sign up for OpenPhone/Quo, submit 10DLC business registration — Jim's own action (PC-E2) — start: 2026-07-19. Scheduled for the morning of 2026-07-20, checked 2026-08-01: still not done. Still the real bottleneck for #37 (10DLC carrier registration isn't instant) and everything downstream of it (PC-E2, PC-E4, PC-E5, PC-FUTURE-2).
26. ⬜ Centralized design token system — fixes hardcoded hex colors (PC-CQ1) — start: 2026-07-16 · re-measured 2026-08-01: the "116+" figure was stale. Real count: 680 hex literal occurrences, 34 distinct colors, across 11 files (app/report/[id]/page.tsx alone has 230; also HomeClient.tsx, admin/page.tsx, lib/email.ts, check/page.tsx, setup/page.tsx, pricing/page.tsx, FaqClient.tsx, globals.css, 2 API routes). Design note for whoever builds this: lib/email.ts and 2 API routes are HTML email templates in template literals, not React — CSS custom properties aren't reliably supported across email clients, so they need the same color values as plain JS constants substituted into the string, not var(--token) the way the React pages could use. One shared source of truth, two different consumption patterns. Deferred 2026-08-01 — Jim's call, given the real scope (680 mechanical replacements) and that Claude has no way to visually verify the rendered result in this session (no screenshot/browser-preview tool available). Purely cosmetic, zero urgency, real regression risk if done blind.
27. ⬜ Replace emoji-as-icons with a real icon system (PC-CQ2) — start: 2026-07-16 · re-measured 2026-08-01: the "79" figure was stale. Real count: ~161 emoji used as functional icons (excluding decorative arrows like →) across 11 files. Bigger complication than #26: lib/auditScorer.ts (43) and lib/agents/hostingAgent.ts (8) aren't UI code — they bake emoji directly into scored issue text (e.g. "🔴 Render-blocking scripts detected") that gets saved into pingclose_audits.top_issues/top_fixes, 132 existing rows already have this baked in. A real fix means the scoring pipeline emits a structured severity field instead of an emoji-prefixed string — touches historical stored data, not just display code. Also needs an actual icon system chosen first (new dependency, or custom SVGs matching the brand's radar/arc motif) before any replacement work is even buildable. Deferred 2026-08-01 — Jim's call, same reasoning as #26 (no visual-verification capability this session) plus this one isn't shovel-ready yet.
28. ⬜ Split files exceeding the project's own 200-line rule (PC-CQ3) — start: 2026-07-16 · re-measured 2026-08-01: now 9 files, not 6. app/report/[id]/page.tsx has grown to 1006 lines (5x the limit, wasn't even flagged in the original 2026-07-16 audit — was under 200 then). Two new files also now over: app/api/audit/route.ts (256) and app/api/pagespeed-agent/route.ts (254), both grew from tonight's work. Full current list: report/[id]/page.tsx 1006, check/page.tsx 511, HomeClient.tsx 447, FaqClient.tsx 404, lib/email.ts 305, admin/page.tsx 300, pricing/page.tsx 276, api/audit/route.ts 256, api/pagespeed-agent/route.ts 254. Lower risk than #26/#27 (pure code organization, no color/data-model entanglement, TypeScript+build catch structural mistakes immediately) but still deferred 2026-08-01 — Jim's call given the hour and the report page's real size.
29. ⬜ Below-the-fold images / homepage visual anchor, no Canva look (PC-A11) — start: 2026-07-16
30. ⬜ FAQ page mobile-responsive bug check (PC-A12) — start: 2026-07-16
31. ⬜ Expand FAQ content — waiting on Jim to paste Pingdom reference material (PC-A13) — start: 2026-07-16
32. ⬜ Honest 90s countdown/lock on "View Full Report" button (PC-B2) — start: 2026-07-16
33. ⬜ Content-heavy early warning heuristic (PC-B3) — start: 2026-07-16
34. ⬜ Fix/disconnect the failing 21st-dev/magic connector (Claude Code app setting, not app code) — start: 2026-07-16
35. ⬜ Verify OpenPhone/Quo's actual webhook/API capabilities before building against it — start: 2026-07-19
36. ⬜ Add SMS consent microcopy to the phone field on the homepage form — start: 2026-07-19
37. ⬜ Build phone verification (OTP send + confirm) on OpenPhone/Quo's API, mirroring email verification (PC-E4) — start: 2026-07-19. Discussed moving this into the #10 slot tonight (2026-07-19) — decided against it: numbering stays locked per the rule above, and the real blocker is #25 (account signup + 10DLC approval, not yet done), not the list order.
38. ⬜ Build event-forwarding into the existing notification pipeline (PC-E5) — start: 2026-07-19
39. ⬜ AWS 10DLC origination request — abandoned in favor of OpenPhone/Quo, no further action needed (PC-E2, closed) — start: 2026-07-19
40. ⬜ Future, gated on real call volume — AI voice/text agent via Retell AI, no Twilio dependency confirmed (PC-FUTURE-2) — start: 2026-07-19
41. ⬜ Adaptive countdown based on lazy-load/WebP signals, gated on real data (PC-FUTURE-1) — start: 2026-07-16
42. ❌🥫 Merge localSEOAEOPro into PingClose as one unified app (PC-STRAT1) — start: 2026-07-16 · decision made 2026-08-01: Jim, mid-session, explicit and unprompted: "we are no longer going to be using local SEO Pro we're going to be rolling all of those functions into pingclose." This is the "dedicated planning session" decision point the item was waiting on — direction is now decided, not just planning. What's done: #43 below (references removed from live pages). What's NOT done: the actual functional merge — LSAP-1 through LSAP-6 (LocalSEOAEOPro's own task list: $495 landing page, secure WordPress credential submission, fix tracking checklist, City Page SuperAgent, 20-city package, legacy Supabase key migration) describe real features that lived on LocalSEOAEOPro.com and have no PingClose equivalent yet. PingClose still has no in-house $495 checkout — the report/pricing page CTAs now say "$495" and route to a phone call, not a working purchase flow. Needs its own follow-up pass to actually port LSAP-1..6 functionality in, not just remove the old brand's name. Also folded in from #24: LSAP's "Page Speed Intelligence" module fabricated fake speed data via an LLM instead of calling Google's real API — when that functionality gets ported into PingClose, use PingClose's own real, already-built PageSpeed agent (lib/agents/pagespeedAgent) from day one. Don't carry the fake-data bug forward into the merged product.
43. ❌🟩 Remove all "forward to LocalSEOAEOPro" links/copy from PingClose's pricing, report, and FAQ pages, point to PingClose's own pricing instead (PC-STRAT1, sub-task) — start: 2026-07-19 · completed: 2026-08-01. Confirmed via grep: 3 files touched (app/pricing/page.tsx, app/report/[id]/page.tsx, app/faq/FaqClient.tsx) — metadata/JSON-LD, hero and section subheads, the "LocalSEOAEOPro — Full Fix" pricing card (relabeled "PingClose — Full Fix"), and every href pointing at localseoaeopro.com. Per Jim's decisions: kept a $495 CTA styled as a purchase button (not "talk to us" framing) even though no real checkout exists yet — routes to tel:+13145172533; pricing page simplified with the minimum correct swap rather than a full redesign pass (flagged under #42 above as needing one later). Report page's big CTA now points to /pricing (internal) instead of an external domain, avoiding redundancy with the Call/Email buttons already sitting directly below it. Post-edit grep confirms zero LocalSEOAEOPro references remain anywhere in app/. TypeScript and build both clean.
44. ❌🟩 Update CLAUDE.md's "Project Purpose" and "Primary Conversion Goal" sections to match single-brand direction (PC-STRAT1, sub-task) — start: 2026-07-19 · found already done 2026-08-01. Checked the live file directly: CLAUDE.md's "Critical Positioning (Never Violate)" section already reads "It's all PingClose. One platform — finds problems and fixes them. LocalSEOAEOPro is being folded in, not a separate brand to refer visitors to." — this was already single-brand, just never marked done here. The actual app code (pricing/report/FAQ pages) hadn't caught up to what CLAUDE.md already said until #43 above.
45. 🟩 Decided 2026-07-19, no build needed — considered requiring fresh verification on every single visit, reversed after weighing it: the original honesty problem (claiming to verify something and never actually doing it) is fully solved by verifying at least once — repeat customers shouldn't be re-annoyed every time. **Final: keep the existing skip-if-already-verified behavior for email exactly as it already works, and build phone verification (#37) the same way** — verify once, trust it going forward, unless the contact info changes. Tradeoff accepted: stale contact info if someone changes their number/email without telling us — low-stakes for a lead-gen form. — start: 2026-07-19 · completed: 2026-07-19
46. 🟩 Hard cap on the "Retry Speed Check" action on /report/[id] (PC-SEC16) — start: 2026-08-01 · completed: 2026-08-01. 30s cooldown + in-flight guard, plus a daily cap: 5 total manual retries or 3 distinct websites retried per identity (email, or IP for phone-only) in a rolling 24h window, whichever hits first. Jim (VIP emails) exempt. Timeouts don't consume quota — only a retry that resolves (ok/error) counts. Migration run live via Supabase MCP (project xvrhxtnhmnurvxitnijy) after Jim asked Claude to run it directly — column verified present (integer, NOT NULL, default 0) via a direct schema query, not just assumed from a success response.
47. 🟩❌ `/api/pagespeed-agent` trusted a client-supplied `url` instead of the report's actual stored URL (PC-SEC20) — start: 2026-08-02 · completed: 2026-08-02. Found during a security re-audit of the prior 48 hours' uncommitted work (requested by Jim before committing anything). The route (built 2026-06-30, unchanged until today) took `reportId` AND `url` from the request body and never checked they matched. Anyone who knew any valid `reportId` could POST a different `url` and the server would overwrite that report's real scores/`full_report` with results for an unrelated site, while burning the *original report owner's* daily retry quota (#46) instead of the caller's. Not introduced this session, but this session's new customer-facing "Retry Speed Check" button (#11/#46) put this endpoint directly in front of every report visitor for the first time, raising real exposure. Fixed: route now derives `url` from the stored `pingclose_audits` row (added `url` to the existing `.select()`) and no longer reads `url` from the request body at all; SSRF check moved to run against the stored URL, after the row fetch. Frontend retry call in app/report/[id]/page.tsx updated to stop sending `url` (server ignores it now regardless). Also fixed in the same pass: `lib/email.ts`'s `sendPageSpeedFailureAlert` had an unescaped HTML-injection fallback (hostname parse failure fell back to the raw unescaped url) — now runs through the same escape helper as the reason field. Separately, verified the 90s timeout chain end-to-end per Jim's request: preflight (10s) + PageSpeed's first attempt (75s) + a same-length retry could total ~86-90s against this route's 90s Vercel `maxDuration`, right at the edge of getting killed mid-request instead of returning a clean error. Tightened: the retry attempt (only fires on a real HTTP error, never on an actual timeout) now gets a 20s budget instead of another full 75s, in `lib/agents/pagespeedAgent/fetchPageSpeed.ts`. TypeScript clean, build clean.
48. 🟩 PageSpeed reliability: run two independent attempts in parallel, first success wins (PC-C13) — start: 2026-08-02 · completed: 2026-08-02. Triggered by Jim hitting a real 75-second timeout on a live citywidealarms.com test (customer had to know to click retry — most visitors wouldn't). Investigated with real data before designing a fix: queried all 62 historical `pagespeed_duration_ms` rows — successful runs range 8.6s-70.7s (median 21.6s, p99 56.6s), confirmed genuine timeouts always hit the full 75s ceiling. This ruled out Jim's first instinct (kill and restart at 45s) — the data shows a real successful run took 70.7s, so a 45s cutoff would have discarded a legitimate success. Final design (Jim: "The pursuit of perfection is worth it... lets build it right"): `runPageSpeedAgent()` in `lib/agents/pagespeedAgent/index.ts` now fires two fully independent attempts at once and resolves on whichever succeeds first; only reports failure if both fail. Since ~3% of individual attempts historically failed, two failing together should be far rarer (though not fully independent if a specific site is the cause). Also typically faster for customers, not just more reliable — takes the quicker of two variable-latency results instead of always waiting on one. Explicit accepted tradeoff: doubles PageSpeed API calls per audit (4 instead of 2) — a non-issue at current volume (~60 audits total), flagged for revisit if volume grows. Race control-flow verified with an isolated synthetic-promise test (3/3 cases passed: slow-success correctly beats fast-failure, fast-success resolves without waiting on a slow failure, both-fail correctly waits for both) before wiring in real PageSpeed calls. Added `PAGESPEED_RACE` logging (attempt settle order/timing, winner) for real observability going forward. TypeScript clean, build clean.
Files: lib/agents/pagespeedAgent/index.ts

49. ⬜ GBP Superagent: vendor account setup — Google Places API + billing, Veriphone, Lob (PC-GBP-1) — start: 2026-08-03. Jim's own action, cannot be done by Claude. Blocks #52, #53, #56, #57.
50. ⬜ GBP Superagent: draft pingclose_gbp_audits migration, get Jim's separate explicit yes, run it (PC-GBP-2) — start: 2026-08-03. SQL already drafted and explained column-by-column in the 2026-08-03 session.
51. ⬜ GBP Superagent: NAP extraction from existing HTML scrape (PC-GBP-3) — start: 2026-08-03. No dependencies, safe to build first. Must ship with hardened JSON.parse (try/catch, size cap, explicit field picks, no object spreading).
52. ⬜ GBP Superagent: discovery agent — find candidate GBP listing, never auto-picks below confidence threshold (PC-GBP-4) — start: 2026-08-03. Depends on #49, #51.
53. ⬜ GBP Superagent: profile data agent — Places Details, field-masked for cost control (PC-GBP-5) — start: 2026-08-03. Depends on #49, #52.
54. ⬜ GBP Superagent: category alignment agent — the critical GBP-vs-website mismatch check, most important finding in the feature (PC-GBP-6) — start: 2026-08-03. Depends on #53.
55. ⬜ GBP Superagent: website/GBP consistency agent — NAP + schema diff (PC-GBP-7) — start: 2026-08-03. Depends on #51, #53.
56. ⬜ GBP Superagent: phone compliance agent — Veriphone line-type lookup (PC-GBP-8) — start: 2026-08-03. Depends on #49, #53. Correctly-hedged copy only — Google does not ban mobile/VoIP numbers, only premium-rate ones.
57. ⬜ GBP Superagent: address compliance agent — Lob, PO-Box/CMRA hard-fail + residential informational-only (PC-GBP-9) — start: 2026-08-03. Depends on #49, #53.
58. ⬜ GBP Superagent: competitor gap agent, reuses existing DataForSEO local-pack logic, no new API call (PC-GBP-10) — start: 2026-08-03. Depends on #53.
59. ⬜ GBP Superagent: findings normalizer/scoring, critical-mismatch cap so it can't be buried (PC-GBP-11) — start: 2026-08-03. Depends on #54-58.
60. ⬜ GBP Superagent: orchestrator + GBP-specific spend cap that applies even to VIP (PC-GBP-12) — start: 2026-08-03. Depends on #51-59.
61. ⬜ GBP Superagent: API route + wire into /api/audit's existing after() block (PC-GBP-13) — start: 2026-08-03. Depends on #60.
62. ⬜ GBP Superagent: report page section, category-mismatch warning pinned above the score (PC-GBP-14) — start: 2026-08-03. Depends on #50, #59.
63. ⬜ GBP Superagent: security hardening rollup — re-check every item before shipping (PC-GBP-15) — start: 2026-08-03. Cuts across #51, #60.
64. ⬜ GBP Superagent: Level 2 owner-authorized deep scan — future, do NOT start yet (PC-GBP-16) — start: 2026-08-03. Deferred until #49-63 are live and Jim explicitly opens this gate.
Files: lib/agents/gbpAgent/ (new directory, see SECTION I below for full detail on every item above)

---

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
Status: OPEN — deferred 2026-08-01, real scope measured
Description: No shared CSS variables/Tailwind theme despite Tailwind being a dependency. Every file reinvents its own button/input styles inline. Re-measured 2026-08-01 (the old 116+/9-file estimate was stale): 680 hex literal occurrences, 34 distinct colors, across 11 files — app/report/[id]/page.tsx alone has 230. Two of the 11 files (lib/email.ts) plus 2 API routes are HTML email templates in string literals, not React components — CSS custom properties don't have reliable cross-email-client support, so a correct fix needs the same color values expressed as plain JS constants for those, not var(--token) the way the React pages could use. Deferred rather than built blind: 680 mechanical replacements is script territory, not manual edits, and there's no way to visually verify the rendered result in this session (no screenshot/browser-preview tool). Purely cosmetic, zero urgency.
Files: app-wide (11 files: see above)

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
