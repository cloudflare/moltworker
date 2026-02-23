import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AVAILABLE_TOOLS, TOOLS_WITHOUT_BROWSER, executeTool, generateDailyBriefing, geocodeCity, clearBriefingCache, clearExchangeRateCache, clearCryptoCache, clearGeoCache, clearWebSearchCache, extractCodeIdentifiers, fetchBriefingHolidays, fetchBriefingQuote, type SandboxLike, type SandboxProcess } from './tools';

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

describe('generate_chart tool', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should be included in AVAILABLE_TOOLS', () => {
    const tool = AVAILABLE_TOOLS.find(t => t.function.name === 'generate_chart');
    expect(tool).toBeDefined();
    expect(tool!.function.parameters.required).toEqual(['type', 'labels', 'datasets']);
  });

  it('should be included in TOOLS_WITHOUT_BROWSER', () => {
    const tool = TOOLS_WITHOUT_BROWSER.find(t => t.function.name === 'generate_chart');
    expect(tool).toBeDefined();
  });

  it('should return a QuickChart URL on success', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', mockFetch);

    const result = await executeTool({
      id: 'chart_1',
      type: 'function',
      function: {
        name: 'generate_chart',
        arguments: JSON.stringify({
          type: 'bar',
          labels: '["Jan","Feb","Mar"]',
          datasets: '[{"label":"Sales","data":[10,20,30]}]',
        }),
      },
    });

    expect(result.role).toBe('tool');
    expect(result.tool_call_id).toBe('chart_1');
    expect(result.content).toContain('https://quickchart.io/chart');
    expect(result.content).toContain('w=600');
    expect(result.content).toContain('h=400');
  });

  it('should encode chart config in URL', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', mockFetch);

    const result = await executeTool({
      id: 'chart_2',
      type: 'function',
      function: {
        name: 'generate_chart',
        arguments: JSON.stringify({
          type: 'line',
          labels: '["A","B"]',
          datasets: '[{"label":"Test","data":[1,2]}]',
        }),
      },
    });

    // The URL should contain the encoded chart config
    const expectedConfig = JSON.stringify({
      type: 'line',
      data: { labels: ['A', 'B'], datasets: [{ label: 'Test', data: [1, 2] }] },
    });
    expect(result.content).toContain(encodeURIComponent(expectedConfig));
  });

  it('should verify URL with HEAD request', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', mockFetch);

    await executeTool({
      id: 'chart_3',
      type: 'function',
      function: {
        name: 'generate_chart',
        arguments: JSON.stringify({
          type: 'pie',
          labels: '["A","B"]',
          datasets: '[{"data":[60,40]}]',
        }),
      },
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('quickchart.io/chart'),
      { method: 'HEAD' },
    );
  });

  it('should reject invalid chart type', async () => {
    const result = await executeTool({
      id: 'chart_4',
      type: 'function',
      function: {
        name: 'generate_chart',
        arguments: JSON.stringify({
          type: 'invalid_type',
          labels: '["A"]',
          datasets: '[{"data":[1]}]',
        }),
      },
    });

    expect(result.content).toContain('Error executing generate_chart');
    expect(result.content).toContain('Invalid chart type');
  });

  it('should reject invalid labels JSON', async () => {
    const result = await executeTool({
      id: 'chart_5',
      type: 'function',
      function: {
        name: 'generate_chart',
        arguments: JSON.stringify({
          type: 'bar',
          labels: 'not-json',
          datasets: '[{"data":[1]}]',
        }),
      },
    });

    expect(result.content).toContain('Error executing generate_chart');
    expect(result.content).toContain('Invalid labels JSON');
  });

  it('should reject non-array labels', async () => {
    const result = await executeTool({
      id: 'chart_6',
      type: 'function',
      function: {
        name: 'generate_chart',
        arguments: JSON.stringify({
          type: 'bar',
          labels: '"just a string"',
          datasets: '[{"data":[1]}]',
        }),
      },
    });

    expect(result.content).toContain('Error executing generate_chart');
    expect(result.content).toContain('Labels must be a JSON array');
  });

  it('should reject invalid datasets JSON', async () => {
    const result = await executeTool({
      id: 'chart_7',
      type: 'function',
      function: {
        name: 'generate_chart',
        arguments: JSON.stringify({
          type: 'bar',
          labels: '["A"]',
          datasets: 'not-json',
        }),
      },
    });

    expect(result.content).toContain('Error executing generate_chart');
    expect(result.content).toContain('Invalid datasets JSON');
  });

  it('should reject empty datasets array', async () => {
    const result = await executeTool({
      id: 'chart_8',
      type: 'function',
      function: {
        name: 'generate_chart',
        arguments: JSON.stringify({
          type: 'bar',
          labels: '["A"]',
          datasets: '[]',
        }),
      },
    });

    expect(result.content).toContain('Error executing generate_chart');
    expect(result.content).toContain('non-empty JSON array');
  });

  it('should handle QuickChart HTTP errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
    }));

    const result = await executeTool({
      id: 'chart_9',
      type: 'function',
      function: {
        name: 'generate_chart',
        arguments: JSON.stringify({
          type: 'bar',
          labels: '["A"]',
          datasets: '[{"data":[1]}]',
        }),
      },
    });

    expect(result.content).toContain('Error executing generate_chart');
    expect(result.content).toContain('QuickChart error: HTTP 400');
  });

  it('should support all valid chart types', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', mockFetch);

    const types = ['bar', 'line', 'pie', 'doughnut', 'radar'];
    for (const chartType of types) {
      const result = await executeTool({
        id: `chart_type_${chartType}`,
        type: 'function',
        function: {
          name: 'generate_chart',
          arguments: JSON.stringify({
            type: chartType,
            labels: '["A"]',
            datasets: '[{"data":[1]}]',
          }),
        },
      });

      expect(result.content).toContain('quickchart.io/chart');
    }
  });
});

describe('get_weather tool', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockWeatherResponse = {
    current_weather: {
      temperature: 22.5,
      windspeed: 12.3,
      weathercode: 2,
      time: '2026-02-08T14:00',
    },
    daily: {
      time: ['2026-02-08', '2026-02-09', '2026-02-10'],
      temperature_2m_max: [24.0, 26.1, 23.5],
      temperature_2m_min: [18.0, 19.2, 17.8],
      weathercode: [2, 61, 0],
    },
    timezone: 'Europe/Prague',
  };

  it('should be included in AVAILABLE_TOOLS', () => {
    const tool = AVAILABLE_TOOLS.find(t => t.function.name === 'get_weather');
    expect(tool).toBeDefined();
    expect(tool!.function.parameters.required).toEqual(['latitude', 'longitude']);
  });

  it('should be included in TOOLS_WITHOUT_BROWSER', () => {
    const tool = TOOLS_WITHOUT_BROWSER.find(t => t.function.name === 'get_weather');
    expect(tool).toBeDefined();
  });

  it('should return formatted weather on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockWeatherResponse),
    }));

    const result = await executeTool({
      id: 'weather_1',
      type: 'function',
      function: {
        name: 'get_weather',
        arguments: JSON.stringify({ latitude: '50.08', longitude: '14.44' }),
      },
    });

    expect(result.role).toBe('tool');
    expect(result.tool_call_id).toBe('weather_1');
    expect(result.content).toContain('Europe/Prague');
    expect(result.content).toContain('Partly cloudy');
    expect(result.content).toContain('22.5');
    expect(result.content).toContain('12.3 km/h');
    expect(result.content).toContain('2026-02-08');
    expect(result.content).toContain('2026-02-09');
    expect(result.content).toContain('Slight rain');
    expect(result.content).toContain('Clear sky');
  });

  it('should construct correct API URL', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockWeatherResponse),
    });
    vi.stubGlobal('fetch', mockFetch);

    await executeTool({
      id: 'weather_2',
      type: 'function',
      function: {
        name: 'get_weather',
        arguments: JSON.stringify({ latitude: '48.8566', longitude: '2.3522' }),
      },
    });

    const calledUrl = mockFetch.mock.calls[0][0];
    expect(calledUrl).toContain('api.open-meteo.com');
    expect(calledUrl).toContain('latitude=48.8566');
    expect(calledUrl).toContain('longitude=2.3522');
    expect(calledUrl).toContain('current_weather=true');
    expect(calledUrl).toContain('daily=');
  });

  it('should reject latitude out of range (too high)', async () => {
    const result = await executeTool({
      id: 'weather_3',
      type: 'function',
      function: {
        name: 'get_weather',
        arguments: JSON.stringify({ latitude: '91', longitude: '0' }),
      },
    });

    expect(result.content).toContain('Error executing get_weather');
    expect(result.content).toContain('Invalid latitude');
  });

  it('should reject latitude out of range (too low)', async () => {
    const result = await executeTool({
      id: 'weather_4',
      type: 'function',
      function: {
        name: 'get_weather',
        arguments: JSON.stringify({ latitude: '-91', longitude: '0' }),
      },
    });

    expect(result.content).toContain('Error executing get_weather');
    expect(result.content).toContain('Invalid latitude');
  });

  it('should reject longitude out of range', async () => {
    const result = await executeTool({
      id: 'weather_5',
      type: 'function',
      function: {
        name: 'get_weather',
        arguments: JSON.stringify({ latitude: '0', longitude: '181' }),
      },
    });

    expect(result.content).toContain('Error executing get_weather');
    expect(result.content).toContain('Invalid longitude');
  });

  it('should reject non-numeric latitude', async () => {
    const result = await executeTool({
      id: 'weather_6',
      type: 'function',
      function: {
        name: 'get_weather',
        arguments: JSON.stringify({ latitude: 'abc', longitude: '0' }),
      },
    });

    expect(result.content).toContain('Error executing get_weather');
    expect(result.content).toContain('Invalid latitude');
  });

  it('should handle Open-Meteo API HTTP errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    }));

    const result = await executeTool({
      id: 'weather_7',
      type: 'function',
      function: {
        name: 'get_weather',
        arguments: JSON.stringify({ latitude: '50', longitude: '14' }),
      },
    });

    expect(result.content).toContain('Error executing get_weather');
    expect(result.content).toContain('Open-Meteo API error: HTTP 500');
  });

  it('should accept boundary coordinates', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockWeatherResponse),
    }));

    // Extreme valid values
    const result = await executeTool({
      id: 'weather_8',
      type: 'function',
      function: {
        name: 'get_weather',
        arguments: JSON.stringify({ latitude: '-90', longitude: '-180' }),
      },
    });

    expect(result.content).toContain('Current weather');
  });

  it('should handle unknown weather codes gracefully', async () => {
    const unknownCodeResponse = {
      ...mockWeatherResponse,
      current_weather: { ...mockWeatherResponse.current_weather, weathercode: 999 },
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(unknownCodeResponse),
    }));

    const result = await executeTool({
      id: 'weather_9',
      type: 'function',
      function: {
        name: 'get_weather',
        arguments: JSON.stringify({ latitude: '50', longitude: '14' }),
      },
    });

    expect(result.content).toContain('Unknown');
  });
});

