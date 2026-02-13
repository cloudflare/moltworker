/**
 * Tests for Orchestra Mode (init/run two-mode design)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  buildInitPrompt,
  buildRunPrompt,
  buildOrchestraPrompt,
  parseOrchestraCommand,
  parseOrchestraResult,
  generateTaskSlug,
  loadOrchestraHistory,
  storeOrchestraTask,
  formatOrchestraHistory,
  type OrchestraTask,
  type OrchestraHistory,
} from './orchestra';

// --- generateTaskSlug ---

describe('generateTaskSlug', () => {
  it('converts prompt to URL-safe slug', () => {
    expect(generateTaskSlug('Add dark mode toggle')).toBe('add-dark-mode-toggle');
  });

  it('removes special characters', () => {
    expect(generateTaskSlug('Fix bug #123!')).toBe('fix-bug-123');
  });

  it('truncates to 40 characters', () => {
    const longPrompt = 'This is a very long task description that exceeds forty characters easily';
    const slug = generateTaskSlug(longPrompt);
    expect(slug.length).toBeLessThanOrEqual(40);
  });

  it('handles empty prompt', () => {
    expect(generateTaskSlug('')).toBe('');
  });

  it('collapses multiple spaces into single dash', () => {
    expect(generateTaskSlug('add   new   feature')).toBe('add-new-feature');
  });

  it('removes trailing dashes', () => {
    const slug = generateTaskSlug('a'.repeat(39) + ' b');
    expect(slug.endsWith('-')).toBe(false);
  });

  it('handles unicode by stripping non-ascii', () => {
    expect(generateTaskSlug('Add émoji support')).toBe('add-moji-support');
  });
});

// --- parseOrchestraCommand ---

describe('parseOrchestraCommand', () => {
  describe('init mode', () => {
    it('parses /orchestra init owner/repo description', () => {
      const result = parseOrchestraCommand(['init', 'owner/repo', 'Build', 'a', 'user', 'auth', 'system']);
      expect(result).not.toBeNull();
      expect(result!.mode).toBe('init');
      expect(result!.repo).toBe('owner/repo');
      expect(result!.prompt).toBe('Build a user auth system');
    });

    it('returns null when init has no repo', () => {
      expect(parseOrchestraCommand(['init'])).toBeNull();
    });

    it('returns null when init has no description', () => {
      expect(parseOrchestraCommand(['init', 'owner/repo'])).toBeNull();
    });

    it('returns null for invalid repo format in init', () => {
      expect(parseOrchestraCommand(['init', 'notarepo', 'do stuff'])).toBeNull();
    });
  });

  describe('run mode', () => {
    it('parses /orchestra run owner/repo (no specific task)', () => {
      const result = parseOrchestraCommand(['run', 'owner/repo']);
      expect(result).not.toBeNull();
      expect(result!.mode).toBe('run');
      expect(result!.repo).toBe('owner/repo');
      expect(result!.prompt).toBe('');
    });

    it('parses /orchestra run owner/repo with specific task', () => {
      const result = parseOrchestraCommand(['run', 'owner/repo', 'Add', 'JWT', 'auth']);
      expect(result).not.toBeNull();
      expect(result!.mode).toBe('run');
      expect(result!.repo).toBe('owner/repo');
      expect(result!.prompt).toBe('Add JWT auth');
    });

    it('returns null for invalid repo in run', () => {
      expect(parseOrchestraCommand(['run', 'bad'])).toBeNull();
    });
  });

  describe('legacy mode', () => {
    it('parses /orchestra owner/repo <prompt> as run', () => {
      const result = parseOrchestraCommand(['owner/repo', 'Add', 'health', 'check']);
      expect(result).not.toBeNull();
      expect(result!.mode).toBe('run');
      expect(result!.repo).toBe('owner/repo');
      expect(result!.prompt).toBe('Add health check');
    });

    it('returns null for missing args', () => {
      expect(parseOrchestraCommand([])).toBeNull();
      expect(parseOrchestraCommand(['owner/repo'])).toBeNull();
    });

    it('returns null for invalid repo format', () => {
      expect(parseOrchestraCommand(['notarepo', 'do something'])).toBeNull();
    });

    it('accepts repo with dots and hyphens', () => {
      const result = parseOrchestraCommand(['my-org/my.repo', 'fix it']);
      expect(result).not.toBeNull();
      expect(result!.repo).toBe('my-org/my.repo');
    });
  });
});

// --- parseOrchestraResult ---

describe('parseOrchestraResult', () => {
  it('parses valid ORCHESTRA_RESULT block', () => {
    const response = `I've completed the task.

\`\`\`
ORCHESTRA_RESULT:
branch: bot/add-health-check-deep
pr: https://github.com/owner/repo/pull/42
files: src/health.ts, src/index.ts
summary: Added health check endpoint at /health
\`\`\``;

    const result = parseOrchestraResult(response);
    expect(result).not.toBeNull();
    expect(result!.branch).toBe('bot/add-health-check-deep');
    expect(result!.prUrl).toBe('https://github.com/owner/repo/pull/42');
    expect(result!.files).toEqual(['src/health.ts', 'src/index.ts']);
    expect(result!.summary).toBe('Added health check endpoint at /health');
  });

  it('returns null when no ORCHESTRA_RESULT found', () => {
    const response = 'Just a normal response without any result block.';
    expect(parseOrchestraResult(response)).toBeNull();
  });

  it('returns null when only branch and pr are empty', () => {
    const response = `ORCHESTRA_RESULT:
branch:
pr:
files:
summary: `;
    expect(parseOrchestraResult(response)).toBeNull();
  });

  it('handles single file', () => {
    const response = `ORCHESTRA_RESULT:
branch: bot/fix-bug-grok
pr: https://github.com/o/r/pull/1
files: src/fix.ts
summary: Fixed the bug`;

    const result = parseOrchestraResult(response);
    expect(result!.files).toEqual(['src/fix.ts']);
  });

  it('handles result at end of response without closing backticks', () => {
    const response = `Done!

ORCHESTRA_RESULT:
branch: bot/feature-deep
pr: https://github.com/o/r/pull/5
files: a.ts, b.ts
summary: Added feature`;

    const result = parseOrchestraResult(response);
    expect(result).not.toBeNull();
    expect(result!.branch).toBe('bot/feature-deep');
  });
});

// --- buildInitPrompt ---

describe('buildInitPrompt', () => {
  it('includes repo info', () => {
    const prompt = buildInitPrompt({ repo: 'owner/repo', modelAlias: 'deep' });
    expect(prompt).toContain('Owner: owner');
    expect(prompt).toContain('Repo: repo');
    expect(prompt).toContain('Full: owner/repo');
  });

  it('indicates INIT mode', () => {
    const prompt = buildInitPrompt({ repo: 'o/r', modelAlias: 'deep' });
    expect(prompt).toContain('Orchestra INIT Mode');
    expect(prompt).toContain('Roadmap Creation');
  });

  it('includes ROADMAP.md format template', () => {
    const prompt = buildInitPrompt({ repo: 'o/r', modelAlias: 'deep' });
    expect(prompt).toContain('ROADMAP.md');
    expect(prompt).toContain('- [ ]');
    expect(prompt).toContain('- [x]');
    expect(prompt).toContain('Phase 1');
    expect(prompt).toContain('Phase 2');
  });

  it('includes WORK_LOG.md creation instructions', () => {
    const prompt = buildInitPrompt({ repo: 'o/r', modelAlias: 'deep' });
    expect(prompt).toContain('WORK_LOG.md');
    expect(prompt).toContain('Date');
    expect(prompt).toContain('Model');
  });

  it('includes model alias in branch naming', () => {
    const prompt = buildInitPrompt({ repo: 'o/r', modelAlias: 'grok' });
    expect(prompt).toContain('roadmap-init-grok');
  });

  it('includes roadmap file candidates to check', () => {
    const prompt = buildInitPrompt({ repo: 'o/r', modelAlias: 'deep' });
    expect(prompt).toContain('ROADMAP.md');
    expect(prompt).toContain('TODO.md');
    expect(prompt).toContain('docs/ROADMAP.md');
  });

  it('includes ORCHESTRA_RESULT report format', () => {
    const prompt = buildInitPrompt({ repo: 'o/r', modelAlias: 'deep' });
    expect(prompt).toContain('ORCHESTRA_RESULT:');
    expect(prompt).toContain('branch:');
    expect(prompt).toContain('pr:');
    expect(prompt).toContain('files:');
    expect(prompt).toContain('summary:');
  });
});

// --- buildRunPrompt ---

describe('buildRunPrompt', () => {
  it('includes repo info', () => {
    const prompt = buildRunPrompt({ repo: 'owner/repo', modelAlias: 'deep', previousTasks: [] });
    expect(prompt).toContain('Owner: owner');
    expect(prompt).toContain('Repo: repo');
    expect(prompt).toContain('Full: owner/repo');
  });

  it('indicates RUN mode', () => {
    const prompt = buildRunPrompt({ repo: 'o/r', modelAlias: 'deep', previousTasks: [] });
    expect(prompt).toContain('Orchestra RUN Mode');
    expect(prompt).toContain('Execute Next Roadmap Task');
  });

  it('includes roadmap reading instructions', () => {
    const prompt = buildRunPrompt({ repo: 'o/r', modelAlias: 'deep', previousTasks: [] });
    expect(prompt).toContain('READ THE ROADMAP');
    expect(prompt).toContain('ROADMAP.md');
    expect(prompt).toContain('WORK_LOG.md');
  });

  it('includes auto-pick next task when no specific task', () => {
    const prompt = buildRunPrompt({ repo: 'o/r', modelAlias: 'deep', previousTasks: [] });
    expect(prompt).toContain('NEXT uncompleted task');
    expect(prompt).toContain('- [ ]');
  });

  it('includes specific task instructions when provided', () => {
    const prompt = buildRunPrompt({
      repo: 'o/r',
      modelAlias: 'deep',
      previousTasks: [],
      specificTask: 'Add JWT auth middleware',
    });
    expect(prompt).toContain('SPECIFIC task');
    expect(prompt).toContain('Add JWT auth middleware');
  });

  it('includes roadmap update instructions', () => {
    const prompt = buildRunPrompt({ repo: 'o/r', modelAlias: 'deep', previousTasks: [] });
    expect(prompt).toContain('UPDATE ROADMAP');
    expect(prompt).toContain('- [ ]` to `- [x]');
    expect(prompt).toContain('Append a new row');
  });

  it('includes model alias in branch naming', () => {
    const prompt = buildRunPrompt({ repo: 'o/r', modelAlias: 'grok', previousTasks: [] });
    expect(prompt).toContain('{task-slug}-grok');
  });

  it('includes previous task history when available', () => {
    const previousTasks: OrchestraTask[] = [
      {
        taskId: 'orch-1',
        timestamp: Date.now() - 3600000,
        modelAlias: 'deep',
        repo: 'o/r',
        mode: 'run',
        prompt: 'Add login page',
        branchName: 'bot/add-login-page-deep',
        prUrl: 'https://github.com/o/r/pull/1',
        status: 'completed',
        filesChanged: ['src/login.ts'],
        summary: 'Created login page component',
      },
    ];

    const prompt = buildRunPrompt({ repo: 'o/r', modelAlias: 'deep', previousTasks });
    expect(prompt).toContain('Recent Orchestra History');
    expect(prompt).toContain('Add login page');
    expect(prompt).toContain('pull/1');
  });

  it('omits history section when no previous tasks', () => {
    const prompt = buildRunPrompt({ repo: 'o/r', modelAlias: 'deep', previousTasks: [] });
    expect(prompt).not.toContain('Recent Orchestra History');
  });

  it('includes ORCHESTRA_RESULT report format', () => {
    const prompt = buildRunPrompt({ repo: 'o/r', modelAlias: 'deep', previousTasks: [] });
    expect(prompt).toContain('ORCHESTRA_RESULT:');
  });
});

// --- buildOrchestraPrompt (backward compat) ---

describe('buildOrchestraPrompt', () => {
  it('delegates to buildRunPrompt', () => {
    const params = { repo: 'o/r', modelAlias: 'deep', previousTasks: [] as OrchestraTask[] };
    expect(buildOrchestraPrompt(params)).toBe(buildRunPrompt(params));
  });
});

// --- storeOrchestraTask & loadOrchestraHistory ---

describe('storeOrchestraTask', () => {
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

  const makeTask = (taskId: string, mode: 'init' | 'run' = 'run', status: 'started' | 'completed' | 'failed' = 'completed'): OrchestraTask => ({
    taskId,
    timestamp: Date.now(),
    modelAlias: 'deep',
    repo: 'owner/repo',
    mode,
    prompt: `Task ${taskId}`,
    branchName: `bot/${taskId}-deep`,
    status,
    filesChanged: ['src/file.ts'],
    summary: `Did ${taskId}`,
  });

  it('creates new history when none exists', async () => {
    mockBucket.get.mockResolvedValue(null);

    await storeOrchestraTask(mockBucket as unknown as R2Bucket, 'user1', makeTask('t1'));

    expect(mockBucket.put).toHaveBeenCalledOnce();
    const [key, data] = mockBucket.put.mock.calls[0];
    expect(key).toBe('orchestra/user1/history.json');

    const parsed = JSON.parse(data as string);
    expect(parsed.userId).toBe('user1');
    expect(parsed.tasks).toHaveLength(1);
    expect(parsed.tasks[0].taskId).toBe('t1');
  });

  it('appends to existing history', async () => {
    const existing: OrchestraHistory = {
      userId: 'user1',
      tasks: [makeTask('t1')],
      updatedAt: Date.now(),
    };

    mockBucket.get.mockResolvedValue({
      json: () => Promise.resolve(existing),
    });

    await storeOrchestraTask(mockBucket as unknown as R2Bucket, 'user1', makeTask('t2'));

    const [, data] = mockBucket.put.mock.calls[0];
    const parsed = JSON.parse(data as string);
    expect(parsed.tasks).toHaveLength(2);
    expect(parsed.tasks[1].taskId).toBe('t2');
  });

  it('caps history at 30 entries', async () => {
    const existing: OrchestraHistory = {
      userId: 'user1',
      tasks: Array.from({ length: 30 }, (_, i) => makeTask(`t${i}`)),
      updatedAt: Date.now(),
    };

    mockBucket.get.mockResolvedValue({
      json: () => Promise.resolve(existing),
    });

    await storeOrchestraTask(mockBucket as unknown as R2Bucket, 'user1', makeTask('t30'));

    const [, data] = mockBucket.put.mock.calls[0];
    const parsed = JSON.parse(data as string);
    expect(parsed.tasks).toHaveLength(30);
    expect(parsed.tasks[29].taskId).toBe('t30');
    expect(parsed.tasks[0].taskId).toBe('t1');
  });

  it('handles R2 read error gracefully', async () => {
    mockBucket.get.mockRejectedValue(new Error('R2 error'));

    await storeOrchestraTask(mockBucket as unknown as R2Bucket, 'user1', makeTask('t1'));

    expect(mockBucket.put).toHaveBeenCalledOnce();
  });

  it('preserves mode field', async () => {
    mockBucket.get.mockResolvedValue(null);

    await storeOrchestraTask(mockBucket as unknown as R2Bucket, 'user1', makeTask('t1', 'init'));

    const [, data] = mockBucket.put.mock.calls[0];
    const parsed = JSON.parse(data as string);
    expect(parsed.tasks[0].mode).toBe('init');
  });
});

describe('loadOrchestraHistory', () => {
  it('returns null when no history exists', async () => {
    const mockBucket = { get: vi.fn().mockResolvedValue(null) };

    const result = await loadOrchestraHistory(mockBucket as unknown as R2Bucket, 'user1');
    expect(result).toBeNull();
  });

  it('returns parsed history', async () => {
    const history: OrchestraHistory = {
      userId: 'user1',
      tasks: [{
        taskId: 'orch-1',
        timestamp: Date.now(),
        modelAlias: 'deep',
        repo: 'o/r',
        mode: 'run',
        prompt: 'Add feature',
        branchName: 'bot/add-feature-deep',
        status: 'completed',
        filesChanged: ['a.ts'],
      }],
      updatedAt: Date.now(),
    };

    const mockBucket = {
      get: vi.fn().mockResolvedValue({
        json: () => Promise.resolve(history),
      }),
    };

    const result = await loadOrchestraHistory(mockBucket as unknown as R2Bucket, 'user1');
    expect(result).not.toBeNull();
    expect(result!.tasks).toHaveLength(1);
  });

  it('returns null on R2 error', async () => {
    const mockBucket = {
      get: vi.fn().mockRejectedValue(new Error('R2 down')),
    };

    const result = await loadOrchestraHistory(mockBucket as unknown as R2Bucket, 'user1');
    expect(result).toBeNull();
  });

  it('reads from correct R2 key', async () => {
    const mockBucket = { get: vi.fn().mockResolvedValue(null) };

    await loadOrchestraHistory(mockBucket as unknown as R2Bucket, '12345');

    expect(mockBucket.get).toHaveBeenCalledWith('orchestra/12345/history.json');
  });
});

// --- formatOrchestraHistory ---

describe('formatOrchestraHistory', () => {
  it('shows usage hint for null history', () => {
    const result = formatOrchestraHistory(null);
    expect(result).toContain('No orchestra tasks');
    expect(result).toContain('/orchestra init');
    expect(result).toContain('/orchestra run');
  });

  it('shows usage hint for empty history', () => {
    const result = formatOrchestraHistory({
      userId: 'user1',
      tasks: [],
      updatedAt: Date.now(),
    });
    expect(result).toContain('No orchestra tasks');
  });

  it('formats completed run task', () => {
    const history: OrchestraHistory = {
      userId: 'user1',
      tasks: [{
        taskId: 'orch-1',
        timestamp: Date.now(),
        modelAlias: 'deep',
        repo: 'owner/repo',
        mode: 'run',
        prompt: 'Add health check endpoint',
        branchName: 'bot/add-health-check-deep',
        prUrl: 'https://github.com/o/r/pull/1',
        status: 'completed',
        filesChanged: ['src/health.ts'],
        summary: 'Added /health endpoint',
      }],
      updatedAt: Date.now(),
    };

    const result = formatOrchestraHistory(history);
    expect(result).toContain('Orchestra Task History');
    expect(result).toContain('Add health check endpoint');
    expect(result).toContain('/deep');
    expect(result).toContain('bot/add-health-check-deep');
    expect(result).toContain('pull/1');
  });

  it('tags init tasks with [INIT]', () => {
    const history: OrchestraHistory = {
      userId: 'user1',
      tasks: [{
        taskId: 'orch-1',
        timestamp: Date.now(),
        modelAlias: 'deep',
        repo: 'o/r',
        mode: 'init',
        prompt: 'Build user auth system',
        branchName: 'bot/roadmap-init-deep',
        status: 'completed',
        filesChanged: ['ROADMAP.md', 'WORK_LOG.md'],
      }],
      updatedAt: Date.now(),
    };

    const result = formatOrchestraHistory(history);
    expect(result).toContain('[INIT]');
  });

  it('formats failed task with error icon', () => {
    const history: OrchestraHistory = {
      userId: 'user1',
      tasks: [{
        taskId: 'orch-1',
        timestamp: Date.now(),
        modelAlias: 'grok',
        repo: 'o/r',
        mode: 'run',
        prompt: 'Broken task',
        branchName: 'bot/broken-grok',
        status: 'failed',
        filesChanged: [],
      }],
      updatedAt: Date.now(),
    };

    const result = formatOrchestraHistory(history);
    expect(result).toContain('❌');
  });

  it('limits display to last 10 tasks', () => {
    const tasks: OrchestraTask[] = Array.from({ length: 15 }, (_, i) => ({
      taskId: `orch-${i}`,
      timestamp: Date.now() - (15 - i) * 60000,
      modelAlias: 'deep',
      repo: 'o/r',
      mode: 'run' as const,
      prompt: `Task ${i}`,
      branchName: `bot/task-${i}-deep`,
      status: 'completed' as const,
      filesChanged: [],
    }));

    const result = formatOrchestraHistory({
      userId: 'user1',
      tasks,
      updatedAt: Date.now(),
    });

    expect(result).not.toContain('Task 0');
    expect(result).not.toContain('Task 4');
    expect(result).toContain('Task 5');
    expect(result).toContain('Task 14');
  });
});
