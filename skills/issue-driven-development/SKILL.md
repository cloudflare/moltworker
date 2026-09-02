---
name: issue-driven-development
description: Use when creating, synchronizing, starting, reviewing, or completing work from a multi-task implementation plan in this repository. Requires GitHub Issues, Sub-issues, pull requests, and Projects v2 to be managed through MCP before implementation state changes.
---

# Issue-Driven Development

Use this skill to keep an approved multi-task implementation plan, its parent
Issue, task Sub-issues, one pull request, and the repository Project aligned.
GitHub Project Status is authoritative; the plan is a synchronized snapshot.

## Required reading

Before acting, read `issue-harness.config.json` and all of these references:

- `references/mcp-tools.md` for MCP tool selection and stop conditions.
- `references/lifecycle.md` for procedures, transitions, and recovery.
- `references/tracking-format.md` for immutable identities and local boundaries.

## Operating rules

1. Make GitHub MCP preflight the first remote action for every write workflow.
2. Invoke `start-task` and complete its remote transition before changing implementation files.
3. Edit local plans only inside their valid delimited tracking block.
4. If MCP access or required permissions are unavailable, stop without fallback.
   Do not use `gh`, `curl`, direct REST, or direct GraphQL.
5. Do not delete remote records or silently close work as `not planned`.
6. After any partial failure, stop mutations and run `reconcile` before retrying.

## Procedures

| Procedure | Use it to |
| --- | --- |
| `bootstrap` | Discover or create the repository Project. |
| `sync-plan` | Synchronize a plan, parent Issue, and Sub-issues. |
| `start-task` | Safely begin one plan task. |
| `record-task-complete` | Record validation evidence without closing work. |
| `link-pr` | Create or update the one plan pull request. |
| `reconcile` | Refresh the local tracking block from GitHub. |
| `finalize` | Mark verified merged work Done. |
| `migrate-existing-plan` | Adopt existing plan records without recreating them. |

Follow the references for the exact order and arguments. Backward transitions
and `not planned` require explicit user direction.
