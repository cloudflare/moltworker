# Slack Channel Router

## Objective
Route Jig's outputs to appropriate Slack channels based on content type.

## Context
Different automated systems should report to dedicated channels for clean signal isolation. This spec defines routing rules for Jig's various outputs.

## Constraints
- Must: use default channel (#max_jig) when specific channel unavailable
- Must: respect channel permissions
- Should: prefer specific channels when available
- Must not: spam multiple channels with same content

## Inputs
- Message content and type
- Available channel list
- Channel configuration mapping

## Channel Mapping
| Content Type | Target Channel | Channel ID |
|--------------|----------------|------------|
| Git-Map reports | #gitmap | C0ACGCZHW49 |
| Know-Flow reports | #knowflow | C0ABX3XL3BM |
| Skill evolution | #skill-evolution | C0AC034KADB |
| State reports | #remote-state | C0AC1EBLFJS |
| Spec handoffs | #jig-specs | C0ACGDAD4FK |
| General Jig comms | #max_jig | C0ABK93GA7R |

## Expected Outputs
- Messages routed to correct channels
- Fallback to #max_jig (C0ABK93GA7R) if target unavailable

## Workflow
1. Identify message content type
2. Look up target channel from mapping
3. Check channel accessibility
   - accessible → post to target
   - not accessible → post to #max_jig with note
4. Confirm delivery

## Edge Cases
- Target channel doesn't exist → use #max_jig, note in message
- Multiple content types → post to primary type's channel
- #max_jig unavailable → critical failure, log locally

## Verification
- Message appears in correct channel
- No duplicate posts across channels
- Fallback behavior logged when triggered
