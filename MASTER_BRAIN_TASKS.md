# MASTER_BRAIN_TASKS - All Projects
## Permanent Task Tracker

Last Updated: 2026-08-02 23:18:42 UTC
Revenue Status: LIVE - first $495 sale confirmed 2026-07-11

---

# PROJECT 1 - PINGCLOSE.COM
One platform - finds problems and fixes them. LocalSEOAEOPro is being folded in, not treated as a separate brand.

---

## Current Priority Order

1. PC-SEC11 and PC-E4 - phone-only submissions still skip verification and crash; Jim explicitly chose to hold the isolated fix until full phone verification is built.
2. PC-C12 and PC-C13 follow-up - retry logging is shipped and dual-attempt racing is live, but the retry failure path still lacks real proof and the "see both results" migration is still unapproved.
3. PC-SEC15 plus the failure-alert confirmation gap - cloud-account MFA and actual inbox confirmation of PageSpeed failure alerts still need manual checks.
4. PC-STRAT2 plus PC-E4 and PC-E5 - finish OpenPhone/Quo signup + 10DLC and verify webhook/API depth before building phone verification or phone-event forwarding.
5. PC-SEC10 follow-up plus OPEN-3 and OPEN-4 - remaining operational resilience work: optional independent key-retirement recheck, synthetic-user monitoring, and the `passes_one_second` backfill.
6. PC-A11 through PC-A13 and PC-CQ1 through PC-CQ3 - deferred design, FAQ, and code-quality follow-up work.
7. PC-STRAT1 - the brand decision is made; the remaining work is the actual LSAP feature port into PingClose.

---

## SECTION A - FRONT PAGE
Everything the visitor sees before they submit their URL.

---

### PC-A1 - Homepage design overhaul
Status: OPEN
Description: Redesign the homepage layout. Desktop should be two columns with stronger content density and clearer hierarchy; mobile should stack cleanly and feel intentional.
Files: app/HomeClient.tsx, app/page.tsx

---

### PC-A2 - New H1
Status: DONE (2026-07-16)
Description: H1 changed to "Ping Your Website to See How Many Clicks You Are Losing." Repositions the page around clicks instead of raw speed.
Commit: bb844bb
Files: app/HomeClient.tsx

---

### PC-A3 - CSS diagnostic art / above-fold visual anchor
Status: OPEN
Description: Replace the empty right column with a CSS-only diagnostic visual that makes the product feel alive without adding image weight.
Files: app/HomeClient.tsx

---

### PC-A4 - Phone field label fix
Status: DONE (2026-07-16)
Description: Removed "Get a call back within minutes." Added helper copy under the email and phone fields explaining verification instead of a sales callback.
Commit: bb844bb
Files: app/HomeClient.tsx

---

### PC-A5 - IP geolocation city detection
Status: OPEN
Description: Detect the visitor's city on load so the page can personalize the headline and downstream competitor context.
Files: app/HomeClient.tsx

---

### PC-A6 - Dynamic H1 with visitor city
Status: OPEN
Description: Use city detection to swap in a location-specific H1 when available.
Files: app/HomeClient.tsx
Dependencies: PC-A5

---

### PC-A7 - City confirmation widget
Status: OPEN
Description: Confirm the detected city and use that confirmation to drive competitor context later in the funnel.
Files: app/HomeClient.tsx
Dependencies: PC-A5

---

### PC-A8 - "Click monitor" byline
Status: DONE (2026-07-16)
Description: Added "We are a click monitor. The faster you are, the more clicks you receive." below the logo.
Commit: bb844bb
Files: app/HomeClient.tsx

---

### PC-A9 - Direct $495 price on pricing page
Status: DONE (2026-07-16)
Description: Added "$495 to correct your speed - additional fixes available a la carte" directly on PingClose's pricing page.
Commit: bb844bb
Files: app/pricing/page.tsx

---

