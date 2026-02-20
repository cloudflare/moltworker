import { describe, it, expect, vi, beforeEach } from 'vitest';
import { McpClient } from './client';

describe('McpClient', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create a client with required options', () => {
      const client = new McpClient({ serverUrl: 'https://mcp.example.com/mcp' });
      expect(client).toBeDefined();
      expect(client.getSessionId()).toBeNull();
    });
  });

  describe('rpc', () => {
    it('should send JSON-RPC request with correct format', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers(),
        json: () => Promise.resolve({
          jsonrpc: '2.0',
          id: 1,
          result: { greeting: 'hello' },
        }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const client = new McpClient({ serverUrl: 'https://mcp.example.com/mcp' });
      const result = await client.rpc<{ greeting: string }>('test/method', { key: 'value' });

      expect(result).toEqual({ greeting: 'hello' });
      expect(mockFetch).toHaveBeenCalledOnce();

      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toBe('https://mcp.example.com/mcp');
      const body = JSON.parse(opts.body);
      expect(body.jsonrpc).toBe('2.0');
      expect(body.method).toBe('test/method');
      expect(body.params).toEqual({ key: 'value' });
      expect(body.id).toBe(1);
    });

    it('should include auth token when provided', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers(),
        json: () => Promise.resolve({ jsonrpc: '2.0', id: 1, result: {} }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const client = new McpClient({
        serverUrl: 'https://mcp.example.com/mcp',
        authToken: 'test-token-123',
      });
      await client.rpc('test');

      const headers = mockFetch.mock.calls[0][1].headers;
      expect(headers['Authorization']).toBe('Bearer test-token-123');
    });

    it('should track session ID from response header', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ 'Mcp-Session-Id': 'session-abc-123' }),
        json: () => Promise.resolve({ jsonrpc: '2.0', id: 1, result: {} }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const client = new McpClient({ serverUrl: 'https://mcp.example.com/mcp' });
      await client.rpc('test');

      expect(client.getSessionId()).toBe('session-abc-123');
    });

    it('should send session ID on subsequent requests', async () => {
      let callCount = 0;
      const mockFetch = vi.fn().mockImplementation(() => {
        callCount++;
        return Promise.resolve({
          ok: true,
          headers: callCount === 1
            ? new Headers({ 'Mcp-Session-Id': 'session-xyz' })
            : new Headers(),
          json: () => Promise.resolve({ jsonrpc: '2.0', id: callCount, result: {} }),
        });
      });
      vi.stubGlobal('fetch', mockFetch);

      const client = new McpClient({ serverUrl: 'https://mcp.example.com/mcp' });
      await client.rpc('first');
      await client.rpc('second');

      const secondHeaders = mockFetch.mock.calls[1][1].headers;
      expect(secondHeaders['Mcp-Session-Id']).toBe('session-xyz');
    });

    it('should throw on HTTP error response', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        text: () => Promise.resolve('Unauthorized'),
      }));

      const client = new McpClient({ serverUrl: 'https://mcp.example.com/mcp' });
      await expect(client.rpc('test')).rejects.toThrow('MCP server returned 401');
    });

    it('should throw on JSON-RPC error', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers(),
        json: () => Promise.resolve({
          jsonrpc: '2.0',
          id: 1,
          error: { code: -32600, message: 'Invalid Request' },
        }),
      }));

      const client = new McpClient({ serverUrl: 'https://mcp.example.com/mcp' });
      await expect(client.rpc('test')).rejects.toThrow('MCP RPC error -32600: Invalid Request');
    });

    it('should handle SSE response format', async () => {
      const sseBody = [
        'data: {"jsonrpc":"2.0","id":1,"result":{"tools":[{"name":"search"}]}}',
        '',
        '',
      ].join('\n');

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ 'Content-Type': 'text/event-stream' }),
        text: () => Promise.resolve(sseBody),
      }));

      const client = new McpClient({ serverUrl: 'https://mcp.example.com/mcp' });
      const result = await client.rpc<{ tools: Array<{ name: string }> }>('tools/list');

      expect(result.tools).toHaveLength(1);
      expect(result.tools[0].name).toBe('search');
    });

    it('should handle SSE with multiple events', async () => {
      const sseBody = [
        'data: {"jsonrpc":"2.0","id":99,"result":{"other":"data"}}',
        '',
        'data: {"jsonrpc":"2.0","id":1,"result":{"found":"me"}}',
        '',
        '',
      ].join('\n');

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ 'Content-Type': 'text/event-stream' }),
        text: () => Promise.resolve(sseBody),
      }));

      const client = new McpClient({ serverUrl: 'https://mcp.example.com/mcp' });
      const result = await client.rpc<{ found: string }>('test');
      expect(result.found).toBe('me');
    });

    it('should throw when SSE has no matching response', async () => {
      const sseBody = 'data: {"jsonrpc":"2.0","id":99,"result":{}}\n\n';

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ 'Content-Type': 'text/event-stream' }),
        text: () => Promise.resolve(sseBody),
      }));

      const client = new McpClient({ serverUrl: 'https://mcp.example.com/mcp' });
      await expect(client.rpc('test')).rejects.toThrow('No matching JSON-RPC response');
    });

    it('should increment request IDs', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers(),
        json: () => Promise.resolve({ jsonrpc: '2.0', id: 0, result: {} }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const client = new McpClient({ serverUrl: 'https://mcp.example.com/mcp' });
      await client.rpc('first');
      await client.rpc('second');

      const firstBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      const secondBody = JSON.parse(mockFetch.mock.calls[1][1].body);
      expect(firstBody.id).toBe(1);
      expect(secondBody.id).toBe(2);
    });
  });

  describe('initialize', () => {
    it('should send initialize with correct protocol version', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ 'Mcp-Session-Id': 'init-session' }),
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
      vi.stubGlobal('fetch', mockFetch);

      const client = new McpClient({ serverUrl: 'https://mcp.example.com/mcp' });
      const result = await client.initialize();

      expect(result.protocolVersion).toBe('2025-03-26');
      expect(result.serverInfo.name).toBe('cloudflare-mcp');

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.method).toBe('initialize');
      expect(body.params.protocolVersion).toBe('2025-03-26');
      expect(body.params.clientInfo.name).toBe('moltworker');
    });
  });

  describe('listTools', () => {
    it('should return tool definitions', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers(),
        json: () => Promise.resolve({
          jsonrpc: '2.0',
          id: 1,
          result: {
            tools: [
              { name: 'search', description: 'Search the API' },
              { name: 'execute', description: 'Execute code' },
            ],
          },
        }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const client = new McpClient({ serverUrl: 'https://mcp.example.com/mcp' });
      const tools = await client.listTools();

      expect(tools).toHaveLength(2);
      expect(tools[0].name).toBe('search');
      expect(tools[1].name).toBe('execute');
    });
  });

  describe('callTool', () => {
    it('should call tool with name and arguments', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers(),
        json: () => Promise.resolve({
          jsonrpc: '2.0',
          id: 1,
          result: {
            content: [{ type: 'text', text: 'Found 3 endpoints' }],
          },
        }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const client = new McpClient({ serverUrl: 'https://mcp.example.com/mcp' });
      const result = await client.callTool('search', { query: 'R2 buckets' });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].text).toBe('Found 3 endpoints');

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.method).toBe('tools/call');
      expect(body.params.name).toBe('search');
      expect(body.params.arguments).toEqual({ query: 'R2 buckets' });
    });

    it('should handle error results', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers(),
        json: () => Promise.resolve({
          jsonrpc: '2.0',
          id: 1,
          result: {
            content: [{ type: 'text', text: 'Authentication failed' }],
            isError: true,
          },
        }),
      }));

      const client = new McpClient({ serverUrl: 'https://mcp.example.com/mcp' });
      const result = await client.callTool('execute', { code: 'test' });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toBe('Authentication failed');
    });
  });

  describe('extra headers', () => {
    it('should include custom headers in requests', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers(),
        json: () => Promise.resolve({ jsonrpc: '2.0', id: 1, result: {} }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const client = new McpClient({
        serverUrl: 'https://mcp.example.com/mcp',
        headers: { 'X-Custom': 'value' },
      });
      await client.rpc('test');

      const headers = mockFetch.mock.calls[0][1].headers;
      expect(headers['X-Custom']).toBe('value');
    });
  });
});
