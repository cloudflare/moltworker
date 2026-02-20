import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cloudflareApi } from './tools-cloudflare';
import { AVAILABLE_TOOLS, TOOLS_WITHOUT_BROWSER, executeTool } from './tools';

/** Helper: mock fetch to return a successful MCP response (init + tool call) */
function mockMcpFetch(toolResult: unknown) {
  let callCount = 0;
  return vi.fn().mockImplementation(() => {
    callCount++;
    if (callCount === 1) {
      return Promise.resolve({
        ok: true,
        headers: new Headers({ 'Mcp-Session-Id': 'test-session', 'Content-Type': 'application/json' }),
        json: () => Promise.resolve({
          jsonrpc: '2.0',
          id: 1,
          result: {
            protocolVersion: '2025-03-26',
            capabilities: {},
            serverInfo: { name: 'cloudflare-mcp', version: '1.0.0' },
          },
        }),
      });
    }
    return Promise.resolve({
      ok: true,
      headers: new Headers({ 'Content-Type': 'application/json' }),
      json: () => Promise.resolve({
        jsonrpc: '2.0',
        id: callCount,
        result: toolResult,
      }),
    });
  });
}

describe('cloudflare_api tool definition', () => {
  it('should be in AVAILABLE_TOOLS', () => {
    const tool = AVAILABLE_TOOLS.find(t => t.function.name === 'cloudflare_api');
    expect(tool).toBeDefined();
    expect(tool!.function.parameters.properties.action).toBeDefined();
    expect(tool!.function.parameters.properties.action.enum).toEqual(['search', 'execute']);
    expect(tool!.function.parameters.properties.query).toBeDefined();
    expect(tool!.function.parameters.properties.code).toBeDefined();
    expect(tool!.function.parameters.required).toEqual(['action']);
  });

  it('should be in TOOLS_WITHOUT_BROWSER (does not need browser)', () => {
    const tool = TOOLS_WITHOUT_BROWSER.find(t => t.function.name === 'cloudflare_api');
    expect(tool).toBeDefined();
  });
});

describe('cloudflareApi function', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should return error when no API token provided', async () => {
    const result = await cloudflareApi('search', 'test', undefined, undefined);
    expect(result).toContain('CLOUDFLARE_API_TOKEN is not configured');
  });

  it('should return error for invalid action', async () => {
    const result = await cloudflareApi('invalid', 'test', undefined, 'token');
    expect(result).toContain('Invalid action');
  });

  it('should return error when search query is missing', async () => {
    const result = await cloudflareApi('search', undefined, undefined, 'token');
    expect(result).toContain('"query" parameter is required');
  });

  it('should return error when execute code is missing', async () => {
    const result = await cloudflareApi('execute', undefined, undefined, 'token');
    expect(result).toContain('"code" parameter is required');
  });

  it('should call search and return results', async () => {
    vi.stubGlobal('fetch', mockMcpFetch({
      content: [{ type: 'text', text: 'GET /accounts/{id}/r2/buckets' }],
    }));

    const result = await cloudflareApi('search', 'R2 buckets', undefined, 'test-token');
    expect(result).toContain('/r2/buckets');
  });

  it('should call execute and return results', async () => {
    vi.stubGlobal('fetch', mockMcpFetch({
      content: [{ type: 'text', text: '{"status":"ok"}' }],
    }));

    const result = await cloudflareApi('execute', undefined, 'return await api.get("/user")', 'test-token');
    expect(result).toContain('"status":"ok"');
  });

  it('should handle MCP error responses gracefully', async () => {
    vi.stubGlobal('fetch', mockMcpFetch({
      content: [{ type: 'text', text: 'Unauthorized' }],
      isError: true,
    }));

    const result = await cloudflareApi('search', 'test', undefined, 'bad-token');
    expect(result).toContain('Error from Cloudflare MCP');
    expect(result).toContain('Unauthorized');
  });

  it('should handle network errors gracefully', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

    const result = await cloudflareApi('search', 'test', undefined, 'token');
    expect(result).toContain('Error calling Cloudflare MCP');
    expect(result).toContain('Network error');
  });

  it('should truncate long results', async () => {
    const longText = 'x'.repeat(60_000);
    vi.stubGlobal('fetch', mockMcpFetch({
      content: [{ type: 'text', text: longText }],
    }));

    const result = await cloudflareApi('search', 'test', undefined, 'token');
    expect(result.length).toBeLessThanOrEqual(50_020); // 50000 + "...(truncated)" + newline
    expect(result).toContain('...(truncated)');
  });
});

describe('cloudflare_api via executeTool', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should dispatch to cloudflareApi via executeTool switch', async () => {
    vi.stubGlobal('fetch', mockMcpFetch({
      content: [{ type: 'text', text: 'Workers list result' }],
    }));

    const result = await executeTool(
      {
        id: 'call_cf_1',
        type: 'function',
        function: {
          name: 'cloudflare_api',
          arguments: JSON.stringify({ action: 'search', query: 'workers list' }),
        },
      },
      { cloudflareApiToken: 'test-token' }
    );

    expect(result.role).toBe('tool');
    expect(result.tool_call_id).toBe('call_cf_1');
    expect(result.content).toContain('Workers list result');
  });

  it('should return error when token not in context', async () => {
    const result = await executeTool(
      {
        id: 'call_cf_2',
        type: 'function',
        function: {
          name: 'cloudflare_api',
          arguments: JSON.stringify({ action: 'search', query: 'test' }),
        },
      },
      {} // no cloudflareApiToken
    );

    expect(result.content).toContain('CLOUDFLARE_API_TOKEN is not configured');
  });
});
