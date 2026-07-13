# SUMMARY BODY 01

Source file: `
C:\Projects\pingclose\CLAUDE.md
`
Source lines: `
1
-
180
`
Preservation mode: line-preserved original content

## Preserved body

   1: @AGENTS.md
   2: 
   3: # DEBUGGING & DIAGNOSTIC RULES — NON-NEGOTIABLE
   4: 
   5: ## Bot & Agent Size Standards — Non-Negotiable
   6: 
   7: **Rule 1 — 200 lines max per file.**
   8: Any file over 200 lines is doing too many things. Split it.
   9: 
  10: **Rule 2 — Max 2 external API calls per file.**
  11: If a file calls more than 2 external APIs, extract an orchestrator.
  12: 
  13: **Why:** Oversized files are impossible to test individually, hide bugs, and can't be reused. Every well-scoped file in this codebase is under 200 lines. Every problem file is over it.
  14: 
  15: **ESLint enforces this** — Cursor will underline any file the moment it exceeds 200 lines.
  16: 
  17: ---
  18: 
  19: ## Never Deploy Without Approval
  20: 
  21: **Rule:** Never run `git push`, `netlify deploy`, `vercel deploy`, or any deployment command without first showing Jim exactly what changed and getting explicit approval.
  22: 
  23: **Required pre-deploy sequence:**
  24: 1. Show the full diff of every file that changed
  25: 2. Explain in plain English what each change does and why
  26: 3. Wait for Jim to say "yes" or "deploy it"
  27: 4. Only then deploy
  28: 
  29: **Why:** Jim may disagree with the approach even if the code is technically correct. He cannot catch that if it's already live.
  30: 
  31: **How to apply:** This applies to every project, every deploy, every time. No exceptions for "small" or "obvious" changes.
  32: 
  33: ---
  34: 
  35: ## Never Guess. Always Verify First.
  36: 
  37: **Rule:** Before suggesting any cause for a bug or failure, Claude MUST read the actual error. No guesses. No theories. No "it might be X."
  38: 
  39: **Required debug sequence — always in this order:**
  40: 1. Add error logging to expose the real error message
  41: 2. Read the actual error
  42: 3. Fix the confirmed cause
  43: 
  44: **Never suggest a fix for something that hasn't been confirmed by reading real output.**
  45: 
  46: **Why:** Jim is not a coder. Every wrong guess costs him time he cannot recover. Tonight it took 3 wrong guesses (Vercel env vars, spend cap, API keys) before a one-line log found the real cause in 30 seconds. That is unacceptable.
  47: 
  48: **How to apply:** If Claude catches itself saying "it might be", "possibly", "could be", or "likely" about a bug — stop. Go read the actual error first. Then come back with a confirmed answer.
  49: 
  50: ---
  51: 
  52: # PINGCLOSE.COM — MASTER DESIGN SYSTEM
  53: 
  54: ## Project Purpose
  55: 
  56: PingClose is not an SEO agency website.
  57: 
  58: PingClose is a diagnostic platform designed to identify hidden visibility, SEO, AEO, Google Business Profile, authority, and conversion issues.
  59: 
  60: The primary objective is to create curiosity, expose opportunities, and encourage the visitor to request a deeper analysis.
  61: 
  62: The website should feel like a premium SaaS diagnostic platform — not a marketing agency website.
  63: 
  64: ## Critical Positioning (Never Violate)
  65: 
  66: - PingClose FINDS problems. LocalSEOAEOPro FIXES them.
  67: - Never say PingClose fixes anything.
  68: - Never mention PingClose's methodology or internal systems.
  69: - Reveal findings. Hide how the analysis works.
  70: 
  71: ## Above-The-Fold Rules (Non-Negotiable)
  72: 
  73: NEVER place above the fold:
  74: - Images of any kind
  75: - Videos
  76: - Stock photography
  77: - Decorative illustrations
  78: - Oversized hero sections
  79: - Image sliders
  80: - Background videos
  81: 
  82: Above-the-fold content must load instantly. The first screen must contain:
  83: - Clear value proposition
  84: - Supporting credibility statement
  85: - Primary CTA
  86: - Secondary CTA
  87: - Strong typography hierarchy
  88: - Lightweight interactive elements only (CSS only)
  89: 
  90: Performance always takes precedence over decoration.
  91: 
  92: ## Font Size Rule (Non-Negotiable)
  93: 
  94: No font on any page shall ever be smaller than 16px. No exceptions.
  95: - Body text: 17–18px
  96: - Labels, captions, helper text: 16px minimum
  97: - Headings: 22px+
  98: 
  99: ## Performance Targets (Non-Negotiable)
 100: 
 101: - Lighthouse 95+ desktop and mobile
 102: - LCP under 1.5 seconds
 103: - Core Web Vitals all green
 104: - Target: under 1 second on mobile 4G
 105: - No heavy JavaScript libraries
 106: - No large animation libraries
 107: - No unnecessary dependencies
 108: 
 109: ## Information Architecture
 110: 
 111: Every page must follow this structure:
 112: 1. Problem
 113: 2. Hidden Opportunity
 114: 3. Evidence
 115: 4. Diagnostic Findings
 116: 5. Why Typical Solutions Fail
 117: 6. Next Step
 118: 7. Call To Action
 119: 
 120: Remove any section that does not support this flow.
 121: 
 122: ## Conversion Optimization
 123: 
 124: Every section must answer one of:
 125: - What is wrong?
 126: - Why does it matter?
 127: - How much opportunity is being missed?
 128: - Why should the visitor trust us?
 129: - What should happen next?
 130: 
 131: Every page must contain:
 132: - Primary CTA
 133: - Secondary CTA
 134: - Proof indicators
 135: - Trust indicators
 136: 
 137: ## Visual Design System
 138: 
 139: Design inspiration: Linear, Raycast, Vercel
 140: 
 141: The site must feel: Intelligent · Fast · Technical · Premium · Confident
 142: 
 143: Avoid: agency-style layouts, marketing clichés, decorative gradients, generic AI visuals
 144: 
 145: No section may be text-only. Each section must contain at least one visual anchor:
 146: - SEO Scorecards
 147: - Opportunity Meters
 148: - Visibility Scores
 149: - Diagnostic Widgets
 150: - Audit Summaries
 151: - Ranking Indicators
 152: - Comparison Tables
 153: - Interactive Assessments
 154: 
 155: Visuals must explain information — never decorate.
 156: 
 157: ## Motion (Emil Kowalski Standard)
 158: 
 159: Allowed:
 160: - Counter animations
 161: - Progress indicators
 162: - Hover interactions
 163: - Smooth transitions
 164: - Section reveals
 165: 
 166: Never use:
 167: - Parallax
 168: - Floating objects
 169: - Heavy animation libraries
 170: - Excessive movement
 171: 
 172: Motion must support comprehension, not distract from it.
 173: 
 174: ## Polish Checklist (Run Before Every Final Output)
 175: 
 176: Review and improve:
 177: - Typography hierarchy
 178: - White space
 179: - Alignment
 180: - Padding consistency
