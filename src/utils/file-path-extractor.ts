/**
 * File Path Extractor (Phase 7B.3)
 * Extracts file paths from user messages for pre-fetching.
 * Also extracts GitHub repo context from conversation messages.
 */

import type { ChatMessage } from '../openrouter/client';

/** Known code/config file extensions for standalone filename matching. */
const CODE_EXTENSIONS = new Set([
  'ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs',
  'py', 'pyi', 'rs', 'go', 'java', 'kt', 'rb', 'php',
  'sh', 'bash', 'zsh',
  'css', 'scss', 'less', 'sass',
  'html', 'htm', 'xml', 'svg',
  'yaml', 'yml', 'toml', 'json', 'jsonc',
  'md', 'mdx', 'txt', 'rst',
  'sql', 'prisma', 'graphql', 'gql', 'proto',
  'tf', 'hcl',
  'vue', 'svelte', 'astro',
  'env', 'gitignore', 'dockerignore',
  'dockerfile',
  'c', 'cpp', 'h', 'hpp',
  'cs', 'fs', 'swift', 'dart', 'lua', 'r',
]);

/**
 * Match file paths with at least one directory separator.
 * E.g.: src/foo/bar.ts, ./auth.ts, path/to/file.py:42
 * Negative lookbehind prevents matching URLs (://), emails (@), npm scoped packages.
 */
const DIR_PATH_PATTERN = /(?<![:/\w@])(?:\.\/)?(?:[\w.-]+\/)+[\w][\w.-]*\.\w{1,10}(?::(\d+))?/g;

/**
 * Match standalone filenames with known code extensions.
 * E.g.: auth.ts, handler.ts:42, package.json
 * Must be preceded by whitespace, backtick, quote, or start-of-string.
 */
const STANDALONE_FILE_PATTERN = /(?<=[\s`'"(]|^)([\w][\w.-]*\.\w{1,10})(?::(\d+))?(?=[\s`'")\],:;!?.]|$)/g;

/**
 * Match owner/repo patterns in text.
 * E.g.: PetrAnto/moltworker, facebook/react
 */
const REPO_PATTERN = /\b([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)\b/g;

/**
 * Extract file paths from a user message.
 * Returns deduplicated paths, stripped of line numbers.
 *
 * @param message - User's message text
 * @returns Array of file path strings (e.g. ["src/auth.ts", "handler.ts"])
 */
export function extractFilePaths(message: string): string[] {
  const paths = new Set<string>();

  // 1. Match paths with directory separators
  for (const match of message.matchAll(DIR_PATH_PATTERN)) {
    const path = cleanPath(match[0]);
    if (path && !isExcluded(path)) {
      paths.add(path);
    }
  }

  // 2. Match standalone filenames with known extensions
  for (const match of message.matchAll(STANDALONE_FILE_PATTERN)) {
    const path = cleanPath(match[0]);
    if (path && !isExcluded(path) && hasCodeExtension(path)) {
      paths.add(path);
    }
  }

  return [...paths];
}

/**
 * Extract GitHub owner/repo context from conversation messages.
 * Searches system prompt and user messages for owner/repo patterns.
 *
 * @param messages - Conversation messages
 * @returns { owner, repo } or null if no repo context found
 */
export function extractGitHubContext(
  messages: ChatMessage[]
): { owner: string; repo: string } | null {
  // Priority 1: System prompt often contains explicit repo context
  for (const msg of messages) {
    if (msg.role !== 'system' && msg.role !== 'user') continue;
    const content = typeof msg.content === 'string' ? msg.content : '';

    // Look for explicit repo patterns: "Repository: owner/repo", "repo: owner/repo"
    const explicitMatch = content.match(
      /(?:repository|repo|project|codebase)\s*[:=]\s*([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)/i
    );
    if (explicitMatch) {
      const [owner, repo] = explicitMatch[1].split('/');
      return { owner, repo };
    }

    // Look for GitHub URL patterns
    const urlMatch = content.match(
      /github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)/
    );
    if (urlMatch) {
      return { owner: urlMatch[1], repo: urlMatch[2] };
    }
  }

  // Priority 2: User message might mention a repo
  const lastUser = [...messages].reverse().find(m => m.role === 'user');
  if (lastUser) {
    const content = typeof lastUser.content === 'string' ? lastUser.content : '';
    // Look for "in owner/repo" or "from owner/repo" or just owner/repo
    const repoMatch = content.match(
      /(?:in|from|on|at|of)\s+([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)/i
    );
    if (repoMatch) {
      const [owner, repo] = repoMatch[1].split('/');
      if (owner && repo && !isExcludedRepo(`${owner}/${repo}`)) {
        return { owner, repo };
      }
    }
  }

  return null;
}

/** Strip line numbers and leading ./ from a path. */
function cleanPath(raw: string): string {
  return raw
    .replace(/:\d+$/, '')    // Remove :lineNumber
    .replace(/^\.\//, '');   // Remove leading ./
}

/** Check if a filename has a known code extension. */
function hasCodeExtension(path: string): boolean {
  const ext = path.split('.').pop()?.toLowerCase();
  return ext ? CODE_EXTENSIONS.has(ext) : false;
}

/** Exclusion rules for false positive paths. */
function isExcluded(path: string): boolean {
  // Skip image/media files
  const ext = path.split('.').pop()?.toLowerCase() || '';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'ico', 'mp3', 'mp4', 'wav', 'avi', 'mov', 'pdf', 'zip', 'tar', 'gz', 'woff', 'woff2', 'ttf', 'eot'].includes(ext)) {
    return true;
  }
  // Skip version-like patterns (e.g., node/v16.0.0)
  if (/\/v\d+\.\d+/.test(path)) return true;
  // Skip npm scope paths (e.g., @types/node)
  if (path.startsWith('@')) return true;
  return false;
}

/** Exclusion rules for false positive repos. */
function isExcludedRepo(repo: string): boolean {
  // Common false positives: paths that look like owner/repo but aren't
  const lower = repo.toLowerCase();
  if (lower.includes('/') && lower.split('/').some(p => p.length < 2)) return true;
  return false;
}
