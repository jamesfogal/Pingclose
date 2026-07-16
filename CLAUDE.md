@AGENTS.md

# DEBUGGING & DIAGNOSTIC RULES — NON-NEGOTIABLE

## Bot & Agent Size Standards — Non-Negotiable

**Rule 1 — 200 lines max per file.**
Any file over 200 lines is doing too many things. Split it.

**Rule 2 — Max 2 external API calls per file.**
If a file calls more than 2 external APIs, extract an orchestrator.

**Why:** Oversized files are impossible to test individually, hide bugs, and can't be reused. Every well-scoped file in this codebase is under 200 lines. Every problem file is over it.

**ESLint enforces this** — Cursor will underline any file the moment it exceeds 200 lines.

---

## Never Deploy Without Approval

**Rule:** Never run `git push`, `netlify deploy`, `vercel deploy`, or any deployment command without first showing Jim exactly what changed and getting explicit approval.

**Required pre-deploy sequence:**
1. Show the full diff of every file that changed
2. Explain in plain English what each change does and why
3. Wait for Jim to say "yes" or "deploy it"
4. Only then deploy

**Why:** Jim may disagree with the approach even if the code is technically correct. He cannot catch that if it's already live.

**How to apply:** This applies to every project, every deploy, every time. No exceptions for "small" or "obvious" changes.

---

## Never Guess. Always Verify First.

**Rule:** Before suggesting any cause for a bug or failure, Claude MUST read the actual error. No guesses. No theories. No "it might be X."

**Required debug sequence — always in this order:**
1. Add error logging to expose the real error message
2. Read the actual error
3. Fix the confirmed cause

**Never suggest a fix for something that hasn't been confirmed by reading real output.**

**Why:** Jim is not a coder. Every wrong guess costs him time he cannot recover. Tonight it took 3 wrong guesses (Vercel env vars, spend cap, API keys) before a one-line log found the real cause in 30 seconds. That is unacceptable.

**How to apply:** If Claude catches itself saying "it might be", "possibly", "could be", or "likely" about a bug — stop. Go read the actual error first. Then come back with a confirmed answer.

---

## Never Start Any Task Without Permission

**Rule:** Never spawn a background task or agent — for any reason — without first asking and getting an explicit yes. Never run more than one task at a time, under any circumstance. Any task that does run gets a hard 3-4 minute limit; if it isn't done by then, it must be stopped automatically rather than left running.

**Required sequence:**
1. State exactly what task would run and why
2. Wait for Jim's explicit yes
3. Only then launch it — one at a time, never in parallel
4. Set a hard 3-4 minute cap; if it's not finished by then, kill it automatically rather than let it keep running

**Why:** On 2026-07-16, four background agents were launched in parallel without asking first, to validate a new Claude skill. One got stuck for over an hour on a permission prompt that never resolved, burning real tokens (~112k confirmed, more unaccounted for) while locking Jim out of the conversation with no way to intervene or redirect. Jim: "I never want you to run anything without asking. I almost always have questions and you just start doing stuff that I eventually hate."

**How to apply:** This applies to every project, every task, every time. No exceptions for "it's small," "it'll be quick," or "you already said something like this was fine earlier." A prior loosely-worded instruction is never blanket permission to launch a task — ask again, every time, before the launch specifically.

---

# PINGCLOSE.COM — MASTER DESIGN SYSTEM

## Project Purpose

PingClose is not an SEO agency website.

PingClose is a diagnostic platform designed to identify hidden visibility, SEO, AEO, Google Business Profile, authority, and conversion issues.

The primary objective is to create curiosity, expose opportunities, and encourage the visitor to request a deeper analysis.

The website should feel like a premium SaaS diagnostic platform — not a marketing agency website.

## Critical Positioning (Never Violate)

- PingClose FINDS problems. LocalSEOAEOPro FIXES them.
- Never say PingClose fixes anything.
- Never mention PingClose's methodology or internal systems.
- Reveal findings. Hide how the analysis works.

## Above-The-Fold Rules (Non-Negotiable)

NEVER place above the fold:
- Images of any kind
- Videos
- Stock photography
- Decorative illustrations
- Oversized hero sections
- Image sliders
- Background videos

