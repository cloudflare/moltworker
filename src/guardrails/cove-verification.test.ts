import { describe, it, expect } from 'vitest';
import {
  shouldVerify,
  verifyWorkPhase,
  formatVerificationFailures,
  type VerificationResult,
  type VerificationFailure,
} from './cove-verification';
import type { ChatMessage } from '../openrouter/client';

// ─── shouldVerify ───────────────────────────────────────────────────────────

describe('shouldVerify', () => {
  it('returns true for coding tasks with mutation tools', () => {
    expect(shouldVerify(['github_read_file', 'github_api'], 'coding')).toBe(true);
    expect(shouldVerify(['github_create_pr'], 'coding')).toBe(true);
    expect(shouldVerify(['sandbox_exec'], 'coding')).toBe(true);
  });

  it('returns false for non-coding tasks', () => {
    expect(shouldVerify(['github_api'], 'general')).toBe(false);
    expect(shouldVerify(['github_api'], 'reasoning')).toBe(false);
  });

  it('returns false for coding tasks without mutation tools', () => {
    expect(shouldVerify(['github_read_file', 'github_list_files'], 'coding')).toBe(false);
    expect(shouldVerify(['fetch_url', 'web_search'], 'coding')).toBe(false);
  });

  it('returns false for empty tools', () => {
    expect(shouldVerify([], 'coding')).toBe(false);
  });
});

// ─── verifyWorkPhase ────────────────────────────────────────────────────────

// Helper to build conversation messages with tool calls and results
function assistantWithTools(content: string | null, toolCalls: Array<{ id: string; name: string; args: string }>): ChatMessage {
  return {
    role: 'assistant',
    content,
    tool_calls: toolCalls.map(tc => ({
      id: tc.id,
      type: 'function' as const,
      function: { name: tc.name, arguments: tc.args },
    })),
  };
}

function toolResult(callId: string, content: string): ChatMessage {
  return { role: 'tool', content, tool_call_id: callId };
}

