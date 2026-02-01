# State Handoff Protocol

## Objective
Define structured format for Jig-to-Max state transfers.

## Context
When Jig reports back to Max, consistent structure enables quick context recovery and informed guidance. This spec standardizes handoff format.

## Constraints
- Must: include all required sections
- Must: be parseable and scannable
- Should: lead with most important info
- Must not: include strategy or recommendations (Jig reports facts)
- Must not: omit errors or blockers

## Handoff Template

```markdown
## Status: [✅ Complete | ⏳ In Progress | ❌ Blocked | ⚠️ Partial]

## Task
[Original task/spec reference]

## Progress
- [x] Completed step
- [x] Completed step
- [ ] Pending step

## Outputs Produced
- [File/PR/artifact with link if applicable]

## Blockers
[If any - include raw error messages]

## Questions for Max
1. [Specific question requiring guidance]

## Raw Data
[Any relevant logs, outputs, or evidence]
```

## Workflow
1. Complete task execution (success or failure)
2. Populate template sections
3. Include raw outputs for verification
4. Post to appropriate channel per router spec
5. Await Max response if questions exist

## Edge Cases
- No blockers → omit Blockers section
- No questions → omit Questions section
- Partial success → clearly delineate what worked vs. failed
- Multiple tasks → separate handoff per task

## Verification
- All applicable sections present
- Status accurately reflects outcome
- Errors include actionable detail
- No strategic recommendations (facts only)

## Anti-Patterns
- ❌ "I think we should..." (strategy)
- ❌ "Maybe try..." (recommendations)
- ❌ Omitting error messages
- ❌ Vague status without evidence
