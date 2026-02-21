# Dream Machine — Moltworker Integration Brief

> **Version**: 1.2  
> **Date**: February 21, 2026  
> **Scope**: Phase 2 Build stage only — moltworker as the execution engine  
> **Parent spec**: `claude-share/specs/dream-machine-spec.md`  
> **Depends on**: Agent Mode (AGENT_MODE_SPEC.md), Dream Machine Phase 1 deployed  
> **Reviewed by**: Grok (xAI) — 9.2/10, approved with 4 refinements applied in this version

---

## 1. What Is This?

Dream Machine Phase 1 (deployed in Storia AI Hub) handles CAPTURE → CONSOLIDATE → spec generation. Phase 2 hands off approved `.md` specs to an autonomous agent for actual code execution and deployment.

**Moltworker is that agent.** It receives approved specs from Storia and autonomously:

1. Reads the `.md` spec
2. Writes the code (files, routes, components, schema changes)
3. Creates a PR on the target repo
4. Optionally deploys to Cloudflare staging

---

## 2. Integration Point

```
Storia Dream Machine                    Moltworker
┌─────────────────────┐                ┌───────────────────────┐
│  Spec Library        │                │                       │
│  ┌───────────────┐  │   approved      │  1. Receive spec      │
│  │ spec: "draft"  │──┼────────────────►  2. Parse requirements│
│  │ → "approved"   │  │   webhook /    │  3. Write code        │
│  └───────────────┘  │   SSE push      │  4. Run tests         │
│                      │                │  5. Open PR           │
│  [Approve] button    │◄───────────────┤  6. Report back       │
│  triggers handoff    │   status update│                       │
└─────────────────────┘                └───────────────────────┘
```

The handoff happens when a user clicks **Approve** on a spec in the Dream Machine UI. Storia calls the moltworker endpoint (or queues the job via Cloudflare Queue).

```typescript
// In src/components/dream/SpecPreview.tsx — onApprove handler
await fetch(`${process.env.MOLTWORKER_URL}/api/dream-build`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.STORIA_MOLTWORKER_SECRET}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(buildJob), // DreamBuildJob
});
```

---

## 3. Spec Format Moltworker Expects

When Storia sends a spec to moltworker, it POSTs a JSON payload:

```typescript
interface DreamBuildJob {
  jobId: string;
  specId: string;
  userId: string;
  targetRepoType: 'storia-digital' | 'petranto-com' | 'byok-cloud' | 'custom'; // routes to correct repo + bindings
  repoOwner: string;
  repoName: string;
  baseBranch: string;           // usually 'main'
  branchPrefix: string;         // e.g. 'dream/' → 'dream/mobile-ux-improvements'
  specMarkdown: string;         // full .md content from dreamSpecs.content
  estimatedEffort: string;      // "8-12h"
  priority: 'critical' | 'high' | 'medium' | 'low';
  callbackUrl: string;          // Storia endpoint to POST status updates
  budget: {
    maxTokens: number;          // hard cap
    maxDollars: number;         // e.g. 2.00
  };
  // Optional: queue mode for overnight batch builds (aligns with "go to sleep, wake up with PR")
  queueName?: string;           // e.g. 'dream-build-queue' — if set, job is deferred to Cloudflare Queue
}
```

### Ingress Modes

Moltworker supports two ingress paths from Storia:

**Immediate** (direct POST) — for "build now" triggered manually by user:
```
POST /api/dream-build
Authorization: Bearer <storia-moltworker-shared-secret>
Body: DreamBuildJob  (no queueName)
```

**Overnight batch** (Cloudflare Queue) — for scheduled builds, aligning with the "go to sleep, wake up with a PR" tagline:
```
POST /api/dream-build
Body: DreamBuildJob  (queueName: "dream-build-queue")
→ Moltworker enqueues the job
→ Consumer Worker picks it up at off-peak hours
→ Callbacks stream back to Storia via SSE when job runs
```

Both paths share the same `dream_build` skill. The queue path adds retry semantics (max 3) and scheduling.

---

## 4. Moltworker Behaviour

### New Skill: `dream_build`