describe('fetch_news tool', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should be included in AVAILABLE_TOOLS', () => {
    const tool = AVAILABLE_TOOLS.find(t => t.function.name === 'fetch_news');
    expect(tool).toBeDefined();
    expect(tool!.function.parameters.required).toEqual(['source']);
    expect(tool!.function.parameters.properties.source.enum).toEqual(['hackernews', 'reddit', 'arxiv']);
  });

  it('should be included in TOOLS_WITHOUT_BROWSER', () => {
    const tool = TOOLS_WITHOUT_BROWSER.find(t => t.function.name === 'fetch_news');
    expect(tool).toBeDefined();
  });

  it('should reject invalid source', async () => {
    const result = await executeTool({
      id: 'news_1',
      type: 'function',
      function: {
        name: 'fetch_news',
        arguments: JSON.stringify({ source: 'invalid_source' }),
      },
    });

    expect(result.content).toContain('Error executing fetch_news');
    expect(result.content).toContain('Invalid source');
  });

  // --- HackerNews tests ---

  it('should fetch HackerNews top stories', async () => {
    const mockIds = [1, 2, 3];
    const mockItems = [
      { id: 1, title: 'Story One', url: 'https://example.com/1', score: 100, by: 'user1', descendants: 50 },
      { id: 2, title: 'Story Two', url: 'https://example.com/2', score: 200, by: 'user2', descendants: 75 },
      { id: 3, title: 'Story Three', url: 'https://example.com/3', score: 150, by: 'user3', descendants: 30 },
    ];

    const mockFetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('topstories.json')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockIds) });
      }
      const id = parseInt(url.split('/item/')[1].split('.json')[0]);
      const item = mockItems.find(i => i.id === id);
      return Promise.resolve({ ok: true, json: () => Promise.resolve(item) });
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await executeTool({
      id: 'news_2',
      type: 'function',
      function: {
        name: 'fetch_news',
        arguments: JSON.stringify({ source: 'hackernews' }),
      },
    });

    expect(result.content).toContain('HackerNews Top Stories');
    expect(result.content).toContain('Story One');
    expect(result.content).toContain('Story Two');
    expect(result.content).toContain('Story Three');
    expect(result.content).toContain('100 points');
    expect(result.content).toContain('user1');
    expect(result.content).toContain('50 comments');
  });

  it('should handle HackerNews API error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
    }));

    const result = await executeTool({
      id: 'news_3',
      type: 'function',
      function: {
        name: 'fetch_news',
        arguments: JSON.stringify({ source: 'hackernews' }),
      },
    });

    expect(result.content).toContain('Error executing fetch_news');
    expect(result.content).toContain('HackerNews API error: HTTP 503');
  });

  it('should handle HackerNews items that fail to load', async () => {
    const mockFetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('topstories.json')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([1, 2]) });
      }
      if (url.includes('/item/1.json')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ id: 1, title: 'Good Story', url: 'https://example.com', score: 10, by: 'user', descendants: 5 }) });
      }
      // Item 2 fails
      return Promise.resolve({ ok: false, status: 404 });
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await executeTool({
      id: 'news_4',
      type: 'function',
      function: {
        name: 'fetch_news',
        arguments: JSON.stringify({ source: 'hackernews' }),
      },
    });

    expect(result.content).toContain('Good Story');
    // Should still work even though item 2 failed
    expect(result.content).toContain('HackerNews Top Stories');
  });

  // --- Reddit tests ---

  it('should fetch Reddit top posts with default subreddit', async () => {
    const mockRedditResponse = {
      data: {
        children: [
          { data: { title: 'Reddit Post 1', url: 'https://example.com/r1', score: 500, permalink: '/r/technology/comments/abc', num_comments: 120, author: 'redditor1' } },
          { data: { title: 'Reddit Post 2', url: 'https://example.com/r2', score: 300, permalink: '/r/technology/comments/def', num_comments: 80, author: 'redditor2' } },
        ],
      },
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockRedditResponse),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await executeTool({
      id: 'news_5',
      type: 'function',
      function: {
        name: 'fetch_news',
        arguments: JSON.stringify({ source: 'reddit' }),
      },
    });

    expect(result.content).toContain('Reddit r/technology');
    expect(result.content).toContain('Reddit Post 1');
    expect(result.content).toContain('500 points');
    expect(result.content).toContain('redditor1');
    expect(result.content).toContain('120 comments');

    const calledUrl = mockFetch.mock.calls[0][0];
    expect(calledUrl).toContain('/r/technology/top.json');
  });

  it('should fetch Reddit posts with custom subreddit', async () => {
    const mockRedditResponse = {
      data: { children: [{ data: { title: 'Crypto News', url: 'https://example.com/c1', score: 100, permalink: '/r/cryptocurrency/comments/xyz', num_comments: 50, author: 'cryptofan' } }] },
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockRedditResponse),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await executeTool({
      id: 'news_6',
      type: 'function',
      function: {
        name: 'fetch_news',
        arguments: JSON.stringify({ source: 'reddit', topic: 'cryptocurrency' }),
      },
    });

    expect(result.content).toContain('Reddit r/cryptocurrency');
    expect(result.content).toContain('Crypto News');

    const calledUrl = mockFetch.mock.calls[0][0];
    expect(calledUrl).toContain('/r/cryptocurrency/top.json');
  });

  it('should handle Reddit API error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
    }));

    const result = await executeTool({
      id: 'news_7',
      type: 'function',
      function: {
        name: 'fetch_news',
        arguments: JSON.stringify({ source: 'reddit' }),
      },
    });

    expect(result.content).toContain('Error executing fetch_news');
    expect(result.content).toContain('Reddit API error: HTTP 429');
  });

  // --- arXiv tests ---

  it('should fetch arXiv papers with default category', async () => {
    const mockXml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <entry>
    <id>http://arxiv.org/abs/2602.12345v1</id>
    <title>Transformers Are All You Still Need</title>
    <summary>We present a novel approach to transformer architectures that improves efficiency.</summary>
    <author><name>Alice Smith</name></author>
    <author><name>Bob Jones</name></author>
  </entry>
  <entry>
    <id>http://arxiv.org/abs/2602.12346v1</id>
    <title>Scaling Laws for Language Models</title>
    <summary>An analysis of scaling properties in large language models.</summary>
    <author><name>Charlie Brown</name></author>
  </entry>
</feed>`;

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(mockXml),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await executeTool({
      id: 'news_8',
      type: 'function',
      function: {
        name: 'fetch_news',
        arguments: JSON.stringify({ source: 'arxiv' }),
      },
    });

    expect(result.content).toContain('arXiv cs.AI Latest Papers');
    expect(result.content).toContain('Transformers Are All You Still Need');
    expect(result.content).toContain('Alice Smith, Bob Jones');
    expect(result.content).toContain('Scaling Laws for Language Models');
    expect(result.content).toContain('Charlie Brown');
    expect(result.content).toContain('arxiv.org/abs/2602.12345');

    const calledUrl = mockFetch.mock.calls[0][0];
    expect(calledUrl).toContain('cat:cs.AI');
  });

  it('should fetch arXiv papers with custom category', async () => {
    const mockXml = `<feed><entry><id>http://arxiv.org/abs/1234</id><title>ML Paper</title><summary>Summary here.</summary><author><name>Author</name></author></entry></feed>`;

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(mockXml),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await executeTool({
      id: 'news_9',
      type: 'function',
      function: {
        name: 'fetch_news',
        arguments: JSON.stringify({ source: 'arxiv', topic: 'cs.LG' }),
      },
    });

    expect(result.content).toContain('arXiv cs.LG Latest Papers');
    expect(result.content).toContain('ML Paper');

    const calledUrl = mockFetch.mock.calls[0][0];
    expect(calledUrl).toContain('cat:cs.LG');
  });

  it('should handle arXiv API error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    }));

    const result = await executeTool({
      id: 'news_10',
      type: 'function',
      function: {
        name: 'fetch_news',
        arguments: JSON.stringify({ source: 'arxiv' }),
      },
    });

    expect(result.content).toContain('Error executing fetch_news');
    expect(result.content).toContain('arXiv API error: HTTP 500');
  });

  it('should handle arXiv empty results', async () => {
    const mockXml = `<feed></feed>`;

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(mockXml),
    }));

    const result = await executeTool({
      id: 'news_11',
      type: 'function',
      function: {
        name: 'fetch_news',
        arguments: JSON.stringify({ source: 'arxiv', topic: 'nonexistent.category' }),
      },
    });

    expect(result.content).toContain('No papers found');
  });

  it('should truncate long arXiv summaries', async () => {
    const longSummary = 'A'.repeat(200);
    const mockXml = `<feed><entry><id>http://arxiv.org/abs/1234</id><title>Long Paper</title><summary>${longSummary}</summary><author><name>Author</name></author></entry></feed>`;

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(mockXml),
    }));

    const result = await executeTool({
      id: 'news_12',
      type: 'function',
      function: {
        name: 'fetch_news',
        arguments: JSON.stringify({ source: 'arxiv' }),
      },
    });

    expect(result.content).toContain('Long Paper');
    expect(result.content).toContain('...');
    // Should not contain the full 200 chars
    expect(result.content).not.toContain(longSummary);
  });
});

describe('generateDailyBriefing', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    clearBriefingCache();
  });

  const mockWeatherResponse = {
    current_weather: {
      temperature: 22.5,
      windspeed: 12.3,
      weathercode: 2,
      time: '2026-02-08T14:00',
    },
    daily: {
      time: ['2026-02-08', '2026-02-09', '2026-02-10'],
      temperature_2m_max: [24.0, 26.1, 23.5],
      temperature_2m_min: [18.0, 19.2, 17.8],
      weathercode: [2, 61, 0],
    },
    timezone: 'Europe/Prague',
  };

  const mockHNIds = [1, 2, 3, 4, 5];
  const mockHNItems = [
    { id: 1, title: 'HN Story One', score: 100, by: 'user1', descendants: 50 },
    { id: 2, title: 'HN Story Two', score: 200, by: 'user2', descendants: 75 },
    { id: 3, title: 'HN Story Three', score: 150, by: 'user3', descendants: 30 },
    { id: 4, title: 'HN Story Four', score: 80, by: 'user4', descendants: 20 },
    { id: 5, title: 'HN Story Five', score: 60, by: 'user5', descendants: 10 },
  ];

  const mockRedditResponse = {
    data: {
      children: [
        { data: { title: 'Reddit Post 1', url: 'https://example.com/r1', score: 500, permalink: '/r/technology/comments/abc', num_comments: 120, author: 'redditor1' } },
        { data: { title: 'Reddit Post 2', url: 'https://example.com/r2', score: 300, permalink: '/r/technology/comments/def', num_comments: 80, author: 'redditor2' } },
        { data: { title: 'Reddit Post 3', url: 'https://example.com/r3', score: 200, permalink: '/r/technology/comments/ghi', num_comments: 40, author: 'redditor3' } },
      ],
    },
  };

  const mockArxivXml = `<?xml version="1.0" encoding="UTF-8"?>
<feed>
  <entry>
    <id>http://arxiv.org/abs/2602.12345v1</id>
    <title>Paper Alpha</title>
    <summary>Summary A</summary>
    <author><name>Author A</name></author>
  </entry>
  <entry>
    <id>http://arxiv.org/abs/2602.12346v1</id>
    <title>Paper Beta</title>
    <summary>Summary B</summary>
    <author><name>Author B</name></author>
  </entry>
  <entry>
    <id>http://arxiv.org/abs/2602.12347v1</id>
    <title>Paper Gamma</title>
    <summary>Summary C</summary>
    <author><name>Author C</name></author>
  </entry>
</feed>`;

  function setupAllMocks() {
    const mockFetch = vi.fn().mockImplementation((url: string) => {
      // Weather
      if (url.includes('open-meteo.com')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockWeatherResponse) });
      }
      // HN top stories
      if (url.includes('topstories.json')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockHNIds) });
      }
      // HN individual items
      if (url.includes('hacker-news.firebaseio.com/v0/item/')) {
        const id = parseInt(url.split('/item/')[1].split('.json')[0]);
        const item = mockHNItems.find(i => i.id === id);
        return Promise.resolve({ ok: true, json: () => Promise.resolve(item || null) });
      }
      // Reddit
      if (url.includes('reddit.com')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockRedditResponse) });
      }
      // arXiv
      if (url.includes('arxiv.org')) {
        return Promise.resolve({ ok: true, text: () => Promise.resolve(mockArxivXml) });
      }
      // Quotable API (for quotes)
      if (url.includes('quotable.io')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([{ content: 'Test quote for briefing', author: 'Test Author' }]) });
      }
      // Advice Slip API (fallback for quotes)
      if (url.includes('adviceslip.com')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ slip: { advice: 'Test advice' } }) });
      }
      return Promise.resolve({ ok: false, status: 404 });
    });
    vi.stubGlobal('fetch', mockFetch);
    return mockFetch;
  }

  it('should return a formatted daily briefing with all sections', async () => {
    setupAllMocks();

    const result = await generateDailyBriefing();

    expect(result).toContain('Daily Briefing');
    expect(result).toContain('Weather');
    expect(result).toContain('22.5');
    expect(result).toContain('HackerNews Top 5');
    expect(result).toContain('HN Story One');
    expect(result).toContain('HN Story Five');
    expect(result).toContain('Reddit r/technology');
    expect(result).toContain('Reddit Post 1');
    expect(result).toContain('arXiv cs.AI');
    expect(result).toContain('Paper Alpha');
    expect(result).toContain('Updates every 15 minutes');
  });

  it('should accept custom location parameters', async () => {
    const mockFetch = setupAllMocks();

    await generateDailyBriefing('40.71', '-74.01', 'programming', 'cs.LG');

    // Verify weather was called with custom coords
    const weatherCall = mockFetch.mock.calls.find((call: unknown[]) => (call[0] as string).includes('open-meteo.com'));
    expect(weatherCall).toBeDefined();
    expect(weatherCall![0]).toContain('latitude=40.71');
    expect(weatherCall![0]).toContain('longitude=-74.01');

    // Verify Reddit was called with custom subreddit
    const redditCall = mockFetch.mock.calls.find((call: unknown[]) => (call[0] as string).includes('reddit.com'));
    expect(redditCall).toBeDefined();
    expect(redditCall![0]).toContain('/r/programming/');

    // Verify arXiv was called with custom category
    const arxivCall = mockFetch.mock.calls.find((call: unknown[]) => (call[0] as string).includes('arxiv.org'));
    expect(arxivCall).toBeDefined();
    expect(arxivCall![0]).toContain('cat:cs.LG');
  });

  it('should cache results for 15 minutes', async () => {
    const mockFetch = setupAllMocks();

    const result1 = await generateDailyBriefing();
    const callCount1 = mockFetch.mock.calls.length;

    const result2 = await generateDailyBriefing();
    const callCount2 = mockFetch.mock.calls.length;

    // Second call should use cache (no new fetch calls)
    expect(result1).toBe(result2);
    expect(callCount1).toBe(callCount2);
  });

  it('should handle partial failures gracefully', async () => {
    // Make weather fail, others succeed
    const mockFetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('open-meteo.com')) {
        return Promise.resolve({ ok: false, status: 503 });
      }
      if (url.includes('topstories.json')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockHNIds) });
      }
      if (url.includes('hacker-news.firebaseio.com/v0/item/')) {
        const id = parseInt(url.split('/item/')[1].split('.json')[0]);
        const item = mockHNItems.find(i => i.id === id);
        return Promise.resolve({ ok: true, json: () => Promise.resolve(item || null) });
      }
      if (url.includes('reddit.com')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockRedditResponse) });
      }
      if (url.includes('arxiv.org')) {
        return Promise.resolve({ ok: true, text: () => Promise.resolve(mockArxivXml) });
      }
      return Promise.resolve({ ok: false, status: 404 });
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await generateDailyBriefing();

    // Weather should show as unavailable
    expect(result).toContain('Unavailable');
    // Other sections should still work
    expect(result).toContain('HN Story One');
    expect(result).toContain('Reddit Post 1');
    expect(result).toContain('Paper Alpha');
  });

  it('should handle all sections failing', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    }));

    const result = await generateDailyBriefing();

    expect(result).toContain('Daily Briefing');
    expect(result).toContain('Unavailable');
    // Should still not throw
    expect(result).toContain('Updates every 15 minutes');
  });

  it('should clear cache when clearBriefingCache is called', async () => {
    const mockFetch = setupAllMocks();

    await generateDailyBriefing();
    const callCount1 = mockFetch.mock.calls.length;

    clearBriefingCache();
    await generateDailyBriefing();
    const callCount2 = mockFetch.mock.calls.length;

    // After clearing cache, new fetch calls should be made
    expect(callCount2).toBeGreaterThan(callCount1);
  });
});

describe('geocodeCity', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should return coordinates for a valid city', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([
        { lat: '48.8566', lon: '2.3522', display_name: 'Paris, Ile-de-France, France' },
      ]),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await geocodeCity('Paris');
    expect(result).not.toBeNull();
    expect(result!.lat).toBe('48.8566');
    expect(result!.lon).toBe('2.3522');
    expect(result!.displayName).toContain('Paris');
  });

  it('should return null when city is not found', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    }));

    const result = await geocodeCity('xyznonexistentcity123');
    expect(result).toBeNull();
  });

  it('should return null on API error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    }));

    const result = await geocodeCity('London');
    expect(result).toBeNull();
  });

  it('should URL-encode city names with special characters', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([
        { lat: '47.3769', lon: '8.5417', display_name: 'Zürich, Switzerland' },
      ]),
    });
    vi.stubGlobal('fetch', mockFetch);

    await geocodeCity('Zürich');
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain('Z%C3%BCrich');
  });

  it('should trim whitespace from query', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([
        { lat: '51.5074', lon: '-0.1278', display_name: 'London, England, United Kingdom' },
      ]),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await geocodeCity('  London  ');
    expect(result).not.toBeNull();
    expect(result!.displayName).toContain('London');
  });
});