describe('verifyWorkPhase', () => {
  describe('mutation tool errors', () => {
    it('detects github_api error not acknowledged in response', () => {
      const messages: ChatMessage[] = [
        assistantWithTools(null, [{ id: 'tc1', name: 'github_api', args: '{"method":"POST"}' }]),
        toolResult('tc1', 'Error: 422 Unprocessable Entity - Validation failed'),
      ];

      const result = verifyWorkPhase(messages, 'I have successfully updated the file.');
      expect(result.passed).toBe(false);
      expect(result.failures).toHaveLength(1);
      expect(result.failures[0].type).toBe('mutation_error');
      expect(result.failures[0].tool).toBe('github_api');
    });

    it('passes when model acknowledges the error', () => {
      const messages: ChatMessage[] = [
        assistantWithTools(null, [{ id: 'tc1', name: 'github_api', args: '{"method":"POST"}' }]),
        toolResult('tc1', 'Error: 422 Unprocessable Entity'),
      ];

      const result = verifyWorkPhase(messages, 'The API returned an error, so I will retry with a different approach.');
      expect(result.passed).toBe(true);
    });

    it('detects github_create_pr error', () => {
      const messages: ChatMessage[] = [
        assistantWithTools(null, [{ id: 'tc1', name: 'github_create_pr', args: '{}' }]),
        toolResult('tc1', 'Error: 422 - branch already exists'),
      ];

      const result = verifyWorkPhase(messages, 'PR created successfully!');
      expect(result.passed).toBe(false);
      expect(result.failures.some(f => f.type === 'mutation_error')).toBe(true);
      expect(result.failures.some(f => f.type === 'pr_not_created')).toBe(true);
    });

    it('passes when mutation tools succeed', () => {
      const messages: ChatMessage[] = [
        assistantWithTools(null, [{ id: 'tc1', name: 'github_api', args: '{"method":"POST"}' }]),
        toolResult('tc1', '{"sha":"abc123","content":{"name":"file.ts"}}'),
      ];

      const result = verifyWorkPhase(messages, 'File updated successfully.');
      expect(result.passed).toBe(true);
    });
  });

  describe('test failures', () => {
    it('detects FAILED in sandbox_exec output', () => {
      const messages: ChatMessage[] = [
        assistantWithTools(null, [{ id: 'tc1', name: 'sandbox_exec', args: '{"command":"npm test"}' }]),
        toolResult('tc1', 'Tests: 3 FAILED, 10 passed\nTest Suites: 1 failed'),
      ];

      const result = verifyWorkPhase(messages, 'All tests pass and the implementation is complete.');
      expect(result.passed).toBe(false);
      expect(result.failures.some(f => f.type === 'test_failure')).toBe(true);
    });

    it('detects npm ERR! in sandbox output', () => {
      const messages: ChatMessage[] = [
        assistantWithTools(null, [{ id: 'tc1', name: 'sandbox_exec', args: '{"command":"npm test"}' }]),
        toolResult('tc1', 'npm ERR! code ELIFECYCLE\nnpm ERR! errno 1'),
      ];

      const result = verifyWorkPhase(messages, 'The build completed successfully.');
      expect(result.passed).toBe(false);
      expect(result.failures.some(f => f.type === 'test_failure')).toBe(true);
    });

    it('detects AssertionError in sandbox output', () => {
      const messages: ChatMessage[] = [
        assistantWithTools(null, [{ id: 'tc1', name: 'sandbox_exec', args: '{"command":"npm test"}' }]),
        toolResult('tc1', 'AssertionError: expected 5 to equal 3'),
      ];

      const result = verifyWorkPhase(messages, 'Implementation is done.');
      expect(result.passed).toBe(false);
    });

    it('passes when model acknowledges test failure', () => {
      const messages: ChatMessage[] = [
        assistantWithTools(null, [{ id: 'tc1', name: 'sandbox_exec', args: '{"command":"npm test"}' }]),
        toolResult('tc1', 'Tests: 3 FAILED'),
      ];

      const result = verifyWorkPhase(messages, 'Unfortunately, 3 tests failed. Here is the error output...');
      expect(result.passed).toBe(true);
    });

    it('detects non-zero exit code', () => {
      const messages: ChatMessage[] = [
        assistantWithTools(null, [{ id: 'tc1', name: 'sandbox_exec', args: '{"command":"make build"}' }]),
        toolResult('tc1', 'Build completed with exit code 2'),
      ];

      const result = verifyWorkPhase(messages, 'Build succeeded.');
      expect(result.passed).toBe(false);
      expect(result.failures.some(f => f.type === 'exit_code_error')).toBe(true);
    });

    it('passes when exit code is 0', () => {
      const messages: ChatMessage[] = [
        assistantWithTools(null, [{ id: 'tc1', name: 'sandbox_exec', args: '{"command":"make build"}' }]),
        toolResult('tc1', 'Build completed with exit code 0'),
      ];

      const result = verifyWorkPhase(messages, 'Build succeeded.');
      expect(result.passed).toBe(true);
    });
  });

  describe('PR creation verification', () => {
    it('passes when PR was successfully created', () => {
      const messages: ChatMessage[] = [
        assistantWithTools(null, [{ id: 'tc1', name: 'github_create_pr', args: '{}' }]),
        toolResult('tc1', 'Pull request created: https://github.com/owner/repo/pull/42'),
      ];

      const result = verifyWorkPhase(messages, 'Created PR #42.');
      expect(result.passed).toBe(true);
    });

    it('detects when all PR creation attempts failed', () => {
      const messages: ChatMessage[] = [
        assistantWithTools(null, [{ id: 'tc1', name: 'github_create_pr', args: '{}' }]),
        toolResult('tc1', 'Error: 422 - A pull request already exists'),
        assistantWithTools(null, [{ id: 'tc2', name: 'github_create_pr', args: '{}' }]),
        toolResult('tc2', 'Error: 403 - Resource not accessible'),
      ];

      const result = verifyWorkPhase(messages, 'The PR has been created.');
      expect(result.passed).toBe(false);
      expect(result.failures.some(f => f.type === 'pr_not_created')).toBe(true);
    });
  });

  describe('unverified claims', () => {
    it('detects PR claim without github_create_pr call', () => {
      const messages: ChatMessage[] = [
        assistantWithTools(null, [{ id: 'tc1', name: 'github_api', args: '{"method":"PUT"}' }]),
        toolResult('tc1', '{"sha":"abc"}'),
      ];

      const result = verifyWorkPhase(messages, 'I have created a pull request at https://github.com/owner/repo/pull/99.');
      expect(result.passed).toBe(false);
      expect(result.failures.some(f => f.type === 'claimed_unverified')).toBe(true);
    });

    it('passes when no PR is claimed', () => {
      const messages: ChatMessage[] = [
        assistantWithTools(null, [{ id: 'tc1', name: 'github_api', args: '{"method":"PUT"}' }]),
        toolResult('tc1', '{"sha":"abc"}'),
      ];

      const result = verifyWorkPhase(messages, 'File updated successfully.');
      expect(result.passed).toBe(true);
    });
  });

  describe('clean results', () => {
    it('passes with no tool calls', () => {
      const result = verifyWorkPhase([], 'Here is my response.');
      expect(result.passed).toBe(true);
      expect(result.failures).toHaveLength(0);
    });

    it('passes with only read-only tools', () => {
      const messages: ChatMessage[] = [
        assistantWithTools(null, [{ id: 'tc1', name: 'github_read_file', args: '{}' }]),
        toolResult('tc1', 'file contents here'),
      ];

      const result = verifyWorkPhase(messages, 'I read the file.');
      expect(result.passed).toBe(true);
    });

    it('passes with successful mutation and test', () => {
      const messages: ChatMessage[] = [
        assistantWithTools(null, [{ id: 'tc1', name: 'github_api', args: '{"method":"PUT"}' }]),
        toolResult('tc1', '{"sha":"abc","content":{"name":"file.ts"}}'),
        assistantWithTools(null, [{ id: 'tc2', name: 'sandbox_exec', args: '{"command":"npm test"}' }]),
        toolResult('tc2', 'Tests: 42 passed, 0 failed\nAll test suites passed!'),
      ];

      const result = verifyWorkPhase(messages, 'All changes applied and tests pass.');
      expect(result.passed).toBe(true);
    });
  });
});

