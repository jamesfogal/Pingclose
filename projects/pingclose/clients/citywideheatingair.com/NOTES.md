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
- **No page cache running — confirmed via direct header check (2026-08-11), not in the original report.** The HTML page itself sends `Cache-Control: public, max-age=0` — every single visit forces WordPress to regenerate the page fresh, live, with no page-level cache in front of it. This is distinct from asset caching: CSS/JS/the logo image all correctly cache for a full year (`Cache-Control: public` + `Expires` ~1 year out, using WordPress's `?ver=` cache-busting pattern) — those are fine. Only the HTML document itself has zero caching.
  - **Why PingClose's tool didn't flag this (confirmed, not guessed):** pulled the raw Lighthouse data straight from Supabase (`pingclose_audits.full_report`, report `04a3f200-16a7-4984-bc1c-2625225b4c18`). The `cache-insight` audit scored a perfect `1`, zero items, `wastedBytes: 0` — genuinely clean. Lighthouse's "efficient cache lifetimes" audit only evaluates sub-resources (scripts/styles/images/fonts), not the main HTML document itself — that's normal Lighthouse behavior, not a PingClose bug. Since this site's sub-resources really are cached correctly, the existing check correctly found nothing wrong. **The gap I found by hand (no page-level cache) is a real thing that neither Lighthouse nor PingClose's current `noBrowserCaching` check evaluates at all** — different from the citywidealarms.com caching issue (#0081 in TASKS.md), which *was* a sub-resource caching problem and correctly caught by this same check. Logged as a new product gap, see #0099 in TASKS.md.

### Content gaps
- No FAQ page or FAQ content anywhere on the site — checked full 13-page sitemap + homepage, zero matches.
- No Pricing page anywhere either.
- **Our own audit tool has a false negative**: report says "✗ XML Sitemap" but the site actually has one at the non-default path `/sitemaps.xml` (correctly declared in `robots.txt`). Our sitemap agent only checks the standard `/sitemap.xml` path. Worth fixing in `lib/agents/sitemapAgent/` separately — not a citywideheatingair-specific fix.

### Live bugs found (not on the original report)
- **`/coupons/` page has a placeholder "Test Coupon" live in production** — visible to every real visitor: "This coupon is not valid, just for testing purposes."
- **Lead capture form is completely broken.** The Cloudflare Turnstile captcha widget on the coupons-page contact form never initializes (`iframeFound: false` — no interactive challenge ever renders, confirmed via direct inspection). Console shows: `[Cloudflare Turnstile] Unknown parameter passed to api.js: "?ver=..."` — WordPress's auto-appended cache-busting `?ver=` query string is being passed into Cloudflare's script URL.
  - **Verified by live test submission** (2026-08-11, with Jim's explicit permission): filled and submitted the form with clearly-marked test data (email `citywideheatingair_26-08-11_001@fogal.net`). Result: **zero network requests fired, zero console output — the Submit button is a complete no-op.** No success message, no error message, nothing. Real visitors get no indication anything went wrong; the lead never reaches the business's CRM/email at all.
  - Fix requires WordPress admin access: Gravity Forms → Turnstile integration settings, check sitekey/secret pairing and the site key's registered domain in the Cloudflare Turnstile dashboard, and find/fix whatever is appending `?ver=` onto the Cloudflare script enqueue.
  - **Escalation (2026-08-11): the same broken form is embedded in the homepage hero too**, not just `/coupons/`. Confirmed identical Turnstile `data-sitekey="0x4AAAAAABm7inzwZLqOu8kC"` on both. One bug, two placements — the homepage hero is the more important of the two.

### Above-the-fold cleanup — audited 2026-08-11
Jim's initial read was "too many pictures." Actually confirmed the opposite: zero `<img>` tags and zero CSS background-images above the fold on mobile (375x812 viewport) — matches the original report's site-wide count of only 2 images total, anywhere on the site. The real bloat is structural, verified live via DOM/computed-style inspection, not guessed:
1. **Visible nav menu eats 173px** — about 19% of the mobile viewport — before any hero content. Two other `<nav>` variants are correctly hidden (`display:none` / `visibility:hidden` for the off-canvas drawer); a third renders inline (`display:block`, `visibility:visible`, 10 links) and is what's actually consuming the space.
2. **A complete 5-field contact form ships inside the hero itself** — First/Last/Phone/Email/Message + Submit, full markup, immediately below the H1/CTA — not a lightweight prompt.
3. That embedded form is the same broken-Turnstile form from the bug above.

No-CDN (already listed above) is a real but *separate* contributing factor to the same 9.2s LCP — it's about asset delivery speed, not how much markup has to be built before paint. Both matter; neither explains the other.

**Recommendation once WP access exists:** replace the embedded hero form with a single lightweight CTA button — cuts real above-the-fold weight and removes a redundant instance of the broken form from the page that matters most. Fix the Turnstile bug once; it's the same instance reused sitewide.

---

## Access status
No WordPress admin, FTP/SSH, or DNS/registrar access yet. Jim confirmed PingClose owns this site and can obtain login credentials — pending as of 2026-08-11. Nothing here can be fixed until credentials are in hand.

## Open action items (once access exists)
1. Fix lead-capture form (Turnstile/Gravity Forms) — highest priority, one bug present on both the homepage hero and `/coupons/`, actively losing every lead submitted through either.
2. Remove/replace "Test Coupon" placeholder content.
3. Add LiteSpeed Cache plugin + QUIC.cloud CDN (server already runs LiteSpeed — native fit, no DNS change needed) to address the render-blocking/no-CDN performance findings.
4. Replace the hero's embedded full contact form with a single lightweight CTA button, and trim/verify the 173px visible nav on mobile — above-the-fold cleanup, audit complete, plan above.
5. Build out real FAQ and Pricing pages with correct schema (FAQPage / Offer-PriceSpecification) — content gap, not just a markup fix.