describe('fetchBriefingHolidays', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  function todayStr(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  it('should return holiday names for today', async () => {
    const today = todayStr();
    const mockFetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('nominatim.openstreetmap.org')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ address: { country_code: 'cz' } }),
        });
      }
      if (url.includes('date.nager.at')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { date: today, localName: 'Nový rok', name: "New Year's Day", countryCode: 'CZ', global: true, types: ['Public'] },
            { date: '2026-12-25', localName: 'Vánoce', name: 'Christmas Day', countryCode: 'CZ', global: true, types: ['Public'] },
          ]),
        });
      }
      return Promise.resolve({ ok: false, status: 404 });
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await fetchBriefingHolidays('50.08', '14.44');
    expect(result).toContain("New Year's Day");
    expect(result).toContain('Nový rok');
    expect(result).toContain('🎉');
    // Should NOT include Christmas (not today)
    expect(result).not.toContain('Christmas');
  });

  it('should return empty string when no holidays today', async () => {
    const mockFetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('nominatim.openstreetmap.org')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ address: { country_code: 'us' } }),
        });
      }
      if (url.includes('date.nager.at')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { date: '2026-07-04', localName: 'Independence Day', name: 'Independence Day', countryCode: 'US', global: true, types: ['Public'] },
          ]),
        });
      }
      return Promise.resolve({ ok: false, status: 404 });
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await fetchBriefingHolidays('40.71', '-74.01');
    expect(result).toBe('');
  });

  it('should throw on geocode failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));

    await expect(fetchBriefingHolidays('50.08', '14.44')).rejects.toThrow('Geocode failed');
  });

  it('should throw when no country code in geocode response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ address: {} }),
    }));

    await expect(fetchBriefingHolidays('0', '0')).rejects.toThrow('No country code');
  });

  it('should throw on Nager.Date API failure', async () => {
    const mockFetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('nominatim.openstreetmap.org')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ address: { country_code: 'xx' } }),
        });
      }
      if (url.includes('date.nager.at')) {
        return Promise.resolve({ ok: false, status: 404 });
      }
      return Promise.resolve({ ok: false, status: 404 });
    });
    vi.stubGlobal('fetch', mockFetch);

    await expect(fetchBriefingHolidays('50', '14')).rejects.toThrow('Nager.Date API HTTP 404');
  });

  it('should skip local name when same as English name', async () => {
    const today = todayStr();
    const mockFetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('nominatim.openstreetmap.org')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ address: { country_code: 'us' } }),
        });
      }
      if (url.includes('date.nager.at')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { date: today, localName: 'Independence Day', name: 'Independence Day', countryCode: 'US', global: true, types: ['Public'] },
          ]),
        });
      }
      return Promise.resolve({ ok: false, status: 404 });
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await fetchBriefingHolidays('40.71', '-74.01');
    expect(result).toBe('🎉 Independence Day');
    // Should NOT have the duplicate local name in parentheses
    expect(result).not.toContain('(Independence Day)');
  });

  it('should handle multiple holidays on the same day', async () => {
    const today = todayStr();
    const mockFetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('nominatim.openstreetmap.org')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ address: { country_code: 'de' } }),
        });
      }
      if (url.includes('date.nager.at')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { date: today, localName: 'Erster Feiertag', name: 'Holiday One', countryCode: 'DE', global: true, types: ['Public'] },
            { date: today, localName: 'Zweiter Feiertag', name: 'Holiday Two', countryCode: 'DE', global: true, types: ['Public'] },
          ]),
        });
      }
      return Promise.resolve({ ok: false, status: 404 });
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await fetchBriefingHolidays('52.52', '13.41');
    expect(result).toContain('Holiday One');
    expect(result).toContain('Holiday Two');
    expect(result).toContain('Erster Feiertag');
    expect(result).toContain('Zweiter Feiertag');
  });
});

describe('generateDailyBriefing holiday integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    clearBriefingCache();
  });

  it('should include holiday banner when holidays exist', async () => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const mockFetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('open-meteo.com')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            current_weather: { temperature: 22.5, windspeed: 12.3, weathercode: 2, time: '2026-02-18T14:00' },
            daily: { time: ['2026-02-18'], temperature_2m_max: [24.0], temperature_2m_min: [18.0], weathercode: [2] },
          }),
        });
      }
      if (url.includes('topstories.json')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([1]) });
      }
      if (url.includes('hacker-news.firebaseio.com/v0/item/')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ id: 1, title: 'Story', score: 10 }) });
      }
      if (url.includes('reddit.com')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ data: { children: [] } }) });
      }
      if (url.includes('arxiv.org')) {
        return Promise.resolve({ ok: true, text: () => Promise.resolve('<feed></feed>') });
      }
      if (url.includes('nominatim.openstreetmap.org')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ address: { country_code: 'cz', city: 'Prague', country: 'Czech Republic' } }),
        });
      }
      if (url.includes('date.nager.at')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { date: todayStr, localName: 'Svátek', name: 'National Holiday', countryCode: 'CZ', global: true, types: ['Public'] },
          ]),
        });
      }
      return Promise.resolve({ ok: false, status: 404 });
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await generateDailyBriefing('50.08', '14.44');
    expect(result).toContain('🎉 National Holiday');
    expect(result).toContain('Svátek');
    // Holiday should appear before the Weather section
    const holidayIdx = result.indexOf('🎉 National Holiday');
    const weatherIdx = result.indexOf('Weather');
    expect(holidayIdx).toBeLessThan(weatherIdx);
  });

  it('should not include holiday section when no holidays or API fails', async () => {
    // All APIs return 404 for holiday-related URLs
    const mockFetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('open-meteo.com')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            current_weather: { temperature: 20, windspeed: 10, weathercode: 0, time: '2026-02-18T14:00' },
            daily: { time: ['2026-02-18'], temperature_2m_max: [22], temperature_2m_min: [16], weathercode: [0] },
          }),
        });
      }
      if (url.includes('topstories.json')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      }
      if (url.includes('reddit.com')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ data: { children: [] } }) });
      }
      if (url.includes('arxiv.org')) {
        return Promise.resolve({ ok: true, text: () => Promise.resolve('<feed></feed>') });
      }
      // Nominatim and Nager.Date will fail → holiday section gracefully skipped
      return Promise.resolve({ ok: false, status: 404 });
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await generateDailyBriefing('50.08', '14.44');
    expect(result).toContain('Daily Briefing');
    expect(result).not.toContain('🎉');
  });
});

// --- Phase 2.5.10: Quotes & personality ---

describe('fetchBriefingQuote', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should return formatted quote from Quotable API', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([{ content: 'Be the change.', author: 'Gandhi' }]),
    }));

    const result = await fetchBriefingQuote();
    expect(result).toContain('Be the change.');
    expect(result).toContain('Gandhi');
    expect(result).toContain('\u{1F4AD}');
  });

  it('should fall back to Advice Slip when Quotable fails', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 500 })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ slip: { advice: 'Always be kind.' } }),
      });
    vi.stubGlobal('fetch', mockFetch);

    const result = await fetchBriefingQuote();
    expect(result).toContain('Always be kind.');
    expect(result).toContain('\u{1F4AD}');
    expect(result).not.toContain('\u2014'); // no em-dash author for advice
  });

  it('should return empty string when both APIs fail', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));

    const result = await fetchBriefingQuote();
    expect(result).toBe('');
  });

  it('should handle empty Quotable response and fall back', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ slip: { advice: 'Smile more.' } }),
      });
    vi.stubGlobal('fetch', mockFetch);

    const result = await fetchBriefingQuote();
    expect(result).toContain('Smile more.');
  });

  it('should handle network errors gracefully', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

    const result = await fetchBriefingQuote();
    expect(result).toBe('');
  });
});

describe('generateDailyBriefing quote integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    clearBriefingCache();
  });

  it('should include quote in briefing when available', async () => {
    const mockFetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('open-meteo.com')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            current_weather: { temperature: 20, windspeed: 10, weathercode: 0, time: '2026-02-20T14:00' },
            daily: { time: ['2026-02-20'], temperature_2m_max: [22], temperature_2m_min: [16], weathercode: [0] },
          }),
        });
      }
      if (url.includes('topstories.json')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      }
      if (url.includes('reddit.com')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ data: { children: [] } }) });
      }
      if (url.includes('arxiv.org')) {
        return Promise.resolve({ ok: true, text: () => Promise.resolve('<feed></feed>') });
      }
      if (url.includes('quotable.io')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([{ content: 'Stay hungry, stay foolish.', author: 'Steve Jobs' }]),
        });
      }
      return Promise.resolve({ ok: false, status: 404 });
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await generateDailyBriefing();
    expect(result).toContain('Stay hungry, stay foolish.');
    expect(result).toContain('Steve Jobs');
    // Quote should appear before the "Updates" footer
    const quoteIdx = result.indexOf('Stay hungry');
    const updatesIdx = result.indexOf('Updates every');
    expect(quoteIdx).toBeLessThan(updatesIdx);
  });

  it('should produce valid briefing when quote APIs fail', async () => {
    const mockFetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('open-meteo.com')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            current_weather: { temperature: 20, windspeed: 10, weathercode: 0, time: '2026-02-20T14:00' },
            daily: { time: ['2026-02-20'], temperature_2m_max: [22], temperature_2m_min: [16], weathercode: [0] },
          }),
        });
      }
      if (url.includes('topstories.json')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      }
      if (url.includes('reddit.com')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ data: { children: [] } }) });
      }
      if (url.includes('arxiv.org')) {
        return Promise.resolve({ ok: true, text: () => Promise.resolve('<feed></feed>') });
      }
      return Promise.resolve({ ok: false, status: 404 });
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await generateDailyBriefing();
    expect(result).toContain('Daily Briefing');
    expect(result).toContain('Updates every 15 minutes');
    expect(result).not.toContain('\u{1F4AD}');
  });
});

describe('convert_currency tool', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    clearExchangeRateCache();
  });

  const mockExchangeResponse = {
    rates: {
      USD: 1,
      EUR: 0.8523,
      GBP: 0.7412,
      CZK: 22.45,
      JPY: 149.32,
    },
  };

  it('should be included in AVAILABLE_TOOLS', () => {
    const tool = AVAILABLE_TOOLS.find(t => t.function.name === 'convert_currency');
    expect(tool).toBeDefined();
    expect(tool!.function.parameters.required).toEqual(['from', 'to']);
  });

  it('should be included in TOOLS_WITHOUT_BROWSER', () => {
    const tool = TOOLS_WITHOUT_BROWSER.find(t => t.function.name === 'convert_currency');
    expect(tool).toBeDefined();
  });

  it('should convert currency with default amount of 1', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockExchangeResponse),
    }));

    const result = await executeTool({
      id: 'curr_1',
      type: 'function',
      function: {
        name: 'convert_currency',
        arguments: JSON.stringify({ from: 'USD', to: 'EUR' }),
      },
    });

    expect(result.role).toBe('tool');
    expect(result.tool_call_id).toBe('curr_1');
    expect(result.content).toContain('1 USD');
    expect(result.content).toContain('0.85');
    expect(result.content).toContain('EUR');
    expect(result.content).toContain('rate: 0.8523');
  });

  it('should convert currency with custom amount', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockExchangeResponse),
    }));

    const result = await executeTool({
      id: 'curr_2',
      type: 'function',
      function: {
        name: 'convert_currency',
        arguments: JSON.stringify({ from: 'USD', to: 'CZK', amount: '100' }),
      },
    });

    expect(result.content).toContain('100 USD');
    expect(result.content).toContain('2245.00 CZK');
    expect(result.content).toContain('rate: 22.45');
  });

  it('should handle lowercase currency codes', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockExchangeResponse),
    }));

    const result = await executeTool({
      id: 'curr_3',
      type: 'function',
      function: {
        name: 'convert_currency',
        arguments: JSON.stringify({ from: 'usd', to: 'gbp' }),
      },
    });

    expect(result.content).toContain('1 USD');
    expect(result.content).toContain('GBP');
    expect(result.content).toContain('rate: 0.7412');
  });

  it('should reject invalid source currency code', async () => {
    const result = await executeTool({
      id: 'curr_4',
      type: 'function',
      function: {
        name: 'convert_currency',
        arguments: JSON.stringify({ from: 'INVALID', to: 'EUR' }),
      },
    });

    expect(result.content).toContain('Error executing convert_currency');
    expect(result.content).toContain('Invalid source currency code');
  });

  it('should reject invalid target currency code', async () => {
    const result = await executeTool({
      id: 'curr_5',
      type: 'function',
      function: {
        name: 'convert_currency',
        arguments: JSON.stringify({ from: 'USD', to: 'X' }),
      },
    });

    expect(result.content).toContain('Error executing convert_currency');
    expect(result.content).toContain('Invalid target currency code');
  });

  it('should reject invalid amount', async () => {
    const result = await executeTool({
      id: 'curr_6',
      type: 'function',
      function: {
        name: 'convert_currency',
        arguments: JSON.stringify({ from: 'USD', to: 'EUR', amount: 'abc' }),
      },
    });

    expect(result.content).toContain('Error executing convert_currency');
    expect(result.content).toContain('Invalid amount');
  });

  it('should reject negative amount', async () => {
    const result = await executeTool({
      id: 'curr_7',
      type: 'function',
      function: {
        name: 'convert_currency',
        arguments: JSON.stringify({ from: 'USD', to: 'EUR', amount: '-5' }),
      },
    });

    expect(result.content).toContain('Error executing convert_currency');
    expect(result.content).toContain('Invalid amount');
  });

  it('should handle API HTTP errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    }));

    const result = await executeTool({
      id: 'curr_8',
      type: 'function',
      function: {
        name: 'convert_currency',
        arguments: JSON.stringify({ from: 'USD', to: 'EUR' }),
      },
    });

    expect(result.content).toContain('Error executing convert_currency');
    expect(result.content).toContain('ExchangeRate API error: HTTP 404');
  });

  it('should handle unknown target currency in response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ rates: { USD: 1, EUR: 0.85 } }),
    }));

    const result = await executeTool({
      id: 'curr_9',
      type: 'function',
      function: {
        name: 'convert_currency',
        arguments: JSON.stringify({ from: 'USD', to: 'XYZ' }),
      },
    });

    expect(result.content).toContain('Error executing convert_currency');
    expect(result.content).toContain('Currency "XYZ" not found');
  });

  it('should cache exchange rates for 30 minutes', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockExchangeResponse),
    });
    vi.stubGlobal('fetch', mockFetch);

    await executeTool({
      id: 'curr_10a',
      type: 'function',
      function: {
        name: 'convert_currency',
        arguments: JSON.stringify({ from: 'USD', to: 'EUR' }),
      },
    });
    const callCount1 = mockFetch.mock.calls.length;

    await executeTool({
      id: 'curr_10b',
      type: 'function',
      function: {
        name: 'convert_currency',
        arguments: JSON.stringify({ from: 'USD', to: 'GBP' }),
      },
    });
    const callCount2 = mockFetch.mock.calls.length;

    // Second call with same source currency should use cache
    expect(callCount1).toBe(callCount2);
  });

  it('should clear cache when clearExchangeRateCache is called', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockExchangeResponse),
    });
    vi.stubGlobal('fetch', mockFetch);

    await executeTool({
      id: 'curr_11a',
      type: 'function',
      function: {
        name: 'convert_currency',
        arguments: JSON.stringify({ from: 'USD', to: 'EUR' }),
      },
    });
    const callCount1 = mockFetch.mock.calls.length;

    clearExchangeRateCache();

    await executeTool({
      id: 'curr_11b',
      type: 'function',
      function: {
        name: 'convert_currency',
        arguments: JSON.stringify({ from: 'USD', to: 'EUR' }),
      },
    });
    const callCount2 = mockFetch.mock.calls.length;

    // After clearing, new fetch should be made
    expect(callCount2).toBeGreaterThan(callCount1);
  });

  it('should construct correct API URL', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockExchangeResponse),
    });
    vi.stubGlobal('fetch', mockFetch);

    await executeTool({
      id: 'curr_12',
      type: 'function',
      function: {
        name: 'convert_currency',
        arguments: JSON.stringify({ from: 'EUR', to: 'USD' }),
      },
    });

    const calledUrl = mockFetch.mock.calls[0][0];
    expect(calledUrl).toBe('https://api.exchangerate-api.com/v4/latest/EUR');
  });
});

