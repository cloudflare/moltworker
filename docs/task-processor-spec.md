# TaskProcessor Durable Object — Specification & Troubleshooting Log

**Last Updated:** 2026-02-17

This document captures the current specification of the TaskProcessor Durable Object, the recent troubleshooting process, and known issues. It is intended for review by AI assistants or developers to identify potential improvements.

---

## 1. Architecture Overview

```
User (Telegram) → Worker (Hono) → Durable Object (TaskProcessor)
                                        ↓
                              AI Provider APIs
                     ┌──────────┼──────────┐
                  OpenRouter  Moonshot  DashScope  DeepSeek
                  (streaming)  (fetch)   (fetch)    (fetch)
                                        ↓
                              Tool Execution
                     ┌────┬────┬─────┬──────┬────────┐
                  fetch  github  github  github  github
                  _url   _read   _list   _api    _create
                         _file   _files          _pr
                                        ↓
                              R2 Checkpoints
                              Telegram Updates
```

The TaskProcessor is a Cloudflare Durable Object that handles long-running AI tasks that exceed the 10-second Worker timeout. It maintains persistent state, manages tool-calling loops, and sends progress/results back via Telegram.

---

## 2. Key Constants

| Constant | Value | Purpose |
|----------|-------|---------|
| `MAX_TOOL_RESULT_LENGTH` | 8,000 chars | Truncation limit per tool result in conversation |
| `COMPRESS_AFTER_TOOLS` | 6 | Compress context every N tool calls |
| `MAX_CONTEXT_TOKENS` | 60,000 | Force compression threshold (estimated) |
| `WATCHDOG_INTERVAL_MS` | 90s | Alarm fires every 90s to check for stuck tasks |
| `STUCK_THRESHOLD_MS` | 60s | Time without update before task is considered stuck |
| `CHECKPOINT_EVERY_N_TOOLS` | 3 | Save R2 checkpoint every N tool calls |
| `MAX_AUTO_RESUMES_DEFAULT` | 10 | Max auto-resumes for paid models |
| `MAX_AUTO_RESUMES_FREE` | 15 | Max auto-resumes for free models |
| `MAX_ELAPSED_FREE_MS` | 15 min | Time cap for free models |
| `MAX_ELAPSED_PAID_MS` | 30 min | Time cap for paid models |
| `MAX_NO_PROGRESS_RESUMES` | 3 | Max consecutive resumes with 0 new tool calls |
| `MAX_STALL_ITERATIONS` | 5 | Max consecutive iterations with no tool calls |
| `MAX_SAME_TOOL_REPEATS` | 3 | Max identical tool calls before loop nudge |
| `maxIterations` | 100 | Max iterations per DO invocation |

---

## 3. Task Lifecycle

### 3.1 Phases

Each task goes through three phases:

1. **Plan** — Model outlines approach (injected prompt: "outline your approach in 2-3 bullet points")
2. **Work** — Model executes tools iteratively
3. **Review** — Model verifies its own work before delivering final answer

Phase transitions:
- `plan → work`: After first model response (iteration 1)
- `work → review`: When model produces final text content after using tools
- Orchestra tasks get a stricter review prompt (verify PR URL, check ROADMAP.md updates)

### 3.2 Main Loop

```
while (iterations < 100):
  1. Check cancellation
  2. Select provider + API key based on modelAlias
  3. Call AI API (with retry loop, max 3 attempts)
  4. If API fails → try model rotation (free models only)
  5. If response has tool_calls → execute tools in parallel → loop
  6. If response has no tool_calls:
     a. Check stall counter
     b. If in 'work' phase → transition to 'review', loop once more
     c. Otherwise → deliver final response
```

### 3.3 Checkpoints & Resume

- Checkpoints saved to R2 every 3 tool calls (`CHECKPOINT_EVERY_N_TOOLS`)
- On watchdog-triggered auto-resume: loads latest checkpoint, injects resume instruction
- Resume instruction tells model: "Do NOT re-read rules. Continue where you left off."
- Iteration counter resets to 0 on resume (fresh budget of 100 iterations)

---

## 4. Failure Detection & Recovery

### 4.1 Watchdog Alarm

The watchdog fires every 90 seconds:
1. If `timeSinceUpdate < 60s` → task is still active, reschedule
2. If `timeSinceUpdate >= 60s` → task appears stuck
3. Check elapsed time cap (15min free / 30min paid)
4. Check auto-resume limit (10 paid / 15 free)
5. Check stall detection (no-progress resumes)
6. If all checks pass → auto-resume from checkpoint