```typescript
// skills/dream_build.ts
export const DREAM_BUILD_SKILL = {
  name: 'dream_build',
  description: 'Execute a Dream Machine spec: write code, create PR',
  inputSchema: DreamBuildJobSchema,
  
  async execute(job: DreamBuildJob, ctx: WorkerContext) {
    // 1. Parse spec sections (Overview, Requirements, API Routes, DB Changes, UI Components)
    const parsed = parseSpecMarkdown(job.specMarkdown);
    
    // 2. Plan work items
    const plan = await ctx.llm.plan(parsed);
    
    // 3. Access GitHub via Code Mode MCP (~800 tokens for entire GitHub API)
    //    Reuses the Code Mode MCP integration merged 2026-02-20 (PR #139).
    //    No custom ctx.github abstraction needed.
    const github = await ctx.codemode.search('github');
    // const octokit = await github.getTypedClient(); // use if SDK exposes typed client; otherwise keep raw execute() below
    
    // 4. Execute each work item (write files via Code Mode)
    for (const item of plan.items) {
      await github.execute(`
        octokit.repos.createOrUpdateFileContents({
          owner: '${job.repoOwner}',
          repo: '${job.repoName}',
          path: '${item.path}',
          message: '[Dream] ${parsed.title} — ${item.path}',
          content: Buffer.from(item.content).toString('base64'),
          branch: '${job.branchPrefix}${slugify(parsed.title)}',
        })
      `);
      await ctx.postStatus(job.callbackUrl, { step: item.path, status: 'written' });
    }
    
    // 5. Open PR with spec title + summary as description
    const pr = await github.execute(`
      octokit.pulls.create({
        owner: '${job.repoOwner}',
        repo: '${job.repoName}',
        title: '[Dream] ${parsed.title}',
        body: \`${generatePRBody(parsed, plan)}\`,
        head: '${job.branchPrefix}${slugify(parsed.title)}',
        base: '${job.baseBranch}',
      })
    `);
    
    // 6. Report back to Storia
    await ctx.postStatus(job.callbackUrl, { 
      status: 'complete', 
      prUrl: pr.data.html_url 
    });
  }
};
```

### Safety Gates (Always On)

| Gate | Rule |
|------|------|
| Budget cap | Abort if projected token cost exceeds `job.budget.maxDollars` |
| No force push | Never overwrite existing non-dream branches |
| Destructive op check | Flag any migration that drops tables — require explicit user re-approval |
| PR only | Never merge autonomously — always creates a PR |
| Vex approval | If a step is flagged risky, pause and ask Vex (chaos gecko) to review |

---

## 5. Status Callbacks to Storia

Moltworker POSTs to `job.callbackUrl` at each step:

```typescript
interface BuildStatusUpdate {
  jobId: string;
  status: 'started' | 'planning' | 'writing' | 'testing' | 'pr_open' | 'complete' | 'failed' | 'paused_approval';
  step?: string;         // current file path or action
  message?: string;      // human-readable gecko-style update
  prUrl?: string;        // filled when status = 'complete'
  error?: string;        // filled when status = 'failed'
}
```

Storia shows these updates live in the Dream Machine UI via SSE.

---

## 6. Cloudflare Worker Endpoint

See **Section 3 — Ingress Modes** for full endpoint details. Summary:

- **Immediate**: `POST /api/dream-build` (no `queueName`) → executes synchronously, streams status via callbacks
- **Batch/overnight**: `POST /api/dream-build` (with `queueName: "dream-build-queue"`) → enqueues, consumer Worker picks up at off-peak, streams callbacks when it runs

Runs as a Cloudflare Worker with Durable Object for job state persistence. R2 stores intermediate artifacts (generated files before PR open). Queue retries on transient failures (max 3, exponential backoff).

---

## 7. Trust Gating

Moltworker only accepts jobs from users with trust level `🔨 Builder` or higher (tracked in Storia's D1). Storia enforces this before sending the job. Moltworker verifies the `userId` trust level via the **existing Cloudflare Access + device-pairing JWT validation** already present in the repo — no new auth code needed, just add the `dreamTrustLevel` claim to the signed token Storia generates.

| Trust Level | Can trigger moltworker? |
|-------------|------------------------|
| 👀 Observer | ❌ |
| 📋 Planner | ❌ |
| 🔨 Builder | ✅ (writes + PR only) |
| 🚀 Shipper | ✅ (writes + PR + deploys) |

```typescript
// Storia side — add to JWT payload before calling moltworker
const token = signJWT({
  sub: session.userId,
  dreamTrustLevel: user.dreamTrust.level,  // 'observer' | 'planner' | 'builder' | 'shipper'
  exp: Math.floor(Date.now() / 1000) + 300, // 5 min TTL
}, process.env.STORIA_MOLTWORKER_SECRET);

// Moltworker side — reuse existing JWT middleware, just check the new claim
if (!['builder', 'shipper'].includes(claims.dreamTrustLevel)) {
  return new Response('Insufficient trust level', { status: 403 });
}
```

---

## 8. Implementation Order (moltworker side)

| Step | Task | Effort |
|------|------|--------|
| 1 | `dream_build` skill + spec parser (using Code Mode MCP for GitHub) | 4h |
| 2 | `/api/dream-build` Worker endpoint — immediate + queue ingress | 2h |
| 3 | Durable Object for job state | 3h |
| 4 | Cloudflare Queue consumer (overnight batch mode) | 2h |
| 5 | Status callback system | 2h |
| 6 | Safety gates (budget cap, destructive op check) | 2h |
| 7 | R2 artifact storage | 1h |
| 8 | Trust JWT claim (`dreamTrustLevel`) — extend existing CF Access middleware | 0.5h |
| 9 | Testing with sample spec | 3h |
| **Total** | | **~19.5h** |

---

## 9. What This Is NOT

- Not a code review tool — it writes code, opens a PR, humans review
- Not autonomous deployment by default — 🚀 Shipper tier is opt-in
- Not a replacement for Agent Mode — Agent Mode is for interactive IDE sessions; Dream Machine Build is for batch overnight execution
- Not handling Phase 1 (capture/consolidate) — that all lives in Storia

---

## 10. Dependencies & Current Repo State

**Already in moltworker repo (no work needed):**
- Code Mode MCP integration (merged 2026-02-20, PR #139) → used for GitHub API access (~800 tokens)
- `durable-objects/` folder → ready for job state persistence
- `orchestra/` anti-destructive guardrails → reuse for PR safety
- Skills system + Telegram handler → `dream_build` plugs straight in
- Cloudflare Access + device-pairing JWT validation → reuse for trust gating

**Still to build:**
- `dream_build` skill (~4h)
- `/api/dream-build` endpoint + Queue consumer (~4h)
- `dreamTrustLevel` JWT claim on Storia side (~0.5h)

**Env vars needed:**
- `STORIA_MOLTWORKER_SECRET` — shared between Storia and moltworker
- Existing GitHub + Cloudflare bindings already present in Worker
