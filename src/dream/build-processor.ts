/**
 * DreamBuildProcessor — Durable Object for Dream Machine build jobs.
 *
 * Manages job state, executes the build plan using Code Mode MCP for GitHub,
 * and sends status callbacks to Storia throughout the process.
 *
 * Runs outside the Worker 10s timeout via Durable Object alarm.
 */

import { DurableObject } from 'cloudflare:workers';
import type {
  DreamBuildJob,
  DreamJobState,
  WorkItem,
  WorkPlan,
  ParsedSpec,
} from './types';
import { DREAM_CODE_MODEL_ALIAS, DREAM_CODE_MODEL_ID, estimateCost, extractCodeFromResponse } from './types';
import { parseSpecMarkdown, generatePRBody, slugify } from './spec-parser';
import { validateJob, checkBudget, checkDestructiveOps, checkBranchSafety } from './safety';
import { createCallbackHelper } from './callbacks';
import { OpenRouterClient, type ChatCompletionResponse, type ChatMessage } from '../openrouter/client';

// Watchdog alarm interval — re-fires if the job stalls
const ALARM_INTERVAL_MS = 90_000;
// Max time a job can run before being considered stuck
const STUCK_THRESHOLD_MS = 300_000; // 5 minutes

/**
 * Env bindings available to the Durable Object.
 */
export interface DreamBuildEnv {
  MOLTBOT_BUCKET: R2Bucket;
  GITHUB_TOKEN?: string;
  CLOUDFLARE_API_TOKEN?: string;
  STORIA_MOLTWORKER_SECRET?: string;
  OPENROUTER_API_KEY?: string;
}

export class DreamBuildProcessor extends DurableObject<DreamBuildEnv> {
  private state: DreamJobState | null = null;

  /**
   * Accept a new build job.
   * Called by the Worker endpoint via stub.
   */
  async startJob(job: DreamBuildJob): Promise<{ ok: boolean; error?: string }> {
    // Validate the job
    const validation = validateJob(job);
    if (!validation.allowed) {
      return { ok: false, error: validation.reason };
    }

    // Initialize state
    const now = Date.now();
    this.state = {
      jobId: job.jobId,
      status: 'queued',
      job,
      completedItems: [],
      tokensUsed: 0,
      costEstimate: 0,
      startedAt: now,
      updatedAt: now,
    };

    // Persist state to DO storage
    await this.ctx.storage.put('state', this.state);

    // Set alarm to start processing
    await this.ctx.storage.setAlarm(Date.now() + 100);

    return { ok: true };
  }

  /**
   * Get current job status.
   */
  async getStatus(): Promise<DreamJobState | null> {
    if (!this.state) {
      this.state = await this.ctx.storage.get<DreamJobState>('state') ?? null;
    }
    return this.state;
  }

  /**
   * Alarm handler — drives the build process.
   */
  async alarm(): Promise<void> {
    // Load state
    if (!this.state) {
      this.state = await this.ctx.storage.get<DreamJobState>('state') ?? null;
    }

    if (!this.state) {
      console.error('[DreamBuild] No state found in alarm');
      return;
    }

    // Skip if already terminal
    if (this.state.status === 'complete' || this.state.status === 'failed') {
      return;
    }

    // Check for stuck job
    const elapsed = Date.now() - this.state.updatedAt;
    if (this.state.status === 'running' && elapsed > STUCK_THRESHOLD_MS) {
      await this.failJob('Job timed out (stuck for > 5 minutes)');
      return;
    }

    // Execute the build
    try {
      this.state.status = 'running';
      this.state.updatedAt = Date.now();
      await this.ctx.storage.put('state', this.state);

      await this.executeBuild();
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('[DreamBuild] Build error:', msg);
      await this.failJob(msg);
    }
  }

