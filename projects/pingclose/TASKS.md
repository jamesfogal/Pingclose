# PINGCLOSE.COM — TASK BRAIN
Diagnostic platform. Finds problems. Never fixes them.
Never say PingClose fixes anything. Never mention methodology.

Last Updated: 2026-07-19
Status: LIVE — first $495 sale confirmed 2026-07-11

---

## QUICK STATUS — read this first

**Legend:** ❌ = critical/dangerous (my judgment — push back if you disagree) · 🟩 = done · 🟥 = in progress or a confirmed problem · ⬜ = not started
**Numbers are positional, not permanent.** They reflect current priority order and shift whenever a new item is inserted or something completes — a new emergency task can jump straight to #1 and push everything else down. Numbers only lock in forever once a task is completed and moved to the archive at the bottom.
**Dates in `[brackets]` are permanent.** They record when the item was first identified and never change, no matter how many times its number shifts. That's the real measure of how long something has been sitting.
**Priority logic (confirmed 2026-07-19):** the organizing question is what gets PingClose launched and making money fastest — not just "is this technically dangerous." That means real bugs/security gaps rank highest (❌ CRITICAL), the site's visual/code quality is now itself a launch blocker (🎨 LAUNCH-CRITICAL CLEANUP, elevated above where it used to sit), and the phone/SMS/voice system is deliberately moved down — not paused, never removed from the list — while Jim spends a couple of days deciding on his own approach.
**500-line checkpoint:** at every ~500-line interval, re-run this whole prioritization pass — review recent conversation for new items, re-sort by the logic above, and ask the four standing questions (see hook setup).

---

**UP NEXT:** #8 — Leaked service_role key still technically valid `[added 2026-07-16]`. Completed items permanently hold #1-7 (see archive at the bottom) — the open list continues from #8, it does not restart at #1. Sequence confirmed 2026-07-19: work through the full ❌ Critical tier (#8-20) first, then #21 — OpenPhone/Quo signup — comes immediately after, ahead of the cleanup/styling work, since real phone verification can't happen without it.

---

## ❌ CRITICAL — real dangers, fix regardless of anything else

8. ❌🟥 `[2026-07-16]` Leaked service_role key still technically valid — new key live and working on pingclose, but the OLD leaked key can't be revoked without also migrating localseoaeopro off its shared legacy key. Since these two apps are becoming one, this is prep work on PingClose's own future codebase, not a favor to a separate app.

   **Done so far (2026-07-19):**
   - 🟩 6 files in localseoaeopro updated to use PingClose's existing new key values instead of the legacy anon/service_role keys: `lib/supabase/client.ts`, `lib/supabase/server.ts`, `middleware.ts` (→ new publishable key), `lib/supabase/admin.ts`, `app/api/admin-audits/route.ts`, `lib/skills/healthReporter.ts` (→ new secret key)
   - 🟩 New key values (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`) added to localseoaeopro's Vercel Production environment — publishable key retrieved directly from Supabase's API, secret key extracted from pingclose's local `.env.local`, neither ever displayed in chat
   - 🟩 TypeScript clean, production build passes (all 19 routes + middleware compile correctly), diff reviewed fresh for security — no secrets embedded, no unrelated changes swept in
   - 🟩 Old legacy env vars (`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) still present in Vercel too — both key systems coexist right now, so nothing is broken yet

   **Still pending:**
   - ⬜ Commit the 6 files (only those 6 — this repo has other pre-existing unrelated uncommitted changes that must not get swept in) and deploy
   - ⬜ Verify localseoaeopro's live login/dashboard/admin panel actually work correctly on the new keys, in production
   - ⬜ Only after that's confirmed — rotate/disable the legacy JWT secret in Supabase, which is the step that actually closes the leak
   - ⬜ Final check: confirm the old leaked key no longer authenticates, confirm both pingclose and localseoaeopro still fully functional (PC-SEC10)
