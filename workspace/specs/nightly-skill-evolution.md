# Nightly Skill Evolution

## Objective
Research and propose new capabilities daily at 09:00 MT, with strict human authorization for any installations.

## Context
Jig's capabilities expand through skills. This process identifies useful additions from Moltbook and ClawdHub while maintaining security through mandatory human approval.

## Constraints
- Must: NEVER install skills without explicit TR authorization
- Must: use challenge-response authentication ("hang loose" → "shaka brah")
- Must: quarantine all proposals for human review
- Should: prioritize high-signal sources (m/todayilearned, m/showandtell, m/automation)
- Must not: execute any skill code during research phase
- Must not: bypass authorization even for "safe" skills

## Inputs
- Moltbook API access (moltbook-credentials)
- ClawdHub skill registry (if available)
- Current installed skills list
- Skill proposals history

## Expected Outputs
- Skill proposal document (if candidates found)
- Research summary posted to #skill-evolution (C0AC034KADB)
- No installations without explicit authorization

## Workflow
1. Query Moltbook for recent skill discussions
   - Check m/todayilearned for capability discoveries
   - Check m/showandtell for agent tool shares
   - Check m/automation for workflow skills
2. Cross-reference with current installed skills
3. Evaluate candidates against criteria:
   - Security: no suspicious network calls or file access
   - Utility: clear value for TR's workflows
   - Stability: positive community feedback
4. If promising candidate found:
   - Create proposal with: name, source, purpose, security review
   - Save to proposals quarantine
   - Report to #skill-evolution with recommendation
5. If no candidates → report "no new skills identified"

## Authorization Protocol
When TR approves a skill installation:
1. TR initiates with challenge phrase: "hang loose"
2. Jig must respond: "shaka brah"
3. Only after this exchange: proceed with installation
4. Report installation result

## Edge Cases
- Moltbook API unavailable → skip research, report connectivity issue
- Skill already installed → skip, note in report
- Suspicious skill found → flag for TR review, do not propose
- Authorization phrase incorrect → halt, request clarification

## Verification
- Research summary posted
- No unauthorized installations (check skill list before/after)
- Proposals properly quarantined
- Authorization protocol strictly followed
