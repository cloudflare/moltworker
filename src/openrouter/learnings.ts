/**
 * Compound Learning Loop
 * Extracts structured metadata from completed DO tasks and stores in R2.
 * Before new tasks, injects relevant past patterns into system prompts
 * to improve future tool selection and task execution.
 */

// Task categories based on tools used
export type TaskCategory =
  | 'web_search'   // fetch_url, browse_url, url_metadata
  | 'github'       // github_read_file, github_list_files, github_api, github_create_pr
  | 'data_lookup'  // get_weather, get_crypto, convert_currency, fetch_news, geolocate_ip
  | 'chart_gen'    // generate_chart
  | 'code_exec'    // sandbox_exec
  | 'multi_tool'   // 3+ different tool categories
  | 'simple_chat'; // No tools used

// Structured metadata extracted from a completed task
export interface TaskLearning {
  taskId: string;
  timestamp: number;
  modelAlias: string;
  category: TaskCategory;
  toolsUsed: string[];
  uniqueTools: string[];
  iterations: number;
  durationMs: number;
  success: boolean;
  taskSummary: string; // First 200 chars of user message
}

// Per-user learning history stored in R2
export interface LearningHistory {
  userId: string;
  learnings: TaskLearning[];
  updatedAt: number;
}

// Brief summary of last completed task (for cross-task context)
export interface LastTaskSummary {
  taskSummary: string;     // First 200 chars of user message
  category: TaskCategory;
  toolsUsed: string[];
  success: boolean;
  modelAlias: string;
  completedAt: number;
}

// Max learnings to keep per user
const MAX_LEARNINGS = 50;
// Max learnings to inject into prompt
const MAX_PROMPT_LEARNINGS = 5;

// Tool-to-category mapping
const TOOL_CATEGORIES: Record<string, string> = {
  fetch_url: 'web_search',
  browse_url: 'web_search',
  url_metadata: 'web_search',
  github_read_file: 'github',
  github_list_files: 'github',
  github_api: 'github',
  github_create_pr: 'github',
  get_weather: 'data_lookup',
  get_crypto: 'data_lookup',
  convert_currency: 'data_lookup',
  fetch_news: 'data_lookup',
  geolocate_ip: 'data_lookup',
  generate_chart: 'chart_gen',
  sandbox_exec: 'code_exec',
};

// Keywords that hint at likely task categories
const CATEGORY_HINTS: Record<string, string[]> = {
  web_search: ['url', 'website', 'page', 'link', 'browse', 'fetch', 'scrape', 'site'],
  github: ['github', 'repo', 'repository', 'commit', 'pr', 'pull request', 'branch', 'issue'],
  data_lookup: ['weather', 'crypto', 'bitcoin', 'currency', 'exchange', 'news', 'ip', 'location', 'forecast', 'price'],
  chart_gen: ['chart', 'graph', 'plot', 'visualize', 'diagram', 'bar chart', 'pie chart'],
  code_exec: ['run', 'execute', 'script', 'command', 'shell', 'sandbox', 'compile'],
};

/**
 * Categorize a task based on tools used
 */
export function categorizeTask(toolsUsed: string[]): TaskCategory {
  if (toolsUsed.length === 0) return 'simple_chat';

  const uniqueTools = [...new Set(toolsUsed)];
  const categories = new Set(
    uniqueTools.map(t => TOOL_CATEGORIES[t]).filter(Boolean)
  );

  if (categories.size === 0) return 'simple_chat';
  if (categories.size >= 3) return 'multi_tool';
  if (categories.size === 1) return [...categories][0] as TaskCategory;

  // 2 categories — return the most frequent one
  const catCounts: Record<string, number> = {};
  for (const tool of toolsUsed) {
    const cat = TOOL_CATEGORIES[tool];
    if (cat) catCounts[cat] = (catCounts[cat] || 0) + 1;
  }

  const sorted = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);
  return sorted[0][0] as TaskCategory;
}

/**
 * Extract structured learning metadata from a completed task
 */
export function extractLearning(params: {
  taskId: string;
  modelAlias: string;
  toolsUsed: string[];
  iterations: number;
  durationMs: number;
  success: boolean;
  userMessage: string;
}): TaskLearning {
  const uniqueTools = [...new Set(params.toolsUsed)];

  return {
    taskId: params.taskId,
    timestamp: Date.now(),
    modelAlias: params.modelAlias,
    category: categorizeTask(params.toolsUsed),
    toolsUsed: params.toolsUsed,
    uniqueTools,
    iterations: params.iterations,
    durationMs: params.durationMs,
    success: params.success,
    taskSummary: params.userMessage.substring(0, 200),
  };
}

/**
 * Store a learning to R2
 */
export async function storeLearning(
  r2: R2Bucket,
  userId: string,
  learning: TaskLearning
): Promise<void> {
  const key = `learnings/${userId}/history.json`;

  let history: LearningHistory;
  try {
    const obj = await r2.get(key);
    if (obj) {
      history = await obj.json() as LearningHistory;
    } else {
      history = { userId, learnings: [], updatedAt: Date.now() };
    }
  } catch {
    history = { userId, learnings: [], updatedAt: Date.now() };
  }

  history.learnings.push(learning);

  // Keep only the most recent learnings
  if (history.learnings.length > MAX_LEARNINGS) {
    history.learnings = history.learnings.slice(-MAX_LEARNINGS);
  }

  history.updatedAt = Date.now();
  await r2.put(key, JSON.stringify(history));
}