9. ❌🟥 `[2026-07-19]` Admin login is one shared password — no MFA, no session, no per-user identity (PC-SEC14)
10. ❌🟥 `[2026-07-19]` Phone-only submissions to /api/audit skip verification entirely and crash with a 500 (PC-SEC11)
11. ❌⬜ `[2026-07-16]` Report page shows permanent zeros if clicked before PageSpeed finishes — hits every customer (PC-C11)
12. ❌🟥 `[2026-07-16]` PageSpeed retry fix coded but not tested — affects report reliability (PC-C12)
13. ❌⬜ `[2026-07-16]` Migration for the retry fix above, waiting on Jim's yes (PC-C12)
14. ❌🟥 `[2026-07-16]` Fail-open/closed decision made (fail-closed on admin login, leaning fail-closed on audit form), not yet built (PC-SEC9)
15. ❌⬜ `[2026-07-19]` /api/send-code has no rate limit, spammable (PC-SEC12)
16. ❌⬜ `[2026-07-16]` /api/dataforseo-keywords public + unauthenticated, costs money per call (PC-SEC7)
17. ❌⬜ `[2026-07-19]` Add CAPTCHA to admin login (PC-SEC13)
18. ❌⬜ `[2026-07-19]` Audit MFA status on AWS/Supabase/Vercel/GitHub/Resend accounts (PC-SEC15)
19. ❌⬜ `[2026-07-16]` Decide on masking Resend key in /api/setup — lowest severity of this group (PC-SEC8)
20. ❌🟥 `[2026-07-19]` New CLAUDE.md security-audit rule written, still uncommitted

## 📞 RIGHT AFTER CRITICAL — blocks real phone verification, so it can't wait behind cleanup/styling

21. ⬜ `[2026-07-19]` Sign up for OpenPhone/Quo, submit 10DLC business registration — Jim's own action, needs his business details (not something Claude can do on his behalf) (PC-E2)

## 🎨 LAUNCH-CRITICAL CLEANUP — the site's look/quality is now a launch blocker

22. ⬜ `[2026-07-16]` Centralized design token system — fixes 116+ hardcoded hex colors (PC-CQ1)
23. ⬜ `[2026-07-16]` Replace 79 emoji-as-icons with a real icon system (PC-CQ2)
24. ⬜ `[2026-07-16]` Split files exceeding the project's own 200-line rule (PC-CQ3)
25. ⬜ `[2026-07-16]` Below-the-fold images / homepage visual anchor, no Canva look (PC-A11)
26. ⬜ `[2026-07-16]` FAQ page mobile-responsive bug check (PC-A12)
27. ⬜ `[2026-07-16]` Expand FAQ content — waiting on Jim to paste Pingdom reference material (PC-A13)
28. ⬜ `[2026-07-16]` Honest 90s countdown/lock on "View Full Report" button (PC-B2)
29. ⬜ `[2026-07-16]` Content-heavy early warning heuristic (PC-B3)
30. ⬜ `[2026-07-16]` Fix/disconnect the failing 21st-dev/magic connector (Claude Code app setting, not app code)

## 📱 PHONE/SMS/VOICE SYSTEM — decision made 2026-07-19, signup itself moved up (see above), rest stays here

**DECIDED (2026-07-19): OpenPhone/Quo, human-answered, one vendor, no AI agent yet.** AWS SNS path abandoned — building the OTP flow on AWS as a "temporary" bridge and then rebuilding it again on OpenPhone/Quo later would have meant doing the same work twice, so it's built once, directly on the platform that's actually being kept. AI voice/text agents (Retell AI confirmed as the only researched option with no Twilio dependency, Synthflow and Bland AI disqualified for requiring Twilio underneath) are explicitly deferred until real call volume from the OpenPhone number justifies the added per-minute cost — not something to build alongside the initial rollout.

