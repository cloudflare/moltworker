# Session Handoff Prompt

> Paste this into a NEW Claude Code conversation when the previous session ran out of context or got stuck.

**Last Updated:** 2026-02-08

---

## Prompt to copy:

```
The previous Claude Code session on Moltworker got stuck or ran out of context.
Your job is to pick up where it left off.

### Steps:

1. Read these files to understand what was in progress:
   - claude-share/core/WORK_STATUS.md — current sprint + what's in_progress
   - claude-share/core/next_prompt.md — task that was being worked on
   - claude-share/core/claude-log.md — last session entry for context

2. Check git state:
   - `git branch -a` — find the in-progress feature branch
   - `git log --oneline -10` — see recent commits
   - `git status` — check for uncommitted work
   - `git diff` — check for unstaged changes

3. Resume the task:
   - Switch to the existing feature branch (or create one if none exists)
   - Continue from where the last session stopped
   - If changes were staged but not committed, commit them first
   - Complete the remaining work

4. After completion, follow claude-share/core/SYNC_CHECKLIST.md to update all docs.

### Rules:
- Do NOT start over — build on what was already done
- Check for uncommitted work before making new changes
- If the previous session left partial code, review and fix before continuing
- Push to the existing feature branch, never to main
```
