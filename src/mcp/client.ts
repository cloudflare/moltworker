/**
 * Generic MCP (Model Context Protocol) HTTP client.
 *
 * Implements the Streamable HTTP transport:
 *   - JSON-RPC 2.0 messages POSTed to a single endpoint
 *   - Session ID tracked via `Mcp-Session-Id` header
 *   - Responses may be JSON or SSE; we handle both
 *
 * Reference: https://modelcontextprotocol.io/specification/2025-03-26/basic/transports#streamable-http
 */

// ── JSON-RPC 2.0 types ────────────────────────────────────────────

export interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: number;
  method: string;
  params?: Record<string, unknown>;
}

export interface JsonRpcResponse<T = unknown> {
  jsonrpc: '2.0';
  id: number;
  result?: T;
  error?: { code: number; message: string; data?: unknown };
}

// ── MCP-specific types ─────────────────────────────────────────────

export interface McpToolDefinition {
  name: string;
  description?: string;
  inputSchema?: Record<string, unknown>;
}

export interface McpToolResult {
  content: Array<{ type: string; text?: string; data?: string; mimeType?: string }>;
  isError?: boolean;
}

export interface McpServerInfo {
  name: string;
  version: string;
}

export interface McpInitResult {
  protocolVersion: string;
  capabilities: Record<string, unknown>;
  serverInfo: McpServerInfo;
}

// ── Client ─────────────────────────────────────────────────────────

export interface McpClientOptions {
  /** Full URL of the MCP server endpoint (e.g. https://mcp.cloudflare.com/mcp) */
  serverUrl: string;
  /** Bearer token for Authorization header */
  authToken?: string;
  /** Extra headers to send with every request */
  headers?: Record<string, string>;
  /** Request timeout in milliseconds (default: 30 000) */
  timeoutMs?: number;
}

export class McpClient {
  private serverUrl: string;
  private authToken?: string;
  private extraHeaders: Record<string, string>;
  private timeoutMs: number;
  private sessionId: string | null = null;
  private nextId = 1;

  constructor(options: McpClientOptions) {
    this.serverUrl = options.serverUrl;
    this.authToken = options.authToken;
    this.extraHeaders = options.headers ?? {};
    this.timeoutMs = options.timeoutMs ?? 30_000;
  }

  // ── Low-level RPC ──────────────────────────────────────────────

  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
      ...this.extraHeaders,
    };
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    if (this.sessionId) {
      headers['Mcp-Session-Id'] = this.sessionId;
    }
    return headers;
  }

  /**
   * Send a JSON-RPC request and return the parsed result.
   * Handles both plain JSON and SSE response formats.
   */
  async rpc<T = unknown>(method: string, params?: Record<string, unknown>): Promise<T> {
    const body: JsonRpcRequest = {
      jsonrpc: '2.0',
      id: this.nextId++,
      method,
      ...(params !== undefined && { params }),
    };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(this.serverUrl, {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`MCP server returned ${response.status}: ${text.slice(0, 500)}`);
      }

      // Track session ID
      const newSessionId = response.headers.get('Mcp-Session-Id');
      if (newSessionId) {
        this.sessionId = newSessionId;
      }

      const contentType = response.headers.get('Content-Type') ?? '';

      if (contentType.includes('text/event-stream')) {
        return this.parseSSE<T>(response, body.id);
      }

      const json = (await response.json()) as JsonRpcResponse<T>;
      if (json.error) {
        throw new Error(`MCP RPC error ${json.error.code}: ${json.error.message}`);
      }
      return json.result as T;
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Parse a Server-Sent Events response, extracting the JSON-RPC result
   * that matches the given request `id`.
   */
  private async parseSSE<T>(response: Response, requestId: number): Promise<T> {
    const text = await response.text();
    const lines = text.split('\n');
    let dataBuffer = '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        dataBuffer += line.slice(6);
      } else if (line === '' && dataBuffer) {
        // End of an SSE event — try to parse
        try {
          const json = JSON.parse(dataBuffer) as JsonRpcResponse<T>;
          if (json.id === requestId) {
            if (json.error) {
              throw new Error(`MCP RPC error ${json.error.code}: ${json.error.message}`);
            }
            return json.result as T;
          }
        } catch (e) {
          if (e instanceof Error && e.message.startsWith('MCP RPC error')) throw e;
          // Not valid JSON or wrong id — continue
        }
        dataBuffer = '';
      }
    }

    // Fallback: try parsing the entire accumulated data
    if (dataBuffer) {
      try {
        const json = JSON.parse(dataBuffer) as JsonRpcResponse<T>;
        if (json.error) {
          throw new Error(`MCP RPC error ${json.error.code}: ${json.error.message}`);
        }
        return json.result as T;
      } catch (e) {
        if (e instanceof Error && e.message.startsWith('MCP RPC error')) throw e;
      }
    }

    throw new Error('No matching JSON-RPC response found in SSE stream');
  }

  // ── MCP lifecycle ──────────────────────────────────────────────

  /**
   * Perform the MCP initialization handshake.
   * Must be called before any other MCP method.
   */
  async initialize(): Promise<McpInitResult> {
    return this.rpc<McpInitResult>('initialize', {
      protocolVersion: '2025-03-26',
      capabilities: {},
      clientInfo: { name: 'moltworker', version: '1.0.0' },
    });
  }

  /** List all tools the MCP server exposes. */
  async listTools(): Promise<McpToolDefinition[]> {
    const result = await this.rpc<{ tools: McpToolDefinition[] }>('tools/list');
    return result.tools;
  }

  /** Call a tool on the MCP server. */
  async callTool(name: string, args: Record<string, unknown>): Promise<McpToolResult> {
    return this.rpc<McpToolResult>('tools/call', { name, arguments: args });
  }

  /** Get the current session ID (may be null before initialize). */
  getSessionId(): string | null {
    return this.sessionId;
  }
}