31. ⬜ `[2026-07-19]` Verify OpenPhone/Quo's actual webhook/API capabilities (send code, receive replies) before building against it
32. ⬜ `[2026-07-19]` Add SMS consent microcopy to the phone field on the homepage form — cheap, protects compliance regardless of anything else
33. ⬜ `[2026-07-19]` Build phone verification (OTP send + confirm) directly on OpenPhone/Quo's API, mirroring the existing email-verification flow (PC-E4)
34. ⬜ `[2026-07-19]` Build event-forwarding into the existing notification pipeline (PC-E5)
35. ⬜ `[2026-07-19]` AWS 10DLC origination request — abandoned in favor of OpenPhone/Quo, no further action needed (PC-E2, closed)
36. ⬜ `[2026-07-19]` Future, explicitly gated on real call volume — AI voice/text agent via Retell AI, no Twilio dependency confirmed (PC-FUTURE-2)

## 🔮 FAR BACKLOG

37. ⬜ `[2026-07-16]` Adaptive countdown based on lazy-load/WebP signals, gated on real data (PC-FUTURE-1)

## 🧭 STRATEGIC — own planning session

38. ⬜ `[2026-07-16]` Merge localSEOAEOPro into PingClose as one unified app (PC-STRAT1)
39. ⬜ `[2026-07-19]` Remove all "forward to LocalSEOAEOPro" language/links from PingClose, point to PingClose's own pricing instead — first concrete step of the merge. Scoped tonight: `app/pricing/page.tsx` (page title/meta description, Open Graph tags, JSON-LD structured data, two headline lines, the entire "Fix column" pricing card, 2 external links to localseoaeopro.com/pricing), `app/report/[id]/page.tsx` (the main "Fix These Problems" CTA card + copy + external link), `app/faq/FaqClient.tsx` (1 external link). CLAUDE.md's "Critical Positioning" rule already rewritten for single-brand messaging (2026-07-19) — this item is now just the actual page/copy work. (PC-STRAT1, sub-task)
40. ⬜ `[2026-07-19]` Update CLAUDE.md's "Project Purpose" and "Primary Conversion Goal" sections to match the single-brand direction — both still describe PingClose as diagnostic-only ("encourage the visitor to request a deeper analysis," CTA "Request Deep Analysis" / "See Sample Findings") with no mention that PingClose now fixes things directly (PC-STRAT1, sub-task)

---

## ✅ COMPLETED (permanent numbers, deployed date + time — never renumbered, never reordered)

#1 — 🟩 Admin routes brute-force bypass — **deployed 2026-07-16, 2:40 PM CDT** (commit 7779613) (PC-SEC1)
#2 — 🟩 Timing-safe password comparison — **deployed 2026-07-16, 2:40 PM CDT** (commit 7779613) (PC-SEC2)
#3 — 🟩 Leftover POC endpoints removed — **deployed 2026-07-16, 2:40 PM CDT** (commit 7779613) (PC-SEC3)
#4 — 🟩 SSRF gap closed — **deployed 2026-07-16, 2:40 PM CDT** (commit 7779613) (PC-SEC4)
#5 — 🟩 Rate limiting on /api/audit/fast — **deployed 2026-07-16, 2:40 PM CDT** (commit 7779613) (PC-SEC5)
#6 — 🟩 Email verification enforced server-side — **deployed 2026-07-16, 4:18 PM CDT** (commit cdf4a82) (PC-SEC6)
#7 — 🟩 Homepage copy repositioned, verify-email/phone microcopy, $495 pricing, mobile pricing-grid fix — **deployed 2026-07-16, 5:39 PM CDT** (commit bb844bb) (PC-A2, A4, A8-A10)

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
Status: OPEN — WAITING, discrepancy found
Description: Send customer a text with link to their report immediately after audit completes. Note on file said "awaiting AWS SMS Sandbox exit approval, submitted 2026-07-12, 24-48h turnaround" — but the live AWS account was checked directly on 2026-07-19 (console: SNS > Text messaging (SMS), and AWS End User Messaging > Phone numbers / Registrations) and shows: still in SMS Sandbox, 0 verified sandbox numbers, 0 phone numbers, 0 registrations. That 2026-07-12 submission does not appear to have gone through, or was lost/never saved. This task is now folded into the bigger PC-E4/PC-STRAT2 phone system decision rather than standing alone.
Dependencies: PC-E1

---