/**
 * Load learning history from R2
 */
export async function loadLearnings(
  r2: R2Bucket,
  userId: string
): Promise<LearningHistory | null> {
  const key = `learnings/${userId}/history.json`;
  try {
    const obj = await r2.get(key);
    if (!obj) return null;
    return await obj.json() as LearningHistory;
  } catch {
    return null;
  }
}

/**
 * Find relevant past learnings for a new task.
 * Scores each past learning by keyword overlap, category prediction, recency, and success.
 */
export function getRelevantLearnings(
  history: LearningHistory,
  userMessage: string,
  limit: number = MAX_PROMPT_LEARNINGS
): TaskLearning[] {
  if (!history || history.learnings.length === 0) return [];

  const messageLower = userMessage.toLowerCase();
  const messageWords = new Set(
    messageLower.split(/\s+/).filter(w => w.length > 3)
  );

  const scored = history.learnings.map(learning => {
    let baseScore = 0;

    // Keyword overlap between user message and past task summary
    const summaryWords = learning.taskSummary
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 3);

    for (const word of summaryWords) {
      if (messageWords.has(word)) baseScore += 2;
      else if (messageLower.includes(word)) baseScore += 1;
    }

    // Category prediction based on keyword hints
    for (const [cat, hints] of Object.entries(CATEGORY_HINTS)) {
      if (hints.some(h => messageLower.includes(h)) && learning.category === cat) {
        baseScore += 3;
      }
    }

    // Only apply bonuses when there's actual relevance signal
    let score = baseScore;
    if (baseScore > 0) {
      // Recency bonus (newer = more relevant)
      const ageHours = (Date.now() - learning.timestamp) / (1000 * 60 * 60);
      if (ageHours < 24) score += 2;
      else if (ageHours < 168) score += 1; // within a week

      // Success bonus
      if (learning.success) score += 1;
    }

    return { learning, score };
  });

  // Filter out irrelevant and sort by score descending
  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.learning);
}

/**
 * Format relevant learnings for injection into system prompt.
 * Kept concise to minimize token overhead.
 */
export function formatLearningsForPrompt(learnings: TaskLearning[]): string {
  if (learnings.length === 0) return '';

  const lines: string[] = [
    '\n\n--- Past task patterns (for reference) ---',
  ];

  for (const l of learnings) {
    const tools = l.uniqueTools.length > 0 ? l.uniqueTools.join(', ') : 'none';
    const outcome = l.success ? 'OK' : 'FAILED';
    const duration =
      l.durationMs < 60000
        ? `${Math.round(l.durationMs / 1000)}s`
        : `${Math.round(l.durationMs / 60000)}min`;

    lines.push(
      `- "${l.taskSummary.substring(0, 80)}" => ${outcome}, ${l.iterations} iters, tools:[${tools}], ${duration}`
    );
  }

  lines.push('Use similar tool strategies for similar requests.');

  return lines.join('\n');
}

/**
 * Store a brief summary of the last completed task for cross-task context.
 * Overwrites the previous summary (only keeps the latest).
 */
export async function storeLastTaskSummary(
  r2: R2Bucket,
  userId: string,
  learning: TaskLearning
): Promise<void> {
  const summary: LastTaskSummary = {
    taskSummary: learning.taskSummary,
    category: learning.category,
    toolsUsed: learning.uniqueTools,
    success: learning.success,
    modelAlias: learning.modelAlias,
    completedAt: learning.timestamp,
  };
  const key = `learnings/${userId}/last-task.json`;
  await r2.put(key, JSON.stringify(summary));
}

/**
 * Load the last task summary for cross-task context injection.
 * Returns null if no previous task or on error.
 */
export async function loadLastTaskSummary(
  r2: R2Bucket,
  userId: string
): Promise<LastTaskSummary | null> {
  const key = `learnings/${userId}/last-task.json`;
  try {
    const obj = await r2.get(key);
    if (!obj) return null;
    const summary = await obj.json() as LastTaskSummary;
    // Skip if older than 1 hour (stale context)
    if (Date.now() - summary.completedAt > 3600000) return null;
    return summary;
  } catch {
    return null;
  }
}

/**
 * Format the last task summary for system prompt injection.
 * Kept very concise (1-2 lines) to minimize token overhead.
 */
export function formatLastTaskForPrompt(summary: LastTaskSummary | null): string {
  if (!summary) return '';

  const tools = summary.toolsUsed.length > 0 ? summary.toolsUsed.join(', ') : 'none';
  const outcome = summary.success ? 'completed' : 'failed';
  const age = Math.round((Date.now() - summary.completedAt) / 60000);

  return `\n\n[Previous task (${age}min ago, ${outcome}): "${summary.taskSummary.substring(0, 100)}" — tools: ${tools}]`;
}
