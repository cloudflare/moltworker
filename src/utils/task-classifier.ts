/**
 * Task Complexity Classifier (Phase 7A.2)
 * Classifies user messages as 'simple' or 'complex' to gate expensive
 * R2 reads (learnings, session history) for trivial queries.
 */

export type TaskComplexity = 'simple' | 'complex';

// Keywords that indicate a complex/code-related query
const COMPLEX_KEYWORDS = [
  'file', 'function', 'class', 'bug', 'fix', 'refactor', 'implement',
  'build', 'deploy', 'test', 'debug', 'error', 'compile', 'merge',
  'commit', 'branch', 'pull request', 'review', 'analyze', 'explain',
  'code', 'script', 'config', 'database', 'migration', 'api',
  'endpoint', 'server', 'dockerfile', 'pipeline', 'terraform',
  'module', 'package', 'dependency', 'import', 'export',
  'roadmap', 'orchestra', 'task', 'previous', 'last time',
  'continue', 'earlier', 'remember', 'we discussed',
];

// Regex patterns that indicate complexity
const COMPLEX_PATTERNS = [
  /\S+\.\w{1,5}(?::\d+)?/,    // File paths like foo.ts, bar.py:42
  /https?:\/\/\S+/,             // URLs
  /```[\s\S]*```/,              // Code blocks
  /\n.*\n/,                      // Multi-line messages (3+ lines)
  /[/\\]\w+[/\\]\w+/,           // Path separators like /src/utils
];

/**
 * Classify a user message as simple or complex.
 *
 * @param message - The user's message text
 * @param conversationLength - Number of messages in conversation history
 * @returns 'simple' if the query is trivial, 'complex' if it needs full context
 */
export function classifyTaskComplexity(
  message: string,
  conversationLength: number,
): TaskComplexity {
  // Long conversations suggest ongoing context — always complex
  if (conversationLength >= 3) return 'complex';

  // Long messages are likely complex
  if (message.length > 100) return 'complex';

  const messageLower = message.toLowerCase();

  // Check for complex keywords
  for (const keyword of COMPLEX_KEYWORDS) {
    if (messageLower.includes(keyword)) return 'complex';
  }

  // Check for complex patterns (file paths, URLs, code blocks, multi-line)
  for (const pattern of COMPLEX_PATTERNS) {
    if (pattern.test(message)) return 'complex';
  }

  // Default: simple query (weather, time, greetings, crypto prices, etc.)
  return 'simple';
}
