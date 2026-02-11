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
 * Minimal interface for sandbox process results.
 * Avoids direct dependency on @cloudflare/sandbox in this module.
 */
export interface SandboxProcess {
  id: string;
  status: string;
  getLogs(): Promise<{ stdout?: string; stderr?: string }>;
  kill(): Promise<void>;
}

/**
 * Minimal interface for sandbox container operations.
 * Matches the subset of @cloudflare/sandbox Sandbox we need.
 */
export interface SandboxLike {
  startProcess(command: string, options?: { env?: Record<string, string> }): Promise<SandboxProcess>;
}

/**
 * Context for tool execution (holds secrets like GitHub token)
 */
export interface ToolContext {
  githubToken?: string;
  browser?: Fetcher; // Cloudflare Browser Rendering binding
  sandbox?: SandboxLike; // Sandbox container for code execution
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
      name: 'convert_currency',
      description: 'Convert between currencies using live exchange rates. Supports 150+ currencies including USD, EUR, GBP, CZK, JPY, etc.',
      parameters: {
        type: 'object',
        properties: {
          from: {
            type: 'string',
            description: 'Source currency code (e.g., USD, EUR, CZK)',
          },
          to: {
            type: 'string',
            description: 'Target currency code (e.g., EUR, USD, GBP)',
          },
          amount: {
            type: 'string',
            description: 'Amount to convert (default: 1)',
          },
        },
        required: ['from', 'to'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_crypto',
      description: 'Get cryptocurrency price, market data, and DeFi trading pair info. Supports top coins by market cap, individual coin lookup, and DEX pair search.',
      parameters: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            description: 'Action to perform: "price" for a single coin, "top" for top coins by market cap, "dex" for DEX pair search',
            enum: ['price', 'top', 'dex'],
          },
          query: {
            type: 'string',
            description: 'Coin symbol (e.g., BTC, ETH) for "price", number of coins for "top" (default: 10), or search term for "dex"',
          },
        },
        required: ['action'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'geolocate_ip',
      description: 'Get geolocation data for an IP address: city, region, country, timezone, coordinates, ISP/org.',
      parameters: {
        type: 'object',
        properties: {
          ip: {
            type: 'string',
            description: 'IPv4 or IPv6 address to geolocate (e.g., 8.8.8.8)',
          },
        },
        required: ['ip'],
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
  {
    type: 'function',
    function: {
      name: 'github_create_pr',
      description: 'Create a GitHub Pull Request with file changes. Creates a branch, commits file changes (create/update/delete), and opens a PR. Authentication is handled automatically. Use for simple multi-file changes (up to ~10 files, 1MB total).',
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
          title: {
            type: 'string',
            description: 'Pull request title',
          },
          branch: {
            type: 'string',
            description: 'New branch name to create (will be prefixed with bot/ automatically)',
          },
          base: {
            type: 'string',
            description: 'Base branch (default: main)',
          },
          changes: {
            type: 'string',
            description: 'JSON array of file changes: [{"path":"file.ts","content":"...","action":"create|update|delete"}]',
          },
          body: {
            type: 'string',
            description: 'PR description in markdown (optional)',
          },
        },
        required: ['owner', 'repo', 'title', 'branch', 'changes'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'sandbox_exec',
      description: 'Execute shell commands in a sandbox container for complex code tasks. Use for multi-file refactors, build/test workflows, or tasks that need git CLI. The container has git, node, npm, and common dev tools. Commands run sequentially. Use github_create_pr for simple file changes instead.',
      parameters: {
        type: 'object',
        properties: {
          commands: {
            type: 'string',
            description: 'JSON array of shell commands to run sequentially, e.g. ["git clone https://github.com/owner/repo.git", "cd repo && npm install", "npm test"]',
          },
          timeout: {
            type: 'string',
            description: 'Timeout per command in seconds (default: 120, max: 300)',
          },
        },
        required: ['commands'],
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
      case 'convert_currency':
        result = await convertCurrency(args.from, args.to, args.amount);
        break;
      case 'get_crypto':
        result = await getCrypto(args.action as 'price' | 'top' | 'dex', args.query);
        break;
      case 'geolocate_ip':
        result = await geolocateIp(args.ip);
        break;
      case 'browse_url':
        result = await browseUrl(args.url, args.action as 'extract_text' | 'screenshot' | 'pdf' | undefined, args.wait_for, context?.browser);
        break;
      case 'github_create_pr':
        result = await githubCreatePr(
          args.owner,
          args.repo,
          args.title,
          args.branch,
          args.changes,
          args.base,
          args.body,
          githubToken
        );
        break;
      case 'sandbox_exec':
        result = await sandboxExec(args.commands, args.timeout, context?.sandbox, githubToken);
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
 * File change in a github_create_pr call
 */
interface FileChange {
  path: string;
  content?: string;
  action: 'create' | 'update' | 'delete';
}

/**
 * GitHub Git API response types
 */
interface GitRefResponse {
  object: { sha: string };
}

interface GitBlobResponse {
  sha: string;
}

interface GitTreeResponse {
  sha: string;
}

interface GitCommitResponse {
  sha: string;
}

interface GitCreateRefResponse {
  ref: string;
}

interface GitPullResponse {
  html_url: string;
  number: number;
}

/**
 * Create a GitHub PR with file changes using the Git Data API.
 *
 * Steps:
 * 1. GET base ref SHA
 * 2. Create blobs for each file change
 * 3. Create a tree with all changes
 * 4. Create a commit pointing to that tree
 * 5. Create a branch ref pointing to the commit
 * 6. Open a pull request
 */
async function githubCreatePr(
  owner: string,
  repo: string,
  title: string,
  branch: string,
  changesJson: string,
  base?: string,
  body?: string,
  token?: string
): Promise<string> {
  // --- Validation ---
  if (!token) {
    throw new Error('GitHub token is required for creating PRs. Configure GITHUB_TOKEN in the bot settings.');
  }

  // Validate owner/repo format
  if (!/^[a-zA-Z0-9_.-]+$/.test(owner) || !/^[a-zA-Z0-9_.-]+$/.test(repo)) {
    throw new Error(`Invalid owner/repo format: "${owner}/${repo}". Must contain only alphanumeric characters, dots, hyphens, and underscores.`);
  }

  // Validate branch name (no spaces, no .., no control chars)
  if (!/^[a-zA-Z0-9_/.@-]+$/.test(branch) || branch.includes('..')) {
    throw new Error(`Invalid branch name: "${branch}". Use alphanumeric characters, hyphens, underscores, and forward slashes only.`);
  }

  // Auto-prefix with bot/ to avoid conflicts
  const fullBranch = branch.startsWith('bot/') ? branch : `bot/${branch}`;
  const baseBranch = base || 'main';

  // Parse changes
  let changes: FileChange[];
  try {
    changes = JSON.parse(changesJson);
  } catch {
    throw new Error('Invalid changes JSON. Expected: [{"path":"file.ts","content":"...","action":"create|update|delete"}]');
  }

  if (!Array.isArray(changes) || changes.length === 0) {
    throw new Error('Changes must be a non-empty array of file changes.');
  }

  if (changes.length > 20) {
    throw new Error(`Too many file changes (${changes.length}). Maximum is 20 files per PR.`);
  }

  // Validate each change and check total content size
  let totalContentSize = 0;
  for (const change of changes) {
    if (!change.path || typeof change.path !== 'string') {
      throw new Error('Each change must have a "path" string.');
    }
    if (change.path.includes('..') || change.path.startsWith('/')) {
      throw new Error(`Invalid file path: "${change.path}". Paths must be relative and cannot contain "..".`);
    }
    if (!['create', 'update', 'delete'].includes(change.action)) {
      throw new Error(`Invalid action "${change.action}" for path "${change.path}". Must be "create", "update", or "delete".`);
    }
    if (change.action !== 'delete' && (change.content === undefined || change.content === null)) {
      throw new Error(`Missing content for ${change.action} action on "${change.path}".`);
    }
    if (change.content) {
      totalContentSize += change.content.length;
    }
  }

  if (totalContentSize > 1_000_000) {
    throw new Error(`Total content size (${(totalContentSize / 1024).toFixed(0)}KB) exceeds 1MB limit.`);
  }

  const headers: Record<string, string> = {
    'User-Agent': 'MoltworkerBot/1.0',
    'Accept': 'application/vnd.github.v3+json',
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const apiBase = `https://api.github.com/repos/${owner}/${repo}`;

  // --- Step 1: Get base branch SHA ---
  const refResponse = await fetch(`${apiBase}/git/ref/heads/${baseBranch}`, { headers });
  if (!refResponse.ok) {
    const err = await refResponse.text();
    throw new Error(`Failed to get base branch "${baseBranch}": ${refResponse.status} ${err}`);
  }
  const refData = await refResponse.json() as GitRefResponse;
  const baseSha = refData.object.sha;

  // --- Step 2: Create blobs for each file ---
  const treeItems: Array<{
    path: string;
    mode: string;
    type: string;
    sha: string | null;
  }> = [];

  for (const change of changes) {
    if (change.action === 'delete') {
      // For deletions, set sha to null with mode 100644
      treeItems.push({
        path: change.path,
        mode: '100644',
        type: 'blob',
        sha: null,
      });
    } else {
      // Create blob for create/update
      const blobResponse = await fetch(`${apiBase}/git/blobs`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          content: change.content,
          encoding: 'utf-8',
        }),
      });

      if (!blobResponse.ok) {
        const err = await blobResponse.text();
        throw new Error(`Failed to create blob for "${change.path}": ${blobResponse.status} ${err}`);
      }

      const blobData = await blobResponse.json() as GitBlobResponse;
      treeItems.push({
        path: change.path,
        mode: '100644',
        type: 'blob',
        sha: blobData.sha,
      });
    }
  }

  // --- Step 3: Create tree ---
  const treeResponse = await fetch(`${apiBase}/git/trees`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      base_tree: baseSha,
      tree: treeItems,
    }),
  });

  if (!treeResponse.ok) {
    const err = await treeResponse.text();
    throw new Error(`Failed to create tree: ${treeResponse.status} ${err}`);
  }

  const treeData = await treeResponse.json() as GitTreeResponse;

  // --- Step 4: Create commit ---
  const commitResponse = await fetch(`${apiBase}/git/commits`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      message: title,
      tree: treeData.sha,
      parents: [baseSha],
    }),
  });

  if (!commitResponse.ok) {
    const err = await commitResponse.text();
    throw new Error(`Failed to create commit: ${commitResponse.status} ${err}`);
  }

  const commitData = await commitResponse.json() as GitCommitResponse;

  // --- Step 5: Create branch ref ---
  const createRefResponse = await fetch(`${apiBase}/git/refs`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      ref: `refs/heads/${fullBranch}`,
      sha: commitData.sha,
    }),
  });

  if (!createRefResponse.ok) {
    const err = await createRefResponse.text();
    throw new Error(`Failed to create branch "${fullBranch}": ${createRefResponse.status} ${err}`);
  }

  // --- Step 6: Create pull request ---
  const prResponse = await fetch(`${apiBase}/pulls`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      title,
      head: fullBranch,
      base: baseBranch,
      body: body || `Automated PR created by Moltworker bot.\n\nChanges:\n${changes.map(c => `- ${c.action}: ${c.path}`).join('\n')}`,
    }),
  });

  if (!prResponse.ok) {
    const err = await prResponse.text();
    throw new Error(`Failed to create PR: ${prResponse.status} ${err}`);
  }

  const prData = await prResponse.json() as GitPullResponse;

  // Build summary
  const summary = [
    `✅ Pull Request created successfully!`,
    ``,
    `PR: ${prData.html_url}`,
    `Branch: ${fullBranch} → ${baseBranch}`,
    `Changes: ${changes.length} file(s)`,
    ...changes.map(c => `  - ${c.action}: ${c.path}`),
  ];

  return summary.join('\n');
}

