# Channel Registry

Slack channels used for Jig automation outputs.

| Channel | ID | Purpose |
|---------|-----|---------|
| #max_jig | C0ABK93GA7R | General Jig-Max communication, daily recaps |
| #all-jigmax | C0ACDKE7X6V | All Jig-Max activity |
| #gitmap | C0ACGCZHW49 | Git-Map nightly reports |
| #knowflow | C0ABX3XL3BM | Know-Flow nightly reports |
| #skill-evolution | C0AC034KADB | Skill research and proposals |
| #remote-state | C0AC1EBLFJS | Daily system state reports |
| #jig-specs | C0ACGDAD4FK | Spec handoffs and updates |

## Default Channel

When a target channel is unavailable, fall back to **#max_jig** (C0ABK93GA7R).

## Channel Access

Jig requires bot access to all channels listed above. If a channel is inaccessible:
1. Log the error locally
2. Post to #max_jig with a note about the routing failure
3. Continue with remaining operations