describe('get_crypto tool', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    clearCryptoCache();
  });

  it('should be included in AVAILABLE_TOOLS', () => {
    const tool = AVAILABLE_TOOLS.find(t => t.function.name === 'get_crypto');
    expect(tool).toBeDefined();
    expect(tool!.function.parameters.required).toEqual(['action']);
  });

  it('should be included in TOOLS_WITHOUT_BROWSER', () => {
    const tool = TOOLS_WITHOUT_BROWSER.find(t => t.function.name === 'get_crypto');
    expect(tool).toBeDefined();
  });

  it('should return price data for a known coin', async () => {
    const mockFetch = vi.fn()
      // CoinCap search
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          data: [{
            id: 'bitcoin', rank: '1', symbol: 'BTC', name: 'Bitcoin',
            priceUsd: '97500.12', changePercent24Hr: '2.35',
            marketCapUsd: '1920000000000', volumeUsd24Hr: '28000000000',
            supply: '19883231', maxSupply: '21000000',
          }],
        }),
      })
      // CoinPaprika search
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          currencies: [{ id: 'btc-bitcoin', name: 'Bitcoin', symbol: 'BTC' }],
        }),
      })
      // CoinPaprika ticker
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          quotes: { USD: { percent_change_1h: 0.12, percent_change_7d: 5.67, percent_change_30d: 12.34, ath_price: 108000, ath_date: '2025-01-20T14:30:00Z', percent_from_price_ath: -9.72 } },
        }),
      });
    vi.stubGlobal('fetch', mockFetch);

    const result = await executeTool({
      id: 'call_1',
      type: 'function',
      function: {
        name: 'get_crypto',
        arguments: JSON.stringify({ action: 'price', query: 'BTC' }),
      },
    });

    expect(result.content).toContain('Bitcoin');
    expect(result.content).toContain('BTC');
    expect(result.content).toContain('Rank #1');
    expect(result.content).toContain('ATH');
  });

  it('should return top coins list', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        data: [
          { rank: '1', symbol: 'BTC', name: 'Bitcoin', priceUsd: '97500', changePercent24Hr: '2.35', marketCapUsd: '1920000000000' },
          { rank: '2', symbol: 'ETH', name: 'Ethereum', priceUsd: '3200', changePercent24Hr: '-1.20', marketCapUsd: '385000000000' },
        ],
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await executeTool({
      id: 'call_2',
      type: 'function',
      function: {
        name: 'get_crypto',
        arguments: JSON.stringify({ action: 'top', query: '2' }),
      },
    });

    expect(result.content).toContain('Top 2 Cryptocurrencies');
    expect(result.content).toContain('#1 BTC');
    expect(result.content).toContain('#2 ETH');
  });

  it('should return DEX pair data', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        pairs: [{
          chainId: 'ethereum', dexId: 'uniswap',
          baseToken: { symbol: 'WETH', name: 'Wrapped Ether' },
          quoteToken: { symbol: 'USDC' },
          priceUsd: '3200.45',
          volume: { h24: 32000000 },
          priceChange: { h24: 2.56 },
          liquidity: { usd: 15000000 },
          url: 'https://dexscreener.com/ethereum/0xabc',
        }],
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await executeTool({
      id: 'call_3',
      type: 'function',
      function: {
        name: 'get_crypto',
        arguments: JSON.stringify({ action: 'dex', query: 'ETH' }),
      },
    });

    expect(result.content).toContain('DEX Pairs');
    expect(result.content).toContain('WETH/USDC');
    expect(result.content).toContain('uniswap');
    expect(result.content).toContain('ethereum');
  });

  it('should handle no DEX pairs found', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ pairs: [] }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await executeTool({
      id: 'call_4',
      type: 'function',
      function: {
        name: 'get_crypto',
        arguments: JSON.stringify({ action: 'dex', query: 'NONEXISTENT' }),
      },
    });

    expect(result.content).toContain('No DEX pairs found');
  });

  it('should cache crypto results', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        data: [{ rank: '1', symbol: 'BTC', name: 'Bitcoin', priceUsd: '97500', changePercent24Hr: '2.35', marketCapUsd: '1920000000000' }],
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await executeTool({ id: 'call_5', type: 'function', function: { name: 'get_crypto', arguments: JSON.stringify({ action: 'top', query: '1' }) } });
    await executeTool({ id: 'call_6', type: 'function', function: { name: 'get_crypto', arguments: JSON.stringify({ action: 'top', query: '1' }) } });

    // Only 1 fetch call due to cache
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should handle CoinCap API error gracefully', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 500 })
      .mockResolvedValueOnce({ ok: false, status: 500 });
    vi.stubGlobal('fetch', mockFetch);

    const result = await executeTool({
      id: 'call_7',
      type: 'function',
      function: {
        name: 'get_crypto',
        arguments: JSON.stringify({ action: 'price', query: 'BTC' }),
      },
    });

    expect(result.content).toContain('Error');
  });

  it('should cap top coins at 25', async () => {
    const coins = Array.from({ length: 25 }, (_, i) => ({
      rank: String(i + 1), symbol: `C${i}`, name: `Coin${i}`,
      priceUsd: '100', changePercent24Hr: '1.0', marketCapUsd: '1000000000',
    }));
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: coins }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await executeTool({
      id: 'call_8',
      type: 'function',
      function: {
        name: 'get_crypto',
        arguments: JSON.stringify({ action: 'top', query: '100' }),
      },
    });

    // Limit param should be capped at 25
    expect((mockFetch.mock.calls[0] as unknown[])[0]).toContain('limit=25');
  });

  it('should handle partial API failures (CoinCap ok, CoinPaprika fails)', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          data: [{
            id: 'bitcoin', rank: '1', symbol: 'BTC', name: 'Bitcoin',
            priceUsd: '97500.12', changePercent24Hr: '2.35',
            marketCapUsd: '1920000000000', volumeUsd24Hr: '28000000000',
            supply: '19883231', maxSupply: '21000000',
          }],
        }),
      })
      .mockRejectedValueOnce(new Error('Network error'));
    vi.stubGlobal('fetch', mockFetch);

    const result = await executeTool({
      id: 'call_9',
      type: 'function',
      function: {
        name: 'get_crypto',
        arguments: JSON.stringify({ action: 'price', query: 'BTC' }),
      },
    });

    // Should still return CoinCap data
    expect(result.content).toContain('Bitcoin');
    expect(result.content).not.toContain('Error');
  });
});

describe('geolocate_ip tool', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    clearGeoCache();
  });

  it('should be included in AVAILABLE_TOOLS', () => {
    const tool = AVAILABLE_TOOLS.find(t => t.function.name === 'geolocate_ip');
    expect(tool).toBeDefined();
    expect(tool!.function.parameters.required).toEqual(['ip']);
  });

  it('should be included in TOOLS_WITHOUT_BROWSER', () => {
    const tool = TOOLS_WITHOUT_BROWSER.find(t => t.function.name === 'geolocate_ip');
    expect(tool).toBeDefined();
  });

  it('should return geolocation data for a valid IP', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        ip: '8.8.8.8', city: 'Mountain View', region: 'California',
        region_code: 'CA', country_name: 'United States', country_code: 'US',
        postal: '94035', latitude: 37.386, longitude: -122.0838,
        timezone: 'America/Los_Angeles', utc_offset: '-0800',
        asn: 'AS15169', org: 'Google LLC',
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await executeTool({
      id: 'call_1',
      type: 'function',
      function: {
        name: 'geolocate_ip',
        arguments: JSON.stringify({ ip: '8.8.8.8' }),
      },
    });

    expect(result.content).toContain('8.8.8.8');
    expect(result.content).toContain('Mountain View');
    expect(result.content).toContain('California');
    expect(result.content).toContain('United States');
    expect(result.content).toContain('America/Los_Angeles');
    expect(result.content).toContain('Google LLC');
  });

  it('should reject invalid IP format', async () => {
    const result = await executeTool({
      id: 'call_2',
      type: 'function',
      function: {
        name: 'geolocate_ip',
        arguments: JSON.stringify({ ip: 'not-an-ip' }),
      },
    });

    expect(result.content).toContain('Error');
    expect(result.content).toContain('Invalid IP');
  });

  it('should handle API error response', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ error: true, reason: 'Rate limited' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await executeTool({
      id: 'call_3',
      type: 'function',
      function: {
        name: 'geolocate_ip',
        arguments: JSON.stringify({ ip: '8.8.8.8' }),
      },
    });

    expect(result.content).toContain('Error');
    expect(result.content).toContain('Rate limited');
  });

  it('should cache geolocation results', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        ip: '1.1.1.1', city: 'San Francisco', region: 'California',
        region_code: 'CA', country_name: 'United States', country_code: 'US',
        postal: '94107', latitude: 37.7749, longitude: -122.4194,
        timezone: 'America/Los_Angeles', utc_offset: '-0800',
        asn: 'AS13335', org: 'Cloudflare Inc',
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await executeTool({ id: 'call_4', type: 'function', function: { name: 'geolocate_ip', arguments: JSON.stringify({ ip: '1.1.1.1' }) } });
    await executeTool({ id: 'call_5', type: 'function', function: { name: 'geolocate_ip', arguments: JSON.stringify({ ip: '1.1.1.1' }) } });

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should handle HTTP error from API', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({ ok: false, status: 429 });
    vi.stubGlobal('fetch', mockFetch);

    const result = await executeTool({
      id: 'call_6',
      type: 'function',
      function: {
        name: 'geolocate_ip',
        arguments: JSON.stringify({ ip: '8.8.8.8' }),
      },
    });

    expect(result.content).toContain('Error');
    expect(result.content).toContain('429');
  });

  it('should handle IPv6 addresses', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        ip: '2001:4860:4860::8888', city: 'Mountain View', region: 'California',
        region_code: 'CA', country_name: 'United States', country_code: 'US',
        postal: '94035', latitude: 37.386, longitude: -122.0838,
        timezone: 'America/Los_Angeles', utc_offset: '-0800',
        asn: 'AS15169', org: 'Google LLC',
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await executeTool({
      id: 'call_7',
      type: 'function',
      function: {
        name: 'geolocate_ip',
        arguments: JSON.stringify({ ip: '2001:4860:4860::8888' }),
      },
    });

    expect(result.content).toContain('2001:4860:4860::8888');
    expect(result.content).toContain('Mountain View');
  });
});



