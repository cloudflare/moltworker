/**
 * Tool definitions and execution for OpenRouter tool calling
 */

import { getModel } from './models';

// Tool definitions in OpenAI function calling format
export interface ToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, {
        type: string;
        description: string;
        enum?: string[];
      }>;
      required: string[];
    };
  };
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface ToolResult {
  tool_call_id: string;
  role: 'tool';
  content: string;
}

/**
 * Context for tool execution (holds secrets like GitHub token)
 */
export interface ToolContext {
  githubToken?: string;
  browser?: Fetcher; // Cloudflare Browser Rendering binding
}

/**
 * Available tools for the bot
 * Note: GitHub token is provided automatically via ToolContext, not by the model
 */
export const AVAILABLE_TOOLS: ToolDefinition[] = [
  {
    type: 'function',
    function: {
      name: 'fetch_url',
      description: 'Fetch content from a URL. Returns the text content of the page or file.',
      parameters: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
            description: 'The URL to fetch content from',
          },
        },
        required: ['url'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'github_read_file',
      description: 'Read a file from a GitHub repository. Authentication is handled automatically. Works with both public and private repos.',
      parameters: {
        type: 'object',
        properties: {
          owner: {
            type: 'string',
            description: 'Repository owner (username or organization)',
          },
          repo: {
            type: 'string',
            description: 'Repository name',
          },
          path: {
            type: 'string',
            description: 'Path to the file in the repository',
          },
          ref: {
            type: 'string',
            description: 'Branch, tag, or commit SHA (optional, defaults to main/master)',
          },
        },
        required: ['owner', 'repo', 'path'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'github_list_files',
      description: 'List files in a directory of a GitHub repository. Authentication is handled automatically.',
      parameters: {
        type: 'object',
        properties: {
          owner: {
            type: 'string',
            description: 'Repository owner (username or organization)',
          },
          repo: {
            type: 'string',
            description: 'Repository name',
          },
          path: {
            type: 'string',
            description: 'Path to the directory (empty string or omit for root)',
          },
          ref: {
            type: 'string',
            description: 'Branch, tag, or commit SHA (optional)',
          },
        },
        required: ['owner', 'repo'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'github_api',
      description: 'Make a GitHub API request. Use for creating issues, PRs, getting repo info, etc. Authentication is handled automatically.',
      parameters: {
        type: 'object',
        properties: {
          endpoint: {
            type: 'string',
            description: 'GitHub API endpoint path (e.g., /repos/owner/repo/issues, /user)',
          },
          method: {
            type: 'string',
            description: 'HTTP method',
            enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
          },
          body: {
            type: 'string',
            description: 'JSON body for POST/PUT/PATCH requests (optional)',
          },
        },
        required: ['endpoint', 'method'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'url_metadata',
      description: 'Extract metadata (title, description, image, author, publisher, date) from a URL. Use this when you need structured info about a webpage rather than its full content.',
      parameters: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
            description: 'The URL to extract metadata from',
          },
        },
        required: ['url'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'generate_chart',
      description: 'Generate a chart image URL using Chart.js configuration. Returns a URL that renders as a PNG image. Use for data visualization in messages.',
      parameters: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            description: 'Chart type',
            enum: ['bar', 'line', 'pie', 'doughnut', 'radar'],
          },
          labels: {
            type: 'string',
            description: 'JSON array of label strings, e.g. ["Jan","Feb","Mar"]',
          },
          datasets: {
            type: 'string',
            description: 'JSON array of dataset objects, e.g. [{"label":"Sales","data":[10,20,30]}]',
          },
        },
        required: ['type', 'labels', 'datasets'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_weather',
      description: 'Get current weather and 7-day forecast for a location. Provide latitude and longitude coordinates.',
      parameters: {
        type: 'object',
        properties: {
          latitude: {
            type: 'string',
            description: 'Latitude (-90 to 90)',
          },
          longitude: {
            type: 'string',
            description: 'Longitude (-180 to 180)',
          },
        },
        required: ['latitude', 'longitude'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'fetch_news',
      description: 'Fetch top stories from a news source. Supports HackerNews (tech), Reddit (any subreddit), and arXiv (research papers).',
      parameters: {
        type: 'object',
        properties: {
          source: {
            type: 'string',
            description: 'News source to fetch from',
            enum: ['hackernews', 'reddit', 'arxiv'],
          },
          topic: {
            type: 'string',
            description: 'Optional: subreddit name for Reddit (default: technology) or arXiv category (default: cs.AI)',
          },
        },
        required: ['source'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'browse_url',
      description: 'Browse a URL using a real browser. Use this for JavaScript-rendered pages, screenshots, or when fetch_url fails. Returns text content by default, or a screenshot/PDF.',
      parameters: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
            description: 'The URL to browse',
          },
          action: {
            type: 'string',
            description: 'Action to perform',
            enum: ['extract_text', 'screenshot', 'pdf'],
          },
          wait_for: {
            type: 'string',
            description: 'CSS selector to wait for before extracting content (optional)',
          },
        },
        required: ['url'],
      },
    },
  },
];

/**
 * Execute a tool call and return the result
 * @param toolCall The tool call from the model
 * @param context Optional context containing secrets like GitHub token
 */
export async function executeTool(toolCall: ToolCall, context?: ToolContext): Promise<ToolResult> {
  const { name, arguments: argsString } = toolCall.function;

  let args: Record<string, string>;
  try {
    args = JSON.parse(argsString);
  } catch {
    return {
      tool_call_id: toolCall.id,
      role: 'tool',
      content: `Error: Invalid JSON arguments: ${argsString}`,
    };
  }

  // Use GitHub token from context (automatic auth)
  const githubToken = context?.githubToken;

  try {
    let result: string;

    switch (name) {
      case 'fetch_url':
        result = await fetchUrl(args.url);
        break;
      case 'github_read_file':
        result = await githubReadFile(args.owner, args.repo, args.path, args.ref, githubToken);
        break;
      case 'github_list_files':
        result = await githubListFiles(args.owner, args.repo, args.path || '', args.ref, githubToken);
        break;
      case 'github_api':
        result = await githubApi(args.endpoint, args.method as 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE', args.body, githubToken);
        break;
      case 'url_metadata':
        result = await urlMetadata(args.url);
        break;
      case 'generate_chart':
        result = await generateChart(args.type, args.labels, args.datasets);
        break;
      case 'get_weather':
        result = await getWeather(args.latitude, args.longitude);
        break;
      case 'fetch_news':
        result = await fetchNews(args.source, args.topic);
        break;
      case 'browse_url':
        result = await browseUrl(args.url, args.action as 'extract_text' | 'screenshot' | 'pdf' | undefined, args.wait_for, context?.browser);
        break;
      default:
        result = `Error: Unknown tool: ${name}`;
    }

    return {
      tool_call_id: toolCall.id,
      role: 'tool',
      content: result,
    };
  } catch (error) {
    return {
      tool_call_id: toolCall.id,
      role: 'tool',
      content: `Error executing ${name}: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Fetch content from a URL
 */
async function fetchUrl(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'MoltworkerBot/1.0',
      'Accept': 'text/plain, text/html, application/json, */*',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type') || '';
  const text = await response.text();

  // Truncate very long responses
  if (text.length > 50000) {
    return text.slice(0, 50000) + '\n\n[Content truncated - exceeded 50KB]';
  }

  return text;
}

/**
 * Read a file from GitHub
 */
async function githubReadFile(
  owner: string,
  repo: string,
  path: string,
  ref?: string,
  token?: string
): Promise<string> {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}${ref ? `?ref=${ref}` : ''}`;

  const headers: Record<string, string> = {
    'User-Agent': 'MoltworkerBot/1.0',
    'Accept': 'application/vnd.github.v3+json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GitHub API error ${response.status}: ${error}`);
  }

  const data = await response.json() as { content?: string; encoding?: string; message?: string };

  if (data.message) {
    throw new Error(data.message);
  }

  if (!data.content) {
    throw new Error('No content in response');
  }

  // GitHub returns base64 encoded content
  const content = atob(data.content.replace(/\n/g, ''));

  // Truncate very long files
  if (content.length > 50000) {
    return content.slice(0, 50000) + '\n\n[Content truncated - exceeded 50KB]';
  }

  return content;
}

/**
 * List files in a GitHub directory
 */
async function githubListFiles(
  owner: string,
  repo: string,
  path: string,
  ref?: string,
  token?: string
): Promise<string> {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}${ref ? `?ref=${ref}` : ''}`;

  const headers: Record<string, string> = {
    'User-Agent': 'MoltworkerBot/1.0',
    'Accept': 'application/vnd.github.v3+json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GitHub API error ${response.status}: ${error}`);
  }

  const data = await response.json() as Array<{ name: string; type: string; path: string; size?: number }>;

  if (!Array.isArray(data)) {
    throw new Error('Not a directory');
  }

  const listing = data.map(item => {
    const icon = item.type === 'dir' ? '📁' : '📄';
    const size = item.size ? ` (${item.size} bytes)` : '';
    return `${icon} ${item.path}${size}`;
  }).join('\n');

  return `Files in ${owner}/${repo}/${path || '(root)'}:\n\n${listing}`;
}

/**
 * Make a GitHub API request
 */
async function githubApi(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  body?: string,
  token?: string
): Promise<string> {
  const url = endpoint.startsWith('https://')
    ? endpoint
    : `https://api.github.com${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;

  const headers: Record<string, string> = {
    'User-Agent': 'MoltworkerBot/1.0',
    'Accept': 'application/vnd.github.v3+json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body && (method === 'POST' || method === 'PUT' || method === 'PATCH') ? body : undefined,
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(`GitHub API error ${response.status}: ${responseText}`);
  }

  // Try to format JSON response
  try {
    const json = JSON.parse(responseText);
    return JSON.stringify(json, null, 2);
  } catch {
    return responseText;
  }
}

/**
 * Microlink API response shape
 */
interface MicrolinkResponse {
  status: string;
  message?: string;
  data: {
    title?: string;
    description?: string;
    image?: { url?: string };
    author?: string;
    publisher?: string;
    date?: string;
  };
}

/**
 * Extract metadata from a URL using the Microlink API
 */
async function urlMetadata(url: string): Promise<string> {
  // Validate URL
  try {
    new URL(url);
  } catch {
    throw new Error(`Invalid URL: ${url}`);
  }

  const apiUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}`;
  const response = await fetch(apiUrl, {
    headers: {
      'User-Agent': 'MoltworkerBot/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`Microlink API error: HTTP ${response.status}`);
  }

  const result = await response.json() as MicrolinkResponse;

  if (result.status !== 'success') {
    return `Error: ${result.message || 'Failed to extract metadata'}`;
  }

  const { title, description, image, author, publisher, date } = result.data;
  const metadata = {
    title: title || null,
    description: description || null,
    image: image?.url || null,
    author: author || null,
    publisher: publisher || null,
    date: date || null,
  };

  const output = JSON.stringify(metadata, null, 2);

  // Truncate if unexpectedly large
  if (output.length > 50000) {
    return output.slice(0, 50000) + '\n\n[Content truncated - exceeded 50KB]';
  }

  return output;
}

/**
 * Valid chart types for QuickChart
 */
const VALID_CHART_TYPES = ['bar', 'line', 'pie', 'doughnut', 'radar'] as const;

/**
 * Generate a chart image URL via QuickChart.io
 */
async function generateChart(
  chartType: string,
  labelsJson: string,
  datasetsJson: string
): Promise<string> {
  if (!VALID_CHART_TYPES.includes(chartType as typeof VALID_CHART_TYPES[number])) {
    throw new Error(`Invalid chart type: ${chartType}. Must be one of: ${VALID_CHART_TYPES.join(', ')}`);
  }

  let labels: unknown;
  try {
    labels = JSON.parse(labelsJson);
  } catch {
    throw new Error('Invalid labels JSON: must be an array of strings');
  }

  if (!Array.isArray(labels)) {
    throw new Error('Labels must be a JSON array');
  }

  let datasets: unknown;
  try {
    datasets = JSON.parse(datasetsJson);
  } catch {
    throw new Error('Invalid datasets JSON: must be an array of dataset objects');
  }

  if (!Array.isArray(datasets) || datasets.length === 0) {
    throw new Error('Datasets must be a non-empty JSON array');
  }

  const config = {
    type: chartType,
    data: { labels, datasets },
  };

  const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(config))}&w=600&h=400`;

  // Verify the URL is reachable
  const response = await fetch(chartUrl, { method: 'HEAD' });
  if (!response.ok) {
    throw new Error(`QuickChart error: HTTP ${response.status}`);
  }

  return chartUrl;
}

/**
 * WMO Weather Interpretation Codes (WW)
 * https://www.noaa.gov/weather
 */
const WMO_WEATHER_CODES: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snow fall',
  73: 'Moderate snow fall',
  75: 'Heavy snow fall',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
};

/**
 * Open-Meteo API response shape
 */
interface OpenMeteoResponse {
  current_weather: {
    temperature: number;
    windspeed: number;
    weathercode: number;
    time: string;
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weathercode: number[];
  };
  timezone: string;
}

/**
 * Get weather forecast from Open-Meteo API
 */
async function getWeather(latitude: string, longitude: string): Promise<string> {
  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);

  if (isNaN(lat) || lat < -90 || lat > 90) {
    throw new Error(`Invalid latitude: ${latitude}. Must be between -90 and 90`);
  }
  if (isNaN(lon) || lon < -180 || lon > 180) {
    throw new Error(`Invalid longitude: ${longitude}. Must be between -180 and 180`);
  }

  const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;
  const response = await fetch(apiUrl, {
    headers: { 'User-Agent': 'MoltworkerBot/1.0' },
  });

  if (!response.ok) {
    throw new Error(`Open-Meteo API error: HTTP ${response.status}`);
  }

  const data = await response.json() as OpenMeteoResponse;
  const current = data.current_weather;
  const weatherDesc = WMO_WEATHER_CODES[current.weathercode] || 'Unknown';

  let output = `Current weather (${data.timezone}):\n`;
  output += `${weatherDesc}, ${current.temperature}\u00B0C, wind ${current.windspeed} km/h\n`;
  output += `\n7-day forecast:\n`;

  for (let i = 0; i < data.daily.time.length; i++) {
    const dayWeather = WMO_WEATHER_CODES[data.daily.weathercode[i]] || 'Unknown';
    output += `${data.daily.time[i]}: ${data.daily.temperature_2m_min[i]}\u2013${data.daily.temperature_2m_max[i]}\u00B0C, ${dayWeather}\n`;
  }

  return output;
}

/**
 * Valid news sources for fetch_news
 */
const VALID_NEWS_SOURCES = ['hackernews', 'reddit', 'arxiv'] as const;

/**
 * HackerNews story item shape
 */
interface HNItem {
  id: number;
  title?: string;
  url?: string;
  score?: number;
  by?: string;
  descendants?: number;
}

/**
 * Reddit listing response shape
 */
interface RedditListing {
  data: {
    children: Array<{
      data: {
        title: string;
        url: string;
        score: number;
        permalink: string;
        num_comments: number;
        author: string;
      };
    }>;
  };
}

/**
 * Fetch top stories from a news source
 */
async function fetchNews(source: string, topic?: string): Promise<string> {
  if (!VALID_NEWS_SOURCES.includes(source as typeof VALID_NEWS_SOURCES[number])) {
    throw new Error(`Invalid source: ${source}. Must be one of: ${VALID_NEWS_SOURCES.join(', ')}`);
  }

  switch (source) {
    case 'hackernews':
      return fetchHackerNews();
    case 'reddit':
      return fetchReddit(topic || 'technology');
    case 'arxiv':
      return fetchArxiv(topic || 'cs.AI');
    default:
      throw new Error(`Unknown source: ${source}`);
  }
}

/**
 * Fetch top 10 stories from HackerNews
 */
async function fetchHackerNews(): Promise<string> {
  const idsResponse = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json', {
    headers: { 'User-Agent': 'MoltworkerBot/1.0' },
  });

  if (!idsResponse.ok) {
    throw new Error(`HackerNews API error: HTTP ${idsResponse.status}`);
  }

  const allIds = await idsResponse.json() as number[];
  const topIds = allIds.slice(0, 10);

  const items = await Promise.all(
    topIds.map(async (id) => {
      const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, {
        headers: { 'User-Agent': 'MoltworkerBot/1.0' },
      });
      if (!response.ok) return null;
      return response.json() as Promise<HNItem>;
    })
  );

  const stories = items
    .filter((item): item is HNItem => item !== null && !!item.title)
    .map((item, i) => {
      const url = item.url || `https://news.ycombinator.com/item?id=${item.id}`;
      return `${i + 1}. ${item.title}\n   ${url}\n   ${item.score || 0} points by ${item.by || 'unknown'} | ${item.descendants || 0} comments`;
    });

  return `HackerNews Top Stories:\n\n${stories.join('\n\n')}`;
}

/**
 * Fetch top 10 posts from a Reddit subreddit
 */
async function fetchReddit(subreddit: string): Promise<string> {
  const url = `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/top.json?limit=10&t=day`;
  const response = await fetch(url, {
    headers: { 'User-Agent': 'MoltworkerBot/1.0' },
  });

  if (!response.ok) {
    throw new Error(`Reddit API error: HTTP ${response.status}`);
  }

  const data = await response.json() as RedditListing;
  const posts = data.data.children.map((child, i) => {
    const post = child.data;
    return `${i + 1}. ${post.title}\n   ${post.url}\n   ${post.score} points by ${post.author} | ${post.num_comments} comments`;
  });

  return `Reddit r/${subreddit} Top Posts (today):\n\n${posts.join('\n\n')}`;
}

/**
 * Fetch latest 10 papers from arXiv
 */
async function fetchArxiv(category: string): Promise<string> {
  const url = `https://export.arxiv.org/api/query?search_query=cat:${encodeURIComponent(category)}&sortBy=submittedDate&sortOrder=descending&max_results=10`;
  const response = await fetch(url, {
    headers: { 'User-Agent': 'MoltworkerBot/1.0' },
  });

  if (!response.ok) {
    throw new Error(`arXiv API error: HTTP ${response.status}`);
  }

  const xml = await response.text();

  // Simple XML parsing — extract <entry> elements
  const entries: string[] = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;
  while ((match = entryRegex.exec(xml)) !== null) {
    const entry = match[1];
    const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/\s+/g, ' ').trim() || 'Untitled';
    const link = entry.match(/<id>([\s\S]*?)<\/id>/)?.[1]?.trim() || '';
    const summary = entry.match(/<summary>([\s\S]*?)<\/summary>/)?.[1]?.replace(/\s+/g, ' ').trim() || '';
    const authors: string[] = [];
    const authorRegex = /<author>\s*<name>([\s\S]*?)<\/name>/g;
    let authorMatch;
    while ((authorMatch = authorRegex.exec(entry)) !== null) {
      authors.push(authorMatch[1].trim());
    }

    const shortSummary = summary.length > 150 ? summary.slice(0, 150) + '...' : summary;
    entries.push(`${entries.length + 1}. ${title}\n   ${link}\n   Authors: ${authors.join(', ') || 'Unknown'}\n   ${shortSummary}`);
  }

  if (entries.length === 0) {
    return `No papers found for arXiv category: ${category}`;
  }

  return `arXiv ${category} Latest Papers:\n\n${entries.join('\n\n')}`;
}

/**
 * Browse a URL using Cloudflare Browser Rendering
 */
async function browseUrl(
  url: string,
  action: 'extract_text' | 'screenshot' | 'pdf' = 'extract_text',
  waitFor?: string,
  browser?: Fetcher
): Promise<string> {
  if (!browser) {
    // Fallback to regular fetch if browser not available
    return fetchUrl(url);
  }

  try {
    // Use Cloudflare Browser Rendering API
    // The browser binding acts as a Puppeteer endpoint
    const sessionResponse = await browser.fetch('https://browser/new', {
      method: 'POST',
    });

    if (!sessionResponse.ok) {
      throw new Error(`Failed to create browser session: ${sessionResponse.statusText}`);
    }

    const session = await sessionResponse.json() as { sessionId: string };
    const sessionId = session.sessionId;

    try {
      // Navigate to URL
      await browser.fetch(`https://browser/${sessionId}/navigate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      // Wait for selector if specified
      if (waitFor) {
        await browser.fetch(`https://browser/${sessionId}/wait`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ selector: waitFor, timeout: 10000 }),
        });
      } else {
        // Default wait for page to be ready
        await browser.fetch(`https://browser/${sessionId}/wait`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event: 'networkidle0', timeout: 10000 }),
        });
      }

      // Perform the requested action
      switch (action) {
        case 'screenshot': {
          const screenshotResponse = await browser.fetch(`https://browser/${sessionId}/screenshot`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullPage: false }),
          });

          if (!screenshotResponse.ok) {
            throw new Error('Failed to take screenshot');
          }

          const data = await screenshotResponse.json() as { base64: string };
          // Return as data URL that can be displayed
          return `Screenshot captured. Base64 data (first 100 chars): ${data.base64.slice(0, 100)}...\n\n[Full screenshot data available for image rendering]`;
        }

        case 'pdf': {
          const pdfResponse = await browser.fetch(`https://browser/${sessionId}/pdf`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
          });

          if (!pdfResponse.ok) {
            throw new Error('Failed to generate PDF');
          }

          return 'PDF generated successfully. The document can be downloaded from the session.';
        }

        case 'extract_text':
        default: {
          // Extract text content from the page
          const textResponse = await browser.fetch(`https://browser/${sessionId}/evaluate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              expression: `
                (function() {
                  // Remove script and style elements
                  const scripts = document.querySelectorAll('script, style, noscript');
                  scripts.forEach(el => el.remove());

                  // Get text content
                  const title = document.title || '';
                  const body = document.body?.innerText || '';

                  // Get meta description
                  const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';

                  return {
                    title,
                    description: metaDesc,
                    content: body.slice(0, 50000) // Limit content
                  };
                })()
              `,
            }),
          });

          if (!textResponse.ok) {
            throw new Error('Failed to extract text');
          }

          const result = await textResponse.json() as { result: { title: string; description: string; content: string } };
          const { title, description, content } = result.result;

          let output = `Title: ${title}\n`;
          if (description) {
            output += `Description: ${description}\n`;
          }
          output += `\n---\n\n${content}`;

          // Truncate if too long
          if (output.length > 50000) {
            return output.slice(0, 50000) + '\n\n[Content truncated - exceeded 50KB]';
          }

          return output;
        }
      }
    } finally {
      // Clean up session
      try {
        await browser.fetch(`https://browser/${sessionId}/close`, {
          method: 'POST',
        });
      } catch {
        // Ignore cleanup errors
      }
    }
  } catch (error) {
    // If browser rendering fails, fall back to regular fetch
    console.error('[browse_url] Browser rendering failed, falling back to fetch:', error);
    return fetchUrl(url);
  }
}