/**
 * Execute shell commands in a sandbox container.
 *
 * Runs commands sequentially, collecting stdout/stderr from each.
 * The container has git, node, npm, and common dev tools.
 * GitHub token is injected as GH_TOKEN env var for git/gh CLI authentication.
 */
async function sandboxExec(
  commandsJson: string,
  timeoutStr?: string,
  sandbox?: SandboxLike,
  githubToken?: string
): Promise<string> {
  if (!sandbox) {
    throw new Error('Sandbox container is not available. This tool requires a sandbox-enabled environment. Use github_create_pr for simple file changes instead.');
  }

  // Parse commands
  let commands: string[];
  try {
    commands = JSON.parse(commandsJson);
  } catch {
    throw new Error('Invalid commands JSON. Expected: ["cmd1", "cmd2", ...]');
  }

  if (!Array.isArray(commands) || commands.length === 0) {
    throw new Error('Commands must be a non-empty array of shell command strings.');
  }

  if (commands.length > 20) {
    throw new Error(`Too many commands (${commands.length}). Maximum is 20 per call.`);
  }

  // Validate commands — block dangerous patterns
  for (const cmd of commands) {
    if (typeof cmd !== 'string' || cmd.trim().length === 0) {
      throw new Error('Each command must be a non-empty string.');
    }
    // Block commands that could escape the sandbox or cause damage
    const blocked = ['rm -rf /', 'mkfs', 'dd if=', ':(){', 'fork bomb'];
    for (const pattern of blocked) {
      if (cmd.includes(pattern)) {
        throw new Error(`Blocked command pattern: "${pattern}"`);
      }
    }
  }

  const timeoutSec = Math.min(Math.max(parseInt(timeoutStr || '120', 10), 5), 300);

  // Build env vars — inject GitHub token for git/gh CLI
  const env: Record<string, string> = {};
  if (githubToken) {
    env['GH_TOKEN'] = githubToken;
    env['GITHUB_TOKEN'] = githubToken;
  }

  const results: string[] = [];
  results.push(`🖥️ Sandbox Execution (${commands.length} command(s), ${timeoutSec}s timeout each)\n`);

  for (let i = 0; i < commands.length; i++) {
    const cmd = commands[i];
    results.push(`--- Command ${i + 1}/${commands.length}: ${cmd} ---`);

    try {
      // Wrap command in bash with timeout
      const wrappedCmd = `timeout ${timeoutSec} bash -c ${JSON.stringify(cmd)}`;
      const process = await sandbox.startProcess(wrappedCmd, {
        env: Object.keys(env).length > 0 ? env : undefined,
      });

      // Wait for the process to finish (poll getLogs until we get output or timeout)
      const startTime = Date.now();
      const maxWaitMs = (timeoutSec + 10) * 1000; // Extra 10s buffer
      let logs: { stdout?: string; stderr?: string } = {};

      while (Date.now() - startTime < maxWaitMs) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        logs = await process.getLogs();

        // Check if process is done by checking if status changed
        // The process.getLogs() returns accumulated output
        if (process.status === 'completed' || process.status === 'failed') {
          break;
        }
      }

      // Collect final logs
      logs = await process.getLogs();

      if (logs.stdout) {
        const stdout = logs.stdout.length > 10000
          ? logs.stdout.slice(0, 10000) + '\n[stdout truncated]'
          : logs.stdout;
        results.push(`stdout:\n${stdout}`);
      }
      if (logs.stderr) {
        const stderr = logs.stderr.length > 5000
          ? logs.stderr.slice(0, 5000) + '\n[stderr truncated]'
          : logs.stderr;
        results.push(`stderr:\n${stderr}`);
      }
      if (!logs.stdout && !logs.stderr) {
        results.push('(no output)');
      }

      results.push('');
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      results.push(`Error: ${errMsg}\n`);

      // Stop on first error (fail-fast)
      results.push(`⚠️ Stopped at command ${i + 1} due to error.`);
      break;
    }
  }

  const output = results.join('\n');

  // Truncate if too long
  if (output.length > 50000) {
    return output.slice(0, 50000) + '\n\n[Output truncated - exceeded 50KB]';
  }

  return output;
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
 * Exchange rate cache (30-minute TTL)
 */