### PC-A10 - Mobile grid bug on pricing page
Status: DONE (2026-07-16)
Description: Pricing cards had no responsive breakpoint and were being squeezed into unusable phone-width columns. Fixed with a shared `.responsive-grid-2col` class.
Commit: bb844bb
Files: app/globals.css, app/pricing/page.tsx

---

### PC-A11 - Below-the-fold images
Status: OPEN
Description: Add below-the-fold visuals that explain something real. No Canva-style decoration. Jim still needs to point at the specific look or pattern he wants.
Files: app/HomeClient.tsx

---

### PC-A12 - FAQ page mobile-responsive check
Status: OPEN
Description: Jim reported a mobile-only FAQ issue. Desktop verification looked fine, but after the real pricing-page mobile bug was found, the FAQ page still needs a real mobile re-check.
Files: app/faq/FaqClient.tsx

---

### PC-A13 - FAQ content expansion
Status: OPEN - WAITING
Description: Jim wants stronger FAQ coverage informed by competitor material. Direct scraping was blocked; waiting on Jim to paste the reference material he wants used.
Files: app/faq/FaqClient.tsx

---

## SECTION B - CHECK PAGE
The page the visitor sees while the audit runs.

---

### PC-B1 - Check page content and design review
Status: OPEN
Description: Improve the wait screen with clearer progress, expectation-setting, and trust signals.
Files: app/check/page.tsx

---

### PC-B2 - Honest 90-second countdown / lock on report button
Status: OPEN - DESIGNED, NOT BUILT
Description: Prevent users from opening the report too early. Show an honest "up to 90 seconds" countdown and unlock early if the audit actually finishes sooner.
Files: app/check/page.tsx
Dependencies: PC-C11

---

### PC-B3 - Content-heavy early warning heuristic
Status: OPEN - DESIGNED, NOT BUILT
Description: Use the fast HTML scan to warn early when a page looks image-heavy, video-heavy, or generally slow before PageSpeed finishes.
Files: lib/agents/htmlAgent.ts, app/check/page.tsx

---

## SECTION C - CUSTOMER REPORT PAGE
Everything the customer sees on their report. This is the sales page.

---

### PC-C1 - Plain English report labels
Status: OPEN
Description: Rewrite report labels so each metric explains the business impact in plain language and reflects real thresholds/data.
Files: app/report/[id]/page.tsx

---

### PC-C2 - Social Presence Agent + findings on report
Status: OPEN
Description: Add a social/directory presence agent and turn missing presences into report findings.
Files: lib/agents/socialPresenceAgent, app/report/[id]/page.tsx

---

### PC-C3 - Location extraction from customer website
Status: OPEN
Description: Pull city, state, address, and phone-area context from the customer site for alerts and competitor logic.
Files: lib/agents/htmlAgent.ts

---

### PC-C4 - Nearest major city calculation
Status: OPEN
Description: Show geographic context such as "19 miles west of St. Louis" for Jim's workflow.
Files: lib/
Dependencies: PC-C3

---

### PC-C5 - DataForSEO click comparison on report
Status: OPEN
Description: Put the built DataForSEO agent onto the report and surface the click gap in a way that sells the fix.
Files: app/report/[id]/page.tsx
Dependencies: PC-C1, PC-C3

---

### PC-C6 - Report value close section
Status: OPEN
Description: Add the projected upside, agency comparison, and $495 close once real click-gap data is available.
Files: app/report/[id]/page.tsx
Dependencies: PC-C5

---

### PC-C7 - Talk to a Person button
Status: OPEN
Description: Add a prominent contact action with Jim's number and immediate context forwarding.
Files: app/report/[id]/page.tsx
Dependencies: PC-C6

---

### PC-C8 - Free city page offer on report
Status: OPEN
Description: Offer a free city page when the customer has no city pages and has bought the fix package.
Files: app/report/[id]/page.tsx
Dependencies: LSAP-3

---

### PC-C9 - Full competitive intelligence
Status: OPEN
Description: Expand the competitor story beyond one rank/click gap into top-13 SERP and competitor weakness analysis.
Dependencies: PC-C5

