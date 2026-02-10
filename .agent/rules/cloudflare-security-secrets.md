---
trigger: always_on
---

Security & Secrets

## Context

Use this rule to ensure the Agent handles sensitive data, API keys, and authorization securely.

## Standards

1.  **Secrets Management**: Never bake secrets into code. Use `wrangler secret put <KEY>`. Access them via `env.KEY`.
2.  **Input Validation**: Validate all `onRequest` and `webSocketMessage` inputs using Zod or manual checks before processing.
3.  **Timing Attacks**: Use `crypto.subtle.timingSafeEqual` when comparing API keys or signatures.
4.  **CORS**: Explicitly handle CORS options requests in `fetch` handlers.

## Code Pattern

```typescript
import { Agent } from "agents";

export class SecureAgent extends Agent<Env> {
  async onRequest(request: Request) {
    // 1. Validate Secret Header
    const authHeader = request.headers.get("X-API-Key");
    if (!authHeader || !this.safeCompare(authHeader, this.env.AGENT_SECRET)) {
      return new Response("Unauthorized", { status: 401 });
    }

    // 2. Process Request
    return new Response("Secure Data");
  }

  // Safe Comparison Helper
  safeCompare(a: string, b: string) {
    const enc = new TextEncoder();
    const aBuf = enc.encode(a);
    const bBuf = enc.encode(b);
    if (aBuf.byteLength !== bBuf.byteLength) return false;
    return crypto.subtle.timingSafeEqual(aBuf, bBuf);
  }
}
```