  /**
   * Main build execution logic.
   */
  private async executeBuild(): Promise<void> {
    const job = this.state!.job;
    const callback = createCallbackHelper(
      job.callbackUrl,
      job.jobId,
      this.env.STORIA_MOLTWORKER_SECRET
    );

    // 1. Notify started
    await callback.started();

    // 2. Parse spec and plan
    await callback.planning();
    const parsed = parseSpecMarkdown(job.specMarkdown);
    const branchName = `${job.branchPrefix}${slugify(parsed.title)}`;

    // Check branch safety
    const branchCheck = checkBranchSafety(branchName);
    if (!branchCheck.allowed) {
      await this.failJob(branchCheck.reason!);
      return;
    }

    // Build work plan from the parsed spec
    const plan = this.buildWorkPlan(parsed, job, branchName);
    this.state!.plan = plan;
    this.state!.updatedAt = Date.now();
    await this.ctx.storage.put('state', this.state!);

    // 3. Safety check — destructive ops
    const destructiveCheck = checkDestructiveOps(plan.items);
    if (!destructiveCheck.allowed) {
      this.state!.status = 'paused';
      this.state!.updatedAt = Date.now();
      await this.ctx.storage.put('state', this.state!);
      await callback.pausedApproval(
        `Destructive operations detected: ${destructiveCheck.flaggedItems?.join(', ')}`
      );
      return;
    }

    // 4. Execute work items via GitHub API
    if (!this.env.GITHUB_TOKEN) {
      await this.failJob('GITHUB_TOKEN not configured');
      return;
    }

    // Create OpenRouter client for AI code generation
    const openrouter = this.env.OPENROUTER_API_KEY
      ? new OpenRouterClient(this.env.OPENROUTER_API_KEY, { siteName: 'Moltworker Dream Build' })
      : null;

    if (!openrouter) {
      console.log('[DreamBuild] No OPENROUTER_API_KEY — using stub content (no AI generation)');
    }

    // Create branch first
    const branchCreated = await this.createBranch(
      job.repoOwner,
      job.repoName,
      branchName,
      job.baseBranch,
      this.env.GITHUB_TOKEN
    );

    if (!branchCreated.ok) {
      await this.failJob(`Failed to create branch: ${branchCreated.error}`);
      return;
    }

    // Write each file — generate real code via AI when available
    for (const item of plan.items) {
      // Budget check before each file (now uses real values)
      const budgetCheck = checkBudget(
        this.state!.tokensUsed,
        this.state!.costEstimate,
        job.budget
      );
      if (!budgetCheck.allowed) {
        await this.failJob(budgetCheck.reason!);
        return;
      }

      await callback.writing(item.path);

      // Generate real code for code files (skip spec reference docs)
      const isSpecDoc = item.path.startsWith('docs/');
      if (openrouter && !isSpecDoc) {
        try {
          const generated = await this.generateFileCode(item, parsed, openrouter);
          item.content = generated.content;

          // Track token usage and cost
          const totalTokens = generated.promptTokens + generated.completionTokens;
          this.state!.tokensUsed += totalTokens;
          this.state!.costEstimate += estimateCost(
            DREAM_CODE_MODEL_ID,
            generated.promptTokens,
            generated.completionTokens
          );

          console.log(
            `[DreamBuild] Generated ${item.path}: ${totalTokens} tokens, $${this.state!.costEstimate.toFixed(4)} total`
          );
        } catch (error) {
          const msg = error instanceof Error ? error.message : String(error);
          console.error(`[DreamBuild] AI generation failed for ${item.path}: ${msg}`);
          // Keep stub content and continue — partial code is better than no PR
        }
      }

      const writeResult = await this.writeFile(
        job.repoOwner,
        job.repoName,
        branchName,
        item,
        parsed.title,
        this.env.GITHUB_TOKEN
      );

      if (!writeResult.ok) {
        await this.failJob(`Failed to write ${item.path}: ${writeResult.error}`);
        return;
      }

      this.state!.completedItems.push(item.path);
      this.state!.updatedAt = Date.now();
      await this.ctx.storage.put('state', this.state!);

      // Store artifact in R2
      await this.storeArtifact(job.jobId, item.path, item.content);
    }

    // 5. Create PR
    await callback.testing();

    const prResult = await this.createPR(
      job.repoOwner,
      job.repoName,
      branchName,
      job.baseBranch,
      parsed.title,
      plan.prBody,
      this.env.GITHUB_TOKEN
    );

    if (!prResult.ok) {
      await this.failJob(`Failed to create PR: ${prResult.error}`);
      return;
    }

    const prUrl = prResult.url!;
    this.state!.prUrl = prUrl;
    this.state!.status = 'complete';
    this.state!.updatedAt = Date.now();
    await this.ctx.storage.put('state', this.state!);

    // 6. Notify complete
    await callback.prOpen(prUrl);
    await callback.complete(prUrl);
  }