### 4.2 Stall Detection (3 layers)

| Layer | What it detects | Threshold | Action |
|-------|----------------|-----------|--------|
| **No-tool stall** | Model generates text without calling any tools | 5 consecutive iterations (10 if tools were used earlier) | Force complete with whatever content exists |
| **Same-tool loop** | Model calls the exact same tool with identical arguments | 3 identical calls | Inject nudge: "Try a DIFFERENT tool or approach" |
| **No-progress resumes** | Auto-resume fires but model made zero new tool calls | 3 consecutive resumes | Fail with "Task stalled" message |

### 4.3 API Error Handling

| Error | Retry? | Rotation? | Notes |
|-------|--------|-----------|-------|
| 429 Rate limit | Yes (3x, 2s delay) | Yes | Standard rate limiting |
| 503 Overloaded | Yes (3x, 2s delay) | Yes | Server overloaded |
| 402 Quota exceeded | **No** (fast-fail) | Yes | Payment required |
| 404 Model gone | Yes (3x) | Yes | Model removed/renamed |
| 400 Content filter | **No** (fast-fail) | Yes | DashScope `data_inspection_failed` |
| Timeout (2 min) | No | No | AbortController kills connection |
| Other errors | Yes (3x) | **No** | Throws to outer handler |

### 4.4 Model Rotation

When a free model fails, the system rotates through alternatives:
1. **Preferred models** — match task category (coding/reasoning/general)
2. **Fallback models** — other free tool-capable models
3. **Emergency core** — hardcoded reliable models (`qwencoderfree`, `gptoss`, `devstral`)

