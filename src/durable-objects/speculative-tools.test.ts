/**
 * Tests for speculative-tools.ts (7B.1: Speculative Tool Execution)
 */

import { describe, it, expect, vi } from 'vitest';
import {
  createSpeculativeExecutor,
  MAX_SPECULATIVE_TOOLS,
  SPECULATIVE_TIMEOUT_MS,
  type ToolResult,
} from './speculative-tools';
import type { ToolCall } from '../openrouter/tools';

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeToolCall(id: string, name: string, args = '{}'): ToolCall {
  return {
    id,
    type: 'function',
    function: { name, arguments: args },
  };
}

function makeExecutor(delay = 0, result = 'ok'): (tc: ToolCall) => Promise<ToolResult> {
  return async (tc) => {
    if (delay > 0) await new Promise(r => setTimeout(r, delay));
    return { tool_call_id: tc.id, content: result };
  };
}

const alwaysSafe = () => true;
const neverSafe = () => false;

// ─── createSpeculativeExecutor ──────────────────────────────────────────────

describe('createSpeculativeExecutor', () => {
  it('starts safe tools immediately on onToolCallReady', () => {
    const executeFn = vi.fn(makeExecutor());
    const spec = createSpeculativeExecutor(alwaysSafe, executeFn);

    const tc = makeToolCall('call_1', 'github_read_file');
    spec.onToolCallReady(tc);

    expect(executeFn).toHaveBeenCalledOnce();
    expect(executeFn).toHaveBeenCalledWith(tc);
    expect(spec.startedCount()).toBe(1);
  });

  it('does not start unsafe tools', () => {
    const executeFn = vi.fn(makeExecutor());
    const spec = createSpeculativeExecutor(neverSafe, executeFn);

    spec.onToolCallReady(makeToolCall('call_1', 'sandbox_exec'));

    expect(executeFn).not.toHaveBeenCalled();
    expect(spec.startedCount()).toBe(0);
  });

  it('returns speculative result by tool_call_id', async () => {
    const spec = createSpeculativeExecutor(alwaysSafe, makeExecutor(0, 'file contents'));

    spec.onToolCallReady(makeToolCall('call_1', 'github_read_file'));

    const result = spec.getResult('call_1');
    expect(result).toBeDefined();
    const resolved = await result!;
    expect(resolved.content).toBe('file contents');
    expect(resolved.tool_call_id).toBe('call_1');
  });

  it('returns undefined for tool_call_ids not started', () => {
    const spec = createSpeculativeExecutor(alwaysSafe, makeExecutor());

    expect(spec.getResult('nonexistent')).toBeUndefined();
  });

  it('handles multiple tool calls', async () => {
    const spec = createSpeculativeExecutor(alwaysSafe, makeExecutor(0, 'result'));

    spec.onToolCallReady(makeToolCall('call_1', 'github_read_file'));
    spec.onToolCallReady(makeToolCall('call_2', 'fetch_url'));
    spec.onToolCallReady(makeToolCall('call_3', 'get_weather'));

    expect(spec.startedCount()).toBe(3);

    const r1 = await spec.getResult('call_1')!;
    const r2 = await spec.getResult('call_2')!;
    const r3 = await spec.getResult('call_3')!;
    expect(r1.tool_call_id).toBe('call_1');
    expect(r2.tool_call_id).toBe('call_2');
    expect(r3.tool_call_id).toBe('call_3');
  });

  it('does not start duplicate tool calls', () => {
    const executeFn = vi.fn(makeExecutor());
    const spec = createSpeculativeExecutor(alwaysSafe, executeFn);

    const tc = makeToolCall('call_1', 'github_read_file');
    spec.onToolCallReady(tc);
    spec.onToolCallReady(tc); // duplicate

    expect(executeFn).toHaveBeenCalledOnce();
    expect(spec.startedCount()).toBe(1);
  });

  it('respects MAX_SPECULATIVE_TOOLS limit', () => {
    const executeFn = vi.fn(makeExecutor());
    const spec = createSpeculativeExecutor(alwaysSafe, executeFn);

    for (let i = 0; i < MAX_SPECULATIVE_TOOLS + 3; i++) {
      spec.onToolCallReady(makeToolCall(`call_${i}`, 'fetch_url'));
    }

    expect(executeFn).toHaveBeenCalledTimes(MAX_SPECULATIVE_TOOLS);
    expect(spec.startedCount()).toBe(MAX_SPECULATIVE_TOOLS);
  });

  it('handles tool execution failure gracefully', async () => {
    const failExecutor = async (tc: ToolCall): Promise<ToolResult> => {
      throw new Error('Network timeout');
    };
    const spec = createSpeculativeExecutor(alwaysSafe, failExecutor);

    spec.onToolCallReady(makeToolCall('call_1', 'github_read_file'));

    const result = await spec.getResult('call_1')!;
    expect(result.content).toContain('Error: Network timeout');
    expect(result.tool_call_id).toBe('call_1');
  });

  it('tracks completed count', async () => {
    const spec = createSpeculativeExecutor(alwaysSafe, makeExecutor());

    spec.onToolCallReady(makeToolCall('call_1', 'github_read_file'));
    spec.onToolCallReady(makeToolCall('call_2', 'fetch_url'));

    // Wait for both to complete
    await spec.getResult('call_1');
    await spec.getResult('call_2');

    expect(spec.completedCount()).toBe(2);
  });

  it('uses custom safety checker', () => {
    const executeFn = vi.fn(makeExecutor());
    const onlyReadFile = (tc: ToolCall) => tc.function.name === 'github_read_file';
    const spec = createSpeculativeExecutor(onlyReadFile, executeFn);

    spec.onToolCallReady(makeToolCall('call_1', 'github_read_file'));
    spec.onToolCallReady(makeToolCall('call_2', 'sandbox_exec'));
    spec.onToolCallReady(makeToolCall('call_3', 'github_read_file'));

    expect(executeFn).toHaveBeenCalledTimes(2);
    expect(spec.startedCount()).toBe(2);
  });

  it('exports timeout constant', () => {
    expect(SPECULATIVE_TIMEOUT_MS).toBe(30000);
  });

  it('exports max tools constant', () => {
    expect(MAX_SPECULATIVE_TOOLS).toBe(5);
  });
});
