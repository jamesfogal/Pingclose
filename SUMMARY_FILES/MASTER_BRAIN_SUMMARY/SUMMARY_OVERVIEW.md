# SUMMARY OVERVIEW

Source file: `C:\Projects\pingclose\MASTER_BRAIN_SUMMARY.md`
Summary pack folder: `C:\Projects\pingclose\SUMMARY_FILES\MASTER_BRAIN_SUMMARY`
Created: July 10, 2026
Handling mode: compact path-to-results summary with preserved body

## Summary intent

This file is already a project memory layer, so the compact view below focuses on the fastest path to its important decisions and current operating context.

## Fast path to results

- File role: Project master brain summary
- Body files available: 1

## Major sections

- L1: # MASTER_BRAIN_SUMMARY — PingClose
- L2: ## Executive Summary
- L20: ## Current Production State
- L37: ## Current Architecture
- L59: ## Fixed Issues
- L69: ## Open Issues
- L79: ## Rules Learned
- L89: ## Important Decisions
- L101: ## Last Deployments
- L108: ## Last Commits

## High-signal preserved content

- L5: CRITICAL TIMESTAMP RULES
- L8: 1. Everything must be date and timestamped.
- L10: 3. Last Updated must be set on every save.
- L12: 5. Never add undated entries.
- L16: Last Updated: 2026-07-04 00:00:00 UTC (Decision PC-2026-07-04-D001 added)
- L25: - Status: PARTIALLY BROKEN
- L27: - Root cause: RESEND_API_KEY has BOM (U+FEFF) at character index 7
- L28: - Every /api/send-code call returns 500 "Failed to send code. Please try again."
- L29: - Broken since deployment: dpl_EiKHaD9tMRxmoNVmFcX3EbG7WVZ9
- L30: - Last known good email verifications: June 12 and June 19 (prior deployment)
- L34: - Vercel project: prj_ype7bc4ehRWej1NLN6Y3l6LrzUrg
- L35: - Supabase project: xvrhxtnhmnurvxitnijy
- L37: ## Current Architecture
- L41: - Framework: Next.js App Router

## Blockers / next actions

- L8: 1. Everything must be date and timestamped.
- L10: 3. Last Updated must be set on every save.
- L41: - Framework: Next.js App Router
- L46: - Background work: Next.js after() — fires pagespeed-agent post-response
- L59: ## Fixed Issues
- L73: - [CRITICAL] RESEND_API_KEY BOM — all email verification broken — fix: delete and repaste key in Vercel
- L77: - [DEFERRED] SuperAgent / health monitoring architecture — awaiting ChatGPT review
- L87: - Every infrastructure failure must be caught by automated health checks, not real users

## Reading order

- Read this overview first for the shortest route to the file's important outcomes.
- Read the SUMMARY_BODY files for full preserved details and verification.
