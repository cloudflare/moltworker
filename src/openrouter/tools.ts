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
