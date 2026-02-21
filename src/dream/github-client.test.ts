import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GitHubClient } from './github-client';

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

beforeEach(() => {
  mockFetch.mockReset();
});

describe('GitHubClient', () => {
  const client = new GitHubClient({ token: 'test-token-123' });

  describe('getBranchSha', () => {
    it('returns SHA for existing branch', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ object: { sha: 'abc123' } }),
      });

      const result = await client.getBranchSha('owner', 'repo', 'main');
      expect(result.ok).toBe(true);
      expect(result.data).toBe('abc123');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/owner/repo/git/ref/heads/main',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token-123',
          }),
        })
      );
    });

    it('returns error for missing branch', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => 'Not Found',
      });

      const result = await client.getBranchSha('owner', 'repo', 'nonexistent');
      expect(result.ok).toBe(false);
      expect(result.error).toContain('404');
    });
  });

  describe('createBranch', () => {
    it('creates a branch from base', async () => {
      // First call: get base branch SHA
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ object: { sha: 'abc123' } }),
      });
      // Second call: create the branch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ref: 'refs/heads/dream/new-feature' }),
      });

      const result = await client.createBranch('owner', 'repo', 'dream/new-feature', 'main');
      expect(result.ok).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('succeeds when branch already exists (422)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ object: { sha: 'abc123' } }),
      });
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        text: async () => 'Reference already exists',
      });

      const result = await client.createBranch('owner', 'repo', 'dream/existing', 'main');
      expect(result.ok).toBe(true);
    });

    it('propagates base branch errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => 'Not Found',
      });

      const result = await client.createBranch('owner', 'repo', 'dream/x', 'missing-base');
      expect(result.ok).toBe(false);
      expect(result.error).toContain('Failed to get branch SHA');
    });
  });

  describe('writeFile', () => {
    it('creates a new file', async () => {
      // First call: check if file exists (404)
      mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });
      // Second call: create the file
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: {} }),
      });

      const result = await client.writeFile(
        'owner', 'repo', 'dream/branch', 'src/test.ts',
        'const x = 1;', '[Dream] Create test.ts'
      );
      expect(result.ok).toBe(true);
    });

    it('updates an existing file with sha', async () => {
      // First call: file exists with SHA
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ sha: 'existing-sha-456' }),
      });
      // Second call: update the file
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: {} }),
      });

      const result = await client.writeFile(
        'owner', 'repo', 'dream/branch', 'src/test.ts',
        'const x = 2;', '[Dream] Update test.ts'
      );
      expect(result.ok).toBe(true);

      // Verify the PUT body includes the existing sha
      const putCall = mockFetch.mock.calls[1];
      const body = JSON.parse(putCall[1].body);
      expect(body.sha).toBe('existing-sha-456');
    });
  });

  describe('createPR', () => {
    it('creates a PR and returns URL + number', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          html_url: 'https://github.com/owner/repo/pull/42',
          number: 42,
        }),
      });

      const result = await client.createPR(
        'owner', 'repo', 'dream/feature', 'main',
        'Add feature', '## Summary\nNew feature'
      );
      expect(result.ok).toBe(true);
      expect(result.data?.htmlUrl).toBe('https://github.com/owner/repo/pull/42');
      expect(result.data?.number).toBe(42);
    });

    it('returns error on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        text: async () => 'Forbidden',
      });

      const result = await client.createPR('owner', 'repo', 'h', 'b', 't', 'body');
      expect(result.ok).toBe(false);
      expect(result.error).toContain('403');
    });
  });

  describe('enableAutoMerge', () => {
    it('merges a PR successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ merged: true }),
      });

      const result = await client.enableAutoMerge('owner', 'repo', 42);
      expect(result.ok).toBe(true);
    });

    it('returns error when PR not mergeable (405)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 405,
        text: async () => 'Method Not Allowed',
      });

      const result = await client.enableAutoMerge('owner', 'repo', 42);
      expect(result.ok).toBe(false);
      expect(result.error).toContain('not mergeable');
    });

    it('handles network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network timeout'));

      const result = await client.enableAutoMerge('owner', 'repo', 42);
      expect(result.ok).toBe(false);
      expect(result.error).toContain('Network timeout');
    });
  });
});
