import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AVAILABLE_TOOLS, TOOLS_WITHOUT_BROWSER, executeTool } from './tools';

describe('url_metadata tool', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should be included in AVAILABLE_TOOLS', () => {
    const tool = AVAILABLE_TOOLS.find(t => t.function.name === 'url_metadata');
    expect(tool).toBeDefined();
    expect(tool!.function.parameters.required).toEqual(['url']);
  });

  it('should be included in TOOLS_WITHOUT_BROWSER', () => {
    const tool = TOOLS_WITHOUT_BROWSER.find(t => t.function.name === 'url_metadata');
    expect(tool).toBeDefined();
  });

  it('should return structured metadata on success', async () => {
    const mockResponse = {
      status: 'success',
      data: {
        title: 'Example Title',
        description: 'Example description of the page.',
        image: { url: 'https://example.com/image.png' },
        author: 'John Doe',
        publisher: 'Example Publisher',
        date: '2026-01-15T00:00:00.000Z',
      },
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    }));

    const result = await executeTool({
      id: 'call_1',
      type: 'function',
      function: {
        name: 'url_metadata',
        arguments: JSON.stringify({ url: 'https://example.com' }),
      },
    });

    expect(result.role).toBe('tool');
    expect(result.tool_call_id).toBe('call_1');

    const parsed = JSON.parse(result.content);
    expect(parsed.title).toBe('Example Title');
    expect(parsed.description).toBe('Example description of the page.');
    expect(parsed.image).toBe('https://example.com/image.png');
    expect(parsed.author).toBe('John Doe');
    expect(parsed.publisher).toBe('Example Publisher');
    expect(parsed.date).toBe('2026-01-15T00:00:00.000Z');
  });

  it('should return null for missing metadata fields', async () => {
    const mockResponse = {
      status: 'success',
      data: {
        title: 'Minimal Page',
      },
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    }));

    const result = await executeTool({
      id: 'call_2',
      type: 'function',
      function: {
        name: 'url_metadata',
        arguments: JSON.stringify({ url: 'https://example.com/minimal' }),
      },
    });

    const parsed = JSON.parse(result.content);
    expect(parsed.title).toBe('Minimal Page');
    expect(parsed.description).toBeNull();
    expect(parsed.image).toBeNull();
    expect(parsed.author).toBeNull();
  });

  it('should handle Microlink API failure status', async () => {
    const mockResponse = {
      status: 'fail',
      message: 'The URL is not reachable',
      data: {},
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    }));

    const result = await executeTool({
      id: 'call_3',
      type: 'function',
      function: {
        name: 'url_metadata',
        arguments: JSON.stringify({ url: 'https://unreachable.example.com' }),
      },
    });

    expect(result.content).toContain('Error: The URL is not reachable');
  });

  it('should handle HTTP errors from Microlink API', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    }));

    const result = await executeTool({
      id: 'call_4',
      type: 'function',
      function: {
        name: 'url_metadata',
        arguments: JSON.stringify({ url: 'https://example.com' }),
      },
    });

    expect(result.content).toContain('Error executing url_metadata');
    expect(result.content).toContain('HTTP 500');
  });

  it('should handle invalid URL argument', async () => {
    const result = await executeTool({
      id: 'call_5',
      type: 'function',
      function: {
        name: 'url_metadata',
        arguments: JSON.stringify({ url: 'not-a-valid-url' }),
      },
    });

    expect(result.content).toContain('Error executing url_metadata');
    expect(result.content).toContain('Invalid URL');
  });

  it('should handle invalid JSON arguments', async () => {
    const result = await executeTool({
      id: 'call_6',
      type: 'function',
      function: {
        name: 'url_metadata',
        arguments: 'not-json',
      },
    });

    expect(result.content).toContain('Error: Invalid JSON arguments');
  });

  it('should encode URL parameter correctly', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        status: 'success',
        data: { title: 'Test' },
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await executeTool({
      id: 'call_7',
      type: 'function',
      function: {
        name: 'url_metadata',
        arguments: JSON.stringify({ url: 'https://example.com/path?q=hello world&lang=en' }),
      },
    });

    const calledUrl = mockFetch.mock.calls[0][0];
    expect(calledUrl).toContain('api.microlink.io');
    expect(calledUrl).toContain(encodeURIComponent('https://example.com/path?q=hello world&lang=en'));
  });
});
