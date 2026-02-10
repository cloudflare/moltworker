---
trigger: always_on
---

# Rule 01: Agent Architecture & State Management

## Context

Use this rule when creating the core logic of an AI Agent. This defines how the Agent interacts with the world (HTTP/WebSockets) and how it persists data.

## Standards

1.  **Base Class Extension**: All Agents **MUST** extend the `Agent<Env, State>` class from the `agents` SDK.
2.  **State Management**:
    - Use `this.setState(newState)` for high-level, reactive state that needs to sync with frontend clients (via `useAgent`).
    - Use `this.sql` for high-volume, structured data, logs, or vector storage. Do not rely on `setState` for large datasets (>1MB).
3.  **Addressing & Routing**:
    - Implement `routeAgentRequest(request, env)` in the `fetch` handler to support automatic routing based on URL paths.
    - Use `getAgentByName` for deterministic addressing.
4.  **Type Safety**: Define distinct `Env` and `State` interfaces.

## Code Pattern

```typescript
import { Agent, AgentNamespace, routeAgentRequest } from "agents";

interface Env {
  // Binding to self is required for internal addressing
  MY_AGENT: AgentNamespace<MyAgent>;
}

interface AgentState {
  conversations: number;
  lastActive: string;
}

export class MyAgent extends Agent<Env, AgentState> {
  // 1. Initialize State
  async onStart() {
    this.setState({
      conversations: 0,
      lastActive: new Date().toISOString()
    });
    // SQL is automatically available via this.sql
    await this.sql`CREATE TABLE IF NOT EXISTS logs (id INTEGER PRIMARY KEY, msg TEXT)`;
  }

  // 2. Handle HTTP Requests (REST API style)
  async onRequest(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/status") {
      return Response.json(this.state);
    }
    return new Response("Not Found", { status: 404 });
  }

  // 3. Handle WebSocket Connections (Realtime)
  async onConnect(connection: Connection) {
    // Auto-accept is handled, but you can reject here based on auth
    await this.saveLog("New connection established");
  }

  async saveLog(msg: string) {
    await this.sql`INSERT INTO logs (msg) VALUES (${msg})`;
  }
}

export default {
  fetch(req, env) {
    return routeAgentRequest(req, env) || new Response("No Agent Found", { status: 404 });
  }
};
```
