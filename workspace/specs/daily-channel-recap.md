# Daily Channel Recap

## Objective
Summarize key activity across monitored Slack channels daily at 04:00 MT.

## Context
TR and Max need awareness of Slack activity without reading every message. This provides a curated digest of important discussions, decisions, and action items.

## Constraints
- Must: respect channel access permissions
- Must: prioritize signal over noise
- Should: highlight decisions and action items
- Should: note unresolved questions
- Must not: include sensitive/private content inappropriately
- Must not: exceed reasonable summary length

## Inputs
- Slack read access to configured channels
- Previous day's messages (24h window)
- Channel configuration (which channels to monitor)

## Expected Outputs
Markdown summary with:
- Channel-by-channel highlights
- Key decisions made
- Action items identified
- Unresolved questions
- Notable mentions/requests

## Workflow
1. Identify time window (previous 24h UTC)
2. For each monitored channel:
   - Fetch messages in window
   - Filter out low-signal content (reactions-only, simple acks)
   - Identify key themes and decisions
   - Extract action items and owners
   - Note questions without answers
3. Compile into structured summary
4. Post recap to #max_jig (C0ABK93GA7R)

## Edge Cases
- No activity in channel → note "quiet day" for that channel
- Channel inaccessible → skip with error note
- Very high volume → prioritize threads with most engagement
- Mentions of Jig/Max → always include

## Verification
- Recap posted within 5 minutes of scheduled time
- All configured channels represented
- Summary is actionable and scannable
