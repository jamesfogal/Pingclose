# MASTER_BRAIN_SUMMARY - PingClose
## Executive Summary

=================================================
CRITICAL TIMESTAMP RULES
=================================================

1. Everything must be date and timestamped.
2. Use ISO format: YYYY-MM-DD HH:MM:SS UTC
3. Last Updated must be set on every save.
4. Date Added and Last Modified required on every section.
5. Never add undated entries.

---

Last Updated: 2026-07-31 22:39:36 UTC (Sessions PC-2026-07-16-001, PC-2026-07-19-002, and PC-2026-07-21-001 incorporated)

---

## Current Production State
Date Added:    2026-07-04 00:00:00 UTC
Last Modified: 2026-07-31 22:39:36 UTC

- Site: https://pingclose.com
- Status: LIVE, with the major 2026-07-16 and 2026-07-19 security fixes shipped
- Last session-confirmed READY deployment: dpl_2C9RhkaaRjx4SPiCEfKkB4yMqH7v
- Later deployment triggered on 2026-07-19: dpl_HEb8qeYriXCDYL2ZiHk1xMJkRUuL for commit 94459ae; it was INITIALIZING when last checked and was not re-confirmed READY in MASTER_BRAIN
- Admin routes now use one shared, rate-limited auth path and require password plus 6-digit TOTP
- `/api/audit` now enforces server-side email verification; VIP bypass still exists
- `/api/audit` and `/api/audit/fast` now reject private, loopback, link-local, and cloud-metadata SSRF targets
- `/api/audit/fast` now has rate limiting
- Homepage and pricing copy are repositioned around clicks and the $495 offer; the pricing-page mobile two-column bug is fixed
- PingClose was moved onto a new dedicated Supabase secret key after a public leak of the old service_role key
- Highest-impact remaining product bugs: phone-only submissions crash, report page can freeze on permanent zero values, and PageSpeed retry logging/migration is unfinished
- Shared dependency to remember: PingClose, LocalSEOAEOPro, STLPayPro, and Alarminspect still share one Supabase project

## Current Architecture
Date Added:    2026-07-04 00:00:00 UTC
Last Modified: 2026-07-31 22:39:36 UTC

- Framework: Next.js App Router
- Hosting: Vercel
- Database: Supabase project `xvrhxtnhmnurvxitnijy` shared across multiple businesses
- Email: Resend
- PageSpeed: Google PageSpeed Insights API
- SEO competitor data: DataForSEO
- Admin auth model: shared password plus TOTP through `verifyAdminAuth()`; still no per-user identities or session system
- Verification model: email verification is enforced server-side; phone verification is not built yet
- Wait/report flow: `/check` handles waiting, but `/report/[id]` still fetches once and does not poll

Key files:
- `app/HomeClient.tsx` - homepage form and conversion copy
- `app/api/audit/route.ts` - main audit entry point and server-side email-verification enforcement
- `app/api/audit/fast/route.ts` - fast path with SSRF guard and rate limiting
- `app/api/send-code/route.ts` and `app/api/verify-code/route.ts` - email verification flow
- `app/api/admin/login/route.ts`, `app/api/admin/audits/route.ts`, `app/api/setup/route.ts`, `app/api/setup/test/route.ts` - shared admin-auth surface
- `lib/adminRateLimiter.ts` - admin auth helper and rate limiting
- `lib/ssrfGuard.ts` - SSRF target rejection
- `lib/totp.ts` - RFC 6238 TOTP verification
- `app/check/page.tsx` - wait-screen UX
- `app/report/[id]/page.tsx` - customer/admin report page; still needs polling-safe behavior
- `projects/pingclose/TASKS.md` - live numbered execution list

## Fixed Issues
Date Added:    2026-07-04 00:00:00 UTC
Last Modified: 2026-07-31 22:39:36 UTC

