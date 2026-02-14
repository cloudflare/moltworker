/**
 * Tests for Orchestra Mode (init/run two-mode design)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  buildInitPrompt,
  buildRunPrompt,
  buildRedoPrompt,
  buildOrchestraPrompt,
  parseOrchestraCommand,
  parseOrchestraResult,
  generateTaskSlug,
  loadOrchestraHistory,
  storeOrchestraTask,
  formatOrchestraHistory,
  parseRoadmapPhases,
  formatRoadmapStatus,
  findMatchingTasks,
  resetRoadmapTasks,
  LARGE_FILE_THRESHOLD_LINES,
  LARGE_FILE_THRESHOLD_KB,
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

// --- Large file health check constants ---

describe('LARGE_FILE_THRESHOLD constants', () => {
  it('exports line threshold', () => {
    expect(LARGE_FILE_THRESHOLD_LINES).toBe(300);
  });

  it('exports KB threshold', () => {
    expect(LARGE_FILE_THRESHOLD_KB).toBe(15);
  });
});

// --- Repo health check in prompts ---

describe('repo health check in buildRunPrompt', () => {
  it('includes health check step', () => {
    const prompt = buildRunPrompt({ repo: 'o/r', modelAlias: 'deep', previousTasks: [] });
    expect(prompt).toContain('REPO HEALTH CHECK');
    expect(prompt).toContain('Large File Detection');
  });

  it('references the line threshold', () => {
    const prompt = buildRunPrompt({ repo: 'o/r', modelAlias: 'deep', previousTasks: [] });
    expect(prompt).toContain(`${LARGE_FILE_THRESHOLD_LINES} lines`);
  });

  it('references the KB threshold', () => {
    const prompt = buildRunPrompt({ repo: 'o/r', modelAlias: 'deep', previousTasks: [] });
    expect(prompt).toContain(`${LARGE_FILE_THRESHOLD_KB}KB`);
  });

  it('instructs to STOP and split large files', () => {
    const prompt = buildRunPrompt({ repo: 'o/r', modelAlias: 'deep', previousTasks: [] });
    expect(prompt).toContain('STOP');
    expect(prompt).toContain('FILE SPLITTING task');
    expect(prompt).toContain('pure refactor');
  });

  it('instructs to defer original task when splitting', () => {
    const prompt = buildRunPrompt({ repo: 'o/r', modelAlias: 'deep', previousTasks: [] });
    expect(prompt).toContain('Original task deferred to next run');
  });

  it('exempts config and generated files', () => {
    const prompt = buildRunPrompt({ repo: 'o/r', modelAlias: 'deep', previousTasks: [] });
    expect(prompt).toContain('Config files, generated files, and lock files are exempt');
  });

  it('health check comes between Step 3 and Step 4', () => {
    const prompt = buildRunPrompt({ repo: 'o/r', modelAlias: 'deep', previousTasks: [] });
    const step3Idx = prompt.indexOf('## Step 3: UNDERSTAND THE CODEBASE');
    const healthIdx = prompt.indexOf('## Step 3.5: REPO HEALTH CHECK');
    const step4Idx = prompt.indexOf('## Step 4: IMPLEMENT');
    expect(step3Idx).toBeLessThan(healthIdx);
    expect(healthIdx).toBeLessThan(step4Idx);
  });
});

describe('repo health check in buildInitPrompt', () => {
  it('includes large file flagging step', () => {
    const prompt = buildInitPrompt({ repo: 'o/r', modelAlias: 'deep' });
    expect(prompt).toContain('FLAG LARGE FILES');
  });

  it('references the line threshold', () => {
    const prompt = buildInitPrompt({ repo: 'o/r', modelAlias: 'deep' });
    expect(prompt).toContain(`${LARGE_FILE_THRESHOLD_LINES} lines`);
  });

  it('instructs to add split tasks to roadmap', () => {
    const prompt = buildInitPrompt({ repo: 'o/r', modelAlias: 'deep' });
    expect(prompt).toContain('Split');
    expect(prompt).toContain('Refactor');
    expect(prompt).toContain('MUST depend on the split task');
  });

  it('large file step comes before analysis step', () => {
    const prompt = buildInitPrompt({ repo: 'o/r', modelAlias: 'deep' });
    const flagIdx = prompt.indexOf('### Step 1.5: FLAG LARGE FILES');
    const analyzeIdx = prompt.indexOf('### Step 2: ANALYZE THE PROJECT REQUEST');
    expect(flagIdx).toBeLessThan(analyzeIdx);
  });
});

describe('repo health check in buildRedoPrompt', () => {
  it('includes health check step', () => {
    const prompt = buildRedoPrompt({
      repo: 'o/r',
      modelAlias: 'deep',
      previousTasks: [],
      taskToRedo: 'fix auth',
    });
    expect(prompt).toContain('REPO HEALTH CHECK');
  });

  it('references the line threshold', () => {
    const prompt = buildRedoPrompt({
      repo: 'o/r',
      modelAlias: 'deep',
      previousTasks: [],
      taskToRedo: 'fix auth',
    });
    expect(prompt).toContain(`${LARGE_FILE_THRESHOLD_LINES} lines`);
  });

  it('health check comes between Step 2 and Step 3', () => {
    const prompt = buildRedoPrompt({
      repo: 'o/r',
      modelAlias: 'deep',
      previousTasks: [],
      taskToRedo: 'fix auth',
    });
    const step2Idx = prompt.indexOf('## Step 2: UNDERSTAND CURRENT STATE');
    const healthIdx = prompt.indexOf('## Step 2.5: REPO HEALTH CHECK');
    const step3Idx = prompt.indexOf('## Step 3: RE-IMPLEMENT');
    expect(step2Idx).toBeLessThan(healthIdx);
    expect(healthIdx).toBeLessThan(step3Idx);
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

// --- parseRoadmapPhases ---

describe('parseRoadmapPhases', () => {
  const sampleRoadmap = `# Project Roadmap

> Auto-generated by Orchestra Mode

## Phases

### Phase 1: Foundation
- [x] **Task 1.1**: Set up project structure
  - Description: Initialize the repo
- [ ] **Task 1.2**: Add CI pipeline
  - Description: GitHub Actions workflow

### Phase 2: Core Features
- [ ] **Task 2.1**: Add user authentication
  - Files: src/auth.ts
- [ ] **Task 2.2**: Add database models
  - Files: src/models/

## Notes
Some notes here.`;

  it('parses phases with correct names', () => {
    const phases = parseRoadmapPhases(sampleRoadmap);
    expect(phases).toHaveLength(2);
    expect(phases[0].name).toBe('Foundation');
    expect(phases[1].name).toBe('Core Features');
  });

  it('parses task completion status', () => {
    const phases = parseRoadmapPhases(sampleRoadmap);
    expect(phases[0].tasks).toHaveLength(2);
    expect(phases[0].tasks[0].done).toBe(true);
    expect(phases[0].tasks[1].done).toBe(false);
  });

  it('extracts task titles', () => {
    const phases = parseRoadmapPhases(sampleRoadmap);
    expect(phases[0].tasks[0].title).toBe('Set up project structure');
    expect(phases[1].tasks[0].title).toBe('Add user authentication');
  });

  it('handles tasks without bold formatting', () => {
    const content = `### Phase 1: Setup
- [x] Install dependencies
- [ ] Configure linter`;

    const phases = parseRoadmapPhases(content);
    expect(phases).toHaveLength(1);
    expect(phases[0].tasks).toHaveLength(2);
    expect(phases[0].tasks[0].title).toBe('Install dependencies');
    expect(phases[0].tasks[0].done).toBe(true);
    expect(phases[0].tasks[1].title).toBe('Configure linter');
  });

  it('handles uppercase X checkmarks', () => {
    const content = `### Phase 1: Done
- [X] Task with uppercase X`;

    const phases = parseRoadmapPhases(content);
    expect(phases[0].tasks[0].done).toBe(true);
  });

  it('returns empty array for content without phases', () => {
    const phases = parseRoadmapPhases('Just some text without any phases');
    expect(phases).toHaveLength(0);
  });

  it('handles phase headers without "Phase N:" prefix', () => {
    const content = `### Setup and Init
- [ ] Do something

### Testing
- [x] Write tests`;

    const phases = parseRoadmapPhases(content);
    expect(phases).toHaveLength(2);
    expect(phases[0].name).toBe('Setup and Init');
    expect(phases[1].name).toBe('Testing');
  });

  it('ignores tasks outside of phases', () => {
    const content = `# Roadmap
- [ ] Orphan task

### Phase 1: Real
- [ ] Real task`;

    const phases = parseRoadmapPhases(content);
    expect(phases).toHaveLength(1);
    expect(phases[0].tasks).toHaveLength(1);
    expect(phases[0].tasks[0].title).toBe('Real task');
  });
});

// --- formatRoadmapStatus ---

describe('formatRoadmapStatus', () => {
  it('shows progress for structured roadmap', () => {
    const content = `### Phase 1: Setup
- [x] **Task 1.1**: Init project
- [x] **Task 1.2**: Add CI

### Phase 2: Features
- [ ] **Task 2.1**: Add auth
- [ ] **Task 2.2**: Add API`;

    const result = formatRoadmapStatus(content, 'owner/repo', 'ROADMAP.md');
    expect(result).toContain('owner/repo');
    expect(result).toContain('ROADMAP.md');
    expect(result).toContain('Setup');
    expect(result).toContain('Features');
    expect(result).toContain('2/4');  // overall progress
    expect(result).toContain('50%');
  });

  it('shows completed phase with check icon', () => {
    const content = `### Phase 1: Done
- [x] Task A
- [x] Task B`;

    const result = formatRoadmapStatus(content, 'o/r', 'ROADMAP.md');
    expect(result).toContain('✅ Done (2/2)');
  });

  it('shows in-progress phase with hammer icon', () => {
    const content = `### Phase 1: WIP
- [x] Done task
- [ ] Pending task`;

    const result = formatRoadmapStatus(content, 'o/r', 'ROADMAP.md');
    expect(result).toContain('🔨 WIP (1/2)');
  });

  it('shows pending phase with hourglass icon', () => {
    const content = `### Phase 1: Not Started
- [ ] Task A
- [ ] Task B`;

    const result = formatRoadmapStatus(content, 'o/r', 'ROADMAP.md');
    expect(result).toContain('⏳ Not Started (0/2)');
  });

  it('falls back to raw content when no phases found', () => {
    const content = 'Just a simple TODO list without phases.';
    const result = formatRoadmapStatus(content, 'o/r', 'ROADMAP.md');
    expect(result).toContain('Just a simple TODO list');
    expect(result).toContain('o/r');
  });

  it('shows progress bar', () => {
    const content = `### Phase 1: Half
- [x] A
- [ ] B`;

    const result = formatRoadmapStatus(content, 'o/r', 'ROADMAP.md');
    expect(result).toContain('█');
    expect(result).toContain('░');
  });

  it('truncates raw content fallback if too long', () => {
    const content = 'A'.repeat(4000);
    const result = formatRoadmapStatus(content, 'o/r', 'ROADMAP.md');
    expect(result).toContain('[Truncated]');
    expect(result.length).toBeLessThan(4000);
  });
});

// --- findMatchingTasks ---

describe('findMatchingTasks', () => {
  const roadmap = `### Phase 1: Setup
- [x] **Task 1.1**: Initialize project structure
- [x] **Task 1.2**: Add CI pipeline

### Phase 2: Core
- [ ] **Task 2.1**: Add user authentication
- [x] **Task 2.2**: Add database models
- [ ] **Task 2.3**: Add API endpoints`;

  it('finds tasks by title substring', () => {
    const matches = findMatchingTasks(roadmap, 'auth');
    expect(matches).toHaveLength(1);
    expect(matches[0].title).toBe('Add user authentication');
    expect(matches[0].done).toBe(false);
    expect(matches[0].phase).toBe('Core');
  });

  it('finds tasks case-insensitively', () => {
    const matches = findMatchingTasks(roadmap, 'DATABASE');
    expect(matches).toHaveLength(1);
    expect(matches[0].title).toBe('Add database models');
  });

  it('finds all tasks in a phase', () => {
    const matches = findMatchingTasks(roadmap, 'Phase 2');
    expect(matches).toHaveLength(3);
    expect(matches[0].title).toBe('Add user authentication');
    expect(matches[1].title).toBe('Add database models');
    expect(matches[2].title).toBe('Add API endpoints');
  });

  it('returns empty array for no matches', () => {
    const matches = findMatchingTasks(roadmap, 'nonexistent');
    expect(matches).toHaveLength(0);
  });

  it('matches task number in line', () => {
    const matches = findMatchingTasks(roadmap, 'Task 1.1');
    expect(matches).toHaveLength(1);
    expect(matches[0].title).toBe('Initialize project structure');
  });

  it('includes done status', () => {
    const matches = findMatchingTasks(roadmap, 'Phase 1');
    expect(matches).toHaveLength(2);
    expect(matches[0].done).toBe(true);
    expect(matches[1].done).toBe(true);
  });

  it('tracks correct phase names', () => {
    const matches = findMatchingTasks(roadmap, 'API');
    expect(matches).toHaveLength(1);
    expect(matches[0].phase).toBe('Core');
  });
});

// --- resetRoadmapTasks ---

describe('resetRoadmapTasks', () => {
  const roadmap = `### Phase 1: Setup
- [x] **Task 1.1**: Initialize project
- [x] **Task 1.2**: Add CI

### Phase 2: Core
- [ ] **Task 2.1**: Add auth
- [x] **Task 2.2**: Add database`;

  it('resets matching completed tasks', () => {
    const result = resetRoadmapTasks(roadmap, 'Initialize');
    expect(result.resetCount).toBe(1);
    expect(result.taskNames).toEqual(['Initialize project']);
    expect(result.modified).toContain('- [ ] **Task 1.1**: Initialize project');
  });

  it('resets all completed tasks in a phase', () => {
    const result = resetRoadmapTasks(roadmap, 'Phase 1');
    expect(result.resetCount).toBe(2);
    expect(result.taskNames).toContain('Initialize project');
    expect(result.taskNames).toContain('Add CI');
    expect(result.modified).toContain('- [ ] **Task 1.1**: Initialize project');
    expect(result.modified).toContain('- [ ] **Task 1.2**: Add CI');
  });

  it('does not reset already-pending tasks', () => {
    const result = resetRoadmapTasks(roadmap, 'auth');
    expect(result.resetCount).toBe(0);
    expect(result.taskNames).toHaveLength(0);
    expect(result.modified).toBe(roadmap);
  });

  it('preserves other lines unchanged', () => {
    const result = resetRoadmapTasks(roadmap, 'database');
    expect(result.resetCount).toBe(1);
    // Check that Phase 1 tasks are still checked
    expect(result.modified).toContain('- [x] **Task 1.1**: Initialize project');
    expect(result.modified).toContain('- [x] **Task 1.2**: Add CI');
    // Database is unchecked
    expect(result.modified).toContain('- [ ] **Task 2.2**: Add database');
  });

  it('returns zero count for no matches', () => {
    const result = resetRoadmapTasks(roadmap, 'nonexistent');
    expect(result.resetCount).toBe(0);
    expect(result.modified).toBe(roadmap);
  });
});

// --- buildRedoPrompt ---

describe('buildRedoPrompt', () => {
  it('includes redo-specific instructions', () => {
    const prompt = buildRedoPrompt({
      repo: 'owner/repo',
      modelAlias: 'deep',
      previousTasks: [],
      taskToRedo: 'Add user auth',
    });
    expect(prompt).toContain('REDO Mode');
    expect(prompt).toContain('Add user auth');
    expect(prompt).toContain('RE-DOING');
    expect(prompt).toContain('INCORRECT or INCOMPLETE');
  });

  it('includes repo info', () => {
    const prompt = buildRedoPrompt({
      repo: 'owner/repo',
      modelAlias: 'deep',
      previousTasks: [],
      taskToRedo: 'fix something',
    });
    expect(prompt).toContain('Owner: owner');
    expect(prompt).toContain('Repo: repo');
  });

  it('includes model alias in branch and PR naming', () => {
    const prompt = buildRedoPrompt({
      repo: 'o/r',
      modelAlias: 'grok',
      previousTasks: [],
      taskToRedo: 'test task',
    });
    expect(prompt).toContain('redo-{task-slug}-grok');
    expect(prompt).toContain('[grok]');
  });

  it('includes ORCHESTRA_RESULT format', () => {
    const prompt = buildRedoPrompt({
      repo: 'o/r',
      modelAlias: 'deep',
      previousTasks: [],
      taskToRedo: 'task',
    });
    expect(prompt).toContain('ORCHESTRA_RESULT:');
  });

  it('includes previous task history with redo warning', () => {
    const previousTasks: OrchestraTask[] = [{
      taskId: 'orch-1',
      timestamp: Date.now(),
      modelAlias: 'deep',
      repo: 'o/r',
      mode: 'run',
      prompt: 'Add auth',
      branchName: 'bot/add-auth-deep',
      status: 'completed',
      filesChanged: ['src/auth.ts'],
      summary: 'Added auth (broken)',
    }];

    const prompt = buildRedoPrompt({
      repo: 'o/r',
      modelAlias: 'deep',
      previousTasks,
      taskToRedo: 'Add auth',
    });
    expect(prompt).toContain('Recent Orchestra History');
    expect(prompt).toContain('Do NOT repeat the same mistakes');
  });

  it('instructs model to uncheck task in roadmap', () => {
    const prompt = buildRedoPrompt({
      repo: 'o/r',
      modelAlias: 'deep',
      previousTasks: [],
      taskToRedo: 'something',
    });
    expect(prompt).toContain('- [x]');
    expect(prompt).toContain('- [ ]');
    expect(prompt).toContain('change it back');
  });
});

// --- Model alias in PR/commit messages ---

describe('model alias in prompts', () => {
  it('init prompt includes model in PR title', () => {
    const prompt = buildInitPrompt({ repo: 'o/r', modelAlias: 'grok' });
    expect(prompt).toContain('[grok]');
    expect(prompt).toContain('Generated by: grok');
  });

  it('run prompt includes model in PR title', () => {
    const prompt = buildRunPrompt({ repo: 'o/r', modelAlias: 'deep', previousTasks: [] });
    expect(prompt).toContain('[deep]');
    expect(prompt).toContain('Generated by: deep');
  });

  it('redo prompt includes model in PR title', () => {
    const prompt = buildRedoPrompt({ repo: 'o/r', modelAlias: 'sonnet', previousTasks: [], taskToRedo: 'x' });
    expect(prompt).toContain('[sonnet]');
    expect(prompt).toContain('Generated by: sonnet');
  });
});
