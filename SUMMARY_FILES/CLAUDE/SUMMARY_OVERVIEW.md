# SUMMARY OVERVIEW

Source file: `C:\Projects\pingclose\CLAUDE.md`
Summary pack folder: `C:\Projects\pingclose\SUMMARY_FILES\CLAUDE`
Created: July 10, 2026
Handling mode: compact path-to-results summary with preserved body

## Summary intent

This file constrains how future work should be done in the project.

## Fast path to results

- File role: Project operating instructions
- Body files available: 2

## Major sections

- L3: # DEBUGGING & DIAGNOSTIC RULES — NON-NEGOTIABLE
- L5: ## Bot & Agent Size Standards — Non-Negotiable
- L19: ## Never Deploy Without Approval
- L35: ## Never Guess. Always Verify First.
- L52: # PINGCLOSE.COM — MASTER DESIGN SYSTEM
- L54: ## Project Purpose
- L64: ## Critical Positioning (Never Violate)
- L71: ## Above-The-Fold Rules (Non-Negotiable)
- L92: ## Font Size Rule (Non-Negotiable)
- L99: ## Performance Targets (Non-Negotiable)

## High-signal preserved content

- L3: # DEBUGGING & DIAGNOSTIC RULES — NON-NEGOTIABLE
- L7: **Rule 1 — 200 lines max per file.**
- L10: **Rule 2 — Max 2 external API calls per file.**
- L11: If a file calls more than 2 external APIs, extract an orchestrator.
- L13: **Why:** Oversized files are impossible to test individually, hide bugs, and can't be reused. Every well-scoped file in this codebase is under 200 lines. Every problem file is over it.
- L19: ## Never Deploy Without Approval
- L21: **Rule:** Never run `git push`, `netlify deploy`, `vercel deploy`, or any deployment command without first showing Jim exactly what changed and getting explicit approval.
- L23: **Required pre-deploy sequence:**
- L25: 2. Explain in plain English what each change does and why
- L26: 3. Wait for Jim to say "yes" or "deploy it"
- L27: 4. Only then deploy
- L29: **Why:** Jim may disagree with the approach even if the code is technically correct. He cannot catch that if it's already live.
- L31: **How to apply:** This applies to every project, every deploy, every time. No exceptions for "small" or "obvious" changes.
- L35: ## Never Guess. Always Verify First.

## Blockers / next actions

- L19: ## Never Deploy Without Approval
- L21: **Rule:** Never run `git push`, `netlify deploy`, `vercel deploy`, or any deployment command without first showing Jim exactly what changed and getting explicit approval.
- L37: **Rule:** Before suggesting any cause for a bug or failure, Claude MUST read the actual error. No guesses. No theories. No "it might be X."
- L42: 3. Fix the confirmed cause
- L44: **Never suggest a fix for something that hasn't been confirmed by reading real output.**
- L66: - PingClose FINDS problems. LocalSEOAEOPro FIXES them.
- L67: - Never say PingClose fixes anything.
- L82: Above-the-fold content must load instantly. The first screen must contain:

## Reading order

- Read this overview first for the shortest route to the file's important outcomes.
- Read the SUMMARY_BODY files for full preserved details and verification.
