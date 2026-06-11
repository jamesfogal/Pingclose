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
