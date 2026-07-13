# SUMMARY BODY 01

Source file: `
C:\Projects\pingclose\JUNE22_NOTES.md
`
Source lines: `
1
-
71
`
Preservation mode: line-preserved original content

## Preserved body

   1: # June 22, 2026 — Session Notes (PingClose Launch Readiness)
   2: 
   3: ---
   4: 
   5: ## What Was Done This Session
   6: 
   7: ### Full evidence-based launch readiness audit
   8: Ran a Proven Working / Proven Broken / Not Tested audit across every PingClose page, API route, integration, form, and automation. Method: live HTTP tests against pingclose.com, MCP-authenticated fetches against the Vercel deployment, direct Supabase queries (schema, RLS, advisors), Vercel project/deployment metadata, and full source reads of every API route and lib file.
   9: 
  10: ### Critical finding — confirmed with hard evidence
  11: **`pingclose.com` is still served by Netlify, not Vercel.** DNS nameservers are still `registrar-servers.com` (Namecheap), apex A record still `75.2.60.5` (Netlify), `www` CNAME still `pingclose.netlify.app`. Live site is a stale cached build from 2026-06-15 — predates the June 16 fixes (load-time hero, H1 split, pricing removal) and the June 22 Husky/cleanup work entirely.
  12: 
  13: **Separately, the Vercel deployment itself has Deployment Protection (Vercel SSO) enabled on every route** — confirmed via direct curl returning Vercel's own login wall on the homepage and all API routes. Even after DNS is fixed, the public cannot reach the Vercel-hosted app until this is turned off for Production.
  14: 
  15: Vercel build health: clean. Latest deployment `dpl_86p256vV7955uKj8rWPXbxdpP3gK`, commit `035175f` (latest repo commit), state READY, 20/20 recent deployments READY — no failed builds in history.
  16: 
  17: ### Other confirmed findings (full detail in prior session transcript)
  18: - Supabase: `pingclose_audits` (33 real rows), `email_verifications` (6 rows), `platform_config` (1 row) — all RLS-enabled correctly, schema matches code exactly
  19: - H1 typo claim from JUNE16_NOTES.md is **stale/false** — current code (and even the old Netlify build) renders the headline correctly, no typo
  20: - No rate limiting on `/api/admin/login` or `x-admin-password` checks — brute-forceable
  21: - Twilio (SMS) env vars never even documented in `.env.local.example` — feature was never configured, fails silently
  22: - Email/SMS delivery failures are swallowed by `Promise.allSettled` — never surfaced to user or alerting
  23: - `x-robots-tag: noindex` served on every Vercel route — side effect of Deployment Protection being on
  24: 
  25: ### Ranked fix plan (proposed, nothing executed)
  26: **Phase 1 (30 min):** Disable Vercel Deployment Protection for Production → Switch Namecheap DNS to Vercel
  27: **Phase 2 (45 min):** Verify noindex clears, confirm/rotate PAGESPEED_API_KEY, resolve Resend key ambiguity
  28: **Phase 3 (2h):** Add rate limiting to admin auth endpoints
  29: **Phase 4 (2h):** Hide SMS option in UI until Twilio is real; surface delivery failures instead of swallowing them
  30: **Phase 5 (15 min):** Read `/api/report` (not yet reviewed)
  31: Total bounded work: ~5.85 hours.
  32: 
  33: ### Exact DNS change plan (prepared, NOT executed)
  34: | Record | Type | Current | Proposed New |
  35: |---|---|---|---|
  36: | `pingclose.com` (apex) | A | `75.2.60.5` (Netlify) | `76.76.21.21` (Vercel generic — must confirm exact value once domain is added in Vercel dashboard) |
  37: | `www.pingclose.com` | CNAME | `pingclose.netlify.app` | `cname.vercel-dns.com` (same caveat) |
  38: | MX (priority 1) | — | `aspmx.l.google.com` | **DO NOT TOUCH** — Google Workspace email |
  39: | TXT | — | `google-site-verification=0H8JiYClpHek66iIWb8UBynliat639o9oab1npwSrCk` | **DO NOT TOUCH** — Search Console verification |
  40: 
  41: Rollback plan: revert apex A to `75.2.60.5`, CNAME to `pingclose.netlify.app`. Check/lower TTL in Namecheap before cutover to make rollback fast.
  42: 
  43: ---
  44: 
  45: ## BLOCKED — Vercel Account Lockout
  46: 
  47: Jim is locked out of his Vercel account. Every self-service 2FA recovery path was tried and dead-ended:
  48: 1. Authenticator app (Microsoft Authenticator) — codes rejected
  49: 2. QR code — phone's native camera can't read `otpauth://` QR codes (expected; needs to be scanned from inside an authenticator app, not the camera app) — tried, still ended up rejected/looped
  50: 3. Passkey / security key — "no passkeys on this device," Windows Security passkey prompt fails with "Something went wrong"
  51: 4. Recovery code — does not have one saved anywhere
  52: 5. "Log in with GitHub" — tried, did not work (exact failure mode not captured — Jim was too tired to detail it)
  53: 6. Incognito/different browser — not yet confirmed whether this was actually tried before stopping for the night
  54: 
  55: **Next session must start with:** Vercel Support account recovery (vercel.com/help → account lockout / can't access 2FA). This requires Jim to verify his identity directly with Vercel — not something that can be done on his behalf. This is the hard blocker on everything else in this plan (domain can't be added, Deployment Protection can't be toggled, exact DNS records can't be confirmed) until account access is restored.
  56: 
  57: ---
  58: 
  59: ## What Needs to Happen Next Session
  60: 
  61: 1. **First: Vercel account recovery.** Try vercel.com/help support flow for 2FA lockout. If incognito/different browser wasn't actually confirmed tried, try that first as a 30-second sanity check.
  62: 2. Once logged in: add `pingclose.com` domain in Vercel project Settings → Domains, capture the exact DNS records Vercel generates
  63: 3. Disable Deployment Protection for Production environment
  64: 4. Prepare and confirm before executing: Namecheap DNS change (table above), preserving MX and TXT records exactly
  65: 5. Execute DNS change, monitor, verify `noindex` clears and site is publicly reachable
  66: 6. Then proceed down the ranked fix list (admin rate limiting, Twilio/SMS UI gating, delivery failure surfacing, etc.)
  67: 
  68: ---
  69: 
  70: *File created: June 22, 2026, end of session — Jim went to bed mid-Vercel-lockout-troubleshooting.*
  71: *Nothing was changed on Vercel, Namecheap, or in the PingClose codebase this session — audit and planning only.*
