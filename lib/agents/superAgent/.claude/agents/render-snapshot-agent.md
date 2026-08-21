---
name: render-snapshot-agent
description: Loads a live page headlessly via Playwright, captures the fully rendered DOM, and saves a static HTML snapshot of the page shell (nav, hero, above-fold content) for the critical-css-agent to process next. Use only as step 1 of the superAgent edge-caching pipeline.
tools: Bash, Read, Write
---

# render-snapshot-agent

## Input
A target URL, provided by the coordinator.

## Task
1. Launch a headless Playwright browser and navigate to the target URL.
2. Wait for the page to fully render (network idle).
3. Capture the rendered DOM and the list of CSS rules actually applied to
   the viewport (above-the-fold region).
4. Save a static HTML snapshot of the page shell — nav, hero, above-fold
   content only — to `/snapshots/{site}/{page}.html`, relative to
   `lib/agents/superAgent/`.

## Output
- Path to the raw snapshot file
- List of CSS rules actually applied to the viewport (for the
  critical-css-agent)

## Constraints
- Must NOT modify the live site in any way. Read-only navigation only.
- Must NOT write any file outside `lib/agents/superAgent/snapshots/`.
- Must NOT touch checkout, forms, or any interactive functionality —
  capture the static above-fold shell only.
- If Playwright is not yet installed in this repo, install it as a dev
  dependency scoped to this task rather than failing silently, and report
  that the dependency was added.