---

### PC-C10 - AI chat agent on report
Status: OPEN
Description: Let the visitor ask questions about their exact report and competitor data, with a handoff to Jim.
Dependencies: PC-C7

---

### PC-C11 - Report page shows permanent zeros if opened too early
Status: DONE (2026-08-01)
Description: `/report/[id]` used to fetch once and freeze on placeholder values if the visitor landed before PageSpeed finished. Fixed with polling that refreshes pending audits every 3 seconds and gives up gracefully after 90 seconds instead of spinning forever. This became the base for the manual retry flow and related hardening.
Files: app/report/[id]/page.tsx

---

### PC-C12 - PageSpeed retry logging and migration
Status: PARTIALLY DONE - logging shipped 2026-08-01, retry-once logic itself still untested
Description: Retry-once logic for transient Google-side failures existed first, but on 2026-08-01 the real logging layer was finally built around it. `fetchPageSpeed.ts` now returns per-strategy retry flags, the agent threads them upward, and `/api/pagespeed-agent` writes a real `pagespeed_retry_count` value on each audit. The migration was run and verified live. What is still open is the original reliability proof: the retry-once path itself has never been confirmed against a real forced Google-side failure.
Required Migration: `ALTER TABLE pingclose_audits ADD COLUMN pagespeed_retry_count integer NOT NULL DEFAULT 0;` - run and verified live on 2026-08-01
Files: lib/agents/pagespeedAgent/fetchPageSpeed.ts, lib/agents/pagespeedAgent/types.ts, lib/agents/pagespeedAgent/index.ts, app/api/pagespeed-agent/route.ts

---

### PC-C13 - Dual-attempt PageSpeed racing
Status: DONE (2026-08-02)
Description: After a real `citywidealarms.com` timeout proved customers could hit a dead end, PingClose switched from one PageSpeed attempt to two independent attempts in parallel and now accepts the first success. The 45-second kill-and-restart idea was rejected with real historical duration data before building. Success-path behavior was live-verified in production; both-fail behavior still only has synthetic control-flow proof. Separate follow-up: the proposed "see both results" loser-attempt storage is not approved or built.
Commit: 93ccdef
Files: lib/agents/pagespeedAgent/index.ts, lib/agents/pagespeedAgent/fetchPageSpeed.ts

---

## SECTION D - ADMIN REPORT PAGE
What Jim sees. Customers never see this.

---

### PC-D1 - Admin timing panel
Status: OPEN
Description: Show the duration of each agent and the total audit time.
Files: app/report/[id]/page.tsx

---

### PC-D2 - Nearest major city on admin report
Status: OPEN
Description: Add geographic context for outbound calls.
Dependencies: PC-C4

---

### PC-D3 - Remove PageSpeed API box from customer view
Status: OPEN
Description: Move the API-status box to admin-only view.
Files: app/report/[id]/page.tsx

---

## SECTION E - ALERTS & NOTIFICATIONS

---

### PC-E1 - Jim alert email on FAIL audit
Status: DONE
Description: Alert email already shipped.
Commit: ad8b484
Files: lib/reportDelivery.ts, lib/email.ts

---

### PC-E2 - Customer texting capability
Status: OPEN - WAITING, PROVIDER PATH NOT SETTLED
Description: The old AWS-only plan is stale. On 2026-07-19 the live AWS account still showed SMS Sandbox, no verified numbers, no phone numbers, and no registrations. Treat texting as part of the broader provider decision instead of a ready-to-build standalone AWS task.
Dependencies: PC-STRAT2

---

### PC-E3 - Google Contacts auto-create on FAIL audit
Status: OPEN
Description: Create a Google Contact with name, phone, domain, score, and report link. On 2026-07-21 no Google Contacts connector was available in the tool list.
Dependencies: PC-E1

---

