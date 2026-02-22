/**
 * Integration tests for Smart Context Loading (Phase 7A.2)
 * Verifies that simple queries skip expensive R2 loads (learnings, sessions)
 * while complex queries trigger the full context loading pipeline.
 */

import { describe, it, expect, vi } from 'vitest';
import { classifyTaskComplexity } from '../utils/task-classifier';
import {
  loadLearnings,
  getRelevantLearnings,
  formatLearningsForPrompt,
  loadLastTaskSummary,
  formatLastTaskForPrompt,
  loadSessionHistory,
  getRelevantSessions,
  formatSessionsForPrompt,
} from '../openrouter/learnings';

// Mock R2 bucket
function createMockR2(): R2Bucket {
  return {
    get: vi.fn().mockResolvedValue(null),
    put: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    list: vi.fn().mockResolvedValue({ objects: [], truncated: false, delimitedPrefixes: [] }),
    head: vi.fn().mockResolvedValue(null),
    createMultipartUpload: vi.fn(),
    resumeMultipartUpload: vi.fn(),
  } as unknown as R2Bucket;
}

/**
 * Simulates the context-loading logic from handleChat().
 * Returns which R2 loads were triggered.
 */
async function simulateContextLoading(
  message: string,
  conversationLength: number,
  r2: R2Bucket,
  userId: string,
): Promise<{
  complexity: 'simple' | 'complex';
  learningsLoaded: boolean;
  lastTaskLoaded: boolean;
  sessionsLoaded: boolean;
  historySliceSize: number;
}> {
  const complexity = classifyTaskComplexity(message, conversationLength);

  // Simulate fullHistory as an array of conversationLength items
  const fullHistory = Array.from({ length: conversationLength }, (_, i) => ({
    role: i % 2 === 0 ? 'user' : 'assistant',
    content: `message ${i}`,
  }));

  // Match handleChat() logic: simple → slice(-5), complex → full
  const history = complexity === 'simple' ? fullHistory.slice(-5) : fullHistory;

  let learningsLoaded = false;
  let lastTaskLoaded = false;
  let sessionsLoaded = false;

  if (complexity === 'complex') {
    // These mirror getLearningsHint, getLastTaskHint, getSessionContext
    const learningHistory = await loadLearnings(r2, userId);
    learningsLoaded = true;
    if (learningHistory) {
      getRelevantLearnings(learningHistory, message);
    }

    await loadLastTaskSummary(r2, userId);
    lastTaskLoaded = true;

    const sessionHistory = await loadSessionHistory(r2, userId);
    sessionsLoaded = true;
    if (sessionHistory) {
      getRelevantSessions(sessionHistory, message);
    }
  }

  return {
    complexity,
    learningsLoaded,
    lastTaskLoaded,
    sessionsLoaded,
    historySliceSize: history.length,
  };
}

describe('Smart Context Loading — integration', () => {
  it('should skip all R2 loads for simple weather query', async () => {
    const r2 = createMockR2();
    const result = await simulateContextLoading("what's the weather?", 0, r2, 'user-123');

    expect(result.complexity).toBe('simple');
    expect(result.learningsLoaded).toBe(false);
    expect(result.lastTaskLoaded).toBe(false);
    expect(result.sessionsLoaded).toBe(false);
    expect(r2.get).not.toHaveBeenCalled();
  });

  it('should skip all R2 loads for simple greeting', async () => {
    const r2 = createMockR2();
    const result = await simulateContextLoading('hi!', 0, r2, 'user-123');

    expect(result.complexity).toBe('simple');
    expect(result.learningsLoaded).toBe(false);
    expect(result.lastTaskLoaded).toBe(false);
    expect(result.sessionsLoaded).toBe(false);
    expect(r2.get).not.toHaveBeenCalled();
  });

  it('should trigger all R2 loads for complex code query', async () => {
    const r2 = createMockR2();
    const result = await simulateContextLoading('fix the bug in handler.ts', 0, r2, 'user-123');

    expect(result.complexity).toBe('complex');
    expect(result.learningsLoaded).toBe(true);
    expect(result.lastTaskLoaded).toBe(true);
    expect(result.sessionsLoaded).toBe(true);
    // 3 R2 reads: learnings, last-task, sessions
    expect(r2.get).toHaveBeenCalledTimes(3);
  });

  it('should trigger all R2 loads for long conversation', async () => {
    const r2 = createMockR2();
    const result = await simulateContextLoading('yes', 5, r2, 'user-123');

    expect(result.complexity).toBe('complex');
    expect(result.learningsLoaded).toBe(true);
    expect(result.lastTaskLoaded).toBe(true);
    expect(result.sessionsLoaded).toBe(true);
  });

  it('should limit history to 5 messages for simple queries', async () => {
    const r2 = createMockR2();
    const result = await simulateContextLoading('hello', 2, r2, 'user-123');

    expect(result.complexity).toBe('simple');
    expect(result.historySliceSize).toBe(2); // 2 < 5, so all kept
  });

  it('should keep full history for complex queries', async () => {
    const r2 = createMockR2();
    const result = await simulateContextLoading('deploy the app now', 8, r2, 'user-123');

    expect(result.complexity).toBe('complex');
    expect(result.historySliceSize).toBe(8); // Full history preserved
  });

  it('should skip R2 for crypto price queries', async () => {
    const r2 = createMockR2();
    const result = await simulateContextLoading('BTC price?', 0, r2, 'user-123');

    expect(result.complexity).toBe('simple');
    expect(r2.get).not.toHaveBeenCalled();
  });

  it('should load context for queries referencing previous work', async () => {
    const r2 = createMockR2();
    const result = await simulateContextLoading('continue what we discussed', 0, r2, 'user-123');

    expect(result.complexity).toBe('complex');
    expect(result.learningsLoaded).toBe(true);
    expect(result.sessionsLoaded).toBe(true);
  });
});
