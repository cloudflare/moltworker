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