- [2026-07-03] Check page blinking fixed; polling now detects DB status change (commit 5b49c0a)
- [2026-07-03] PageSpeed agent timeout raised and polling hard stop added (commits b61e313, e825fdd, ed18a07)
- [2026-07-03] Report page redesign shipped (commit 35459df)
- [2026-07-16] Admin brute-force bypass across four routes closed by consolidating auth into one shared helper (commit 7779613)
- [2026-07-16] Password comparison made timing-safe (commit 7779613)
- [2026-07-16] Unauthenticated `/api/poc/*` routes removed from production (commit 7779613)
- [2026-07-16] SSRF gap closed for `/api/audit` and `/api/audit/fast` with dedicated guard logic (commit 7779613)
- [2026-07-16] Rate limiting added to `/api/audit/fast` (commit 7779613)
- [2026-07-16] Email verification enforced server-side in `/api/audit` (commit cdf4a82)
- [2026-07-16] Homepage H1, helper copy, pricing-page $495 offer, and pricing-page mobile grid fix shipped (commit bb844bb)
- [2026-07-16] Production moved to a new dedicated Supabase secret key and redeployed after the service_role key leak
- [2026-07-19] Admin login upgraded to password plus TOTP across login, audits, setup, and setup/test (commit 94459ae)
- [2026-07-21] Sequential-only "Ultra Mode" review process documented in `CLAUDE.md` for future large reviews (commit 8c21eee, local-only)

## Open Issues
Date Added:    2026-07-04 00:00:00 UTC
Last Modified: 2026-07-31 22:39:36 UTC

- [CRITICAL] Phone-only submissions to `/api/audit` both skip verification logic and crash with a 500; fix was deliberately deferred until phone verification is designed and built (PC-SEC11 / PC-E4)
- [CRITICAL] `/report/[id]` can show permanent zero and placeholder values if opened before PageSpeed finishes (PC-C11)
- [HIGH] PageSpeed retry logic is coded but untested; retry-count migration still awaits explicit approval (PC-C12)
- [HIGH] `/api/send-code` has no rate limit (PC-SEC12)
- [HIGH] `/api/dataforseo-keywords` is still public and can spend money per call (PC-SEC7)
- [HIGH] Mandatory phone verification is not built; provider choice and workflow remain open (PC-E4 / PC-STRAT2)
- [HIGH] The old leaked service_role key closure remained a sensitive cross-project follow-up because full invalidation depended on LocalSEOAEOPro's legacy-key migration and later PingClose sessions did not independently re-verify the final state
- [MEDIUM] Fail-open versus fail-closed behavior is still unresolved for several security checks (PC-SEC9)
- [MEDIUM] `/api/setup` still returns the raw Resend key to an authenticated admin unless it is masked (PC-SEC8)
- [MEDIUM] Supabase security-advisor findings were identified but not fully investigated
- [MEDIUM] Admin CAPTCHA and cloud-account MFA audit were both left open (PC-SEC13 / PC-SEC15)
- [LOW] Design-token cleanup, emoji-icon replacement, oversized-file splits, and homepage/FAQ design follow-ups remain unstarted

## Rules Learned
Date Added:    2026-07-04 00:00:00 UTC
Last Modified: 2026-07-31 22:39:36 UTC

- Verify security and production claims against actual code, logs, tests, or live behavior; do not infer
- Security-sensitive work takes precedence over design cleanup when trust-boundary bugs are open
- Never start any task or background agent without explicit permission in a separate turn
- Never run more than one task in parallel; large reviews are sequential only
- Any spawned task should be time-boxed to roughly 3-4 minutes
- Do not use Windows 8.3 short-name paths for scratch or test work
- Do not pretend a requested tool or connector exists; disclose the gap plainly
- Never commit, push, deploy, rotate secrets, or run migrations without explicit approval
- Treat every shared Supabase or Vercel change as potentially cross-project
- Paths and URLs in future responses should be clickable markdown links

## Important Decisions
Date Added:    2026-07-04 00:00:00 UTC
Last Modified: 2026-07-31 22:39:36 UTC