  /**
   * Generate real code for a work item using OpenRouter AI.
   * Returns the generated content and token usage.
   */
  private async generateFileCode(
    item: WorkItem,
    parsed: ParsedSpec,
    openrouter: OpenRouterClient
  ): Promise<{ content: string; promptTokens: number; completionTokens: number }> {
    const messages: ChatMessage[] = [
      { role: 'system', content: this.buildSystemPrompt(item, parsed) },
      { role: 'user', content: this.buildUserPrompt(item, parsed) },
    ];

    const response: ChatCompletionResponse = await openrouter.chatCompletion(
      DREAM_CODE_MODEL_ALIAS,
      messages,
      { maxTokens: 4096, temperature: 0.3 }
    );

    const rawContent = response.choices[0]?.message?.content || '';
    const code = extractCodeFromResponse(rawContent);

    const usage = response.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

    return {
      content: code,
      promptTokens: usage.prompt_tokens,
      completionTokens: usage.completion_tokens,
    };
  }

  /**
   * Build the system prompt for code generation based on file type.
   */
  private buildSystemPrompt(item: WorkItem, parsed: ParsedSpec): string {
    const ext = item.path.split('.').pop()?.toLowerCase() || '';

    let frameworkInstructions = '';
    if (ext === 'ts' && item.path.startsWith('src/routes/')) {
      frameworkInstructions = [
        'You are generating a Hono 4 route handler for a Cloudflare Workers project.',
        'Use `import { Hono } from "hono";` and export the router.',
        'Use TypeScript strict mode. No `any` types.',
        'Return JSON responses using `c.json()`.',
      ].join('\n');
    } else if (ext === 'tsx' && item.path.startsWith('src/components/')) {
      frameworkInstructions = [
        'You are generating a React 19 functional component with TypeScript.',
        'Use `export default function ComponentName()` pattern.',
        'Use modern React (hooks, no class components).',
        'Include proper TypeScript prop types via an interface.',
      ].join('\n');
    } else if (ext === 'sql') {
      frameworkInstructions = [
        'You are generating a SQL migration file.',
        'Use standard SQL compatible with D1 (SQLite dialect).',
        'Include both the migration and a brief comment explaining the schema change.',
        'Use IF NOT EXISTS where applicable.',
      ].join('\n');
    } else {
      frameworkInstructions = [
        'You are generating TypeScript code for a Cloudflare Workers project.',
        'Use TypeScript strict mode. No `any` types.',
        'Export all public interfaces and functions.',
      ].join('\n');
    }

    return [
      frameworkInstructions,
      '',
      'RULES:',
      '- Output ONLY the file contents. No explanation, no markdown fences.',
      '- The code must be syntactically valid and self-contained.',
      '- Include necessary imports at the top.',
      '- Do NOT include placeholder TODOs — write real, working code.',
      `- Target file path: ${item.path}`,
    ].join('\n');
  }

  /**
   * Build the user prompt with spec context for a specific work item.
   */
  private buildUserPrompt(item: WorkItem, parsed: ParsedSpec): string {
    const sections: string[] = [
      `## Task: ${item.description}`,
      `File: ${item.path}`,
      '',
      `## Project Spec: ${parsed.title}`,
      '',
    ];

    if (parsed.overview) {
      sections.push('### Overview', parsed.overview.slice(0, 1000), '');
    }

    if (parsed.requirements.length > 0) {
      sections.push('### Requirements');
      for (const req of parsed.requirements.slice(0, 15)) {
        sections.push(`- ${req}`);
      }
      sections.push('');
    }

    if (parsed.apiRoutes.length > 0) {
      sections.push('### API Routes');
      for (const route of parsed.apiRoutes.slice(0, 10)) {
        sections.push(`- ${route}`);
      }
      sections.push('');
    }

    if (parsed.dbChanges.length > 0) {
      sections.push('### Database Changes');
      for (const change of parsed.dbChanges.slice(0, 10)) {
        sections.push(`- ${change}`);
      }
      sections.push('');
    }

    if (parsed.uiComponents.length > 0) {
      sections.push('### UI Components');
      for (const comp of parsed.uiComponents.slice(0, 10)) {
        sections.push(`- ${comp}`);
      }
      sections.push('');
    }

    sections.push(`Generate the complete implementation for: ${item.description}`);

    return sections.join('\n');
  }