/**
 * Daily briefing cache (15-minute TTL)
 */
const BRIEFING_CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
let briefingCache: { result: string; timestamp: number } | null = null;

/**
 * Briefing section result
 */
interface BriefingSection {
  header: string;
  content: string;
  ok: boolean;
}

/**
 * Generate a daily briefing by aggregating weather, news, and research data.
 * Calls multiple APIs in parallel and formats results for Telegram.
 *
 * @param latitude - User latitude for weather (default: 50.08 = Prague)
 * @param longitude - User longitude for weather (default: 14.44 = Prague)
 * @param subreddit - Subreddit for Reddit section (default: technology)
 * @param arxivCategory - arXiv category (default: cs.AI)
 */
export async function generateDailyBriefing(
  latitude: string = '50.08',
  longitude: string = '14.44',
  subreddit: string = 'technology',
  arxivCategory: string = 'cs.AI'
): Promise<string> {
  // Check cache
  if (briefingCache && (Date.now() - briefingCache.timestamp) < BRIEFING_CACHE_TTL_MS) {
    return briefingCache.result;
  }

  // Fetch all sections in parallel
  const [weatherResult, hnResult, redditResult, arxivResult] = await Promise.allSettled([
    fetchBriefingWeather(latitude, longitude),
    fetchBriefingHN(),
    fetchBriefingReddit(subreddit),
    fetchBriefingArxiv(arxivCategory),
  ]);

  const sections: BriefingSection[] = [
    extractSection(weatherResult, '\u2600\uFE0F Weather'),
    extractSection(hnResult, '\uD83D\uDD25 HackerNews Top 5'),
    extractSection(redditResult, `\uD83D\uDCAC Reddit r/${subreddit}`),
    extractSection(arxivResult, `\uD83D\uDCDA arXiv ${arxivCategory}`),
  ];

  const date = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  let output = `\uD83D\uDCCB Daily Briefing \u2014 ${date}\n`;
  output += '\u2500'.repeat(30) + '\n\n';

  for (const section of sections) {
    output += `${section.header}\n`;
    if (section.ok) {
      output += `${section.content}\n\n`;
    } else {
      output += `\u26A0\uFE0F Unavailable: ${section.content}\n\n`;
    }
  }

  output += '\uD83D\uDD04 Updates every 15 minutes';

  // Update cache
  briefingCache = { result: output, timestamp: Date.now() };

  return output;
}