describe('web_search tool', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    clearWebSearchCache();
  });

  it('should be included in AVAILABLE_TOOLS', () => {
    const tool = AVAILABLE_TOOLS.find(t => t.function.name === 'web_search');
    expect(tool).toBeDefined();
    expect(tool!.function.parameters.required).toEqual(['query']);
  });

  it('should return formatted results on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        web: {
          results: [
            { title: 'Result One', url: 'https://example.com/1', description: 'First snippet' },
            { title: 'Result Two', url: 'https://example.com/2', description: 'Second snippet' },
          ],
        },
      }),
    }));

    const result = await executeTool({
      id: 'web_1',
      type: 'function',
      function: {
        name: 'web_search',
        arguments: JSON.stringify({ query: 'latest ai news' }),
      },
    }, { braveSearchKey: 'brave-key' });

    expect(result.content).toContain('1. **Result One** (https://example.com/1)');
    expect(result.content).toContain('First snippet');
    expect(result.content).toContain('2. **Result Two** (https://example.com/2)');
  });

  it('should return error when API key is missing', async () => {
    const result = await executeTool({
      id: 'web_2',
      type: 'function',
      function: {
        name: 'web_search',
        arguments: JSON.stringify({ query: 'open source llm' }),
      },
    });

    expect(result.content).toContain('Web search requires a Brave Search API key');
  });

  it('should handle API error response gracefully', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
      text: () => Promise.resolve('rate limit exceeded'),
    }));

    const result = await executeTool({
      id: 'web_3',
      type: 'function',
      function: {
        name: 'web_search',
        arguments: JSON.stringify({ query: 'breaking news' }),
      },
    }, { braveSearchKey: 'brave-key' });

    expect(result.content).toContain('Brave Search API error 429');
    expect(result.content).toContain('rate limit exceeded');
  });

  it('should handle empty results', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ web: { results: [] } }),
    }));

    const result = await executeTool({
      id: 'web_4',
      type: 'function',
      function: {
        name: 'web_search',
        arguments: JSON.stringify({ query: 'query with no matches' }),
      },
    }, { braveSearchKey: 'brave-key' });

    expect(result.content).toContain('No web results found');
  });

  it('should respect num_results parameter', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ web: { results: [{ title: 'Only', url: 'https://example.com', description: 'one' }] } }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await executeTool({
      id: 'web_5',
      type: 'function',
      function: {
        name: 'web_search',
        arguments: JSON.stringify({ query: 'cloudflare workers', num_results: '9' }),
      },
    }, { braveSearchKey: 'brave-key' });

    expect(String(mockFetch.mock.calls[0][0])).toContain('count=9');
  });

  it('should cache results for 5 minutes', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ web: { results: [{ title: 'Cached', url: 'https://example.com/cached', description: 'cached snippet' }] } }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await executeTool({
      id: 'web_6a',
      type: 'function',
      function: {
        name: 'web_search',
        arguments: JSON.stringify({ query: 'cache me', num_results: '3' }),
      },
    }, { braveSearchKey: 'brave-key' });

    await executeTool({
      id: 'web_6b',
      type: 'function',
      function: {
        name: 'web_search',
        arguments: JSON.stringify({ query: 'cache me', num_results: '3' }),
      },
    }, { braveSearchKey: 'brave-key' });

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should invalidate cache after TTL', async () => {
    vi.useFakeTimers();
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ web: { results: [{ title: 'TTL', url: 'https://example.com/ttl', description: 'ttl snippet' }] } }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await executeTool({
      id: 'web_7a',
      type: 'function',
      function: {
        name: 'web_search',
        arguments: JSON.stringify({ query: 'ttl query', num_results: '2' }),
      },
    }, { braveSearchKey: 'brave-key' });

    vi.advanceTimersByTime(5 * 60 * 1000 + 1);

    await executeTool({
      id: 'web_7b',
      type: 'function',
      function: {
        name: 'web_search',
        arguments: JSON.stringify({ query: 'ttl query', num_results: '2' }),
      },
    }, { braveSearchKey: 'brave-key' });

    expect(mockFetch).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});