### PC-E4 - Mandatory dual verification (email and phone)
Status: OPEN - DECIDED 2026-07-19, RE-CONFIRMED UNBUILT 2026-08-02
Description: Jim decided both email and phone must be required and actually verified before an audit runs. On 2026-08-02 this was re-checked directly against the codebase: `/api/audit` still accepts `url` plus at least one of email/phone, only email is ever checked against a verified row, and there is still no phone-verification table or phone-verify route anywhere in the repo. Needs phone verification storage, send/verify routes, rate limiting, and a homepage flow that mirrors email verification. Form microcopy chosen on 2026-08-02 for the eventual required-fields state: "Both are required - we verify each one so your report goes to the right person, and only you."
Dependencies: PC-STRAT2

---

### PC-E5 - Event forwarding from phone system into PingClose notifications
Status: OPEN
Description: Pipe calls, texts, or voicemail events from the chosen phone system into the existing notification flow Jim already relies on.
Dependencies: PC-STRAT2

---

## SECTION F - SECURITY
Security findings and follow-up from the 2026-07-16 and 2026-07-19 sessions.

---

### PC-SEC1 - Admin routes brute-force bypass
Status: DONE
Description: Consolidated the four admin-authenticated routes behind one shared helper so all of them use the same rate-limited auth path.
Commit: 7779613
Files: lib/adminRateLimiter.ts, app/api/admin/login/route.ts, app/api/admin/audits/route.ts, app/api/setup/route.ts, app/api/setup/test/route.ts

---

### PC-SEC2 - Timing-safe password comparison
Status: DONE
Description: Replaced plain `===` password comparison with a timing-safe check.
Commit: 7779613
Files: lib/adminRateLimiter.ts

---

### PC-SEC3 - Leftover POC endpoints removed
Status: DONE
Description: Deleted unauthenticated `/api/poc/agent` and `/api/poc/dispatcher` production scaffolding.
Commit: 7779613
Files: app/api/poc/agent/route.ts, app/api/poc/dispatcher/route.ts

---

### PC-SEC4 - SSRF gap in audit routes
Status: DONE
Description: Added SSRF target validation for private, loopback, link-local, and cloud-metadata addresses.
Commit: 7779613
Files: lib/ssrfGuard.ts, app/api/audit/route.ts, app/api/audit/fast/route.ts

---

### PC-SEC5 - No rate limiting on `/api/audit/fast`
Status: DONE
Description: Added IP-based rate limiting to the fast audit route.
Commit: 7779613
Files: lib/rateLimiter.ts, app/api/audit/fast/route.ts

---

### PC-SEC6 - Email verification never enforced server-side
Status: DONE
Description: `/api/audit` now checks for a verified email server-side instead of trusting the UI flow alone.
Commit: cdf4a82
Files: app/api/audit/route.ts

---

### PC-SEC7 - `/api/dataforseo-keywords` is public and unauthenticated
Status: DONE (2026-08-01)
Description: Route was dead-but-reachable and cost money per call. It is now gated behind an internal shared secret using timing-safe comparison. Nothing in the live app calls it yet, so this was closed defensively before wiring the feature into the report.
Commit: 5fb0fc6
Files: app/api/dataforseo-keywords/route.ts

---

### PC-SEC8 - Resend key returned in plaintext from `/api/setup`
Status: DONE (2026-08-01)
Description: `/api/setup` now masks secrets on read, and the setup UI no longer risks overwriting a real key with the masked placeholder text. The fix was verified live against the real dev setup.
Commit: 5fb0fc6
Files: app/api/setup/route.ts

---

### PC-SEC9 - Rate limiter and related checks fail open if Supabase is unavailable
Status: DONE (2026-08-01)
Description: The split decision was made and built. Admin login and the email-based `/api/audit` limiter now fail closed on Supabase errors; the IP-only `/api/audit/fast` limiter deliberately stays fail open because that route has no other Supabase dependency.
Commit: 5fb0fc6
Files: lib/adminRateLimiter.ts, lib/rateLimiter.ts

---