- [2026-07-16] Fix security first; broad design and code-quality cleanup stays deferred
- [2026-07-16] Shared Supabase infrastructure will not be changed unilaterally; the old leaked key's final invalidation depends on LocalSEOAEOPro's migration path
- [2026-07-16] `projects/pingclose/TASKS.md` is the live execution checklist and should mirror current priority order
- [2026-07-19] Admin MFA choice: keep the shared-password model for now, but require TOTP on top of it
- [2026-07-19] Mandatory dual verification (email plus phone) is the target model, but phone verification is still unbuilt
- [2026-07-19] Task numbering in the flat execution list is locked; do not reorder items to "move them up"
- [2026-07-19] Keep the "verify once, trust later" behavior for already-verified contact data; future phone verification should mirror the email flow
- [2026-07-19] Twilio is permanently excluded as the phone/SMS provider
- [2026-07-16] Merge of LocalSEOAEOPro into PingClose is a strategic planning decision, not an active implementation task
- [2026-07-21] "Ultra Mode" exists only as a sequential review methodology inside the main conversation, never as parallel background agents

## Last Deployments
Date Added:    2026-07-04 00:00:00 UTC
Last Modified: 2026-07-31 22:39:36 UTC

- Deployment: dpl_2C9RhkaaRjx4SPiCEfKkB4yMqH7v | Branch: main | Status: READY | Session-confirmed production deployment after security fixes and secret rotation on 2026-07-16
- Deployment: dpl_HEb8qeYriXCDYL2ZiHk1xMJkRUuL | Branch: main | Status when last checked: INITIALIZING | Triggered by commit 94459ae on 2026-07-19; MASTER_BRAIN does not later re-confirm READY
- Recorded later push in the 2026-07-19 / 2026-07-21 conversation tail: `94459ae..41090da` | Result: push recorded as successful, but deployment state from that later push was not independently re-verified in the summarized sessions

## Last Commits
Date Added:    2026-07-04 00:00:00 UTC
Last Modified: 2026-07-31 22:39:36 UTC

- 7779613 | 2026-07-16 | Close admin brute-force bypass, timing-safe compare, remove POC routes, add SSRF guard, rate-limit `/api/audit/fast`
- cdf4a82 | 2026-07-16 | Enforce email verification server-side in `/api/audit`
- bb844bb | 2026-07-16 | Reposition homepage/pricing copy around clicks and $495; fix pricing mobile grid
- 48dd8e7 | 2026-07-16 | Sync `projects/pingclose/TASKS.md` and add security/code-quality/strategy tracking
- 9419927 | 2026-07-16 | Follow-up `TASKS.md` sync after later session updates
- 94459ae | 2026-07-19 | Require TOTP authenticator code alongside admin password
- a1dd790 | 2026-07-19 | Update `TASKS.md` with #9 deploy note, #10 root cause, and #25/#37 sequencing decision
- 8c21eee | 2026-07-21 | Add sequential-only Ultra Mode review methodology to `CLAUDE.md` (local-only, not pushed in the recorded session)

## Things Never To Forget
Date Added:    2026-07-04 00:00:00 UTC
Last Modified: 2026-07-31 22:39:36 UTC

1. PingClose and LocalSEOAEOPro still share one Supabase project; key changes can break both
2. The old Supabase service_role key was publicly leaked once; every rotation, revocation, and re-test step must be treated as high stakes
3. Phone verification does not exist yet; phone-only submissions are currently broken and should not be treated as safe or complete
4. The report page can freeze on permanent zeros if opened too early; `/check` and `/report` must be fixed together
5. `/api/send-code` and `/api/dataforseo-keywords` still expose real abuse or cost risk
6. The latest MASTER_BRAIN entry does not independently re-confirm READY for deployment dpl_HEb8qeYriXCDYL2ZiHk1xMJkRUuL
7. Admin auth is materially better now, but it is still one shared admin identity rather than full user/session management
8. MASTER_BRAIN files remain the long-term memory; `projects/pingclose/TASKS.md` is the live execution list
