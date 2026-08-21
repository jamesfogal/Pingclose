# superAgent coordinator

## Pipeline order
render-snapshot -> critical-css -> visual-diff-qa (gate) -> [HUMAN APPROVAL] -> edge-deploy -> pagespeed-verify

change-detection runs on its own schedule and re-triggers the pipeline from render-snapshot.

## Sequencing rules
1. Run render-snapshot-agent for the target URL. Pass its output
   (snapshot path + applied CSS rules) to critical-css-agent.
2. Run critical-css-agent. Pass its output (updated snapshot) to
   visual-diff-qa-agent.
3. Run visual-diff-qa-agent against the candidate snapshot and the live
   URL.
   - FAIL: stop. Surface the diff image and written reason to the human
     queue (`runs/{timestamp}-{site}-{page}.json`, status: "qa_failed").
     Do not retry automatically more than once.
   - PASS: proceed to step 4.
4. **Human approval gate.** Show the human exactly what would be pushed
   (snapshot content, target cache key/edge path) and wait for an
   explicit yes before calling edge-deploy-agent. This gate is not
   optional and is not satisfied by an earlier general approval to run
   the pipeline — it requires approval of this specific deploy.
5. On approval, run edge-deploy-agent. Record the confirmation + edge
   URL/cache key.
6. Run pagespeed-verify-agent against the now-live edge-cached URL.
   Store before/after JSON in `runs/{timestamp}-{site}-{page}.json`.

## Logging
Every run (site, page, pass/fail, before/after score, deploy y/n) is
appended to `lib/agents/superAgent/runs/log.jsonl` for the audit trail.

## Failure handling
Failures at any step are surfaced to the human queue rather than retried
indefinitely. Only visual-diff-qa gets a single automatic retry; every
other step fails once and reports.
