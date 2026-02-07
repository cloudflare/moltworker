# Sync Checklist

> **EVERY AI assistant MUST follow this checklist after completing any task.**
> No exceptions. Skipping steps creates drift between agents.

**Last Updated:** 2026-02-06

---

## After EVERY Task

- [ ] **Update session log** — Append to the correct log file:
  - Claude: `claude-share/core/claude-log.md`
  - Codex: `claude-share/core/codex-log.md`
  - Other: `claude-share/core/bot-log.md`
- [ ] **Update GLOBAL_ROADMAP.md** — Change task status emoji and add changelog entry
- [ ] **Update WORK_STATUS.md** — Reflect current sprint state
- [ ] **Update next_prompt.md** — Point to the next task for the next AI session
- [ ] **Run tests** — `npm test` must pass before pushing
- [ ] **Run typecheck** — `npm run typecheck` must pass before pushing
- [ ] **Commit with proper format** — See commit message format below
- [ ] **Push to correct branch** — Never push to `main` directly

---

## Session Log Entry Format

```markdown
## Session: YYYY-MM-DD | Task Name (Session: SESSION_ID)

**AI:** Claude / Codex / Other (model name)
**Branch:** branch-name
**Status:** Completed / Partial / Blocked

### Summary
Brief description of what was accomplished.

### Changes Made
- Change 1
- Change 2

### Files Modified
- `path/to/file1.ts`
- `path/to/file2.ts`

### Tests
- [ ] Tests pass
- [ ] Typecheck passes

### Notes for Next Session
Any context the next AI needs to continue.
```

---

## Changelog Entry Format

Add to `GLOBAL_ROADMAP.md` → Changelog section (newest first):

```
YYYY-MM-DD | AI Name (Session: ID) | Task Description: Details | file1.ts, file2.ts
```

---

## Commit Message Format

```
<type>(<scope>): <description>

[optional body]

AI: <model-name> (Session: <session-id>)
```

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`
Scopes: `tools`, `models`, `client`, `gateway`, `telegram`, `discord`, `task-processor`, `openrouter`, `docs`

Example:
```
feat(tools): add parallel tool execution via Promise.allSettled

Replace sequential for...of loop with Promise.allSettled for independent
tool calls. ~2-5x speedup per iteration in multi-tool scenarios.

AI: Claude Opus 4.6 (Session: abc123)
```

---

## Branch Naming Convention

| AI Agent | Branch Pattern | Example |
|----------|---------------|---------|
| Claude | `claude/<task-slug>-<id>` | `claude/parallel-tools-x7k2` |
| Codex | `codex/<task-slug>-<id>` | `codex/cost-tracking-m3p1` |
| Other | `bot/<task-slug>-<id>` | `bot/gemini-flash-tools-q2w3` |
| Human | `feat/<task-slug>` or `fix/<task-slug>` | `feat/mcp-integration` |

---

## What NOT to Do

- Do NOT push to `main` directly
- Do NOT skip tests ("I'll fix them later")
- Do NOT modify files outside your task scope without documenting why
- Do NOT leave `console.log` debug statements in production code
- Do NOT commit secrets, API keys, or `.dev.vars`
- Do NOT amend another AI's commits without coordination