### PC-E4 — Mandatory dual verification (email AND phone)
Status: OPEN — decided 2026-07-19, not built
Description: Jim's decision: both email and phone must be required fields and both must be actually verified (real code sent and confirmed) before an audit runs — "Required for security," and also for lead-quality/follow-up purposes ("know who is looking at someone's website"). Today only email is genuinely verified (send-code/verify-code); phone is just an unverified text field. Needs: a phone_verifications table (or equivalent) mirroring email_verifications, new send/verify routes using whichever SMS provider is chosen (see PC-STRAT2), rate limiting on those new routes, and a frontend change making phone a required field with its own code-entry step. Twilio is permanently excluded as a provider (Jim's standing rule, all projects). Migration SQL needs Jim's explicit sign-off per the project's migration rule before running.
Files: app/api/audit/route.ts, app/HomeClient.tsx, app/check/page.tsx, new send-phone-code/verify-phone-code routes, new migration
Dependencies: PC-STRAT2

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

### PC-SEC11 — Phone-only submissions bypass verification and crash
Status: OPEN — real bug, confirmed 2026-07-19 by reading current code
Description: /api/audit requires "at least one of email or phone" (line 22), but the email-verification check only runs `if (email && !isVIP(email))` — skipped entirely if only phone is provided. Immediately after, `checkRateLimit(email)` calls `isVIP(email)` which does `email.toLowerCase()` on a possibly-undefined value, throwing. The outer try/catch swallows it and returns a generic 500 "Audit failed." Net effect today: phone-only submissions don't work at all (not a live exploit), but it's broken and needs a real fix — likely moot once PC-E4 (mandatory dual verification) ships, since email would become required either way.
Files: app/api/audit/route.ts, lib/rateLimiter.ts

---

### PC-SEC12 — No rate limit on /api/send-code
Status: OPEN
Description: Unlike /api/audit and /api/audit/fast, the verification-code sender has no IP or email rate limit. Someone could repeatedly trigger code emails to the same or many addresses — costs Resend sends and could look like harassment to a real inbox.
Files: app/api/send-code/route.ts

---

### PC-SEC13 — Add CAPTCHA to admin login
Status: OPEN — proposed fix, not yet built
Description: Today, if Supabase is down, the DB-based rate limiter on admin login fails open (PC-SEC9) — the password check itself still works (env-var based, not Supabase-dependent), but failed-attempt counting stops. A CAPTCHA (Cloudflare Turnstile — free, lightweight, fits the project's performance rules) would block scripted brute-force attempts independent of Supabase's uptime, which is a cleaner fix than choosing fail-open vs fail-closed.
Files: app/api/admin/login/route.ts, admin login page

---

### PC-SEC14 — Admin login has no MFA, no session, no per-user identity
Status: OPEN — real gap, confirmed 2026-07-19
Description: Verified by reading app/admin/page.tsx and lib/adminRateLimiter.ts directly. Admin auth is a single shared password (ADMIN_PASSWORD env var) sent as an `x-admin-password` header on every request — not stored in localStorage (kept in React state only, so at least it's not persisted in plaintext on disk), but there is no second factor, no session/token system, and no concept of separate admin users. Anyone with the one password has full access, and if Jim ever brings on staff, there'd be no way to distinguish who took which action. Needs a decision on scope: add a second factor (TOTP/authenticator app) to the existing single-password model, or move to real per-user accounts with individual credentials.
Files: app/admin/page.tsx, lib/adminRateLimiter.ts, app/api/admin/login/route.ts

---

### PC-SEC15 — Audit MFA on actual cloud provider accounts
Status: OPEN — not started
Description: Separate from PingClose's own admin login (PC-SEC14), this is about whether Jim's actual AWS, Supabase, Vercel, GitHub, and Resend accounts themselves have MFA enabled. Particularly relevant for Supabase given the service_role key leak this session (PC-SEC10) — key rotation alone doesn't close the risk if the Supabase account login itself has no second factor. This is an account-settings check, not a code change — needs to be walked through in each provider's dashboard.
Files: none (account settings, not code)

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