### PC-SEC10 - Leaked Supabase service_role key closure
Status: OPEN - OPERATIONAL FIX DONE, FINAL SENSITIVITY REMAINS
Description: PingClose was moved onto a new dedicated secret key, Vercel was updated, production was redeployed, and live end-to-end behavior was re-tested. The remaining sensitivity is final old-key invalidation: that depended on LocalSEOAEOPro migrating off the shared legacy JWT key path, and later PingClose session notes carried forward re-verification concerns rather than a fresh independent proof from this context.
Files: Supabase dashboard, Vercel environment, LocalSEOAEOPro Supabase client if final legacy-key retirement is revisited

---

### PC-SEC11 - Phone-only submissions bypass verification and crash
Status: OPEN - ROOT CAUSE CONFIRMED
Description: Phone-only submits skip the email verification branch and then crash in `isVIP(undefined)` when rate limiting runs. The thrown error is swallowed by the outer handler and returned as a generic 500. Jim explicitly chose to hold the isolated fix until PC-E4 is tackled.
Files: app/api/audit/route.ts, lib/rateLimiter.ts

---

### PC-SEC12 - No rate limit on `/api/send-code`
Status: OPEN
Description: Verification-code emails can be spam-triggered and can burn Resend usage.
Files: app/api/send-code/route.ts

---

### PC-SEC13 - Add CAPTCHA to admin login
Status: OPEN
Description: A provider-independent CAPTCHA would reduce brute-force risk even if the DB-backed limiter fails open.
Files: app/api/admin/login/route.ts, app/admin/page.tsx

---

### PC-SEC14 - Admin login requires TOTP
Status: DONE (2026-07-19)
Description: Admin auth now requires the shared password plus a live 6-digit TOTP code. Residual future-scope gaps remain: still one shared admin identity, no sessions, and no per-user audit trail.
Commit: 94459ae
Files: lib/totp.ts, lib/adminRateLimiter.ts, app/api/admin/login/route.ts, app/api/admin/audits/route.ts, app/api/setup/route.ts, app/api/setup/test/route.ts, app/admin/page.tsx

---

### PC-SEC15 - Audit MFA on actual cloud provider accounts
Status: OPEN
Description: Separate from PingClose's own admin login. Check MFA on AWS, Supabase, Vercel, GitHub, and Resend accounts.
Files: Account settings, not repo code

---

### PC-SEC16 - Hard cap on the PageSpeed retry action
Status: DONE (2026-08-01)
Description: The manual "Retry Speed Check" action now has a 30-second cooldown, in-flight guard, and daily per-identity caps so a public retry endpoint cannot burn unlimited PageSpeed calls. The supporting `manual_retry_count` migration was run and verified live.
Commit: 5fb0fc6
Files: app/api/pagespeed-agent/route.ts, app/report/[id]/page.tsx

---

### PC-SEC20 - Retry endpoint trusted a client-supplied URL
Status: DONE (2026-08-02)
Description: `/api/pagespeed-agent` used to trust `url` from the client request instead of the stored report row, letting one caller overwrite another report's scores and burn the original owner's retry quota. Fixed by deriving the URL from the database row, moving the SSRF check to that stored value, removing `url` from the client contract, escaping the failure-alert hostname fallback, and tightening the retry timeout budget so the route stays clear of Vercel's hard cap.
Commit: 5fb0fc6
Files: app/api/pagespeed-agent/route.ts, app/report/[id]/page.tsx, lib/email.ts, lib/agents/pagespeedAgent/fetchPageSpeed.ts

---

## SECTION G - CODE QUALITY
Quality findings from the 2026-07-16 audit that were intentionally deferred.

---

### PC-CQ1 - No centralized design tokens
Status: OPEN
Description: The app still has many hardcoded color values and inconsistent inline styling instead of shared tokens.
Files: App-wide

---

### PC-CQ2 - Emoji used as functional icons
Status: OPEN
Description: Emoji are still serving as the icon system, which conflicts with the stated brand direction.
Files: App-wide

---

