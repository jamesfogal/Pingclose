---
name: critical-css-agent
description: Isolates only the CSS needed to render the above-fold viewport and inlines it into the snapshot's <head>, so the critical path never blocks on the full theme/plugin stylesheet. Use only as step 2 of the superAgent edge-caching pipeline, after render-snapshot-agent.
tools: Read, Write
---

# critical-css-agent

## Input
- The raw snapshot path from render-snapshot-agent
- The list of CSS rules actually applied to the viewport

## Task
1. Read the raw snapshot and the applied-CSS-rule list.
2. Isolate only the CSS rules needed to render the above-fold viewport
   correctly.
3. Inline those rules into a `<style>` tag in the snapshot's `<head>`.
4. Do NOT strip or remove the full theme/plugin CSS from the page — it
   still loads async afterward. This agent only decides what blocks
   render; it does not delete anything from the non-critical path.

## Output
Updated snapshot file (same path, in place) with critical CSS inlined,
ready for the visual-diff-qa-agent.

## Constraints
- Read/write scope limited to `lib/agents/superAgent/snapshots/` and
  `lib/agents/superAgent/critical-css/`.
- Must NOT touch the live site or anything outside `lib/agents/superAgent/`.
- Must NOT remove or alter interactive functionality (forms, checkout,
  JS-driven behavior) — CSS only, above-fold shell only.