describe('github_create_pr tool', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should be included in AVAILABLE_TOOLS', () => {
    const tool = AVAILABLE_TOOLS.find(t => t.function.name === 'github_create_pr');
    expect(tool).toBeDefined();
    expect(tool!.function.parameters.required).toEqual(['owner', 'repo', 'title', 'branch', 'changes']);
  });

  it('description explains the update workflow', () => {
    const tool = AVAILABLE_TOOLS.find(t => t.function.name === 'github_create_pr')!;
    expect(tool.function.description).toContain('github_read_file');
    expect(tool.function.description).toContain('COMPLETE new content');
    expect(tool.function.description).toContain('append');
  });

  it('changes parameter clarifies update requires full content', () => {
    const tool = AVAILABLE_TOOLS.find(t => t.function.name === 'github_create_pr')!;
    const changesParam = tool.function.parameters.properties['changes'];
    expect(changesParam.description).toContain('COMPLETE new file content');
    expect(changesParam.description).toContain('read the file first');
  });

  it('github_read_file description mentions 50KB limit', () => {
    const tool = AVAILABLE_TOOLS.find(t => t.function.name === 'github_read_file')!;
    expect(tool.function.description).toContain('50KB');
  });

  it('should be included in TOOLS_WITHOUT_BROWSER (available in DOs)', () => {
    const tool = TOOLS_WITHOUT_BROWSER.find(t => t.function.name === 'github_create_pr');
    expect(tool).toBeDefined();
  });

  it('should fail without a GitHub token', async () => {
    const result = await executeTool({
      id: 'call_pr_1',
      type: 'function',
      function: {
        name: 'github_create_pr',
        arguments: JSON.stringify({
          owner: 'testowner',
          repo: 'testrepo',
          title: 'Test PR',
          branch: 'test-branch',
          changes: '[{"path":"test.ts","content":"hello","action":"create"}]',
        }),
      },
    });

    expect(result.content).toContain('GitHub token is required');
  });

  it('should fail with invalid owner/repo format', async () => {
    const result = await executeTool({
      id: 'call_pr_2',
      type: 'function',
      function: {
        name: 'github_create_pr',
        arguments: JSON.stringify({
          owner: 'invalid owner!',
          repo: 'testrepo',
          title: 'Test PR',
          branch: 'test-branch',
          changes: '[{"path":"test.ts","content":"hello","action":"create"}]',
        }),
      },
    }, { githubToken: 'test-token' });

    expect(result.content).toContain('Invalid owner/repo format');
  });

  it('should fail with invalid branch name containing ..', async () => {
    const result = await executeTool({
      id: 'call_pr_3',
      type: 'function',
      function: {
        name: 'github_create_pr',
        arguments: JSON.stringify({
          owner: 'testowner',
          repo: 'testrepo',
          title: 'Test PR',
          branch: 'evil/../branch',
          changes: '[{"path":"test.ts","content":"hello","action":"create"}]',
        }),
      },
    }, { githubToken: 'test-token' });

    expect(result.content).toContain('Invalid branch name');
  });

  it('should fail with invalid changes JSON', async () => {
    const result = await executeTool({
      id: 'call_pr_4',
      type: 'function',
      function: {
        name: 'github_create_pr',
        arguments: JSON.stringify({
          owner: 'testowner',
          repo: 'testrepo',
          title: 'Test PR',
          branch: 'test-branch',
          changes: 'not valid json',
        }),
      },
    }, { githubToken: 'test-token' });

    expect(result.content).toContain('Invalid changes JSON');
  });

  it('should fail with empty changes array', async () => {
    const result = await executeTool({
      id: 'call_pr_5',
      type: 'function',
      function: {
        name: 'github_create_pr',
        arguments: JSON.stringify({
          owner: 'testowner',
          repo: 'testrepo',
          title: 'Test PR',
          branch: 'test-branch',
          changes: '[]',
        }),
      },
    }, { githubToken: 'test-token' });

    expect(result.content).toContain('non-empty array');
  });

  it('should fail with path traversal in file path', async () => {
    const result = await executeTool({
      id: 'call_pr_6',
      type: 'function',
      function: {
        name: 'github_create_pr',
        arguments: JSON.stringify({
          owner: 'testowner',
          repo: 'testrepo',
          title: 'Test PR',
          branch: 'test-branch',
          changes: '[{"path":"../etc/passwd","content":"evil","action":"create"}]',
        }),
      },
    }, { githubToken: 'test-token' });

    expect(result.content).toContain('Invalid file path');
  });

  it('should fail with absolute file path', async () => {
    const result = await executeTool({
      id: 'call_pr_6b',
      type: 'function',
      function: {
        name: 'github_create_pr',
        arguments: JSON.stringify({
          owner: 'testowner',
          repo: 'testrepo',
          title: 'Test PR',
          branch: 'test-branch',
          changes: '[{"path":"/etc/passwd","content":"evil","action":"create"}]',
        }),
      },
    }, { githubToken: 'test-token' });

    expect(result.content).toContain('Invalid file path');
  });

  it('should fail when total content exceeds 1MB', async () => {
    const bigContent = 'x'.repeat(1_000_001);
    const result = await executeTool({
      id: 'call_pr_7',
      type: 'function',
      function: {
        name: 'github_create_pr',
        arguments: JSON.stringify({
          owner: 'testowner',
          repo: 'testrepo',
          title: 'Test PR',
          branch: 'test-branch',
          changes: JSON.stringify([{ path: 'big.ts', content: bigContent, action: 'create' }]),
        }),
      },
    }, { githubToken: 'test-token' });

    expect(result.content).toContain('exceeds 1MB limit');
  });

  it('should fail when too many files', async () => {
    const changes = Array.from({ length: 21 }, (_, i) => ({
      path: `file${i}.ts`,
      content: 'test',
      action: 'create',
    }));

    const result = await executeTool({
      id: 'call_pr_8',
      type: 'function',
      function: {
        name: 'github_create_pr',
        arguments: JSON.stringify({
          owner: 'testowner',
          repo: 'testrepo',
          title: 'Test PR',
          branch: 'test-branch',
          changes: JSON.stringify(changes),
        }),
      },
    }, { githubToken: 'test-token' });

    expect(result.content).toContain('Too many file changes');
  });

  it('should fail with missing content for create action', async () => {
    const result = await executeTool({
      id: 'call_pr_9',
      type: 'function',
      function: {
        name: 'github_create_pr',
        arguments: JSON.stringify({
          owner: 'testowner',
          repo: 'testrepo',
          title: 'Test PR',
          branch: 'test-branch',
          changes: '[{"path":"test.ts","action":"create"}]',
        }),
      },
    }, { githubToken: 'test-token' });

    expect(result.content).toContain('Missing content');
  });

  it('should fail with invalid action type', async () => {
    const result = await executeTool({
      id: 'call_pr_10',
      type: 'function',
      function: {
        name: 'github_create_pr',
        arguments: JSON.stringify({
          owner: 'testowner',
          repo: 'testrepo',
          title: 'Test PR',
          branch: 'test-branch',
          changes: '[{"path":"test.ts","content":"hello","action":"rename"}]',
        }),
      },
    }, { githubToken: 'test-token' });

    expect(result.content).toContain('Invalid action');
  });

  it('should create a PR successfully with all API calls', async () => {
    const mockFetch = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      const urlStr = typeof url === 'string' ? url : '';
      const method = init?.method || 'GET';

      // File size check for "update" actions (safety guardrail)
      if (method === 'GET' && urlStr.includes('/contents/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ size: 50 }), // Small original = update is fine
        });
      }

      // GET ref
      if (method === 'GET' && urlStr.includes('/git/ref/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ object: { sha: 'base-sha-123' } }),
        });
      }

      // POST blob
      if (method === 'POST' && urlStr.includes('/git/blobs')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ sha: `blob-sha-${Math.random().toString(36).slice(2, 6)}` }),
        });
      }

      // POST tree
      if (method === 'POST' && urlStr.includes('/git/trees')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ sha: 'tree-sha-456' }),
        });
      }

      // POST commit
      if (method === 'POST' && urlStr.includes('/git/commits')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ sha: 'commit-sha-789' }),
        });
      }

      // POST ref (create branch)
      if (method === 'POST' && urlStr.includes('/git/refs')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ref: 'refs/heads/bot/test-branch' }),
        });
      }

      // POST pull request
      if (method === 'POST' && urlStr.includes('/pulls')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ html_url: 'https://github.com/testowner/testrepo/pull/42', number: 42 }),
        });
      }

      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
    vi.stubGlobal('fetch', mockFetch);

    const changes = [
      { path: 'src/new-file.ts', content: 'export const hello = "world";', action: 'create' },
      { path: 'src/index.ts', content: 'import { hello } from "./new-file";\nconsole.log(hello);\n', action: 'update' },
      { path: 'README.md', content: '# Updated README\n\nThis project does X and Y.\n\n## Getting Started\n\nRun `npm install` to get started.', action: 'update' },
    ];

    const result = await executeTool({
      id: 'call_pr_11',
      type: 'function',
      function: {
        name: 'github_create_pr',
        arguments: JSON.stringify({
          owner: 'testowner',
          repo: 'testrepo',
          title: 'Add new feature',
          branch: 'test-branch',
          base: 'main',
          changes: JSON.stringify(changes),
          body: 'This PR adds a new feature.',
        }),
      },
    }, { githubToken: 'test-token' });

    expect(result.role).toBe('tool');
    expect(result.content).toContain('Pull Request created successfully');
    expect(result.content).toContain('https://github.com/testowner/testrepo/pull/42');
    expect(result.content).toContain('bot/test-branch');
    expect(result.content).toContain('3 file(s)');

    // Verify key API calls were made (URL-based matching, order may vary with guardrail checks)
    const allCalls = mockFetch.mock.calls.map((c: unknown[]) => c[0] as string);
    expect(allCalls.some((u: string) => u.includes('/git/ref/heads/main'))).toBe(true);
    expect(allCalls.some((u: string) => u.includes('/git/blobs'))).toBe(true);
    expect(allCalls.some((u: string) => u.includes('/git/trees'))).toBe(true);
    expect(allCalls.some((u: string) => u.includes('/git/commits'))).toBe(true);
    expect(allCalls.some((u: string) => u.includes('/git/refs'))).toBe(true);
    expect(allCalls.some((u: string) => u.includes('/pulls'))).toBe(true);
    // Safety guardrail: file size check for "update" action
    expect(allCalls.some((u: string) => u.includes('/contents/'))).toBe(true);
  });

  it('should handle delete actions (null sha in tree)', async () => {
    let fetchCallIndex = 0;
    const mockFetch = vi.fn().mockImplementation(() => {
      fetchCallIndex++;
      switch (fetchCallIndex) {
        case 1: return Promise.resolve({ ok: true, json: () => Promise.resolve({ object: { sha: 'base-sha' } }) });
        case 2: return Promise.resolve({ ok: true, json: () => Promise.resolve({ sha: 'tree-sha' }) }); // tree (no blob for delete)
        case 3: return Promise.resolve({ ok: true, json: () => Promise.resolve({ sha: 'commit-sha' }) });
        case 4: return Promise.resolve({ ok: true, json: () => Promise.resolve({ ref: 'refs/heads/bot/del-branch' }) });
        case 5: return Promise.resolve({ ok: true, json: () => Promise.resolve({ html_url: 'https://github.com/o/r/pull/1', number: 1 }) });
        default: return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      }
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await executeTool({
      id: 'call_pr_del',
      type: 'function',
      function: {
        name: 'github_create_pr',
        arguments: JSON.stringify({
          owner: 'o',
          repo: 'r',
          title: 'Delete old file',
          branch: 'del-branch',
          changes: '[{"path":"old-file.ts","action":"delete"}]',
        }),
      },
    }, { githubToken: 'test-token' });

    expect(result.content).toContain('Pull Request created successfully');
    expect(result.content).toContain('delete: old-file.ts');

    // For delete, no blob API call should be made
    // Calls: GET ref, POST tree, POST commit, POST ref, POST pull = 5
    expect(mockFetch).toHaveBeenCalledTimes(5);
  });

  it('should auto-prefix branch with bot/ if not already prefixed', async () => {
    let fetchCallIndex = 0;
    const mockFetch = vi.fn().mockImplementation(() => {
      fetchCallIndex++;
      switch (fetchCallIndex) {
        case 1: return Promise.resolve({ ok: true, json: () => Promise.resolve({ object: { sha: 'sha' } }) });
        case 2: return Promise.resolve({ ok: true, json: () => Promise.resolve({ sha: 'blob' }) });
        case 3: return Promise.resolve({ ok: true, json: () => Promise.resolve({ sha: 'tree' }) });
        case 4: return Promise.resolve({ ok: true, json: () => Promise.resolve({ sha: 'commit' }) });
        case 5: return Promise.resolve({ ok: true, json: () => Promise.resolve({ ref: 'refs/heads/bot/my-feature' }) });
        case 6: return Promise.resolve({ ok: true, json: () => Promise.resolve({ html_url: 'https://github.com/o/r/pull/1', number: 1 }) });
        default: return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      }
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await executeTool({
      id: 'call_pr_prefix',
      type: 'function',
      function: {
        name: 'github_create_pr',
        arguments: JSON.stringify({
          owner: 'o',
          repo: 'r',
          title: 'Test',
          branch: 'my-feature',
          changes: '[{"path":"data.csv","content":"x","action":"create"}]',
        }),
      },
    }, { githubToken: 'token' });

    expect(result.content).toContain('bot/my-feature');
  });

  it('should not double-prefix if branch already starts with bot/', async () => {
    let fetchCallIndex = 0;
    const mockFetch = vi.fn().mockImplementation(() => {
      fetchCallIndex++;
      switch (fetchCallIndex) {
        case 1: return Promise.resolve({ ok: true, json: () => Promise.resolve({ object: { sha: 'sha' } }) });
        case 2: return Promise.resolve({ ok: true, json: () => Promise.resolve({ sha: 'blob' }) });
        case 3: return Promise.resolve({ ok: true, json: () => Promise.resolve({ sha: 'tree' }) });
        case 4: return Promise.resolve({ ok: true, json: () => Promise.resolve({ sha: 'commit' }) });
        case 5: return Promise.resolve({ ok: true, json: () => Promise.resolve({ ref: 'refs/heads/bot/already-prefixed' }) });
        case 6: return Promise.resolve({ ok: true, json: () => Promise.resolve({ html_url: 'https://github.com/o/r/pull/2', number: 2 }) });
        default: return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      }
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await executeTool({
      id: 'call_pr_noprefix',
      type: 'function',
      function: {
        name: 'github_create_pr',
        arguments: JSON.stringify({
          owner: 'o',
          repo: 'r',
          title: 'Test',
          branch: 'bot/already-prefixed',
          changes: '[{"path":"data.csv","content":"x","action":"create"}]',
        }),
      },
    }, { githubToken: 'token' });

    // Should NOT be bot/bot/already-prefixed
    expect(result.content).toContain('bot/already-prefixed');
    expect(result.content).not.toContain('bot/bot/');
  });

  it('should default base branch to main', async () => {
    let fetchCallIndex = 0;
    const mockFetch = vi.fn().mockImplementation(() => {
      fetchCallIndex++;
      switch (fetchCallIndex) {
        case 1: return Promise.resolve({ ok: true, json: () => Promise.resolve({ object: { sha: 'sha' } }) });
        case 2: return Promise.resolve({ ok: true, json: () => Promise.resolve({ sha: 'blob' }) });
        case 3: return Promise.resolve({ ok: true, json: () => Promise.resolve({ sha: 'tree' }) });
        case 4: return Promise.resolve({ ok: true, json: () => Promise.resolve({ sha: 'commit' }) });
        case 5: return Promise.resolve({ ok: true, json: () => Promise.resolve({ ref: 'r' }) });
        case 6: return Promise.resolve({ ok: true, json: () => Promise.resolve({ html_url: 'https://github.com/o/r/pull/3', number: 3 }) });
        default: return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      }
    });
    vi.stubGlobal('fetch', mockFetch);

    await executeTool({
      id: 'call_pr_default_base',
      type: 'function',
      function: {
        name: 'github_create_pr',
        arguments: JSON.stringify({
          owner: 'o',
          repo: 'r',
          title: 'Test',
          branch: 'b',
          changes: '[{"path":"data.csv","content":"x","action":"create"}]',
        }),
      },
    }, { githubToken: 'token' });

    // First call should be to /git/ref/heads/main (default)
    const firstCallUrl = mockFetch.mock.calls[0][0];
    expect(firstCallUrl).toContain('/git/ref/heads/main');
  });

  it('should handle API error on get ref', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      text: () => Promise.resolve('Not Found'),
    }));

    const result = await executeTool({
      id: 'call_pr_err',
      type: 'function',
      function: {
        name: 'github_create_pr',
        arguments: JSON.stringify({
          owner: 'o',
          repo: 'r',
          title: 'Test',
          branch: 'b',
          changes: '[{"path":"data.csv","content":"x","action":"create"}]',
        }),
      },
    }, { githubToken: 'token' });

    expect(result.content).toContain('Failed to get base branch');
    expect(result.content).toContain('404');
  });

  // --- Safety guardrail tests ---

  it('should block binary file writes (images, fonts, etc)', async () => {
    vi.stubGlobal('fetch', vi.fn());

    const changes = [
      { path: 'src/assets/logo.png', content: 'fake-binary-data', action: 'create' },
    ];

    const result = await executeTool({
      id: 'call_pr_binary',
      type: 'function',
      function: {
        name: 'github_create_pr',
        arguments: JSON.stringify({
          owner: 'o',
          repo: 'r',
          title: 'Add logo',
          branch: 'test',
          changes: JSON.stringify(changes),
        }),
      },
    }, { githubToken: 'token' });

    expect(result.content).toContain('Cannot write binary file');
    expect(result.content).toContain('logo.png');
    // No API calls should have been made
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
  });

  it('should block binary file updates too', async () => {
    vi.stubGlobal('fetch', vi.fn());

    const changes = [
      { path: 'public/banner.jpg', content: 'corrupted-data', action: 'update' },
    ];

    const result = await executeTool({
      id: 'call_pr_binary2',
      type: 'function',
      function: {
        name: 'github_create_pr',
        arguments: JSON.stringify({
          owner: 'o',
          repo: 'r',
          title: 'Update banner',
          branch: 'test',
          changes: JSON.stringify(changes),
        }),
      },
    }, { githubToken: 'token' });

    expect(result.content).toContain('Cannot write binary file');
    expect(result.content).toContain('banner.jpg');
  });

  it('should block comment-only stub replacing code file', async () => {
    vi.stubGlobal('fetch', vi.fn());

    const changes = [
      { path: 'src/App.jsx', content: '// Updated with component splitting and optimizations', action: 'update' },
    ];

    const result = await executeTool({
      id: 'call_pr_stub',
      type: 'function',
      function: {
        name: 'github_create_pr',
        arguments: JSON.stringify({
          owner: 'o',
          repo: 'r',
          title: 'Optimize app',
          branch: 'test',
          changes: JSON.stringify(changes),
        }),
      },
    }, { githubToken: 'token' });

    expect(result.content).toContain('Rejecting update');
    expect(result.content).toContain('App.jsx');
    expect(result.content).toContain('comment line');
  });

  it('should allow comment-only content in markdown files', async () => {
    // Markdown files use # for headings, not comments — should NOT be blocked
    const mockFetch = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      const urlStr = typeof url === 'string' ? url : '';
      const method = init?.method || 'GET';

      if (method === 'GET' && urlStr.includes('/contents/')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ size: 50 }) });
      }
      if (method === 'GET' && urlStr.includes('/git/ref/')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ object: { sha: 'sha' } }) });
      }
      if (method === 'POST' && urlStr.includes('/git/blobs')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ sha: 'blob-sha' }) });
      }
      if (method === 'POST' && urlStr.includes('/git/trees')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ sha: 'tree-sha' }) });
      }
      if (method === 'POST' && urlStr.includes('/git/commits')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ sha: 'commit-sha' }) });
      }
      if (method === 'POST' && urlStr.includes('/git/refs')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ ref: 'refs/heads/bot/test' }) });
      }
      if (method === 'POST' && urlStr.includes('/pulls')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ html_url: 'https://github.com/o/r/pull/1', number: 1 }) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
    vi.stubGlobal('fetch', mockFetch);

    const changes = [
      { path: 'README.md', content: '# My Project', action: 'update' },
    ];

    const result = await executeTool({
      id: 'call_pr_md',
      type: 'function',
      function: {
        name: 'github_create_pr',
        arguments: JSON.stringify({
          owner: 'o',
          repo: 'r',
          title: 'Update readme',
          branch: 'test',
          changes: JSON.stringify(changes),
        }),
      },
    }, { githubToken: 'token' });

    // Should succeed, not be blocked
    expect(result.content).toContain('Pull Request created successfully');
  });

  it('should block destructive updates that shrink file below 20%', async () => {
    const mockFetch = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      const urlStr = typeof url === 'string' ? url : '';
      const method = init?.method || 'GET';

      // Return large original file size (simulating 789-line App.jsx)
      if (method === 'GET' && urlStr.includes('/contents/')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ size: 25000 }) });
      }
      if (method === 'GET' && urlStr.includes('/git/ref/')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ object: { sha: 'sha' } }) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
    vi.stubGlobal('fetch', mockFetch);

    const changes = [
      {
        path: 'src/App.jsx',
        content: 'import React from "react";\nconst App = () => <div>Hello</div>;\nexport default App;',
        action: 'update',
      },
    ];

    const result = await executeTool({
      id: 'call_pr_destructive',
      type: 'function',
      function: {
        name: 'github_create_pr',
        arguments: JSON.stringify({
          owner: 'o',
          repo: 'r',
          title: 'Refactor app',
          branch: 'test',
          changes: JSON.stringify(changes),
        }),
      },
    }, { githubToken: 'token' });

    expect(result.content).toContain('Destructive update blocked');
    expect(result.content).toContain('App.jsx');
    expect(result.content).toContain('25000 bytes');
  });

  it('should allow updates that maintain reasonable file size', async () => {
    const mockFetch = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      const urlStr = typeof url === 'string' ? url : '';
      const method = init?.method || 'GET';

      // Original file is 200 bytes, new content is 180 bytes (90% — fine)
      if (method === 'GET' && urlStr.includes('/contents/')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ size: 200 }) });
      }
      if (method === 'GET' && urlStr.includes('/git/ref/')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ object: { sha: 'sha' } }) });
      }
      if (method === 'POST' && urlStr.includes('/git/blobs')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ sha: 'blob-sha' }) });
      }
      if (method === 'POST' && urlStr.includes('/git/trees')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ sha: 'tree-sha' }) });
      }
      if (method === 'POST' && urlStr.includes('/git/commits')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ sha: 'commit-sha' }) });
      }
      if (method === 'POST' && urlStr.includes('/git/refs')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ ref: 'refs/heads/bot/test' }) });
      }
      if (method === 'POST' && urlStr.includes('/pulls')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ html_url: 'https://github.com/o/r/pull/1', number: 1 }) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
    vi.stubGlobal('fetch', mockFetch);

    const content = 'import React from "react";\n\nconst App = () => {\n  return (\n    <div className="app">\n      <h1>Hello World</h1>\n      <p>This is a refactored component.</p>\n    </div>\n  );\n};\n\nexport default App;\n';
    const changes = [
      { path: 'src/App.jsx', content, action: 'update' },
    ];

    const result = await executeTool({
      id: 'call_pr_ok_size',
      type: 'function',
      function: {
        name: 'github_create_pr',
        arguments: JSON.stringify({
          owner: 'o',
          repo: 'r',
          title: 'Refactor',
          branch: 'test',
          changes: JSON.stringify(changes),
        }),
      },
    }, { githubToken: 'token' });

    expect(result.content).toContain('Pull Request created successfully');
  });

  it('should block multiple binary extensions (woff2, gif, pdf)', async () => {
    vi.stubGlobal('fetch', vi.fn());

    for (const ext of ['woff2', 'gif', 'pdf', 'mp4', 'zip']) {
      const result = await executeTool({
        id: `call_pr_bin_${ext}`,
        type: 'function',
        function: {
          name: 'github_create_pr',
          arguments: JSON.stringify({
            owner: 'o',
            repo: 'r',
            title: 'Test',
            branch: 'test',
            changes: JSON.stringify([{ path: `file.${ext}`, content: 'data', action: 'create' }]),
          }),
        },
      }, { githubToken: 'token' });

      expect(result.content).toContain('Cannot write binary file');
    }
  });

  it('should block multi-line comment stubs in code files', async () => {
    vi.stubGlobal('fetch', vi.fn());

    const changes = [
      {
        path: 'src/main.jsx',
        content: '// Updated with lazy loading\n// Optimized for performance',
        action: 'update',
      },
    ];

    const result = await executeTool({
      id: 'call_pr_multi_comment',
      type: 'function',
      function: {
        name: 'github_create_pr',
        arguments: JSON.stringify({
          owner: 'o',
          repo: 'r',
          title: 'Optimize',
          branch: 'test',
          changes: JSON.stringify(changes),
        }),
      },
    }, { githubToken: 'token' });

    expect(result.content).toContain('Rejecting update');
    expect(result.content).toContain('main.jsx');
  });
});

describe('extractCodeIdentifiers', () => {
  it('should extract JS/TS function and variable declarations', () => {
    const source = `
import React from 'react';

export function calculateYield(amount, rate) {
  return amount * rate;
}

export const exportCSV = () => { /* ... */ };

const btcPrice = 45000;
let darkTheme = true;

function internalHelper() {}

class FinancialEngine {
  run() {}
}

export default function App() {
  return <div />;
}
`.trim();

    const ids = extractCodeIdentifiers(source);
    expect(ids).toContain('calculateYield');
    expect(ids).toContain('exportCSV');
    expect(ids).toContain('btcPrice');
    expect(ids).toContain('darkTheme');
    expect(ids).toContain('internalHelper');
    expect(ids).toContain('FinancialEngine');
    // 'App' is generic and filtered out
    expect(ids).not.toContain('App');
  });

  it('should extract Python definitions', () => {
    const source = `
def calculate_yield(amount, rate):
    return amount * rate

class FinancialEngine:
    pass

def export_csv():
    pass
`.trim();

    const ids = extractCodeIdentifiers(source);
    expect(ids).toContain('calculate_yield');
    expect(ids).toContain('FinancialEngine');
    expect(ids).toContain('export_csv');
  });

  it('should filter out generic names', () => {
    const source = `
export default function App() {}
const state = {};
function render() {}
const props = {};
`.trim();

    const ids = extractCodeIdentifiers(source);
    expect(ids).not.toContain('App');
    expect(ids).not.toContain('state');
    expect(ids).not.toContain('render');
    expect(ids).not.toContain('props');
  });

  it('should skip comments', () => {
    const source = `
// function fakeDecl() {}
/* const notReal = true; */
* function alsoFake() {}
export const realOne = 42;
`.trim();

    const ids = extractCodeIdentifiers(source);
    expect(ids).not.toContain('fakeDecl');
    expect(ids).not.toContain('notReal');
    expect(ids).not.toContain('alsoFake');
    expect(ids).toContain('realOne');
  });
});

