/**
 * Tool definitions and execution for OpenRouter tool calling
 */

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
 * Check if a model supports tools
 */
export function modelSupportsTools(modelAlias: string): boolean {
  const toolModels = ['grok', 'grokcode', 'qwencoder', 'qwennext', 'qwenthink', 'mini', 'kimi', 'gpt', 'sonnet', 'opus', 'haiku', 'geminipro', 'devstral'];
  return toolModels.includes(modelAlias.toLowerCase());
}
