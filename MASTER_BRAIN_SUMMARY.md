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

Last Updated: 2026-08-02 23:18:42 UTC (Sessions PC-2026-08-01-001 and PC-2026-08-02-001 incorporated)

---

## Current Production State
Date Added:    2026-07-04 00:00:00 UTC
Last Modified: 2026-08-02 23:18:42 UTC

- Site: https://pingclose.com
- Status: LIVE, with the 2026-08-01 hardening pass and the 2026-08-02 PageSpeed reliability change shipped
- Latest session-confirmed READY deployment: dpl_Aa7jZYjRnRUhRxeiW37RHPENTmim for commit 93ccdef
- Prior same-day READY deployment: dpl_2JXFtjSMCF1NQ5Agfftka8FDsuNw for commit 5fb0fc6
- Admin routes now use one shared, rate-limited auth path and require password plus 6-digit TOTP
- `/api/audit` now enforces server-side email verification; VIP bypass still exists
- `/api/audit`, `/api/audit/fast`, and `/api/send-code` now reject private, loopback, link-local, and cloud-metadata SSRF targets
- `/report/[id]` now polls pending audits instead of freezing on placeholder zeros
- `/api/pagespeed-agent` now derives the scanned URL from the stored report row, not from client input
- PageSpeed now runs two independent attempts in parallel and takes the first success; the success path was live-verified in production on 2026-08-02
- LocalSEOAEOPro references were removed from PingClose's live pricing/report/FAQ surfaces after the single-brand decision, but the actual fix-delivery features are not ported yet
- Highest-impact remaining gaps: phone-only submissions still crash and skip verification, phone verification itself is still unbuilt, and the "see both results" loser-attempt capture is only a proposal
- Shared dependency to remember: PingClose, LocalSEOAEOPro, STLPayPro, and Alarminspect still share one Supabase project

## Current Architecture
Date Added:    2026-07-04 00:00:00 UTC
Last Modified: 2026-08-02 23:18:42 UTC

- Framework: Next.js App Router
- Hosting: Vercel
- Database: Supabase project `xvrhxtnhmnurvxitnijy` shared across multiple businesses
- Email: Resend
- PageSpeed: Google PageSpeed Insights API
- SEO competitor data: DataForSEO
- Admin auth model: shared password plus TOTP through `verifyAdminAuth()`; still no per-user identities or session system
- Verification model: email verification is enforced server-side; phone verification is not built yet
- Wait/report flow: `/check` handles waiting, and `/report/[id]` now polls while PageSpeed is still pending
- PageSpeed flow: `runPageSpeedAgent()` now races two independent attempts and returns the first success; loser-attempt storage is not built

Key files:
- `app/HomeClient.tsx` - homepage form and conversion copy
- `app/api/audit/route.ts` - main audit entry point and server-side email-verification enforcement
- `app/api/audit/fast/route.ts` - fast path with SSRF guard and rate limiting
- `app/api/pagespeed-agent/route.ts` - retry endpoint, manual retry caps, and stored-URL enforcement
- `app/api/send-code/route.ts` and `app/api/verify-code/route.ts` - email verification flow
- `app/api/admin/login/route.ts`, `app/api/admin/audits/route.ts`, `app/api/setup/route.ts`, `app/api/setup/test/route.ts` - shared admin-auth surface
- `lib/adminRateLimiter.ts` - admin auth helper and rate limiting
- `lib/agents/pagespeedAgent/index.ts` and `lib/agents/pagespeedAgent/fetchPageSpeed.ts` - PageSpeed orchestration, retry logging, and dual-attempt race
- `lib/ssrfGuard.ts` - SSRF target rejection
- `lib/totp.ts` - RFC 6238 TOTP verification
- `app/check/page.tsx` - wait-screen UX
- `app/report/[id]/page.tsx` - customer/admin report page; now polling-safe and wired for manual retry
- `projects/pingclose/TASKS.md` - live numbered execution list