### PC-CQ3 - Files exceed the project's own 200-line rule
Status: OPEN
Description: Several core files are far larger than the repo's stated size guideline and should be split intentionally.
Files: app/check/page.tsx, app/HomeClient.tsx, app/faq/FaqClient.tsx, app/admin/page.tsx, app/pricing/page.tsx, lib/email.ts

---

## SECTION H - STRATEGIC DECISIONS
Do not implement these without a dedicated planning session.

---

### PC-STRAT1 - Merge LocalSEOAEOPro into PingClose
Status: DECIDED 2026-08-01 - FUNCTIONAL PORT STILL OPEN
Description: Jim decided PingClose will be the only brand going forward and that LocalSEOAEOPro is being folded into it. The first follow-up shipped immediately: live LocalSEOAEOPro links/copy were removed from PingClose's pricing, report, and FAQ pages. What remains open is the actual feature port: fix-delivery, secure credential intake, fix tracking, city-page generation, and the rest of the LSAP backlog are still not inside PingClose.

---

### PC-STRAT2 - Phone / SMS / voice provider decision
Status: OPEN
Description: Decide between raw AWS infrastructure and OpenPhone/Quo-style business phone tooling. Twilio is permanently excluded. OpenPhone/Quo pricing was checked; webhook/API depth was not yet verified.

---

### PC-FUTURE-2 - Voice calling setup
Status: OPEN - EXPLICITLY DEFERRED
Description: Real voice call routing is future scope after PC-STRAT2. Do not start while phone verification itself is still undecided.
Dependencies: PC-STRAT2

---

# PROJECT 2 - LOCALSEOAEOPRO.COM
Legacy fix-delivery backlog now being folded into PingClose.

---

### LSAP-1 - $495 fix package landing page
Status: OPEN
Description: Build the clear sales page Jim can send customers to after the call.
Files: LocalSEOAEOPro.com

---

### LSAP-2 - Secure WordPress login submission
Status: OPEN
Description: Encrypted form for customer WordPress credentials, with notification to Jim.
Files: LocalSEOAEOPro.com
Dependencies: LSAP-1

---

### LSAP-3 - Jim's fix tracking checklist
Status: OPEN
Description: Checklist of promised fixes that can drive the completion email once everything is done.
Files: LocalSEOAEOPro.com
Dependencies: LSAP-2

---

### LSAP-4 - City Page SuperAgent
Status: OPEN
Description: Generate optimized city pages quickly as part of the upsell path.
Files: LocalSEOAEOPro.com

---

### LSAP-5 - 20 city package offer page
Status: OPEN
Description: Upsell from the free page into a multi-city package once proof exists.
Files: LocalSEOAEOPro.com
Dependencies: LSAP-4

---

### LSAP-6 - Migrate browser client off legacy Supabase anon key
Status: OPEN
Description: Critical shared-infrastructure follow-up from the service_role key leak. LocalSEOAEOPro still depended on the legacy JWT-based browser key path, which blocked clean retirement of the old shared secret pair.
Files: LocalSEOAEOPro Supabase client and related auth wiring

---

# PROJECT 3 - STLPAYPRO
Payment processing platform.

---

*No tasks defined yet. Add tasks here as they are identified.*

---

# PROJECT 4 - ALARMINSPECT.COM
Alarm inspection platform.

---

*No tasks defined yet. Add tasks here as they are identified.*

---

# PROJECT 5 - OTHER / CROSS-PROJECT

---

### OTHER-1 - Customer texting / phone-verification capability
Status: OPEN
Description: Cross-project placeholder for the shared phone/SMS decision. The old AWS-only framing is no longer reliable; the real blocker is provider choice plus 10DLC setup.

---

### OTHER-2 - Google Contacts auto-create on FAIL audit
Status: OPEN
Description: Auto-create a contact with the customer context. Connector availability still needs to exist in the active tool environment.

---

## CARRY-FORWARD OPEN ITEMS