interface ExchangeRateCache {
  rates: Record<string, number>;
  timestamp: number;
}

const EXCHANGE_RATE_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const exchangeRateCache: Map<string, ExchangeRateCache> = new Map();

/**
 * Clear exchange rate cache (for testing)
 */
export function clearExchangeRateCache(): void {
  exchangeRateCache.clear();
}

/**
 * Convert between currencies using ExchangeRate-API
 */
async function convertCurrency(from: string, to: string, amountStr?: string): Promise<string> {
  const fromCode = from.toUpperCase().trim();
  const toCode = to.toUpperCase().trim();

  // Validate currency codes (3 uppercase letters)
  if (!/^[A-Z]{3}$/.test(fromCode)) {
    throw new Error(`Invalid source currency code: "${from}". Must be 3 letters (e.g., USD, EUR).`);
  }
  if (!/^[A-Z]{3}$/.test(toCode)) {
    throw new Error(`Invalid target currency code: "${to}". Must be 3 letters (e.g., USD, EUR).`);
  }

  const amount = amountStr ? parseFloat(amountStr) : 1;
  if (isNaN(amount) || amount <= 0) {
    throw new Error(`Invalid amount: "${amountStr}". Must be a positive number.`);
  }

  // Check cache
  const cached = exchangeRateCache.get(fromCode);
  let rates: Record<string, number>;

  if (cached && (Date.now() - cached.timestamp) < EXCHANGE_RATE_CACHE_TTL_MS) {
    rates = cached.rates;
  } else {
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCode}`, {
      headers: { 'User-Agent': 'MoltworkerBot/1.0' },
    });

    if (!response.ok) {
      throw new Error(`ExchangeRate API error: HTTP ${response.status}`);
    }

    const data = await response.json() as { rates: Record<string, number> };
    rates = data.rates;

    // Update cache
    exchangeRateCache.set(fromCode, { rates, timestamp: Date.now() });
  }

  const rate = rates[toCode];
  if (rate === undefined) {
    throw new Error(`Currency "${toCode}" not found. The API may not support this currency code.`);
  }

  const converted = amount * rate;
  return `${amount} ${fromCode} = ${converted.toFixed(2)} ${toCode} (rate: ${rate})`;
}

/**
 * Crypto price cache (5-minute TTL)
 */
interface CryptoCache {
  data: string;
  timestamp: number;
}

const CRYPTO_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const cryptoCache: Map<string, CryptoCache> = new Map();

/**
 * Clear crypto cache (for testing)
 */
export function clearCryptoCache(): void {
  cryptoCache.clear();
}

/**
 * Format large numbers with K/M/B suffixes
 */
function formatLargeNumber(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

/**
 * Format price with appropriate decimal places
 */
function formatPrice(price: number): string {
  if (price >= 1) return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (price >= 0.01) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(8)}`;
}

