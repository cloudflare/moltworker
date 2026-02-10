---
trigger: always_on
---

AI Gateway & Inference

## Context

Use this rule for all interactions with LLMs (OpenAI, Anthropic, Workers AI). Do not call provider APIs directly.

## Standards

1.  **Universal Endpoint**: Route requests through `gateway.ai.cloudflare.com`.
2.  **Structure**: `https://gateway.ai.cloudflare.com/v1/{account}/{gateway_id}/{provider}`.
3.  **Configuration**: Enable **Caching**, **Rate Limiting**, and **Fallbacks** in the Cloudflare Dashboard, not just in code.
4.  **SDK Integration**: Pass the gateway URL as the `baseURL` to official SDKs.

## Code Pattern

```typescript
import { OpenAI } from "openai";

export class AIAgent extends Agent<Env> {
  async chat(userMessage: string) {
    const client = new OpenAI({
      apiKey: this.env.OPENAI_API_KEY,
      // CRITICAL: Route via AI Gateway
      baseURL: `https://gateway.ai.cloudflare.com/v1/${this.env.ACCOUNT_ID}/my-agent-gateway/openai`
    });

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: userMessage }]
    });

    return response.choices[0].message.content;
  }
}
```