Above-the-fold content must load instantly. The first screen must contain:
- Clear value proposition
- Supporting credibility statement
- Primary CTA
- Secondary CTA
- Strong typography hierarchy
- Lightweight interactive elements only (CSS only)

Performance always takes precedence over decoration.

## Font Size Rule (Non-Negotiable)

No font on any page shall ever be smaller than 16px. No exceptions.
- Body text: 17–18px
- Labels, captions, helper text: 16px minimum
- Headings: 22px+

## Performance Targets (Non-Negotiable)

- Lighthouse 95+ desktop and mobile
- LCP under 1.5 seconds
- Core Web Vitals all green
- Target: under 1 second on mobile 4G
- No heavy JavaScript libraries
- No large animation libraries
- No unnecessary dependencies

## Information Architecture

Every page must follow this structure:
1. Problem
2. Hidden Opportunity
3. Evidence
4. Diagnostic Findings
5. Why Typical Solutions Fail
6. Next Step
7. Call To Action

Remove any section that does not support this flow.

## Conversion Optimization

Every section must answer one of:
- What is wrong?
- Why does it matter?
- How much opportunity is being missed?
- Why should the visitor trust us?
- What should happen next?

Every page must contain:
- Primary CTA
- Secondary CTA
- Proof indicators
- Trust indicators

## Visual Design System

Design inspiration: Linear, Raycast, Vercel

The site must feel: Intelligent · Fast · Technical · Premium · Confident

Avoid: agency-style layouts, marketing clichés, decorative gradients, generic AI visuals

No section may be text-only. Each section must contain at least one visual anchor:
- SEO Scorecards
- Opportunity Meters
- Visibility Scores
- Diagnostic Widgets
- Audit Summaries
- Ranking Indicators
- Comparison Tables
- Interactive Assessments

Visuals must explain information — never decorate.

## Motion (Emil Kowalski Standard)

Allowed:
- Counter animations
- Progress indicators
- Hover interactions
- Smooth transitions
- Section reveals

Never use:
- Parallax
- Floating objects
- Heavy animation libraries
- Excessive movement

Motion must support comprehension, not distract from it.

## Polish Checklist (Run Before Every Final Output)

Review and improve:
- Typography hierarchy
- White space
- Alignment
- Padding consistency
- Layout balance
- Visual rhythm
- CTA prominence

## Executive Design Critic (Run Before Approval)

Ask before finalizing any page:
- How would Stripe improve this?
- How would Linear improve this?
- How would Vercel improve this?

Revise accordingly.

## Messaging Strategy

Show: what was found
Hide: how the proprietary analysis works

Create curiosity while maintaining authority.

## Primary Conversion Goal

The visitor must think:
"These people found problems I didn't know existed."

- Primary CTA: **Request Deep Analysis**
- Secondary CTA: **See Sample Findings**

## Phone & Contact

Jim Fogal · (314) 517-2533 · St. Louis, MO
Closing line: "Ready to hear that phone ring?"

---

# FOGAL'S FIRST LAW OF DEBUGGING

Before proposing any solution, list the five simplest explanations first.

Examples:
- typo / bad input / missing config / permission problem / timeout setting
- stale deployment / cache issue / null data / wrong environment / API limit

Prove or eliminate these first. The probability that the simple explanation is correct must be driven to zero before considering a more complex explanation.

No architecture changes may be proposed until simple explanations are eliminated.

---

# PRE-COMMIT VERIFICATION STANDARD

Every task will be challenged and verified. Do not ask for commit approval until:

1. Change is implemented
2. TypeScript passes (npx tsc --noEmit)
3. Build passes (npm run build)
4. Actual behavior is tested
5. Evidence is collected

Required proof before every commit request:
- Exact files changed
- Exact lines/functions changed
- TypeScript result
- Build result
- Test performed
- Proof the bug is fixed
- Proof existing behavior still works
- What could still fail
- What cannot be proven without deployment

HARD STOP — justify in writing before proceeding if the solution:
- adds a migration or new table
- adds more than 3 files
- adds more than 100 lines of code
- adds a new service
- changes architecture

---

# DATABASE MIGRATION RULE

Never run ALTER TABLE, CREATE TABLE, or any schema change without:
1. Showing the exact SQL first
2. Explaining every column and why it is needed
3. Getting explicit written approval from Jim

No exceptions. Not even for additive, nullable changes.
