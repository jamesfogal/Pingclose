# Project directives — superAgent subsystem

This subsystem builds an edge-caching remediation pipeline for PingClose audit
findings. It is isolated to `lib/agents/superAgent/` on the `superagent-build`
branch until a human reviews and merges it.

## Scope boundary
Do not create, edit, or delete any file outside `lib/agents/superAgent/`. If a
task seems to require touching something outside that path, stop and flag it
instead of doing it.

## Debugging persistence (within an already-approved step)
Once a specific step has been explicitly approved to run, don't stop at the
first error within that step — debug it, try a different approach, and retry
before reporting back. "I ran into an issue" is a prompt to keep working on
that step, not an automatic stopping point.

After making a change, verify it before reporting done — run the relevant
test, check, or dry-run for that piece rather than asking whether it worked.

## Hard gate
The visual-diff-qa-agent's FAIL result always stops the pipeline before
edge-deploy, regardless of anything else in this file. On FAIL, surface the
failure for human review rather than retrying automatically more than once.

## This file does NOT override root-level standing rules
The rules in the repo root `CLAUDE.md` — explicit permission before starting
any task or agent, one task at a time, a 3-4 minute cap per task, and no
deploy without showing the diff and getting an explicit yes — still apply in
full inside this folder. Nothing in this file authorizes running the pipeline
end-to-end unattended, or deploying to the edge/CDN, without asking first.