/**
 * Get cryptocurrency data
 */
async function getCrypto(action: 'price' | 'top' | 'dex', query?: string): Promise<string> {
  const cacheKey = `${action}:${query || ''}`;
  const cached = cryptoCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CRYPTO_CACHE_TTL_MS) {
    return cached.data;
  }

  let result: string;

  switch (action) {
    case 'price':
      result = await getCryptoPrice(query || 'BTC');
      break;
    case 'top':
      result = await getCryptoTop(parseInt(query || '10', 10));
      break;
    case 'dex':
      result = await getCryptoDex(query || 'ETH');
      break;
    default:
      throw new Error(`Unknown crypto action: ${action}. Use "price", "top", or "dex".`);
  }

  cryptoCache.set(cacheKey, { data: result, timestamp: Date.now() });
  return result;
}

/**
 * Get price for a single coin via CoinCap + CoinPaprika
 */
async function getCryptoPrice(symbol: string): Promise<string> {
  const sym = symbol.toUpperCase().trim().replace(/^\$/, ''); // Strip leading $ if present

  // Search both APIs with multiple results to handle symbol ambiguity (e.g., JUP matches multiple tokens)
  const [coincapResult, paprikaResult] = await Promise.allSettled([
    fetch(`https://api.coincap.io/v2/assets?search=${encodeURIComponent(sym)}&limit=5`, {
      headers: { 'User-Agent': 'MoltworkerBot/1.0' },
    }),
    fetch(`https://api.coinpaprika.com/v1/search?q=${encodeURIComponent(sym)}&limit=5`, {
      headers: { 'User-Agent': 'MoltworkerBot/1.0' },
    }),
  ]);

  const lines: string[] = [];

  // CoinCap data — pick highest market cap match for the symbol
  if (coincapResult.status === 'fulfilled' && coincapResult.value.ok) {
    const data = await coincapResult.value.json() as { data: Array<{ id: string; rank: string; symbol: string; name: string; priceUsd: string; changePercent24Hr: string; marketCapUsd: string; volumeUsd24Hr: string; supply: string; maxSupply: string | null }> };
    // Filter to exact symbol matches and pick highest market cap
    const matches = (data.data || []).filter(c => c.symbol.toUpperCase() === sym);
    const coin = matches.sort((a, b) => parseFloat(b.marketCapUsd || '0') - parseFloat(a.marketCapUsd || '0'))[0];
    if (coin) {
      const price = parseFloat(coin.priceUsd);
      const change = parseFloat(coin.changePercent24Hr);
      const mcap = parseFloat(coin.marketCapUsd);
      const vol = parseFloat(coin.volumeUsd24Hr);
      const changeIcon = change >= 0 ? '+' : '';

      lines.push(`${coin.name} (${coin.symbol}) — Rank #${coin.rank}`);
      lines.push(`Price: ${formatPrice(price)} (${changeIcon}${change.toFixed(2)}% 24h)`);
      lines.push(`Market Cap: ${formatLargeNumber(mcap)}`);
      lines.push(`24h Volume: ${formatLargeNumber(vol)}`);
      lines.push(`Supply: ${parseFloat(coin.supply).toLocaleString('en-US', { maximumFractionDigits: 0 })}${coin.maxSupply ? ` / ${parseFloat(coin.maxSupply).toLocaleString('en-US', { maximumFractionDigits: 0 })}` : ''}`);
    }
  }

  // CoinPaprika detailed data — pick highest-ranked match for the symbol
  if (paprikaResult.status === 'fulfilled' && paprikaResult.value.ok) {
    const searchData = await paprikaResult.value.json() as { currencies?: Array<{ id: string; name: string; symbol: string; rank: number }> };
    // Filter to exact symbol matches and pick highest ranked (lowest rank number)
    const matches = (searchData.currencies || []).filter(c => c.symbol.toUpperCase() === sym);
    const bestMatch = matches.sort((a, b) => (a.rank || 9999) - (b.rank || 9999))[0];
    const coinId = bestMatch?.id;
    if (coinId) {
      try {
        const tickerRes = await fetch(`https://api.coinpaprika.com/v1/tickers/${coinId}`, {
          headers: { 'User-Agent': 'MoltworkerBot/1.0' },
        });
        if (tickerRes.ok) {
          const ticker = await tickerRes.json() as {
            quotes: { USD: { price: number; percent_change_1h: number; percent_change_7d: number; percent_change_30d: number; ath_price: number; ath_date: string; percent_from_price_ath: number } };
          };
          const q = ticker.quotes?.USD;
          if (q) {
            // If CoinCap didn't have data, use CoinPaprika price as primary
            if (lines.length === 0 && q.price) {
              lines.push(`${bestMatch.name} (${bestMatch.symbol.toUpperCase()})`);
              lines.push(`Price: ${formatPrice(q.price)}`);
            }
            lines.push('');
            lines.push(`Changes: 1h ${q.percent_change_1h >= 0 ? '+' : ''}${q.percent_change_1h?.toFixed(2)}% | 7d ${q.percent_change_7d >= 0 ? '+' : ''}${q.percent_change_7d?.toFixed(2)}% | 30d ${q.percent_change_30d >= 0 ? '+' : ''}${q.percent_change_30d?.toFixed(2)}%`);
            if (q.ath_price) {
              lines.push(`ATH: ${formatPrice(q.ath_price)} (${q.ath_date?.split('T')[0]}) — ${q.percent_from_price_ath?.toFixed(1)}% from ATH`);
            }
          }
        }
      } catch {
        // CoinPaprika detail failed, use CoinCap data only
      }
    }
  }

  if (lines.length === 0) {
    throw new Error(`No data found for "${sym}". Try a common symbol like BTC, ETH, SOL, etc.`);
  }

  return lines.join('\n');
}