## Fixed Issues
Date Added:    2026-07-04 00:00:00 UTC
Last Modified: 2026-08-02 23:18:42 UTC

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
- [2026-08-01] `/report/[id]` permanent-zero bug fixed with polling and graceful give-up behavior (commit 5fb0fc6)
- [2026-08-01] `pagespeed_retry_count` logging shipped and its migration was run and verified live (commit 5fb0fc6)
- [2026-08-01] `/api/send-code` gained rate limiting and an SSRF guard (commit 5fb0fc6)
- [2026-08-01] `/api/dataforseo-keywords` was gated behind an internal shared secret (commit 5fb0fc6)
- [2026-08-01] `/api/setup` now masks secrets and no longer risks overwriting them with masked placeholders (commit 5fb0fc6)
- [2026-08-01] Fail-open versus fail-closed behavior was decided and built: admin login and email-based audit limiting now fail closed, while `/api/audit/fast` deliberately stays fail open (commit 5fb0fc6)
- [2026-08-01] Three Supabase security-advisor findings were closed and re-verified live (commit 5fb0fc6)
- [2026-08-01] LocalSEOAEOPro links/copy were removed from PingClose's live pricing, report, and FAQ surfaces after the single-brand decision (commit 5fb0fc6)
- [2026-08-02] `/api/pagespeed-agent` stopped trusting client-supplied URLs; the same pass fixed an alert-email escaping gap and tightened the retry timeout budget (commit 5fb0fc6)
- [2026-08-02] Dual-attempt PageSpeed racing shipped and was live-verified for the success path (commit 93ccdef)

## Open Issues
Date Added:    2026-07-04 00:00:00 UTC
Last Modified: 2026-08-02 23:18:42 UTC

