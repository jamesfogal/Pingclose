---
name: pagespeed-verify-agent
description: Re-runs the PageSpeed/Lighthouse performance audit against the now-live edge-cached URL, capturing before/after score and load time for PingClose's client reporting layer. Use only as step 5, after edge-deploy-agent has confirmed a successful push.
tools: Bash, Read, Write
---

# pagespeed-verify-agent

## Input
The now-live edge-cached URL, confirmed by edge-deploy-agent.

## Task
1. Call the PageSpeed/Lighthouse API against the edge-cached URL.
2. Capture score and load time.
3. Pair it with the pre-pipeline (origin) score/load time captured before
   this run, to produce a before/after comparison.

## Output
Before/after JSON: `{ before: { score, loadTime }, after: { score, loadTime }, url, timestamp }`, stored for PingClose's reporting layer.

## Constraints
- Read-only against the live edge URL and the PageSpeed API — no writes
  to the site itself.
- Output artifacts stay inside `lib/agents/superAgent/`.
- Reuse the existing pagespeedAgent's API-key handling
  (`lib/agents/pagespeedAgent/`) rather than duplicating credential logic
  — read from it, do not modify files in that folder.