// ─── formatVerificationFailures ─────────────────────────────────────────────

describe('formatVerificationFailures', () => {
  it('formats a single failure', () => {
    const failures: VerificationFailure[] = [{
      type: 'mutation_error',
      tool: 'github_api',
      message: 'Error 422',
    }];

    const formatted = formatVerificationFailures(failures);
    expect(formatted).toContain('[VERIFICATION FAILED]');
    expect(formatted).toContain('1 issue(s)');
    expect(formatted).toContain('[mutation_error]');
    expect(formatted).toContain('github_api');
    expect(formatted).toContain('Error 422');
    expect(formatted).toContain('Do NOT claim success');
  });

  it('formats multiple failures', () => {
    const failures: VerificationFailure[] = [
      { type: 'mutation_error', tool: 'github_api', message: 'Error 422' },
      { type: 'test_failure', tool: 'sandbox_exec', message: 'FAILED 3 tests' },
      { type: 'pr_not_created', tool: 'github_create_pr', message: 'No PR URL found' },
    ];

    const formatted = formatVerificationFailures(failures);
    expect(formatted).toContain('3 issue(s)');
    expect(formatted).toContain('[mutation_error]');
    expect(formatted).toContain('[test_failure]');
    expect(formatted).toContain('[pr_not_created]');
  });

  it('includes retry instructions', () => {
    const failures: VerificationFailure[] = [{
      type: 'test_failure',
      tool: 'sandbox_exec',
      message: 'Tests failed',
    }];

    const formatted = formatVerificationFailures(failures);
    expect(formatted).toContain('retry');
    expect(formatted).toContain('fix');
  });
});
