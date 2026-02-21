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
import { validateGeneratedFiles, formatValidationWarnings } from './validation';
import { OpenRouterClient, type ChatCompletionResponse, type ChatMessage } from '../openrouter/client';
import { GitHubClient } from './github-client';
import { scanForRisks, runVexReview, formatVexReviewSection } from './vex-review';
import { CloudflareMcpClient } from '../mcp/cloudflare';

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
   * Resume a paused job after human approval.
   * Called via POST /dream-build/:jobId/approve.
   */
  async resumeJob(): Promise<{ ok: boolean; error?: string }> {
    if (!this.state) {
      this.state = await this.ctx.storage.get<DreamJobState>('state') ?? null;
    }

    if (!this.state) {
      return { ok: false, error: 'Job not found' };
    }

    if (this.state.status !== 'paused') {
      return { ok: false, error: `Job is not paused (current status: ${this.state.status})` };
    }

    // Mark as approved and re-queue
    this.state.approved = true;
    this.state.status = 'queued';
    this.state.updatedAt = Date.now();
    await this.ctx.storage.put('state', this.state);

    // Set alarm to trigger re-processing
    await this.ctx.storage.setAlarm(Date.now() + 100);

    return { ok: true };
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
   *
   * Uses GitHubClient (DM.11) for all GitHub operations,
   * Vex review (DM.14) for risky steps, and
   * shipper-tier deploy (DM.13) after PR creation.
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

    // 3. Safety check — destructive ops (skip if human-approved)
    if (!this.state!.approved) {
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
    }

    // 4. Execute work items via GitHub API (DM.11: via GitHubClient)
    if (!this.env.GITHUB_TOKEN) {
      await this.failJob('GITHUB_TOKEN not configured');
      return;
    }

    const github = new GitHubClient({ token: this.env.GITHUB_TOKEN });

    // Create OpenRouter client for AI code generation + Vex review
    const openrouter = this.env.OPENROUTER_API_KEY
      ? new OpenRouterClient(this.env.OPENROUTER_API_KEY, { siteName: 'Moltworker Dream Build' })
      : null;

    if (!openrouter) {
      console.log('[DreamBuild] No OPENROUTER_API_KEY — using stub content (no AI generation)');
    }

    // Create branch first (DM.11: via GitHubClient)
    const branchCreated = await github.createBranch(
      job.repoOwner,
      job.repoName,
      branchName,
      job.baseBranch
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

      // DM.11: Write file via GitHubClient
      const writeResult = await github.writeFile(
        job.repoOwner,
        job.repoName,
        branchName,
        item.path,
        item.content,
        `[Dream] ${parsed.title} — ${item.path}`
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

    // 5. Validate generated code before PR creation
    await callback.testing();

    const codeFiles = plan.items.filter(item => !item.path.startsWith('docs/'));
    const validation = validateGeneratedFiles(codeFiles);

    if (!validation.passed) {
      const warningMessages = validation.results
        .filter(r => !r.ok)
        .flatMap(r => r.warnings.map(w => `${r.path}: ${w}`));
      this.state!.validationWarnings = warningMessages;
      this.state!.updatedAt = Date.now();
      await this.ctx.storage.put('state', this.state!);
      console.log(`[DreamBuild] Validation warnings (${warningMessages.length}):`, warningMessages.join('; '));
    }

    // 5b. Vex review for risky steps (DM.14)
    const risks = scanForRisks(codeFiles);
    let vexSection = '';
    if (risks.length > 0) {
      console.log(`[DreamBuild] ${risks.length} risky patterns detected, running Vex review`);
      const vexResult = await runVexReview(risks, parsed.title, openrouter);
      this.state!.vexReview = vexResult;
      this.state!.updatedAt = Date.now();
      await this.ctx.storage.put('state', this.state!);

      vexSection = formatVexReviewSection(vexResult);

      // If Vex says reject, fail the job
      if (vexResult.recommendation === 'reject') {
        await this.failJob(`Vex review rejected build: ${vexResult.summary.slice(0, 200)}`);
        return;
      }

      // If Vex says pause and not already approved, pause for human review
      if (vexResult.recommendation === 'pause' && !this.state!.approved) {
        this.state!.status = 'paused';
        this.state!.updatedAt = Date.now();
        await this.ctx.storage.put('state', this.state!);
        await callback.pausedApproval(`Vex review flagged risks: ${vexResult.summary.slice(0, 200)}`);
        return;
      }
    }

    // Append validation warnings + Vex review to PR body
    let prBody = plan.prBody;
    const warningSection = formatValidationWarnings(validation.results);
    const combinedSections = [warningSection, vexSection].filter(Boolean).join('\n\n');
    if (combinedSections) {
      prBody = prBody.replace(
        '*Generated by Dream Machine Build stage via Moltworker*',
        combinedSections + '\n\n---\n*Generated by Dream Machine Build stage via Moltworker*'
      );
    }

    // 6. Create PR (DM.11: via GitHubClient)
    const prResult = await github.createPR(
      job.repoOwner,
      job.repoName,
      branchName,
      job.baseBranch,
      parsed.title,
      prBody
    );

    if (!prResult.ok) {
      await this.failJob(`Failed to create PR: ${prResult.error}`);
      return;
    }

    const prUrl = prResult.data!.htmlUrl;
    const prNumber = prResult.data!.number;
    this.state!.prUrl = prUrl;
    this.state!.updatedAt = Date.now();
    await this.ctx.storage.put('state', this.state!);

    // 7. Notify PR open
    await callback.prOpen(prUrl);

    // 8. Shipper-tier deploy to staging (DM.13)
    if (job.trustLevel === 'shipper') {
      await this.shipperDeploy(job, prNumber, prUrl, github, callback);
    } else {
      this.state!.status = 'complete';
      this.state!.updatedAt = Date.now();
      await this.ctx.storage.put('state', this.state!);
      await callback.complete(prUrl);
    }
  }

  /**
   * Shipper-tier deploy: auto-merge PR and deploy to staging (DM.13).
   */
  private async shipperDeploy(
    job: DreamBuildJob,
    prNumber: number,
    prUrl: string,
    github: GitHubClient,
    callback: ReturnType<typeof createCallbackHelper>
  ): Promise<void> {
    console.log(`[DreamBuild] Shipper-tier: auto-merging PR #${prNumber}`);
    await callback.deploying(prUrl);

    // Attempt auto-merge
    const mergeResult = await github.enableAutoMerge(
      job.repoOwner,
      job.repoName,
      prNumber
    );

    if (!mergeResult.ok) {
      console.log(`[DreamBuild] Auto-merge not available: ${mergeResult.error}`);
      // Non-fatal — PR is still open, just can't auto-merge
      this.state!.status = 'complete';
      this.state!.updatedAt = Date.now();
      await this.ctx.storage.put('state', this.state!);
      await callback.complete(prUrl);
      return;
    }

    // Deploy to staging via Cloudflare MCP if available
    if (this.env.CLOUDFLARE_API_TOKEN) {
      try {
        const cfClient = new CloudflareMcpClient(this.env.CLOUDFLARE_API_TOKEN);
        await cfClient.connect();
        const deployResult = await cfClient.execute(
          `const result = await api.post('/accounts/me/pages/projects/${job.repoName}/deployments', ` +
          `{ branch: '${job.baseBranch}' }); return result;`
        );

        if (!deployResult.isError) {
          console.log(`[DreamBuild] Staging deploy triggered for ${job.repoName}`);
          this.state!.deployUrl = `https://${job.repoName}-staging.pages.dev`;
        } else {
          console.log('[DreamBuild] Staging deploy via MCP failed (non-fatal):', deployResult.text);
        }
      } catch (error) {
        console.log('[DreamBuild] Staging deploy via MCP unavailable (non-fatal):', error);
      }
    }

    this.state!.status = 'complete';
    this.state!.updatedAt = Date.now();
    await this.ctx.storage.put('state', this.state!);
    await callback.deployed(prUrl, this.state!.deployUrl);
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
