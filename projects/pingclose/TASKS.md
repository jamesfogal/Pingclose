# PINGCLOSE.COM — TASK BRAIN
Diagnostic platform. Finds problems. Never fixes them.
Never say PingClose fixes anything. Never mention methodology.

Last Updated: 2026-07-12
Status: LIVE — first $495 sale confirmed 2026-07-11

---

## SECTION A — FRONT PAGE

### PC-A1 — Homepage design overhaul
Status: OPEN
Description: Redesign homepage layout. Desktop: two columns — left has H1 + form + trust signals, right has CSS diagnostic art / sample score widget. Mobile: full width, stacked, wider padding. Every line of content needs more substance. Cleaner typography hierarchy. Emil Kowalski motion standard: counter animations on stats, scroll-triggered reveals, hover micro-transitions. Matches Linear/Vercel aesthetic.
Files: app/HomeClient.tsx, app/page.tsx

---

### PC-A2 — New H1 — keyword-driven, search-intent first
Status: OPEN
Description: Replace "Want the Fastest Website on the Block?" with a keyword-driven H1 that meets searchers where they are. Must be above the fold, largest text on page, no images above fold. City-aware version in PC-A6.
Files: app/HomeClient.tsx

---

### PC-A3 — CSS diagnostic art / above-fold visual anchor
Status: OPEN
Description: Replace empty right column with CSS-only animated diagnostic widget. Shows a fake-but-realistic audit running: score ticking up, checks appearing one by one (Speed ✓, Schema ✓, Mobile ✓). No images, no heavy JS. Pure CSS animation. Communicates "this tool is alive and smart" instantly.
Files: app/HomeClient.tsx

---

### PC-A4 — Phone field label fix
Status: OPEN
Description: Change "Get a call back within minutes" — Jim said this stops 25% of signups. Replace with something optional and benefit-focused. Candidate: "Cell phone (we'll text you your results)."
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

## SECTION B — CHECK PAGE

### PC-B1 — Check page content and design review
Status: OPEN
Description: Review current check page. Add: list of what is being checked (74 signals), estimated time remaining, trust signals. Ensure no blinking or layout shift while results load.
Files: app/check/page.tsx

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

## CARRY-FORWARD OPEN ITEMS

- **SELF-HEALING** — All agents must be self-healing. DataForSEO: DONE ✅. Still needed: PageSpeed, HTML, Hosting, Preflight, Resend.
- **OPEN-1** — PageSpeed API auto-retry on 429/error. Target <0.1% audit failure rate.
- **OPEN-3** — Daily synthetic-user monitor. Site was broken for a week and nobody knew.
- **OPEN-4** — passes_one_second DB backfill. All rows before 2026-07-09 have wrong values.
- **PC-TASK-003** — Remove VIP_EMAILS hardcoded list from send-code/route.ts.

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
