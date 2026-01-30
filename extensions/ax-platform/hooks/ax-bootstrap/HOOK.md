---
name: ax-bootstrap
description: "Inject aX Platform mission briefing into agent bootstrap files"
metadata: {"moltbot":{"emoji":"🌐","events":["agent:bootstrap"]}}
---

# aX Bootstrap Hook

Injects the aX Platform mission briefing (agent identity, collaborators, recent
conversation) into the agent's bootstrap files before each run.

## What It Does

1. Checks if the current session is an aX dispatch (sessionKey starts with `ax-agent-`)
2. Retrieves the stored dispatch context for that session
3. Builds a mission briefing markdown file
4. Injects it into `context.bootstrapFiles` as `AX_MISSION.md`

## Requirements

- aX Platform plugin must be enabled
- Session must be triggered via aX dispatch
