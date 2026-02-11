# Next Task for AI Session

> Copy-paste this prompt to start the next AI session.
> After completing, update this file to point to the next task.

**Last Updated:** 2026-02-11 (enhanced with full implementation context)

---

## Current Task: Phase 3.2 — Structured Task Phases

### Goal

Add phase tracking to `TaskProcessor` (Durable Object) so long-running tasks go through structured phases:
1. **Plan** — Analyze the request, identify tools/strategy, output a brief plan
2. **Work** — Execute the plan (existing tool-calling loop)
3. **Review** — Validate results, check completeness, suggest follow-ups

Phase-aware prompts guide the model at each stage. Phase transitions are tracked in `TaskState`. Progress updates in Telegram show the current phase.

---

### Architecture Context (READ THIS FIRST)

#### How tasks flow today (handler.ts → task-processor.ts)

1. **handler.ts:1311-1390** — Builds system prompt + messages array:
   - `getSystemPrompt()` — loads skill prompt from R2 (`skills/storia-orchestrator/prompt.md`)
   - Appends `toolHint` (for tool-capable models), `learningsHint` (from Phase 3.1), `lastTaskHint` (cross-task context)
   - Constructs `TaskRequest` with `messages`, `modelAlias`, `telegramToken`, etc.
   - Sends to DO via `doStub.fetch('https://do/process', ...)`

2. **task-processor.ts:499-530** — `processTask(request)` initializes `TaskState`:
   - Sets `status: 'processing'`, sends "Thinking..." status message
   - Starts watchdog alarm (90s interval, 60s stuck threshold)
   - Attempts checkpoint resume if available

3. **task-processor.ts:596-978** — Main processing loop (`while iterations < 100`):
   - Each iteration: call AI API → check for tool_calls → execute tools → add results → loop
   - Progress updates every 15s via `editTelegramMessage`
   - Context compression every 6 tool calls
   - R2 checkpoint every 3 tool calls
   - Free model rotation on 429/503/402

4. **task-processor.ts:998-1063** — Task completion:
   - `status = 'completed'` → save final checkpoint → `extractLearning` + `storeLearning` → delete status msg → send response
   - Response includes tool summary and timing footer

#### Key types (task-processor.ts)

```typescript
interface TaskState {
  taskId: string;
  chatId: number;
  userId: string;
  modelAlias: string;
  messages: ChatMessage[];
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  toolsUsed: string[];
  iterations: number;
  startTime: number;
  lastUpdate: number;
  result?: string;
  error?: string;
  statusMessageId?: number;
  telegramToken?: string;
  openrouterKey?: string;
  githubToken?: string;
  dashscopeKey?: string;
  moonshotKey?: string;
  deepseekKey?: string;
  autoResume?: boolean;
  autoResumeCount?: number;
  reasoningLevel?: ReasoningLevel;
  responseFormat?: ResponseFormat;
}
```

#### System prompt assembly (handler.ts:1340-1350)

```typescript
const messages: ChatMessage[] = [
  {
    role: 'system',
    content: systemPrompt + toolHint + learningsHint + lastTaskHint,
  },
  ...history.map(msg => ({ role: msg.role, content: msg.content })),
  { role: 'user', content: messageText },
];
```

The system prompt is built in handler.ts BEFORE sending to DO. The DO receives the full messages array and uses it as-is for API calls. Phase-aware prompts could be injected either:
- **Option A**: In handler.ts before dispatching (simpler, but no phase transitions mid-task)
- **Option B**: In task-processor.ts during the loop (allows dynamic phase transitions) ← **recommended**

---

### Implementation Plan

#### 1. Add phase to TaskState (`task-processor.ts`)

```typescript
// Add to TaskState interface:
phase?: 'plan' | 'work' | 'review';
phaseStartIteration?: number;
```

#### 2. Phase-aware system prompt injection

At the START of `processTask()`, inject a planning prompt. The model's first response should be a brief plan (what tools to use, what strategy). Then switch to 'work' phase.

**Plan phase prompt** (injected as user message after system prompt):
```
Before starting, briefly outline your approach (2-3 bullet points): what tools you'll use and in what order. Then proceed immediately with execution.
```

**Review phase prompt** (injected when model stops calling tools):
```
Before delivering your final answer, briefly verify: (1) Did you answer the complete question? (2) Are all data points current and accurate? (3) Is anything missing?
```

#### 3. Phase transitions in the processing loop

- **Plan → Work**: After first model response (whether it contains a plan or just starts working)
- **Work → Review**: When model stops calling tools (`choice.message.tool_calls` is empty/undefined) AND `task.toolsUsed.length > 0`
- **Skip phases for simple tasks**: If no tools are used, don't inject review prompt