- SELF-HEALING - DataForSEO is done. PageSpeed dual-attempt racing is live, but retry/failure observability is still not fully closed. HTML, Hosting, Preflight, and Resend still need their own self-healing pass.
- OPEN-1 - PageSpeed reliability is now split across PC-C12 and PC-C13. Retry-once logging is live, the dual-attempt race is live, the success path is production-proven, but the both-fail path still lacks real traffic proof and loser-attempt storage is only a proposal.
- OPEN-3 - Daily synthetic-user monitor. The site was broken for days before and no automation caught it.
- OPEN-4 - `passes_one_second` backfill. Rows before 2026-07-09 still need correction.
- PC-TASK-003 - Remove the hardcoded VIP email list carefully; it is now reused both in `send-code` and through `isVIP()` for the server-side verification path.
- PC-FUTURE-1 - Adaptive countdown on the wait screen remains deferred until there is enough real timing data to avoid lying to customers.
- PC-CONNECTOR-1 - The failing `@21st-dev/magic` banner is an app-level connector setting, not a PingClose code issue.
- ALERT FOLLOW-UP - The PageSpeed failure-alert email was logged as attempted during the `citywidealarms.com` timeout investigation, but actual inbox delivery was not independently confirmed.

---

## COMPLETED

| Task | Description | Commit | Date |
|------|-------------|--------|------|
| PC-TASK-C001 | Fix check page blinking | 5b49c0a | 2026-07-03 |
| PC-TASK-C002 | Fix pagespeed-agent Vercel 90s timeout | b61e313, e825fdd | 2026-07-03 |
| PC-TASK-C003 | Add 90s hard stop to PageSpeed polling | ed18a07 | 2026-07-03 |
| PC-TASK-C004 | Redesign report page | 35459df | 2026-07-03 |
| PC-TASK-C005 | Create Master Brain system | - | 2026-07-04 |
| PC-TASK-C006 | Fix RESEND_API_KEY BOM with secret cleaning | 3851b1f | 2026-07-07 |
| PC-TASK-C007 | Fix broken builds around `preflightCheck.ts` | 5f97274 | 2026-07-07 |
| PC-TASK-C008 | Fix emails showing fake 0/100 scores | 29faf32-31576b4 | 2026-07-08 |
| PC-TASK-C009 | Fix speed thresholds: SUPERSTAR / PASS / FAIL | 034784b-eb8d824 | 2026-07-09 |
| PC-TASK-C010 | Sync local repo with GitHub after conflict cleanup | - | 2026-07-12 |
| PC-TASK-C011 | DataForSEO agent: keywords + local SERP + self-healing retry | - | 2026-07-12 |
| PC-TASK-C012 | Add phone field on signup form | 2ad395b | 2026-07-12 |
| PC-TASK-C013 | Jim alert email with clickable phone | ad8b484 | 2026-07-12 |
| PC-TASK-C014 | Security bundle: admin-auth bypass, timing-safe compare, POC removal, SSRF guard, `/api/audit/fast` rate limit | 7779613 | 2026-07-16 |
| PC-TASK-C015 | Enforce email verification server-side in `/api/audit` | cdf4a82 | 2026-07-16 |
| PC-TASK-C016 | Homepage copy reposition, verification helper copy, pricing-page $495 offer, pricing mobile-grid fix | bb844bb | 2026-07-16 |
| PC-TASK-C017 | Sync `projects/pingclose/TASKS.md` with new security, code-quality, and strategy sections | 48dd8e7, 9419927 | 2026-07-16 |
| PC-TASK-C018 | Require TOTP authenticator code alongside admin password | 94459ae | 2026-07-19 |
| PC-TASK-C019 | Add sequential-only Ultra Mode methodology to `CLAUDE.md` (local-only) | 8c21eee | 2026-07-21 |
| PC-TASK-C020 | Report-page polling, send-code/dataforseo/setup hardening, fail-closed limiter decisions, retry caps, and `/api/pagespeed-agent` URL-binding fix | 5fb0fc6 | 2026-08-02 |
| PC-TASK-C021 | Dual-attempt PageSpeed racing, first success wins | 93ccdef | 2026-08-02 |
