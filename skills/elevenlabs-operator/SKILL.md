---
name: elevenlabs-operator
description: Create new ElevenLabs conversational voice agents for clients. This skill posts a structured payload to an n8n webhook, which then calls the ElevenLabs API. The agent must NEVER contact ElevenLabs directly.
---

# Agency Operator — ElevenLabs Voice Agent Creator

You help create new ElevenLabs conversational AI voice agents for clients. You send a structured request to an **n8n webhook**, which handles the actual ElevenLabs API call.

## Hard Constraint

> [!IMPORTANT]
> **Never contact ElevenLabs directly.** Never call `api.elevenlabs.io` from any skill script.
> ALL requests must go through the n8n webhook at `N8N_ELEVENLABS_WEBHOOK_URL`.

## Required Information

Before creating an agent, you MUST collect all of the following from the user:

| Field | Description | Example |
|---|---|---|
| `client_name` | Name of the client for this agent | `"Acme Corp"` |
| `agent_prompt` | The full system prompt / persona for the voice agent | `"You are a friendly support agent for Acme..."` |
| `voice_id` | ElevenLabs Voice ID to use | `"21m00Tcm4TlvDq8ikWAM"` |
| `post_call_webhook_url` | URL n8n should configure for post-call callbacks | `"https://n8n.yourdomain.com/webhook/post-call"` |

If any field is missing, ask the user for it before proceeding.

## How to Create an Agent

Run the creation script:

```bash
bash /root/clawd/skills/elevenlabs-operator/scripts/create-agent.sh \
  --client-name "Acme Corp" \
  --agent-prompt "You are a support agent for Acme Corp..." \
  --voice-id "21m00Tcm4TlvDq8ikWAM" \
  --post-call-webhook "https://n8n.yourdomain.com/webhook/post-call"
```

## Required Environment Variables

| Variable | Description |
|---|---|
| `N8N_ELEVENLABS_WEBHOOK_URL` | Full URL of your n8n webhook endpoint |

## Workflow

1. **Collect parameters** — Ask for any missing fields from the table above.
2. **Confirm with user** — Show a summary and ask "Shall I create this voice agent?"
3. **Run the script** — Execute `create-agent.sh` with the collected parameters.
4. **Report back** — Parse the response and report the new `agent_id` to the user.

## Example Interaction

**User:** "Create a voice agent for my client Acme Corp."

**Agent:**
> I need a few more details to create the ElevenLabs voice agent:
> 1. What should the agent's persona/system prompt be?
> 2. Which ElevenLabs voice ID should it use?
> 3. Where should post-call data be sent (webhook URL)?

[User provides info]

> Here's the agent I'll create:
> - **Client:** Acme Corp
> - **Voice ID:** 21m00Tcm4TlvDq8ikWAM
> - **Post-call webhook:** https://n8n.yourdomain.com/webhook/post-call
> - **Prompt:** You are a support agent for Acme...
>
> Shall I proceed?

[User confirms → script runs → response parsed]

> ✅ Voice agent created! Agent ID: `agent_abc123`
> Your client's agent is live in ElevenLabs.