describe('full-rewrite detection in github_create_pr', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should block updates that lose most original identifiers (full rewrite)', async () => {
    // Simulate a 100-line file with many business identifiers
    const originalContent = [
      'import React from "react";',
      '',
      'export function calculateYield(amount, rate) {',
      '  return amount * rate;',
      '}',
      '',
      'export const exportCSV = (data) => {',
      '  // CSV export logic',
      '  return data.map(r => r.join(",")).join("\\n");',
      '}',
      '',
      'const btcPrice = 45000;',
      'const businessClass = { fare: 2500 };',
      'const travelCosts = { hotel: 200, meals: 50 };',
      '',
      'function formatCurrency(val) {',
      '  return "$" + val.toFixed(2);',
      '}',
      '',
      'export function getDarkTheme() {',
      '  return { bg: "#1a1a1a", text: "#fff" };',
      '}',
      '',
    ];
    // Pad to >50 lines to trigger rewrite detection
    for (let i = 0; i < 40; i++) {
      originalContent.push(`const placeholder${i} = ${i};`);
    }
    const originalText = originalContent.join('\n');
    const originalBase64 = btoa(originalText);

    // New content: a full rewrite at SIMILAR SIZE that loses all business logic
    // This is the exact pattern: bot regenerates file from scratch, same size, but all identifiers gone
    const newContentLines = [
      'import React, { useState } from "react";',
      'import "./App.css";',
      '',
      'function MobileLayout({ children }) {',
      '  return <div className="mobile-container">{children}</div>;',
      '}',
      '',
      'function NavigationBar() {',
      '  const [menuOpen, setMenuOpen] = useState(false);',
      '  return (',
      '    <nav className="responsive-nav">',
      '      <button onClick={() => setMenuOpen(!menuOpen)}>Menu</button>',
      '      {menuOpen && <ul><li>Home</li><li>About</li></ul>}',
      '    </nav>',
      '  );',
      '}',
      '',
      'function ContentSection() {',
      '  return (',
      '    <section className="content">',
      '      <h1>Welcome</h1>',
      '      <p>This is the responsive layout.</p>',
      '    </section>',
      '  );',
      '}',
      '',
      'function FooterSection() {',
      '  return <footer className="footer"><p>Footer</p></footer>;',
      '}',
      '',
    ];
    // Pad to match original size so shrinkage guard doesn't trigger
    for (let i = 0; i < 40; i++) {
      newContentLines.push(`const styleVar${i} = "${i}px";`);
    }
    newContentLines.push('', 'export default function App() {', '  return (', '    <MobileLayout>', '      <NavigationBar />', '      <ContentSection />', '      <FooterSection />', '    </MobileLayout>', '  );', '}');
    const newContent = newContentLines.join('\n');

    const mockFetch = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      const urlStr = typeof url === 'string' ? url : '';
      const method = init?.method || 'GET';

      if (method === 'GET' && urlStr.includes('/contents/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            size: originalText.length,
            content: originalBase64,
            encoding: 'base64',
          }),
        });
      }
      if (method === 'GET' && urlStr.includes('/git/ref/')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ object: { sha: 'sha' } }) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
    vi.stubGlobal('fetch', mockFetch);

    const changes = [
      { path: 'src/App.jsx', content: newContent, action: 'update' },
    ];

    const result = await executeTool({
      id: 'call_pr_rewrite',
      type: 'function',
      function: {
        name: 'github_create_pr',
        arguments: JSON.stringify({
          owner: 'o',
          repo: 'r',
          title: 'Improve mobile responsiveness',
          branch: 'test',
          changes: JSON.stringify(changes),
        }),
      },
    }, { githubToken: 'token' });

    expect(result.content).toContain('Full-rewrite blocked');
    expect(result.content).toContain('App.jsx');
    // Should mention missing identifiers
    expect(result.content).toMatch(/calculateYield|exportCSV|btcPrice|businessClass/);
  });

  it('should allow updates that preserve most original identifiers (targeted edit)', async () => {
    // Original file with identifiers
    const originalContent = [
      'import React from "react";',
      '',
      'export function calculateYield(amount, rate) {',
      '  return amount * rate;',
      '}',
      '',
      'export const exportCSV = (data) => {',
      '  return data.join(",");',
      '}',
      '',
      'const btcPrice = 45000;',
      'const businessClass = { fare: 2500 };',
      '',
      'function formatCurrency(val) {',
      '  return "$" + val.toFixed(2);',
      '}',
      '',
      'export function getDarkTheme() {',
      '  return { bg: "#1a1a1a" };',
      '}',
      '',
    ];
    for (let i = 0; i < 40; i++) {
      originalContent.push(`const item${i} = ${i};`);
    }
    const originalText = originalContent.join('\n');
    const originalBase64 = btoa(originalText);

    // New content: targeted edit — adds mobile responsiveness but keeps all identifiers
    const newContent = originalText.replace(
      'export function getDarkTheme() {\n  return { bg: "#1a1a1a" };\n}',
      'export function getDarkTheme() {\n  return { bg: "#1a1a1a", mobileBreakpoint: "768px" };\n}'
    ) + '\n\nexport const mobileStyles = { padding: "8px" };\n';

    const mockFetch = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      const urlStr = typeof url === 'string' ? url : '';
      const method = init?.method || 'GET';

      if (method === 'GET' && urlStr.includes('/contents/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            size: originalText.length,
            content: originalBase64,
            encoding: 'base64',
          }),
        });
      }
      if (method === 'GET' && urlStr.includes('/git/ref/')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ object: { sha: 'sha' } }) });
      }
      if (method === 'POST' && urlStr.includes('/git/blobs')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ sha: 'blob-sha' }) });
      }
      if (method === 'POST' && urlStr.includes('/git/trees')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ sha: 'tree-sha' }) });
      }
      if (method === 'POST' && urlStr.includes('/git/commits')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ sha: 'commit-sha' }) });
      }
      if (method === 'POST' && urlStr.includes('/git/refs')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ ref: 'refs/heads/bot/test' }) });
      }
      if (method === 'POST' && urlStr.includes('/pulls')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ html_url: 'https://github.com/o/r/pull/1', number: 1 }) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
    vi.stubGlobal('fetch', mockFetch);

    const changes = [
      { path: 'src/App.jsx', content: newContent, action: 'update' },
    ];

    const result = await executeTool({
      id: 'call_pr_surgical',
      type: 'function',
      function: {
        name: 'github_create_pr',
        arguments: JSON.stringify({
          owner: 'o',
          repo: 'r',
          title: 'Add mobile styles',
          branch: 'test',
          changes: JSON.stringify(changes),
        }),
      },
    }, { githubToken: 'token' });

    // Should succeed — not blocked
    expect(result.content).toContain('Pull Request created successfully');
    expect(result.content).not.toContain('Full-rewrite blocked');
  });
});

describe('incomplete refactor detection in github_create_pr', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should BLOCK when new code files are created but no existing code files are updated', async () => {
    // Simulate: model creates new modules but never touches the source file
    const mockFetch = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      const urlStr = typeof url === 'string' ? url : '';
      const method = init?.method || 'GET';

      if (method === 'GET' && urlStr.includes('/git/ref/')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ object: { sha: 'sha' } }) });
      }
      if (method === 'POST' && urlStr.includes('/git/blobs')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ sha: 'blob-sha' }) });
      }
      if (method === 'POST' && urlStr.includes('/git/trees')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ sha: 'tree-sha' }) });
      }
      if (method === 'POST' && urlStr.includes('/git/commits')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ sha: 'commit-sha' }) });
      }
      if (method === 'POST' && urlStr.includes('/git/refs')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ ref: 'refs/heads/bot/test' }) });
      }
      if (method === 'POST' && urlStr.includes('/pulls')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ html_url: 'https://github.com/o/r/pull/1', number: 1 }) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
    vi.stubGlobal('fetch', mockFetch);

    // Only creates new files + updates ROADMAP.md — no code file updates
    const changes = [
      { path: 'src/utils.js', content: 'export const clamp = (v, min, max) => Math.min(Math.max(v, min), max);\n', action: 'create' },
      { path: 'src/components/Banner.jsx', content: 'import React from "react";\nexport const Banner = () => <div>Banner</div>;\n', action: 'create' },
      { path: 'src/components/LineChart.jsx', content: 'import React from "react";\nexport const LineChart = () => <div>Chart</div>;\n', action: 'create' },
      { path: 'ROADMAP.md', content: '- [x] Split App.jsx into modules\n', action: 'update' },
      { path: 'WORK_LOG.md', content: '## Split App.jsx\nExtracted utils, Banner, LineChart\n', action: 'update' },
    ];

    const result = await executeTool({
      id: 'call_pr_incomplete_refactor',
      type: 'function',
      function: {
        name: 'github_create_pr',
        arguments: JSON.stringify({
          owner: 'o',
          repo: 'r',
          title: 'refactor: Split App.jsx into modules',
          branch: 'test-split',
          changes: JSON.stringify(changes),
        }),
      },
    }, { githubToken: 'token' });

    // PR should be BLOCKED (hard block, not just a warning)
    expect(result.content).toContain('INCOMPLETE REFACTOR blocked');
    expect(result.content).toContain('src/utils.js');
    expect(result.content).toContain('no existing code files were updated');
    expect(result.content).not.toContain('Pull Request created successfully');
  });

  it('should NOT warn when new code files are created alongside code file updates', async () => {
    const mockFetch = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      const urlStr = typeof url === 'string' ? url : '';
      const method = init?.method || 'GET';

      if (method === 'GET' && urlStr.includes('/contents/')) {
        // Return size close to new content so shrinkage checks don't trigger
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ size: 200 }),
        });
      }
      if (method === 'GET' && urlStr.includes('/git/ref/')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ object: { sha: 'sha' } }) });
      }
      if (method === 'POST' && urlStr.includes('/git/blobs')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ sha: 'blob-sha' }) });
      }
      if (method === 'POST' && urlStr.includes('/git/trees')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ sha: 'tree-sha' }) });
      }
      if (method === 'POST' && urlStr.includes('/git/commits')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ sha: 'commit-sha' }) });
      }
      if (method === 'POST' && urlStr.includes('/git/refs')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ ref: 'refs/heads/bot/test' }) });
      }
      if (method === 'POST' && urlStr.includes('/pulls')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ html_url: 'https://github.com/o/r/pull/2', number: 2 }) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
    vi.stubGlobal('fetch', mockFetch);

    // Creates new modules AND updates the source file — proper refactor
    const appContent = 'import { clamp } from "./utils";\nimport { Banner } from "./components/Banner";\n// rest of App.jsx with functions removed\nexport default function App() { return <div><Banner /></div>; }\n';
    const changes = [
      { path: 'src/utils.js', content: 'export const clamp = (v, min, max) => Math.min(Math.max(v, min), max);\n', action: 'create' },
      { path: 'src/components/Banner.jsx', content: 'import React from "react";\nexport const Banner = () => <div>Banner</div>;\n', action: 'create' },
      { path: 'src/App.jsx', content: appContent, action: 'update' },
    ];

    const result = await executeTool({
      id: 'call_pr_complete_refactor',
      type: 'function',
      function: {
        name: 'github_create_pr',
        arguments: JSON.stringify({
          owner: 'o',
          repo: 'r',
          title: 'refactor: Split App.jsx into modules',
          branch: 'test-split-complete',
          changes: JSON.stringify(changes),
        }),
      },
    }, { githubToken: 'token' });

    // PR should succeed without INCOMPLETE REFACTOR warning
    expect(result.content).toContain('Pull Request created successfully');
    expect(result.content).not.toContain('INCOMPLETE REFACTOR');
  });
});

describe('net deletion ratio guard in github_create_pr', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should block PRs where code updates delete far more lines than they add', async () => {
    // Simulate: original file is 200 lines, new content preserves identifiers (so rewrite
    // detection passes) but deletes >40% of lines. We keep byte size above 20% to
    // avoid the destructive-size check — this tests the NET DELETION guard specifically.
    const sharedFunctions = Array.from({ length: 20 }, (_, i) =>
      `export function func${i}() { return ${i}; }`
    );
    // Each line ~40 chars, 180 lines = ~7200 bytes of data
    const dataLines = Array.from({ length: 180 }, (_, i) =>
      `  { id: ${i}, name: "item${i}", value: ${i * 10} },`
    );
    const originalContent = [
      ...sharedFunctions,
      'export const destinations = [',
      ...dataLines,
      '];',
    ].join('\n');
    const originalB64 = btoa(originalContent);

    // New content: keeps all functions but removes most data lines.
    // Pad with long comment lines to keep byte size above 20% of original
    // while still having far fewer actual lines.
    const paddingLines = Array.from({ length: 10 }, (_, i) =>
      `// Configuration block ${i}: ${'x'.repeat(80)}`
    );
    const newContent = [
      ...sharedFunctions,
      ...paddingLines,
      'export const destinations = [',
      '  { id: 0, name: "item0", value: 0 },',
      '];',
    ].join('\n');

    const mockFetch = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      const urlStr = typeof url === 'string' ? url : '';
      const method = init?.method || 'GET';

      if (method === 'GET' && urlStr.includes('/contents/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            size: originalContent.length,
            content: originalB64,
            encoding: 'base64',
          }),
        });
      }
      if (method === 'GET' && urlStr.includes('/git/ref/')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ object: { sha: 'sha' } }) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
    vi.stubGlobal('fetch', mockFetch);

    const changes = [
      { path: 'src/App.jsx', content: newContent, action: 'update' },
    ];

    const result = await executeTool({
      id: 'call_net_deletion',
      type: 'function',
      function: {
        name: 'github_create_pr',
        arguments: JSON.stringify({
          owner: 'o',
          repo: 'r',
          title: 'Add features',
          branch: 'test-net-deletion',
          changes: JSON.stringify(changes),
        }),
      },
    }, { githubToken: 'token' });

    expect(result.content).toContain('NET DELETION blocked');
    expect(result.content).toContain('removes far more code than it adds');
  });
});

