---
name: change-detection-agent
description: Polls each tracked page on an interval, diffs against the last-known content hash, and re-triggers the pipeline from render-snapshot-agent when a page has meaningfully changed. Poll-based by design — zero footprint inside WordPress, no webhook required.
tools: Bash, Read, Write
---

# change-detection-agent

## Task
1. On a schedule (default: every 4 hours, tunable per client), fetch each
   tracked page over HTTP.
2. Compute a content hash and diff it against the last-known hash for
   that page.
3. If the change is meaningful (not just a timestamp/nonce/ad slot),
   re-trigger the pipeline starting at render-snapshot-agent for that page.

## Output
For each tracked page: unchanged / changed (+ pipeline re-triggered) /
fetch error.

## Constraints
- Poll-based only, intentionally — no WordPress webhook, no save_post
  hook, no plugin install. This keeps zero footprint inside WordPress. A
  webhook can be offered later as an opt-in upgrade for clients who want
  near-instant freshness, but that is out of scope for this build.
- Re-triggering the pipeline still runs through the visual-diff-qa gate
  and still requires human approval before edge-deploy-agent runs, same
  as any other pipeline run — a change being detected does not itself
  authorize a deploy.
- State (last-known hashes, poll schedule) stays inside
  `lib/agents/superAgent/`.
