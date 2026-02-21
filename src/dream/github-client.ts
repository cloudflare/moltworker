/**
 * GitHub API client for Dream Machine builds.
 *
 * Encapsulates raw GitHub REST API calls previously scattered in build-processor.ts.
 * Uses the same MCP-style interface pattern (search + execute) for future migration
 * to a proper GitHub MCP server when available.
 *
 * DM.11: Migrate GitHub API calls to Code Mode MCP
 */

const GITHUB_API = 'https://api.github.com';
const USER_AGENT = 'moltworker-dream-build';

export interface GitHubClientOptions {
  token: string;
}

export interface GitHubResult<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

/**
 * GitHub API client that encapsulates all Git operations needed by Dream builds.
 *
 * Methods map to the three GitHub operations used by the build processor:
 * - createBranch: Create a new branch from a base ref
 * - writeFile: Create or update a file on a branch
 * - createPR: Open a pull request
 * - enableAutoMerge: Enable auto-merge on a PR (shipper-tier)
 */
export class GitHubClient {
  private token: string;

  constructor(options: GitHubClientOptions) {
    this.token = options.token;
  }

  private headers(extra?: Record<string, string>): Record<string, string> {
    return {
      Authorization: `Bearer ${this.token}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': USER_AGENT,
      'Content-Type': 'application/json',
      ...extra,
    };
  }

  /**
   * Get the SHA of a branch ref.
   */
  async getBranchSha(owner: string, repo: string, branch: string): Promise<GitHubResult<string>> {
    try {
      const response = await fetch(
        `${GITHUB_API}/repos/${owner}/${repo}/git/ref/heads/${branch}`,
        { headers: this.headers() }
      );

      if (!response.ok) {
        const text = await response.text();
        return { ok: false, error: `Failed to get branch SHA: ${response.status} ${text.slice(0, 200)}` };
      }

      const data = await response.json() as { object: { sha: string } };
      return { ok: true, data: data.object.sha };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Create a new branch from a base branch.
   */
  async createBranch(
    owner: string,
    repo: string,
    branchName: string,
    baseBranch: string
  ): Promise<GitHubResult> {
    // Get the SHA of the base branch
    const shaResult = await this.getBranchSha(owner, repo, baseBranch);
    if (!shaResult.ok) {
      return { ok: false, error: shaResult.error };
    }

    try {
      const response = await fetch(
        `${GITHUB_API}/repos/${owner}/${repo}/git/refs`,
        {
          method: 'POST',
          headers: this.headers(),
          body: JSON.stringify({
            ref: `refs/heads/${branchName}`,
            sha: shaResult.data,
          }),
        }
      );

      if (!response.ok) {
        // Branch may already exist (422) — that's OK
        if (response.status === 422) {
          return { ok: true };
        }
        const text = await response.text();
        return { ok: false, error: `Failed to create branch: ${response.status} ${text.slice(0, 200)}` };
      }

      return { ok: true };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Write (create or update) a file on a branch.
   */
  async writeFile(
    owner: string,
    repo: string,
    branch: string,
    path: string,
    content: string,
    commitMessage: string
  ): Promise<GitHubResult> {
    try {
      // Check if the file already exists (to get its SHA for updates)
      let existingSha: string | undefined;
      const getResponse = await fetch(
        `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
        { headers: this.headers() }
      );

      if (getResponse.ok) {
        const data = await getResponse.json() as { sha: string };
        existingSha = data.sha;
      }

      // Create or update the file
      const body: Record<string, string> = {
        message: commitMessage,
        content: btoa(content),
        branch,
      };

      if (existingSha) {
        body.sha = existingSha;
      }

      const response = await fetch(
        `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`,
        {
          method: 'PUT',
          headers: this.headers(),
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const text = await response.text();
        return { ok: false, error: `${response.status} ${text.slice(0, 200)}` };
      }

      return { ok: true };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Create a pull request.
   */
  async createPR(
    owner: string,
    repo: string,
    head: string,
    base: string,
    title: string,
    body: string
  ): Promise<GitHubResult<{ htmlUrl: string; number: number }>> {
    try {
      const response = await fetch(
        `${GITHUB_API}/repos/${owner}/${repo}/pulls`,
        {
          method: 'POST',
          headers: this.headers(),
          body: JSON.stringify({
            title: `[Dream] ${title}`,
            body,
            head,
            base,
          }),
        }
      );

      if (!response.ok) {
        const text = await response.text();
        return { ok: false, error: `${response.status} ${text.slice(0, 200)}` };
      }

      const data = await response.json() as { html_url: string; number: number };
      return { ok: true, data: { htmlUrl: data.html_url, number: data.number } };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Enable auto-merge on a pull request (shipper-tier).
   * Requires the repo to have branch protection with required reviews or status checks.
   */
  async enableAutoMerge(
    owner: string,
    repo: string,
    prNumber: number
  ): Promise<GitHubResult> {
    try {
      const response = await fetch(
        `${GITHUB_API}/repos/${owner}/${repo}/pulls/${prNumber}/merge`,
        {
          method: 'PUT',
          headers: this.headers(),
          body: JSON.stringify({
            merge_method: 'squash',
            commit_title: `[Dream] Auto-merged by shipper-tier build`,
          }),
        }
      );

      if (!response.ok) {
        const text = await response.text();
        // 405 means PR not mergeable yet (checks pending) — that's expected
        if (response.status === 405) {
          return { ok: false, error: 'PR not mergeable yet (checks pending or reviews required)' };
        }
        return { ok: false, error: `${response.status} ${text.slice(0, 200)}` };
      }

      return { ok: true };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : String(error) };
    }
  }
}
