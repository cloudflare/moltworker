/**
 * Cloudflare API tool — powered by Cloudflare Code Mode MCP.
 *
 * Provides two actions:
 *   - search: progressively discover Cloudflare API endpoints (~read-only, cacheable)
 *   - execute: run TypeScript code against the typed Cloudflare SDK (mutation, NOT cacheable)
 *
 * Extracted from tools.ts to keep file sizes manageable.
 */

import { CloudflareMcpClient } from '../mcp/cloudflare';

const MAX_RESULT_LENGTH = 50_000; // Same limit as other tools in tools.ts

/**
 * Execute the cloudflare_api tool.
 *
 * @param action  "search" or "execute"
 * @param query   Search query (when action = "search")
 * @param code    TypeScript snippet (when action = "execute")
 * @param apiToken  Cloudflare API token from ToolContext
 */
export async function cloudflareApi(
  action: string,
  query: string | undefined,
  code: string | undefined,
  apiToken: string | undefined,
): Promise<string> {
  if (!apiToken) {
    return 'Error: CLOUDFLARE_API_TOKEN is not configured. Please set it in your environment variables.';
  }

  if (action !== 'search' && action !== 'execute') {
    return `Error: Invalid action "${action}". Must be "search" or "execute".`;
  }

  const client = new CloudflareMcpClient(apiToken);

  try {
    if (action === 'search') {
      if (!query) {
        return 'Error: "query" parameter is required for search action.';
      }
      const result = await client.search(query);
      if (result.isError) {
        return `Error from Cloudflare MCP: ${result.text}`;
      }
      return truncate(result.text);
    }

    // action === 'execute'
    if (!code) {
      return 'Error: "code" parameter is required for execute action.';
    }
    const result = await client.execute(code);
    if (result.isError) {
      return `Error from Cloudflare MCP: ${result.text}`;
    }
    return truncate(result.text);
  } catch (error) {
    return `Error calling Cloudflare MCP: ${error instanceof Error ? error.message : String(error)}`;
  }
}

function truncate(text: string): string {
  if (text.length <= MAX_RESULT_LENGTH) return text;
  return text.slice(0, MAX_RESULT_LENGTH) + '\n...(truncated)';
}
