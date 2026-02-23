/**
 * Tests for progress-formatter.ts (7B.5: Streaming User Feedback)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  humanizeToolName,
  extractToolContext,
  estimateCurrentStep,
  formatProgressMessage,
  shouldSendUpdate,
  PROGRESS_THROTTLE_MS,
  type ProgressState,
} from './progress-formatter';
import type { StructuredPlan } from './step-decomposition';

// ─── humanizeToolName ───────────────────────────────────────────────────────

describe('humanizeToolName', () => {
  it('maps github_read_file to "reading"', () => {
    expect(humanizeToolName('github_read_file')).toBe('reading');
  });

  it('maps sandbox_exec to "running commands"', () => {
    expect(humanizeToolName('sandbox_exec')).toBe('running commands');
  });

  it('maps github_create_pr to "creating PR"', () => {
    expect(humanizeToolName('github_create_pr')).toBe('creating PR');
  });

  it('maps web_search to "searching the web"', () => {
    expect(humanizeToolName('web_search')).toBe('searching the web');
  });

  it('falls back to underscores-to-spaces for unknown tools', () => {
    expect(humanizeToolName('my_custom_tool')).toBe('my custom tool');
  });

  it('maps all known tool names', () => {
    const knownTools = [
      'github_read_file', 'github_list_files', 'github_api',
      'github_create_pr', 'fetch_url', 'url_metadata',
      'browse_url', 'sandbox_exec', 'web_search',
      'generate_chart', 'get_weather', 'fetch_news',
      'convert_currency', 'get_crypto', 'geolocate_ip',
      'cloudflare_api',
    ];
    for (const tool of knownTools) {
      const label = humanizeToolName(tool);
      expect(label).not.toBe(tool); // Should be humanized, not raw name
      expect(label.includes('_')).toBe(false); // No underscores in labels
    }
  });
});

// ─── extractToolContext ─────────────────────────────────────────────────────

describe('extractToolContext', () => {
  it('extracts file path from github_read_file', () => {
    expect(extractToolContext('github_read_file', JSON.stringify({
      owner: 'foo', repo: 'bar', path: 'src/App.tsx',
    }))).toBe('src/App.tsx');
  });

  it('extracts directory path from github_list_files', () => {
    expect(extractToolContext('github_list_files', JSON.stringify({
      owner: 'foo', repo: 'bar', path: 'src/components',
    }))).toBe('src/components');
  });

  it('extracts hostname + path from fetch_url', () => {
    const result = extractToolContext('fetch_url', JSON.stringify({
      url: 'https://example.com/api/data',
    }));
    expect(result).toBe('example.com/api/data');
  });

  it('extracts hostname without trailing slash for root URLs', () => {
    const result = extractToolContext('fetch_url', JSON.stringify({
      url: 'https://example.com/',
    }));
    expect(result).toBe('example.com');
  });

  it('extracts first command from sandbox_exec', () => {
    const result = extractToolContext('sandbox_exec', JSON.stringify({
      commands: '["npm test", "npm run build"]',
    }));
    expect(result).toBe('npm test');
  });

  it('extracts PR title from github_create_pr', () => {
    expect(extractToolContext('github_create_pr', JSON.stringify({
      owner: 'foo', repo: 'bar', title: 'Add dark mode', branch: 'feat/dark',
      changes: '[]',
    }))).toBe('Add dark mode');
  });

  it('extracts endpoint from github_api', () => {
    expect(extractToolContext('github_api', JSON.stringify({
      endpoint: '/repos/foo/bar/issues', method: 'GET',
    }))).toBe('/repos/foo/bar/issues');
  });

  it('extracts query from web_search', () => {
    expect(extractToolContext('web_search', JSON.stringify({
      query: 'react server components',
    }))).toBe('react server components');
  });

  it('returns null for unknown tools', () => {
    expect(extractToolContext('unknown_tool', JSON.stringify({ data: 'value' }))).toBeNull();
  });

  it('returns null for invalid JSON', () => {
    expect(extractToolContext('github_read_file', 'not json')).toBeNull();
  });

  it('returns null when expected field is missing', () => {
    expect(extractToolContext('github_read_file', JSON.stringify({
      owner: 'foo', repo: 'bar',
    }))).toBeNull();
  });

  it('truncates long file paths', () => {
    const longPath = 'src/components/deeply/nested/directory/structure/MyComponent.tsx';
    const result = extractToolContext('github_read_file', JSON.stringify({
      owner: 'foo', repo: 'bar', path: longPath,
    }));
    expect(result!.length).toBeLessThanOrEqual(40);
    expect(result!.endsWith('…')).toBe(true);
  });

  it('truncates long URLs', () => {
    const result = extractToolContext('fetch_url', JSON.stringify({
      url: 'https://api.example.com/very/long/path/that/exceeds/the/maximum/display/length',
    }));
    expect(result!.length).toBeLessThanOrEqual(40);
  });

  it('extracts action from cloudflare_api', () => {
    expect(extractToolContext('cloudflare_api', JSON.stringify({
      action: 'search', query: 'workers routes',
    }))).toBe('workers routes');
  });

  it('handles sandbox_exec with non-JSON commands gracefully', () => {
    const result = extractToolContext('sandbox_exec', JSON.stringify({
      commands: 'not a json array',
    }));
    expect(result).toBeNull();
  });
});

// ─── estimateCurrentStep ────────────────────────────────────────────────────

describe('estimateCurrentStep', () => {
  const plan: StructuredPlan = {
    steps: [
      { action: 'read', files: ['src/auth.ts'], description: 'Read auth module' },
      { action: 'edit', files: ['src/auth.ts'], description: 'Add JWT validation' },
      { action: 'create', files: ['src/auth.test.ts'], description: 'Write tests' },
      { action: 'run', files: [], description: 'Run tests' },
    ],
  };

  it('returns 1 for first work iteration', () => {
    expect(estimateCurrentStep(plan, [], 0, 1)).toBe(1);
  });

  it('returns 0 for empty plan', () => {
    expect(estimateCurrentStep({ steps: [] }, [], 0, 1)).toBe(0);
  });

  it('never exceeds total steps', () => {
    expect(estimateCurrentStep(plan, ['a', 'b', 'c', 'd', 'e'], 0, 100)).toBeLessThanOrEqual(4);
  });

  it('progresses through steps as iterations advance', () => {
    const step1 = estimateCurrentStep(plan, ['a'], 0, 1);
    const step3 = estimateCurrentStep(plan, ['a', 'b', 'c'], 0, 3);
    expect(step3).toBeGreaterThanOrEqual(step1);
  });
});

// ─── formatProgressMessage ──────────────────────────────────────────────────

describe('formatProgressMessage', () => {
  const baseTime = 1700000000000;

  function makeState(overrides: Partial<ProgressState> = {}): ProgressState {
    return {
      phase: 'work',
      iterations: 3,
      toolsUsed: ['github_read_file', 'github_list_files'],
      startTime: baseTime,
      currentTool: null,
      currentToolContext: null,
      structuredPlan: null,
      workPhaseStartIteration: 1,
      coveRetrying: false,
      ...overrides,
    };
  }

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(baseTime + 45000); // 45 seconds elapsed
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows phase label when no tool is active', () => {
    const msg = formatProgressMessage(makeState({ phase: 'work' }));
    expect(msg).toContain('🔨');
    expect(msg).toContain('Working');
    expect(msg).toContain('45s');
  });

  it('shows planning phase correctly', () => {
    const msg = formatProgressMessage(makeState({ phase: 'plan' }));
    expect(msg).toContain('📋');
    expect(msg).toContain('Planning');
  });

  it('shows review phase correctly', () => {
    const msg = formatProgressMessage(makeState({ phase: 'review' }));
    expect(msg).toContain('🔍');
    expect(msg).toContain('Reviewing');
  });

  it('shows current tool when one is active', () => {
    const msg = formatProgressMessage(makeState({
      currentTool: 'github_read_file',
      currentToolContext: 'src/App.tsx',
    }));
    expect(msg).toContain('Reading');
    expect(msg).toContain('src/App.tsx');
    expect(msg).toContain('45s');
  });

  it('shows tool label without context', () => {
    const msg = formatProgressMessage(makeState({
      currentTool: 'sandbox_exec',
    }));
    expect(msg).toContain('Running commands');
    expect(msg).toContain('…');
  });

  it('shows CoVe verification override', () => {
    const msg = formatProgressMessage(makeState({
      coveRetrying: true,
      phase: 'work',
    }));
    expect(msg).toContain('🔄');
    expect(msg).toContain('Verifying');
  });

  it('shows step progress when structured plan is available', () => {
    const plan: StructuredPlan = {
      steps: [
        { action: 'read', files: [], description: 'Read auth module' },
        { action: 'edit', files: [], description: 'Add JWT validation' },
        { action: 'run', files: [], description: 'Run tests' },
      ],
    };
    const msg = formatProgressMessage(makeState({
      structuredPlan: plan,
      iterations: 3,
      workPhaseStartIteration: 1,
    }));
    expect(msg).toMatch(/step \d\/3/);
  });

  it('does not show step info in review phase', () => {
    const plan: StructuredPlan = {
      steps: [
        { action: 'read', files: [], description: 'Read auth' },
      ],
    };
    const msg = formatProgressMessage(makeState({
      phase: 'review',
      structuredPlan: plan,
    }));
    expect(msg).not.toContain('step');
  });

  it('includes iteration and tool count', () => {
    const msg = formatProgressMessage(makeState({ iterations: 5 }));
    expect(msg).toContain('iter 5');
    expect(msg).toContain('2 tools');
  });

  it('formats elapsed time as minutes when >60s', () => {
    vi.setSystemTime(baseTime + 125000); // 2m5s
    const msg = formatProgressMessage(makeState());
    expect(msg).toContain('2m5s');
  });

  it('formats elapsed time as just minutes when even', () => {
    vi.setSystemTime(baseTime + 120000); // exactly 2m
    const msg = formatProgressMessage(makeState());
    expect(msg).toContain('2m');
    expect(msg).not.toContain('2m0s');
  });

  it('starts with ⏳ emoji', () => {
    const msg = formatProgressMessage(makeState());
    expect(msg.startsWith('⏳')).toBe(true);
  });

  it('truncates long step descriptions', () => {
    const plan: StructuredPlan = {
      steps: [
        { action: 'edit', files: [], description: 'Implement a very long complex feature that requires many changes across the codebase' },
      ],
    };
    const msg = formatProgressMessage(makeState({
      structuredPlan: plan,
      iterations: 2,
      workPhaseStartIteration: 1,
    }));
    // Description should be truncated with ellipsis
    expect(msg.length).toBeLessThan(200);
  });
});

// ─── shouldSendUpdate ───────────────────────────────────────────────────────

describe('shouldSendUpdate', () => {
  it('returns true when enough time has passed', () => {
    const now = 100000;
    const lastUpdate = now - PROGRESS_THROTTLE_MS - 1;
    expect(shouldSendUpdate(lastUpdate, now)).toBe(true);
  });

  it('returns false when not enough time has passed', () => {
    const now = 100000;
    const lastUpdate = now - 5000; // only 5s ago
    expect(shouldSendUpdate(lastUpdate, now)).toBe(false);
  });

  it('returns true at exactly the threshold', () => {
    const now = 100000;
    const lastUpdate = now - PROGRESS_THROTTLE_MS;
    expect(shouldSendUpdate(lastUpdate, now)).toBe(true);
  });

  it('returns true for initial update (lastUpdate=0)', () => {
    expect(shouldSendUpdate(0, Date.now())).toBe(true);
  });

  it('supports custom throttle interval', () => {
    const now = 100000;
    expect(shouldSendUpdate(now - 3000, now, 5000)).toBe(false);
    expect(shouldSendUpdate(now - 6000, now, 5000)).toBe(true);
  });

  it('exports throttle constant as 15 seconds', () => {
    expect(PROGRESS_THROTTLE_MS).toBe(15000);
  });
});