/**
 * Get top coins by market cap via CoinCap
 */
async function getCryptoTop(limit: number): Promise<string> {
  const count = Math.min(Math.max(1, limit), 25);
  const response = await fetch(`https://api.coincap.io/v2/assets?limit=${count}`, {
    headers: { 'User-Agent': 'MoltworkerBot/1.0' },
  });

  if (!response.ok) {
    throw new Error(`CoinCap API error: HTTP ${response.status}`);
  }

  const data = await response.json() as { data: Array<{ rank: string; symbol: string; name: string; priceUsd: string; changePercent24Hr: string; marketCapUsd: string }> };
  if (!data.data?.length) {
    throw new Error('No data returned from CoinCap API.');
  }

  const lines = data.data.map(coin => {
    const price = parseFloat(coin.priceUsd);
    const change = parseFloat(coin.changePercent24Hr);
    const mcap = parseFloat(coin.marketCapUsd);
    const changeIcon = change >= 0 ? '+' : '';
    return `#${coin.rank} ${coin.symbol} (${coin.name}): ${formatPrice(price)} ${changeIcon}${change.toFixed(2)}% | MCap ${formatLargeNumber(mcap)}`;
  });

  return `Top ${count} Cryptocurrencies:\n\n${lines.join('\n')}`;
}