Key location: The phase transition logic goes in the main `while` loop at **line 596**. Before the API call, check current phase and potentially inject phase-specific user messages.

#### 4. Progress updates show phase

Current progress update (line 613-618):
```
⏳ Processing... (5 iter, 3 tools, 12s)
```

Updated format:
```
⏳ Planning... (1 iter, 0 tools, 3s)
⏳ Working... (5 iter, 3 tools, 12s)
⏳ Reviewing... (8 iter, 5 tools, 25s)
```

#### 5. Testing

Add tests in `src/durable-objects/task-processor.test.ts` (or create if not exists). Test:
- Phase transitions: plan → work → review
- Simple task skips plan/review (no tools)
- Phase shown in progress updates
- Phase persists across checkpoint/resume

---

### Files to Modify

| File | What to change |
|------|---------------|
| `src/durable-objects/task-processor.ts` | Add `phase` to TaskState, inject phase prompts in processing loop, update progress messages |
| `src/telegram/handler.ts` | Minimal — phase lives in DO, not handler. Maybe surface phase in resume messages |
| `src/durable-objects/task-processor.test.ts` | New or existing — add phase transition tests |

### Pre-existing TypeScript Errors (NOT from your changes)

- `request.prompt` doesn't exist on `TaskRequest` — used in `saveCheckpoint` calls at lines 966, 1014, 1122. This is pre-existing.
- `parse_mode` vs `parseMode` mismatch in handler.ts `sendMessage` calls. Pre-existing.
- Do NOT try to fix these unless explicitly asked.

### Success Criteria

- [ ] TaskState tracks current phase (`plan` / `work` / `review`)
- [ ] Plan phase: model receives planning prompt on first iteration
- [ ] Work phase: normal tool-calling loop (existing behavior)
- [ ] Review phase: model receives review prompt when tools stop
- [ ] Simple tasks (no tools) skip plan/review gracefully
- [ ] Progress updates show current phase name
- [ ] Phase persists in checkpoints (survives auto-resume)
- [ ] Tests added for phase transitions
- [ ] `npm test` passes (448+ tests)
- [ ] `npm run typecheck` passes (pre-existing errors OK)

### Commands

```bash
npm install          # Required before tests (vitest not in PATH without it)
npm test             # Run all tests (vitest)
npm run typecheck    # TypeScript check
```

### Testing Pattern

Tests use vitest with `vi.stubGlobal('fetch', ...)` for mocking external APIs. Example:

```typescript
vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({ choices: [{ message: { content: 'test', tool_calls: undefined }, finish_reason: 'stop' }] }),
}));
```

---

## Post-Merge Reminders (for human)

- Hit `/telegram/setup` endpoint once to register new bot menu commands (**done 2026-02-11**)
- Upload `claude-share/R2/skills/storia-orchestrator/prompt.md` to R2 bucket

---

## Queue After This Task

| Priority | Task | Effort | Notes |
|----------|------|--------|-------|
| Current | 3.2: Structured task phases | High | Plan -> Work -> Review |
| Next | 3.3: /learnings Telegram command | Medium | View past patterns and success rates |
| Then | 2.3: Acontext integration | Medium | API key now configured, unblocked |
| Then | 2.5.9: Holiday awareness (Nager.Date) | Low | Adjust briefing tone on holidays |
| Then | 4.1: Replace compressContext with token-budgeted retrieval | Medium | Depends on 2.3 |

---

## Recently Completed

| Date | Task | AI | Session |
|------|------|----|---------|
| 2026-02-11 | UX fixes: /start redesign, bot menu, briefing location, news links, crypto fix, Acontext key | Claude Opus 4.6 | 018gmCDcuBJqs9ffrrDHHBBd |
| 2026-02-10 | Fix auto-resume counter + revert GLM free tool flag | Claude Opus 4.6 | 018gmCDcuBJqs9ffrrDHHBBd |
| 2026-02-10 | 6 bot improvements: GLM tools, 402 handling, cross-task ctx, time cap, tool-intent, parallel prompt | Claude Opus 4.6 | 018gmCDcuBJqs9ffrrDHHBBd |
| 2026-02-10 | Phase 3.1+3.4: Compound learning loop + prompt injection | Claude Opus 4.6 | 018gmCDcuBJqs9ffrrDHHBBd |
| 2026-02-09 | Phase 1.5: Structured output support (json: prefix) | Claude Opus 4.6 | 013wvC2kun5Mbr3J81KUPn99 |
| 2026-02-09 | Phase 1.4: Vision + tools unified + /help update | Claude Opus 4.6 | 013wvC2kun5Mbr3J81KUPn99 |
| 2026-02-08 | Phase 2.5.6+2.5.8: Crypto + Geolocation tools | Claude Opus 4.6 | 013wvC2kun5Mbr3J81KUPn99 |
