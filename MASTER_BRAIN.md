# MASTER BRAIN — Jim Fogal / All Projects
Last Updated: 2026-07-12

---

## Who Jim Is
Jim Fogal · St. Louis, MO · (314) 517-2533 · james.fogal@gmail.com
Owner: PingClose.com, LocalSEOAEOPro.com, STLPayPro, AlarmInspect.com, CityWide Alarms
Not a coder. Every wrong guess costs him time he cannot recover.

---

## The Business Model
1. PingClose runs a free diagnostic - finds problems - creates urgency
2. Jim gets an instant alert - calls within 2 minutes - closes $495 sale
3. LocalSEOAEOPro fixes everything on the report - 72 hours - customer is thrilled
4. Customer gets free city page - sees results - buys 20-page package at $3,000
5. Repeat

First $495 sale confirmed 2026-07-11. Jim closed it by calling within 2 minutes of a FAIL report.

---

## Critical Positioning
- PingClose FINDS problems. LocalSEOAEOPro FIXES them.
- Never say PingClose fixes anything.
- Never mention PingClose methodology or internal systems.
- Reveal findings. Hide how the analysis works.
- The visitor must think: "These people found problems I didn't know existed."

---

## Jim Laws — NON-NEGOTIABLE

### Law 1 — Never deploy without approval
Show full diff of every changed file. Explain in plain English what each change does. Wait for Jim to say yes. Only then deploy.

### Law 2 — Never guess. Read the real error first.
Add logging, read the actual error, fix the confirmed cause.
Never say "it might be" or "possibly" or "could be" about a bug. Go read the error first.

### Law 3 — Fogal Rule
Before proposing any solution, list the 5 simplest explanations first:
typo / bad input / missing config / permission problem / timeout / stale deployment / cache / null data / wrong environment / API limit.
Prove or eliminate these before considering complex explanations.
No architecture changes until simple explanations are eliminated.

### Law 4 — Never run database migrations without approval
Show exact SQL. Explain every column. Get explicit written yes. No exceptions.

### Law 5 — Pre-commit standard
Every commit requires: TypeScript passes, build passes, actual behavior tested, evidence collected.
Required proof: exact files changed, exact lines changed, TS result, build result, test performed, bug fix proven, existing behavior still works, what could still fail.

### Law 6 — 200 lines max per file
Any file over 200 lines is doing too many things. Split it.

### Law 7 — Max 2 external API calls per file
If a file calls more than 2 external APIs, extract an orchestrator.

### Law 8 — All agents must be self-healing
Every agent calling an external API must catch failures, log the reason, retry once, and report back success or failure.

### Law 9 — Never build a feature that does not fully work end-to-end
Adding features that do not work is a no-no.

### Law 10 — Announce before acting
State exact intent before every action. Get explicit approval before anything that affects production.

---

## Design System

### Inspiration
Linear · Raycast · Vercel
Feel: Intelligent · Fast · Technical · Premium · Confident

### Motion Standard (Emil Kowalski)
Allowed: counter animations, progress indicators, hover interactions, smooth transitions, section reveals
Never: parallax, floating objects, heavy animation libraries, excessive movement
Motion must support comprehension, not distract.

### Above the Fold Rules
NEVER place above the fold: images, videos, stock photography, decorative illustrations, oversized hero sections, image sliders, background videos.
Must load instantly. Must contain: clear value proposition, credibility statement, primary CTA, secondary CTA, strong typography hierarchy, lightweight interactive elements only.

### Font Size Rule
No font smaller than 16px. Ever.
Body: 17-18px. Labels/captions: 16px min. Headings: 22px+.

### Performance Targets
Lighthouse 95+ desktop and mobile. LCP under 1.5s. Core Web Vitals all green.

### Colors
Background: #0B0E16
Card: #0D1528
Border: #1E3050
Accent: #10D9A0 (green)
Text primary: #F1F5F9
Text secondary: #94A3B8
Text muted: #64748B
Error: #F87171

---

## Infrastructure
- Vercel Pro — 90s max function duration on all API routes
- Supabase — localseoaeopro project (shared, never split)
- Resend — email delivery
- DataForSEO — keyword research + local SERP (james.fogal@citywidealarms.com)
- Amazon SNS — SMS (sandbox exit pending 2026-07-12)

---

## Session Start Protocol
When starting any session, read in this order:
1. MASTER_BRAIN.md (this file)
2. projects/[active-project]/SUMMARY.md
3. projects/[active-project]/TASKS.md
Never read another project files unless Jim explicitly says to.

---

## Cross-Project Rule
If something is discussed about a different project during a session, it goes into that project own TASKS.md and SUMMARY.md immediately. Never buried in another project notes.
