---
trigger: always_on
---

WebSocket Hibernation & Lifecycle

## Context

Use this rule for all WebSocket implementations within Agents or Durable Objects. This ensures serverless scalability and cost efficiency.

## Standards

1.  **No Legacy APIs**: NEVER use `server.accept()` or `addEventListener('message')`. These pin the Worker to memory and increase costs.
2.  **Hibernation API**: You **MUST** use `this.ctx.acceptWebSocket(ws)`.
3.  **Lifecycle Methods**: Implement the specific hibernation handlers: `webSocketMessage`, `webSocketClose`, and `webSocketError`.
4.  **Tagging**: Use `ws.serializeAttachment(data)` and `ws.deserializeAttachment(data)` to attach metadata (like User IDs) to the socket, allowing you to identify _who_ sent a message after the Agent wakes up from hibernation.

## Code Pattern

```typescript
import { DurableObject } from "cloudflare:workers";

export class ChatServer extends DurableObject {
  async fetch(request: Request) {
    const upgrade = request.headers.get("Upgrade");
    if (!upgrade || upgrade !== "websocket") {
      return new Response("Expected Upgrade: websocket", { status: 426 });
    }

    const { 0: client, 1: server } = new WebSocketPair();

    // HIBERNATION: informs runtime to handle keep-alive
    this.ctx.acceptWebSocket(server);

    return new Response(null, { status: 101, webSocket: client });
  }

  // Invoked when a message arrives. The object wakes up only for this.
  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
    // Broadcast to all other connections
    const attachments = ws.deserializeAttachment();
    for (const other of this.ctx.getWebSockets()) {
      if (other !== ws) {
        other.send(`[User ${attachments.id}]: ${message}`);
      }
    }
  }

  async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean) {
    // Cleanup logic
  }

  async webSocketError(ws: WebSocket, error: unknown) {
    console.error("Socket error:", error);
  }
}
```
