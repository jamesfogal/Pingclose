# citywideheatingair.com — PingClose client audit notes

Client: Citywide Heating & Air, St. Charles/St. Louis MO HVAC
Site: https://citywideheatingair.com
Report: https://www.pingclose.com/report/04a3f200-16a7-4984-bc1c-2625225b4c18
Access: owned by Jim — WordPress login credentials pending as of 2026-08-11

---

## Confirmed findings (2026-08-11)

### Performance (from PageSpeed report)
- LCP 9.2s / FCP 6.5s vs TTFB 4ms — root cause is render-blocking, not server speed.
- 17 render-blocking scripts/stylesheets, ~10.9s wasted (Gravity Forms CSS, Font Awesome, etc.)
- 30-point mobile/desktop gap (59 vs 89) — same render-blocking root cause, exposed harder on mobile.
- 107KB unused JS, 16KB unused CSS, jQuery loaded (~30KB) — WordPress/plugin bloat.
- No CDN in use — confirmed via headers (`Server: LiteSpeed`, no `cf-ray`/`Server: cloudflare`). Site is not behind Cloudflare or any CDN.
- 1 image (logo PNG) — 13KB recoverable via compression.

### Content gaps
- No FAQ page or FAQ content anywhere on the site — checked full 13-page sitemap + homepage, zero matches.
- No Pricing page anywhere either.
- **Our own audit tool has a false negative**: report says "✗ XML Sitemap" but the site actually has one at the non-default path `/sitemaps.xml` (correctly declared in `robots.txt`). Our sitemap agent only checks the standard `/sitemap.xml` path. Worth fixing in `lib/agents/sitemapAgent/` separately — not a citywideheatingair-specific fix.

### Live bugs found (not on the original report)
- **`/coupons/` page has a placeholder "Test Coupon" live in production** — visible to every real visitor: "This coupon is not valid, just for testing purposes."
- **Lead capture form is completely broken.** The Cloudflare Turnstile captcha widget on the coupons-page contact form never initializes (`iframeFound: false` — no interactive challenge ever renders, confirmed via direct inspection). Console shows: `[Cloudflare Turnstile] Unknown parameter passed to api.js: "?ver=..."` — WordPress's auto-appended cache-busting `?ver=` query string is being passed into Cloudflare's script URL.
  - **Verified by live test submission** (2026-08-11, with Jim's explicit permission): filled and submitted the form with clearly-marked test data (email `citywideheatingair_26-08-11_001@fogal.net`). Result: **zero network requests fired, zero console output — the Submit button is a complete no-op.** No success message, no error message, nothing. Real visitors get no indication anything went wrong; the lead never reaches the business's CRM/email at all.
  - Fix requires WordPress admin access: Gravity Forms → Turnstile integration settings, check sitekey/secret pairing and the site key's registered domain in the Cloudflare Turnstile dashboard, and find/fix whatever is appending `?ver=` onto the Cloudflare script enqueue.

### Above-the-fold cleanup (requested by Jim, not yet audited)
- Jim's read: too much content/images above the fold, contributing to slow load — needs a plan to move things below the fold.
- **Not yet investigated in detail** — next step once WP access exists or as a follow-up audit pass.

---

## Access status
No WordPress admin, FTP/SSH, or DNS/registrar access yet. Jim confirmed PingClose owns this site and can obtain login credentials — pending as of 2026-08-11. Nothing here can be fixed until credentials are in hand.

## Open action items (once access exists)
1. Fix lead-capture form (Turnstile/Gravity Forms) — highest priority, actively losing every lead submitted through it.
2. Remove/replace "Test Coupon" placeholder content.
3. Add LiteSpeed Cache plugin + QUIC.cloud CDN (server already runs LiteSpeed — native fit, no DNS change needed) to address the render-blocking/no-CDN performance findings.
4. Above-the-fold image/content audit and cleanup plan.
5. Build out real FAQ and Pricing pages with correct schema (FAQPage / Offer-PriceSpecification) — content gap, not just a markup fix.