- [CRITICAL] Phone-only submissions to `/api/audit` still skip verification logic and crash with a 500; the isolated fix remains intentionally held until phone verification is built (PC-SEC11 / PC-E4)
- [HIGH] Mandatory phone verification is still completely unbuilt; OpenPhone/Quo signup plus 10DLC approval remain the real blocker (PC-E4 / PC-STRAT2 / #25)
- [HIGH] The original retry-once logic still has no real forced Google-side failure proof; the newer dual-attempt race lowers failure risk, but its both-fail path is only logically verified by synthetic control-flow tests (PC-C12 / PC-C13)
- [HIGH] The proposed "see both results" migration for loser-attempt storage is unapproved and unbuilt
- [HIGH] If independent PingClose-context proof is still desired, the old leaked service_role key retirement should be re-checked after the shared cross-project migration work
- [MEDIUM] The PageSpeed failure-alert email was logged as attempted, but inbox delivery was not independently confirmed
- [MEDIUM] Cloud-account MFA across AWS, Supabase, Vercel, GitHub, and Resend still requires Jim's manual check (PC-SEC15)
- [MEDIUM] Single-brand direction is decided, but the actual LocalSEOAEOPro fix-delivery and checkout features are not yet ported into PingClose
- [LOW] Daily synthetic-user monitoring, `passes_one_second` backfill, design-token cleanup, emoji removal, file splitting, and homepage/FAQ follow-up work remain open

## Rules Learned
Date Added:    2026-07-04 00:00:00 UTC
Last Modified: 2026-08-02 23:18:42 UTC

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
- Use real historical audit-duration data before changing timeout or retry heuristics
- When an internal endpoint becomes customer-facing, re-audit every trust assumption around its inputs and side effects
- Prefer behavioral verification of production secrets over revealing the secret value in chat or transcripts

## Important Decisions
Date Added:    2026-07-04 00:00:00 UTC
Last Modified: 2026-08-02 23:18:42 UTC

- [2026-07-16] Fix security first; broad design and code-quality cleanup stays deferred
- [2026-07-16] Shared Supabase infrastructure will not be changed unilaterally; the old leaked key's final invalidation depends on LocalSEOAEOPro's migration path
- [2026-07-16] `projects/pingclose/TASKS.md` is the live execution checklist and should mirror current priority order
- [2026-07-19] Admin MFA choice: keep the shared-password model for now, but require TOTP on top of it
- [2026-07-19] Mandatory dual verification (email plus phone) is the target model, but phone verification is still unbuilt
- [2026-07-19] Task numbering in the flat execution list is locked; do not reorder items to "move them up"
- [2026-07-19] Keep the "verify once, trust later" behavior for already-verified contact data; future phone verification should mirror the email flow
- [2026-07-19] Twilio is permanently excluded as the phone/SMS provider
- [2026-08-01] Single-brand direction was decided: LocalSEOAEOPro is being rolled into PingClose; link/copy removal shipped first, but the functional port is still future work
- [2026-08-01] Fail-closed was chosen for admin login and email-based audit limiting; `/api/audit/fast` deliberately stays fail open
- [2026-07-21] "Ultra Mode" exists only as a sequential review methodology inside the main conversation, never as parallel background agents
- [2026-08-02] Do not kill PageSpeed at 45 seconds and restart on instinct; real historical data ruled that out
- [2026-08-02] Parallel dual-attempt PageSpeed racing is the chosen reliability strategy even though it doubles PageSpeed API usage
- [2026-08-02] The "see both results" loser-attempt capture is proposal-only until Jim explicitly approves its migration
- [2026-08-02] Mandatory dual-verification microcopy: "Both are required - we verify each one so your report goes to the right person, and only you."

## Last Deployments
Date Added:    2026-07-04 00:00:00 UTC
Last Modified: 2026-08-02 23:18:42 UTC

- Deployment: dpl_Aa7jZYjRnRUhRxeiW37RHPENTmim | Branch: main | Status: READY | Commit 93ccdef; dual-attempt PageSpeed racing live and success-path re-tested in production on 2026-08-02
- Deployment: dpl_2JXFtjSMCF1NQ5Agfftka8FDsuNw | Branch: main | Status: READY | Commit 5fb0fc6; report-page polling, rate-limit hardening, setup secret masking, and retry-endpoint URL-binding fix shipped on 2026-08-02
- Deployment: dpl_2C9RhkaaRjx4SPiCEfKkB4yMqH7v | Branch: main | Status: READY | Session-confirmed production deployment after security fixes and secret rotation on 2026-07-16
- Deployment: dpl_HEb8qeYriXCDYL2ZiHk1xMJkRUuL | Branch: main | Status when last checked: INITIALIZING | Triggered by commit 94459ae on 2026-07-19; MASTER_BRAIN does not later re-confirm READY

## Last Commits
Date Added:    2026-07-04 00:00:00 UTC
Last Modified: 2026-08-02 23:18:42 UTC

- 93ccdef | 2026-08-02 | Race two independent PageSpeed attempts and take the first success (PC-C13)
- 7ec5c93 | 2026-08-02 | Record the rest of the 2026-08-02 session in `MASTER_BRAIN.md` and update `projects/pingclose/TASKS.md` status
- 5fb0fc6 | 2026-08-02 | Security hardening pass: report-page polling, fail-closed limiter decisions, `/api/send-code` protection, setup secret masking, retry hard caps, and the `/api/pagespeed-agent` URL-binding fix
- d2b8f38 | 2026-08-02 | Append reconstructed 2026-08-01 and full 2026-08-02 session records to `MASTER_BRAIN.md`
- b3df002 | 2026-08-01 | Incorporate the prior Codex summarization pass into `MASTER_BRAIN_SUMMARY.md` and `MASTER_BRAIN_TASKS.md`
- 94459ae | 2026-07-19 | Require TOTP authenticator code alongside admin password
- 8c21eee | 2026-07-21 | Add sequential-only Ultra Mode review methodology to `CLAUDE.md` (local-only, not pushed in the recorded session)

## Things Never To Forget
Date Added:    2026-07-04 00:00:00 UTC
Last Modified: 2026-08-02 23:18:42 UTC

1. PingClose and LocalSEOAEOPro still share one Supabase project; key changes can break both
2. Phone verification still does not exist; phone-only submissions are currently broken and should not be treated as safe or complete
3. The PageSpeed retry endpoint used to trust client-supplied URLs; any future endpoint that becomes customer-facing needs the same trust-boundary audit
4. PC-C13's success path is proven live, but the both-fail behavior has only synthetic/control-flow proof
5. The "see both results" migration is not approved or built
6. OpenPhone/Quo signup plus 10DLC approval is the real blocker for phone verification
7. The latest confirmed READY deployments are dpl_2JXFtjSMCF1NQ5Agfftka8FDsuNw and dpl_Aa7jZYjRnRUhRxeiW37RHPENTmim
8. Single-brand direction is decided, but PingClose still lacks the actual in-house $495 checkout and fix-delivery features
9. MASTER_BRAIN files remain the long-term memory; `projects/pingclose/TASKS.md` is the live execution list
