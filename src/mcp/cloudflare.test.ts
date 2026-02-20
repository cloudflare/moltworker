import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CloudflareMcpClient } from './cloudflare';

/** Helper: mock fetch to return a successful MCP JSON-RPC response */
function mockMcpResponse(result: unknown) {
  let callCount = 0;
  return vi.fn().mockImplementation(() => {
    callCount++;
    // First call = initialize, subsequent = actual tool call
    if (callCount === 1) {
      return Promise.resolve({
        ok: true,
        headers: new Headers({ 'Mcp-Session-Id': 'test-session', 'Content-Type': 'application/json' }),
        json: () => Promise.resolve({
          jsonrpc: '2.0',
          id: 1,
          result: {
            protocolVersion: '2025-03-26',
            capabilities: { tools: {} },
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
        result,
      }),
    });
  });
}

describe('CloudflareMcpClient', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('search', () => {
    it('should return search results as text', async () => {
      const mockFetch = mockMcpResponse({
        content: [
          { type: 'text', text: 'GET /accounts/{id}/r2/buckets - List R2 buckets' },
          { type: 'text', text: 'POST /accounts/{id}/r2/buckets - Create R2 bucket' },
        ],
      });
      vi.stubGlobal('fetch', mockFetch);

      const client = new CloudflareMcpClient('test-api-token');
      const result = await client.search('R2 buckets');

      expect(result.isError).toBe(false);
      expect(result.text).toContain('List R2 buckets');
      expect(result.text).toContain('Create R2 bucket');
    });

    it('should auto-initialize on first call', async () => {
      const mockFetch = mockMcpResponse({
        content: [{ type: 'text', text: 'results' }],
      });
      vi.stubGlobal('fetch', mockFetch);

      const client = new CloudflareMcpClient('test-api-token');
      await client.search('test');

      // Should have called fetch twice: initialize + search
      expect(mockFetch).toHaveBeenCalledTimes(2);

      // First call should be initialize
      const initBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(initBody.method).toBe('initialize');

      // Second call should be tools/call with search
      const searchBody = JSON.parse(mockFetch.mock.calls[1][1].body);
      expect(searchBody.method).toBe('tools/call');
      expect(searchBody.params.name).toBe('search');
    });

    it('should not re-initialize on subsequent calls', async () => {
      const mockFetch = mockMcpResponse({
        content: [{ type: 'text', text: 'results' }],
      });
      vi.stubGlobal('fetch', mockFetch);

      const client = new CloudflareMcpClient('test-api-token');
      await client.search('first');
      await client.search('second');

      // 1 initialize + 2 tool calls = 3 total
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('should pass auth token in requests', async () => {
      const mockFetch = mockMcpResponse({
        content: [{ type: 'text', text: 'ok' }],
      });
      vi.stubGlobal('fetch', mockFetch);

      const client = new CloudflareMcpClient('my-cf-token-abc');
      await client.search('test');

      const headers = mockFetch.mock.calls[0][1].headers;
      expect(headers['Authorization']).toBe('Bearer my-cf-token-abc');
    });

    it('should handle error responses', async () => {
      const mockFetch = mockMcpResponse({
        content: [{ type: 'text', text: 'No endpoints found' }],
        isError: true,
      });
      vi.stubGlobal('fetch', mockFetch);

      const client = new CloudflareMcpClient('test-token');
      const result = await client.search('nonexistent');

      expect(result.isError).toBe(true);
      expect(result.text).toBe('No endpoints found');
    });

    it('should return "(empty response)" when no text content', async () => {
      const mockFetch = mockMcpResponse({
        content: [{ type: 'image', data: 'abc' }],
      });
      vi.stubGlobal('fetch', mockFetch);

      const client = new CloudflareMcpClient('test-token');
      const result = await client.search('test');

      expect(result.text).toBe('(empty response)');
    });
  });

  describe('execute', () => {
    it('should execute code and return result', async () => {
      const mockFetch = mockMcpResponse({
        content: [{ type: 'text', text: '{"buckets":["bucket-1","bucket-2"]}' }],
      });
      vi.stubGlobal('fetch', mockFetch);

      const client = new CloudflareMcpClient('test-token');
      const result = await client.execute('const resp = await api.get("/r2/buckets"); return resp;');

      expect(result.isError).toBe(false);
      expect(result.text).toContain('bucket-1');
    });

    it('should pass code to execute tool', async () => {
      const mockFetch = mockMcpResponse({
        content: [{ type: 'text', text: 'ok' }],
      });
      vi.stubGlobal('fetch', mockFetch);

      const client = new CloudflareMcpClient('test-token');
      await client.execute('console.log("hello")');

      const callBody = JSON.parse(mockFetch.mock.calls[1][1].body);
      expect(callBody.params.name).toBe('execute');
      expect(callBody.params.arguments).toEqual({ code: 'console.log("hello")' });
    });
  });

  describe('custom server URL', () => {
    it('should allow overriding the MCP server URL', async () => {
      const mockFetch = mockMcpResponse({
        content: [{ type: 'text', text: 'ok' }],
      });
      vi.stubGlobal('fetch', mockFetch);

      const client = new CloudflareMcpClient('test-token', 'https://custom-mcp.example.com/mcp');
      await client.search('test');

      const url = mockFetch.mock.calls[0][0];
      expect(url).toBe('https://custom-mcp.example.com/mcp');
    });
  });
});
