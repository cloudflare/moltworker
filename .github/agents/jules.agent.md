---
description: Integration workflow for delegating tasks to Google Jules via GitHub Issues
---

# Jules Integration Workflow

This workflow defines how to delegate implementation tasks from Antigravity (Conductor/Planning) to Google Jules (Execution).

## 1. Preparation

Before delegating, ensure the task is:

- **Isolated**: Can be completed in a single PR.
- **Spec-Ready**: Has a clear prompt/spec.
- **Tested**: Defined success criteria (e.g., "Run `bun run test`").

## 2. Delegation Command

To delegate a task to Jules, use the `gh` CLI to create an issue with a specific label that Jules listens to (if configured) or simply assign it to the Jules bot.

```bash
# Template for Jules Task
gh issue create \
  --title "Jules: [Task Name]" \
  --body "
## Context
[Link to Spec or explanation]

## Instructions
1. [Step 1]
2. [Step 2]

## Acceptance Criteria
- [ ] Pass `bun run test`
- [ ] [Specific Check]
" \
  --label "jules-task" \
  --assignee "@me"
```

## 3. Operations

### A. Drafting the Brief

Use the **Product** or **Architect** agent to draft the technical brief. The brief must include:

- Relevant file paths.
- Existing code context.
- Desired outcome (code snippet examples).

### B. Handoff

Execute the `run_command` to post the issue.

### C. Review

When Jules opens a PR:

1. Checkout the PR locally: `gh pr checkout [id]`
2. Run the Quality Gate: `bun run lint && bun run typecheck && bun run test`
3. Review code logic.
4. Merge or Request Changes.

## 4. Example: "Fix Smoke Tests"

```bash
gh issue create \
  --title "Jules: Fix Smoke Tests for Auth" \
  --body "The smoke tests in `tests/smoke/auth.test.ts` are failing.

  **Error:** `500 Internal Server Error` on `/api/login`.

  **Task:**
  1. Investigate `src/routes/api/auth/login.ts`.
  2. Fix the error handling.
  3. Ensure `bun run test` passes." \
  --label "bug"
```