/**
 * Search DEX pairs via DEX Screener
 */
async function getCryptoDex(query: string): Promise<string> {
  const response = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(query)}`, {
    headers: { 'User-Agent': 'MoltworkerBot/1.0' },
  });

  if (!response.ok) {
    throw new Error(`DEX Screener API error: HTTP ${response.status}`);
  }

  const data = await response.json() as {
    pairs?: Array<{
      chainId: string; dexId: string; baseToken: { symbol: string; name: string };
      quoteToken: { symbol: string }; priceUsd: string;
      volume: { h24?: number }; priceChange: { h24?: number };
      liquidity: { usd?: number }; url: string;
    }>;
  };

  if (!data.pairs?.length) {
    return `No DEX pairs found for "${query}".`;
  }

  // Show top 5 pairs by liquidity
  const sorted = data.pairs
    .filter(p => p.liquidity?.usd && p.liquidity.usd > 0)
    .sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))
    .slice(0, 5);

  if (sorted.length === 0) {
    return `No liquid DEX pairs found for "${query}".`;
  }

  const lines = sorted.map((p, i) => {
    const price = parseFloat(p.priceUsd || '0');
    const vol = p.volume?.h24 || 0;
    const change = p.priceChange?.h24 || 0;
    const liq = p.liquidity?.usd || 0;
    const changeIcon = change >= 0 ? '+' : '';
    return `${i + 1}. ${p.baseToken.symbol}/${p.quoteToken.symbol} on ${p.dexId} (${p.chainId})\n   Price: ${formatPrice(price)} ${changeIcon}${change.toFixed(2)}% 24h | Vol: ${formatLargeNumber(vol)} | Liq: ${formatLargeNumber(liq)}`;
  });

  return `DEX Pairs for "${query}":\n\n${lines.join('\n\n')}`;
}

/**
 * Geolocation cache (15-minute TTL)
 */
const GEO_CACHE_TTL_MS = 15 * 60 * 1000;
const geoCache: Map<string, CryptoCache> = new Map(); // reuse CryptoCache shape

/**
 * Clear geolocation cache (for testing)
 */
export function clearGeoCache(): void {
  geoCache.clear();
}

/**
 * Geolocate an IP address using ipapi.co
 */
async function geolocateIp(ip: string): Promise<string> {
  const trimmed = ip.trim();

  // Basic IP validation (IPv4 or IPv6)
  if (!/^[\d.:a-fA-F]+$/.test(trimmed)) {
    throw new Error(`Invalid IP address: "${ip}". Provide a valid IPv4 or IPv6 address.`);
  }

  const cached = geoCache.get(trimmed);
  if (cached && Date.now() - cached.timestamp < GEO_CACHE_TTL_MS) {
    return cached.data;
  }

  const response = await fetch(`https://ipapi.co/${encodeURIComponent(trimmed)}/json/`, {
    headers: { 'User-Agent': 'MoltworkerBot/1.0' },
  });

  if (!response.ok) {
    throw new Error(`ipapi.co error: HTTP ${response.status}`);
  }

  const data = await response.json() as {
    ip: string; city: string; region: string; region_code: string;
    country_name: string; country_code: string; postal: string;
    latitude: number; longitude: number; timezone: string; utc_offset: string;
    asn: string; org: string; error?: boolean; reason?: string;
  };

  if (data.error) {
    throw new Error(`Geolocation failed: ${data.reason || 'Unknown error'}`);
  }

  const lines = [
    `IP: ${data.ip}`,
    `Location: ${data.city}, ${data.region} (${data.region_code}), ${data.country_name} (${data.country_code})`,
    `Postal: ${data.postal || 'N/A'}`,
    `Coordinates: ${data.latitude}, ${data.longitude}`,
    `Timezone: ${data.timezone} (UTC${data.utc_offset})`,
    `ISP: ${data.org || 'N/A'} (${data.asn || 'N/A'})`,
  ];

  const result = lines.join('\n');
  geoCache.set(trimmed, { data: result, timestamp: Date.now() });
  return result;
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

  // Fetch weather and reverse geocode in parallel
  const [weatherRes, geoRes] = await Promise.allSettled([
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&forecast_days=3`, {
      headers: { 'User-Agent': 'MoltworkerBot/1.0' },
    }),
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10&accept-language=en`, {
      headers: { 'User-Agent': 'MoltworkerBot/1.0' },
    }),
  ]);

  if (weatherRes.status !== 'fulfilled' || !weatherRes.value.ok) {
    throw new Error(`Weather API HTTP ${weatherRes.status === 'fulfilled' ? weatherRes.value.status : 'failed'}`);
  }

  const data = await weatherRes.value.json() as OpenMeteoResponse;
  const current = data.current_weather;
  const weatherDesc = WMO_WEATHER_CODES[current.weathercode] || 'Unknown';

  // Extract location name from reverse geocoding
  let locationName = '';
  if (geoRes.status === 'fulfilled' && geoRes.value.ok) {
    try {
      const geo = await geoRes.value.json() as { address?: { city?: string; town?: string; village?: string; state?: string; country?: string } };
      const city = geo.address?.city || geo.address?.town || geo.address?.village || '';
      const country = geo.address?.country || '';
      if (city && country) {
        locationName = ` (${city}, ${country})`;
      } else if (city || country) {
        locationName = ` (${city || country})`;
      }
    } catch {
      // Geocoding failed, proceed without location name
    }
  }

  let output = `${weatherDesc}, ${current.temperature}\u00B0C, wind ${current.windspeed} km/h${locationName}\n`;
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
    .map((item, i) => `${i + 1}. ${item.title} (${item.score || 0}\u2B06)\n   ${item.url || `https://news.ycombinator.com/item?id=${item.id}`}`)
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
    .map((child, i) => `${i + 1}. ${child.data.title} (${child.data.score}\u2B06, ${child.data.num_comments} comments)\n   https://reddit.com${child.data.permalink}`)
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
    const paperUrl = entry.match(/<id>([\s\S]*?)<\/id>/)?.[1]?.trim() || '';
    entries.push(`${entries.length + 1}. ${title}${paperUrl ? `\n   ${paperUrl}` : ''}`);
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
 * Tools available without browser/sandbox bindings (for Durable Objects)
 */
export const TOOLS_WITHOUT_BROWSER: ToolDefinition[] = AVAILABLE_TOOLS.filter(
  tool => tool.function.name !== 'browse_url' && tool.function.name !== 'sandbox_exec'
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
