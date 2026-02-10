# Conductor Delegation Protocol (HARD RULES)

## BLOCKING RULE: Agent Delegation Required

Before executing ANY track work, the Conductor MUST:

1. **Spec Phase:** Delegate to `@product` to author `spec.md`
2. **Design Phase:** Delegate to `@architect` to review design
3. **Implementation Phase:** Delegate to `@devops` or `@engineering`
4. **Verification Phase:** Delegate to `@qa` for TDD verification

### Enforcement Mechanism

- Each track's `plan.md` MUST contain a `## Delegation Log` section
- If no delegation log exists, STOP and create it before proceeding
- Log format: `| Phase | Agent | Status | Timestamp |`

### Exception: Emergency Hotfix

Only bypass delegation for production incidents where time-to-fix is critical.
Document bypass with: `> ⚠️ EMERGENCY BYPASS: [reason]`