/**
 * Extract a section result from a settled promise
 */
function extractSection(
  result: PromiseSettledResult<string>,
  header: string
): BriefingSection {
  if (result.status === 'fulfilled') {
    return { header, content: result.value, ok: true };
  }
  const error = result.reason instanceof Error ? result.reason.message : String(result.reason);
  return { header, content: error, ok: false };
}

/**
 * Fetch weather data formatted for briefing
 */
async function fetchBriefingWeather(latitude: string, longitude: string): Promise<string> {
  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);
  const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&forecast_days=3`;
  const response = await fetch(apiUrl, {
    headers: { 'User-Agent': 'MoltworkerBot/1.0' },
  });

  if (!response.ok) {
    throw new Error(`Weather API HTTP ${response.status}`);
  }

  const data = await response.json() as OpenMeteoResponse;
  const current = data.current_weather;
  const weatherDesc = WMO_WEATHER_CODES[current.weathercode] || 'Unknown';

  let output = `${weatherDesc}, ${current.temperature}\u00B0C, wind ${current.windspeed} km/h\n`;
  const days = Math.min(data.daily.time.length, 3);
  for (let i = 0; i < days; i++) {
    const dayWeather = WMO_WEATHER_CODES[data.daily.weathercode[i]] || 'Unknown';
    output += `  ${data.daily.time[i]}: ${data.daily.temperature_2m_min[i]}\u2013${data.daily.temperature_2m_max[i]}\u00B0C, ${dayWeather}\n`;
  }

  return output.trim();
}

/**
 * Fetch top 5 HackerNews stories for briefing
 */
async function fetchBriefingHN(): Promise<string> {
  const idsResponse = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json', {
    headers: { 'User-Agent': 'MoltworkerBot/1.0' },
  });

  if (!idsResponse.ok) throw new Error(`HN API HTTP ${idsResponse.status}`);

  const allIds = await idsResponse.json() as number[];
  const topIds = allIds.slice(0, 5);

  const items = await Promise.all(
    topIds.map(async (id) => {
      const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, {
        headers: { 'User-Agent': 'MoltworkerBot/1.0' },
      });
      if (!response.ok) return null;
      return response.json() as Promise<HNItem>;
    })
  );

  return items
    .filter((item): item is HNItem => item !== null && !!item.title)
    .map((item, i) => `${i + 1}. ${item.title} (${item.score || 0}\u2B06)`)
    .join('\n');
}

/**
 * Fetch top 3 Reddit posts for briefing
 */
async function fetchBriefingReddit(subreddit: string): Promise<string> {
  const url = `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/top.json?limit=3&t=day`;
  const response = await fetch(url, {
    headers: { 'User-Agent': 'MoltworkerBot/1.0' },
  });

  if (!response.ok) throw new Error(`Reddit API HTTP ${response.status}`);

  const data = await response.json() as RedditListing;
  return data.data.children
    .map((child, i) => `${i + 1}. ${child.data.title} (${child.data.score}\u2B06, ${child.data.num_comments} comments)`)
    .join('\n');
}

/**
 * Fetch latest 3 arXiv papers for briefing
 */
async function fetchBriefingArxiv(category: string): Promise<string> {
  const url = `https://export.arxiv.org/api/query?search_query=cat:${encodeURIComponent(category)}&sortBy=submittedDate&sortOrder=descending&max_results=3`;
  const response = await fetch(url, {
    headers: { 'User-Agent': 'MoltworkerBot/1.0' },
  });

  if (!response.ok) throw new Error(`arXiv API HTTP ${response.status}`);

  const xml = await response.text();
  const entries: string[] = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;
  while ((match = entryRegex.exec(xml)) !== null) {
    const entry = match[1];
    const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/\s+/g, ' ').trim() || 'Untitled';
    entries.push(`${entries.length + 1}. ${title}`);
  }

  return entries.length > 0 ? entries.join('\n') : 'No recent papers found';
}

/**
 * Clear the briefing cache (for testing)
 */
export function clearBriefingCache(): void {
  briefingCache = null;
}

/**
 * Tools available without browser binding (for Durable Objects)
 */
export const TOOLS_WITHOUT_BROWSER: ToolDefinition[] = AVAILABLE_TOOLS.filter(
  tool => tool.function.name !== 'browse_url'
);

/**
 * Check if a model supports tools
 */
export function modelSupportsTools(modelAlias: string): boolean {
  // Check if model has supportsTools flag in models.ts
  const model = getModel(modelAlias);
  if (model?.supportsTools) {
    return true;
  }
  // Fallback: hardcoded list for backwards compatibility
  const toolModels = ['grok', 'grokcode', 'qwencoder', 'qwennext', 'qwenthink', 'mini', 'kimi', 'gpt', 'sonnet', 'opus', 'haiku', 'geminipro', 'devstral'];
  return toolModels.includes(modelAlias.toLowerCase());
}