  /**
   * Build a work plan from the parsed spec.
   * Generates placeholder files for each requirement section.
   */
  private buildWorkPlan(
    parsed: ReturnType<typeof parseSpecMarkdown>,
    job: DreamBuildJob,
    branchName: string
  ): WorkPlan {
    const items: WorkItem[] = [];

    // Add spec as a reference file in the repo
    items.push({
      path: `docs/dream-specs/${slugify(parsed.title)}.md`,
      content: job.specMarkdown,
      description: 'Dream Machine spec reference',
    });

    // Generate files for API routes if specified
    for (const route of parsed.apiRoutes) {
      const routeSlug = slugify(route);
      if (routeSlug) {
        items.push({
          path: `src/routes/${routeSlug}.ts`,
          content: `// TODO: Implement route — ${route}\n// Generated by Dream Machine Build\n\nexport {};\n`,
          description: `API route: ${route}`,
        });
      }
    }

    // Generate files for UI components if specified
    for (const comp of parsed.uiComponents) {
      const compSlug = slugify(comp);
      if (compSlug) {
        items.push({
          path: `src/components/${compSlug}.tsx`,
          content: `// TODO: Implement component — ${comp}\n// Generated by Dream Machine Build\n\nexport {};\n`,
          description: `UI component: ${comp}`,
        });
      }
    }

    // Generate files for DB changes if specified
    for (const change of parsed.dbChanges) {
      const changeSlug = slugify(change);
      if (changeSlug) {
        items.push({
          path: `migrations/${changeSlug}.sql`,
          content: `-- TODO: Implement migration — ${change}\n-- Generated by Dream Machine Build\n`,
          description: `DB migration: ${change}`,
        });
      }
    }

    const prBody = generatePRBody(parsed, items.map(i => i.path));

    return {
      title: parsed.title,
      branch: branchName,
      items,
      prBody,
    };
  }

  /**
   * Create a new branch from the base branch via GitHub API.
   */
  private async createBranch(
    owner: string,
    repo: string,
    branchName: string,
    baseBranch: string,
    token: string
  ): Promise<{ ok: boolean; error?: string }> {
    try {
      // Get the SHA of the base branch
      const refResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${baseBranch}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'moltworker-dream-build',
          },
        }
      );

      if (!refResponse.ok) {
        const text = await refResponse.text();
        return { ok: false, error: `Failed to get base branch SHA: ${refResponse.status} ${text.slice(0, 200)}` };
      }

      const refData = await refResponse.json() as { object: { sha: string } };
      const sha = refData.object.sha;

      // Create the new branch
      const createResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/refs`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'moltworker-dream-build',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ref: `refs/heads/${branchName}`,
            sha,
          }),
        }
      );

      if (!createResponse.ok) {
        // Branch may already exist (422) — that's OK
        if (createResponse.status === 422) {
          return { ok: true };
        }
        const text = await createResponse.text();
        return { ok: false, error: `Failed to create branch: ${createResponse.status} ${text.slice(0, 200)}` };
      }

      return { ok: true };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Write a file to the repo via GitHub API.
   */
  private async writeFile(
    owner: string,
    repo: string,
    branch: string,
    item: WorkItem,
    specTitle: string,
    token: string
  ): Promise<{ ok: boolean; error?: string }> {
    try {
      // Check if the file already exists (to get its SHA for updates)
      let existingSha: string | undefined;
      const getResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${item.path}?ref=${branch}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'moltworker-dream-build',
          },
        }
      );

      if (getResponse.ok) {
        const data = await getResponse.json() as { sha: string };
        existingSha = data.sha;
      }

      // Create or update the file
      const body: Record<string, string> = {
        message: `[Dream] ${specTitle} — ${item.path}`,
        content: btoa(item.content),
        branch,
      };

      if (existingSha) {
        body.sha = existingSha;
      }

      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${item.path}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'moltworker-dream-build',
            'Content-Type': 'application/json',
          },
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
   * Create a pull request via GitHub API.
   */
  private async createPR(
    owner: string,
    repo: string,
    head: string,
    base: string,
    title: string,
    body: string,
    token: string
  ): Promise<{ ok: boolean; url?: string; error?: string }> {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/pulls`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'moltworker-dream-build',
            'Content-Type': 'application/json',
          },
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

      const data = await response.json() as { html_url: string };
      return { ok: true, url: data.html_url };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Store an artifact (generated file) in R2.
   */
  private async storeArtifact(jobId: string, path: string, content: string): Promise<void> {
    try {
      const key = `dream-artifacts/${jobId}/${path}`;
      await this.env.MOLTBOT_BUCKET.put(key, content);
    } catch (error) {
      console.error(`[DreamBuild] Failed to store artifact ${path}:`, error);
      // Non-fatal — don't block the build
    }
  }

  /**
   * Mark the job as failed and send callback.
   */
  private async failJob(error: string): Promise<void> {
    if (this.state) {
      this.state.status = 'failed';
      this.state.error = error;
      this.state.updatedAt = Date.now();
      await this.ctx.storage.put('state', this.state);

      const callback = createCallbackHelper(
        this.state.job.callbackUrl,
        this.state.jobId,
        this.env.STORIA_MOLTWORKER_SECRET
      );
      await callback.failed(error);
    }
  }
}
