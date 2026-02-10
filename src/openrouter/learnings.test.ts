/**
 * Tests for compound learning loop
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  categorizeTask,
  extractLearning,
  storeLearning,
  loadLearnings,
  getRelevantLearnings,
  formatLearningsForPrompt,
  storeLastTaskSummary,
  loadLastTaskSummary,
  formatLastTaskForPrompt,
  type TaskLearning,
  type LearningHistory,
  type TaskCategory,
  type LastTaskSummary,
} from './learnings';

// --- categorizeTask ---

describe('categorizeTask', () => {
  it('returns simple_chat when no tools used', () => {
    expect(categorizeTask([])).toBe('simple_chat');
  });

  it('categorizes web_search tools', () => {
    expect(categorizeTask(['fetch_url'])).toBe('web_search');
    expect(categorizeTask(['browse_url'])).toBe('web_search');
    expect(categorizeTask(['url_metadata'])).toBe('web_search');
    expect(categorizeTask(['fetch_url', 'browse_url'])).toBe('web_search');
  });

  it('categorizes github tools', () => {
    expect(categorizeTask(['github_read_file'])).toBe('github');
    expect(categorizeTask(['github_list_files', 'github_api'])).toBe('github');
    expect(categorizeTask(['github_create_pr'])).toBe('github');
  });

  it('categorizes data_lookup tools', () => {
    expect(categorizeTask(['get_weather'])).toBe('data_lookup');
    expect(categorizeTask(['get_crypto'])).toBe('data_lookup');
    expect(categorizeTask(['convert_currency'])).toBe('data_lookup');
    expect(categorizeTask(['fetch_news'])).toBe('data_lookup');
    expect(categorizeTask(['geolocate_ip'])).toBe('data_lookup');
  });

  it('categorizes chart_gen tools', () => {
    expect(categorizeTask(['generate_chart'])).toBe('chart_gen');
  });

  it('categorizes code_exec tools', () => {
    expect(categorizeTask(['sandbox_exec'])).toBe('code_exec');
  });

  it('returns dominant category for 2 categories', () => {
    // github used more than web_search
    const result = categorizeTask(['github_read_file', 'github_list_files', 'fetch_url']);
    expect(result).toBe('github');
  });

  it('returns multi_tool for 3+ categories', () => {
    const result = categorizeTask([
      'fetch_url',        // web_search
      'github_read_file', // github
      'get_weather',      // data_lookup
    ]);
    expect(result).toBe('multi_tool');
  });

  it('handles unknown tools gracefully', () => {
    expect(categorizeTask(['unknown_tool'])).toBe('simple_chat');
  });

  it('handles mix of known and unknown tools', () => {
    expect(categorizeTask(['unknown_tool', 'fetch_url'])).toBe('web_search');
  });

  it('tie-breaks 2 equal categories by returning one deterministically', () => {
    // 1 web_search + 1 data_lookup — equal frequency, returns whichever sorts first
    const result = categorizeTask(['fetch_url', 'get_weather']);
    // Both categories have count 1; sorted descending by count, first wins
    expect(['web_search', 'data_lookup']).toContain(result);
    // Verify it's stable: same input → same output
    expect(categorizeTask(['fetch_url', 'get_weather'])).toBe(result);
  });

  it('handles duplicate tools correctly', () => {
    // 5x fetch_url + 1x github — web_search dominant
    const result = categorizeTask([
      'fetch_url', 'fetch_url', 'fetch_url', 'fetch_url', 'fetch_url',
      'github_read_file',
    ]);
    expect(result).toBe('web_search');
  });

  it('handles all 4 github tools in one call', () => {
    const result = categorizeTask([
      'github_read_file', 'github_list_files', 'github_api', 'github_create_pr',
    ]);
    expect(result).toBe('github');
  });
});

// --- extractLearning ---

describe('extractLearning', () => {
  it('extracts learning with correct fields', () => {
    const learning = extractLearning({
      taskId: 'user1-12345',
      modelAlias: 'deep',
      toolsUsed: ['fetch_url', 'fetch_url', 'github_read_file'],
      iterations: 5,
      durationMs: 30000,
      success: true,
      userMessage: 'Check the README on github and fetch the homepage',
    });

    expect(learning.taskId).toBe('user1-12345');
    expect(learning.modelAlias).toBe('deep');
    expect(learning.category).toBe('web_search'); // fetch_url used twice
    expect(learning.toolsUsed).toEqual(['fetch_url', 'fetch_url', 'github_read_file']);
    expect(learning.uniqueTools).toEqual(['fetch_url', 'github_read_file']);
    expect(learning.iterations).toBe(5);
    expect(learning.durationMs).toBe(30000);
    expect(learning.success).toBe(true);
    expect(learning.taskSummary).toBe('Check the README on github and fetch the homepage');
    expect(learning.timestamp).toBeGreaterThan(0);
  });

  it('truncates taskSummary to 200 chars', () => {
    const longMessage = 'a'.repeat(300);
    const learning = extractLearning({
      taskId: 'test',
      modelAlias: 'gpt',
      toolsUsed: [],
      iterations: 1,
      durationMs: 1000,
      success: true,
      userMessage: longMessage,
    });

    expect(learning.taskSummary.length).toBe(200);
  });

  it('handles simple chat (no tools)', () => {
    const learning = extractLearning({
      taskId: 'test',
      modelAlias: 'sonnet',
      toolsUsed: [],
      iterations: 1,
      durationMs: 2000,
      success: true,
      userMessage: 'Hello, how are you?',
    });

    expect(learning.category).toBe('simple_chat');
    expect(learning.uniqueTools).toEqual([]);
  });

  it('handles failed task', () => {
    const learning = extractLearning({
      taskId: 'test',
      modelAlias: 'deep',
      toolsUsed: ['fetch_url'],
      iterations: 3,
      durationMs: 45000,
      success: false,
      userMessage: 'Fetch https://example.com',
    });

    expect(learning.success).toBe(false);
    expect(learning.category).toBe('web_search');
  });

  it('handles empty userMessage', () => {
    const learning = extractLearning({
      taskId: 'test',
      modelAlias: 'gpt',
      toolsUsed: [],
      iterations: 1,
      durationMs: 1000,
      success: true,
      userMessage: '',
    });

    expect(learning.taskSummary).toBe('');
  });

  it('handles zero duration and zero iterations', () => {
    const learning = extractLearning({
      taskId: 'test',
      modelAlias: 'deep',
      toolsUsed: ['fetch_url'],
      iterations: 0,
      durationMs: 0,
      success: true,
      userMessage: 'Quick test',
    });

    expect(learning.iterations).toBe(0);
    expect(learning.durationMs).toBe(0);
  });

  it('sets timestamp automatically from Date.now()', () => {
    const before = Date.now();
    const learning = extractLearning({
      taskId: 'test',
      modelAlias: 'gpt',
      toolsUsed: [],
      iterations: 1,
      durationMs: 1000,
      success: true,
      userMessage: 'test',
    });
    const after = Date.now();

    expect(learning.timestamp).toBeGreaterThanOrEqual(before);
    expect(learning.timestamp).toBeLessThanOrEqual(after);
  });
});

// --- storeLearning & loadLearnings ---

describe('storeLearning', () => {
  let mockBucket: {
    get: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockBucket = {
      get: vi.fn(),
      put: vi.fn().mockResolvedValue(undefined),
    };
  });

  const makeLearning = (taskId: string, success: boolean = true): TaskLearning => ({
    taskId,
    timestamp: Date.now(),
    modelAlias: 'deep',
    category: 'web_search',
    toolsUsed: ['fetch_url'],
    uniqueTools: ['fetch_url'],
    iterations: 2,
    durationMs: 5000,
    success,
    taskSummary: `Task ${taskId}`,
  });

  it('creates new history when none exists', async () => {
    mockBucket.get.mockResolvedValue(null);

    await storeLearning(mockBucket as unknown as R2Bucket, 'user1', makeLearning('t1'));

    expect(mockBucket.put).toHaveBeenCalledOnce();
    const [key, data] = mockBucket.put.mock.calls[0];
    expect(key).toBe('learnings/user1/history.json');

    const parsed = JSON.parse(data as string);
    expect(parsed.userId).toBe('user1');
    expect(parsed.learnings).toHaveLength(1);
    expect(parsed.learnings[0].taskId).toBe('t1');
  });

  it('appends to existing history', async () => {
    const existingHistory: LearningHistory = {
      userId: 'user1',
      learnings: [makeLearning('t1')],
      updatedAt: Date.now(),
    };

    mockBucket.get.mockResolvedValue({
      json: () => Promise.resolve(existingHistory),
    });

    await storeLearning(mockBucket as unknown as R2Bucket, 'user1', makeLearning('t2'));

    const [, data] = mockBucket.put.mock.calls[0];
    const parsed = JSON.parse(data as string);
    expect(parsed.learnings).toHaveLength(2);
    expect(parsed.learnings[1].taskId).toBe('t2');
  });

  it('caps history at 50 entries', async () => {
    const existingHistory: LearningHistory = {
      userId: 'user1',
      learnings: Array.from({ length: 50 }, (_, i) => makeLearning(`t${i}`)),
      updatedAt: Date.now(),
    };

    mockBucket.get.mockResolvedValue({
      json: () => Promise.resolve(existingHistory),
    });

    await storeLearning(mockBucket as unknown as R2Bucket, 'user1', makeLearning('t50'));

    const [, data] = mockBucket.put.mock.calls[0];
    const parsed = JSON.parse(data as string);
    expect(parsed.learnings).toHaveLength(50);
    // Oldest should be dropped, newest should be last
    expect(parsed.learnings[49].taskId).toBe('t50');
    expect(parsed.learnings[0].taskId).toBe('t1'); // t0 was dropped
  });

  it('handles R2 read error gracefully', async () => {
    mockBucket.get.mockRejectedValue(new Error('R2 read failed'));

    // Should not throw, should create new history
    await storeLearning(mockBucket as unknown as R2Bucket, 'user1', makeLearning('t1'));

    expect(mockBucket.put).toHaveBeenCalledOnce();
    const [, data] = mockBucket.put.mock.calls[0];
    const parsed = JSON.parse(data as string);
    expect(parsed.learnings).toHaveLength(1);
  });

  it('propagates R2 write error', async () => {
    mockBucket.get.mockResolvedValue(null);
    mockBucket.put.mockRejectedValue(new Error('R2 write failed'));

    await expect(
      storeLearning(mockBucket as unknown as R2Bucket, 'user1', makeLearning('t1'))
    ).rejects.toThrow('R2 write failed');
  });

  it('updates updatedAt timestamp on every store', async () => {
    mockBucket.get.mockResolvedValue(null);

    const before = Date.now();
    await storeLearning(mockBucket as unknown as R2Bucket, 'user1', makeLearning('t1'));
    const after = Date.now();

    const [, data] = mockBucket.put.mock.calls[0];
    const parsed = JSON.parse(data as string);
    expect(parsed.updatedAt).toBeGreaterThanOrEqual(before);
    expect(parsed.updatedAt).toBeLessThanOrEqual(after);
  });

  it('uses correct R2 key format for different users', async () => {
    mockBucket.get.mockResolvedValue(null);

    await storeLearning(mockBucket as unknown as R2Bucket, '99887766', makeLearning('t1'));

    const [key] = mockBucket.put.mock.calls[0];
    expect(key).toBe('learnings/99887766/history.json');
  });
});

describe('loadLearnings', () => {
  it('returns null when no history exists', async () => {
    const mockBucket = { get: vi.fn().mockResolvedValue(null) };

    const result = await loadLearnings(mockBucket as unknown as R2Bucket, 'user1');
    expect(result).toBeNull();
  });

  it('returns parsed history', async () => {
    const history: LearningHistory = {
      userId: 'user1',
      learnings: [{
        taskId: 't1',
        timestamp: Date.now(),
        modelAlias: 'deep',
        category: 'github',
        toolsUsed: ['github_read_file'],
        uniqueTools: ['github_read_file'],
        iterations: 3,
        durationMs: 10000,
        success: true,
        taskSummary: 'Read the repo',
      }],
      updatedAt: Date.now(),
    };

    const mockBucket = {
      get: vi.fn().mockResolvedValue({
        json: () => Promise.resolve(history),
      }),
    };

    const result = await loadLearnings(mockBucket as unknown as R2Bucket, 'user1');
    expect(result).not.toBeNull();
    expect(result!.learnings).toHaveLength(1);
    expect(result!.learnings[0].taskId).toBe('t1');
  });

  it('handles JSON parse error gracefully', async () => {
    const mockBucket = {
      get: vi.fn().mockResolvedValue({
        json: () => Promise.reject(new Error('Invalid JSON')),
      }),
    };

    const result = await loadLearnings(mockBucket as unknown as R2Bucket, 'user1');
    expect(result).toBeNull();
  });

  it('handles R2 get() throwing gracefully', async () => {
    const mockBucket = {
      get: vi.fn().mockRejectedValue(new Error('R2 unavailable')),
    };

    const result = await loadLearnings(mockBucket as unknown as R2Bucket, 'user1');
    expect(result).toBeNull();
  });

  it('reads from correct R2 key', async () => {
    const mockBucket = { get: vi.fn().mockResolvedValue(null) };

    await loadLearnings(mockBucket as unknown as R2Bucket, '12345');

    expect(mockBucket.get).toHaveBeenCalledWith('learnings/12345/history.json');
  });
});

// --- getRelevantLearnings ---

describe('getRelevantLearnings', () => {
  const now = Date.now();

  const makeHistory = (learnings: Partial<TaskLearning>[]): LearningHistory => ({
    userId: 'user1',
    learnings: learnings.map((l, i) => ({
      taskId: `t${i}`,
      timestamp: l.timestamp ?? now - 3600000, // 1 hour ago default
      modelAlias: l.modelAlias ?? 'deep',
      category: l.category ?? 'simple_chat',
      toolsUsed: l.toolsUsed ?? [],
      uniqueTools: l.uniqueTools ?? [],
      iterations: l.iterations ?? 1,
      durationMs: l.durationMs ?? 5000,
      success: l.success ?? true,
      taskSummary: l.taskSummary ?? 'test task',
    })),
    updatedAt: now,
  });

  it('returns empty array for empty history', () => {
    const history = makeHistory([]);
    expect(getRelevantLearnings(history, 'any message')).toEqual([]);
  });

  it('returns empty array for null-ish history', () => {
    // @ts-expect-error — testing defensive null handling
    expect(getRelevantLearnings(null, 'any message')).toEqual([]);
    // @ts-expect-error — testing defensive undefined handling
    expect(getRelevantLearnings(undefined, 'any message')).toEqual([]);
  });

  it('matches by keyword overlap', () => {
    const history = makeHistory([
      { taskSummary: 'check bitcoin price today', category: 'data_lookup' },
      { taskSummary: 'write hello world code', category: 'simple_chat' },
    ]);

    const result = getRelevantLearnings(history, 'what is the bitcoin price');
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].taskSummary).toContain('bitcoin');
  });

  it('matches by category hints', () => {
    const history = makeHistory([
      { taskSummary: 'some weather task', category: 'data_lookup', uniqueTools: ['get_weather'] },
      { taskSummary: 'unrelated task', category: 'simple_chat' },
    ]);

    const result = getRelevantLearnings(history, 'weather forecast for Prague');
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].category).toBe('data_lookup');
  });

  it('does not give category bonus when category mismatches hint', () => {
    const history = makeHistory([
      // "weather" keyword in message hints at data_lookup, but this is github category
      { taskSummary: 'weather related github issue', category: 'github' },
    ]);

    // "weather" hint matches data_lookup, not github. But "weather" word overlap still gives base score.
    const result = getRelevantLearnings(history, 'weather forecast for Prague');
    // The result may or may not appear depending on word overlap, but category bonus shouldn't fire.
    // "weather" is 7 chars > 3, present in both → base score from keyword overlap.
    expect(result.length).toBe(1);
    // The category hint bonus is only +3 for data_lookup category, this is github → no +3
  });

  it('prefers recent learnings', () => {
    const history = makeHistory([
      { taskSummary: 'check weather old', category: 'data_lookup', timestamp: now - 7 * 86400000 }, // 7 days ago
      { taskSummary: 'check weather new', category: 'data_lookup', timestamp: now - 3600000 }, // 1 hour ago
    ]);

    const result = getRelevantLearnings(history, 'weather forecast');
    expect(result.length).toBe(2);
    // More recent should rank higher
    expect(result[0].taskSummary).toContain('new');
  });

  it('gives no recency bonus for old learnings (>7d)', () => {
    const history = makeHistory([
      { taskSummary: 'check weather ancient', category: 'data_lookup', timestamp: now - 30 * 86400000 }, // 30 days ago
      { taskSummary: 'check weather recent', category: 'data_lookup', timestamp: now - 3600000 }, // 1 hour ago
    ]);

    const result = getRelevantLearnings(history, 'weather forecast');
    expect(result.length).toBe(2);
    // Recent one should still rank first due to recency bonus
    expect(result[0].taskSummary).toContain('recent');
  });

  it('prefers successful learnings', () => {
    const history = makeHistory([
      { taskSummary: 'fetch github readme', category: 'github', success: false },
      { taskSummary: 'fetch github readme', category: 'github', success: true },
    ]);

    const result = getRelevantLearnings(history, 'read github readme');
    expect(result.length).toBe(2);
    expect(result[0].success).toBe(true);
  });

  it('does not apply success bonus without base relevance', () => {
    const history = makeHistory([
      { taskSummary: 'completely unrelated quantum physics', category: 'simple_chat', success: true },
    ]);

    // No keyword or category overlap → baseScore = 0 → success bonus NOT applied
    const result = getRelevantLearnings(history, 'weather in Paris');
    expect(result).toEqual([]);
  });

  it('does not apply recency bonus without base relevance', () => {
    const history = makeHistory([
      { taskSummary: 'unrelated task from just now', category: 'simple_chat', timestamp: now },
    ]);

    // No keyword or category overlap → baseScore = 0 → recency bonus NOT applied
    const result = getRelevantLearnings(history, 'check bitcoin price');
    expect(result).toEqual([]);
  });

  it('filters out irrelevant learnings (score = 0)', () => {
    const history = makeHistory([
      { taskSummary: 'analyze quantum physics paper', category: 'simple_chat' },
    ]);

    const result = getRelevantLearnings(history, 'weather in Paris');
    expect(result).toEqual([]);
  });

  it('limits results to specified count', () => {
    const history = makeHistory(
      Array.from({ length: 20 }, (_, i) => ({
        taskSummary: `weather task number ${i}`,
        category: 'data_lookup' as TaskCategory,
      }))
    );

    const result = getRelevantLearnings(history, 'weather forecast', 3);
    expect(result.length).toBeLessThanOrEqual(3);
  });

  it('uses default limit of 5', () => {
    const history = makeHistory(
      Array.from({ length: 20 }, (_, i) => ({
        taskSummary: `weather task number ${i}`,
        category: 'data_lookup' as TaskCategory,
      }))
    );

    const result = getRelevantLearnings(history, 'weather forecast');
    expect(result.length).toBeLessThanOrEqual(5);
  });

  it('handles github keyword matching', () => {
    const history = makeHistory([
      { taskSummary: 'read the github repo files', category: 'github', uniqueTools: ['github_read_file'] },
    ]);

    const result = getRelevantLearnings(history, 'show me the github repository structure');
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].category).toBe('github');
  });

  it('ignores words with 3 or fewer characters', () => {
    const history = makeHistory([
      { taskSummary: 'the is a an for', category: 'simple_chat' },
    ]);

    // All summary words are <= 3 chars, no keyword overlap possible
    const result = getRelevantLearnings(history, 'the is a test');
    expect(result).toEqual([]);
  });

  it('matching is case insensitive', () => {
    const history = makeHistory([
      { taskSummary: 'Check BITCOIN Price', category: 'data_lookup' },
    ]);

    const result = getRelevantLearnings(history, 'show me bitcoin value');
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].taskSummary).toContain('BITCOIN');
  });

  it('scores higher when keyword + category both match', () => {
    const history = makeHistory([
      // keyword match only: "bitcoin" in summary + message
      { taskSummary: 'bitcoin mining tutorial', category: 'simple_chat', timestamp: now - 3600000 },
      // keyword + category: "bitcoin" in summary + message, AND category hint "crypto" matches data_lookup
      { taskSummary: 'bitcoin price check', category: 'data_lookup', timestamp: now - 3600000 },
    ]);

    const result = getRelevantLearnings(history, 'crypto bitcoin price today');
    expect(result.length).toBe(2);
    // The data_lookup one should rank higher (keyword + category bonus)
    expect(result[0].category).toBe('data_lookup');
  });

  it('partial match (substring) scores lower than exact word', () => {
    const history = makeHistory([
      // "weathering" contains "weather" as substring but not as exact word
      { taskSummary: 'withstand the weathering storm', category: 'simple_chat' },
      // "weather" as exact word
      { taskSummary: 'check weather forecast', category: 'data_lookup' },
    ]);

    const result = getRelevantLearnings(history, 'weather forecast today');
    expect(result.length).toBeGreaterThanOrEqual(1);
    // Exact match should rank first
    expect(result[0].taskSummary).toContain('check weather');
  });
});

// --- formatLearningsForPrompt ---

describe('formatLearningsForPrompt', () => {
  it('returns empty string for no learnings', () => {
    expect(formatLearningsForPrompt([])).toBe('');
  });

  it('formats single learning correctly', () => {
    const learnings: TaskLearning[] = [{
      taskId: 't1',
      timestamp: Date.now(),
      modelAlias: 'deep',
      category: 'web_search',
      toolsUsed: ['fetch_url'],
      uniqueTools: ['fetch_url'],
      iterations: 3,
      durationMs: 12000,
      success: true,
      taskSummary: 'Fetch the homepage of example.com',
    }];

    const result = formatLearningsForPrompt(learnings);
    expect(result).toContain('Past task patterns');
    expect(result).toContain('Fetch the homepage');
    expect(result).toContain('OK');
    expect(result).toContain('3 iters');
    expect(result).toContain('fetch_url');
    expect(result).toContain('12s');
  });

  it('formats failed learning with FAILED label', () => {
    const learnings: TaskLearning[] = [{
      taskId: 't1',
      timestamp: Date.now(),
      modelAlias: 'gpt',
      category: 'github',
      toolsUsed: ['github_read_file'],
      uniqueTools: ['github_read_file'],
      iterations: 5,
      durationMs: 90000,
      success: false,
      taskSummary: 'Read large repository',
    }];

    const result = formatLearningsForPrompt(learnings);
    expect(result).toContain('FAILED');
    expect(result).toContain('2min'); // 90000ms = 1.5min, rounds to 2
  });

  it('formats multiple learnings', () => {
    const learnings: TaskLearning[] = [
      {
        taskId: 't1',
        timestamp: Date.now(),
        modelAlias: 'deep',
        category: 'data_lookup',
        toolsUsed: ['get_weather'],
        uniqueTools: ['get_weather'],
        iterations: 2,
        durationMs: 8000,
        success: true,
        taskSummary: 'Weather in Prague',
      },
      {
        taskId: 't2',
        timestamp: Date.now(),
        modelAlias: 'gpt',
        category: 'github',
        toolsUsed: ['github_read_file', 'github_list_files'],
        uniqueTools: ['github_read_file', 'github_list_files'],
        iterations: 4,
        durationMs: 20000,
        success: true,
        taskSummary: 'Analyze repo structure',
      },
    ];

    const result = formatLearningsForPrompt(learnings);
    const lines = result.split('\n').filter(l => l.startsWith('- "'));
    expect(lines).toHaveLength(2);
  });

  it('truncates long task summaries to 80 chars', () => {
    const learnings: TaskLearning[] = [{
      taskId: 't1',
      timestamp: Date.now(),
      modelAlias: 'deep',
      category: 'simple_chat',
      toolsUsed: [],
      uniqueTools: [],
      iterations: 1,
      durationMs: 2000,
      success: true,
      taskSummary: 'A'.repeat(200),
    }];

    const result = formatLearningsForPrompt(learnings);
    // The summary in the prompt line should be truncated
    const summaryMatch = result.match(/"(A+)"/);
    expect(summaryMatch).toBeTruthy();
    expect(summaryMatch![1].length).toBe(80);
  });

  it('shows "none" for tools when no tools used', () => {
    const learnings: TaskLearning[] = [{
      taskId: 't1',
      timestamp: Date.now(),
      modelAlias: 'gpt',
      category: 'simple_chat',
      toolsUsed: [],
      uniqueTools: [],
      iterations: 1,
      durationMs: 3000,
      success: true,
      taskSummary: 'Hello world',
    }];

    const result = formatLearningsForPrompt(learnings);
    expect(result).toContain('tools:[none]');
  });

  it('includes strategy hint at the end', () => {
    const learnings: TaskLearning[] = [{
      taskId: 't1',
      timestamp: Date.now(),
      modelAlias: 'deep',
      category: 'web_search',
      toolsUsed: ['fetch_url'],
      uniqueTools: ['fetch_url'],
      iterations: 2,
      durationMs: 5000,
      success: true,
      taskSummary: 'Fetch page',
    }];

    const result = formatLearningsForPrompt(learnings);
    expect(result).toContain('Use similar tool strategies');
  });

  it('lists multiple unique tools comma-separated', () => {
    const learnings: TaskLearning[] = [{
      taskId: 't1',
      timestamp: Date.now(),
      modelAlias: 'deep',
      category: 'multi_tool',
      toolsUsed: ['fetch_url', 'github_read_file', 'get_weather'],
      uniqueTools: ['fetch_url', 'github_read_file', 'get_weather'],
      iterations: 5,
      durationMs: 20000,
      success: true,
      taskSummary: 'Complex multi-tool task',
    }];

    const result = formatLearningsForPrompt(learnings);
    expect(result).toContain('tools:[fetch_url, github_read_file, get_weather]');
  });

  it('output starts with double newline for prompt separation', () => {
    const learnings: TaskLearning[] = [{
      taskId: 't1',
      timestamp: Date.now(),
      modelAlias: 'deep',
      category: 'web_search',
      toolsUsed: ['fetch_url'],
      uniqueTools: ['fetch_url'],
      iterations: 1,
      durationMs: 1000,
      success: true,
      taskSummary: 'test',
    }];

    const result = formatLearningsForPrompt(learnings);
    expect(result.startsWith('\n\n')).toBe(true);
  });

  it('formats duration boundary: exactly 60s shows 1min', () => {
    const learnings: TaskLearning[] = [{
      taskId: 't1',
      timestamp: Date.now(),
      modelAlias: 'deep',
      category: 'web_search',
      toolsUsed: ['fetch_url'],
      uniqueTools: ['fetch_url'],
      iterations: 2,
      durationMs: 60000,
      success: true,
      taskSummary: 'Boundary test',
    }];

    const result = formatLearningsForPrompt(learnings);
    expect(result).toContain('1min');
  });

  it('formats duration: 59999ms shows 60s (sub-minute)', () => {
    const learnings: TaskLearning[] = [{
      taskId: 't1',
      timestamp: Date.now(),
      modelAlias: 'deep',
      category: 'web_search',
      toolsUsed: ['fetch_url'],
      uniqueTools: ['fetch_url'],
      iterations: 2,
      durationMs: 59999,
      success: true,
      taskSummary: 'Just under a minute',
    }];

    const result = formatLearningsForPrompt(learnings);
    expect(result).toContain('60s');
  });

  it('formats zero duration as 0s', () => {
    const learnings: TaskLearning[] = [{
      taskId: 't1',
      timestamp: Date.now(),
      modelAlias: 'deep',
      category: 'simple_chat',
      toolsUsed: [],
      uniqueTools: [],
      iterations: 1,
      durationMs: 0,
      success: true,
      taskSummary: 'Instant',
    }];

    const result = formatLearningsForPrompt(learnings);
    expect(result).toContain('0s');
  });
});

// --- storeLastTaskSummary ---

describe('storeLastTaskSummary', () => {
  it('stores summary to correct R2 key', async () => {
    const mockBucket = { put: vi.fn().mockResolvedValue(undefined) };
    const learning: TaskLearning = {
      taskId: 't1',
      timestamp: Date.now(),
      modelAlias: 'deep',
      category: 'github',
      toolsUsed: ['github_read_file', 'github_list_files'],
      uniqueTools: ['github_read_file', 'github_list_files'],
      iterations: 5,
      durationMs: 30000,
      success: true,
      taskSummary: 'Analyze the megaengage repo',
    };

    await storeLastTaskSummary(mockBucket as unknown as R2Bucket, 'user1', learning);

    expect(mockBucket.put).toHaveBeenCalledWith(
      'learnings/user1/last-task.json',
      expect.any(String)
    );

    const stored = JSON.parse(mockBucket.put.mock.calls[0][1]);
    expect(stored.taskSummary).toBe('Analyze the megaengage repo');
    expect(stored.category).toBe('github');
    expect(stored.toolsUsed).toEqual(['github_read_file', 'github_list_files']);
    expect(stored.success).toBe(true);
    expect(stored.modelAlias).toBe('deep');
  });
});

// --- loadLastTaskSummary ---

describe('loadLastTaskSummary', () => {
  it('returns null when no summary exists', async () => {
    const mockBucket = { get: vi.fn().mockResolvedValue(null) };
    const result = await loadLastTaskSummary(mockBucket as unknown as R2Bucket, 'user1');
    expect(result).toBeNull();
  });

  it('returns summary when recent (< 1 hour)', async () => {
    const summary: LastTaskSummary = {
      taskSummary: 'Fetch homepage',
      category: 'web_search',
      toolsUsed: ['fetch_url'],
      success: true,
      modelAlias: 'gpt',
      completedAt: Date.now() - 30 * 60000, // 30 min ago
    };
    const mockBucket = {
      get: vi.fn().mockResolvedValue({
        json: () => Promise.resolve(summary),
      }),
    };

    const result = await loadLastTaskSummary(mockBucket as unknown as R2Bucket, 'user1');
    expect(result).not.toBeNull();
    expect(result!.taskSummary).toBe('Fetch homepage');
  });

  it('returns null when summary is stale (> 1 hour)', async () => {
    const summary: LastTaskSummary = {
      taskSummary: 'Old task',
      category: 'simple_chat',
      toolsUsed: [],
      success: true,
      modelAlias: 'gpt',
      completedAt: Date.now() - 2 * 3600000, // 2 hours ago
    };
    const mockBucket = {
      get: vi.fn().mockResolvedValue({
        json: () => Promise.resolve(summary),
      }),
    };

    const result = await loadLastTaskSummary(mockBucket as unknown as R2Bucket, 'user1');
    expect(result).toBeNull();
  });

  it('returns null on R2 error', async () => {
    const mockBucket = {
      get: vi.fn().mockRejectedValue(new Error('R2 down')),
    };

    const result = await loadLastTaskSummary(mockBucket as unknown as R2Bucket, 'user1');
    expect(result).toBeNull();
  });
});

// --- formatLastTaskForPrompt ---

describe('formatLastTaskForPrompt', () => {
  it('returns empty string for null summary', () => {
    expect(formatLastTaskForPrompt(null)).toBe('');
  });

  it('formats completed task with tools', () => {
    const summary: LastTaskSummary = {
      taskSummary: 'Analyze the megaengage repo',
      category: 'github',
      toolsUsed: ['github_read_file', 'github_list_files'],
      success: true,
      modelAlias: 'deep',
      completedAt: Date.now() - 5 * 60000, // 5 min ago
    };

    const result = formatLastTaskForPrompt(summary);
    expect(result).toContain('Previous task');
    expect(result).toContain('5min ago');
    expect(result).toContain('completed');
    expect(result).toContain('Analyze the megaengage repo');
    expect(result).toContain('github_read_file, github_list_files');
  });

  it('formats failed task', () => {
    const summary: LastTaskSummary = {
      taskSummary: 'Create a PR',
      category: 'github',
      toolsUsed: ['github_create_pr'],
      success: false,
      modelAlias: 'qwencoderfree',
      completedAt: Date.now() - 60000,
    };

    const result = formatLastTaskForPrompt(summary);
    expect(result).toContain('failed');
  });

  it('shows "none" for tasks without tools', () => {
    const summary: LastTaskSummary = {
      taskSummary: 'Simple question',
      category: 'simple_chat',
      toolsUsed: [],
      success: true,
      modelAlias: 'auto',
      completedAt: Date.now(),
    };

    const result = formatLastTaskForPrompt(summary);
    expect(result).toContain('tools: none');
  });

  it('starts with double newline for prompt separation', () => {
    const summary: LastTaskSummary = {
      taskSummary: 'Test',
      category: 'simple_chat',
      toolsUsed: [],
      success: true,
      modelAlias: 'auto',
      completedAt: Date.now(),
    };

    const result = formatLastTaskForPrompt(summary);
    expect(result.startsWith('\n\n')).toBe(true);
  });

  it('truncates long task summaries to 100 chars', () => {
    const summary: LastTaskSummary = {
      taskSummary: 'A'.repeat(200),
      category: 'simple_chat',
      toolsUsed: [],
      success: true,
      modelAlias: 'auto',
      completedAt: Date.now(),
    };

    const result = formatLastTaskForPrompt(summary);
    const match = result.match(/"(A+)"/);
    expect(match).toBeTruthy();
    expect(match![1].length).toBe(100);
  });
});
