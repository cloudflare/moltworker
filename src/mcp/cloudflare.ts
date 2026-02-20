/**
 * Cloudflare MCP client — connects to the official Cloudflare MCP server
 * at https://mcp.cloudflare.com/mcp and exposes search() + execute() helpers.
 *
 * Code Mode lets an LLM agent access the entire Cloudflare API (2 500+ endpoints)
 * in ~1 000 tokens via progressive discovery.
 */

import { McpClient, type McpToolResult } from './client';

const CLOUDFLARE_MCP_URL = 'https://mcp.cloudflare.com/mcp';

export interface CloudflareSearchResult {
  text: string;
  isError: boolean;
}

export interface CloudflareExecuteResult {
  text: string;
  isError: boolean;
}

/**
 * Wrapper around the Cloudflare MCP server.
 *
 * Usage:
 *   const cf = new CloudflareMcpClient(apiToken);
 *   await cf.connect();
 *   const endpoints = await cf.search('list R2 buckets');
 *   const result = await cf.execute('const resp = await api.get(...)');
 */
export class CloudflareMcpClient {
  private client: McpClient;
  private initialized = false;

  constructor(apiToken: string, serverUrl?: string) {
    this.client = new McpClient({
      serverUrl: serverUrl ?? CLOUDFLARE_MCP_URL,
      authToken: apiToken,
    });
  }

  /** Initialize the MCP session. Idempotent — safe to call multiple times. */
  async connect(): Promise<void> {
    if (this.initialized) return;
    await this.client.initialize();
    this.initialized = true;
  }

  /** Search the Cloudflare API spec for endpoints matching `query`. */
  async search(query: string): Promise<CloudflareSearchResult> {
    await this.connect();
    const result = await this.client.callTool('search', { query });
    return formatToolResult(result);
  }

  /**
   * Execute a TypeScript snippet against the Cloudflare typed SDK.
   * The snippet runs in a sandboxed Dynamic Worker Loader isolate.
   */
  async execute(code: string): Promise<CloudflareExecuteResult> {
    await this.connect();
    const result = await this.client.callTool('execute', { code });
    return formatToolResult(result);
  }
}

/** Extract text from an MCP tool result. */
function formatToolResult(result: McpToolResult): { text: string; isError: boolean } {
  const text = result.content
    .map(c => c.text ?? '')
    .filter(Boolean)
    .join('\n');
  return { text: text || '(empty response)', isError: result.isError ?? false };
}