Rotation is also triggered for:
- Empty responses (model can't handle context size)
- Content filter rejections (different providers = different filters)

---

## 5. Tool Specifications

### 5.1 Available Tools (in Durable Object)

| Tool | Purpose | Truncation |
|------|---------|------------|
| `fetch_url` | Fetch URL content (HTML stripped) | 20KB at tool level, 8KB in conversation |
| `github_read_file` | Read file from GitHub repo | 50KB at tool level, 8KB in conversation |
| `github_list_files` | List directory contents | No tool-level truncation, 8KB in conversation |
| `github_api` | Generic GitHub API calls | 50KB at tool level, 8KB in conversation |
| `github_create_pr` | Create PR with file changes | No tool-level truncation |
| `url_metadata` | Get URL title/description | Small responses |

**Not available in DO** (require browser/sandbox bindings):
- `browse_url` — Browser Rendering API
- `sandbox_exec` — Sandbox container execution

### 5.2 Tool Result Truncation (2-tier)

```
Tool execution → Tool-level truncation (20-50KB) → task-processor truncation (8KB)
                     ↑ tools.ts                         ↑ task-processor.ts
```

The task-processor truncation uses head+tail strategy: keeps first ~3.9KB and last ~3.9KB with a `[TRUNCATED X chars]` marker in between.

### 5.3 fetch_url HTML Stripping

When `contentType` includes `text/html` or content starts with `<!`/`<html`:
1. Remove `<script>` and `<style>` blocks entirely
2. Replace block elements (`</p>`, `</div>`, `<br>`, etc.) with newlines
3. Strip all remaining HTML tags
4. Decode HTML entities (`&amp;`, `&lt;`, `&gt;`, `&quot;`, `&#39;`, `&nbsp;`)
5. Collapse whitespace, limit consecutive newlines to 2
6. If no text remains: return `[HTML page returned no readable text content]`

---

## 6. Provider-Specific Handling

### 6.1 OpenRouter (Streaming)

- Uses SSE streaming via `chatCompletionStreamingWithTools()`
- 45s idle timeout (no data for 45s = timeout)
- Progress callback updates watchdog every 50 chunks
- Handles `reasoning_content` in streamed responses

### 6.2 Direct API Providers (Moonshot, DashScope, DeepSeek)

- Standard `fetch()` with non-streaming JSON response
- **2-minute AbortController timeout** — kills connection after 120s
- Heartbeat every 10s — updates `lastUpdate` to keep watchdog happy
- 30s timeout on `response.text()` — separate from connection timeout
- `reasoning_content` preserved in assistant messages for Moonshot

### 6.3 Provider-Specific Issues

| Provider | Known Issue | Mitigation |
|----------|------------|------------|
| **Moonshot (Kimi)** | `reasoning_content` in responses causes 400 if sent back | Strip before re-sending, preserve in assistant messages |
| **Moonshot** | Fixed temperature requirement for some models | `getTemperature()` returns `undefined` to use model default |
| **Moonshot** | TPD (Tokens Per Day) rate limit | Model rotation to fallback |
| **DashScope (Qwen)** | Content filter rejects "inappropriate content" | Fast-fail (no retry), model rotation |
| **DashScope** | Region-locked API keys | Use Singapore endpoint (`dashscope-intl.aliyuncs.com`) |
| **DeepSeek** | Prefix caching metrics in usage | Tracked in `cacheHitTokens`/`cacheMissTokens` |

---

## 7. Context Management

### 7.1 Compression

Triggered every 6 tool calls or when estimated tokens exceed 60,000:
1. Keep: system message (first), user message (second), last 6 messages
2. Summarize middle messages into a single assistant message
3. Summary includes: tool names called, file paths mentioned, response previews
4. Maintains valid tool_call/result pairing (no orphaned tool messages)

### 7.2 Orphan Handling

Direct API providers (DeepSeek, Moonshot) reject orphaned tool messages. The compression ensures `recentMessages` don't start with tool messages without a preceding assistant+tool_calls message.

---

## 8. Troubleshooting Log

### 8.1 Session: 2026-02-17 — Moonshot/Kimi Hang & Loop

**Problem**: Orchestra task with `/kimidirect` model hung repeatedly and went in circles.

**Root Cause Analysis (chronological)**:

#### Issue A: `reasoning_content` causing 400 errors
- **Symptom**: Moonshot API returning 400 on second iteration
- **Cause**: Kimi K2.5 returns `reasoning_content` in responses. When this field was sent back in the conversation, Moonshot rejected it.
- **Fix** (commit `a6cd181`): Strip `reasoning_content` before re-sending, but preserve it in the assistant message for context.

#### Issue B: Moonshot hanging for 170+ seconds
- **Symptom**: Heartbeat logs showing 17+ heartbeats (170s), then watchdog auto-resume
- **Cause**: Moonshot API sometimes hangs without responding. The old code had no connection timeout — only the watchdog (90s) could catch it.
- **Fix** (commit `f30205c`): Added 2-minute `AbortController` timeout on the `fetch()` call. If the connection hangs for 120s, it's aborted with a clear error message.

#### Issue C: Model going in circles (same tool, same args)
- **Symptom**: 35+ tool calls across 3 resumes, repeatedly calling `fetch_url` (46 chars), `github_api` (58KB), `github_read_file` (41KB) with identical arguments
- **Cause**: No detection for a model calling the same tool with the same arguments repeatedly. The stall detector only caught "no tool calls at all."
- **Fix** (commit `a505379`): Track last 20 tool call signatures (`name:args`). When any signature appears 3+ times, inject a nudge telling the model to try a different approach. Clears tracking after nudge.
- **Result**: In the Qwen3 test, the nudge fired at iteration 14 and the model immediately pivoted to creating a PR.

#### Issue D: `fetch_url` returning 46 chars
- **Symptom**: `fetch_url` consistently returning 46-char responses
- **Cause**: The function fetched `contentType` but never used it. HTML pages came back as raw HTML, which the model couldn't parse. The 46 chars was likely a minimal HTML stub or redirect page.
- **Fix** (commit `a505379`): Implemented HTML stripping using `contentType` detection. Removes scripts, styles, tags, decodes entities.

#### Issue E: `github_api` returning 58KB untruncated
- **Symptom**: Every `github_api` call returned 58KB, truncated to 8KB by task-processor with confusing head+tail splicing
- **Cause**: No truncation at the tool level — full pretty-printed JSON passed through
- **Fix** (commit `a505379`): Added 50KB truncation at tool level

### 8.2 Session: 2026-02-17 — Qwen3 Coder DashScope Content Filter

**Problem**: After loop detection nudge worked and PR was created, the model continued reading files and fetching URLs, eventually triggering DashScope's content filter.

#### Issue F: DashScope 400 "inappropriate content" retried 3 times
- **Symptom**: 400 error retried 3x, each attempt taking 60-90s before responding
- **Cause**: Content filter errors are deterministic — retrying won't help. The retry loop wasted ~180s.
- **Fix** (commit `85b7224`): Fast-fail on 400 with `data_inspection_failed`/`inappropriate_content` (like 402). Trigger model rotation since different providers have different content filters.

#### Issue G: fetch_url returning 50KB filling context
- **Symptom**: Stripped HTML was 50KB, overwhelming context and triggering content filters
- **Cause**: Tool-level truncation was 50KB — too generous for fetched web content
- **Fix** (commit `85b7224`): Reduced fetch_url truncation from 50KB to 20KB

#### Issue H: Negative tool count in stall tracking
- **Symptom**: Log showed "-2 new tools since last resume"
- **Cause**: When resuming from checkpoint, `toolCountAtLastResume` preserved the pre-resume value (e.g., 20) but checkpoint only had 18 tools. `18 - 20 = -2`.
- **Fix** (commit `85b7224`): Sync `toolCountAtLastResume` to checkpoint's `toolsUsed.length` on resume.

---

## 9. Known Remaining Issues & Potential Improvements

### 9.1 Open Issues

1. **Watchdog preempts AbortController**: The 90s watchdog alarm fires before the 120s AbortController timeout. When the API hangs, the watchdog kills the task and auto-resumes from checkpoint, but the old `fetch()` is still running (orphaned). The AbortController would have killed it cleanly at 120s. Consider: either reduce AbortController timeout to 60s (before watchdog), or make the watchdog aware of in-progress API calls.

2. **Checkpoint doesn't cancel orphaned processTask**: When watchdog auto-resumes, it calls `processTask()` via `waitUntil()`. But the old `processTask()` invocation may still be running (stuck in a `fetch()` call). This can lead to two concurrent `processTask()` invocations. The old one eventually times out and writes stale state.

3. **No deduplication of tool results after compression**: After context compression, the model loses track of what it already read and may re-read the same files. The compressed summary mentions tool names and file paths but not the actual content.

4. **fetch_url redirect handling**: If a URL returns a 3xx redirect, the Worker's `fetch()` follows it automatically. But if the redirect is to a different domain, the response might be unexpected. No redirect detection or logging.

5. **Tool-level truncation inconsistency**: `github_read_file` truncates at 50KB, `fetch_url` at 20KB, `github_api` at 50KB, but `github_list_files` and `github_create_pr` have no tool-level truncation. The task-processor's 8KB truncation catches everything, but the inconsistency means some tools waste bandwidth.

6. **Content filter rotation may not help**: If the offending content is in the conversation context (from a previous tool result), rotating to a new model sends the same context. The content filter will trigger again. A more robust fix would be to detect which tool result caused the filter and remove/summarize it before retrying.

7. **Same-tool loop detection doesn't consider similar (not identical) args**: If the model calls `fetch_url` with slightly different URLs that all fail, the loop detector won't catch it because the arguments differ. Consider a `tool_name:result_hash` approach.

8. **Long API responses from Qwen3 Coder**: DashScope calls for `github_create_pr` took 73-304 seconds (generating 7000-10000 tokens). The 2-minute AbortController timeout could kill legitimate long generations. The timeout may need to be dynamic based on model/provider.

### 9.2 Potential Improvements

1. **Result-aware loop detection**: Instead of matching `tool_name:args`, hash the tool result. If the same tool returns the same result 3 times (regardless of args), inject nudge.

2. **Content filter recovery**: On content filter 400, instead of rotating, try removing the last N tool results from context and retrying with the same model.

3. **Progressive timeout**: Start with 60s timeout, extend to 120s if the model is actively generating (has produced partial output). This protects against hangs while allowing long generations.

4. **Checkpoint-aware watchdog**: Store "current API call start time" in DO state. The watchdog can then distinguish between "API call in progress for 90s" (extend timeout) vs "processTask crashed" (auto-resume).

5. **Tool call budget**: Instead of 100 iterations, track total tool calls. A task that makes 3 tool calls per iteration burns through budget 3x faster than one that makes 1. Consider a total tool call limit (e.g., 200).

6. **Smart context injection after compression**: When compression summarizes tool results, include key data points (PR URLs, file contents hash, created resources) so the model doesn't need to re-fetch.

---

## 10. Commit History (Recent Fixes)

| Commit | Type | Description |
|--------|------|-------------|
| `85b7224` | fix | Fast-fail content filter 400, fix stall tracking, cap fetch_url 50→20KB |
| `a505379` | fix | Same-tool loop detection, fetch_url HTML stripping, github_api truncation |
| `f30205c` | fix | AbortController 2-min timeout for direct API fetch |
| `a6cd181` | fix | Preserve reasoning_content in Moonshot tool-calling loop |
| `e9550ee` | fix | Align with Cloudflare Workers best practices |
| `ed67f4d` | fix | Respect Kimi K2.5 fixed temperature requirement |
| `f953258` | feat | Anti-destructive guardrails for orchestra bot PRs |
| `a17051f` | fix | Use Singapore regional endpoint for DashScope API |
