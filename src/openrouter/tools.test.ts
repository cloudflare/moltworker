import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AVAILABLE_TOOLS, TOOLS_WITHOUT_BROWSER, executeTool, generateDailyBriefing, clearBriefingCache, clearExchangeRateCache, clearCryptoCache, clearGeoCache } from './tools';

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