describe('audit trail protection in github_create_pr', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should block WORK_LOG.md updates that delete existing rows', async () => {
    const originalWorkLog = [
      '# Work Log',
      '',
      '| Date | Task | Model | Branch | PR | Status |',
      '|------|------|-------|--------|-----|--------|',
      '| 2026-02-10 | Init roadmap | /q3coder | bot/init | #1 | Done |',
      '| 2026-02-12 | Add features | /q3coder | bot/feat | #5 | Done |',
      '| 2026-02-14 | Fix bug | /q3coder | bot/fix | #8 | Done |',
    ].join('\n');
    const originalB64 = btoa(originalWorkLog);

    // New content erases the existing rows
    const newWorkLog = [
      '# Work Log',
      '',
      '| Date | Task | Model | Branch | PR | Status |',
      '|------|------|-------|--------|-----|--------|',
      '| 2026-02-16 | Add destinations | /q3coder | bot/dest | #19 | Done |',
    ].join('\n');

    const mockFetch = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      const urlStr = typeof url === 'string' ? url : '';
      const method = init?.method || 'GET';

      if (method === 'GET' && urlStr.includes('/contents/WORK_LOG.md')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            size: originalWorkLog.length,
            content: originalB64,
            encoding: 'base64',
          }),
        });
      }
      if (method === 'GET' && urlStr.includes('/git/ref/')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ object: { sha: 'sha' } }) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
    vi.stubGlobal('fetch', mockFetch);

    const changes = [
      { path: 'WORK_LOG.md', content: newWorkLog, action: 'update' },
    ];

    const result = await executeTool({
      id: 'call_audit_trail',
      type: 'function',
      function: {
        name: 'github_create_pr',
        arguments: JSON.stringify({
          owner: 'o',
          repo: 'r',
          title: 'Update docs',
          branch: 'test-audit',
          changes: JSON.stringify(changes),
        }),
      },
    }, { githubToken: 'token' });

    expect(result.content).toContain('AUDIT TRAIL VIOLATION');
    expect(result.content).toContain('APPEND-ONLY');
  });

  it('should allow WORK_LOG.md updates that append new rows', async () => {
    const originalWorkLog = [
      '# Work Log',
      '',
      '| Date | Task | Model | Branch | PR | Status |',
      '|------|------|-------|--------|-----|--------|',
      '| 2026-02-10 | Init roadmap | /q3coder | bot/init | #1 | Done |',
    ].join('\n');
    const originalB64 = btoa(originalWorkLog);

    // New content keeps existing row and adds a new one
    const newWorkLog = [
      '# Work Log',
      '',
      '| Date | Task | Model | Branch | PR | Status |',
      '|------|------|-------|--------|-----|--------|',
      '| 2026-02-10 | Init roadmap | /q3coder | bot/init | #1 | Done |',
      '| 2026-02-16 | Add features | /q3coder | bot/feat | #19 | Done |',
    ].join('\n');

    const mockFetch = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      const urlStr = typeof url === 'string' ? url : '';
      const method = init?.method || 'GET';

      if (method === 'GET' && urlStr.includes('/contents/WORK_LOG.md')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            size: originalWorkLog.length,
            content: originalB64,
            encoding: 'base64',
          }),
        });
      }
      if (method === 'GET' && urlStr.includes('/git/ref/')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ object: { sha: 'sha' } }) });
      }
      if (method === 'POST' && urlStr.includes('/git/blobs')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ sha: 'blob-sha' }) });
      }
      if (method === 'POST' && urlStr.includes('/git/trees')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ sha: 'tree-sha' }) });
      }
      if (method === 'POST' && urlStr.includes('/git/commits')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ sha: 'commit-sha' }) });
      }
      if (method === 'POST' && urlStr.includes('/git/refs')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ ref: 'refs/heads/bot/test' }) });
      }
      if (method === 'POST' && urlStr.includes('/pulls')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ html_url: 'https://github.com/o/r/pull/1', number: 1 }) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
    vi.stubGlobal('fetch', mockFetch);

    const changes = [
      { path: 'WORK_LOG.md', content: newWorkLog, action: 'update' },
    ];

    const result = await executeTool({
      id: 'call_audit_append',
      type: 'function',
      function: {
        name: 'github_create_pr',
        arguments: JSON.stringify({
          owner: 'o',
          repo: 'r',
          title: 'Update docs',
          branch: 'test-audit-ok',
          changes: JSON.stringify(changes),
        }),
      },
    }, { githubToken: 'token' });

    expect(result.content).toContain('Pull Request created successfully');
    expect(result.content).not.toContain('AUDIT TRAIL');
  });

  it('should block ROADMAP.md updates that silently delete many tasks', async () => {
    const originalRoadmap = [
      '# Roadmap',
      '## Phases',
      '### Phase 1: Foundation',
      '- [x] **Task 1.1**: Set up project structure',
      '- [x] **Task 1.2**: Add dark theme',
      '- [x] **Task 1.3**: Add CSV export',
      '- [x] **Task 1.4**: Add PDF export',
      '### Phase 2: Features',
      '- [ ] **Task 2.1**: Add 5 destinations',
      '- [ ] **Task 2.2**: Add currency widget',
      '## Notes',
      'Important context about the project.',
    ].join('\n');
    const originalB64 = btoa(originalRoadmap);

    // New content removes most tasks
    const newRoadmap = [
      '# Roadmap',
      '## Phases',
      '### Phase 1: Foundation',
      '- [x] **Task 1.1**: Set up project structure',
      '### Phase 2: Features',
      '- [x] **Task 2.1**: Add 5 destinations',
    ].join('\n');

    const mockFetch = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      const urlStr = typeof url === 'string' ? url : '';
      const method = init?.method || 'GET';

      if (method === 'GET' && urlStr.includes('/contents/ROADMAP.md')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            size: originalRoadmap.length,
            content: originalB64,
            encoding: 'base64',
          }),
        });
      }
      if (method === 'GET' && urlStr.includes('/git/ref/')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ object: { sha: 'sha' } }) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
    vi.stubGlobal('fetch', mockFetch);

    const changes = [
      { path: 'ROADMAP.md', content: newRoadmap, action: 'update' },
    ];

    const result = await executeTool({
      id: 'call_roadmap_tamper',
      type: 'function',
      function: {
        name: 'github_create_pr',
        arguments: JSON.stringify({
          owner: 'o',
          repo: 'r',
          title: 'Update roadmap',
          branch: 'test-roadmap-tamper',
          changes: JSON.stringify(changes),
        }),
      },
    }, { githubToken: 'token' });

    expect(result.content).toContain('ROADMAP TAMPERING');
    expect(result.content).toContain('tasks would be silently deleted');
  });
});

describe('sandbox_exec tool', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should be included in AVAILABLE_TOOLS', () => {
    const tool = AVAILABLE_TOOLS.find(t => t.function.name === 'sandbox_exec');
    expect(tool).toBeDefined();
    expect(tool!.function.parameters.required).toEqual(['commands']);
  });

  it('should NOT be included in TOOLS_WITHOUT_BROWSER (excluded from DOs)', () => {
    const tool = TOOLS_WITHOUT_BROWSER.find(t => t.function.name === 'sandbox_exec');
    expect(tool).toBeUndefined();
  });

  it('should fail without sandbox in context', async () => {
    const result = await executeTool({
      id: 'call_sb_1',
      type: 'function',
      function: {
        name: 'sandbox_exec',
        arguments: JSON.stringify({ commands: '["echo hello"]' }),
      },
    });

    expect(result.content).toContain('Sandbox container is not available');
  });

  it('should fail with invalid commands JSON', async () => {
    const mockSandbox: SandboxLike = {
      startProcess: vi.fn(),
    };

    const result = await executeTool({
      id: 'call_sb_2',
      type: 'function',
      function: {
        name: 'sandbox_exec',
        arguments: JSON.stringify({ commands: 'not json' }),
      },
    }, { sandbox: mockSandbox });

    expect(result.content).toContain('Invalid commands JSON');
  });

  it('should fail with empty commands array', async () => {
    const mockSandbox: SandboxLike = {
      startProcess: vi.fn(),
    };

    const result = await executeTool({
      id: 'call_sb_3',
      type: 'function',
      function: {
        name: 'sandbox_exec',
        arguments: JSON.stringify({ commands: '[]' }),
      },
    }, { sandbox: mockSandbox });

    expect(result.content).toContain('non-empty array');
  });

  it('should fail with too many commands', async () => {
    const mockSandbox: SandboxLike = {
      startProcess: vi.fn(),
    };

    const commands = Array.from({ length: 21 }, (_, i) => `echo ${i}`);

    const result = await executeTool({
      id: 'call_sb_4',
      type: 'function',
      function: {
        name: 'sandbox_exec',
        arguments: JSON.stringify({ commands: JSON.stringify(commands) }),
      },
    }, { sandbox: mockSandbox });

    expect(result.content).toContain('Too many commands');
  });

  it('should block dangerous commands', async () => {
    const mockSandbox: SandboxLike = {
      startProcess: vi.fn(),
    };

    const result = await executeTool({
      id: 'call_sb_5',
      type: 'function',
      function: {
        name: 'sandbox_exec',
        arguments: JSON.stringify({ commands: '["rm -rf /"]' }),
      },
    }, { sandbox: mockSandbox });

    expect(result.content).toContain('Blocked command pattern');
  });

  it('should execute commands and return output', async () => {
    const mockProcess: SandboxProcess = {
      id: 'proc-1',
      status: 'completed',
      getLogs: vi.fn().mockResolvedValue({
        stdout: 'hello world\n',
        stderr: '',
      }),
      kill: vi.fn(),
    };

    const mockSandbox: SandboxLike = {
      startProcess: vi.fn().mockResolvedValue(mockProcess),
    };

    const result = await executeTool({
      id: 'call_sb_6',
      type: 'function',
      function: {
        name: 'sandbox_exec',
        arguments: JSON.stringify({ commands: '["echo hello world"]' }),
      },
    }, { sandbox: mockSandbox });

    expect(result.role).toBe('tool');
    expect(result.content).toContain('Sandbox Execution');
    expect(result.content).toContain('echo hello world');
    expect(result.content).toContain('hello world');

    // Verify sandbox.startProcess was called
    expect(mockSandbox.startProcess).toHaveBeenCalledTimes(1);
    const call = (mockSandbox.startProcess as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[0]).toContain('echo hello world');
  });

  it('should execute multiple commands sequentially', async () => {
    let callCount = 0;
    const mockSandbox: SandboxLike = {
      startProcess: vi.fn().mockImplementation(() => {
        callCount++;
        return Promise.resolve({
          id: `proc-${callCount}`,
          status: 'completed',
          getLogs: vi.fn().mockResolvedValue({
            stdout: `output ${callCount}\n`,
            stderr: '',
          }),
          kill: vi.fn(),
        });
      }),
    };

    const result = await executeTool({
      id: 'call_sb_7',
      type: 'function',
      function: {
        name: 'sandbox_exec',
        arguments: JSON.stringify({ commands: '["echo first", "echo second"]' }),
      },
    }, { sandbox: mockSandbox });

    expect(result.content).toContain('Command 1/2');
    expect(result.content).toContain('Command 2/2');
    expect(mockSandbox.startProcess).toHaveBeenCalledTimes(2);
  });

  it('should pass GitHub token as environment variable', async () => {
    const mockProcess: SandboxProcess = {
      id: 'proc-env',
      status: 'completed',
      getLogs: vi.fn().mockResolvedValue({ stdout: 'done\n', stderr: '' }),
      kill: vi.fn(),
    };

    const mockSandbox: SandboxLike = {
      startProcess: vi.fn().mockResolvedValue(mockProcess),
    };

    await executeTool({
      id: 'call_sb_8',
      type: 'function',
      function: {
        name: 'sandbox_exec',
        arguments: JSON.stringify({ commands: '["git clone https://github.com/o/r"]' }),
      },
    }, { sandbox: mockSandbox, githubToken: 'gh-token-123' });

    const call = (mockSandbox.startProcess as ReturnType<typeof vi.fn>).mock.calls[0];
    const envArg = call[1]?.env;
    expect(envArg).toBeDefined();
    expect(envArg.GH_TOKEN).toBe('gh-token-123');
    expect(envArg.GITHUB_TOKEN).toBe('gh-token-123');
  });

  it('should stop on first error (fail-fast)', async () => {
    let callCount = 0;
    const mockSandbox: SandboxLike = {
      startProcess: vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject(new Error('Process failed'));
        }
        return Promise.resolve({
          id: 'proc',
          status: 'completed',
          getLogs: vi.fn().mockResolvedValue({ stdout: '', stderr: '' }),
          kill: vi.fn(),
        });
      }),
    };

    const result = await executeTool({
      id: 'call_sb_9',
      type: 'function',
      function: {
        name: 'sandbox_exec',
        arguments: JSON.stringify({ commands: '["bad-cmd", "echo should-not-run"]' }),
      },
    }, { sandbox: mockSandbox });

    expect(result.content).toContain('Process failed');
    expect(result.content).toContain('Stopped at command 1');
    // Second command should not have been called
    expect(mockSandbox.startProcess).toHaveBeenCalledTimes(1);
  });

  it('should handle stderr output', async () => {
    const mockProcess: SandboxProcess = {
      id: 'proc-err',
      status: 'completed',
      getLogs: vi.fn().mockResolvedValue({
        stdout: '',
        stderr: 'warning: some deprecation\n',
      }),
      kill: vi.fn(),
    };

    const mockSandbox: SandboxLike = {
      startProcess: vi.fn().mockResolvedValue(mockProcess),
    };

    const result = await executeTool({
      id: 'call_sb_10',
      type: 'function',
      function: {
        name: 'sandbox_exec',
        arguments: JSON.stringify({ commands: '["npm test"]' }),
      },
    }, { sandbox: mockSandbox });

    expect(result.content).toContain('stderr:');
    expect(result.content).toContain('warning: some deprecation');
  });
});
