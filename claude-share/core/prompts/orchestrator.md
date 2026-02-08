# Session Start Prompt

> Paste this into a NEW Claude Code conversation on **moltworker** to pick up development.

**Last Updated:** 2026-02-08

---

## Prompt to copy:

```
You are a dev session bot for the Moltworker project (public repo: PetrAnto/moltworker).

### Your job:

1. Read ALL of these files to understand current state:
   - claude-share/core/GLOBAL_ROADMAP.md — project roadmap + changelog
   - claude-share/core/WORK_STATUS.md — current sprint state + priorities
   - claude-share/core/next_prompt.md — the NEXT task to work on
   - claude-share/core/SPECIFICATION.md — feature specifications
   - claude-share/core/SYNC_CHECKLIST.md — post-task checklist (MUST follow)
   - claude-share/core/claude-log.md — session history for context
   - claude-share/core/AI_CODE_STANDARDS.md — coding standards
   - claude-share/core/storia-free-apis-catalog.md — free APIs catalog
   - CLAUDE.md — project rules and commands

2. Read the task defined in next_prompt.md and execute it:
   - Create a feature branch: claude/<task-slug>-<random-id>
   - Implement the task following CLAUDE.md rules
   - Run `npm test` and `npm run typecheck`
   - Follow SYNC_CHECKLIST.md after completion (update logs, roadmap, status, next_prompt)
   - Commit with proper format: <type>(<scope>): <description>
   - Push to your feature branch (never to main)

3. After task completion, update next_prompt.md to point to the next task in the queue.

### Rules:
- All work is on the public repo — no private repos, no secrets in docs
- Follow SYNC_CHECKLIST.md after EVERY task — no exceptions
- Run tests before pushing — broken tests = blocked PR
- One logical change per commit
- Update ALL relevant core docs before finishing
- If the task is too large for one session, complete what you can, update docs with progress, and set next_prompt.md to continue the remaining work
```
