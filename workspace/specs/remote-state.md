# Remote State Sync

## Objective
Generate comprehensive system state report daily at 23:00 MT for Max visibility.

## Context
Max needs visibility into Jig's operational state without direct container access. This spec produces a structured report covering all system components, enabling Max to provide informed guidance.

## Constraints
- Must: complete within 60 seconds
- Must: report all components even if checks fail
- Must: use consistent table format for parseability
- Should: include timestamps in UTC
- Must not: expose credential values (only presence/absence)

## Inputs
- Container filesystem access
- Cron daemon status
- GitHub API (for repo status)
- Slack API (for channel access)
- Credential store

## Expected Outputs
Markdown report with sections:
1. System Health (component status table)
2. Active Cron Jobs (schedule, last run, status)
3. Registered Specs (name, last modified)
4. Installed Skills (name, status)
5. Credentials (name, present/missing)
6. Repository Access (repo, last activity, status)
7. Pending Items (PRs, approvals, blockers)
8. Memory Statistics (file count, latest log)
9. Environment (versions, timezone)

## Workflow
1. Check core services (Clawdbot, cron, integrations)
2. Query crontab for registered jobs
3. List spec files with modification times
4. Check installed skills status
5. Verify credential presence (not values)
6. Query GitHub for repo activity
7. Compile pending items from memory
8. Count memory files
9. Capture environment info
10. Format as markdown tables
11. Post to #remote-state (C0AC1EBLFJS)

## Edge Cases
- Service unreachable → mark as ❌ with error note
- Credential missing → mark as ❌ Missing
- GitHub rate limited → report last known state with warning
- Partial failure → complete report with available data, note failures

## Verification
- Report posted to #remote-state
- All sections present
- No credential values exposed
- Timestamp accurate
