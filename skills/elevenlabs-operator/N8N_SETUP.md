# n8n → ElevenLabs Setup Guide

## Overview

This guide shows you how to build the n8n workflow that:
1. **Receives** a payload from your OpenClaw agent
2. **Calls** the ElevenLabs API to create a voice agent
3. **Returns** the new agent ID back to OpenClaw

---

## The Payload Your OpenClaw Agent Will Send

```json
{
  "client_name": "Acme Corp",
  "agent_prompt": "You are a support agent for Acme Corp. Be friendly and helpful...",
  "voice_id": "21m00Tcm4TlvDq8ikWAM",
  "post_call_webhook_url": "https://n8n.yourdomain.com/webhook/post-call"
}
```

---

## n8n Workflow — Step by Step

### Node 1: Webhook (Entry Point)

| Setting | Value |
|---|---|
| **Node type** | Webhook |
| **HTTP Method** | POST |
| **Path** | `/elevenlabs-create-agent` (or any path you choose) |
| **Authentication** | Header Auth → add header `X-Webhook-Secret` with a strong random value |
| **Response Mode** | `Using Respond to Webhook Node` |

> Copy the **Production Webhook URL** — that goes into your `N8N_ELEVENLABS_WEBHOOK_URL` wrangler secret.

---

### Node 2: HTTP Request (ElevenLabs API Call)

| Setting | Value |
|---|---|
| **Node type** | HTTP Request |
| **Method** | POST |
| **URL** | `https://api.elevenlabs.io/v1/convai/agents/create` |
| **Authentication** | Generic Credential Type → Header Auth |
| **Header name** | `xi-api-key` |
| **Header value** | `{{ $env.ELEVENLABS_API_KEY }}` *(set as n8n env var)* |
| **Body** | JSON |

**Request Body (JSON):**
```json
{
  "name": "{{ $json.client_name }}",
  "conversation_config": {
    "agent": {
      "prompt": {
        "prompt": "{{ $json.agent_prompt }}"
      }
    },
    "tts": {
      "voice_id": "{{ $json.voice_id }}"
    }
  },
  "platform_settings": {
    "webhook": {
      "url": "{{ $json.post_call_webhook_url }}"
    }
  }
}
```

> **Important:** Map these from the incoming webhook payload using n8n's expression syntax `{{ $json.field_name }}`.

---

### Node 3: Respond to Webhook (Return Result)

| Setting | Value |
|---|---|
| **Node type** | Respond to Webhook |
| **Response Code** | 200 |
| **Response Body** | JSON |

**Response Body:**
```json
{
  "agent_id": "{{ $json.agent_id }}",
  "status": "created",
  "client_name": "{{ $('Webhook').first().json.client_name }}"
}
```

---

## ElevenLabs API Reference

| Field | Description | Required |
|---|---|---|
| `name` | Display name for the agent | ✅ |
| `conversation_config.agent.prompt.prompt` | System prompt / persona | ✅ |
| `conversation_config.tts.voice_id` | ElevenLabs Voice ID | ✅ |
| `platform_settings.webhook.url` | Post-call data destination | ❌ Optional |

Full docs: [https://elevenlabs.io/docs/conversational-ai/api-reference/agents/create](https://elevenlabs.io/docs/conversational-ai/api-reference/agents/create)

---

## Required n8n Environment Variables

In your n8n instance, set:

| Variable | Value |
|---|---|
| `ELEVENLABS_API_KEY` | Your ElevenLabs API key (from elevenlabs.io → Profile → API Keys) |

In n8n: **Settings** → **Variables** → add `ELEVENLABS_API_KEY`

---

## Set the Wrangler Secret

Once your n8n webhook is live, take the **Production URL** and run:

```bash
cd /Users/calebniikwei/moltworker
wrangler secret put N8N_ELEVENLABS_WEBHOOK_URL
# Paste: https://your-n8n-instance.com/webhook/elevenlabs-create-agent
```

Then redeploy:
```bash
npm run deploy
```

---

## Testing

Ask your OpenClaw agent:
> *"Create a voice agent for my test client, 'Demo Inc'. The agent should be a friendly sales assistant. Use voice ID 21m00Tcm4TlvDq8ikWAM. Post-call webhook is https://example.com/webhook."*

Check your n8n execution history — you should see the workflow trigger and the ElevenLabs call succeed.
