# PINGCLOSE.COM — TASK BRAIN
Diagnostic platform. Finds problems. Never fixes them.
Never say PingClose fixes anything. Never mention methodology.

Last Updated: 2026-07-16
Status: LIVE — first $495 sale confirmed 2026-07-11

---

## QUICK STATUS — read this first
🟩 = done and verified · 🟥 = coded/in-progress but not finished, or a real problem found · ⬜ = not started

1. 🟩 Admin routes brute-force bypass — live (PC-SEC1)
2. 🟩 Timing-safe password comparison — live (PC-SEC2)
3. 🟩 Leftover POC endpoints removed — live (PC-SEC3)
4. 🟩 SSRF gap closed — live (PC-SEC4)
5. 🟩 Rate limiting on /api/audit/fast — live (PC-SEC5)
6. 🟩 Email verification enforced server-side — live (PC-SEC6)
7. ⬜ Not started — /api/dataforseo-keywords public + unauthenticated (PC-SEC7)
8. ⬜ Not started — decision: mask Resend key in /api/setup? (PC-SEC8)
9. ⬜ Not started — decision: fail-open vs fail-closed rate limiter (PC-SEC9)
10. ⬜ Not started — design token system (PC-CQ1)
11. ⬜ Not started — replace emoji icons (PC-CQ2)
12. ⬜ Not started — split oversized files (PC-CQ3)
13. 🟥 Further along, not fully closed — leaked service_role key: new key created, wired in, Vercel updated, redeployed, confirmed live on the new key. Old leaked key still technically valid — can't be revoked without also migrating localseoaeopro's browser client off the legacy anon key (confirmed: it's actively used there, in lib/supabase/client.ts). Now a cross-project decision, not a UI hurdle. (PC-SEC10)
14. 🟥 Coded, not tested — PageSpeed retry fix, didn't get back to real-world/mock testing tonight (PC-C12)
15. ⬜ Not started — report page shows permanent zeros if clicked before PageSpeed finishes (PC-C11)
16. ⬜ Not started — honest 90s countdown/lock on "View Full Report" button (PC-B2)
17. ⬜ Not started — content-heavy early warning (PC-B3)
18. ⬜ Waiting on Jim's yes — migration: pagespeed_retry_count column (PC-C12)
19. 🟩 Done and live — homepage copy repositioned toward clicks, verify-email/phone microcopy, $495 pricing, mobile pricing-grid fix (PC-A2, A4, A8-A10)
20. ⬜ Not started — below-the-fold images, no Canva, browse 21st.dev for a pattern (PC-A11)
21. ⬜ Not started — reminder: fix/disconnect the failing 21st-dev/magic connector — Claude Code app setting, not a pingclose bug
22. ⬜ Not started — check FAQ page at mobile viewport for a responsive bug (PC-A12)
23. ⬜ Waiting on Jim — expand/improve FAQ content, waiting on Jim to paste in Pingdom reference material (PC-A13)

40. ⬜ Far backlog — adaptive countdown based on lazy-load/WebP signals, gated on real completion-time data, not to be built without that data + Jim's explicit go-ahead (PC-FUTURE-1)

**NEW — big open strategic question, not started:** merge localSEOAEOPro into PingClose as one unified app — possibly "PingClose" + "PingClose FixIt" as a single brand instead of two separate products. Timing argument: neither site is indexed by Google yet, so there's no SEO/domain equity to lose by merging now vs. later. Real tradeoff is strategic (one unified brand vs. the current two-touch "diagnostic creates curiosity → separate brand closes the sale" funnel psychology), not technical risk. localseoaeopro is also a meaningfully bigger/more complex app (real user auth, admin systems, its own skills/middleware) than pingclose's current lead-gen funnel. Needs its own proper planning session — do not start implementing without that.

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
Status: OPEN — real bug, confirmed live
Description: /report/[id]/page.tsx fetches its data exactly once on load, with no polling. If a visitor lands there before PageSpeed completes (confirmed possible today — the "View Full Report" link is always clickable, see PC-B2), they see frozen placeholder/zero scores forever unless they manually refresh. Needs polling (same pattern /check already uses) plus a 90-second timeout fallback that renders gracefully if PageSpeed genuinely never finishes.
Files: app/report/[id]/page.tsx

---

### PC-C12 — pagespeed_retry_count column + retry logging
Status: OPEN — migration awaiting Jim's yes
Description: Google's PageSpeed API occasionally returns a generic transient error unrelated to the site being tested (confirmed: same URL failed once then succeeded twice more within an hour). A retry-once fix already shipped in lib/agents/pagespeedAgent/fetchPageSpeed.ts (coded, NOT yet tested — could not force a real Google-side failure on demand; a mock-fetch test was proposed but not run). Jim also wants retries recorded, not just silently retried, as a pattern-analysis signal. Needs this exact migration, shown for approval, not yet run:
  ALTER TABLE pingclose_audits ADD COLUMN pagespeed_retry_count integer NOT NULL DEFAULT 0;
Files: lib/agents/pagespeedAgent/fetchPageSpeed.ts, app/api/pagespeed-agent/route.ts

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
Status: OPEN — WAITING
Description: Send customer a text with link to their report immediately after audit completes. Awaiting AWS SMS Sandbox exit approval (submitted 2026-07-12, 24-48h turnaround).
Dependencies: PC-E1

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
Status: OPEN — Route has no auth and no rate limit, but every call costs money against the DataForSEO API. Needs a decision on whether this should even be public.
Files: app/api/dataforseo-keywords/route.ts

---

### PC-SEC8 — Resend key returned in plaintext from /api/setup
Status: OPEN — decision needed
Description: /api/setup GET returns the raw Resend API key value once authenticated as admin. Low severity for an admin-only tool, but worth a decision on masking it instead.
Files: app/api/setup/route.ts

---

### PC-SEC9 — Rate limiter fails open if Supabase is unreachable
Status: OPEN — decision needed
Description: If Supabase is down/misconfigured, the rate-limit check (and the new email-verification check) currently fails open — allows the request through rather than blocking it. Confirmed this exact behavior firing in a local dev environment with placeholder credentials. Needs a decision: keep fail-open (availability over strictness) or switch to fail-closed for admin/security-critical checks specifically.
Files: lib/adminRateLimiter.ts, lib/rateLimiter.ts

---

### PC-SEC10 — Leaked service_role key rotation
Status: OPEN — further along, not fully closed
Description: The Supabase service_role key was accidentally pasted into a public online notepad site while troubleshooting local dev credentials. Progress: new dedicated secret key ("pingclose", sb_secret_...) created in Supabase, wired into local .env.local, Vercel's Production SUPABASE_SERVICE_ROLE_KEY updated via CLI, production redeployed, and confirmed live via a real end-to-end test — the live site now runs entirely on the new key.
Remaining blocker: the OLD leaked key is still technically valid and hasn't been revoked. Investigated disabling it via Supabase's "Disable JWT-based API keys" (Settings → API Keys → Legacy tab) — but that action disables the legacy `anon` and `service_role` keys TOGETHER (they're JWTs signed by the same underlying secret, so one can't be revoked without the other). Confirmed via grep that `localseoaeopro` — a separate app sharing this same Supabase project — has a real, live browser-facing Supabase client (lib/supabase/client.ts, createBrowserClient) actively using the legacy NEXT_PUBLIC_SUPABASE_ANON_KEY. Disabling the legacy pair now would break that other live site. Fully closing this requires localseoaeopro to first migrate its browser client to the new publishable-key system (same migration pingclose already did) — a change to a different project, needs its own decision, not something to do unilaterally from pingclose.
Files: (Supabase dashboard + Vercel dashboard, not code; localseoaeopro/lib/supabase/client.ts if that migration is undertaken)

---

## SECTION G — CODE QUALITY (found 2026-07-16, not started)

### PC-CQ1 — No centralized design tokens
Status: OPEN
Description: 116+ hardcoded hex color literals (e.g. #10D9A0) across 9 files, no shared CSS variables/Tailwind theme despite Tailwind being a dependency. Every file reinvents its own button/input styles inline.
Files: app-wide

---

### PC-CQ2 — Emoji used as functional icons
Status: OPEN
Description: 79 emoji characters (📱🖥️⚡🔴🟠🟡✓❌🏆 etc.) used as the icon system instead of the radar/arc motif established in the brand doc. Directly contradicts the brand's own "no decoration unearned by function" rule.
Files: app-wide

---

### PC-CQ3 — Files exceeding the project's own 200-line rule
Status: OPEN
Description: app/check/page.tsx (496 lines), app/HomeClient.tsx (442 at time of audit), app/faq/FaqClient.tsx (404), app/admin/page.tsx (297), app/pricing/page.tsx (275), lib/email.ts (260) all exceed CLAUDE.md's own 200-line-per-file rule.
Files: see above

---

## SECTION H — STRATEGIC DECISIONS (not started, needs its own planning session)

### PC-STRAT1 — Merge localSEOAEOPro into PingClose
Status: OPEN — big decision, do not start implementing without a dedicated planning session
Description: Jim's idea (2026-07-16): roll localSEOAEOPro into PingClose as one unified app, possibly branded "PingClose" + "PingClose FixIt" instead of two separate products. Timing argument in favor: neither site is indexed by Google yet, so there's no SEO/domain equity at risk by merging now vs. later — removes the biggest objection to doing this early. The real tradeoff is strategic, not technical: a unified brand vs. the current two-touch funnel psychology (PingClose creates curiosity by finding problems → separate LocalSEOAEOPro brand closes the sale by fixing them), which is currently a hard rule in this very file's header and in CLAUDE.md ("PingClose FINDS problems. LocalSEOAEOPro FIXES them. Never say PingClose fixes anything."). Also relevant: localseoaeopro is a meaningfully bigger, more complex app (real user auth, admin systems, its own skills/middleware) than pingclose's current lead-gen funnel — this is not a small code migration. Before any implementation: decide what "merged" actually means (one app under one domain? two domains sharing a backend? unified account system?), and revisit the CLAUDE.md positioning rules, since they'd need to change first.

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
